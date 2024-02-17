pub mod bid;
pub mod buy;
pub mod buy_spl;
pub mod cancel_bid;
pub mod close_expired_bid;
pub mod close_expired_listing;
pub mod delist;
pub mod edit;
pub mod list;
pub mod noop;
pub mod take_bid_common;
pub mod take_bid_compressed;
pub mod take_bid_legacy;
pub mod take_bid_t22;
pub mod take_bid_wns;
pub mod withdraw_fees;

pub use bid::*;
pub use buy::*;
pub use buy_spl::*;
pub use cancel_bid::*;
pub use close_expired_bid::*;
pub use close_expired_listing::*;
pub use delist::*;
pub use edit::*;
pub use list::*;
pub use noop::*;
pub use take_bid_compressed::*;
pub use take_bid_legacy::*;
pub use take_bid_t22::*;
pub use take_bid_wns::*;
pub use withdraw_fees::*;

use anchor_lang::solana_program::pubkey::Pubkey;

#[derive(Clone)]
pub struct Noop;

impl anchor_lang::Id for Noop {
    fn id() -> Pubkey {
        spl_noop::ID
    }
}

#[derive(Clone)]
pub struct SplAccountCompression;

impl anchor_lang::Id for SplAccountCompression {
    fn id() -> Pubkey {
        spl_account_compression::ID
    }
}
