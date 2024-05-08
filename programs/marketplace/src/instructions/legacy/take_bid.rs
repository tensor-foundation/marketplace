use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, CloseAccount, Mint, TokenAccount, TokenInterface},
};
use mpl_token_metadata::types::AuthorizationData;
use tensor_toolbox::{
    fees::ID as TFEE_PROGRAM_ID,
    shard_num,
    token_metadata::{assert_decode_metadata, transfer, TransferArgs},
};
use tensor_whitelist::{assert_decode_whitelist, FullMerkleProof, ZERO_ARRAY};
use tensorswap::program::EscrowProgram;
use vipers::Validate;

use crate::{
    pnft_adapter::*,
    take_bid_common::{assert_decode_mint_proof, take_bid_shared, TakeBidArgs},
    AuthorizationDataLocal, BidState, Field, ProgNftShared, Target, TcompError,
    CURRENT_TCOMP_VERSION,
};

#[derive(Accounts)]
pub struct TakeBidLegacy<'info> {
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
    pub margin_account: UncheckedAccount<'info>,
    /// CHECK: manually below, since this account is optional
    pub whitelist: UncheckedAccount<'info>,

    // --------------------------------------- nft
    #[account(mut, token::mint = nft_mint, token::authority = seller)]
    pub nft_seller_acc: Box<InterfaceAccount<'info, TokenAccount>>,
    /// CHECK: whitelist, token::mint in nft_seller_acc, associated_token::mint in owner_ata_acc
    pub nft_mint: Box<InterfaceAccount<'info, Mint>>,
    //can't deserialize directly coz Anchor traits not implemented
    /// CHECK: assert_decode_metadata check seeds
    #[account(mut)]
    pub nft_metadata: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = nft_mint,
        associated_token::authority = owner,
    )]
    pub owner_ata_acc: Box<InterfaceAccount<'info, TokenAccount>>,

    // --------------------------------------- pNft

    //note that MASTER EDITION and EDITION share the same seeds, and so it's valid to check them here
    /// CHECK: seeds checked on Token Metadata CPI
    pub nft_edition: UncheckedAccount<'info>,

    /// CHECK: seeds checked on Token Metadata CPI
    #[account(mut)]
    pub owner_token_record: UncheckedAccount<'info>,

    /// CHECK: seeds checked on Token Metadata CPI
    #[account(mut)]
    pub dest_token_record: UncheckedAccount<'info>,

    pub pnft_shared: ProgNftShared<'info>,

    //using this as temporary escrow to avoid having to rely on delegate
    /// Implicitly checked via transfer. Will fail if wrong account
    #[account(
        init_if_needed,
        payer = seller,
        seeds=[
            b"nft_escrow".as_ref(),
            nft_mint.key().as_ref(),
        ],
        bump,
        token::mint = nft_mint,
        // NB: super important this is a PDA w/ data, o/w ProgramOwnedList rulesets break.
        token::authority = bid_state,
    )]
    pub nft_escrow: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: seeds checked on Token Metadata CPI
    #[account(mut)]
    pub temp_escrow_token_record: UncheckedAccount<'info>,

    /// CHECK: validated by mplex's pnft code
    pub auth_rules: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
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
    // Remaining accounts:
    // 1. creators (1-5)
}

impl<'info> Validate<'info> for TakeBidLegacy<'info> {
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

impl<'info> TakeBidLegacy<'info> {
    fn close_nft_escrow_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.nft_escrow.to_account_info(),
                destination: self.seller.to_account_info(),
                authority: self.bid_state.to_account_info(),
            },
        )
    }
}

#[access_control(ctx.accounts.validate())]
pub fn process_take_bid_legacy<'info>(
    ctx: Context<'_, '_, '_, 'info, TakeBidLegacy<'info>>,
    // Passing these in so seller doesn't get rugged
    min_amount: u64,
    optional_royalty_pct: Option<u16>,
    rules_acc_present: bool,
    authorization_data: Option<AuthorizationDataLocal>,
) -> Result<()> {
    let bid_state = &ctx.accounts.bid_state;
    let mint = ctx.accounts.nft_mint.key();
    let metadata = assert_decode_metadata(&mint, &ctx.accounts.nft_metadata)?;
    let creators = &metadata.creators;

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

            //prioritize merkle tree if proof present
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
                whitelist.verify_whitelist(Some(&metadata), None)?;
            }
        }
    }

    // Check the bid field filter if it exists.
    if let Some(field) = &bid_state.field {
        match field {
            &Field::Name => {
                let mut name_arr = [0u8; 32];
                name_arr[..metadata.name.len()].copy_from_slice(metadata.name.as_bytes());
                require!(
                    name_arr == bid_state.field_id.unwrap().to_bytes(),
                    TcompError::WrongBidFieldId
                );
            }
        }
    }

    // --------------------------------------- send pnft

    // transfer nft directly to owner (ATA)
    // has to go before any transfer_lamports, o/w we get `sum of account balances before and after instruction do not match`
    let auth_rules_acc_info = &ctx.accounts.auth_rules;
    let auth_rules = if rules_acc_present {
        Some(auth_rules_acc_info)
    } else {
        None
    };

    //STEP 1/2: SEND TO ESCROW
    transfer(
        TransferArgs {
            source: &ctx.accounts.seller,
            payer: &ctx.accounts.seller,
            source_ata: &ctx.accounts.nft_seller_acc,
            destination_ata: &ctx.accounts.nft_escrow,
            destination: &ctx.accounts.bid_state.to_account_info(),
            mint: &ctx.accounts.nft_mint,
            metadata: &ctx.accounts.nft_metadata,
            edition: &ctx.accounts.nft_edition,
            system_program: &ctx.accounts.system_program,
            spl_token_program: &ctx.accounts.token_program,
            spl_ata_program: &ctx.accounts.associated_token_program,
            sysvar_instructions: Some(&ctx.accounts.pnft_shared.instructions),
            source_token_record: Some(&ctx.accounts.owner_token_record),
            destination_token_record: Some(&ctx.accounts.temp_escrow_token_record),
            authorization_rules_program: Some(
                &ctx.accounts.pnft_shared.authorization_rules_program,
            ),
            authorization_rules: auth_rules,
            authorization_data: authorization_data.clone().map(AuthorizationData::from),
            token_metadata_program: Some(&ctx.accounts.pnft_shared.token_metadata_program),
            delegate: None,
        },
        None,
    )?;

    let seeds = ctx.accounts.bid_state.seeds();
    let seeds: &[&[&[u8]]] = &[seeds.as_slice()];

    //STEP 2/2: SEND FROM ESCROW
    transfer(
        TransferArgs {
            source: &ctx.accounts.bid_state.to_account_info(),
            payer: &ctx.accounts.seller.to_account_info(),
            source_ata: &ctx.accounts.nft_escrow,
            destination_ata: &ctx.accounts.owner_ata_acc,
            destination: &ctx.accounts.owner.to_account_info(),
            mint: &ctx.accounts.nft_mint,
            metadata: &ctx.accounts.nft_metadata,
            edition: &ctx.accounts.nft_edition,
            system_program: &ctx.accounts.system_program,
            spl_token_program: &ctx.accounts.token_program,
            spl_ata_program: &ctx.accounts.associated_token_program,
            sysvar_instructions: Some(&ctx.accounts.pnft_shared.instructions),
            source_token_record: Some(&ctx.accounts.temp_escrow_token_record),
            destination_token_record: Some(&ctx.accounts.dest_token_record),
            authorization_rules_program: Some(
                &ctx.accounts.pnft_shared.authorization_rules_program,
            ),
            authorization_rules: auth_rules,
            authorization_data: authorization_data.map(AuthorizationData::from),
            token_metadata_program: Some(&ctx.accounts.pnft_shared.token_metadata_program),
            delegate: None,
        },
        Some(seeds),
    )?;

    // close temp nft escrow account, so it's not dangling
    token_interface::close_account(ctx.accounts.close_nft_escrow_ctx().with_signer(seeds))?;

    take_bid_shared(TakeBidArgs {
        bid_state: &mut ctx.accounts.bid_state,
        seller: &ctx.accounts.seller.to_account_info(),
        margin_account: &ctx.accounts.margin_account,
        owner: &ctx.accounts.owner,
        rent_dest: &ctx.accounts.rent_dest,
        maker_broker: &ctx.accounts.maker_broker,
        taker_broker: &ctx.accounts.taker_broker,
        fee_vault: &ctx.accounts.fee_vault.to_account_info(),
        asset_id: mint,
        token_standard: metadata.token_standard,
        creators: creators
            .clone()
            .unwrap_or(Vec::new())
            .into_iter()
            .map(Into::into)
            .collect(),
        min_amount,
        optional_royalty_pct,
        seller_fee_basis_points: metadata.seller_fee_basis_points,
        creator_accounts: ctx.remaining_accounts,
        tcomp_prog: &ctx.accounts.marketplace_program,
        tswap_prog: &ctx.accounts.tensorswap_program,
        system_prog: &ctx.accounts.system_program,
    })
}
