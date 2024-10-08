use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::Token2022,
    token_interface::{
        close_account, CloseAccount, Mint, TokenAccount, TokenInterface, TransferChecked,
    },
};
use std::ops::Deref;
use tensor_toolbox::{
    calc_creators_fee, calc_fees,
    token_2022::{
        transfer::transfer_checked as tensor_transfer_checked,
        wns::{approve, validate_mint, ApproveAccounts, ApproveParams},
    },
    CalcFeesArgs, Fees, BROKER_FEE_PCT, MAKER_BROKER_PCT, TAKER_FEE_BPS,
};
use tensor_vipers::Validate;

use crate::{
    assert_associated_token_account, assert_fee_vault_seeds, assert_list_state_seeds,
    assert_token_account, init_if_needed_ata, program::MarketplaceProgram, record_event,
    InitIfNeededAtaParams, ListState, TakeEvent, Target, TcompError, TcompEvent, TcompSigner,
    CURRENT_TCOMP_VERSION, TNSR_CURRENCY,
};

#[derive(Accounts)]
pub struct BuyWnsSpl<'info> {
    /// CHECK: seeds checked in validate() due to stack size issues.
    #[account(mut)]
    pub fee_vault: UncheckedAccount<'info>,

    /// CHECK: Validated and initialized if needed in init_atas().
    #[account(mut)]
    pub fee_vault_currency_ta: UncheckedAccount<'info>,

    /// CHECK: it can be a 3rd party receiver address
    pub buyer: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = buyer,
        associated_token::token_program = token_program,
    )]
    pub buyer_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: checked in validate().
    #[account(mut)]
    pub list_ta: UncheckedAccount<'info>,

    #[account(
        mut,
        close = rent_destination,
        has_one = owner,
    )]
    pub list_state: Box<Account<'info, ListState>>,

    /// WNS asset mint.
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

    /// CHECK: Validated and initialized if needed in init_atas().
    #[account(mut)]
    pub owner_currency_ta: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut,
      token::mint = currency,
      token::authority = payer,
      token::token_program = currency_token_program,
    )]
    pub payer_currency_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: none, can be anything
    #[account(mut)]
    pub taker_broker: Option<UncheckedAccount<'info>>,

    /// CHECK: Validated and initialized if needed in init_atas().
    #[account(mut)]
    pub taker_broker_currency_ta: Option<UncheckedAccount<'info>>,

    /// CHECK: none, can be anything
    #[account(mut)]
    pub maker_broker: Option<UncheckedAccount<'info>>,

    /// CHECK: Validated and initialized if needed in init_atas().
    #[account(mut)]
    pub maker_broker_currency_ta: Option<UncheckedAccount<'info>>,

    /// CHECK: list_state.get_rent_payer()
    #[account(mut)]
    pub rent_destination: UncheckedAccount<'info>,

    // Always Token2022.
    pub token_program: Program<'info, Token2022>,

    // Supports both Token2022 and legacy SPL Token.
    pub currency_token_program: Interface<'info, TokenInterface>,

    // pub currency_token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,

    // ---- WNS royalty enforcement
    /// CHECK: checked on approve CPI
    #[account(mut)]
    pub approve: UncheckedAccount<'info>,

    /// CHECK: checked on approve CPI
    #[account(mut)]
    pub distribution: UncheckedAccount<'info>,

    /// CHECK: Validated and initialized if needed in init_atas().
    #[account(mut)]
    pub distribution_currency_ta: UncheckedAccount<'info>,

    /// CHECK: checked on approve CPI
    pub wns_program: UncheckedAccount<'info>,

    /// CHECK: checked on approve CPI
    pub distribution_program: UncheckedAccount<'info>,

    /// CHECK: checked on transfer CPI
    pub extra_metas: UncheckedAccount<'info>,

    pub cosigner: Option<Signer<'info>>,
}

impl<'info> Validate<'info> for BuyWnsSpl<'info> {
    fn validate(&self) -> Result<()> {
        assert_fee_vault_seeds(
            &self.fee_vault.to_account_info(),
            &self.list_state.to_account_info(),
        )?;

        assert_list_state_seeds(
            &self.list_state.to_account_info(),
            &self.mint.to_account_info(),
        )?;

        // Check that the payer currency token account is valid.
        assert_token_account(
            &self.payer_currency_ta.to_account_info(),
            &self.currency.key(),
            &self.payer.key(),
            &self.currency_token_program.key(),
        )?;

        assert_associated_token_account(
            &self.list_ta.to_account_info(),
            &self.mint.key(),
            &self.list_state.key(),
            &self.token_program.key(),
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

        require!(
            list_state.currency == Some(self.currency.key()),
            TcompError::CurrencyMismatch
        );

        require!(
            self.rent_destination.key() == list_state.get_rent_payer(),
            TcompError::BadRentDest
        );

        // Validate the cosigner if it's required.
        if list_state.cosigner != Pubkey::default() {
            let signer = self.cosigner.as_ref().ok_or(TcompError::BadCosigner)?;

            require!(list_state.cosigner == *signer.key, TcompError::BadCosigner);
        }

        // maker_broker accs are both None or Some
        #[rustfmt::skip]
        require!(
            (self.maker_broker.is_some() && self.maker_broker_currency_ta.is_some()) ||
            (self.maker_broker.is_none() && self.maker_broker_currency_ta.is_none()),
            TcompError::BrokerMismatch
        );

        // taker_broker accs are both None or Some
        #[rustfmt::skip]
        require!(
            (self.taker_broker.is_some() && self.taker_broker_currency_ta.is_some()) ||
            (self.taker_broker.is_none() && self.taker_broker_currency_ta.is_none()),
            TcompError::BrokerMismatch
        );

        Ok(())
    }
}

impl<'info> BuyWnsSpl<'info> {
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

    fn init_atas(&self) -> Result<()> {
        // Distribution currency ata.
        init_if_needed_ata(InitIfNeededAtaParams {
            ata: self.distribution_currency_ta.to_account_info(),
            payer: self.payer.to_account_info(),
            owner: self.distribution.to_account_info(),
            mint: self.currency.to_account_info(),
            associated_token_program: self.associated_token_program.to_account_info(),
            token_program: self.currency_token_program.to_account_info(),
            system_program: self.system_program.to_account_info(),
        })?;

        // Owner currency ata.
        init_if_needed_ata(InitIfNeededAtaParams {
            ata: self.owner_currency_ta.to_account_info(),
            payer: self.payer.to_account_info(),
            owner: self.owner.to_account_info(),
            mint: self.currency.to_account_info(),
            associated_token_program: self.associated_token_program.to_account_info(),
            token_program: self.currency_token_program.to_account_info(),
            system_program: self.system_program.to_account_info(),
        })?;

        // Fee Vault currency ata.
        init_if_needed_ata(InitIfNeededAtaParams {
            ata: self.fee_vault_currency_ta.to_account_info(),
            payer: self.payer.to_account_info(),
            owner: self.fee_vault.to_account_info(),
            mint: self.currency.to_account_info(),
            associated_token_program: self.associated_token_program.to_account_info(),
            token_program: self.currency_token_program.to_account_info(),
            system_program: self.system_program.to_account_info(),
        })?;

        // Maker broker currency ata.
        if let Some(ref maker_broker_currency_ta) = self.maker_broker_currency_ta {
            init_if_needed_ata(InitIfNeededAtaParams {
                ata: maker_broker_currency_ta.to_account_info(),
                payer: self.payer.to_account_info(),
                owner: self
                    .maker_broker
                    .as_ref()
                    .ok_or(TcompError::MissingBroker)?
                    .to_account_info(),
                mint: self.currency.to_account_info(),
                associated_token_program: self.associated_token_program.to_account_info(),
                token_program: self.currency_token_program.to_account_info(),
                system_program: self.system_program.to_account_info(),
            })?;
        }

        // Taker broker currency ata.
        if let Some(ref taker_broker_currency_ta) = self.taker_broker_currency_ta {
            init_if_needed_ata(InitIfNeededAtaParams {
                ata: taker_broker_currency_ta.to_account_info(),
                payer: self.payer.to_account_info(),
                owner: self
                    .taker_broker
                    .as_ref()
                    .ok_or(TcompError::MissingBroker)?
                    .to_account_info(),
                mint: self.currency.to_account_info(),
                associated_token_program: self.associated_token_program.to_account_info(),
                token_program: self.currency_token_program.to_account_info(),
                system_program: self.system_program.to_account_info(),
            })?;
        }

        Ok(())
    }
}

#[access_control(ctx.accounts.validate(); ctx.accounts.init_atas())]
pub fn process_buy_wns_spl<'info, 'b>(
    ctx: Context<'_, 'b, '_, 'info, BuyWnsSpl<'info>>,
    max_amount: u64,
) -> Result<()> {
    // validate the mint
    let list_state = &ctx.accounts.list_state;

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

    // validate mint account
    let seller_fee_basis_points = validate_mint(&ctx.accounts.mint.to_account_info())?;
    let creator_fee = calc_creators_fee(
        seller_fee_basis_points,
        amount,
        Some(100), // <- enforced royalties
    )?;

    // Approve the transfer using WNS' approval ix. This will CPI into the distribution program
    // to update the royalty distribution state.
    let approve_accounts = ApproveAccounts {
        payer: ctx.accounts.payer.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        approve_account: ctx.accounts.approve.to_account_info(),
        payment_mint: Some(ctx.accounts.currency.to_account_info()),
        authority_token_account: Some(ctx.accounts.payer_currency_ta.to_account_info()),
        distribution_account: ctx.accounts.distribution.to_account_info(),
        distribution_token_account: Some(ctx.accounts.distribution_currency_ta.to_account_info()),
        system_program: ctx.accounts.system_program.to_account_info(),
        distribution_program: ctx.accounts.distribution_program.to_account_info(),
        wns_program: ctx.accounts.wns_program.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        payment_token_program: Some(ctx.accounts.currency_token_program.to_account_info()),
    };
    // royalty payment
    let approve_params = ApproveParams {
        price: amount,
        royalty_fee: creator_fee,
        signer_seeds: &[],
    };
    approve(approve_accounts, approve_params)?;

    // transfer the NFT
    let transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.list_ta.to_account_info(),
            to: ctx.accounts.buyer_ta.to_account_info(),
            authority: ctx.accounts.list_state.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    tensor_transfer_checked(
        transfer_cpi
            .with_remaining_accounts(vec![
                ctx.accounts.wns_program.to_account_info(),
                ctx.accounts.extra_metas.to_account_info(),
                ctx.accounts.approve.to_account_info(),
            ])
            .with_signer(&[&ctx.accounts.list_state.seeds()]),
        1, // supply = 1
        0, // decimals = 0
    )?;

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
