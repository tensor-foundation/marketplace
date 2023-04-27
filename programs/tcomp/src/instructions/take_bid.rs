use crate::*;

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct TakeBid<'info> {
    // Acts purely as a fee account
    /// CHECK: seeds
    #[account(mut, seeds=[], bump)]
    pub tcomp: UncheckedAccount<'info>,
    /// CHECK: downstream
    pub tree_authority: UncheckedAccount<'info>,
    /// CHECK: downstream (dont make Signer coz either this or delegate will sign)
    pub seller: UncheckedAccount<'info>,
    /// CHECK: downstream (dont make Signer coz either this or seller will sign)
    pub delegate: UncheckedAccount<'info>,
    /// CHECK: downstream
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub system_program: Program<'info, System>,
    pub bubblegum_program: Program<'info, Bubblegum>,
    pub tcomp_program: Program<'info, crate::program::Tcomp>,
    pub tensorswap_program: Program<'info, Tensorswap>,
    /// CHECK: this ensures that specific asset_id belongs to specific owner
    #[account(
        mut,
        seeds=[b"bid_state".as_ref(), owner.key().as_ref(), get_asset_id(&merkle_tree.key(), nonce).as_ref()],
        bump = bid_state.bump[0],
        close = owner,
        has_one = owner,
    )]
    pub bid_state: Box<Account<'info, BidState>>,
    // Owner needs to be passed in as mutable account, so we reassign lamports back to them
    /// CHECK: has_one = owner on bid_state
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    /// CHECK: none, can be anything
    #[account(mut)]
    pub taker_broker: UncheckedAccount<'info>,
    /// CHECK: optional, manually handled in handler: 1)seeds, 2)program owner, 3)normal owner, 4)margin acc stored on pool
    #[account(mut)]
    pub margin_account: UncheckedAccount<'info>,
    #[account(
        seeds = [],
        bump = tswap.bump[0],
        seeds::program = tensorswap::id(),
    )]
    pub tswap: Box<Account<'info, TSwap>>,
    // Remaining accounts:
    // 1. creators (1-5)
    // 2. proof accounts (less canopy)
}

impl<'info> Validate<'info> for TakeBid<'info> {
    fn validate(&self) -> Result<()> {
        let bid_state = &self.bid_state;
        // Verify expiry
        require!(
            bid_state.expiry >= Clock::get()?.unix_timestamp,
            TcompError::OfferExpired
        );
        // Verify private taker
        if let Some(private_taker) = bid_state.private_taker {
            require!(
                private_taker == self.seller.key(),
                TcompError::TakerNotAllowed
            );
        }
        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, TakeBid<'info>>,
    nonce: u64,
    index: u32,
    root: [u8; 32],
    meta_hash: [u8; 32],
    // Below 3 used for creator verification
    // Creators themseleves taken from extra accounts
    creator_shares: Vec<u8>,
    creator_verified: Vec<bool>,
    seller_fee_basis_points: u16,
    // Passing these in so seller doesn't get rugged
    min_amount: u64,
    _currency: Option<Pubkey>,
    optional_royalty_pct: Option<u16>,
) -> Result<()> {
    let (creator_accounts, proof_accounts) = ctx.remaining_accounts.split_at(creator_shares.len());

    // Have to verify to make sure 1)correct creators list and 2)correct seller_fee_basis_points
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
        leaf_owner: &ctx.accounts.seller.to_account_info(), //<-- check with new owner
        leaf_delegate: &ctx.accounts.delegate.to_account_info(),
        creator_accounts,
        proof_accounts,
    })?;

    let bid_state = &ctx.accounts.bid_state;
    let amount = bid_state.amount;
    let currency = bid_state.currency;
    require!(amount >= min_amount, TcompError::PriceMismatch);

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
        leaf_owner: &ctx.accounts.seller.to_account_info(),
        leaf_delegate: &ctx.accounts.delegate.to_account_info(),
        new_leaf_owner: &ctx.accounts.owner.to_account_info(),
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        log_wrapper: &ctx.accounts.log_wrapper.to_account_info(),
        compression_program: &ctx.accounts.compression_program.to_account_info(),
        system_program: &ctx.accounts.system_program.to_account_info(),
        bubblegum_program: &ctx.accounts.bubblegum_program.to_account_info(),
        proof_accounts,
        signer: None,
    })?;

    record_event(
        &TcompEvent::Taker(TakeEvent {
            taker: *ctx.accounts.owner.key,
            asset_id,
            amount,
            tcomp_fee,
            broker_fee,
            creator_fee, // Can't record actual because we transfer lamports after we send noop tx
            currency,
        }),
        &ctx.accounts.tcomp_program,
        TcompSigner::Bid(&ctx.accounts.bid_state),
    )?;

    // --------------------------------------- sol transfers

    // TODO: handle currency (not v1)

    //if margin is used, move money into bid first
    if let Some(margin) = bid_state.margin {
        let margin_account_info = &ctx.accounts.margin_account.to_account_info();
        let margin_account = assert_decode_margin_account(
            margin_account_info,
            &ctx.accounts.tswap.to_account_info(),
            &ctx.accounts.owner.to_account_info(),
        )?;
        //doesn't hurt to check again (even though we checked when bidding)
        require!(
            margin_account.owner == *ctx.accounts.owner.key,
            TcompError::BadMargin
        );
        require!(*margin_account_info.key == margin, TcompError::BadMargin);
        tensorswap::cpi::withdraw_margin_account_cpi_tcomp(
            CpiContext::new(
                ctx.accounts.tensorswap_program.to_account_info(),
                tensorswap::cpi::accounts::WithdrawMarginAccountCpiTcomp {
                    tswap: ctx.accounts.tswap.to_account_info(),
                    margin_account: margin_account_info.clone(),
                    bid_state: ctx.accounts.bid_state.to_account_info(),
                    owner: ctx.accounts.owner.to_account_info(),
                    merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
                    //transfer to bid state
                    destination: ctx.accounts.bid_state.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                },
            )
            .with_signer(&[&ctx.accounts.bid_state.seeds()]),
            bid_state.bump[0],
            nonce,
            //full amount, which later will be split into fees / royalties (seller pays)
            amount,
        )?;
    }

    // Pay fees
    transfer_lamports_from_pda(
        &ctx.accounts.bid_state.to_account_info(),
        &ctx.accounts.tcomp.to_account_info(),
        tcomp_fee,
    )?;

    transfer_lamports_from_pda(
        &ctx.accounts.bid_state.to_account_info(),
        &ctx.accounts.taker_broker.to_account_info(),
        broker_fee,
    )?;

    // Pay creators
    let actual_creator_fee = transfer_creators_fee(
        &FromAcc::Pda(&ctx.accounts.bid_state.to_account_info()),
        &creators,
        &mut creator_accounts.iter(),
        creator_fee,
    )?;

    // Pay the seller
    transfer_lamports_from_pda(
        &ctx.accounts.bid_state.to_account_info(),
        &ctx.accounts.seller.to_account_info(),
        unwrap_checked!({
            amount
                .checked_sub(tcomp_fee)?
                .checked_sub(broker_fee)?
                .checked_sub(actual_creator_fee)
        }),
    )?;

    Ok(())
}
