use tensor_toolbox::transfer_lamports_from_pda;

use crate::*;

#[derive(Accounts)]
pub struct CloseExpiredBid<'info> {
    #[account(
        mut,
        seeds=[b"bid_state".as_ref(), owner.key().as_ref(), bid_state.bid_id.as_ref()],
        bump = bid_state.bump[0],
        close = rent_dest,
        has_one = owner,
    )]
    pub bid_state: Box<Account<'info, BidState>>,
    /// CHECK: stored on bid_state. In this case doesn't have to sign since the bid expired.
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub tcomp_program: Program<'info, crate::program::MarketplaceProgram>,
    /// CHECK: bid_state.get_rent_payer()
    #[account(mut,
        constraint = rent_dest.key() == bid_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_dest: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<CloseExpiredBid>) -> Result<()> {
    let bid_state = &ctx.accounts.bid_state;
    require!(
        bid_state.expiry < Clock::get()?.unix_timestamp,
        TcompError::BidNotYetExpired
    );

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

    // return any balance to the owner
    transfer_lamports_from_pda(
        ctx.accounts.bid_state.deref().as_ref(),
        ctx.accounts.owner.as_ref(),
        BidState::bid_balance(&ctx.accounts.bid_state)?,
    )?;
    BidState::verify_empty_balance(&ctx.accounts.bid_state)?;
    // rent can be returned to the rent payer

    Ok(())
}