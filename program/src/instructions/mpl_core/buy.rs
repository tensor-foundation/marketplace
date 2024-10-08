use anchor_lang::solana_program::{program::invoke, system_instruction};
use metaplex_core::{instructions::TransferV1CpiBuilder, types::Royalties};
use mpl_token_metadata::types::TokenStandard;
use tensor_toolbox::{
    assert_fee_account, calc_creators_fee, calc_fees,
    metaplex_core::{validate_asset, MetaplexCore},
    transfer_creators_fee, transfer_lamports_from_pda, CalcFeesArgs, CreatorFeeMode, Fees, FromAcc,
    FromExternal, BROKER_FEE_PCT, MAKER_BROKER_PCT, TAKER_FEE_BPS,
};

use crate::*;

use self::program::MarketplaceProgram;

#[derive(Accounts)]
pub struct BuyCore<'info> {
    /// CHECK: Checked in assert_fee_account() in validate().
    #[account(mut)]
    pub fee_vault: UncheckedAccount<'info>,

    #[account(mut, close = rent_destination,
        seeds=[
            b"list_state".as_ref(),
            asset.key.as_ref(),
        ],
        bump = list_state.bump[0],
        has_one = owner,
        constraint = list_state.currency.is_none() @ TcompError::CurrencyMismatch,
    )]
    pub list_state: Box<Account<'info, ListState>>,

    /// CHECK: validated on instruction handler
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,

    /// CHECK: validated on instruction handler
    pub collection: Option<UncheckedAccount<'info>>,

    /// CHECK: doesnt matter, but this lets you pass in a 3rd party received address
    pub buyer: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    // Owner needs to be passed in as mutable account, so we reassign lamports back to them
    /// CHECK: has_one = owner on list_state
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,

    /// CHECK: none, can be anything
    #[account(mut)]
    pub taker_broker: Option<UncheckedAccount<'info>>,

    /// CHECK: checked in validate()
    #[account(mut)]
    pub maker_broker: Option<UncheckedAccount<'info>>,

    /// CHECK: list_state.get_rent_payer()
    #[account(mut,
        constraint = rent_destination.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,

    pub mpl_core_program: Program<'info, MetaplexCore>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,

    // cosigner is checked in handler: validate_cosigner()
    pub cosigner: Option<UncheckedAccount<'info>>,
    // Remaining accounts:
    // 1. creators (1-5)
}

impl<'info> BuyCore<'info> {
    fn transfer_lamports(&self, to: &AccountInfo<'info>, lamports: u64) -> Result<()> {
        // Handle buyers that have non-zero data and cannot use system transfer.
        if !self.payer.data_is_empty() {
            return transfer_lamports_from_pda(&self.payer.to_account_info(), to, lamports);
        }

        invoke(
            &system_instruction::transfer(self.payer.key, to.key, lamports),
            &[
                self.payer.to_account_info(),
                to.clone(),
                self.system_program.to_account_info(),
            ],
        )
        .map_err(Into::into)
    }

    /// transfers lamports, skipping the transfer if not rent exempt
    fn transfer_lamports_min_balance(&self, to: &AccountInfo<'info>, lamports: u64) -> Result<()> {
        let rent = Rent::get()?.minimum_balance(to.data_len());
        if unwrap_int!(to.lamports().checked_add(lamports)) < rent {
            //skip current creator, we can't pay them
            return Ok(());
        }
        self.transfer_lamports(to, lamports)?;
        Ok(())
    }
}

impl<'info> Validate<'info> for BuyCore<'info> {
    fn validate(&self) -> Result<()> {
        assert_fee_account(
            &self.fee_vault.to_account_info(),
            &self.list_state.to_account_info(),
        )?;

        let list_state = &self.list_state;

        require!(
            list_state.version == CURRENT_TCOMP_VERSION,
            TcompError::WrongStateVersion
        );

        require!(
            list_state.expiry >= Clock::get()?.unix_timestamp,
            TcompError::ListingExpired
        );

        if let Some(private_taker) = list_state.private_taker {
            require!(
                private_taker == self.buyer.key(),
                TcompError::TakerNotAllowed
            );
        }

        require!(
            list_state.maker_broker == self.maker_broker.as_ref().map(|acc| acc.key()),
            TcompError::BrokerMismatch
        );

        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn process_buy_core<'info, 'b>(
    ctx: Context<'_, 'b, '_, 'info, BuyCore<'info>>,
    max_amount: u64,
) -> Result<()> {
    let list_state = &ctx.accounts.list_state;

    // In case we have an extra remaining account.
    let mut v = Vec::with_capacity(ctx.remaining_accounts.len() + 1);

    // Validate the cosigner and fetch additional remaining account if it exists.
    // Cosigner could be a remaining account from an old client.
    let remaining_accounts =
        if let Some(remaining_account) = validate_cosigner(&ctx.accounts.cosigner, list_state)? {
            v.push(remaining_account);
            v.extend_from_slice(ctx.remaining_accounts);
            v.as_slice()
        } else {
            ctx.remaining_accounts
        };

    // validate the asset account
    let royalties = validate_asset(
        &ctx.accounts.asset,
        ctx.accounts.collection.as_ref().map(|c| c.as_ref()),
    )?;
    let (royalty_fee, _) = if let Some(Royalties { basis_points, .. }) = royalties {
        (basis_points, TokenStandard::ProgrammableNonFungible)
    } else {
        (0, TokenStandard::NonFungible)
    };

    let amount = list_state.amount;
    let currency = list_state.currency;

    require!(amount <= max_amount, TcompError::PriceMismatch);
    require!(currency.is_none(), TcompError::CurrencyMismatch);

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

    // No optional royalties.
    let creator_fee = calc_creators_fee(royalty_fee, amount, Some(100))?;

    // Transfer the asset to the buyer.
    TransferV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
        .asset(&ctx.accounts.asset)
        .authority(Some(&ctx.accounts.list_state.to_account_info()))
        .new_owner(&ctx.accounts.buyer)
        .payer(&ctx.accounts.payer) // pay for what?
        .collection(ctx.accounts.collection.as_ref().map(|c| c.as_ref()))
        .invoke_signed(&[&ctx.accounts.list_state.seeds()])?;

    let asset_id = ctx.accounts.asset.key();

    // NOTE: The event doesn't record
    record_event(
        &TcompEvent::Taker(TakeEvent {
            taker: *ctx.accounts.buyer.key,
            bid_id: None,
            target: Target::AssetId,
            target_id: asset_id,
            field: None,
            field_id: None,
            amount,
            quantity: 0, //quantity left
            tcomp_fee,
            taker_broker_fee,
            maker_broker_fee,
            creator_fee, // Can't record actual because we transfer lamports after we send noop tx
            currency,
            asset_id: Some(asset_id),
        }),
        &ctx.accounts.marketplace_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    // --Pay fees in SOL--

    // Protocol fee.
    ctx.accounts
        .transfer_lamports(&ctx.accounts.fee_vault.to_account_info(), tcomp_fee)?;

    // Maker broker fee.
    ctx.accounts.transfer_lamports_min_balance(
        &ctx.accounts
            .maker_broker
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault)
            .to_account_info(),
        maker_broker_fee,
    )?;

    // Taker broker fee.
    ctx.accounts.transfer_lamports_min_balance(
        &ctx.accounts
            .taker_broker
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault)
            .to_account_info(),
        taker_broker_fee,
    )?;

    // Pay creator royalties.
    if let Some(Royalties { creators, .. }) = royalties {
        transfer_creators_fee(
            &creators.into_iter().map(Into::into).collect(),
            &mut remaining_accounts.iter(),
            creator_fee,
            &CreatorFeeMode::Sol {
                from: &FromAcc::External(&FromExternal {
                    from: &ctx.accounts.payer.to_account_info(),
                    sys_prog: &ctx.accounts.system_program,
                }),
            },
        )?;
    }

    // Pay the seller (NB: the full listing amount since taker pays above fees + royalties)
    ctx.accounts
        .transfer_lamports(&ctx.accounts.owner.to_account_info(), amount)?;

    Ok(())
}
