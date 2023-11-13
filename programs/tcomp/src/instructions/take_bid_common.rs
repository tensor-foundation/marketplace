use anchor_spl::token::Mint;
use mpl_token_metadata::state::TokenStandard;
use tensor_whitelist::MintProof;
use tensorswap::assert_decode_margin_account;

use crate::*;

pub struct TakeBidArgs<'a, 'info> {
    pub bid_state: &'a mut Account<'info, BidState>,
    pub seller: &'a AccountInfo<'info>,
    pub margin_account: &'a UncheckedAccount<'info>,
    pub owner: &'a UncheckedAccount<'info>,
    pub taker_broker: &'a UncheckedAccount<'info>,
    pub tcomp: &'a AccountInfo<'info>,
    pub asset_id: Pubkey,
    pub token_standard: Option<TokenStandard>,
    pub creators: Vec<TCreator>,
    pub min_amount: u64,
    pub optional_royalty_pct: Option<u16>,
    pub seller_fee_basis_points: u16,
    pub creator_accounts: &'a [AccountInfo<'info>],
    pub tcomp_prog: &'a Program<'info, crate::program::Tcomp>,
    pub tswap_prog: &'a Program<'info, Tensorswap>,
    pub system_prog: &'a Program<'info, System>,
}

pub fn take_bid_shared(args: TakeBidArgs) -> Result<()> {
    let TakeBidArgs {
        bid_state,
        seller,
        margin_account,
        owner,
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

    let (tcomp_fee, broker_fee) = calc_fees(amount, TCOMP_FEE_BPS, TAKER_BROKER_PCT)?;
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
            taker_broker_fee: broker_fee,
            //TODO: maker broker disabled
            maker_broker_fee: 0,
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
        let margin_account_info = &margin_account.to_account_info();
        let margin_account =
            assert_decode_margin_account(margin_account_info, &owner.to_account_info())?;
        //doesn't hurt to check again (even though we checked when bidding)
        require!(margin_account.owner == *owner.key, TcompError::BadMargin);
        require!(*margin_account_info.key == margin, TcompError::BadMargin);
        tensorswap::cpi::withdraw_margin_account_cpi_tcomp(
            CpiContext::new(
                tswap_prog.to_account_info(),
                tensorswap::cpi::accounts::WithdrawMarginAccountCpiTcomp {
                    margin_account: margin_account_info.clone(),
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
    transfer_lamports_from_pda(
        &bid_state.to_account_info(),
        &tcomp.to_account_info(),
        tcomp_fee,
    )?;

    transfer_lamports_from_pda(
        &bid_state.to_account_info(),
        &taker_broker.to_account_info(),
        broker_fee,
    )?;

    // Pay creators
    let actual_creator_fee = transfer_creators_fee(
        &FromAcc::Pda(&bid_state.to_account_info()),
        &creators,
        &mut creator_accounts.iter(),
        creator_fee,
    )?;

    // Pay the seller
    transfer_lamports_from_pda(
        &bid_state.to_account_info(),
        &seller.to_account_info(),
        unwrap_checked!({
            amount
                .checked_sub(tcomp_fee)?
                .checked_sub(broker_fee)?
                .checked_sub(actual_creator_fee)
        }),
    )?;

    // --------------------------------------- close

    // Close account if fully filled
    if bid_state.quantity_left() == Ok(0) {
        close_account(
            &mut bid_state.to_account_info(),
            &mut owner.to_account_info(),
        )?;
    }

    Ok(())
}

#[inline(never)]
pub fn assert_decode_mint_proof<'info>(
    whitelist: &Account<'info, Whitelist>,
    nft_mint: &Account<'info, Mint>,
    mint_proof: &UncheckedAccount<'info>,
) -> Result<Account<'info, MintProof>> {
    let program_id = &tensor_whitelist::id();
    let (key, _) = Pubkey::find_program_address(
        &[
            b"mint_proof".as_ref(),
            nft_mint.key().as_ref(),
            whitelist.key().as_ref(),
        ],
        program_id,
    );
    if key != *mint_proof.to_account_info().key {
        throw_err!(TcompError::BadMintProof);
    }
    // Check program owner (redundant because of find_program_address above, but why not).
    if *mint_proof.owner != *program_id {
        throw_err!(TcompError::BadMintProof);
    }

    Account::try_from(&mint_proof.to_account_info())
}
