use crate::*;

#[derive(Accounts)]
pub struct Buy<'info> {
    // Acts purely as a fee account
    /// CHECK: seeds
    #[account(mut, seeds=[], bump)]
    pub tcomp: UncheckedAccount<'info>,
    /// CHECK: downstream
    pub tree_authority: UncheckedAccount<'info>,
    /// CHECK: downstream
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub system_program: Program<'info, System>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    pub tcomp_program: Program<'info, crate::program::MarketplaceProgram>,
    #[account(mut, close = rent_dest,
        seeds=[
            b"list_state".as_ref(),
            list_state.asset_id.as_ref(),
        ],
        bump = list_state.bump[0],
        has_one = owner,
        constraint = list_state.currency.is_none() @ TcompError::CurrencyMismatch,
    )]
    pub list_state: Box<Account<'info, ListState>>,
    /// CHECK: doesnt matter, but this lets you pass in a 3rd party received address
    pub buyer: UncheckedAccount<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    // Owner needs to be passed in as mutable account, so we reassign lamports back to them
    /// CHECK: has_one = owner on list_state
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    /// CHECK: none, can be anything
    #[account(mut)]
    pub taker_broker: Option<UncheckedAccount<'info>>,
    /// CHECK: none, can be anything
    #[account(mut)]
    pub maker_broker: Option<UncheckedAccount<'info>>,
    /// CHECK: list_state.get_rent_payer()
    #[account(mut,
        constraint = rent_dest.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_dest: UncheckedAccount<'info>,
    // Remaining accounts:
    // 1. creators (1-5)
    // 2. proof accounts (less canopy)
}

impl<'info> Validate<'info> for Buy<'info> {
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
        Ok(())
    }
}

impl<'info> Buy<'info> {
    fn transfer_lamports(&self, to: &AccountInfo<'info>, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.payer.key, to.key, lamports),
            &[
                self.payer.to_account_info(),
                to.clone(),
                self.system_program.to_account_info(),
            ],
        )
        .map_err(Into::into)
    }

    /// transfers lamports, skipping the transfer if not rent exempt
    fn transfer_lamports_min_balance(&self, to: &AccountInfo<'info>, lamports: u64) -> Result<()> {
        let rent = Rent::get()?.minimum_balance(to.data_len());
        if unwrap_int!(to.lamports().checked_add(lamports)) < rent {
            //skip current creator, we can't pay them
            return Ok(());
        }
        self.transfer_lamports(to, lamports)?;
        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, Buy<'info>>,
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

    let (creator_accounts, proof_accounts) = ctx.remaining_accounts.split_at(creator_shares.len());

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
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        creator_accounts,
    })?;

    let list_state = &ctx.accounts.list_state;
    let amount = list_state.amount;
    let currency = list_state.currency;
    require!(amount <= max_amount, TcompError::PriceMismatch);
    require!(currency.is_none(), TcompError::CurrencyMismatch);
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
        tree_authority: &ctx.accounts.tree_authority.to_account_info(),
        leaf_owner: &ctx.accounts.list_state.to_account_info(),
        leaf_delegate: &ctx.accounts.list_state.to_account_info(),
        new_leaf_owner: &ctx.accounts.buyer.to_account_info(),
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        log_wrapper: &ctx.accounts.log_wrapper.to_account_info(),
        compression_program: &ctx.accounts.compression_program.to_account_info(),
        system_program: &ctx.accounts.system_program.to_account_info(),
        bubblegum_program: &ctx.accounts.bubblegum_program.to_account_info(),
        proof_accounts,
        signer: Some(&ctx.accounts.list_state.to_account_info()),
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
        &ctx.accounts.tcomp_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    // --------------------------------------- sol transfers

    // Pay fees
    ctx.accounts
        .transfer_lamports(&ctx.accounts.tcomp.to_account_info(), tcomp_fee)?;

    ctx.accounts.transfer_lamports_min_balance(
        &ctx.accounts
            .maker_broker
            .as_ref()
            .unwrap_or(&ctx.accounts.tcomp)
            .to_account_info(),
        maker_broker_fee,
    )?;

    ctx.accounts.transfer_lamports_min_balance(
        &ctx.accounts
            .taker_broker
            .as_ref()
            .unwrap_or(&ctx.accounts.tcomp)
            .to_account_info(),
        taker_broker_fee,
    )?;

    // Pay creators
    transfer_creators_fee(
        &creators.into_iter().map(Into::into).collect(),
        &mut creator_accounts.iter(),
        creator_fee,
        &CreatorFeeMode::Sol {
            from: &FromAcc::External(&FromExternal {
                from: &ctx.accounts.payer.to_account_info(),
                sys_prog: &ctx.accounts.system_program,
            }),
        },
    )?;

    // Pay the seller (NB: the full listing amount since taker pays above fees + royalties)
    ctx.accounts
        .transfer_lamports(&ctx.accounts.owner.to_account_info(), amount)?;

    Ok(())
}
