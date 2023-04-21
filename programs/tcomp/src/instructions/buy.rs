use crate::*;

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct Buy<'info> {
    /// CHECK: downstream
    pub tree_authority: UncheckedAccount<'info>,
    pub buyer: Signer<'info>,
    /// CHECK: downstream
    #[account(mut)]
    pub merkle_tree: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub system_program: Program<'info, System>,
    pub bubblegum_program: Program<'info, Bubblegum>,
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
    #[account(mut)]
    pub payer: Signer<'info>,
    // Owner needs to be passed in as mutable account, so we reassign lamports back to them
    /// CHECK: has_one = owner on list_state
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    // Acts purely as a fee account
    /// CHECK: seeds
    #[account(mut, seeds=[], bump)]
    pub tcomp: UncheckedAccount<'info>,
    /// CHECK: none, can be anything
    pub taker_broker: UncheckedAccount<'info>,
    // Remaining accounts:
    // 1. creators (1-5)
    // 2. proof accounts (less canopy)
}

impl<'info> Validate<'info> for Buy<'info> {
    fn validate(&self) -> Result<()> {
        let list_state = &self.list_state;
        // Verify expiry
        require!(
            list_state.expiry >= Clock::get()?.unix_timestamp,
            TcompError::OfferExpired
        );
        // Verify private taker
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
    metadata: TMetadataArgs,
    // Passing these in so buyer doesn't get rugged
    max_amount: u64,
    currency: Option<Pubkey>,
    optional_royalty_pct: Option<u16>,
) -> Result<()> {
    let (creator_accounts, proof_accounts) = ctx
        .remaining_accounts
        .split_at(metadata.creator_shares.len());

    // TODO: 0xrwu - does this make sense? my thinking is that we HAVE TO verify instead of letting them passin data/creator hashes
    //  otherwise they pass in any creators (themselves) and send royalties there
    // Have to verify to make sure 1)correct creators list and 2)correct seller_fee_basis_points
    let (asset_id, creator_hash, data_hash, mplex_metadata) = verify_cnft(VerifyArgs {
        root,
        index,
        nonce,
        metadata,
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        leaf_owner: &ctx.accounts.list_state.to_account_info(), //<-- check with new owner
        leaf_delegate: &ctx.accounts.list_state.to_account_info(),
        compression_program: &ctx.accounts.compression_program.to_account_info(),
        creator_accounts,
        proof_accounts,
    })?;

    let list_state = &ctx.accounts.list_state;
    let amount = list_state.amount;
    let expiry = list_state.expiry;
    let currency = list_state.currency;
    let private_taker = list_state.private_taker;
    require!(amount <= max_amount, TcompError::PriceMismatch);

    let (tcomp_fee, broker_fee) = calc_fees(amount)?;
    let creator_fee = calc_creators_fee(&mplex_metadata, amount, optional_royalty_pct)?;

    // --------------------------------------- sol transfers

    // TODO: handle currency (not v1)

    // Pay fees
    ctx.accounts
        .transfer_lamports(&ctx.accounts.tcomp.to_account_info(), tcomp_fee)?;
    ctx.accounts
        .transfer_lamports(&ctx.accounts.taker_broker.to_account_info(), broker_fee)?;

    // Pay creators
    let actual_creator_fee = transfer_creators_fee(
        None,
        Some(FromExternal {
            from: &ctx.accounts.payer.to_account_info(),
            sys_prog: &ctx.accounts.system_program,
        }),
        &mplex_metadata,
        &mut creator_accounts.iter(),
        creator_fee,
    )?;

    // Pay the seller
    ctx.accounts
        .transfer_lamports(&ctx.accounts.owner.to_account_info(), amount)?;

    // --------------------------------------- nft transfer

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
        signer_bid: None,
        signer_listing: Some(&ctx.accounts.list_state),
    })?;

    emit!(TakeEvent {
        taker: *ctx.accounts.owner.key,
        asset_id,
        amount,
        tcomp_fee,
        broker_fee,
        creator_fee: actual_creator_fee,
        currency,
    });

    Ok(())
}
