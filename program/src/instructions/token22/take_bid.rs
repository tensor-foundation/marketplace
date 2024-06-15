use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, Token2022, TokenAccount, TransferChecked},
};
use mpl_token_metadata::types::TokenStandard;
use spl_token_metadata_interface::state::TokenMetadata;
use spl_type_length_value::state::{TlvState, TlvStateBorrowed};
use tensor_toolbox::{
    fees::ID as TFEE_PROGRAM_ID,
    shard_num,
    token_2022::{transfer::transfer_checked, validate_mint, RoyaltyInfo},
    TCreator,
};
use tensor_whitelist::{assert_decode_whitelist, FullMerkleProof, ZERO_ARRAY};
use tensorswap::program::EscrowProgram;
use vipers::Validate;

use crate::{
    take_bid_common::{assert_decode_mint_proof, take_bid_shared, TakeBidArgs},
    BidState, Field, Target, TcompError, CURRENT_TCOMP_VERSION,
};

#[derive(Accounts)]
pub struct TakeBidT22<'info> {
    /// CHECK: Seeds checked here, account has no state.
    #[account(
        mut,
        seeds = [
            b"fee_vault",
            // Use the last byte of the mint as the fee shard number
            shard_num!(bid_state),
        ],
        seeds::program = TFEE_PROGRAM_ID,
        bump
    )]
    pub fee_vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub seller: Signer<'info>,

    /// CHECK: this ensures that specific asset_id belongs to specific owner
    #[account(
        mut,
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
    pub margin_account: UncheckedAccount<'info>,

    /// CHECK: manually below, since this account is optional
    pub whitelist: UncheckedAccount<'info>,

    #[account(mut, token::mint = mint, token::authority = seller)]
    pub seller_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: whitelist, token::mint in seller_token, associated_token::mint in owner_ata_acc
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub owner_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Program<'info, Token2022>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub marketplace_program: Program<'info, crate::program::MarketplaceProgram>,

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
    //
    // ---- [0..n] remaining accounts for royalties transfer hook
}

impl<'info> Validate<'info> for TakeBidT22<'info> {
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

        require!(
            bid_state.maker_broker == self.maker_broker.as_ref().map(|acc| acc.key()),
            TcompError::BrokerMismatch
        );

        // check if the cosigner is required
        if let Some(cosigner) = bid_state.cosigner.value() {
            let signer = self.cosigner.as_ref().ok_or(TcompError::BadCosigner)?;

            require!(cosigner == signer.key, TcompError::BadCosigner);
        }

        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn process_take_bid_t22<'info>(
    ctx: Context<'_, '_, '_, 'info, TakeBidT22<'info>>,
    // Passing these in so seller doesn't get rugged
    min_amount: u64,
) -> Result<()> {
    // validate mint account

    let royalties = validate_mint(&ctx.accounts.mint.to_account_info())?;

    let bid_state = &ctx.accounts.bid_state;
    let mint_pubkey = ctx.accounts.mint.key();

    match bid_state.target {
        Target::AssetId => {
            require!(
                bid_state.target_id == mint_pubkey,
                TcompError::WrongTargetId
            );
        }
        Target::Whitelist => {
            // Ensure the correct whitelist is passed in
            require!(
                *ctx.accounts.whitelist.key == bid_state.target_id,
                TcompError::WrongTargetId
            );

            let whitelist = assert_decode_whitelist(&ctx.accounts.whitelist)?;
            let mint = &ctx.accounts.mint;

            // must have merkle tree; otherwise fail
            if whitelist.root_hash != ZERO_ARRAY {
                let mint_proof_acc = &ctx.accounts.mint_proof;
                let mint_proof = assert_decode_mint_proof(
                    ctx.accounts.whitelist.key,
                    &mint_pubkey,
                    mint_proof_acc,
                )?;
                let leaf = anchor_lang::solana_program::keccak::hash(mint.key().as_ref());
                let proof = &mut mint_proof.proof.to_vec();
                proof.truncate(mint_proof.proof_len as usize);
                whitelist.verify_whitelist(
                    None,
                    Some(FullMerkleProof {
                        proof: proof.clone(),
                        leaf: leaf.0,
                    }),
                )?;
            } else {
                // TODO: update this logic once T22 support collection and creator verification
                return Err(TcompError::BadWhitelist.into());
            }
        }
    }

    //check the bid field filter if it exists
    if let Some(field) = &bid_state.field {
        match field {
            &Field::Name => {
                let mint_info = &ctx.accounts.mint.to_account_info();
                let token_metadata = {
                    let buffer = mint_info.try_borrow_data()?;
                    let state = TlvStateBorrowed::unpack(&buffer)?;
                    state.get_first_variable_len_value::<TokenMetadata>()?
                };

                let mut name_arr = [0u8; 32];
                let length = std::cmp::min(token_metadata.name.len(), name_arr.len());
                name_arr[..length].copy_from_slice(&token_metadata.name.as_bytes()[..length]);
                require!(
                    name_arr == bid_state.field_id.unwrap().to_bytes(),
                    TcompError::WrongBidFieldId
                );
            }
        }
    }

    // transfer the NFT

    let mut transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.seller_ata.to_account_info(),
            to: ctx.accounts.owner_ata.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    // this will only add the remaining accounts required by a transfer hook if we
    // recognize the hook as a royalty one
    let (creators, creator_accounts, seller_fee_basis_points) = if let Some(RoyaltyInfo {
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

        (creator_data, creator_infos, *seller_fee)
    } else {
        (vec![], vec![], 0)
    };

    transfer_checked(transfer_cpi, 1, 0)?; // supply = 1, decimals = 0

    // TODO: add royalty value and creators once supported on T22; also, update token standard
    // in case there are other options in T22
    take_bid_shared(TakeBidArgs {
        bid_state: &mut ctx.accounts.bid_state,
        seller: &ctx.accounts.seller.to_account_info(),
        margin_account: &ctx.accounts.margin_account,
        owner: &ctx.accounts.owner,
        rent_destination: &ctx.accounts.rent_destination,
        maker_broker: &ctx.accounts.maker_broker,
        taker_broker: &ctx.accounts.taker_broker,
        fee_vault: &ctx.accounts.fee_vault.to_account_info(),
        asset_id: mint_pubkey,
        token_standard: Some(if royalties.is_some() {
            TokenStandard::ProgrammableNonFungible
        } else {
            TokenStandard::NonFungible
        }),
        creators,
        min_amount,
        optional_royalty_pct: None,
        seller_fee_basis_points,
        creator_accounts: &creator_accounts,
        tcomp_prog: &ctx.accounts.marketplace_program,
        tswap_prog: &ctx.accounts.escrow_program,
        system_prog: &ctx.accounts.system_program,
    })
}
