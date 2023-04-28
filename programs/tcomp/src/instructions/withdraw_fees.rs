use crate::*;

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct WithdrawFees<'info> {
    #[account(mut, seeds = [], bump = tswap.bump[0], has_one = cosigner, has_one = owner)]
    pub tswap: Box<Account<'info, TSwap>>,
    /// CHECK: seeds
    #[account(mut, seeds=[], bump)]
    pub tcomp: UncheckedAccount<'info>,
    // In theory we could store a different cosigner / owner on tcomp, but then we have to write init logic and handle more keypairs - CBA
    /// CHECK: initialized once on init, requires owner sign-off later
    /// We ask also for a signature just to make sure this wallet can actually sign things
    pub cosigner: Signer<'info>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: owner can decide to send anywhere
    #[account(mut)]
    pub destination: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<WithdrawFees>, amount: u64) -> Result<()> {
    transfer_lamports_from_pda(
        &ctx.accounts.tcomp.to_account_info(),
        &ctx.accounts.destination.to_account_info(),
        amount,
    )?;
    Ok(())
}
