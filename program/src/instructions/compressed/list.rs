use mpl_bubblegum::utils::get_asset_id;
use tensor_toolbox::{transfer_cnft, TransferArgs};

use crate::*;

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct List<'info> {
    /// CHECK: downstream
    pub tree_authority: UncheckedAccount<'info>,

    /// CHECK: downstream (dont make Signer coz either this or delegate will sign)
    pub owner: UncheckedAccount<'info>,

    /// CHECK: downstream (dont make Signer coz either this or owner will sign)
    pub delegate: UncheckedAccount<'info>,

    /// CHECK: downstream
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,

    pub log_wrapper: Program<'info, Noop>,

    pub compression_program: Program<'info, SplAccountCompression>,

    pub system_program: Program<'info, System>,

    pub bubblegum_program: Program<'info, Bubblegum>,

    pub marketplace_program: Program<'info, crate::program::MarketplaceProgram>,

    #[account(init,
        payer = rent_payer,
        seeds=[
            b"list_state".as_ref(),
            get_asset_id(&merkle_tree.key(), nonce).as_ref()
        ],
        bump,
        space = ListState::SIZE,
    )]
    pub list_state: Box<Account<'info, ListState>>,

    #[account(mut)]
    pub rent_payer: Signer<'info>,

    pub cosigner: Option<UncheckedAccount<'info>>,
    // Remaining accounts:
    // 1. proof accounts (less canopy)
}

pub fn process_list<'info>(
    ctx: Context<'_, '_, '_, 'info, List<'info>>,
    // What is the difference between nonce and index?
    // Nonce is a higher level metaplex concept that is used to derive asset_id
    // Index is a lower level account-compression concept that is used to indicate leaf #
    // Most of the time they are the same, but it's possible that an NFT is decompressed and
    // then put into a new leaf with a different index, but preserves old nonce to preserve asset id
    nonce: u64,
    index: u32,
    root: [u8; 32],
    data_hash: [u8; 32],
    creator_hash: [u8; 32],
    amount: u64,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
) -> Result<()> {
    let list_state = &ctx.accounts.list_state;

    // In case we have an extra remaining account.
    let mut v = Vec::with_capacity(ctx.remaining_accounts.len() + 1);

    // Validate the cosigner and fetch additional remaining account if it exists.
    // Cosigner could be a remaining account from an old client.
    let remaining_accounts =
        if let Some(remaining_account) = validate_cosigner(&ctx.accounts.cosigner, list_state)? {
            v.push(remaining_account);
            v.extend_from_slice(ctx.remaining_accounts);
            v.as_slice()
        } else {
            ctx.remaining_accounts
        };

    transfer_cnft(TransferArgs {
        root,
        nonce,
        index,
        data_hash,
        creator_hash,
        tree_authority: &ctx.accounts.tree_authority.to_account_info(),
        leaf_owner: &ctx.accounts.owner.to_account_info(),
        leaf_delegate: &ctx.accounts.delegate.to_account_info(),
        new_leaf_owner: &ctx.accounts.list_state.to_account_info(),
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        log_wrapper: &ctx.accounts.log_wrapper.to_account_info(),
        compression_program: &ctx.accounts.compression_program.to_account_info(),
        system_program: &ctx.accounts.system_program.to_account_info(),
        bubblegum_program: &ctx.accounts.bubblegum_program.to_account_info(),
        proof_accounts: remaining_accounts,
        signer: None,
        signer_seeds: None,
    })?;

    let asset_id = get_asset_id(&ctx.accounts.merkle_tree.key(), nonce);

    let list_state = &mut ctx.accounts.list_state;
    list_state.version = CURRENT_TCOMP_VERSION;
    list_state.bump = [ctx.bumps.list_state];
    list_state.asset_id = asset_id;
    list_state.owner = ctx.accounts.owner.key();
    list_state.amount = amount;
    list_state.currency = currency;
    list_state.private_taker = private_taker;
    list_state.maker_broker = maker_broker;

    let expiry = assert_expiry(expire_in_sec, None)?;
    list_state.expiry = expiry;
    list_state.rent_payer = ctx.accounts.rent_payer.key();

    // Only set the cosigner if it's a signer and not a remaining account.
    list_state.cosigner = ctx
        .accounts
        .cosigner
        .as_ref()
        .filter(|cosigner| cosigner.is_signer)
        .map(|cosigner| cosigner.key())
        .unwrap_or_default();

    // serializes the account data so the record event emits the correct data
    list_state.exit(ctx.program_id)?;

    record_event(
        &TcompEvent::Maker(MakeEvent {
            maker: *ctx.accounts.owner.key,
            bid_id: None,
            target: Target::AssetId,
            target_id: asset_id,
            field: None,
            field_id: None,
            amount,
            quantity: 1,
            currency,
            expiry,
            private_taker,
            asset_id: Some(asset_id),
        }),
        &ctx.accounts.marketplace_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    Ok(())
}
