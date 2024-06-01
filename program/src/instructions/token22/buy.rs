use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{transfer_checked, TransferChecked},
    token_interface::{close_account, CloseAccount, Mint, TokenAccount, TokenInterface},
};
use tensor_toolbox::{
    calc_creators_fee, calc_fees,
    token_2022::{validate_mint, RoyaltyInfo},
    transfer_creators_fee, transfer_lamports, transfer_lamports_checked, CreatorFeeMode, FromAcc,
    FromExternal, TCreator,
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
    //
    // ---- [0..n] remaining accounts for royalties transfer hook
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

    let royalties = validate_mint(&ctx.accounts.mint.to_account_info())?;

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

    let mut transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.list_ata.to_account_info(),
            to: ctx.accounts.buyer_ata.to_account_info(),
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
        let mut creator_data = Vec::with_capacity(creators.len());
        // filter out the creators accounts; the transfer will fail if there
        // are missing creator accounts – i.e., the creator is on the `creator_data`
        // but the account is not in the `creator_infos`
        creators.iter().for_each(|c| {
            let creator = TCreator {
                address: c.0,
                share: c.1,
                verified: true,
            };

            if let Some(account) = ctx
                .remaining_accounts
                .iter()
                .find(|account| &creator.address == account.key)
            {
                creator_infos.push(account.clone());
            }

            creator_data.push(creator);
        });

        // No optional royalties.
        let creator_fee = calc_creators_fee(*seller_fee, amount, None, Some(100))?;

        (creator_data, creator_infos, creator_fee)
    } else {
        (vec![], vec![], 0)
    };

    transfer_checked(
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

    // Pay creators
    if royalties.is_some() {
        transfer_creators_fee(
            &creators,
            &mut creator_accounts.iter(),
            creator_fee,
            &CreatorFeeMode::Sol {
                from: &FromAcc::External(&FromExternal {
                    from: &ctx.accounts.payer.to_account_info(),
                    sys_prog: &ctx.accounts.system_program,
                }),
            },
        )?;
    }

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
