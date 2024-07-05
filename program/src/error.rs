use crate::*;

#[error_code]
pub enum TcompError {
    // Start at 7000 so we don't conflict with bubblegum & compression error codes.
    #[msg("arithmetic error")]
    ArithmeticError = 7000,

    #[msg("expiry too large")]
    ExpiryTooLarge = 7001,

    #[msg("bad owner")]
    BadOwner = 7002,

    #[msg("bad list state")]
    BadListState = 7003,

    #[msg("royalties pct must be between 0 and 100")]
    BadRoyaltiesPct = 7004,

    #[msg("price mismatch")]
    PriceMismatch = 7005,

    #[msg("creator mismatch")]
    CreatorMismatch = 7006,

    #[msg("insufficient balance")]
    InsufficientBalance = 7007,

    #[msg("bid has expired")]
    BidExpired = 7008,

    #[msg("taker not allowed")]
    TakerNotAllowed = 7009,

    #[msg("cannot pass bid field")]
    BadBidField = 7010,

    #[msg("bid not yet expired")]
    BidNotYetExpired = 7011,

    #[msg("bad margin")]
    BadMargin = 7012,

    #[msg("wrong ix for bid target called")]
    WrongIxForBidTarget = 7013,

    #[msg("wrong target id")]
    WrongTargetId = 7014,

    #[msg("creator array missing first verified creator")]
    MissingFvc = 7015,

    #[msg("metadata missing collection")]
    MissingCollection = 7016,

    #[msg("cannot modify bid target, create a new bid")]
    CannotModifyTarget = 7017,

    #[msg("target id and bid id must be the same for single bids")]
    TargetIdMustEqualBidId = 7018,

    #[msg("currency not yet enabled")]
    CurrencyNotYetEnabled = 7019,

    #[msg("maker broker not yet enabled")]
    MakerBrokerNotYetEnabled = 7020,

    #[msg("optional royalties not yet enabled")]
    OptionalRoyaltiesNotYetEnabled = 7021,

    #[msg("wrong state version")]
    WrongStateVersion = 7022,

    #[msg("wrong field id")]
    WrongBidFieldId = 7023,

    #[msg("broker mismatch")]
    BrokerMismatch = 7024,

    #[msg("asset id mismatch")]
    AssetIdMismatch = 7025,

    #[msg("listing has expired")]
    ListingExpired = 7026,

    #[msg("listing not yet expired")]
    ListingNotYetExpired = 7027,

    #[msg("bad quantity passed in")]
    BadQuantity = 7028,

    #[msg("bid fully filled")]
    BidFullyFilled = 7029,

    #[msg("bad whitelist")]
    BadWhitelist = 7030,

    #[msg("forbidden collection")]
    ForbiddenCollection = 7031,

    #[msg("bad cosigner")]
    BadCosigner = 7032,

    #[msg("bad mint proof")]
    BadMintProof = 7033,

    #[msg("Currency mismatch")]
    CurrencyMismatch = 7034,

    #[msg("The bid balance was not emptied")]
    BidBalanceNotEmptied = 7035,

    #[msg("Bad rent dest.")]
    BadRentDest = 7036,

    #[msg("currency not yet whitelisted")]
    CurrencyNotYetWhitelisted = 7037,

    #[msg("maker broker not yet whitelisted")]
    MakerBrokerNotYetWhitelisted = 7038,

    #[msg("token record derivation is wrong")]
    WrongTokenRecordDerivation = 7039,

    #[msg("invalid fee account")]
    InvalidFeeAccount = 7040,

    #[msg("insufficient remaining accounts")]
    InsufficientRemainingAccounts = 7041,

    #[msg("missing broker account")]
    MissingBroker = 7042,

    #[msg("missing broker token account")]
    MissingBrokerTokenAccount = 7043,

    #[msg("invalidtoken account")]
    InvalidTokenAccount = 7044,
}
