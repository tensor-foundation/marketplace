use tensor_toolbox::{fees, shard_num};

use crate::*;

pub(crate) enum TcompSigner<'a, 'info> {
    Bid(&'a Account<'info, BidState>),
    List(&'a Account<'info, ListState>),
}

pub fn find_neutral_broker() -> (Pubkey, u8) {
    Pubkey::find_program_address(&[], &crate::ID)
}

pub fn maker_broker_is_whitelisted(maker_broker: Option<Pubkey>) -> bool {
    maker_broker.is_none() || maker_broker == Some(tensor_toolbox::gameshift::ID)
}

/// Asserts that the account is a valid fee account: either the tcomp singleton or the fee vault.
pub fn assert_fee_account(
    fee_account_info: &AccountInfo,
    state_account_info: &AccountInfo,
) -> Result<()> {
    let tcomp_singleton = Pubkey::find_program_address(&[], &crate::ID).0;
    let fee_vault = Pubkey::find_program_address(
        &[
            b"fee_vault",
            // Use the last byte of the mint as the fee shard number
            shard_num!(state_account_info),
        ],
        &fees::ID,
    )
    .0;

    require!(
        fee_account_info.key == &tcomp_singleton || fee_account_info.key == &fee_vault,
        TcompError::InvalidFeeAccount
    );

    Ok(())
}

/// Checks if cosigner is deliberately passed in or if it should be a remaining account instead.
/// Used whenever an optional cosigner account was added to an instruction with remaining accounts
/// to avoid breaking changes. Validates the cosigner account against if one is expected and returns an Option storing
/// the remaining account to be added to the remaining acounts array, if applicable.
pub fn validate_cosigner<'info>(
    cosigner: &Option<UncheckedAccount<'info>>,
    list_state: &ListState,
) -> Result<Option<AccountInfo<'info>>> {
    // If an account is at the cosigner position we need to check if it was deliberately passed in by the client or if it's
    // actually a remaining account sent by an old client.
    let (maybe_cosigner, maybe_remaining) = if let Some(account) = cosigner {
        // This was deliberately passed in by the client if it was a signer as the creators will never be signers.
        // If it's the crate it will be a `None` variant on the Option.
        if account.is_signer {
            // all the remaining accounts are there
            (Some(account.to_account_info()), None)
        } else {
            // We have a cosigner account but it's not a signer or the crate id so it must be a remaining account.
            (None, Some(account.to_account_info()))
        }
    } else {
        (None, None)
    };

    // check if the cosigner is required
    if let Some(cosigner) = list_state.cosigner.value() {
        let signer = maybe_cosigner.as_ref().ok_or(TcompError::BadCosigner)?;

        require!(cosigner == signer.key, TcompError::BadCosigner);
    }

    Ok(maybe_remaining)
}
