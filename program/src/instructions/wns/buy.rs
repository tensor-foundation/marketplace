use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::TransferChecked,
    token_interface::{close_account, CloseAccount, Mint, TokenAccount, TokenInterface},
};
use mpl_token_metadata::types::TokenStandard;
use tensor_toolbox::{
    calc_creators_fee, calc_fees,
    fees::ID as TFEE_PROGRAM_ID,
    shard_num,
    token_2022::wns::{approve, validate_mint, ApproveAccounts},
    transfer_lamports, transfer_lamports_checked,
};
use vipers::Validate;

use crate::{
    program::MarketplaceProgram, record_event, ListState, TakeEvent, Target, TcompError,
    TcompEvent, TcompSigner, CURRENT_TCOMP_VERSION, MAKER_BROKER_PCT, TCOMP_FEE_BPS,
};

#[derive(Accounts)]
pub struct BuyWns<'info> {
    /// CHECK: Seeds checked here, account has no state.
    #[account(
        mut,
        seeds = [
            b"fee_vault",
            // Use the last byte of the mint as the fee shard number
            shard_num!(list_state),
        ],
        seeds::program = TFEE_PROGRAM_ID,
        bump
    )]
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
    pub wns_distribution_program: UncheckedAccount<'info>,

    /// CHECK: checked on transfer CPI
    pub extra_metas: UncheckedAccount<'info>,

    // cosigner is checked in validate()
    pub cosigner: Option<Signer<'info>>,
}

impl<'info> Validate<'info> for BuyWns<'info> {
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
pub fn process_buy_wns<'info, 'b>(
    ctx: Context<'_, 'b, '_, 'info, BuyWns<'info>>,
    max_amount: u64,
) -> Result<()> {
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

    // validate mint account
    let seller_fee_basis_points = validate_mint(&ctx.accounts.mint.to_account_info())?;
    let creator_fee = calc_creators_fee(
        seller_fee_basis_points,
        amount,
        Some(TokenStandard::ProgrammableNonFungible), // <- enforced royalties
        None,
    )?;

    let approve_accounts = ApproveAccounts {
        payer: ctx.accounts.payer.to_account_info(),
        authority: ctx.accounts.payer.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        approve_account: ctx.accounts.approve.to_account_info(),
        payment_mint: None,
        authority_token_account: ctx.accounts.payer.to_account_info(),
        distribution_account: ctx.accounts.distribution.to_account_info(),
        distribution_token_account: ctx.accounts.distribution.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        distribution_program: ctx.accounts.wns_distribution_program.to_account_info(),
        wns_program: ctx.accounts.wns_program.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        associated_token_program: ctx.accounts.associated_token_program.to_account_info(),
    };
    // royalty payment
    approve(approve_accounts, amount, creator_fee)?;

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
