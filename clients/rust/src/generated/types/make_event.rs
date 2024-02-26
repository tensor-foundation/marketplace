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
pub struct MakeEvent {
    #[cfg_attr(
        feature = "serde",
        serde(with = "serde_with::As::<serde_with::DisplayFromStr>")
    )]
    pub maker: Pubkey,
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
    pub currency: Option<Pubkey>,
    pub expiry: i64,
    pub private_taker: Option<Pubkey>,
    pub asset_id: Option<Pubkey>,
}
