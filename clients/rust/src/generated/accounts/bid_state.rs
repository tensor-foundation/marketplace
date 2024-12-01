//! This code was AUTOGENERATED using the codama library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun codama to update it.
//!
//! <https://github.com/codama-idl/codama>
//!

use crate::generated::types::Field;
use crate::generated::types::Target;
use crate::hooked::NullableAddress;
use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct BidState {
    pub discriminator: [u8; 8],
    pub version: u8,
    pub bump: [u8; 1],
    #[cfg_attr(
        feature = "serde",
        serde(with = "serde_with::As::<serde_with::DisplayFromStr>")
    )]
    pub owner: Pubkey,
    /// Randomly picked pubkey used in bid seeds. To avoid dangling bids can use assetId here.
    #[cfg_attr(
        feature = "serde",
        serde(with = "serde_with::As::<serde_with::DisplayFromStr>")
    )]
    pub bid_id: Pubkey,
    pub target: Target,
    #[cfg_attr(
        feature = "serde",
        serde(with = "serde_with::As::<serde_with::DisplayFromStr>")
    )]
    pub target_id: Pubkey,
    pub field: Option<Field>,
    pub field_id: Option<Pubkey>,
    pub quantity: u32,
    pub filled_quantity: u32,
    pub amount: u64,
    pub currency: Option<Pubkey>,
    pub expiry: i64,
    pub private_taker: Option<Pubkey>,
    pub maker_broker: Option<Pubkey>,
    pub margin: Option<Pubkey>,
    pub updated_at: i64,
    /// Cosigner
    /// Default Pubkey represents a None value.
    pub cosigner: NullableAddress,
    /// Owner is the rent payer when this is None.
    /// Default Pubkey represents a None value.
    pub rent_payer: NullableAddress,
    pub reserved: [u8; 8],
    pub reserved1: [u8; 16],
    pub reserved2: [u8; 32],
}

impl BidState {
    /// Prefix values used to generate a PDA for this account.
    ///
    /// Values are positional and appear in the following order:
    ///
    ///   0. `BidState::PREFIX`
    ///   1. owner (`Pubkey`)
    ///   2. bid_id (`Pubkey`)
    pub const PREFIX: &'static [u8] = "bid_state".as_bytes();

    pub fn create_pda(
        owner: Pubkey,
        bid_id: Pubkey,
        bump: u8,
    ) -> Result<solana_program::pubkey::Pubkey, solana_program::pubkey::PubkeyError> {
        solana_program::pubkey::Pubkey::create_program_address(
            &[
                "bid_state".as_bytes(),
                owner.as_ref(),
                bid_id.as_ref(),
                &[bump],
            ],
            &crate::TENSOR_MARKETPLACE_ID,
        )
    }

    pub fn find_pda(owner: &Pubkey, bid_id: &Pubkey) -> (solana_program::pubkey::Pubkey, u8) {
        solana_program::pubkey::Pubkey::find_program_address(
            &["bid_state".as_bytes(), owner.as_ref(), bid_id.as_ref()],
            &crate::TENSOR_MARKETPLACE_ID,
        )
    }

    #[inline(always)]
    pub fn from_bytes(data: &[u8]) -> Result<Self, std::io::Error> {
        let mut data = data;
        Self::deserialize(&mut data)
    }
}

impl<'a> TryFrom<&solana_program::account_info::AccountInfo<'a>> for BidState {
    type Error = std::io::Error;

    fn try_from(
        account_info: &solana_program::account_info::AccountInfo<'a>,
    ) -> Result<Self, Self::Error> {
        let mut data: &[u8] = &(*account_info.data).borrow();
        Self::deserialize(&mut data)
    }
}

#[cfg(feature = "anchor")]
impl anchor_lang::AccountDeserialize for BidState {
    fn try_deserialize_unchecked(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
        Ok(Self::deserialize(buf)?)
    }
}

#[cfg(feature = "anchor")]
impl anchor_lang::AccountSerialize for BidState {}

#[cfg(feature = "anchor")]
impl anchor_lang::Owner for BidState {
    fn owner() -> Pubkey {
        crate::TENSOR_MARKETPLACE_ID
    }
}

#[cfg(feature = "anchor-idl-build")]
impl anchor_lang::IdlBuild for BidState {}

#[cfg(feature = "anchor-idl-build")]
impl anchor_lang::Discriminator for BidState {
    const DISCRIMINATOR: [u8; 8] = [0; 8];
}
