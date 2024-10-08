use mpl_token_metadata::types::TokenStandard;
use tensor_toolbox::{
    calc_creators_fee, calc_fees, close_account, is_royalty_enforced, transfer_creators_fee,
    transfer_lamports_checked, transfer_lamports_from_pda, CalcFeesArgs, CreatorFeeMode, Fees,
    FromAcc, TCreator, BROKER_FEE_PCT, MAKER_BROKER_PCT, TAKER_FEE_BPS,
};
use tensorswap::{
    instructions::assert_decode_margin_account as assert_decode_escrow_account,
    program::EscrowProgram,
};

use crate::*;

pub struct TakeBidArgs<'a, 'info> {
    pub bid_state: &'a mut Account<'info, BidState>,
    pub seller: &'a AccountInfo<'info>,
    pub escrow: &'a UncheckedAccount<'info>,
    pub owner: &'a UncheckedAccount<'info>,
    pub rent_destination: &'a UncheckedAccount<'info>,
    pub maker_broker: &'a Option<UncheckedAccount<'info>>,
    pub taker_broker: &'a Option<UncheckedAccount<'info>>,
    pub fee_vault: &'a AccountInfo<'info>,
    pub asset_id: Pubkey,
    pub token_standard: Option<TokenStandard>,
    pub creators: Vec<TCreator>,
    pub min_amount: u64,
    pub optional_royalty_pct: Option<u16>,
    pub seller_fee_basis_points: u16,
    pub creator_accounts: &'a [AccountInfo<'info>],
    pub marketplace_prog: &'a Program<'info, crate::program::MarketplaceProgram>,
    pub escrow_prog: &'a Program<'info, EscrowProgram>,
    pub system_prog: &'a Program<'info, System>,
}

pub fn take_bid_shared(args: TakeBidArgs) -> Result<()> {
    let TakeBidArgs {
        bid_state,
        seller,
        escrow,
        owner,
        rent_destination,
        maker_broker,
        taker_broker,
        fee_vault,
        asset_id,
        token_standard,
        creators,
        min_amount,
        optional_royalty_pct,
        seller_fee_basis_points,
        creator_accounts,
        marketplace_prog,
        escrow_prog,
        system_prog,
    } = args;

    // Verify & increment quantity
    require!(bid_state.can_buy_more(), TcompError::BidFullyFilled);
    bid_state.incr_filled_quantity()?;

    let amount = bid_state.amount;
    let currency = bid_state.currency;
    require!(amount >= min_amount, TcompError::PriceMismatch);

    let Fees {
        protocol_fee: tcomp_fee,
        maker_broker_fee,
        taker_broker_fee,
        ..
    } = calc_fees(CalcFeesArgs {
        amount,
        tnsr_discount: false,
        total_fee_bps: TAKER_FEE_BPS,
        broker_fee_pct: BROKER_FEE_PCT,
        maker_broker_pct: MAKER_BROKER_PCT,
    })?;

    let creator_fee = calc_creators_fee(
        seller_fee_basis_points,
        amount,
        if is_royalty_enforced(token_standard) {
            Some(100)
        } else {
            optional_royalty_pct
        },
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
        marketplace_prog,
        TcompSigner::Bid(bid_state),
    )?;

    // --------------------------------------- sol transfers

    //if escrow is used, move money into bid first
    if let Some(escrow_pubkey) = bid_state.margin {
        let decoded_escrow_account = assert_decode_escrow_account(escrow, owner)?;
        //doesn't hurt to check again (even though we checked when bidding)
        require!(
            decoded_escrow_account.owner == *owner.key,
            TcompError::BadMargin
        );
        require!(*escrow.key == escrow_pubkey, TcompError::BadMargin);
        tensorswap::cpi::withdraw_margin_account_cpi_tcomp(
            CpiContext::new(
                escrow_prog.to_account_info(),
                tensorswap::cpi::accounts::WithdrawMarginAccountCpiTcomp {
                    margin_account: escrow.to_account_info(),
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
    transfer_lamports_from_pda(bid_state.deref().as_ref(), fee_vault, tcomp_fee)?;

    transfer_lamports_checked(
        bid_state.deref().as_ref(),
        maker_broker.as_deref().unwrap_or(fee_vault),
        maker_broker_fee,
    )?;

    transfer_lamports_checked(
        bid_state.deref().as_ref(),
        taker_broker.as_deref().unwrap_or(fee_vault),
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
        // If fully filled, we want to close the bid even if it has some excess balance.
        // This prevents someone from sending lamports to the bid and preventing it from being closed.
        // We send excess balance back to the owner and rent to the rent destination.
        let excess_balance = BidState::bid_balance(bid_state)?;
        if excess_balance > 0 {
            // If owner account is not rent-exempt we skip and the excess funds go to the rent destination.
            transfer_lamports_checked(bid_state.deref().as_ref(), owner, excess_balance)?;
        }

        close_account(
            &mut bid_state.to_account_info(),
            &mut rent_destination.to_account_info(),
        )?;
    }

    Ok(())
}
