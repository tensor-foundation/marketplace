//! Validations for accounts.
#![allow(clippy::all)]

use anchor_lang::prelude::*;

/// Validates the contents of a variable. Generally used for [Accounts] structs and struct members.
pub trait Validate<'info> {
    /// Validates the account struct.
    fn validate(&self) -> Result<()>;
}
