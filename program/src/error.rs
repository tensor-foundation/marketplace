use crate::*;

#[error_code]
pub enum TcompError {
    // Start at 7000 so we don't conflict with bubblegum & compression error codes.
    // Anchor adds 6000 to all error codes, so we start at 1000.
    #[msg("arithmetic error")]
    ArithmeticError = 1000,

    #[msg("expiry too large")]
    ExpiryTooLarge = 1001,

    #[msg("bad owner")]
    BadOwner = 1002,

    #[msg("bad list state")]
    BadListState = 1003,

    #[msg("royalties pct must be between 0 and 100")]
    BadRoyaltiesPct = 1004,

    #[msg("price mismatch")]
    PriceMismatch = 1005,

    #[msg("creator mismatch")]
    CreatorMismatch = 1006,

    #[msg("insufficient balance")]
    InsufficientBalance = 1007,

    #[msg("bid has expired")]
    BidExpired = 1008,

    #[msg("taker not allowed")]
    TakerNotAllowed = 1009,

    #[msg("cannot pass bid field")]
    BadBidField = 1010,

    #[msg("bid not yet expired")]
    BidNotYetExpired = 1011,

    #[msg("bad margin")]
    BadMargin = 1012,

    #[msg("wrong ix for bid target called")]
    WrongIxForBidTarget = 1013,

    #[msg("wrong target id")]
    WrongTargetId = 1014,

    #[msg("creator array missing first verified creator")]
    MissingFvc = 1015,

    #[msg("metadata missing collection")]
    MissingCollection = 1016,

    #[msg("cannot modify bid target, create a new bid")]
    CannotModifyTarget = 1017,

    #[msg("target id and bid id must be the same for single bids")]
    TargetIdMustEqualBidId = 1018,

    #[msg("currency not yet enabled")]
    CurrencyNotYetEnabled = 1019,

    #[msg("maker broker not yet enabled")]
    MakerBrokerNotYetEnabled = 1020,

    #[msg("optional royalties not yet enabled")]
    OptionalRoyaltiesNotYetEnabled = 1021,

    #[msg("wrong state version")]
    WrongStateVersion = 1022,

    #[msg("wrong field id")]
    WrongBidFieldId = 1023,

    #[msg("broker mismatch")]
    BrokerMismatch = 1024,

    #[msg("asset id mismatch")]
    AssetIdMismatch = 1025,

    #[msg("listing has expired")]
    ListingExpired = 1026,

    #[msg("listing not yet expired")]
    ListingNotYetExpired = 1027,

    #[msg("bad quantity passed in")]
    BadQuantity = 1028,

    #[msg("bid fully filled")]
    BidFullyFilled = 1029,

    #[msg("bad whitelist")]
    BadWhitelist = 1030,

    #[msg("forbidden collection")]
    ForbiddenCollection = 1031,

    #[msg("bad cosigner")]
    BadCosigner = 1032,

    #[msg("bad mint proof")]
    BadMintProof = 1033,

    #[msg("Currency mismatch")]
    CurrencyMismatch = 1034,

    #[msg("The bid balance was not emptied")]
    BidBalanceNotEmptied = 1035,

    #[msg("Bad rent dest.")]
    BadRentDest = 1036,

    #[msg("currency not yet whitelisted")]
    CurrencyNotYetWhitelisted = 1037,

    #[msg("maker broker not yet whitelisted")]
    MakerBrokerNotYetWhitelisted = 1038,

    #[msg("token record derivation is wrong")]
    WrongTokenRecordDerivation = 1039,

    #[msg("invalid fee account")]
    InvalidFeeAccount = 1040,

    #[msg("insufficient remaining accounts")]
    InsufficientRemainingAccounts = 1041,

    #[msg("missing broker account")]
    MissingBroker = 1042,

    #[msg("missing broker token account")]
    MissingBrokerTokenAccount = 1043,

    #[msg("invalidtoken account")]
    InvalidTokenAccount = 1044,
}
