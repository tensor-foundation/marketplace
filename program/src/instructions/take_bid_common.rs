use anchor_spl::token_interface::Mint;
use mpl_token_metadata::types::TokenStandard;
use tensor_toolbox::{
    calc_creators_fee, calc_fees, close_account, transfer_creators_fee, transfer_lamports_from_pda,
    CreatorFeeMode, FromAcc, TCreator,
};
use tensor_whitelist::MintProof;
use tensorswap::{instructions::assert_decode_margin_account, program::EscrowProgram};

use crate::*;

pub struct TakeBidArgs<'a, 'info> {
    pub bid_state: &'a mut Account<'info, BidState>,
    pub seller: &'a AccountInfo<'info>,
    pub margin_account: &'a UncheckedAccount<'info>,
    pub owner: &'a UncheckedAccount<'info>,
    pub rent_dest: &'a UncheckedAccount<'info>,
    pub maker_broker: &'a Option<UncheckedAccount<'info>>,
    pub taker_broker: &'a Option<UncheckedAccount<'info>>,
    pub tcomp: &'a AccountInfo<'info>,
    pub asset_id: Pubkey,
    pub token_standard: Option<TokenStandard>,
    pub creators: Vec<TCreator>,
    pub min_amount: u64,
    pub optional_royalty_pct: Option<u16>,
    pub seller_fee_basis_points: u16,
    pub creator_accounts: &'a [AccountInfo<'info>],
    pub tcomp_prog: &'a Program<'info, crate::program::MarketplaceProgram>,
    pub tswap_prog: &'a Program<'info, EscrowProgram>,
    pub system_prog: &'a Program<'info, System>,
}

pub fn take_bid_shared(args: TakeBidArgs) -> Result<()> {
    let TakeBidArgs {
        bid_state,
        seller,
        margin_account,
        owner,
        rent_dest,
        maker_broker,
        taker_broker,
        tcomp,
        asset_id,
        token_standard,
        creators,
        min_amount,
        optional_royalty_pct,
        seller_fee_basis_points,
        creator_accounts,
        tcomp_prog,
        tswap_prog,
        system_prog,
    } = args;

    // Verify & increment quantity
    require!(bid_state.can_buy_more(), TcompError::BidFullyFilled);
    bid_state.incr_filled_quantity()?;

    let amount = bid_state.amount;
    let currency = bid_state.currency;
    require!(amount >= min_amount, TcompError::PriceMismatch);

    let (tcomp_fee, maker_broker_fee, taker_broker_fee) = calc_fees(
        amount,
        TCOMP_FEE_BPS,
        MAKER_BROKER_PCT,
        maker_broker.as_ref().map(|acc| acc.key()),
        taker_broker.as_ref().map(|acc| acc.key()),
    )?;
    let creator_fee = calc_creators_fee(
        seller_fee_basis_points,
        amount,
        token_standard,
        optional_royalty_pct,
    )?;

    record_event(
        &TcompEvent::Taker(TakeEvent {
            taker: *seller.key,
            bid_id: Some(bid_state.bid_id),
            target: bid_state.target.clone(),
            target_id: bid_state.target_id,
            field: bid_state.field.clone(),
            field_id: bid_state.field_id,
            amount,
            tcomp_fee,
            quantity: bid_state.quantity_left()?,
            taker_broker_fee,
            maker_broker_fee,
            creator_fee, // Can't record actual because we transfer lamports after we send noop tx
            currency,
            asset_id: Some(asset_id),
        }),
        tcomp_prog,
        TcompSigner::Bid(bid_state),
    )?;

    // --------------------------------------- sol transfers

    // TODO: handle currency (not v1)

    //if margin is used, move money into bid first
    if let Some(margin) = bid_state.margin {
        let decoded_margin_account = assert_decode_margin_account(margin_account, owner)?;
        //doesn't hurt to check again (even though we checked when bidding)
        require!(
            decoded_margin_account.owner == *owner.key,
            TcompError::BadMargin
        );
        require!(*margin_account.key == margin, TcompError::BadMargin);
        tensorswap::cpi::withdraw_margin_account_cpi_tcomp(
            CpiContext::new(
                tswap_prog.to_account_info(),
                tensorswap::cpi::accounts::WithdrawMarginAccountCpiTcomp {
                    margin_account: margin_account.to_account_info(),
                    bid_state: bid_state.to_account_info(),
                    owner: owner.to_account_info(),
                    //transfer to bid state
                    destination: bid_state.to_account_info(),
                    system_program: system_prog.to_account_info(),
                },
            )
            .with_signer(&[&bid_state.seeds()]),
            //passing these in coz we're not deserializing the account tswap side
            bid_state.bump[0],
            bid_state.bid_id,
            //full amount, which later will be split into fees / royalties (seller pays)
            amount,
        )?;
    }

    // Pay fees
    transfer_lamports_from_pda(bid_state.deref().as_ref(), tcomp, tcomp_fee)?;

    transfer_lamports_from_pda_min_balance(
        bid_state.deref().as_ref(),
        maker_broker.as_deref().unwrap_or(tcomp),
        maker_broker_fee,
    )?;

    transfer_lamports_from_pda_min_balance(
        bid_state.deref().as_ref(),
        taker_broker.as_deref().unwrap_or(tcomp),
        taker_broker_fee,
    )?;

    // Pay creators
    let actual_creator_fee = transfer_creators_fee(
        &creators,
        &mut creator_accounts.iter(),
        creator_fee,
        &CreatorFeeMode::Sol {
            from: &FromAcc::Pda(bid_state.deref().as_ref()),
        },
    )?;

    // Pay the seller
    transfer_lamports_from_pda(
        bid_state.deref().as_ref(),
        seller,
        unwrap_checked!({
            amount
                .checked_sub(tcomp_fee)?
                .checked_sub(maker_broker_fee)?
                .checked_sub(taker_broker_fee)?
                .checked_sub(actual_creator_fee)
        }),
    )?;

    // --------------------------------------- close

    // Close account if fully filled
    if bid_state.quantity_left() == Ok(0) {
        BidState::verify_empty_balance(bid_state)?;
        close_account(
            &mut bid_state.to_account_info(),
            &mut rent_dest.to_account_info(),
        )?;
    }

    Ok(())
}

/// transfers lamports, skipping the transfer if not rent exempt
fn transfer_lamports_from_pda_min_balance<'info>(
    from_pda: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    lamports: u64,
) -> Result<()> {
    let rent = Rent::get()?.minimum_balance(to.data_len());
    if unwrap_int!(to.lamports().checked_add(lamports)) < rent {
        //skip current creator, we can't pay them
        return Ok(());
    }
    transfer_lamports_from_pda(from_pda, to, lamports)?;
    Ok(())
}

#[inline(never)]
pub fn assert_decode_mint_proof<'info>(
    whitelist_pubkey: &Pubkey,
    nft_mint: &InterfaceAccount<'info, Mint>,
    mint_proof: &UncheckedAccount<'info>,
) -> Result<MintProof> {
    let program_id = &tensor_whitelist::id();
    let (key, _) = Pubkey::find_program_address(
        &[
            b"mint_proof".as_ref(),
            nft_mint.key().as_ref(),
            whitelist_pubkey.as_ref(),
        ],
        program_id,
    );
    if key != mint_proof.key() {
        throw_err!(TcompError::BadMintProof);
    }
    // Check program owner (redundant because of find_program_address above, but why not).
    if *mint_proof.owner != *program_id {
        throw_err!(TcompError::BadMintProof);
    }

    let mut data: &[u8] = &mint_proof.try_borrow_data()?;
    let mint_proof: MintProof = AccountDeserialize::try_deserialize(&mut data)?;
    Ok(mint_proof)
}