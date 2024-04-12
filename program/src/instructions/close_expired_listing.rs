use tensor_toolbox::{transfer_cnft, TransferArgs};

use crate::*;

#[derive(Accounts)]
pub struct CloseExpiredListing<'info> {
    #[account(
        mut,
        seeds=[b"list_state".as_ref(), list_state.asset_id.as_ref()],
        bump = list_state.bump[0],
        close = rent_dest,
        has_one = owner,
    )]
    pub list_state: Box<Account<'info, ListState>>,
    /// CHECK: stored on list_state. In this case doesn't have to sign since the listing expired.
    pub owner: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub tcomp_program: Program<'info, crate::program::MarketplaceProgram>,
    /// CHECK: downstream
    pub tree_authority: UncheckedAccount<'info>,
    /// CHECK: downstream
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    /// CHECK: list_state.get_rent_payer()
    #[account(mut,
        constraint = rent_dest.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_dest: UncheckedAccount<'info>,
}

pub fn process_close_expired_listing<'info>(
    ctx: Context<'_, '_, '_, 'info, CloseExpiredListing<'info>>,
    nonce: u64,
    index: u32,
    root: [u8; 32],
    data_hash: [u8; 32],
    creator_hash: [u8; 32],
) -> Result<()> {
    let list_state = &ctx.accounts.list_state;
    require!(
        list_state.expiry < Clock::get()?.unix_timestamp,
        TcompError::ListingNotYetExpired
    );

    transfer_cnft(TransferArgs {
        root,
        nonce,
        index,
        data_hash,
        creator_hash,
        tree_authority: &ctx.accounts.tree_authority.to_account_info(),
        leaf_owner: &ctx.accounts.list_state.to_account_info(),
        leaf_delegate: &ctx.accounts.list_state.to_account_info(),
        new_leaf_owner: &ctx.accounts.owner.to_account_info(),
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        log_wrapper: &ctx.accounts.log_wrapper.to_account_info(),
        compression_program: &ctx.accounts.compression_program.to_account_info(),
        system_program: &ctx.accounts.system_program.to_account_info(),
        bubblegum_program: &ctx.accounts.bubblegum_program.to_account_info(),
        proof_accounts: ctx.remaining_accounts,
        signer: Some(&ctx.accounts.list_state.to_account_info()),
        signer_seeds: Some(&ctx.accounts.list_state.seeds()),
    })?;

    record_event(
        &TcompEvent::Maker(MakeEvent {
            maker: *ctx.accounts.owner.key,
            bid_id: None,
            target: Target::AssetId,
            target_id: list_state.asset_id,
            field: None,
            field_id: None,
            amount: list_state.amount,
            quantity: 1, // <-- represents how many NFTs got delisted
            currency: list_state.currency,
            expiry: list_state.expiry,
            private_taker: list_state.private_taker,
            asset_id: Some(list_state.asset_id),
        }),
        &ctx.accounts.tcomp_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    Ok(())
}
