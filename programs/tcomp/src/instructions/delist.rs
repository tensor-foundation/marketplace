use crate::*;

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct Delist<'info> {
    /// CHECK: downstream
    pub tree_authority: UncheckedAccount<'info>,
    pub owner: Signer<'info>,
    /// CHECK: downstream
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub system_program: Program<'info, System>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    /// CHECK: this ensures that specific asset_id belongs to specific owner
    #[account(mut, close = owner,
        seeds=[
            b"list_state".as_ref(),
            get_asset_id(&merkle_tree.key(), nonce).as_ref()
        ],
        bump = list_state.bump[0],
        has_one = owner
    )]
    pub list_state: Box<Account<'info, ListState>>,
    // Remaining accounts:
    // 1. proof accounts (less canopy)
}

impl<'info> Validate<'info> for Delist<'info> {
    fn validate(&self) -> Result<()> {
        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, Delist<'info>>,
    nonce: u64,
    index: u32,
    root: [u8; 32],
    data_hash: [u8; 32],
    creator_hash: [u8; 32],
) -> Result<()> {
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
        proof_accounts: &ctx.remaining_accounts,
        signer_bid: None,
        signer_listing: Some(&ctx.accounts.list_state),
    })
}
