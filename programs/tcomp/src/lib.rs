#![allow(unknown_lints)] //needed otherwise complains during github actions
#![allow(clippy::result_large_err)] //needed otherwise unhappy w/ anchor errors

pub mod bubblegum_adapter;
pub mod instructions;
pub mod state;
pub mod utils;

pub use anchor_lang::prelude::*;
pub use bubblegum_adapter::*;
pub use instructions::*;
pub use state::*;
pub use utils::*;
pub use vipers::prelude::*;

declare_id!("TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp");

#[program]
pub mod tcomp {
    use super::*;

    pub fn buy<'info>(
        ctx: Context<'_, '_, '_, 'info, Buy<'info>>,
        root: [u8; 32],
        nonce: u64,
        index: u32,
        metadata: MetadataArgs,
    ) -> Result<()> {
        instructions::buy::handler(ctx, root, nonce, index, metadata)
    }
}

// --------------------------------------- errors

#[error_code]
pub enum ErrorCode {
    #[msg("arithmetic error")]
    ArithmeticError = 0,
}
