use crate::*;

#[constant]
pub const CURRENT_TCOMP_VERSION: u8 = 1;
#[constant]
pub const TCOMP_FEE_BPS: u16 = 150;
#[constant]
pub const MAX_EXPIRY_SEC: i64 = 5184000; // Max 60 days
#[constant]
pub const HUNDRED_PCT_BPS: u16 = 10000;

// TODO: currently disabled
#[constant]
pub const TAKER_BROKER_PCT: u16 = 0; // Out of 100

// --------------------------------------- listing

#[account]
pub struct ListState {
    pub version: u8,
    pub bump: [u8; 1],
    // IDs
    pub owner: Pubkey,
    pub asset_id: Pubkey,
    // Amount
    pub amount: u64,
    pub currency: Option<Pubkey>,
    // Extras
    pub expiry: i64,
    pub private_taker: Option<Pubkey>,
    pub maker_broker: Option<Pubkey>,

    pub _reserved: [u8; 128],
}

// (!) INCLUSIVE of discriminator (8 bytes)
#[constant]
#[allow(clippy::identity_op)]
pub const LIST_STATE_SIZE: usize = 8 + 1 + 1 + (32 * 2) + 8 + 33 + 8 + (33 * 2) + 128;

impl ListState {
    pub fn seeds(&self) -> [&[u8]; 3] {
        [b"list_state".as_ref(), self.asset_id.as_ref(), &self.bump]
    }
}

// --------------------------------------- bidding

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum BidTarget {
    AssetId = 0,
    Voc = 1,
    Fvc = 2,
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub enum BidField {
    Name = 0,
}

#[account]
pub struct BidState {
    pub version: u8,
    pub bump: [u8; 1],
    // IDs
    pub owner: Pubkey,
    /// Randomly picked pubkey used in bid seeds. To avoid dangling bids can use assetId here.
    pub bid_id: Pubkey,
    // Obviously would be better to use an enum-tuple / enum-struct but anchor doesn't serialize them
    pub target: BidTarget,
    pub target_id: Pubkey,
    // In addition to target can bid on a subset of the collection by choosing a field in the struct
    pub field: Option<BidField>,
    pub field_id: Option<Pubkey>,
    // Amount
    pub amount: u64,
    pub currency: Option<Pubkey>,
    // Extras
    pub expiry: i64,
    pub private_taker: Option<Pubkey>,
    pub maker_broker: Option<Pubkey>,
    pub margin: Option<Pubkey>,

    pub _reserved: [u8; 128],
}

// (!) INCLUSIVE of discriminator (8 bytes)
#[constant]
#[allow(clippy::identity_op)]
pub const BID_STATE_SIZE: usize =
    8 + 1 + 1 + (32 * 2) + 1 + 32 + 2 + 33 + 8 + 33 + 8 + (33 * 3) + 128;

impl BidState {
    pub fn seeds(&self) -> [&[u8]; 4] {
        [
            b"bid_state".as_ref(),
            self.owner.as_ref(),
            self.bid_id.as_ref(),
            &self.bump,
        ]
    }
}
