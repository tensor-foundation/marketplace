pub mod bid;
pub mod cancel_bid;
pub mod close_expired_bid;
pub mod compressed;
pub mod edit;
pub mod legacy;
pub mod mpl_core;
pub mod noop;
pub mod take_bid;
pub mod token22;
pub mod withdraw_fees;
pub mod wns;

pub use self::mpl_core::*;
pub use bid::*;
pub use cancel_bid::*;
pub use close_expired_bid::*;
pub use compressed::*;
pub use edit::*;
pub use legacy::*;
pub use noop::*;
pub use take_bid::*;
pub use token22::*;
pub use withdraw_fees::*;
pub use wns::*;

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
