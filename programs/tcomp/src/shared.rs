use crate::*;

pub(crate) enum TcompSigner<'a, 'info> {
    Bid(&'a Account<'info, BidState>),
    List(&'a Account<'info, ListState>),
}

pub fn find_neutral_broker() -> (Pubkey, u8) {
    Pubkey::find_program_address(&[], &crate::id())
}

pub fn maker_broker_is_whitelisted(maker_broker: Option<Pubkey>) -> bool {
    maker_broker.is_none() || maker_broker == Some(crate::gameshift::ID)
}
