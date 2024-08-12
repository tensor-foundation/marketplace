use crate::*;

#[error_code]
pub enum TcompError {
    // Start at 6100 so we don't conflict with bubblegum & compression error codes.
    // Anchor adds 6000 to all error codes, so we start at 100.
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

    #[msg("bad quantity passed in")]
    BadQuantity = 128,

    #[msg("bid fully filled")]
    BidFullyFilled = 129,

    #[msg("bad whitelist")]
    BadWhitelist = 130,

    #[msg("forbidden collection")]
    ForbiddenCollection = 131,

    #[msg("bad cosigner")]
    BadCosigner = 132,

    #[msg("bad mint proof")]
    BadMintProof = 133,

    #[msg("Currency mismatch")]
    CurrencyMismatch = 134,

    #[msg("The bid balance was not emptied")]
    BidBalanceNotEmptied = 135,

    #[msg("Bad rent dest.")]
    BadRentDest = 136,

    #[msg("currency not yet whitelisted")]
    CurrencyNotYetWhitelisted = 137,

    #[msg("maker broker not yet whitelisted")]
    MakerBrokerNotYetWhitelisted = 138,

    #[msg("token record derivation is wrong")]
    WrongTokenRecordDerivation = 139,

    #[msg("invalid fee account")]
    InvalidFeeAccount = 140,

    #[msg("insufficient remaining accounts")]
    InsufficientRemainingAccounts = 141,

    #[msg("missing broker account")]
    MissingBroker = 142,

    #[msg("missing broker token account")]
    MissingBrokerTokenAccount = 143,

    #[msg("invalidtoken account")]
    InvalidTokenAccount = 144,

    #[msg("missing creator ATA")]
    MissingCreatorATA = 145,
}
