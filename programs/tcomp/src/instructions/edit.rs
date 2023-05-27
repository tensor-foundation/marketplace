use crate::*;

#[derive(Accounts)]
pub struct Edit<'info> {
    /// CHECK: this ensures that specific asset_id belongs to specific owner
    #[account(mut,
        seeds=[
            b"list_state".as_ref(),
            list_state.asset_id.as_ref()
        ],
        bump = list_state.bump[0],
        has_one = owner
    )]
    pub list_state: Box<Account<'info, ListState>>,
    pub owner: Signer<'info>,
    pub tcomp_program: Program<'info, crate::program::Tcomp>,
}

pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, Edit<'info>>,
    amount: u64,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
) -> Result<()> {
    // TODO: temp while we enable them
    require!(currency.is_none(), TcompError::CurrencyNotYetEnabled);
    require!(maker_broker.is_none(), TcompError::MakerBrokerNotYetEnabled);

    let list_state = &mut ctx.accounts.list_state;
    list_state.amount = amount;
    list_state.currency = currency;
    list_state.private_taker = private_taker;
    list_state.maker_broker = maker_broker;

    // Grab current expiry in case they're editing a bid
    let current_expiry = list_state.expiry;
    // Figure out new expiry
    let expiry = match expire_in_sec {
        Some(expire_in_sec) => {
            let expire_in_i64 = i64::try_from(expire_in_sec).unwrap();
            require!(expire_in_i64 <= MAX_EXPIRY_SEC, TcompError::ExpiryTooLarge);
            Clock::get()?.unix_timestamp + expire_in_i64
        }
        None => current_expiry,
    };
    list_state.expiry = expiry;

    record_event(
        &TcompEvent::Maker(MakeEvent {
            maker: *ctx.accounts.owner.key,
            bid_id: None,
            target: Target::AssetId,
            target_id: list_state.asset_id,
            field: None,
            field_id: None,
            amount,
            quantity: 1,
            currency,
            expiry,
            private_taker,
            asset_id: Some(list_state.asset_id),
        }),
        &ctx.accounts.tcomp_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    Ok(())
}
