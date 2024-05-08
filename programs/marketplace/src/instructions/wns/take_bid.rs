use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, Token2022, TokenAccount, TransferChecked},
};
use mpl_token_metadata::types::TokenStandard;
use spl_token_metadata_interface::state::TokenMetadata;
use spl_type_length_value::state::{TlvState, TlvStateBorrowed};
use tensor_toolbox::{
    calc_creators_fee,
    token_2022::wns::{approve, validate_mint, ApproveAccounts},
};
use tensor_whitelist::{assert_decode_whitelist, FullMerkleProof, ZERO_ARRAY};
use tensorswap::program::EscrowProgram;
use vipers::Validate;

use crate::{
    take_bid_common::{assert_decode_mint_proof, take_bid_shared, TakeBidArgs},
    BidState, Field, Target, TcompError, CURRENT_TCOMP_VERSION,
};

#[derive(Accounts)]
pub struct WnsTakeBid<'info> {
    // Acts purely as a fee account
    /// CHECK: seeds
    #[account(mut, seeds=[], bump)]
    pub tcomp: UncheckedAccount<'info>,

    #[account(mut)]
    pub seller: Signer<'info>,

    /// CHECK: this ensures that specific asset_id belongs to specific owner
    #[account(
        mut,
        seeds = [b"bid_state".as_ref(), owner.key().as_ref(), bid_state.bid_id.as_ref()],
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

    #[account(mut, token::mint = nft_mint, token::authority = seller)]
    pub nft_seller_acc: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: whitelist, token::mint in nft_seller_acc, associated_token::mint in owner_ata_acc
    #[account(
        mint::token_program = anchor_spl::token_interface::spl_token_2022::id(),
    )]
    pub nft_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = nft_mint,
        associated_token::authority = owner,
    )]
    pub owner_ata_acc: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Program<'info, Token2022>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub marketplace_program: Program<'info, crate::program::MarketplaceProgram>,

    pub tensorswap_program: Program<'info, EscrowProgram>,

    // cosigner is checked in validate()
    pub cosigner: Option<Signer<'info>>,

    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    /// CHECK: assert_decode_mint_proof
    pub mint_proof: UncheckedAccount<'info>,

    /// CHECK: bid_state.get_rent_payer()
    #[account(mut,
        constraint = rent_dest.key() == bid_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_dest: UncheckedAccount<'info>,

    // ---- WNS royalty enforcement
    /// CHECK: checked on approve CPI
    #[account(mut)]
    pub approve_account: UncheckedAccount<'info>,

    /// CHECK: checked on approve CPI
    #[account(mut)]
    pub distribution: UncheckedAccount<'info>,

    /// CHECK: checked on approve CPI
    pub wns_program: UncheckedAccount<'info>,

    /// CHECK: checked on approve CPI
    pub distribution_program: UncheckedAccount<'info>,

    /// CHECK: checked on transfer CPI
    pub extra_metas: UncheckedAccount<'info>,
}

impl<'info> Validate<'info> for WnsTakeBid<'info> {
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
pub fn process_take_bid_wns<'info>(
    ctx: Context<'_, '_, '_, 'info, WnsTakeBid<'info>>,
    // Passing these in so seller doesn't get rugged
    min_amount: u64,
) -> Result<()> {
    // validate mint account
    let seller_fee_basis_points = validate_mint(&ctx.accounts.nft_mint.to_account_info())?;
    let creators_fee = calc_creators_fee(
        seller_fee_basis_points,
        min_amount,
        Some(TokenStandard::ProgrammableNonFungible), // <- enforced royalties
        None,
    )?;

    let bid_state = &ctx.accounts.bid_state;
    let mint = ctx.accounts.nft_mint.key();

    match bid_state.target {
        Target::AssetId => {
            require!(bid_state.target_id == mint, TcompError::WrongTargetId);
        }
        Target::Whitelist => {
            // Ensure the correct whitelist is passed in
            require!(
                *ctx.accounts.whitelist.key == bid_state.target_id,
                TcompError::WrongTargetId
            );

            let whitelist = assert_decode_whitelist(&ctx.accounts.whitelist)?;
            let nft_mint = &ctx.accounts.nft_mint;

            // must have merkle tree; otherwise fail
            if whitelist.root_hash != ZERO_ARRAY {
                let mint_proof_acc = &ctx.accounts.mint_proof;
                let mint_proof =
                    assert_decode_mint_proof(ctx.accounts.whitelist.key, &mint, mint_proof_acc)?;
                let leaf = anchor_lang::solana_program::keccak::hash(nft_mint.key().as_ref());
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
                let mint_info = &ctx.accounts.nft_mint.to_account_info();
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

    // TODO: we are currently using the seller to pay royalties directly, but this should be
    // the bid_state PDA, otherwise the seller is required to have enough lamports to pay upfront.
    // WNS approve instruction does not allow to pay royalties from a PDA. When we change this,
    // we need to subtract the royalties values from the left_for_seller variable.

    let approve_accounts = ApproveAccounts {
        payer: ctx.accounts.seller.to_account_info(),
        authority: ctx.accounts.seller.to_account_info(),
        mint: ctx.accounts.nft_mint.to_account_info(),
        approve_account: ctx.accounts.approve_account.to_account_info(),
        payment_mint: None,
        authority_token_account: ctx.accounts.seller.to_account_info(),
        distribution_account: ctx.accounts.distribution.to_account_info(),
        distribution_token_account: ctx.accounts.distribution.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        distribution_program: ctx.accounts.distribution_program.to_account_info(),
        wns_program: ctx.accounts.wns_program.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        associated_token_program: ctx.accounts.associated_token_program.to_account_info(),
    };
    // royalty payment
    approve(approve_accounts, min_amount, creators_fee)?;

    // transfer the NFT

    let transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.nft_seller_acc.to_account_info(),
            to: ctx.accounts.owner_ata_acc.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
            mint: ctx.accounts.nft_mint.to_account_info(),
        },
    );

    tensor_toolbox::token_2022::transfer::transfer_checked(
        transfer_cpi.with_remaining_accounts(vec![
            ctx.accounts.wns_program.to_account_info(),
            ctx.accounts.extra_metas.to_account_info(),
            ctx.accounts.approve_account.to_account_info(),
        ]),
        1, // supply = 1
        0, // decimals = 0
    )?;

    // TODO: add royalty value and creators once supported on T22; also, update token standard
    // in case there are other options in T22
    take_bid_shared(TakeBidArgs {
        bid_state: &mut ctx.accounts.bid_state,
        seller: &ctx.accounts.seller.to_account_info(),
        margin_account: &ctx.accounts.margin_account,
        owner: &ctx.accounts.owner,
        rent_dest: &ctx.accounts.rent_dest,
        maker_broker: &ctx.accounts.maker_broker,
        taker_broker: &ctx.accounts.taker_broker,
        tcomp: &ctx.accounts.tcomp.to_account_info(),
        asset_id: mint,
        token_standard: Some(TokenStandard::NonFungible), // <- royalty value was already paid on approve
        creators: vec![], // <- royalty value was already paid on approve
        min_amount,
        optional_royalty_pct: None,
        seller_fee_basis_points: 0, // <- royalty value was already paid on approve
        creator_accounts: ctx.remaining_accounts,
        tcomp_prog: &ctx.accounts.marketplace_program,
        tswap_prog: &ctx.accounts.tensorswap_program,
        system_prog: &ctx.accounts.system_program,
    })
}
