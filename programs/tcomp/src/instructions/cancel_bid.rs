use crate::*;

#[derive(Accounts)]
pub struct CancelBid<'info> {
    #[account(mut,
        seeds=[b"bid_state".as_ref(), owner.key().as_ref(), bid_state.bid_id.as_ref()],
        bump = bid_state.bump[0],
        close = owner,
        has_one = owner,
    )]
    pub bid_state: Box<Account<'info, BidState>>,
    /// CHECK: stored on bid_state
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub tcomp_program: Program<'info, crate::program::Tcomp>,
}

pub fn handler(ctx: Context<CancelBid>) -> Result<()> {
    let bid_state = &ctx.accounts.bid_state;
    record_event(
        &TcompEvent::Maker(MakeEvent {
            maker: *ctx.accounts.owner.key,
            bid_id: Some(bid_state.bid_id),
            target: bid_state.target.clone(),
            target_id: bid_state.target_id,
            field: bid_state.field.clone(),
            field_id: bid_state.field_id,
            amount: bid_state.amount,
            quantity: bid_state.quantity,
            currency: bid_state.currency,
            expiry: bid_state.expiry,
            private_taker: bid_state.private_taker,
            asset_id: if bid_state.target == Target::AssetId {
                Some(bid_state.target_id)
            } else {
                None
            },
        }),
        &ctx.accounts.tcomp_program,
        TcompSigner::Bid(&ctx.accounts.bid_state),
    )?;

    Ok(())
}
