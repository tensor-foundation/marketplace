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
