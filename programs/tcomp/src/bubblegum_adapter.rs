use anchor_lang::prelude::*;
use mpl_bubblegum::state::metaplex_adapter;

use crate::*;

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum TokenProgramVersion {
    Original,
    Token2022,
}

impl From<TokenProgramVersion> for metaplex_adapter::TokenProgramVersion {
    fn from(v: TokenProgramVersion) -> Self {
        match v {
            TokenProgramVersion::Original => metaplex_adapter::TokenProgramVersion::Original,
            TokenProgramVersion::Token2022 => metaplex_adapter::TokenProgramVersion::Token2022,
        }
    }
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum TokenStandard {
    NonFungible = 0,        // This is a master edition
    FungibleAsset = 1,      // A token with metadata that can also have attrributes
    Fungible = 2,           // A token with simple metadata
    NonFungibleEdition = 3, // This is a limited edition
}

impl From<TokenStandard> for metaplex_adapter::TokenStandard {
    fn from(s: TokenStandard) -> Self {
        match s {
            TokenStandard::NonFungible => metaplex_adapter::TokenStandard::NonFungible,
            TokenStandard::FungibleAsset => metaplex_adapter::TokenStandard::FungibleAsset,
            TokenStandard::Fungible => metaplex_adapter::TokenStandard::Fungible,
            TokenStandard::NonFungibleEdition => {
                metaplex_adapter::TokenStandard::NonFungibleEdition
            }
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub enum UseMethod {
    Burn,
    Multiple,
    Single,
}

impl From<UseMethod> for metaplex_adapter::UseMethod {
    fn from(m: UseMethod) -> Self {
        match m {
            UseMethod::Burn => metaplex_adapter::UseMethod::Burn,
            UseMethod::Multiple => metaplex_adapter::UseMethod::Multiple,
            UseMethod::Single => metaplex_adapter::UseMethod::Single,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct Uses {
    // 17 bytes + Option byte
    pub use_method: UseMethod, //1
    pub remaining: u64,        //8
    pub total: u64,            //8
}

impl From<Uses> for metaplex_adapter::Uses {
    fn from(u: Uses) -> Self {
        Self {
            use_method: metaplex_adapter::UseMethod::from(u.use_method),
            remaining: u.remaining,
            total: u.total,
        }
    }
}

#[repr(C)]
#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct Collection {
    pub verified: bool,
    pub key: Pubkey,
}

impl From<Collection> for metaplex_adapter::Collection {
    fn from(c: Collection) -> Self {
        Self {
            verified: c.verified,
            key: c.key,
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, PartialEq, Eq, Debug, Clone)]
pub struct MetadataArgs {
    /// The name of the asset
    pub name: String,
    /// The symbol for the asset
    pub symbol: String,
    /// URI pointing to JSON representing the asset
    pub uri: String,
    /// Royalty basis points that goes to creators in secondary sales (0-10000)
    pub seller_fee_basis_points: u16,
    // Immutable, once flipped, all sales of this metadata are considered secondary.
    pub primary_sale_happened: bool,
    // Whether or not the data struct is mutable, default is not
    pub is_mutable: bool,
    /// nonce for easy calculation of editions, if present
    pub edition_nonce: Option<u8>,
    /// Since we cannot easily change Metadata, we add the new DataV2 fields here at the end.
    pub token_standard: Option<TokenStandard>,
    /// Collection
    pub collection: Option<Collection>,
    /// Uses
    pub uses: Option<Uses>,
    pub token_program_version: TokenProgramVersion,
    // metadata with creators array simple as []. instead pass shares & verified separately below
    // so that we're not duplicating creator keys (space in the tx)
    pub creator_shares: Vec<u8>,
    pub creator_verified: Vec<bool>,
}

impl MetadataArgs {
    //can't use the default trait because need extra arg
    pub fn into(self, creators: &[AccountInfo]) -> metaplex_adapter::MetadataArgs {
        metaplex_adapter::MetadataArgs {
            name: self.name,
            symbol: self.symbol,
            uri: self.uri,
            seller_fee_basis_points: self.seller_fee_basis_points,
            primary_sale_happened: self.primary_sale_happened,
            is_mutable: self.is_mutable,
            edition_nonce: self.edition_nonce,
            token_standard: if let Some(std) = self.token_standard {
                Some(metaplex_adapter::TokenStandard::from(std))
            } else {
                None
            },
            collection: if let Some(coll) = self.collection {
                Some(metaplex_adapter::Collection::from(coll))
            } else {
                None
            },
            uses: if let Some(uses) = self.uses {
                Some(metaplex_adapter::Uses::from(uses))
            } else {
                None
            },
            token_program_version: metaplex_adapter::TokenProgramVersion::from(
                self.token_program_version,
            ),
            creators: creators
                .iter()
                .enumerate()
                .map(|(i, c)| metaplex_adapter::Creator {
                    address: c.key(),
                    verified: self.creator_verified[i],
                    share: self.creator_shares[i],
                })
                .collect::<Vec<_>>(),
        }
    }
}
