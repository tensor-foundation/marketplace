use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};
use tensor_toolbox::{
    calc_creators_fee, calc_fees, fees::ID as TFEE_PROGRAM_ID, make_cnft_args, shard_num,
    transfer_cnft, transfer_creators_fee, CnftArgs, CreatorFeeMode, DataHashArgs, MakeCnftArgs,
    MetadataSrc, TransferArgs,
};

use crate::*;

#[derive(Accounts)]
pub struct BuySpl<'info> {
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

    #[account(init_if_needed,
        payer = rent_payer,
        associated_token::mint = currency,
        associated_token::authority = fee_vault,
    )]
    pub fee_vault_ata: Box<InterfaceAccount<'info, TokenAccount>>,
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
    #[account(mut, close = rent_dest,
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
    pub owner_dest: Box<InterfaceAccount<'info, TokenAccount>>,
    /// CHECK: list_state.currency
    pub currency: Box<InterfaceAccount<'info, Mint>>,
    // TODO: brokers are Option<T> to save bytes
    /// CHECK: none, can be anything
    #[account(mut)]
    pub taker_broker: Option<UncheckedAccount<'info>>,
    #[account(init_if_needed,
        payer = rent_payer,
        associated_token::mint = currency,
        associated_token::authority = taker_broker,
    )]
    pub taker_broker_ata: Option<Box<InterfaceAccount<'info, TokenAccount>>>,
    /// CHECK: none, can be anything
    #[account(mut)]
    pub maker_broker: Option<UncheckedAccount<'info>>,
    #[account(init_if_needed,
        payer = rent_payer,
        associated_token::mint = currency,
        associated_token::authority = maker_broker,
    )]
    pub maker_broker_ata: Option<Box<InterfaceAccount<'info, TokenAccount>>>,
    /// CHECK: list_state.get_rent_payer()
    #[account(mut,
        constraint = rent_dest.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_dest: UncheckedAccount<'info>,
    #[account(mut)]
    pub rent_payer: Signer<'info>,
    // cosigner is checked in validate()
    pub cosigner: Option<Signer<'info>>,
    // Remaining accounts:
    // 1. creators (1-5)
    // 2. creators atas (1-5)
    // 2. proof accounts (less canopy)
}

impl<'info> Validate<'info> for BuySpl<'info> {
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

        // maker_broker accs are both None or Some
        #[rustfmt::skip]
        require!(
            (self.maker_broker.is_some() && self.maker_broker_ata.is_some()) ||
            (self.maker_broker.is_none() && self.maker_broker_ata.is_none()),
            TcompError::BrokerMismatch
        );

        //taker_broker accs are both None or Some
        #[rustfmt::skip]
        require!(
            (self.taker_broker.is_some() && self.taker_broker_ata.is_some()) ||
            (self.taker_broker.is_none() && self.taker_broker_ata.is_none()),
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

impl<'info> BuySpl<'info> {
    fn transfer_ata(
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
                    from: self.payer_source.to_account_info(),
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
pub fn process_buy_spl<'info>(
    ctx: Context<'_, '_, '_, 'info, BuySpl<'info>>,
    nonce: u64,
    index: u32,
    root: [u8; 32],
    meta_hash: [u8; 32],
    // Below 3 used for creator verification
    // Creators themseleves taken from extra accounts
    creator_shares: Vec<u8>,
    creator_verified: Vec<bool>,
    seller_fee_basis_points: u16,
    // Passing these in so buyer doesn't get rugged
    max_amount: u64,
    optional_royalty_pct: Option<u16>,
) -> Result<()> {
    // TODO: for now enforcing
    // NB: TRoll hardcodes Some(100) to match
    require!(
        optional_royalty_pct == Some(100),
        TcompError::OptionalRoyaltiesNotYetEnabled
    );

    let (creator_accounts, remaining_accounts) =
        ctx.remaining_accounts.split_at(creator_shares.len());
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

    let list_state = &ctx.accounts.list_state;
    let amount = list_state.amount;
    let currency = list_state.currency;
    require!(amount <= max_amount, TcompError::PriceMismatch);
    require!(
        list_state.currency == Some(ctx.accounts.currency.key()),
        TcompError::CurrencyMismatch
    );
    // Should be checked in transfer_cnft, but why not.
    require!(asset_id == list_state.asset_id, TcompError::AssetIdMismatch);

    let (tcomp_fee, maker_broker_fee, taker_broker_fee) = calc_fees(
        amount,
        TCOMP_FEE_BPS,
        MAKER_BROKER_PCT,
        list_state.maker_broker,
        ctx.accounts.taker_broker.as_ref().map(|acc| acc.key()),
    )?;
    // TODO: pnfts
    let creator_fee =
        calc_creators_fee(seller_fee_basis_points, amount, None, optional_royalty_pct)?;

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
    ctx.accounts.transfer_ata(
        ctx.accounts.fee_vault_ata.deref().as_ref(),
        ctx.accounts.currency.deref().as_ref(),
        tcomp_fee,
        ctx.accounts.currency.decimals,
    )?;

    ctx.accounts.transfer_ata(
        ctx.accounts
            .maker_broker_ata
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault_ata)
            .deref()
            .as_ref(),
        ctx.accounts.currency.deref().as_ref(),
        maker_broker_fee,
        ctx.accounts.currency.decimals,
    )?;

    ctx.accounts.transfer_ata(
        ctx.accounts
            .taker_broker_ata
            .as_ref()
            .unwrap_or(&ctx.accounts.fee_vault_ata)
            .deref()
            .as_ref(),
        ctx.accounts.currency.deref().as_ref(),
        taker_broker_fee,
        ctx.accounts.currency.decimals,
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
    ctx.accounts.transfer_ata(
        ctx.accounts.owner_dest.deref().as_ref(),
        ctx.accounts.currency.deref().as_ref(),
        amount,
        ctx.accounts.currency.decimals,
    )?;

    Ok(())
}