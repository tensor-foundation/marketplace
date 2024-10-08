use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::{get_associated_token_address_with_program_id, AssociatedToken},
    token_2022::{Token2022, TransferChecked},
    token_interface::{close_account, CloseAccount, Mint, TokenAccount, TokenInterface},
};
use std::ops::Deref;
use tensor_toolbox::{
    calc_creators_fee, calc_fees, fees, shard_num,
    token_2022::{
        transfer::transfer_checked as tensor_transfer_checked, validate_mint, RoyaltyInfo,
    },
    transfer_creators_fee, CalcFeesArgs, CreatorFeeMode, Fees, TCreator, BROKER_FEE_PCT,
    MAKER_BROKER_PCT, TAKER_FEE_BPS,
};
use tensor_vipers::Validate;

use crate::{
    program::MarketplaceProgram, record_event, ListState, TakeEvent, Target, TcompError,
    TcompEvent, TcompSigner, CURRENT_TCOMP_VERSION, TNSR_CURRENCY,
};

#[derive(Accounts)]
pub struct BuyT22Spl<'info> {
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

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = list_state,
        associated_token::token_program = token_program,
    )]
    pub list_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// T22 asset mint.
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    /// SPL token mint of the currency.
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

    /// CHECK: none, can be anything
    #[account(mut,
        constraint = taker_broker_currency_ta.is_some() @ TcompError::MissingBrokerTokenAccount
    )]
    pub taker_broker: Option<UncheckedAccount<'info>>,

    #[account(init_if_needed,
        payer = payer,
        associated_token::mint = currency,
        associated_token::authority = taker_broker,
        associated_token::token_program = currency_token_program,
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
        associated_token::token_program = currency_token_program,
        constraint = maker_broker.is_some() @ TcompError::MissingBroker
    )]
    pub maker_broker_currency_ta: Option<Box<InterfaceAccount<'info, TokenAccount>>>,

    /// CHECK: list_state.get_rent_payer()
    #[account(
        mut,
        constraint = rent_destination.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,

    // Always Token2022.
    pub token_program: Program<'info, Token2022>,

    // Supports both Token2022 and legacy SPL Token.
    pub currency_token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,

    pub cosigner: Option<Signer<'info>>,
    //
    // ----------------------------------------------------- Remaining accounts
    // 1. creators (1-5)
    // 2. creators' atas (1-5)
    // 3. [0..n] remaining accounts for royalties transfer hook
}

impl<'info> Validate<'info> for BuyT22Spl<'info> {
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

impl<'info> BuyT22Spl<'info> {
    fn transfer_currency(&self, to: &AccountInfo<'info>, amount: u64) -> Result<()> {
        tensor_transfer_checked(
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
pub fn process_buy_t22_spl<'info, 'b>(
    ctx: Context<'_, 'b, '_, 'info, BuyT22Spl<'info>>,
    max_amount: u64,
) -> Result<()> {
    // validate the mint
    let list_state = &ctx.accounts.list_state;

    let remaining_accounts = ctx.remaining_accounts;

    // validate mint account
    let royalties = validate_mint(&ctx.accounts.mint.to_account_info())?;

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

    // Transfer the NFT

    //  Build transfer context.
    let mut transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.list_ta.to_account_info(),
            to: ctx.accounts.buyer_ta.to_account_info(),
            authority: ctx.accounts.list_state.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    // this will only add the remaining accounts required by a transfer hook if we
    // recognize the hook as a royalty one
    let (creators, creator_accounts, creator_fee) = if let Some(RoyaltyInfo {
        creators,
        seller_fee,
    }) = &royalties
    {
        // add remaining accounts to the transfer cpi
        transfer_cpi = transfer_cpi.with_remaining_accounts(ctx.remaining_accounts.to_vec());

        let mut creator_infos = Vec::with_capacity(creators.len());
        let mut creator_ta_infos = Vec::with_capacity(creators.len());
        let mut creator_data = Vec::with_capacity(creators.len());

        // filter out the creators accounts; the transfer will fail if there
        // are missing creator accounts – i.e., the creator is on the `creator_data`
        // but the account is not in the `creator_infos`
        for c in creators.iter() {
            let creator = TCreator {
                address: c.0,
                share: c.1,
                verified: true,
            };

            // Derive the creator ATA address. We require it to be ATA currently to avoid having to
            // deserialize every possible token account in the remaining accounts.
            let creator_ata = get_associated_token_address_with_program_id(
                &c.0,
                &ctx.accounts.currency.key(),
                &ctx.accounts.currency_token_program.key(),
            );

            // First check if the creator is in the remaining accounts.
            if let Some(account) = ctx
                .remaining_accounts
                .iter()
                .find(|account| &creator.address == account.key)
            {
                // Add it to the creator infos.
                creator_infos.push(account.clone());

                // Then check if the creator ATA is in the remaining accounts.
                if let Some(account) = ctx
                    .remaining_accounts
                    .iter()
                    .find(|account| &creator_ata == account.key)
                {
                    // Add it to the creator ATA infos.
                    creator_ta_infos.push(account.clone());
                } else {
                    return Err(TcompError::MissingCreatorATA.into());
                }
            }

            creator_data.push(creator);
        }

        // No optional royalties.
        let creator_fee = calc_creators_fee(*seller_fee, amount, Some(100))?;

        (creator_data, creator_infos, creator_fee)
    } else {
        (vec![], vec![], 0)
    };

    // Invoke the transfer.
    tensor_transfer_checked(
        transfer_cpi.with_signer(&[&ctx.accounts.list_state.seeds()]),
        1,
        0,
    )?; // supply = 1, decimals = 0

    let asset_id = ctx.accounts.mint.key();

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

    // --Pay fees in currency--

    // Protocol fee.
    ctx.accounts.transfer_currency(
        ctx.accounts.fee_vault_currency_ta.deref().as_ref(),
        tcomp_fee,
    )?;

    // Maker broker fee.
    ctx.accounts.transfer_currency(
        ctx.accounts
            .maker_broker_currency_ta
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault_currency_ta)
            .deref()
            .as_ref(),
        maker_broker_fee,
    )?;

    // Taker broker fee.
    ctx.accounts.transfer_currency(
        ctx.accounts
            .taker_broker_currency_ta
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault_currency_ta)
            .deref()
            .as_ref(),
        taker_broker_fee,
    )?;

    let (_creator_accounts, creator_ta_accounts) = remaining_accounts.split_at(creators.len());

    let creator_accounts_with_ta = creator_accounts
        .iter()
        .zip(creator_ta_accounts.iter())
        .flat_map(|(creator, ata)| vec![creator.to_account_info(), ata.to_account_info()])
        .collect::<Vec<_>>();

    // Pay creator royalties.
    if royalties.is_some() {
        transfer_creators_fee(
            &creators.into_iter().map(Into::into).collect(),
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
    }

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
