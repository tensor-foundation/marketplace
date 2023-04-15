#![allow(unknown_lints)] //needed otherwise complains during github actions
#![allow(clippy::result_large_err)] //needed otherwise unhappy w/ anchor errors

pub mod bubblegum_adapter;
pub mod instructions;
pub mod state;
pub mod utils;

pub use std::str::FromStr;

pub use anchor_lang::{
    prelude::*,
    solana_program::{
        instruction::Instruction,
        keccak::hashv,
        program::{invoke, invoke_signed},
    },
};
pub use bubblegum_adapter::*;
pub use instructions::*;
pub use mpl_bubblegum::{
    self,
    program::Bubblegum,
    state::{leaf_schema::LeafSchema, metaplex_adapter::Creator},
    utils::get_asset_id,
};
pub use spl_account_compression::{
    program::SplAccountCompression, wrap_application_data_v1, Node, Noop,
};
pub use state::*;
pub use utils::*;
pub use vipers::{prelude::*, throw_err};

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

    pub fn list<'info>(
        ctx: Context<'_, '_, '_, 'info, List<'info>>,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        metadata: MetadataArgs,
        amount: u64,
        expire_in_sec: Option<u64>,
        currency: Option<Pubkey>,
        private_taker: Option<Pubkey>,
    ) -> Result<()> {
        instructions::list::handler(
            ctx,
            nonce,
            index,
            root,
            metadata,
            amount,
            expire_in_sec,
            currency,
            private_taker,
        )
    }
}

// --------------------------------------- errors

#[error_code]
pub enum ErrorCode {
    #[msg("arithmetic error")]
    ArithmeticError = 0,
    #[msg("expiry too large")]
    ExpiryTooLarge = 1,
    #[msg("bad signer")]
    BadSigner = 2,
}
