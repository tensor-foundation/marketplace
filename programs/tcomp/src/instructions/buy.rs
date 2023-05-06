use crate::*;

#[derive(Accounts)]
#[instruction(nonce: u64)]
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
    pub tcomp_program: Program<'info, crate::program::Tcomp>,
    /// CHECK: this ensures that specific asset_id belongs to specific owner
    #[account(mut, close = owner,
        seeds=[
            b"list_state".as_ref(),
            get_asset_id(&merkle_tree.key(), nonce).as_ref()
        ],
        bump = list_state.bump[0],
        has_one = owner
    )]
    pub list_state: Box<Account<'info, ListState>>,
    pub buyer: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    // Owner needs to be passed in as mutable account, so we reassign lamports back to them
    /// CHECK: has_one = owner on list_state
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    /// CHECK: none, can be anything
    #[account(mut)]
    pub taker_broker: UncheckedAccount<'info>,
    /// CHECK: none, can be anything
    #[account(mut)]
    pub maker_broker: UncheckedAccount<'info>,
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
            TcompError::OfferExpired
        );
        if let Some(private_taker) = list_state.private_taker {
            require!(
                private_taker == self.buyer.key(),
                TcompError::TakerNotAllowed
            );
        }
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
    require!(
        optional_royalty_pct == Some(100),
        TcompError::OptionalRoyaltiesNotYetEnabled
    );

    let (creator_accounts, proof_accounts) = ctx.remaining_accounts.split_at(creator_shares.len());

    // Have to verify to make sure 1)correct creators list, 2)shares, 3)seller_fee_basis_points
    let (asset_id, creator_hash, data_hash, creators) = verify_cnft(VerifyArgs {
        root,
        index,
        nonce,
        metadata_src: MetadataSrc::DataHash(DataHashArgs {
            meta_hash,
            creator_shares,
            creator_verified,
            seller_fee_basis_points,
        }),
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        leaf_owner: &ctx.accounts.list_state.to_account_info(), //<-- check with new owner
        leaf_delegate: &ctx.accounts.list_state.to_account_info(),
        creator_accounts,
        proof_accounts,
    })?;

    let list_state = &ctx.accounts.list_state;
    let amount = list_state.amount;
    let currency = list_state.currency;
    require!(amount <= max_amount, TcompError::PriceMismatch);

    let (tcomp_fee, broker_fee) = calc_fees(amount)?;
    let creator_fee = calc_creators_fee(seller_fee_basis_points, amount, optional_royalty_pct)?;

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
        signer: Some(&TcompSigner::List(&ctx.accounts.list_state)),
    })?;

    record_event(
        &TcompEvent::Taker(TakeEvent {
            taker: *ctx.accounts.buyer.key,
            asset_id,
            amount,
            tcomp_fee,
            taker_broker_fee: broker_fee,
            //TODO: maker broker disabled
            maker_broker_fee: 0,
            creator_fee, // Can't record actual because we transfer lamports after we send noop tx
            currency,
        }),
        &ctx.accounts.tcomp_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    // --------------------------------------- sol transfers

    // TODO: handle currency (not v1)

    // Pay fees
    ctx.accounts
        .transfer_lamports(&ctx.accounts.tcomp.to_account_info(), tcomp_fee)?;
    ctx.accounts
        .transfer_lamports(&ctx.accounts.taker_broker.to_account_info(), broker_fee)?;

    // Pay creators
    transfer_creators_fee(
        &FromAcc::External(&FromExternal {
            from: &ctx.accounts.payer.to_account_info(),
            sys_prog: &ctx.accounts.system_program,
        }),
        &creators,
        &mut creator_accounts.iter(),
        creator_fee,
    )?;

    // Pay the seller
    ctx.accounts
        .transfer_lamports(&ctx.accounts.owner.to_account_info(), amount)?;

    Ok(())
}