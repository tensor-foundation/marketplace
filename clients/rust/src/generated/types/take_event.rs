//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! [https://github.com/metaplex-foundation/kinobi]
//!

use crate::generated::types::Field;
use crate::generated::types::Target;
use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct TakeEvent {
    #[cfg_attr(
        feature = "serde",
        serde(with = "serde_with::As::<serde_with::DisplayFromStr>")
    )]
    pub taker: Pubkey,
    pub bid_id: Option<Pubkey>,
    pub target: Target,
    #[cfg_attr(
        feature = "serde",
        serde(with = "serde_with::As::<serde_with::DisplayFromStr>")
    )]
    pub target_id: Pubkey,
    pub field: Option<Field>,
    pub field_id: Option<Pubkey>,
    pub amount: u64,
    pub quantity: u32,
    pub tcomp_fee: u64,
    pub taker_broker_fee: u64,
    pub maker_broker_fee: u64,
    pub creator_fee: u64,
    pub currency: Option<Pubkey>,
    pub asset_id: Option<Pubkey>,
}
