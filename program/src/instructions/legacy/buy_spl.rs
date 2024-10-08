use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};
use mpl_token_metadata::types::AuthorizationData;
use std::ops::Deref;
use tensor_toolbox::{
    calc_creators_fee, calc_fees, fees, mpl_token_auth_rules, shard_num,
    token_metadata::{assert_decode_metadata, transfer, TransferArgs},
    transfer_creators_fee, CalcFeesArgs, CreatorFeeMode, Fees, BROKER_FEE_PCT, MAKER_BROKER_PCT,
    TAKER_FEE_BPS,
};
use tensor_vipers::Validate;

use crate::{
    assert_decode_token_account, program::MarketplaceProgram, record_event, AuthorizationDataLocal,
    ListState, TakeEvent, Target, TcompError, TcompEvent, TcompSigner, CURRENT_TCOMP_VERSION,
    TNSR_CURRENCY,
};

#[derive(Accounts)]
pub struct BuyLegacySpl<'info> {
    /// CHECK: Seeds and program checked here, account has no state.
    #[account(mut,
            seeds=[
            b"fee_vault".as_ref(),
            shard_num!(list_state),
        ],
        bump,
        seeds::program = fees::ID,
    )]
    pub fee_vault: UncheckedAccount<'info>,

    #[account(init_if_needed,
        payer = payer,
        associated_token::mint = currency,
        associated_token::authority = fee_vault,
        associated_token::token_program = currency_token_program,
    )]
    pub fee_vault_currency_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: it can be a 3rd party receiver address
    pub buyer: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = buyer,
    )]
    pub buyer_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = list_state,
    )]
    pub list_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        close = rent_destination,
        seeds=[
            b"list_state".as_ref(),
            mint.key().as_ref(),
        ],
        bump = list_state.bump[0],
        has_one = owner,
        constraint = list_state.currency == Some(currency.key()) @ TcompError::CurrencyMismatch,
    )]
    pub list_state: Box<Account<'info, ListState>>,

    pub mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: list_state.currency
    #[account(
        mint::token_program = currency_token_program,
    )]
    pub currency: Box<InterfaceAccount<'info, Mint>>,

    // Owner needs to be passed in as mutable account, so we reassign lamports back to them
    /// CHECK: has_one = owner on list_state
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = currency,
        associated_token::authority = owner,
        associated_token::token_program = currency_token_program,
    )]
    pub owner_currency_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut,
      token::mint = currency,
      token::authority = payer,
      token::token_program = currency_token_program,
    )]
    pub payer_currency_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: checked in validate()
    #[account(mut)]
    pub maker_broker: Option<UncheckedAccount<'info>>,

    /// CHECK: none, can be anything
    #[account(mut)]
    pub taker_broker: Option<UncheckedAccount<'info>>,

    /// CHECK: list_state.get_rent_payer()
    #[account(
        mut,
        constraint = rent_destination.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,

    pub currency_token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,

    // ------------------------------------------------ Token Metadata accounts
    /// CHECK: assert_decode_metadata + seeds below
    #[account(
        mut,
        seeds=[
            mpl_token_metadata::accounts::Metadata::PREFIX,
            mpl_token_metadata::ID.as_ref(),
            mint.key().as_ref(),
        ],
        seeds::program = mpl_token_metadata::ID,
        bump
    )]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: seeds checked on Token Metadata CPI
    pub edition: UncheckedAccount<'info>,

    /// CHECK: seeds checked on Token Metadata CPI
    #[account(mut)]
    pub buyer_token_record: Option<UncheckedAccount<'info>>,

    /// CHECK: seeds checked on Token Metadata CPI
    #[account(mut)]
    pub list_token_record: Option<UncheckedAccount<'info>>,

    /// CHECK: validated by mplex's pnft code
    pub authorization_rules: Option<UncheckedAccount<'info>>,

    /// CHECK: address below
    #[account(address = mpl_token_auth_rules::ID)]
    pub authorization_rules_program: Option<UncheckedAccount<'info>>,

    /// CHECK: address below
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: Option<UncheckedAccount<'info>>,

    /// CHECK: address below
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub sysvar_instructions: Option<UncheckedAccount<'info>>,

    pub cosigner: Option<Signer<'info>>,
    //
    // ----------------------------------------------------- Remaining accounts
    // 1. creators (1-5)
    // 2. creators' atas (1-5)
    // 3. maker_broker_currency_ta (optional)
    // 4. taker_broker_currency_ta (optional)
}

impl<'info> Validate<'info> for BuyLegacySpl<'info> {
    #[inline(never)]
    fn validate(&self) -> Result<()> {
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

        // Validate the cosigner if it's required.
        if list_state.cosigner != Pubkey::default() {
            let signer = self.cosigner.as_ref().ok_or(TcompError::BadCosigner)?;

            require!(list_state.cosigner == *signer.key, TcompError::BadCosigner);
        }

        Ok(())
    }
}

impl<'info> BuyLegacySpl<'info> {
    #[inline(never)]
    fn transfer_currency(&self, to: &AccountInfo<'info>, amount: u64) -> Result<()> {
        transfer_checked(
            CpiContext::new(
                self.currency_token_program.to_account_info(),
                TransferChecked {
                    from: self.payer_currency_ta.to_account_info(),
                    to: to.to_account_info(),
                    authority: self.payer.to_account_info(),
                    mint: self.currency.to_account_info(),
                },
            ),
            amount,
            self.currency.decimals,
        )?;
        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
#[inline(never)]
pub fn process_buy_legacy_spl<'info, 'b>(
    ctx: Context<'_, 'b, '_, 'info, BuyLegacySpl<'info>>,
    max_amount: u64,
    optional_royalty_pct: Option<u16>,
    authorization_data: Option<AuthorizationDataLocal>,
) -> Result<()> {
    // validate the mint
    let mint = ctx.accounts.mint.key();
    let metadata = assert_decode_metadata(&mint, &ctx.accounts.metadata)?;
    let list_state = &ctx.accounts.list_state;

    let remaining_accounts = ctx.remaining_accounts;

    // Parse remaining accounts.
    let num_creators = metadata.creators.as_ref().map(Vec::len).unwrap_or(0);
    let (creator_accounts, remaining) = remaining_accounts.split_at(num_creators);
    let (creator_ta_accounts, remaining) = remaining.split_at(num_creators);

    // If broker acounts are present, we need the currency token accounts from them.
    let (maker_broker_currency_ta, remaining) =
        if let Some(maker_broker) = &ctx.accounts.maker_broker {
            let (account, remaining) = remaining
                .split_first()
                .ok_or(TcompError::InsufficientRemainingAccounts)?;
            assert_decode_token_account(&mint, &maker_broker.key(), account)?;

            (Some(account), remaining)
        } else {
            (None, remaining)
        };

    let (taker_broker_currency_ta, _remaining) =
        if let Some(taker_broker) = &ctx.accounts.taker_broker {
            let (account, remaining) = remaining
                .split_first()
                .ok_or(TcompError::InsufficientRemainingAccounts)?;
            assert_decode_token_account(&mint, &taker_broker.key(), account)?;

            (Some(account), remaining)
        } else {
            (None, remaining)
        };

    let creator_accounts_with_ta = creator_accounts
        .iter()
        .zip(creator_ta_accounts.iter())
        .flat_map(|(creator, ata)| vec![creator.to_account_info(), ata.to_account_info()])
        .collect::<Vec<_>>();

    let amount = list_state.amount;
    let currency = list_state.currency;

    require!(amount <= max_amount, TcompError::PriceMismatch);
    require!(currency.is_some(), TcompError::CurrencyMismatch);

    let tnsr_discount = matches!(currency, Some(c) if c.to_string() == TNSR_CURRENCY);

    let Fees {
        protocol_fee: tcomp_fee,
        maker_broker_fee,
        taker_broker_fee,
        ..
    } = calc_fees(CalcFeesArgs {
        amount,
        tnsr_discount,
        total_fee_bps: TAKER_FEE_BPS,
        broker_fee_pct: BROKER_FEE_PCT,
        maker_broker_pct: MAKER_BROKER_PCT,
    })?;

    let creator_fee = calc_creators_fee(
        metadata.seller_fee_basis_points,
        amount,
        optional_royalty_pct,
    )?;

    // Transfer the NFT to the buyer
    transfer(
        TransferArgs {
            source: &ctx.accounts.list_state.to_account_info(),
            payer: &ctx.accounts.payer,
            source_ata: &ctx.accounts.list_ta,
            destination_ata: &ctx.accounts.buyer_ta,
            destination: &ctx.accounts.buyer,
            mint: ctx.accounts.mint.deref(),
            metadata: &ctx.accounts.metadata,
            edition: &ctx.accounts.edition,
            system_program: &ctx.accounts.system_program,
            spl_token_program: &ctx.accounts.token_program,
            spl_ata_program: &ctx.accounts.associated_token_program,
            sysvar_instructions: ctx.accounts.sysvar_instructions.as_ref(),
            source_token_record: ctx.accounts.list_token_record.as_ref(),
            destination_token_record: ctx.accounts.buyer_token_record.as_ref(),
            authorization_rules_program: ctx.accounts.authorization_rules_program.as_ref(),
            authorization_rules: ctx.accounts.authorization_rules.as_ref(),
            authorization_data: authorization_data.map(AuthorizationData::from),
            token_metadata_program: ctx.accounts.token_metadata_program.as_ref(),
            delegate: None,
        },
        Some(&[&ctx.accounts.list_state.seeds()]),
    )?;

    let asset_id = ctx.accounts.mint.key();

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
            quantity: 0,
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

    // --Pay fees in currency--

    // Protocol fee.
    ctx.accounts.transfer_currency(
        &ctx.accounts.fee_vault_currency_ta.to_account_info(),
        tcomp_fee,
    )?;

    // Maker broker fee.
    ctx.accounts.transfer_currency(
        maker_broker_currency_ta.unwrap_or(&ctx.accounts.fee_vault_currency_ta.to_account_info()),
        maker_broker_fee,
    )?;

    // Taker broker fee.
    ctx.accounts.transfer_currency(
        taker_broker_currency_ta.unwrap_or(&ctx.accounts.fee_vault_currency_ta.to_account_info()),
        taker_broker_fee,
    )?;

    // Pay creator royalties.
    transfer_creators_fee(
        &metadata
            .creators
            .unwrap_or(Vec::with_capacity(0))
            .into_iter()
            .map(Into::into)
            .collect(),
        &mut creator_accounts_with_ta.iter(),
        creator_fee,
        &CreatorFeeMode::Spl {
            associated_token_program: &ctx.accounts.associated_token_program,
            token_program: &ctx.accounts.currency_token_program,
            system_program: &ctx.accounts.system_program,
            currency: ctx.accounts.currency.deref().as_ref(),
            from: &ctx.accounts.payer,
            from_token_acc: ctx.accounts.payer_currency_ta.deref().as_ref(),
            rent_payer: &ctx.accounts.payer,
        },
    )?;

    // Pay the seller (NB: the full listing amount since taker pays above fees + royalties)
    ctx.accounts
        .transfer_currency(ctx.accounts.owner_currency_ta.deref().as_ref(), amount)?;

    // Close the list token account.
    close_account(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.list_ta.to_account_info(),
                destination: ctx.accounts.rent_destination.to_account_info(),
                authority: ctx.accounts.list_state.to_account_info(),
            },
        )
        .with_signer(&[&ctx.accounts.list_state.seeds()]),
    )
}
