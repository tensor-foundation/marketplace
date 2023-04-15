use crate::*;

#[derive(Accounts)]
pub struct Buy<'info> {
    /// CHECK: downstream
    pub tree_authority: UncheckedAccount<'info>,
    /// CHECK: downstream (dont make Signer coz either this or delegate)
    pub leaf_owner: UncheckedAccount<'info>,
    /// CHECK: downstream (dont make Signer coz either this or owner)
    pub leaf_delegate: UncheckedAccount<'info>,
    /// CHECK: downstream
    pub new_leaf_owner: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: downstream
    pub merkle_tree: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub system_program: Program<'info, System>,
    /// For us to CPI into
    pub bubblegum_program: Program<'info, Bubblegum>,
    // Remaining accounts:
    // 1. creators (1-5)
    // 2. proof accounts (less canopy)
}

impl<'info> Validate<'info> for Buy<'info> {
    fn validate(&self) -> Result<()> {
        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, Buy<'info>>,
    root: [u8; 32],
    nonce: u64,
    index: u32,
    metadata: MetadataArgs,
) -> Result<()> {
    // --------------------------------------- verify collection first

    let (creator_accounts, proof_accounts) = ctx
        .remaining_accounts
        .split_at(metadata.creator_shares.len());

    let (_asset_id, creator_hash, data_hash) = verify_cnft(VerifyArgs {
        root,
        nonce,
        index,
        metadata,
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        leaf_owner: &ctx.accounts.leaf_owner.to_account_info(),
        leaf_delegate: &ctx.accounts.leaf_delegate.to_account_info(),
        compression_program: &ctx.accounts.compression_program.to_account_info(),
        creator_accounts,
        proof_accounts,
    })?;

    msg!("asset id is {}", _asset_id);
    msg!(
        "asset id 2 is {}",
        get_asset_id(&ctx.accounts.merkle_tree.key(), nonce)
    );

    // --------------------------------------- TODO pay sol & royalties

    // --------------------------------------- transfer next

    transfer_cnft(TransferArgs {
        root,
        nonce,
        index,
        data_hash,
        creator_hash,
        tree_authority: &ctx.accounts.tree_authority.to_account_info(),
        leaf_owner: &ctx.accounts.leaf_owner.to_account_info(),
        leaf_delegate: &ctx.accounts.leaf_delegate.to_account_info(),
        new_leaf_owner: &ctx.accounts.new_leaf_owner.to_account_info(),
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        log_wrapper: &ctx.accounts.log_wrapper.to_account_info(),
        compression_program: &ctx.accounts.compression_program.to_account_info(),
        system_program: &ctx.accounts.system_program.to_account_info(),
        proof_accounts,
        bubblegum_program: &ctx.accounts.bubblegum_program.to_account_info(),
        signer_bid: None,
        signer_listing: None,
    })?;

    Ok(())
}
