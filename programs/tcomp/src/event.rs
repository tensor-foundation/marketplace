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
    pub asset_id: Pubkey,
    pub amount: u64,
    pub currency: Option<Pubkey>,
    pub expiry: i64,
    pub private_taker: Option<Pubkey>,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct TakeEvent {
    pub taker: Pubkey,
    pub asset_id: Pubkey,
    pub amount: u64,
    pub tcomp_fee: u64,
    pub broker_fee: u64,
    pub creator_fee: u64,
    pub currency: Option<Pubkey>,
}
