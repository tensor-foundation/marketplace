use crate::*;

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct List<'info> {
    /// CHECK: downstream
    pub tree_authority: UncheckedAccount<'info>,
    /// CHECK: downstream (dont make Signer coz either this or delegate will sign)
    pub leaf_owner: UncheckedAccount<'info>,
    /// CHECK: downstream (dont make Signer coz either this or owner will sign)
    pub leaf_delegate: UncheckedAccount<'info>,
    /// CHECK: downstream
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub system_program: Program<'info, System>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    // init_if_ndeeded because ix can be used for both listing and editing
    #[account(init_if_needed, payer = payer,
        seeds=[
            b"list_state".as_ref(),
            get_asset_id(&merkle_tree.key(), nonce).as_ref()
        ],
        bump,
        space = LIST_STATE_SIZE,
    )]
    pub list_state: Box<Account<'info, ListState>>,
    #[account(mut)]
    pub payer: Signer<'info>,
    // Remaining accounts:
    // 1. creators (1-5)
    // 2. proof accounts (less canopy)
}

impl<'info> Validate<'info> for List<'info> {
    fn validate(&self) -> Result<()> {
        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, List<'info>>,
    // What is the difference between nonce and index?
    // Nonce is a higher level metaplex concept that is used to derive asset_id
    // Index i a lowerl level account-compression concept that is used to indicate leaf #
    // Most of the time they are the same, but it's possible that an NFT is decompressed and
    // then put into a new leaf with a different index, but preserves old nonce to preserve asset id
    // TODO: doesn't sounds like metaplex themselves know if this might happen, but the distinction stands
    nonce: u64,
    index: u32,
    root: [u8; 32],
    metadata: TMetadataArgs,
    amount: u64,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
) -> Result<()> {
    let (creator_accounts, proof_accounts) = ctx
        .remaining_accounts
        .split_at(metadata.creator_shares.len());

    // Verify in order to know if NFT already transferred = aka are we listing or editing
    let verif_result = verify_cnft(VerifyArgs {
        root,
        index,
        nonce,
        metadata: metadata.clone(),
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        leaf_owner: &ctx.accounts.leaf_owner.to_account_info(),
        leaf_delegate: &ctx.accounts.leaf_delegate.to_account_info(),
        compression_program: &ctx.accounts.compression_program.to_account_info(),
        creator_accounts,
        proof_accounts,
    });

    let asset_id_;

    // TODO: 0xrwu - do you see any security issues with this?
    match verif_result {
        Ok((asset_id, creator_hash, data_hash, _)) => {
            // This branch means we're listing for the first time
            transfer_cnft(TransferArgs {
                root,
                nonce,
                index,
                data_hash,
                creator_hash,
                tree_authority: &ctx.accounts.tree_authority.to_account_info(),
                leaf_owner: &ctx.accounts.leaf_owner.to_account_info(),
                leaf_delegate: &ctx.accounts.leaf_delegate.to_account_info(),
                new_leaf_owner: &ctx.accounts.list_state.to_account_info(),
                merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
                log_wrapper: &ctx.accounts.log_wrapper.to_account_info(),
                compression_program: &ctx.accounts.compression_program.to_account_info(),
                system_program: &ctx.accounts.system_program.to_account_info(),
                bubblegum_program: &ctx.accounts.bubblegum_program.to_account_info(),
                proof_accounts,
                signer_bid: None,
                signer_listing: None,
            })?;
            asset_id_ = asset_id;
        }
        Err(_) => {
            // This branch means we're editing
            let list_state = &ctx.accounts.list_state;

            // Make sure list state already exists
            require!(list_state.version != 0, TcompError::BadListState);

            // Make sure correct owner signs off
            require!(ctx.accounts.leaf_owner.is_signer, TcompError::BadOwner);
            require!(
                list_state.owner == *ctx.accounts.leaf_owner.key,
                TcompError::BadOwner
            );

            // Make sure nft owned by the program
            let (asset_id, _, _, _) = verify_cnft(VerifyArgs {
                root,
                index,
                nonce,
                metadata,
                merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
                leaf_owner: &ctx.accounts.list_state.to_account_info(), //<-- check with new owner
                leaf_delegate: &ctx.accounts.list_state.to_account_info(),
                compression_program: &ctx.accounts.compression_program.to_account_info(),
                creator_accounts,
                proof_accounts,
            })?;
            asset_id_ = asset_id;
        }
    }

    let list_state = &mut ctx.accounts.list_state;
    list_state.version = CURRENT_TCOMP_VERSION;
    list_state.bump = [unwrap_bump!(ctx, "list_state")];
    list_state.asset_id = asset_id_;
    list_state.owner = ctx.accounts.leaf_owner.key();
    list_state.amount = amount;
    list_state.currency = currency;
    list_state.private_taker = private_taker;

    // Grab current expiry in case they're editing a bid
    let current_expiry = list_state.expiry;
    // Figure out new expiry
    let expiry = match expire_in_sec {
        Some(expire_in_sec) => {
            let expire_in_i64 = i64::try_from(expire_in_sec).unwrap();
            require!(expire_in_i64 < MAX_EXPIRY_SEC, TcompError::ExpiryTooLarge);
            Clock::get()?.unix_timestamp + expire_in_i64
        }
        None if current_expiry == 0 => Clock::get()?.unix_timestamp + MAX_EXPIRY_SEC,
        None => current_expiry,
    };
    list_state.expiry = expiry;

    emit!(MakeEvent {
        maker: *ctx.accounts.leaf_owner.key,
        asset_id: asset_id_,
        amount,
        currency,
        expiry,
        private_taker
    });

    Ok(())
}
