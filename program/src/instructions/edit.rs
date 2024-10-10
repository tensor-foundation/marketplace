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
    pub marketplace_program: Program<'info, crate::program::MarketplaceProgram>,
}

pub fn process_edit<'info>(
    ctx: Context<'_, '_, '_, 'info, Edit<'info>>,
    amount: u64,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
) -> Result<()> {
    let list_state = &mut ctx.accounts.list_state;
    list_state.amount = amount;
    list_state.currency = currency;
    list_state.private_taker = private_taker;
    list_state.maker_broker = maker_broker;

    // Grab current expiry in case they're editing a bid
    let current_expiry = list_state.expiry;
    // Figure out new expiry
    let expiry = assert_expiry(expire_in_sec, Some(current_expiry))?;
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
        &ctx.accounts.marketplace_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    Ok(())
}
