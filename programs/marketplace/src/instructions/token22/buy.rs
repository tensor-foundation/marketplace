use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{transfer_checked, TransferChecked},
    token_interface::{close_account, CloseAccount, Mint, TokenAccount, TokenInterface},
};
use tensor_toolbox::{
    calc_fees, token_2022::validate_mint, transfer_lamports, transfer_lamports_checked,
};
use vipers::Validate;

use crate::{
    program::MarketplaceProgram, record_event, ListState, TakeEvent, Target, TcompError,
    TcompEvent, TcompSigner, CURRENT_TCOMP_VERSION, MAKER_BROKER_PCT, TCOMP_FEE_BPS,
};

#[derive(Accounts)]
pub struct BuyT22<'info> {
    /// CHECK: seeds (fee account)
    #[account(mut, seeds=[], bump)]
    pub fee_vault: UncheckedAccount<'info>,

    /// CHECK: it can be a 3rd party receiver address
    pub buyer: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = buyer,
    )]
    pub buyer_ata: Box<InterfaceAccount<'info, TokenAccount>>,

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
    )]
    pub list_ata: Box<InterfaceAccount<'info, TokenAccount>>,

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

    /// CHECK: none, can be anything
    #[account(mut)]
    pub maker_broker: Option<UncheckedAccount<'info>>,

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

    // cosigner is checked in validate()
    pub cosigner: Option<Signer<'info>>,
}

impl<'info> Validate<'info> for BuyT22<'info> {
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

        // check if the cosigner is required
        if let Some(cosigner) = list_state.cosigner.value() {
            let signer = self.cosigner.as_ref().ok_or(TcompError::BadCosigner)?;

            require!(cosigner == signer.key, TcompError::BadCosigner);
        }

        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn process_buy_t22<'info, 'b>(
    ctx: Context<'_, 'b, '_, 'info, BuyT22<'info>>,
    max_amount: u64,
) -> Result<()> {
    // validate mint account

    validate_mint(&ctx.accounts.mint.to_account_info())?;

    let list_state = &ctx.accounts.list_state;
    let amount = list_state.amount;
    let currency = list_state.currency;
    require!(amount <= max_amount, TcompError::PriceMismatch);
    require!(currency.is_none(), TcompError::CurrencyMismatch);

    let (tcomp_fee, maker_broker_fee, taker_broker_fee) = calc_fees(
        amount,
        TCOMP_FEE_BPS,
        MAKER_BROKER_PCT,
        list_state.maker_broker,
        ctx.accounts.taker_broker.as_ref().map(|acc| acc.key()),
    )?;

    // transfer the NFT

    let transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.list_ata.to_account_info(),
            to: ctx.accounts.buyer_ata.to_account_info(),
            authority: ctx.accounts.list_state.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    transfer_checked(
        transfer_cpi.with_signer(&[&ctx.accounts.list_state.seeds()]),
        1,
        0,
    )?; // supply = 1, decimals = 0

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
            creator_fee: 0, // no royalties on T22
            currency,
            asset_id: Some(asset_id),
        }),
        &ctx.accounts.marketplace_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    // pay fees

    transfer_lamports(&ctx.accounts.payer, &ctx.accounts.fee_vault, tcomp_fee)?;

    transfer_lamports_checked(
        &ctx.accounts.payer,
        &ctx.accounts
            .maker_broker
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault)
            .to_account_info(),
        maker_broker_fee,
    )?;

    transfer_lamports_checked(
        &ctx.accounts.payer,
        &ctx.accounts
            .taker_broker
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault)
            .to_account_info(),
        taker_broker_fee,
    )?;

    // pay the seller (NB: the full listing amount since taker pays above fees + royalties)
    transfer_lamports(&ctx.accounts.payer, &ctx.accounts.owner, amount)?;

    // closes the list token account

    close_account(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.list_ata.to_account_info(),
                destination: ctx.accounts.rent_destination.to_account_info(),
                authority: ctx.accounts.list_state.to_account_info(),
            },
        )
        .with_signer(&[&ctx.accounts.list_state.seeds()]),
    )
}
