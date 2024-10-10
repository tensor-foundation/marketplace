use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};
use tensor_toolbox::{
    assert_fee_account, calc_creators_fee, calc_fees, make_cnft_args, transfer_cnft,
    transfer_creators_fee, CalcFeesArgs, CnftArgs, CreatorFeeMode, DataHashArgs, Fees,
    MakeCnftArgs, MetadataSrc, TransferArgs, BROKER_FEE_PCT, MAKER_BROKER_PCT, TAKER_FEE_BPS,
};

use crate::*;

#[derive(Accounts)]
pub struct BuySpl<'info> {
    /// CHECK: Checked in assert_fee_account().
    #[account(mut)]
    pub fee_vault: UncheckedAccount<'info>,

    #[account(init_if_needed,
        payer = rent_payer,
        associated_token::mint = currency,
        associated_token::authority = fee_vault,
    )]
    pub fee_vault_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: downstream
    pub tree_authority: UncheckedAccount<'info>,

    /// CHECK: downstream
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,

    pub log_wrapper: Program<'info, Noop>,

    pub compression_program: Program<'info, SplAccountCompression>,

    pub system_program: Program<'info, System>,

    pub bubblegum_program: Program<'info, Bubblegum>,

    pub marketplace_program: Program<'info, crate::program::MarketplaceProgram>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    #[account(mut, close = rent_destination,
        seeds=[
            b"list_state".as_ref(),
            list_state.asset_id.as_ref(),
        ],
        bump = list_state.bump[0],
        has_one = owner,
        constraint = list_state.currency == Some(currency.key()) @ TcompError::CurrencyMismatch,
    )]
    pub list_state: Box<Account<'info, ListState>>,

    /// CHECK: doesnt matter, but this lets you pass in a 3rd party received address
    pub buyer: UncheckedAccount<'info>,

    pub payer: Signer<'info>,

    #[account(mut,
      token::mint = currency,
      token::authority = payer,
    )]
    pub payer_source: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: has_one = owner on list_state
    pub owner: UncheckedAccount<'info>,
    #[account(init_if_needed,
      payer = rent_payer,
      associated_token::mint = currency,
      associated_token::authority = owner,
    )]
    pub owner_destination: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: list_state.currency
    pub currency: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: none, can be anything
    #[account(mut,
        constraint = taker_broker_currency_ta.is_some() @ TcompError::MissingBrokerTokenAccount
    )]
    pub taker_broker: Option<UncheckedAccount<'info>>,

    #[account(init_if_needed,
        payer = rent_payer,
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
        payer = rent_payer,
        associated_token::mint = currency,
        associated_token::authority = maker_broker,
        constraint = maker_broker.is_some() @ TcompError::MissingBroker
    )]
    pub maker_broker_currency_ta: Option<Box<InterfaceAccount<'info, TokenAccount>>>,

    /// CHECK: list_state.get_rent_payer()
    #[account(mut,
        constraint = rent_destination.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,

    #[account(mut)]
    pub rent_payer: Signer<'info>,

    // cosigner is checked in handler
    pub cosigner: Option<UncheckedAccount<'info>>,
    // Remaining accounts:
    // 1. creators (1-5)
    // 2. creators atas (1-5)
    // 2. proof accounts (less canopy)
}

impl<'info> Validate<'info> for BuySpl<'info> {
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

impl<'info> BuySpl<'info> {
    fn transfer_currency(&self, to: &AccountInfo<'info>, amount: u64) -> Result<()> {
        transfer_checked(
            CpiContext::new(
                self.token_program.to_account_info(),
                TransferChecked {
                    from: self.payer_source.to_account_info(),
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
pub fn process_buy_spl<'info>(
    ctx: Context<'_, '_, '_, 'info, BuySpl<'info>>,
    nonce: u64,
    index: u32,
    root: [u8; 32],
    meta_hash: [u8; 32],
    // Below 3 used for creator verification
    // Creators themselves taken from extra accounts
    creator_shares: Vec<u8>,
    creator_verified: Vec<bool>,
    seller_fee_basis_points: u16,
    // Passing these in so buyer doesn't get rugged
    max_amount: u64,
    optional_royalty_pct: Option<u16>,
) -> Result<()> {
    let list_state = &ctx.accounts.list_state;

    // In case we have an extra remaining account.
    let mut v: Vec<AccountInfo<'_>> = Vec::with_capacity(ctx.remaining_accounts.len() + 1);

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

    // NB: TRoll hardcodes Some(100) to match
    require!(
        optional_royalty_pct == Some(100),
        TcompError::OptionalRoyaltiesNotYetEnabled
    );

    let (creator_accounts, remaining_accounts) = remaining_accounts.split_at(creator_shares.len());
    let (creator_ata_accounts, proof_accounts) = remaining_accounts.split_at(creator_shares.len());
    let creator_accounts_with_ata = creator_accounts
        .iter()
        .zip(creator_ata_accounts.iter())
        .flat_map(|(creator, ata)| vec![creator.to_account_info(), ata.to_account_info()])
        .collect::<Vec<_>>();

    // Verification occurs during transfer_cnft (ie creator_shares/verified/royalty checked via creator_hash).
    let CnftArgs {
        asset_id,
        data_hash,
        creator_hash,
        creators,
    } = make_cnft_args(MakeCnftArgs {
        nonce,
        metadata_src: MetadataSrc::DataHash(DataHashArgs {
            meta_hash,
            creator_shares,
            creator_verified,
            seller_fee_basis_points,
        }),
        merkle_tree: ctx.accounts.merkle_tree.deref(),
        creator_accounts,
    })?;

    let amount = list_state.amount;
    let currency = list_state.currency;
    require!(amount <= max_amount, TcompError::PriceMismatch);
    require!(
        list_state.currency == Some(ctx.accounts.currency.key()),
        TcompError::CurrencyMismatch
    );
    // Should be checked in transfer_cnft, but why not.
    require!(asset_id == list_state.asset_id, TcompError::AssetIdMismatch);

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

    let creator_fee = calc_creators_fee(seller_fee_basis_points, amount, optional_royalty_pct)?;

    // --------------------------------------- nft transfer
    // (!) Has to go before lamport transfers to prevent "sum of account balances before and after instruction do not match"

    transfer_cnft(TransferArgs {
        root,
        nonce,
        index,
        data_hash,
        creator_hash,
        tree_authority: ctx.accounts.tree_authority.deref(),
        leaf_owner: ctx.accounts.list_state.deref().as_ref(),
        leaf_delegate: ctx.accounts.list_state.deref().as_ref(),
        new_leaf_owner: ctx.accounts.buyer.deref(),
        merkle_tree: ctx.accounts.merkle_tree.deref(),
        log_wrapper: ctx.accounts.log_wrapper.deref(),
        compression_program: ctx.accounts.compression_program.deref(),
        system_program: ctx.accounts.system_program.deref(),
        bubblegum_program: ctx.accounts.bubblegum_program.deref(),
        proof_accounts,
        signer: Some(ctx.accounts.list_state.deref().as_ref()),
        signer_seeds: Some(&ctx.accounts.list_state.seeds()),
    })?;

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

    // --------------------------------------- token transfers

    // Pay fees
    ctx.accounts
        .transfer_currency(ctx.accounts.fee_vault_ta.deref().as_ref(), tcomp_fee)?;

    ctx.accounts.transfer_currency(
        ctx.accounts
            .maker_broker_currency_ta
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault_ta)
            .deref()
            .as_ref(),
        maker_broker_fee,
    )?;

    ctx.accounts.transfer_currency(
        ctx.accounts
            .taker_broker_currency_ta
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault_ta)
            .deref()
            .as_ref(),
        taker_broker_fee,
    )?;

    // Pay creators
    transfer_creators_fee(
        &creators.into_iter().map(Into::into).collect(),
        &mut creator_accounts_with_ata.iter(),
        creator_fee,
        &CreatorFeeMode::Spl {
            associated_token_program: &ctx.accounts.associated_token_program,
            token_program: &ctx.accounts.token_program,
            system_program: &ctx.accounts.system_program,
            currency: ctx.accounts.currency.deref().as_ref(),
            from: &ctx.accounts.payer,
            from_token_acc: ctx.accounts.payer_source.deref().as_ref(),
            rent_payer: &ctx.accounts.rent_payer,
        },
    )?;

    // Pay the seller (NB: the full listing amount since taker pays above fees + royalties)
    ctx.accounts
        .transfer_currency(ctx.accounts.owner_destination.deref().as_ref(), amount)?;

    Ok(())
}
