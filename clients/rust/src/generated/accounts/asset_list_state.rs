//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct AssetListState {
    pub discriminator: [u8; 8],
}

impl AssetListState {
    pub const LEN: usize = 8;

    /// Prefix values used to generate a PDA for this account.
    ///
    /// Values are positional and appear in the following order:
    ///
    ///   0. `AssetListState::PREFIX`
    ///   1. asset (`Pubkey`)
    pub const PREFIX: &'static [u8] = "list_state".as_bytes();

    pub fn create_pda(
        asset: Pubkey,
        bump: u8,
    ) -> Result<solana_program::pubkey::Pubkey, solana_program::pubkey::PubkeyError> {
        solana_program::pubkey::Pubkey::create_program_address(
            &["list_state".as_bytes(), asset.as_ref(), &[bump]],
            &crate::TENSOR_MARKETPLACE_ID,
        )
    }

    pub fn find_pda(asset: &Pubkey) -> (solana_program::pubkey::Pubkey, u8) {
        solana_program::pubkey::Pubkey::find_program_address(
            &["list_state".as_bytes(), asset.as_ref()],
            &crate::TENSOR_MARKETPLACE_ID,
        )
    }

    #[inline(always)]
    pub fn from_bytes(data: &[u8]) -> Result<Self, std::io::Error> {
        let mut data = data;
        Self::deserialize(&mut data)
    }
}

impl<'a> TryFrom<&solana_program::account_info::AccountInfo<'a>> for AssetListState {
    type Error = std::io::Error;

    fn try_from(
        account_info: &solana_program::account_info::AccountInfo<'a>,
    ) -> Result<Self, Self::Error> {
        let mut data: &[u8] = &(*account_info.data).borrow();
        Self::deserialize(&mut data)
    }
}

#[cfg(feature = "anchor")]
impl anchor_lang::AccountDeserialize for AssetListState {
    fn try_deserialize_unchecked(buf: &mut &[u8]) -> anchor_lang::Result<Self> {
        Ok(Self::deserialize(buf)?)
    }
}

#[cfg(feature = "anchor")]
impl anchor_lang::AccountSerialize for AssetListState {}

#[cfg(feature = "anchor")]
impl anchor_lang::Owner for AssetListState {
    fn owner() -> Pubkey {
        crate::TENSOR_MARKETPLACE_ID
    }
}

#[cfg(feature = "anchor-idl-build")]
impl anchor_lang::IdlBuild for AssetListState {}

#[cfg(feature = "anchor-idl-build")]
impl anchor_lang::Discriminator for AssetListState {
    const DISCRIMINATOR: [u8; 8] = [0; 8];
}
