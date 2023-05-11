use crate::*;

// (!) tuples currently unsupported on anchor
#[derive(AnchorDeserialize, AnchorSerialize)]
#[repr(C)]
pub enum TcompEvent {
    Maker(MakeEvent),
    Taker(TakeEvent),
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct MakeEvent {
    pub maker: Pubkey,
    pub bid_id: Option<Pubkey>,
    pub target: Target,
    pub target_id: Pubkey,
    pub field: Option<Field>,
    pub field_id: Option<Pubkey>,
    pub amount: u64,
    pub quantity: u32,
    pub currency: Option<Pubkey>,
    pub expiry: i64,
    pub private_taker: Option<Pubkey>,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct TakeEvent {
    pub taker: Pubkey,
    pub bid_id: Option<Pubkey>,
    pub target: Target,
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
}
