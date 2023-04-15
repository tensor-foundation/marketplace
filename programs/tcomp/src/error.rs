use crate::*;

#[error_code]
pub enum TcompError {
    #[msg("arithmetic error")]
    ArithmeticError = 0,
    #[msg("expiry too large")]
    ExpiryTooLarge = 1,
    #[msg("bad owner")]
    BadOwner = 2,
    #[msg("bad list state")]
    BadListState = 3,
    #[msg("royalties pct must be between 0 and 99")]
    BadRoyaltiesPct = 4,
    #[msg("price mismatch")]
    PriceMismatch = 5,
    #[msg("creator mismatch")]
    CreatorMismatch = 6,
    #[msg("insufficient balance")]
    InsufficientBalance = 7,
}
