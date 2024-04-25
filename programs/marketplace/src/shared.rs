use crate::*;

#[macro_export]
macro_rules! shard_num {
    ($account:expr) => {
        &$account.key().as_ref()[32].to_le_bytes()
    };
}

pub(crate) enum TcompSigner<'a, 'info> {
    Bid(&'a Account<'info, BidState>),
    List(&'a Account<'info, ListState>),
}

pub fn find_neutral_broker() -> (Pubkey, u8) {
    Pubkey::find_program_address(&[], &crate::ID)
}

pub fn maker_broker_is_whitelisted(maker_broker: Option<Pubkey>) -> bool {
    maker_broker.is_none() || maker_broker == Some(tensor_toolbox::gameshift::ID)
}
