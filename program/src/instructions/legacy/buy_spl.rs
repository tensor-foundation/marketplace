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
    calc_creators_fee, calc_fees, fees, shard_num,
    token_metadata::{assert_decode_metadata, transfer, TransferArgs},
    transfer_creators_fee, CalcFeesArgs, CreatorFeeMode, BROKER_FEE_PCT,
};
use vipers::Validate;

use crate::{
    program::MarketplaceProgram, record_event, AuthorizationDataLocal, ListState, TakeEvent,
    Target, TcompError, TcompEvent, TcompSigner, CURRENT_TCOMP_VERSION, MAKER_BROKER_PCT,
    TCOMP_FEE_BPS,
};

#[derive(Accounts)]
pub struct BuyLegacySpl<'info> {
    /// CHECK: seeds and program checked here
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
    )]
    pub owner_currency_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut,
      token::mint = currency,
      token::authority = payer,
    )]
    pub payer_currency_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: none, can be anything
    #[account(mut,
        constraint = taker_broker_currency_ta.is_some() @ TcompError::MissingBrokerTokenAccount
    )]
    pub taker_broker: Option<UncheckedAccount<'info>>,

    #[account(init_if_needed,
        payer = payer,
        associated_token::mint = currency,
        associated_token::authority = taker_broker,
        constraint = taker_broker.is_some() @ TcompError::MissingBroker
    )]
    pub taker_broker_currency_ta: Option<Box<InterfaceAccount<'info, TokenAccount>>>,

    /// CHECK: none, can be anything
    #[account(mut,
        constraint = maker_broker_currency_ta.is_some() @ TcompError::MissingBrokerTokenAccount
    )]
    pub maker_broker: Option<UncheckedAccount<'info>>,

    #[account(init_if_needed,
        payer = payer,
        associated_token::mint = currency,
        associated_token::authority = maker_broker,
        constraint = maker_broker.is_some() @ TcompError::MissingBroker
    )]
    pub maker_broker_currency_ta: Option<Box<InterfaceAccount<'info, TokenAccount>>>,

    /// CHECK: list_state.get_rent_payer()
    #[account(
        mut,
        constraint = rent_destination.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,

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
    //#[account(address = MPL_TOKEN_AUTH_RULES_ID)]
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
    //
    // 1. creators (1-5)
    // 2. creators' atas (1-5)
}

impl<'info> Validate<'info> for BuyLegacySpl<'info> {
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
        if let Some(cosigner) = list_state.cosigner.value() {
            let signer = self.cosigner.as_ref().ok_or(TcompError::BadCosigner)?;

            require!(cosigner == signer.key, TcompError::BadCosigner);
        }

        Ok(())
    }
}

impl<'info> BuyLegacySpl<'info> {
    fn transfer_ta(
        &self,
        to: &AccountInfo<'info>,
        mint: &AccountInfo<'info>,
        amount: u64,
        decimals: u8,
    ) -> Result<()> {
        transfer_checked(
            CpiContext::new(
                self.token_program.to_account_info(),
                TransferChecked {
                    from: self.payer_currency_ta.to_account_info(),
                    to: to.to_account_info(),
                    authority: self.payer.to_account_info(),
                    mint: mint.to_account_info(),
                },
            ),
            amount,
            decimals,
        )?;
        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
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

    let amount = list_state.amount;
    let currency = list_state.currency;

    require!(amount <= max_amount, TcompError::PriceMismatch);
    require!(currency.is_some(), TcompError::CurrencyMismatch);

    let tnsr_discount = matches!(currency, Some(c) if c.to_string() == "TNSRxcUxoT9xBG3de7PiJyTDYu7kskLqcpddxnEJAS6");

    let (tcomp_fee, maker_broker_fee, taker_broker_fee) = calc_fees(CalcFeesArgs {
        amount,
        tnsr_discount,
        total_fee_bps: TCOMP_FEE_BPS,
        broker_fee_pct: BROKER_FEE_PCT,
        maker_broker_pct: MAKER_BROKER_PCT,
    })?;

    let creator_fee = calc_creators_fee(
        metadata.seller_fee_basis_points,
        amount,
        None,
        optional_royalty_pct,
    )?;

    // transfer the NFT to the buyer

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
    // let mut data: &[u8] = &ctx.accounts.currency.try_borrow_data()?;
    // let currency_mint = Mint::try_deserialize(&mut data)?;
    let currency_mint = &ctx.accounts.currency;

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

    // Pay fees.
    ctx.accounts.transfer_ta(
        ctx.accounts.fee_vault_currency_ta.deref().as_ref(),
        ctx.accounts.currency.deref().as_ref(),
        tcomp_fee,
        currency_mint.decimals,
    )?;

    ctx.accounts.transfer_ta(
        ctx.accounts
            .maker_broker_currency_ta
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault_currency_ta)
            .deref()
            .as_ref(),
        ctx.accounts.currency.deref().as_ref(),
        maker_broker_fee,
        currency_mint.decimals,
    )?;

    ctx.accounts.transfer_ta(
        ctx.accounts
            .taker_broker_currency_ta
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault_currency_ta)
            .deref()
            .as_ref(),
        ctx.accounts.currency.deref().as_ref(),
        taker_broker_fee,
        currency_mint.decimals,
    )?;

    // Pay creator royalties.
    let num_creators = metadata.creators.as_ref().map(Vec::len).unwrap_or(0);
    let (creator_accounts, creator_ta_accounts) = remaining_accounts.split_at(num_creators);

    let creator_accounts_with_ta = creator_accounts
        .iter()
        .zip(creator_ta_accounts.iter())
        .flat_map(|(creator, ata)| vec![creator.to_account_info(), ata.to_account_info()])
        .collect::<Vec<_>>();

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
            token_program: &ctx.accounts.token_program,
            system_program: &ctx.accounts.system_program,
            currency: ctx.accounts.currency.deref().as_ref(),
            from: &ctx.accounts.payer,
            from_token_acc: ctx.accounts.payer_currency_ta.deref().as_ref(),
            rent_payer: &ctx.accounts.payer,
        },
    )?;

    // Pay the seller (NB: the full listing amount since taker pays above fees + royalties)
    ctx.accounts.transfer_ta(
        ctx.accounts.owner_currency_ta.deref().as_ref(),
        ctx.accounts.currency.deref().as_ref(),
        amount,
        currency_mint.decimals,
    )?;

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
