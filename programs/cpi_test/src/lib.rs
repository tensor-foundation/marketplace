#![allow(clippy::result_large_err)] // Needed otherwise clippy unhappy w/ anchor errors

use anchor_lang::prelude::*;
use tcomp::{self};

declare_id!("5zABSn1WYLHYenFtTFcM5AHdJjnHkx6S85rkWkFzLExq");

#[program]
pub mod cpi_test {
    use super::*;

    pub fn cpi(
        ctx: Context<Cpi>,
        amount: u64,
        expire_in_sec: Option<u64>,
        currency: Option<Pubkey>,
        private_taker: Option<Pubkey>,
        maker_broker: Option<Pubkey>,
    ) -> Result<()> {
        let cpi_ctx = CpiContext::new(
            ctx.accounts.tcomp_program.to_account_info(),
            tcomp::cpi::accounts::Edit {
                owner: ctx.accounts.owner.to_account_info(),
                list_state: ctx.accounts.list_state.to_account_info(),
                tcomp_program: ctx.accounts.tcomp_program.to_account_info(),
            },
        );

        tcomp::cpi::edit(
            cpi_ctx,
            amount,
            expire_in_sec,
            currency,
            private_taker,
            maker_broker,
        )?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Cpi<'info> {
    pub owner: Signer<'info>,
    /// CHECK: downstream
    #[account(mut)]
    pub list_state: UncheckedAccount<'info>,
    pub tcomp_program: Program<'info, tcomp::program::Tcomp>,
}
