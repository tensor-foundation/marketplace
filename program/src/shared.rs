use anchor_spl::token_interface::TokenAccount;
use tensor_toolbox::{fees, shard_num, TensorError};

use crate::*;

const TOKEN_PROGRAMS: [&str; 2] = [
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
];

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
        // This was deliberately passed in by the client if it was a signer, as the creators will never be signers.
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

pub fn assert_decode_token_account(
    mint: &Pubkey,
    authority: &Pubkey,
    account: &AccountInfo,
) -> Result<TokenAccount> {
    let mut data: &[u8] = &account.try_borrow_data()?;
    let token_account = TokenAccount::try_deserialize(&mut data)?;
    require!(
        token_account.mint == *mint && token_account.owner == *authority,
        TcompError::InvalidTokenAccount
    );
    require!(
        TOKEN_PROGRAMS.contains(&account.owner.to_string().as_str()),
        TcompError::InvalidTokenAccount
    );

    Ok(token_account)
}

/// Asserts that the account is a valid fee account.
pub fn assert_fee_vault(fee_vault_info: &AccountInfo, state_info: &AccountInfo) -> Result<()> {
    let expected_fee_vault = Pubkey::find_program_address(
        &[
            b"fee_vault",
            // Use the last byte of the mint as the fee shard number
            shard_num!(state_info),
        ],
        &fees::ID,
    )
    .0;

    require!(
        fee_vault_info.key == &expected_fee_vault,
        TensorError::InvalidFeeAccount
    );

    Ok(())
}
