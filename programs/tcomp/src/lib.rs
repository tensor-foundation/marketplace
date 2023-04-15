#![allow(unknown_lints)] // Needed otherwise clippy complains during github actions
#![allow(clippy::result_large_err)] // Needed otherwise clippy unhappy w/ anchor errors

pub mod bubblegum_adapter;
pub mod error;
pub mod instructions;
pub mod shared;
pub mod state;

pub use std::{slice::Iter, str::FromStr};

pub use anchor_lang::{
    prelude::*,
    solana_program::{
        instruction::Instruction,
        keccak::hashv,
        program::{invoke, invoke_signed},
        system_instruction,
    },
    InstructionData,
};
pub use bubblegum_adapter::*;
pub use error::*;
pub use instructions::*;
pub use mpl_bubblegum::{
    self,
    program::Bubblegum,
    state::{
        leaf_schema::LeafSchema,
        metaplex_adapter::{
            Collection, Creator, MetadataArgs, TokenProgramVersion, TokenStandard, UseMethod, Uses,
        },
    },
    utils::get_asset_id,
};
pub use shared::*;
pub use spl_account_compression::{
    program::SplAccountCompression, wrap_application_data_v1, Node, Noop,
};
pub use state::*;
pub use vipers::prelude::*;

declare_id!("TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp");

#[program]
pub mod tcomp {
    use super::*;

    pub fn buy<'info>(
        ctx: Context<'_, '_, '_, 'info, Buy<'info>>,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        metadata: TMetadataArgs,
        max_amount: u64,
        currency: Option<Pubkey>,
        optional_royalty_pct: Option<u16>,
    ) -> Result<()> {
        instructions::buy::handler(
            ctx,
            nonce,
            index,
            root,
            metadata,
            max_amount,
            currency,
            optional_royalty_pct,
        )
    }

    pub fn list<'info>(
        ctx: Context<'_, '_, '_, 'info, List<'info>>,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        metadata: TMetadataArgs,
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
