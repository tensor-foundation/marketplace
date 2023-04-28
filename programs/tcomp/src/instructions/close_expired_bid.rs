use crate::*;

#[derive(Accounts)]
#[instruction(bid_id: Pubkey)]
pub struct CloseExpiredBid<'info> {
    #[account(
        mut,
        seeds=[b"bid_state".as_ref(), owner.key().as_ref(), bid_id.as_ref()],
        bump = bid_state.bump[0],
        close = owner,
        has_one = owner,
        has_one = bid_id,
    )]
    pub bid_state: Box<Account<'info, BidState>>,
    /// CHECK: stored on bid_state
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    #[account(
        seeds = [],
        bump = tswap.bump[0],
        seeds::program = tensorswap::id(),
        has_one = cosigner,
    )]
    pub tswap: Box<Account<'info, TSwap>>,
    /// CHECK: on tswap
    pub cosigner: Signer<'info>,
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
