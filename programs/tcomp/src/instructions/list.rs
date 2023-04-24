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
    pub tcomp_program: Program<'info, crate::program::Tcomp>,
    #[account(init, payer = payer,
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
    // 1. proof accounts (less canopy)
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
    nonce: u64,
    index: u32,
    root: [u8; 32],
    data_hash: [u8; 32],
    creator_hash: [u8; 32],
    amount: u64,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
) -> Result<()> {
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
        proof_accounts: &ctx.remaining_accounts,
        signer: None,
    })?;

    let asset_id = get_asset_id(&ctx.accounts.merkle_tree.key(), nonce);

    let list_state = &mut ctx.accounts.list_state;
    list_state.version = CURRENT_TCOMP_VERSION;
    list_state.bump = [unwrap_bump!(ctx, "list_state")];
    list_state.asset_id = asset_id;
    list_state.owner = ctx.accounts.owner.key();
    list_state.amount = amount;
    list_state.currency = currency;
    list_state.private_taker = private_taker;
    let expiry = match expire_in_sec {
        Some(expire_in_sec) => {
            let expire_in_i64 = i64::try_from(expire_in_sec).unwrap();
            require!(expire_in_i64 < MAX_EXPIRY_SEC, TcompError::ExpiryTooLarge);
            Clock::get()?.unix_timestamp + expire_in_i64
        }
        None => Clock::get()?.unix_timestamp + MAX_EXPIRY_SEC,
    };
    list_state.expiry = expiry;

    record_event(
        &TcompEvent::Maker(MakeEvent {
            maker: *ctx.accounts.owner.key,
            asset_id,
            amount,
            currency,
            expiry,
            private_taker,
        }),
        &ctx.accounts.tcomp_program,
    )?;

    Ok(())
}
