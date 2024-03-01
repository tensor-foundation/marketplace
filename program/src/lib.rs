#![allow(clippy::too_many_arguments)]
#![allow(unknown_lints)] // Needed otherwise clippy complains during github actions
#![allow(clippy::result_large_err)] // Needed otherwise clippy unhappy w/ anchor errors

pub mod bubblegum_adapter;
pub mod error;
pub mod event;
pub mod instructions;
pub mod pnft_adapter;
pub(crate) mod shared;
pub mod state;
pub use std::{
    io::Write,
    ops::{Deref, DerefMut},
    slice::Iter,
    str::FromStr,
};

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
pub use anchor_spl::associated_token::{create_idempotent, AssociatedToken, Create};
pub use bubblegum_adapter::*;
pub use error::*;
pub use event::*;
pub use instructions::*;
pub use pnft_adapter::*;
pub use shared::find_neutral_broker;
pub(crate) use shared::*;
pub use state::*;
pub use tensor_nft::*;
pub use tensor_whitelist::{self, Whitelist};
pub use tensorswap::{self, margin_pda, program::Tensorswap, MarginAccount, TSwap};
pub use vipers::{prelude::*, throw_err};

declare_id!("TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp");

#[program]
pub mod marketplace_program {
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
            optional_royalty_pct,
        )
    }

    pub fn buy_spl<'info>(
        ctx: Context<'_, '_, '_, 'info, BuySpl<'info>>,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        meta_hash: [u8; 32],
        creator_shares: Vec<u8>,
        creator_verified: Vec<bool>,
        seller_fee_basis_points: u16,
        max_amount: u64,
        optional_royalty_pct: Option<u16>,
    ) -> Result<()> {
        instructions::buy_spl::handler(
            ctx,
            nonce,
            index,
            root,
            meta_hash,
            creator_shares,
            creator_verified,
            seller_fee_basis_points,
            max_amount,
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
        maker_broker: Option<Pubkey>,
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
            maker_broker,
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
        amount: u64,
        expire_in_sec: Option<u64>,
        currency: Option<Pubkey>,
        private_taker: Option<Pubkey>,
        maker_broker: Option<Pubkey>,
    ) -> Result<()> {
        instructions::edit::handler(
            ctx,
            amount,
            expire_in_sec,
            currency,
            private_taker,
            maker_broker,
        )
    }

    // --------------------------------------- bids

    pub fn bid<'info>(
        ctx: Context<'_, '_, '_, 'info, Bid<'info>>,
        bid_id: Pubkey,
        target: Target,
        target_id: Pubkey,
        field: Option<Field>,
        field_id: Option<Pubkey>,
        amount: u64,
        quantity: u32,
        expire_in_sec: Option<u64>,
        currency: Option<Pubkey>,
        private_taker: Option<Pubkey>,
        maker_broker: Option<Pubkey>,
    ) -> Result<()> {
        instructions::bid::handler(
            ctx,
            bid_id,
            target,
            target_id,
            field,
            field_id,
            amount,
            quantity,
            expire_in_sec,
            currency,
            private_taker,
            maker_broker,
        )
    }

    pub fn cancel_bid<'info>(ctx: Context<'_, '_, '_, 'info, CancelBid<'info>>) -> Result<()> {
        instructions::cancel_bid::handler(ctx)
    }

    pub fn close_expired_bid<'info>(
        ctx: Context<'_, '_, '_, 'info, CloseExpiredBid<'info>>,
    ) -> Result<()> {
        instructions::close_expired_bid::handler(ctx)
    }

    pub fn close_expired_listing<'info>(
        ctx: Context<'_, '_, '_, 'info, CloseExpiredListing<'info>>,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
    ) -> Result<()> {
        instructions::close_expired_listing::handler(
            ctx,
            nonce,
            index,
            root,
            data_hash,
            creator_hash,
        )
    }

    pub fn take_bid_meta_hash<'info>(
        ctx: Context<'_, '_, '_, 'info, TakeBidCompressed<'info>>,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        meta_hash: [u8; 32],
        creator_shares: Vec<u8>,
        creator_verified: Vec<bool>,
        seller_fee_basis_points: u16,
        min_amount: u64,
        optional_royalty_pct: Option<u16>,
    ) -> Result<()> {
        instructions::take_bid_compressed::handler_meta_hash(
            ctx,
            nonce,
            index,
            root,
            meta_hash,
            creator_shares,
            creator_verified,
            seller_fee_basis_points,
            min_amount,
            optional_royalty_pct,
        )
    }

    pub fn take_bid_full_meta<'info>(
        ctx: Context<'_, '_, '_, 'info, TakeBidCompressed<'info>>,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        meta_args: TMetadataArgs,
        min_amount: u64,
        optional_royalty_pct: Option<u16>,
    ) -> Result<()> {
        instructions::take_bid_compressed::handler_full_meta(
            ctx,
            nonce,
            index,
            root,
            meta_args,
            min_amount,
            optional_royalty_pct,
        )
    }

    pub fn take_bid_legacy<'info>(
        ctx: Context<'_, '_, '_, 'info, TakeBidLegacy<'info>>,
        min_amount: u64,
        optional_royalty_pct: Option<u16>,
        rules_acc_present: bool,
        authorization_data: Option<AuthorizationDataLocal>,
    ) -> Result<()> {
        instructions::take_bid_legacy::handler(
            ctx,
            min_amount,
            optional_royalty_pct,
            rules_acc_present,
            authorization_data,
        )
    }

    pub fn take_bid_t22<'info>(
        ctx: Context<'_, '_, '_, 'info, TakeBidT22<'info>>,
        min_amount: u64,
    ) -> Result<()> {
        instructions::take_bid_t22::process_take_bid_t22(ctx, min_amount)
    }

    pub fn take_bid_wns<'info>(
        ctx: Context<'_, '_, '_, 'info, WnsTakeBid<'info>>,
        min_amount: u64,
    ) -> Result<()> {
        instructions::take_bid_wns::process_take_bid_wns(ctx, min_amount)
    }
}
