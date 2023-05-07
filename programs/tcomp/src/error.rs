use crate::*;

#[error_code]
pub enum TcompError {
    // Start at 100 so we don't conflict with bubblegum + compression error codes.
    #[msg("arithmetic error")]
    ArithmeticError = 100,
    #[msg("expiry too large")]
    ExpiryTooLarge = 101,
    #[msg("bad owner")]
    BadOwner = 102,
    #[msg("bad list state")]
    BadListState = 103,
    #[msg("royalties pct must be between 0 and 100")]
    BadRoyaltiesPct = 104,
    #[msg("price mismatch")]
    PriceMismatch = 105,
    #[msg("creator mismatch")]
    CreatorMismatch = 106,
    #[msg("insufficient balance")]
    InsufficientBalance = 107,
    #[msg("bid has expired")]
    BidExpired = 108,
    #[msg("taker not allowed")]
    TakerNotAllowed = 109,
    #[msg("cannot pass bid field")]
    BadBidField = 110,
    #[msg("bid not yet expired")]
    BidNotYetExpired = 111,
    #[msg("bad margin")]
    BadMargin = 112,
    #[msg("wrong ix for bid target called")]
    WrongIxForBidTarget = 113,
    #[msg("wrong target id")]
    WrongTargetId = 114,
    #[msg("creator array missing first verified creator")]
    MissingFvc = 115,
    #[msg("metadata missing collection")]
    MissingCollection = 116,
    #[msg("cannot modify bid target, create a new bid")]
    CannotModifyTarget = 117,
    #[msg("target id and bid id must be the same for single bids")]
    TargetIdMustEqualBidId = 118,
    #[msg("currency not yet enabled")]
    CurrencyNotYetEnabled = 119,
    #[msg("maker broker not yet enabled")]
    MakerBrokerNotYetEnabled = 120,
    #[msg("optional royalties not yet enabled")]
    OptionalRoyaltiesNotYetEnabled = 121,
    #[msg("wrong state version")]
    WrongStateVersion = 122,
    #[msg("wrong field id")]
    WrongBidFieldId = 123,
    #[msg("broker mismatch")]
    BrokerMismatch = 124,
    #[msg("asset id mismatch")]
    AssetIdMismatch = 125,
    #[msg("listing has expired")]
    ListingExpired = 126,
    #[msg("listing not yet expired")]
    ListingNotYetExpired = 127,
}
