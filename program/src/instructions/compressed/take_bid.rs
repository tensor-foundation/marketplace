use mpl_bubblegum::types::Creator;
use tensor_toolbox::{
    assert_fee_account, make_cnft_args, transfer_cnft, CnftArgs, DataHashArgs, MakeCnftArgs,
    MetadataSrc, TransferArgs,
};
use tensorswap::program::EscrowProgram;
use whitelist_program::{assert_decode_whitelist_generic, WhitelistType};

use crate::{take_bid_common::*, *};

#[derive(Accounts)]
pub struct TakeBidCompressed<'info> {
    /// CHECK: Seeds checked here, account has no state.
    #[account(mut)]
    pub fee_vault: UncheckedAccount<'info>,
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
    pub marketplace_program: Program<'info, crate::program::MarketplaceProgram>,
    pub tensorswap_program: Program<'info, EscrowProgram>,
    /// CHECK: this ensures that specific asset_id belongs to specific owner
    #[account(mut,
        seeds=[b"bid_state".as_ref(), owner.key().as_ref(), bid_state.bid_id.as_ref()],
        bump = bid_state.bump[0],
        has_one = owner
    )]
    pub bid_state: Box<Account<'info, BidState>>,
    // Owner needs to be passed in as mutable account, so we reassign lamports back to them
    /// CHECK: has_one = owner on bid_state
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,
    /// CHECK: none, can be anything
    #[account(mut)]
    pub taker_broker: Option<UncheckedAccount<'info>>,
    /// CHECK: none, can be anything
    #[account(mut)]
    pub maker_broker: Option<UncheckedAccount<'info>>,
    /// CHECK: optional, manually handled in handler: 1)seeds, 2)program owner, 3)normal owner, 4)margin acc stored on pool
    #[account(mut)]
    pub shared_escrow: UncheckedAccount<'info>,
    /// CHECK: manually below, since this account is optional
    pub whitelist: UncheckedAccount<'info>,
    // cosigner is checked in validate()
    pub cosigner: Option<Signer<'info>>,
    /// CHECK: bid_state.get_rent_payer()
    #[account(mut,
        constraint = rent_destination.key() == bid_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,
    // Remaining accounts:
    // 1. creators (1-5)
    // 2. proof accounts (less canopy)
}

impl<'info> Validate<'info> for TakeBidCompressed<'info> {
    fn validate(&self) -> Result<()> {
        assert_fee_account(
            &self.fee_vault.to_account_info(),
            &self.bid_state.to_account_info(),
        )?;

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

        require!(
            bid_state.maker_broker == self.maker_broker.as_ref().map(|acc| acc.key()),
            TcompError::BrokerMismatch
        );

        // check if the cosigner is required
        if bid_state.cosigner != Pubkey::default() {
            let signer = self.cosigner.as_ref().ok_or(TcompError::BadCosigner)?;

            require!(bid_state.cosigner == *signer.key, TcompError::BadCosigner);
        }

        Ok(())
    }
}

impl<'info> TakeBidCompressed<'info> {
    fn take_bid_shared(
        &mut self,
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
            signer_seeds: None,
        })?;

        take_bid_shared(TakeBidArgs {
            bid_state: &mut self.bid_state,
            seller: &self.seller,
            escrow: &self.shared_escrow,
            owner: &self.owner,
            rent_destination: &self.rent_destination,
            maker_broker: &self.maker_broker,
            taker_broker: &self.taker_broker,
            fee_vault: self.fee_vault.deref(),
            asset_id,
            token_standard: None,
            creators: creators.into_iter().map(Into::into).collect(),
            min_amount,
            optional_royalty_pct,
            seller_fee_basis_points,
            creator_accounts,
            marketplace_prog: &self.marketplace_program,
            escrow_prog: &self.tensorswap_program,
            system_prog: &self.system_program,
        })
    }
}

#[access_control(ctx.accounts.validate())]
pub fn handler_full_meta<'info>(
    ctx: Context<'_, '_, '_, 'info, TakeBidCompressed<'info>>,
    nonce: u64,
    index: u32,
    root: [u8; 32],
    meta_args: TMetadataArgs,
    // Passing these in so seller doesn't get rugged
    min_amount: u64,
    optional_royalty_pct: Option<u16>,
) -> Result<()> {
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
        metadata_src: MetadataSrc::Metadata(meta_args.clone().into(creator_accounts)),
        merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
        creator_accounts,
    })?;

    match bid_state.target {
        Target::AssetId => {
            throw_err!(TcompError::WrongIxForBidTarget);
        }
        Target::Whitelist => {
            // Ensure the correct whitelist is passed in
            require!(
                *ctx.accounts.whitelist.key == bid_state.target_id,
                TcompError::WrongTargetId
            );
            let collection =
                meta_args
                    .collection
                    .map(|collection| mpl_token_metadata::types::Collection {
                        key: collection.key,
                        verified: collection.verified,
                    });

            // Block selling into Tensorian Shards bids (shards useless: protect uninformed bidders).
            if let Some(coll) = &collection {
                require!(
                    coll.key.ne(
                        &Pubkey::from_str("4gyWUNxb7HfekUegqi3ndgBPmJLQZXo1mRZVeuk5Edsq").unwrap()
                    ),
                    TcompError::ForbiddenCollection
                );
            }

            let creators = Some(
                creators
                    .iter()
                    .map(|c| mpl_token_metadata::types::Creator {
                        address: c.address,
                        verified: c.verified,
                        share: c.share,
                    })
                    .collect::<Vec<_>>(),
            );

            let whitelist_type = assert_decode_whitelist_generic(&ctx.accounts.whitelist)?;

            match whitelist_type {
                WhitelistType::V1(whitelist) => {
                    whitelist.verify_whitelist_tcomp(collection, creators)?;
                }
                WhitelistType::V2(whitelist) => {
                    whitelist.verify(&collection, &creators, &None)?;
                }
            }
        }
    }

    // Check the bid field filter if it exists.
    if let Some(field) = &bid_state.field {
        match field {
            Field::Name => {
                let mut name_arr = [0u8; 32];
                name_arr[..meta_args.name.len()].copy_from_slice(meta_args.name.as_bytes());
                require!(
                    name_arr
                        == bid_state
                            .field_id
                            .ok_or(TcompError::WrongBidFieldId)?
                            .to_bytes(),
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
    ctx: Context<'_, '_, '_, 'info, TakeBidCompressed<'info>>,
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
        Target::AssetId => {
            require!(bid_state.target_id == asset_id, TcompError::WrongTargetId);
        }
        Target::Whitelist => {
            // Ensure the correct whitelist is passed in
            require!(
                *ctx.accounts.whitelist.key == bid_state.target_id,
                TcompError::WrongTargetId
            );

            let creators = Some(
                creators
                    .iter()
                    .map(|c| mpl_token_metadata::types::Creator {
                        address: c.address,
                        verified: c.verified,
                        share: c.share,
                    })
                    .collect::<Vec<_>>(),
            );

            let whitelist_type = assert_decode_whitelist_generic(&ctx.accounts.whitelist)?;

            match whitelist_type {
                WhitelistType::V1(whitelist) => {
                    whitelist.verify_whitelist_tcomp(None, creators)?;
                }
                WhitelistType::V2(whitelist) => {
                    whitelist.verify(&None, &creators, &None)?;
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
