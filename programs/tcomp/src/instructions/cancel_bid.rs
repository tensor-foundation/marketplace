use crate::*;

#[derive(Accounts)]
#[instruction(asset_id: Pubkey)]
pub struct CancelBid<'info> {
    #[account(
        mut,
        seeds=[b"bid_state".as_ref(), owner.key().as_ref(), asset_id.key().as_ref()],
        bump = bid_state.bump[0],
        close = owner,
        has_one = owner,
        has_one = asset_id,
    )]
    pub bid_state: Box<Account<'info, BidState>>,
    /// CHECK: stored on bid_state
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(_ctx: Context<CancelBid>) -> Result<()> {
    Ok(())
}
