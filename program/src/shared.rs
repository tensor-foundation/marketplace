use anchor_spl::{
    associated_token::{create_idempotent, get_associated_token_address_with_program_id},
    token_interface::TokenAccount,
};
use tensor_toolbox::{fees, shard_num, TensorError};

use crate::*;
pub const TNSR_CURRENCY: &str = "TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6";

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
    if list_state.cosigner != Pubkey::default() {
        let signer = maybe_cosigner.as_ref().ok_or(TcompError::BadCosigner)?;

        require!(list_state.cosigner == *signer.key, TcompError::BadCosigner);
    }

    Ok(maybe_remaining)
}

pub fn assert_expiry(expire_in_sec: Option<u64>, current_expiry: Option<i64>) -> Result<i64> {
    Ok(match expire_in_sec {
        Some(expire_in_sec) => {
            let expire_in_i64 =
                i64::try_from(expire_in_sec).map_err(|_| TcompError::ExpiryTooLarge)?;
            require!(expire_in_i64 <= MAX_EXPIRY_SEC, TcompError::ExpiryTooLarge);
            Clock::get()?
                .unix_timestamp
                .checked_add(expire_in_i64)
                .ok_or(TcompError::ExpiryTooLarge)?
        }
        None => current_expiry.unwrap_or(
            Clock::get()?
                .unix_timestamp
                .checked_add(MAX_EXPIRY_SEC)
                .ok_or(TcompError::ExpiryTooLarge)?,
        ),
    })
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

/// Asserts the seeds derivation of the fee vault account.
pub fn assert_fee_vault_seeds(
    fee_vault_info: &AccountInfo,
    state_info: &AccountInfo,
) -> Result<()> {
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

/// Asserts the seeds derivation of the list state account.
pub fn assert_list_state_seeds(
    list_state_info: &AccountInfo,
    mint_info: &AccountInfo,
) -> Result<()> {
    let expected_list_state = Pubkey::find_program_address(
        &[b"list_state".as_ref(), mint_info.key().as_ref()],
        &crate::ID,
    )
    .0;

    require!(
        list_state_info.key == &expected_list_state,
        TcompError::BadListState
    );

    Ok(())
}

/// Asserts that the given token account belongs to the provided mint, owner and token_program..
pub fn assert_token_account(
    token_account_info: &AccountInfo,
    mint: &Pubkey,
    owner: &Pubkey,
    token_program: &Pubkey,
) -> Result<()> {
    require!(
        token_account_info.owner == token_program,
        TcompError::InvalidTokenAccount
    );

    let mut data: &[u8] = &token_account_info.try_borrow_data()?;
    let token_account = TokenAccount::try_deserialize(&mut data)?;

    require!(
        token_account.mint == *mint && token_account.owner == *owner,
        TcompError::InvalidTokenAccount
    );
    Ok(())
}

/// Asserts that the given token account belongs to the provided mint, owner and token_program and is the derived
/// associated token account for the given owner and mint.
pub fn assert_associated_token_account(
    token_account_info: &AccountInfo,
    mint: &Pubkey,
    owner: &Pubkey,
    token_program: &Pubkey,
) -> Result<()> {
    let expected_ata = get_associated_token_address_with_program_id(owner, mint, token_program);
    require!(
        expected_ata == *token_account_info.key,
        TcompError::InvalidTokenAccount
    );

    assert_token_account(token_account_info, mint, owner, token_program)
}

pub struct InitIfNeededAtaParams<'info> {
    pub ata: AccountInfo<'info>,
    pub payer: AccountInfo<'info>,
    pub owner: AccountInfo<'info>,
    pub mint: AccountInfo<'info>,
    pub associated_token_program: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
}

pub fn init_if_needed_ata(params: InitIfNeededAtaParams) -> Result<()> {
    let InitIfNeededAtaParams {
        ata,
        payer,
        owner,
        mint,
        associated_token_program,
        token_program,
        system_program,
    } = params;
    let expected_ata =
        get_associated_token_address_with_program_id(owner.key, mint.key, token_program.key);
    require!(expected_ata == *ata.key, TcompError::InvalidTokenAccount);

    let ctx = CpiContext::new(
        associated_token_program,
        Create {
            payer,
            associated_token: ata,
            authority: owner,
            mint,
            system_program,
            token_program,
        },
    );

    create_idempotent(ctx)
}
