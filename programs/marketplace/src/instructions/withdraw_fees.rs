use crate::*;
use anchor_lang::solana_program::system_instruction::transfer;

#[derive(Accounts)]
pub struct WithdrawFees<'info> {
    #[account(mut,
        seeds = [], bump = tswap.bump[0],
        seeds::program = tensorswap::id(),
        has_one = cosigner, has_one = owner
    )]
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
    // NB: tcomp is a SystemProgram since we never allocated data to it.
    let ixs = transfer(
        &ctx.accounts.tcomp.key(),
        &ctx.accounts.destination.key(),
        amount,
    );
    let (_, bump) = find_neutral_broker();

    invoke_signed(
        &ixs,
        &[
            ctx.accounts.tcomp.to_account_info(),
            ctx.accounts.destination.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
        ],
        &[&[&[bump]]],
    )?;

    Ok(())
}
