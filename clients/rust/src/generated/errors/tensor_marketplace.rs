//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use num_derive::FromPrimitive;
use thiserror::Error;

#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum TensorMarketplaceError {
    /// 6100 - arithmetic error
    #[error("arithmetic error")]
    ArithmeticError = 0x17D4,
    /// 6101 - expiry too large
    #[error("expiry too large")]
    ExpiryTooLarge = 0x17D5,
    /// 6102 - bad owner
    #[error("bad owner")]
    BadOwner = 0x17D6,
    /// 6103 - bad list state
    #[error("bad list state")]
    BadListState = 0x17D7,
    /// 6104 - royalties pct must be between 0 and 100
    #[error("royalties pct must be between 0 and 100")]
    BadRoyaltiesPct = 0x17D8,
    /// 6105 - price mismatch
    #[error("price mismatch")]
    PriceMismatch = 0x17D9,
    /// 6106 - creator mismatch
    #[error("creator mismatch")]
    CreatorMismatch = 0x17DA,
    /// 6107 - insufficient balance
    #[error("insufficient balance")]
    InsufficientBalance = 0x17DB,
    /// 6108 - bid has expired
    #[error("bid has expired")]
    BidExpired = 0x17DC,
    /// 6109 - taker not allowed
    #[error("taker not allowed")]
    TakerNotAllowed = 0x17DD,
    /// 6110 - cannot pass bid field
    #[error("cannot pass bid field")]
    BadBidField = 0x17DE,
    /// 6111 - bid not yet expired
    #[error("bid not yet expired")]
    BidNotYetExpired = 0x17DF,
    /// 6112 - bad margin
    #[error("bad margin")]
    BadMargin = 0x17E0,
    /// 6113 - wrong ix for bid target called
    #[error("wrong ix for bid target called")]
    WrongIxForBidTarget = 0x17E1,
    /// 6114 - wrong target id
    #[error("wrong target id")]
    WrongTargetId = 0x17E2,
    /// 6115 - creator array missing first verified creator
    #[error("creator array missing first verified creator")]
    MissingFvc = 0x17E3,
    /// 6116 - metadata missing collection
    #[error("metadata missing collection")]
    MissingCollection = 0x17E4,
    /// 6117 - cannot modify bid target, create a new bid
    #[error("cannot modify bid target, create a new bid")]
    CannotModifyTarget = 0x17E5,
    /// 6118 - target id and bid id must be the same for single bids
    #[error("target id and bid id must be the same for single bids")]
    TargetIdMustEqualBidId = 0x17E6,
    /// 6119 - currency not yet enabled
    #[error("currency not yet enabled")]
    CurrencyNotYetEnabled = 0x17E7,
    /// 6120 - maker broker not yet enabled
    #[error("maker broker not yet enabled")]
    MakerBrokerNotYetEnabled = 0x17E8,
    /// 6121 - optional royalties not yet enabled
    #[error("optional royalties not yet enabled")]
    OptionalRoyaltiesNotYetEnabled = 0x17E9,
    /// 6122 - wrong state version
    #[error("wrong state version")]
    WrongStateVersion = 0x17EA,
    /// 6123 - wrong field id
    #[error("wrong field id")]
    WrongBidFieldId = 0x17EB,
    /// 6124 - broker mismatch
    #[error("broker mismatch")]
    BrokerMismatch = 0x17EC,
    /// 6125 - asset id mismatch
    #[error("asset id mismatch")]
    AssetIdMismatch = 0x17ED,
    /// 6126 - listing has expired
    #[error("listing has expired")]
    ListingExpired = 0x17EE,
    /// 6127 - listing not yet expired
    #[error("listing not yet expired")]
    ListingNotYetExpired = 0x17EF,
    /// 6128 - bad quantity passed in
    #[error("bad quantity passed in")]
    BadQuantity = 0x17F0,
    /// 6129 - bid fully filled
    #[error("bid fully filled")]
    BidFullyFilled = 0x17F1,
    /// 6130 - bad whitelist
    #[error("bad whitelist")]
    BadWhitelist = 0x17F2,
    /// 6131 - forbidden collection
    #[error("forbidden collection")]
    ForbiddenCollection = 0x17F3,
    /// 6132 - bad cosigner
    #[error("bad cosigner")]
    BadCosigner = 0x17F4,
    /// 6133 - bad mint proof
    #[error("bad mint proof")]
    BadMintProof = 0x17F5,
    /// 6134 - Currency mismatch
    #[error("Currency mismatch")]
    CurrencyMismatch = 0x17F6,
    /// 6135 - The bid balance was not emptied
    #[error("The bid balance was not emptied")]
    BidBalanceNotEmptied = 0x17F7,
    /// 6136 - Bad rent dest.
    #[error("Bad rent dest.")]
    BadRentDest = 0x17F8,
    /// 6137 - currency not yet whitelisted
    #[error("currency not yet whitelisted")]
    CurrencyNotYetWhitelisted = 0x17F9,
    /// 6138 - maker broker not yet whitelisted
    #[error("maker broker not yet whitelisted")]
    MakerBrokerNotYetWhitelisted = 0x17FA,
    /// 6139 - token record derivation is wrong
    #[error("token record derivation is wrong")]
    WrongTokenRecordDerivation = 0x17FB,
    /// 6140 - invalid fee account
    #[error("invalid fee account")]
    InvalidFeeAccount = 0x17FC,
    /// 6141 - insufficient remaining accounts
    #[error("insufficient remaining accounts")]
    InsufficientRemainingAccounts = 0x17FD,
}

impl solana_program::program_error::PrintProgramError for TensorMarketplaceError {
    fn print<E>(&self) {
        solana_program::msg!(&self.to_string());
    }
}
