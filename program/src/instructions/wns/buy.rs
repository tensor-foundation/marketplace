use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{Token2022, TransferChecked},
    token_interface::{close_account, CloseAccount, Mint, TokenAccount},
};
use tensor_toolbox::{
    assert_fee_account, calc_creators_fee, calc_fees, fees, shard_num,
    token_2022::wns::{approve, validate_mint, ApproveAccounts, ApproveParams},
    transfer_lamports, transfer_lamports_checked, CalcFeesArgs, Fees, BROKER_FEE_PCT,
    MAKER_BROKER_PCT, TAKER_FEE_BPS,
};
use tensor_vipers::Validate;

use crate::{
    program::MarketplaceProgram, record_event, ListState, TakeEvent, Target, TcompError,
    TcompEvent, TcompSigner, CURRENT_TCOMP_VERSION,
};

#[derive(Accounts)]
pub struct BuyWns<'info> {
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

    #[account(
        mut,
        close = rent_destination,
        seeds=[
            b"list_state".as_ref(),
            mint.key().as_ref(),
        ],
        bump = list_state.bump[0],
        has_one = owner
    )]
    pub list_state: Box<Account<'info, ListState>>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = list_state,
        associated_token::token_program = token_program,
    )]
    pub list_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: seed in nft_escrow & nft_receipt
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    // Owner needs to be passed in as mutable account, so we reassign lamports back to them
    /// CHECK: has_one = owner on list_state
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    /// CHECK: none, can be anything
    #[account(mut)]
    pub taker_broker: Option<UncheckedAccount<'info>>,

    /// CHECK: checked in validate()
    #[account(mut)]
    pub maker_broker: Option<UncheckedAccount<'info>>,

    /// CHECK: list_state.get_rent_payer()
    #[account(
        mut,
        constraint = rent_destination.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,

    // Always Token2022.
    pub token_program: Program<'info, Token2022>,

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

    /// CHECK: checked on approve CPI
    pub wns_program: UncheckedAccount<'info>,

    /// CHECK: checked on approve CPI
    pub distribution_program: UncheckedAccount<'info>,

    /// CHECK: checked on transfer CPI
    pub extra_metas: UncheckedAccount<'info>,

    // cosigner is checked in validate()
    pub cosigner: Option<Signer<'info>>,
}

impl<'info> Validate<'info> for BuyWns<'info> {
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
        // Validate the cosigner if it's required.
        if list_state.cosigner != Pubkey::default() {
            let signer = self.cosigner.as_ref().ok_or(TcompError::BadCosigner)?;

            require!(list_state.cosigner == *signer.key, TcompError::BadCosigner);
        }

        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn process_buy_wns<'info, 'b>(
    ctx: Context<'_, 'b, '_, 'info, BuyWns<'info>>,
    max_amount: u64,
) -> Result<()> {
    let list_state = &ctx.accounts.list_state;
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

    // validate mint account
    let seller_fee_basis_points = validate_mint(&ctx.accounts.mint.to_account_info())?;
    let creator_fee = calc_creators_fee(
        seller_fee_basis_points,
        amount,
        Some(100), // <- enforced royalties
    )?;

    let approve_accounts = ApproveAccounts {
        payer: ctx.accounts.payer.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        approve_account: ctx.accounts.approve.to_account_info(),
        payment_mint: None,
        authority_token_account: None,
        distribution_account: ctx.accounts.distribution.to_account_info(),
        distribution_token_account: None,
        system_program: ctx.accounts.system_program.to_account_info(),
        distribution_program: ctx.accounts.distribution_program.to_account_info(),
        wns_program: ctx.accounts.wns_program.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        payment_token_program: None,
    };

    let approve_params = ApproveParams {
        price: amount,
        royalty_fee: creator_fee,
        signer_seeds: &[],
    };

    // royalty payment
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

    tensor_toolbox::token_2022::transfer::transfer_checked(
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
    transfer_lamports(&ctx.accounts.payer, &ctx.accounts.fee_vault, tcomp_fee)?;

    // Maker broker fee.
    transfer_lamports_checked(
        &ctx.accounts.payer,
        &ctx.accounts
            .maker_broker
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault)
            .to_account_info(),
        maker_broker_fee,
    )?;

    // Taker broker fee.
    transfer_lamports_checked(
        &ctx.accounts.payer,
        &ctx.accounts
            .taker_broker
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault)
            .to_account_info(),
        taker_broker_fee,
    )?;

    // Creator royalties are handled by WNS' distribution mechanism.

    // pay the seller (NB: the full listing amount since taker pays above fees + royalties)
    transfer_lamports(&ctx.accounts.payer, &ctx.accounts.owner, amount)?;

    // closes the list token account

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
