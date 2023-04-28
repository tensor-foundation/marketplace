#![allow(unknown_lints)] // Needed otherwise clippy complains during github actions
#![allow(clippy::result_large_err)] // Needed otherwise clippy unhappy w/ anchor errors

pub mod bubblegum_adapter;
pub mod error;
pub mod event;
pub mod instructions;
pub mod shared;
pub mod state;

pub use std::{slice::Iter, str::FromStr};

pub use anchor_lang::{
    prelude::*,
    solana_program::{
        hash,
        instruction::Instruction,
        keccak::hashv,
        program::{invoke, invoke_signed},
        system_instruction,
    },
    InstructionData,
};
pub use bubblegum_adapter::*;
pub use error::*;
pub use event::*;
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
pub use noop::*;
pub use shared::*;
pub use spl_account_compression::{
    program::SplAccountCompression, wrap_application_data_v1, Node, Noop,
};
pub use state::*;
pub use tensorswap::{self, assert_decode_margin_account, program::Tensorswap, TSwap};
pub use vipers::{prelude::*, throw_err};

declare_id!("TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp");

#[program]
pub mod tcomp {
    use super::*;

    // --------------------------------------- admin

    // Cpi into itself to record an event. Calling tcomp_noop to distinguish with existing noop.
    pub fn tcomp_noop(ctx: Context<TcompNoop>, _event: TcompEvent) -> Result<()> {
        instructions::noop::handler(ctx)
    }

    pub fn withdraw_fees<'info>(
        ctx: Context<'_, '_, '_, 'info, WithdrawFees<'info>>,
        amount: u64,
    ) -> Result<()> {
        instructions::withdraw_fees::handler(ctx, amount)
    }

    // --------------------------------------- listings

    pub fn buy<'info>(
        ctx: Context<'_, '_, '_, 'info, Buy<'info>>,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        meta_hash: [u8; 32],
        creator_shares: Vec<u8>,
        creator_verified: Vec<bool>,
        seller_fee_basis_points: u16,
        max_amount: u64,
        currency: Option<Pubkey>,
        optional_royalty_pct: Option<u16>,
    ) -> Result<()> {
        instructions::buy::handler(
            ctx,
            nonce,
            index,
            root,
            meta_hash,
            creator_shares,
            creator_verified,
            seller_fee_basis_points,
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
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
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
            data_hash,
            creator_hash,
            amount,
            expire_in_sec,
            currency,
            private_taker,
        )
    }

    pub fn delist<'info>(
        ctx: Context<'_, '_, '_, 'info, Delist<'info>>,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
    ) -> Result<()> {
        instructions::delist::handler(ctx, nonce, index, root, data_hash, creator_hash)
    }

    pub fn edit<'info>(
        ctx: Context<'_, '_, '_, 'info, Edit<'info>>,
        nonce: u64,
        amount: u64,
        expire_in_sec: Option<u64>,
        currency: Option<Pubkey>,
        private_taker: Option<Pubkey>,
    ) -> Result<()> {
        instructions::edit::handler(ctx, nonce, amount, expire_in_sec, currency, private_taker)
    }

    // --------------------------------------- bids

    pub fn bid<'info>(
        ctx: Context<'_, '_, '_, 'info, Bid<'info>>,
        target_id: Pubkey,
        target: BidTarget,
        amount: u64,
        expire_in_sec: Option<u64>,
        currency: Option<Pubkey>,
        private_taker: Option<Pubkey>,
    ) -> Result<()> {
        instructions::bid::handler(
            ctx,
            target_id,
            target,
            amount,
            expire_in_sec,
            currency,
            private_taker,
        )
    }

    pub fn cancel_bid<'info>(
        ctx: Context<'_, '_, '_, 'info, CancelBid<'info>>,
        _target_id: Pubkey,
    ) -> Result<()> {
        instructions::cancel_bid::handler(ctx)
    }

    pub fn close_expired_bid<'info>(
        ctx: Context<'_, '_, '_, 'info, CloseExpiredBid<'info>>,
        _target_id: Pubkey,
    ) -> Result<()> {
        instructions::close_expired_bid::handler(ctx)
    }

    pub fn take_bid_meta_hash<'info>(
        ctx: Context<'_, '_, '_, 'info, TakeBid<'info>>,
        _target_id: Pubkey,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        meta_hash: [u8; 32],
        creator_shares: Vec<u8>,
        creator_verified: Vec<bool>,
        seller_fee_basis_points: u16,
        min_amount: u64,
        currency: Option<Pubkey>,
        optional_royalty_pct: Option<u16>,
    ) -> Result<()> {
        instructions::take_bid::handler_meta_hash(
            ctx,
            nonce,
            index,
            root,
            meta_hash,
            creator_shares,
            creator_verified,
            seller_fee_basis_points,
            min_amount,
            currency,
            optional_royalty_pct,
        )
    }

    pub fn take_bid_full_meta<'info>(
        ctx: Context<'_, '_, '_, 'info, TakeBid<'info>>,
        _target_id: Pubkey,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        meta_args: TMetadataArgs,
        min_amount: u64,
        currency: Option<Pubkey>,
        optional_royalty_pct: Option<u16>,
    ) -> Result<()> {
        instructions::take_bid::handler_full_meta(
            ctx,
            nonce,
            index,
            root,
            meta_args,
            min_amount,
            currency,
            optional_royalty_pct,
        )
    }
}
