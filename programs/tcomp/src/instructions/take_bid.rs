use crate::*;

#[derive(Accounts)]
pub struct TakeBid<'info> {
    // Acts purely as a fee account
    /// CHECK: seeds
    #[account(mut, seeds=[], bump)]
    pub tcomp: UncheckedAccount<'info>,
    /// CHECK: downstream
    pub tree_authority: UncheckedAccount<'info>,
    /// CHECK: downstream (dont make Signer coz either this or delegate will sign)
    #[account(mut)]
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
    #[account(mut,
        seeds=[b"bid_state".as_ref(), owner.key().as_ref(), bid_state.bid_id.as_ref()],
        bump = bid_state.bump[0],
        close = owner,
        has_one = owner
    )]
    pub bid_state: Box<Account<'info, BidState>>,
    // Owner needs to be passed in as mutable account, so we reassign lamports back to them
    /// CHECK: has_one = owner on bid_state
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    /// CHECK: none, can be anything
    #[account(mut)]
    pub taker_broker: UncheckedAccount<'info>,
    /// CHECK: none, can be anything
    #[account(mut)]
    pub maker_broker: UncheckedAccount<'info>,
    /// CHECK: optional, manually handled in handler: 1)seeds, 2)program owner, 3)normal owner, 4)margin acc stored on pool
    #[account(mut)]
    pub margin_account: UncheckedAccount<'info>,
    // Remaining accounts:
    // 1. creators (1-5)
    // 2. proof accounts (less canopy)
}

impl<'info> Validate<'info> for TakeBid<'info> {
    fn validate(&self) -> Result<()> {
        let bid_state = &self.bid_state;
        require!(
            bid_state.version == CURRENT_TCOMP_VERSION,
            TcompError::WrongStateVersion
        );
        require!(
            bid_state.expiry >= Clock::get()?.unix_timestamp,
            TcompError::BidExpired
        );
        if let Some(private_taker) = bid_state.private_taker {
            require!(
                private_taker == self.seller.key(),
                TcompError::TakerNotAllowed
            );
        }
        if let Some(maker_broker) = bid_state.maker_broker {
            require!(
                maker_broker == self.maker_broker.key(),
                TcompError::BrokerMismatch
            )
        }

        Ok(())
    }
}

impl<'info> TakeBid<'info> {
    fn take_bid_shared(
        &self,
        asset_id: Pubkey,
        creator_hash: [u8; 32],
        data_hash: [u8; 32],
        creators: Vec<Creator>,
        nonce: u64,
        index: u32,
        root: [u8; 32],
        min_amount: u64,
        optional_royalty_pct: Option<u16>,
        seller_fee_basis_points: u16,
        creator_accounts: &[AccountInfo<'info>],
        proof_accounts: &[AccountInfo<'info>],
    ) -> Result<()> {
        let bid_state = &self.bid_state;
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
            tree_authority: &self.tree_authority.to_account_info(),
            leaf_owner: &self.seller.to_account_info(),
            leaf_delegate: &self.delegate.to_account_info(),
            new_leaf_owner: &self.owner.to_account_info(),
            merkle_tree: &self.merkle_tree.to_account_info(),
            log_wrapper: &self.log_wrapper.to_account_info(),
            compression_program: &self.compression_program.to_account_info(),
            system_program: &self.system_program.to_account_info(),
            bubblegum_program: &self.bubblegum_program.to_account_info(),
            proof_accounts,
            signer: None,
        })?;

        record_event(
            &TcompEvent::Taker(TakeEvent {
                taker: *self.seller.key,
                asset_id,
                amount,
                tcomp_fee,
                taker_broker_fee: broker_fee,
                //TODO: maker broker disabled
                maker_broker_fee: 0,
                creator_fee, // Can't record actual because we transfer lamports after we send noop tx
                currency,
            }),
            &self.tcomp_program,
            TcompSigner::Bid(&self.bid_state),
        )?;

        // --------------------------------------- sol transfers

        // TODO: handle currency (not v1)

        //if margin is used, move money into bid first
        if let Some(margin) = bid_state.margin {
            let margin_account_info = &self.margin_account.to_account_info();
            let margin_account =
                assert_decode_margin_account(margin_account_info, &self.owner.to_account_info())?;
            //doesn't hurt to check again (even though we checked when bidding)
            require!(
                margin_account.owner == *self.owner.key,
                TcompError::BadMargin
            );
            require!(*margin_account_info.key == margin, TcompError::BadMargin);
            tensorswap::cpi::withdraw_margin_account_cpi_tcomp(
                CpiContext::new(
                    self.tensorswap_program.to_account_info(),
                    tensorswap::cpi::accounts::WithdrawMarginAccountCpiTcomp {
                        margin_account: margin_account_info.clone(),
                        bid_state: self.bid_state.to_account_info(),
                        owner: self.owner.to_account_info(),
                        //transfer to bid state
                        destination: self.bid_state.to_account_info(),
                        system_program: self.system_program.to_account_info(),
                    },
                )
                .with_signer(&[&self.bid_state.seeds()]),
                //passing these in coz we're not deserializing the account tswap side
                bid_state.bump[0],
                bid_state.bid_id,
                //full amount, which later will be split into fees / royalties (seller pays)
                amount,
            )?;
        }

        // Pay fees
        transfer_lamports_from_pda(
            &self.bid_state.to_account_info(),
            &self.tcomp.to_account_info(),
            tcomp_fee,
        )?;

        transfer_lamports_from_pda(
            &self.bid_state.to_account_info(),
            &self.taker_broker.to_account_info(),
            broker_fee,
        )?;

        // Pay creators
        let actual_creator_fee = transfer_creators_fee(
            &FromAcc::Pda(&self.bid_state.to_account_info()),
            &creators,
            &mut creator_accounts.iter(),
            creator_fee,
        )?;

        // Pay the seller
        transfer_lamports_from_pda(
            &self.bid_state.to_account_info(),
            &self.seller.to_account_info(),
            unwrap_checked!({
                amount
                    .checked_sub(tcomp_fee)?
                    .checked_sub(broker_fee)?
                    .checked_sub(actual_creator_fee)
            }),
        )?;

        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn handler_full_meta<'info>(
    ctx: Context<'_, '_, '_, 'info, TakeBid<'info>>,
    nonce: u64,
    index: u32,
    root: [u8; 32],
    meta_args: TMetadataArgs,
    // Passing these in so seller doesn't get rugged
    min_amount: u64,
    optional_royalty_pct: Option<u16>,
) -> Result<()> {
    // TODO: for now enforcing
    require!(
        optional_royalty_pct == Some(100),
        TcompError::OptionalRoyaltiesNotYetEnabled
    );

    let (creator_accounts, proof_accounts) = ctx
        .remaining_accounts
        .split_at(meta_args.creator_shares.len());
    let bid_state = &ctx.accounts.bid_state;
    let seller_fee_basis_points = meta_args.seller_fee_basis_points;

    // Verification occurs during transfer_cnft (ie creator_shares/verified/royalty checked via creator_hash).
    let CnftArgs {
        asset_id,
        data_hash,
        creator_hash,
        creators,
    } = make_cnft_args(MakeCnftArgs {
        nonce,
        metadata_src: MetadataSrc::Metadata(meta_args.clone()),
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        creator_accounts,
    })?;

    match bid_state.target {
        BidTarget::AssetId => {
            throw_err!(TcompError::WrongIxForBidTarget);
        }
        BidTarget::Voc => match meta_args.collection {
            Some(collection) => {
                // We know from the above data_hash + subsequent transfer_cnft call that the correct collection key has been passed
                // No need to check if verified, for cNFTs that's a degenerate field
                require!(
                    collection.key == bid_state.target_id,
                    TcompError::WrongTargetId
                );
            }
            None => {
                throw_err!(TcompError::MissingCollection);
            }
        },
        BidTarget::Fvc => {
            // We know from the above creators_hash + subsequent transfer_cnft call that the correct creators list has been passed
            let fvc = creators.iter().find(|c| c.verified);
            match fvc {
                Some(fvc) => {
                    require!(
                        bid_state.target_id == fvc.address,
                        TcompError::WrongTargetId
                    );
                }
                None => {
                    throw_err!(TcompError::MissingFvc);
                }
            }
        }
    }

    // Check the bid field filter if it exists.
    if let Some(field) = &bid_state.field {
        match field {
            BidField::Name => {
                let mut name_arr = [0u8; 32];
                name_arr[..meta_args.name.len()].copy_from_slice(meta_args.name.as_bytes());
                require!(
                    name_arr == bid_state.field_id.unwrap().to_bytes(),
                    TcompError::WrongBidFieldId
                );
            }
        }
    }

    ctx.accounts.take_bid_shared(
        asset_id,
        creator_hash,
        data_hash,
        creators,
        nonce,
        index,
        root,
        min_amount,
        optional_royalty_pct,
        seller_fee_basis_points,
        creator_accounts,
        proof_accounts,
    )
}

#[access_control(ctx.accounts.validate())]
pub fn handler_meta_hash<'info>(
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
    optional_royalty_pct: Option<u16>,
) -> Result<()> {
    // TODO: for now enforcing
    require!(
        optional_royalty_pct == Some(100),
        TcompError::OptionalRoyaltiesNotYetEnabled
    );

    let (creator_accounts, proof_accounts) = ctx.remaining_accounts.split_at(creator_shares.len());
    let bid_state = &ctx.accounts.bid_state;

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

    match bid_state.target {
        BidTarget::AssetId => {
            require!(bid_state.target_id == asset_id, TcompError::WrongTargetId);
        }
        BidTarget::Voc => {
            // No way to do without having the entire metadata struct.
            throw_err!(TcompError::WrongIxForBidTarget);
        }
        BidTarget::Fvc => {
            // We know from the above verify fn call that the correct creators list has been passed
            let fvc = creators.iter().find(|c| c.verified);
            match fvc {
                Some(fvc) => {
                    require!(
                        bid_state.target_id == fvc.address,
                        TcompError::WrongTargetId
                    );
                }
                None => {
                    throw_err!(TcompError::MissingFvc);
                }
            }
        }
    }

    // Can't do field-based bids with this ix, need Metadata struct
    require!(bid_state.field.is_none(), TcompError::WrongIxForBidTarget);

    ctx.accounts.take_bid_shared(
        asset_id,
        creator_hash,
        data_hash,
        creators,
        nonce,
        index,
        root,
        min_amount,
        optional_royalty_pct,
        seller_fee_basis_points,
        creator_accounts,
        proof_accounts,
    )
}
