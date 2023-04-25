use anchor_lang::prelude::*;
use tcomp::{self};

declare_id!("5zABSn1WYLHYenFtTFcM5AHdJjnHkx6S85rkWkFzLExq");

#[program]
pub mod cpi_test {
    use super::*;

    pub fn cpi<'info>(
        ctx: Context<Cpi<'info>>,
        nonce: u64,
        amount: u64,
        expire_in_sec: Option<u64>,
        currency: Option<Pubkey>,
        private_taker: Option<Pubkey>,
    ) -> Result<()> {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.tcomp_program.to_account_info(),
            tcomp::cpi::accounts::Edit {
                owner: ctx.accounts.owner.to_account_info(),
                merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
                list_state: ctx.accounts.list_state.to_account_info(),
                tcomp_program: ctx.accounts.tcomp_program.to_account_info(),
            },
        );

        tcomp::cpi::edit(
            cpi_ctx,
            nonce,
            amount,
            expire_in_sec,
            currency,
            private_taker,
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Cpi<'info> {
    pub owner: Signer<'info>,
    /// CHECK: downstream
    pub merkle_tree: UncheckedAccount<'info>,
    /// CHECK: downstream
    #[account(mut)]
    pub list_state: UncheckedAccount<'info>,
    pub tcomp_program: Program<'info, tcomp::program::Tcomp>,
}
