#![allow(clippy::result_large_err)] // Needed otherwise clippy unhappy w/ anchor errors
//! A brick.
//! Deploy in case of emergency.

use anchor_lang::prelude::*;

// TODO: change this to appropriate program's ID
declare_id!("TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp");

#[program]
pub mod brick {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    /// CHECK: not in use.
    account: AccountInfo<'info>,
}
