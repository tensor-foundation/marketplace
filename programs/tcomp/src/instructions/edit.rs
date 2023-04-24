use crate::*;

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct Edit<'info> {
    pub owner: Signer<'info>,
    /// CHECK: only used for pda derivation
    pub merkle_tree: UncheckedAccount<'info>,
    /// CHECK: this ensures that specific asset_id belongs to specific owner
    #[account(mut,
        seeds=[
            b"list_state".as_ref(),
            get_asset_id(&merkle_tree.key(), nonce).as_ref()
        ],
        bump = list_state.bump[0],
        has_one = owner
    )]
    pub list_state: Box<Account<'info, ListState>>,
    pub log_wrapper: Program<'info, Noop>,
}

impl<'info> Validate<'info> for Edit<'info> {
    fn validate(&self) -> Result<()> {
        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, Edit<'info>>,
    nonce: u64,
    amount: u64,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
) -> Result<()> {
    let list_state = &mut ctx.accounts.list_state;
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

    let asset_id = get_asset_id(&ctx.accounts.merkle_tree.key(), nonce);

    // record_event(
    //     &TcompEvent::Maker(MakeEvent {
    //         maker: *ctx.accounts.owner.key,
    //         asset_id,
    //         amount,
    //         currency,
    //         expiry,
    //         private_taker,
    //     }),
    //     &ctx.accounts.log_wrapper,
    // )?;

    Ok(())
}
