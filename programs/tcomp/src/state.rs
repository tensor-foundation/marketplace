use crate::*;

#[constant]
pub const CURRENT_TCOMP_VERSION: u8 = 1;
#[constant]
pub const FEE_BPS: u16 = 169;
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

    pub _reserved: [u8; 64],
}

// (!) INCLUSIVE of discriminator (8 bytes)
#[constant]
#[allow(clippy::identity_op)]
pub const LIST_STATE_SIZE: usize = 8 + 1 + 1 + (32 * 2) + 8 + 33 + 8 + 33 + 64;

impl ListState {
    pub fn seeds(&self) -> [&[u8]; 3] {
        [b"list_state".as_ref(), self.asset_id.as_ref(), &self.bump]
    }
}

// --------------------------------------- bidding

#[account]
pub struct BidState {
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
    pub margin: Option<Pubkey>,

    pub _reserved: [u8; 64],
}

// (!) INCLUSIVE of discriminator (8 bytes)
#[constant]
#[allow(clippy::identity_op)]
pub const BID_STATE_SIZE: usize = 8 + 1 + 1 + (32 * 2) + 8 + 33 + 8 + 33 + 33 + 64;

impl BidState {
    pub fn seeds(&self) -> [&[u8]; 4] {
        [
            b"bid_state".as_ref(),
            self.owner.as_ref(),
            self.asset_id.as_ref(),
            &self.bump,
        ]
    }
}

// --------------------------------------- events

#[event]
pub struct MakeEvent {
    pub maker: Pubkey,
    pub asset_id: Pubkey,
    pub amount: u64,
    pub currency: Option<Pubkey>,
    pub expiry: i64,
    pub private_taker: Option<Pubkey>,
}

#[event]
pub struct TakeEvent {
    pub taker: Pubkey,
    pub asset_id: Pubkey,
    pub amount: u64,
    pub tcomp_fee: u64,
    pub broker_fee: u64,
    pub creator_fee: u64,
    pub currency: Option<Pubkey>,
}
