pub mod legacy;
pub use legacy::*;

pub mod token22;
pub use token22::*;

pub mod wns;
pub use wns::*;

pub mod mpl_core;
pub use mpl_core::*;

pub mod compressed;
pub use compressed::*;

pub mod bid;
pub mod cancel_bid;
pub mod close_expired_bid;
pub mod edit;
pub mod noop;
pub mod take_bid_common;
pub mod withdraw_fees;

pub use bid::*;
pub use cancel_bid::*;
pub use close_expired_bid::*;
pub use edit::*;
pub use noop::*;
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
