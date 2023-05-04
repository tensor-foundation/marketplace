use crate::*;

// TODO: write a similar ix for closing expired listings
#[derive(Accounts)]
pub struct CloseExpiredBid<'info> {
    #[account(
        mut,
        seeds=[b"bid_state".as_ref(), owner.key().as_ref(), bid_state.bid_id.as_ref()],
        bump = bid_state.bump[0],
        close = owner,
        has_one = owner,
    )]
    pub bid_state: Box<Account<'info, BidState>>,
    /// CHECK: stored on bid_state. In this case doesn't have to sign since the bid expired.
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CloseExpiredBid>) -> Result<()> {
    let bid_state = &ctx.accounts.bid_state;
    require!(
        bid_state.expiry < Clock::get()?.unix_timestamp,
        TcompError::OfferNotYetExpired
    );
    Ok(())
}
