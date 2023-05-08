use crate::*;

#[derive(Accounts)]
pub struct CloseExpiredListing<'info> {
    #[account(
        mut,
        seeds=[b"list_state".as_ref(), list_state.asset_id.as_ref()],
        bump = list_state.bump[0],
        close = owner,
        has_one = owner,
    )]
    pub list_state: Box<Account<'info, ListState>>,
    /// CHECK: stored on list_state. In this case doesn't have to sign since the listing expired.
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CloseExpiredListing>) -> Result<()> {
    let list_state = &ctx.accounts.list_state;
    require!(
        list_state.expiry < Clock::get()?.unix_timestamp,
        TcompError::ListingNotYetExpired
    );
    Ok(())
}