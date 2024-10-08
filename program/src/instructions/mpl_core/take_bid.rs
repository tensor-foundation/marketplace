use anchor_lang::prelude::*;
use metaplex_core::{
    accounts::BaseAssetV1,
    instructions::TransferV1CpiBuilder,
    types::{Royalties, UpdateAuthority},
};
use mpl_token_metadata::types::{Collection, TokenStandard};
use tensor_toolbox::{
    assert_fee_account,
    metaplex_core::{validate_asset, MetaplexCore},
};
use tensor_vipers::Validate;
use tensorswap::program::EscrowProgram;
use whitelist_program::{
    assert_decode_mint_proof_generic, assert_decode_whitelist_generic, FullMerkleProof,
    MintProofType, WhitelistType, ZERO_ARRAY,
};

use crate::{
    program::MarketplaceProgram,
    take_bid_common::{take_bid_shared, TakeBidArgs},
    BidState, Field, Target, TcompError, CURRENT_TCOMP_VERSION,
};

#[derive(Accounts)]
pub struct TakeBidCore<'info> {
    /// CHECK: checked in assert_fee_account()
    #[account(mut)]
    pub fee_vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub seller: Signer<'info>,

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

    /// CHECK: checked in validate()
    #[account(mut)]
    pub maker_broker: Option<UncheckedAccount<'info>>,

    /// CHECK: optional, manually handled in handler: 1)seeds, 2)program owner, 3)normal owner, 4)margin acc stored on pool
    #[account(mut)]
    pub shared_escrow: UncheckedAccount<'info>,

    /// CHECK: manually below, since this account is optional
    pub whitelist: UncheckedAccount<'info>,

    /// CHECK: validated on the instruction + whitelist check
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,

    /// CHECK: validated on instruction handler
    pub collection: Option<UncheckedAccount<'info>>,

    pub mpl_core_program: Program<'info, MetaplexCore>,

    pub system_program: Program<'info, System>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    pub escrow_program: Program<'info, EscrowProgram>,

    // cosigner is checked in validate()
    pub cosigner: Option<Signer<'info>>,

    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    /// CHECK: assert_decode_mint_proof
    pub mint_proof: UncheckedAccount<'info>,

    /// CHECK: bid_state.get_rent_payer()
    #[account(mut,
        constraint = rent_destination.key() == bid_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,
    // Remaining accounts:
    // 1. creators (1-5)
}

impl<'info> Validate<'info> for TakeBidCore<'info> {
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

#[access_control(ctx.accounts.validate())]
pub fn process_take_bid_core<'info>(
    ctx: Context<'_, '_, '_, 'info, TakeBidCore<'info>>,
    // Passing these in so seller doesn't get rugged
    min_amount: u64,
) -> Result<()> {
    // validate the asset account
    let royalties = validate_asset(
        &ctx.accounts.asset,
        ctx.accounts.collection.as_ref().map(|c| c.as_ref()),
    )?;

    let bid_state = &ctx.accounts.bid_state;
    let asset_id = ctx.accounts.asset.key();

    let (creators, seller_fee, token_standard) = if let Some(Royalties {
        creators,
        basis_points,
        ..
    }) = royalties
    {
        (
            creators,
            basis_points,
            TokenStandard::ProgrammableNonFungible,
        )
    } else {
        (vec![], 0, TokenStandard::NonFungible)
    };

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

            let mint_proof_acc = &ctx.accounts.mint_proof;

            // Check if actual mint proof and not a dummy account.
            let mint_proof = if ctx.accounts.mint_proof.owner == &whitelist_program::ID {
                let mint_proof_type = assert_decode_mint_proof_generic(
                    ctx.accounts.whitelist.key,
                    &asset_id,
                    mint_proof_acc,
                )?;

                let leaf = anchor_lang::solana_program::keccak::hash(asset_id.as_ref());

                let proof = match mint_proof_type {
                    MintProofType::V1(mint_proof) => {
                        let mut proof = mint_proof.proof.to_vec();
                        proof.truncate(mint_proof.proof_len as usize);
                        proof
                    }
                    MintProofType::V2(mint_proof) => {
                        let mut proof = mint_proof.proof.to_vec();
                        proof.truncate(mint_proof.proof_len as usize);
                        proof
                    }
                };

                Some(FullMerkleProof {
                    proof: proof.clone(),
                    leaf: leaf.0,
                })
            } else {
                None
            };

            let whitelist_type = assert_decode_whitelist_generic(&ctx.accounts.whitelist)?;

            match whitelist_type {
                WhitelistType::V1(whitelist) => {
                    //prioritize merkle tree if proof present
                    if whitelist.root_hash != ZERO_ARRAY {
                        require!(mint_proof.is_some(), TcompError::BadMintProof);

                        whitelist.verify_whitelist(None, mint_proof)?;
                    } else if let Some(collection) = &ctx.accounts.collection {
                        let asset = BaseAssetV1::try_from(ctx.accounts.asset.as_ref())?;

                        if let UpdateAuthority::Collection(c) = asset.update_authority {
                            if c != *collection.key {
                                msg!("Asset collection account does not match the provided collection account");
                                return Err(TcompError::MissingCollection.into());
                            }

                            whitelist.verify_whitelist_tcomp(
                                Some(Collection {
                                    key: collection.key(),
                                    // there is no verify flag on Core, but only the collection update authority
                                    // can set a collection
                                    verified: true,
                                }),
                                // creators have no verified flag on Core, they can't be used
                                None,
                            )?;
                        } else {
                            msg!("Asset has no collection set");
                            return Err(TcompError::MissingCollection.into());
                        }
                    } else {
                        return Err(TcompError::MissingCollection.into());
                    }
                }
                WhitelistType::V2(whitelist) => {
                    let asset = BaseAssetV1::try_from(ctx.accounts.asset.as_ref())?;

                    let collection = match asset.update_authority {
                        UpdateAuthority::Collection(address) => Some(Collection {
                            key: address,
                            verified: true, // Only the collection update authority can set a collection, so this is always verified.
                        }),
                        _ => None,
                    };

                    // creators have no verified flag on Core, they can't be used
                    let creators = None;

                    whitelist.verify(&collection, &creators, &mint_proof)?;
                }
            }
        }
    }

    // Check the bid field filter if it exists.
    if let Some(field) = &bid_state.field {
        let asset = BaseAssetV1::try_from(&ctx.accounts.asset.to_account_info())?;

        match field {
            &Field::Name => {
                let mut name_arr = [0u8; 32];
                name_arr[..asset.name.len()].copy_from_slice(asset.name.as_bytes());
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

    // transfer the NFT

    TransferV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
        .asset(&ctx.accounts.asset)
        .authority(Some(&ctx.accounts.seller.to_account_info()))
        .new_owner(&ctx.accounts.owner)
        .payer(&ctx.accounts.seller) // pay for what?
        .collection(ctx.accounts.collection.as_ref().map(|c| c.as_ref()))
        .invoke()?;

    take_bid_shared(TakeBidArgs {
        bid_state: &mut ctx.accounts.bid_state,
        seller: &ctx.accounts.seller.to_account_info(),
        escrow: &ctx.accounts.shared_escrow,
        owner: &ctx.accounts.owner,
        rent_destination: &ctx.accounts.rent_destination,
        maker_broker: &ctx.accounts.maker_broker,
        taker_broker: &ctx.accounts.taker_broker,
        fee_vault: &ctx.accounts.fee_vault.to_account_info(),
        asset_id,
        token_standard: Some(token_standard),
        creators: creators.into_iter().map(Into::into).collect(),
        min_amount,
        optional_royalty_pct: None,
        seller_fee_basis_points: seller_fee,
        creator_accounts: ctx.remaining_accounts,
        marketplace_prog: &ctx.accounts.marketplace_program,
        escrow_prog: &ctx.accounts.escrow_program,
        system_prog: &ctx.accounts.system_program,
    })
}
