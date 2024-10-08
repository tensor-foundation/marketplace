use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, CloseAccount, Mint, TokenAccount, TokenInterface},
};
use mpl_token_metadata::types::AuthorizationData;
use tensor_toolbox::{
    assert_fee_account,
    token_metadata::{assert_decode_metadata, transfer, TransferArgs},
};
use tensor_vipers::Validate;
use tensorswap::program::EscrowProgram;
use whitelist_program::verify_whitelist_generic;

use crate::{
    pnft_adapter::*,
    take_bid_common::{take_bid_shared, TakeBidArgs},
    AuthorizationDataLocal, BidState, Field, ProgNftShared, Target, TcompError,
    CURRENT_TCOMP_VERSION,
};

#[derive(Accounts)]
pub struct TakeBidLegacy<'info> {
    /// CHECK: checked in assert_fee_account()
    #[account(mut)]
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

    // Owner needs to be passed in as mutable account, so we can reassign lamports back to them
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
    pub whitelist: Option<UncheckedAccount<'info>>,

    // --------------------------------------- nft
    #[account(mut, token::mint = mint, token::authority = seller)]
    pub seller_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: whitelist, token::mint in seller_token, associated_token::mint in owner_ata_acc
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    //can't deserialize directly coz Anchor traits not implemented
    /// CHECK: assert_decode_metadata check seeds
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub owner_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    // --------------------------------------- pNft

    //note that MASTER EDITION and EDITION share the same seeds, and so it's valid to check them here
    /// CHECK: seeds checked on Token Metadata CPI
    pub edition: UncheckedAccount<'info>,

    /// CHECK: seeds checked on Token Metadata CPI
    #[account(mut)]
    pub seller_token_record: Option<UncheckedAccount<'info>>,

    /// CHECK: seeds checked on Token Metadata CPI
    #[account(mut)]
    pub owner_token_record: Option<UncheckedAccount<'info>>,

    pub pnft_shared: ProgNftShared<'info>,

    //using this as temporary escrow to avoid having to rely on delegate
    /// Implicitly checked via transfer. Will fail if wrong account
    #[account(
        init_if_needed,
        payer = seller,
        seeds=[
            b"nft_escrow".as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        token::mint = mint,
        // NB: super important this is a PDA w/ data, o/w ProgramOwnedList rulesets break.
        token::authority = bid_state,
    )]
    pub bid_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: seeds checked on Token Metadata CPI
    #[account(mut)]
    pub bid_token_record: Option<UncheckedAccount<'info>>,

    /// CHECK: validated by mplex's pnft code
    pub authorization_rules: Option<UncheckedAccount<'info>>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub marketplace_program: Program<'info, crate::program::MarketplaceProgram>,

    pub escrow_program: Program<'info, EscrowProgram>,

    // cosigner is checked in validate()
    pub cosigner: Option<Signer<'info>>,

    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    /// CHECK: assert_decode_mint_proof
    pub mint_proof: Option<UncheckedAccount<'info>>,

    /// CHECK: bid_state.get_rent_payer()
    #[account(mut,
        constraint = rent_destination.key() == bid_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,
    //
    // Remaining accounts:
    // 1. creators (1-5)
}

impl<'info> Validate<'info> for TakeBidLegacy<'info> {
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

impl<'info> TakeBidLegacy<'info> {
    fn close_bid_ta_ctx(&self) -> CpiContext<'_, '_, '_, 'info, CloseAccount<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            CloseAccount {
                account: self.bid_ta.to_account_info(),
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
    let mint = ctx.accounts.mint.key();
    let metadata = assert_decode_metadata(&mint, &ctx.accounts.metadata)?;
    let creators = &metadata.creators;

    match bid_state.target {
        Target::AssetId => {
            require!(bid_state.target_id == mint, TcompError::WrongTargetId);
        }
        Target::Whitelist => {
            let whitelist_info = ctx
                .accounts
                .whitelist
                .as_ref()
                .ok_or(ProgramError::NotEnoughAccountKeys)?;

            // Ensure the correct whitelist is passed in
            require!(
                *whitelist_info.key == bid_state.target_id,
                TcompError::WrongTargetId
            );

            verify_whitelist_generic(
                &whitelist_info.to_account_info(),
                ctx.accounts
                    .mint_proof
                    .as_ref()
                    .map(|a| a.to_account_info())
                    .as_ref(),
                &ctx.accounts.mint.to_account_info(),
                Some(&ctx.accounts.metadata.to_account_info()),
            )?;
        }
    }

    // Check the bid field filter if it exists.
    if let Some(field) = &bid_state.field {
        match field {
            &Field::Name => {
                let mut name_arr = [0u8; 32];
                name_arr[..metadata.name.len()].copy_from_slice(metadata.name.as_bytes());
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

    // --------------------------------------- send pnft

    // transfer nft directly to owner (ATA)
    // has to go before any transfer_lamports, o/w we get `sum of account balances before and after instruction do not match`

    // NOTE: This is used to support "legacy" anchor clients that set the
    // authorization rules to system program address and `rules_acc_present == false`
    // when there is no rule set
    let authorization_rules = if rules_acc_present {
        ctx.accounts.authorization_rules.as_ref()
    } else {
        None
    };

    //STEP 1/2: SEND TO ESCROW
    transfer(
        TransferArgs {
            source: &ctx.accounts.seller,
            payer: &ctx.accounts.seller,
            source_ata: &ctx.accounts.seller_ta,
            destination_ata: &ctx.accounts.bid_ta,
            destination: &ctx.accounts.bid_state.to_account_info(),
            mint: &ctx.accounts.mint,
            metadata: &ctx.accounts.metadata,
            edition: &ctx.accounts.edition,
            system_program: &ctx.accounts.system_program,
            spl_token_program: &ctx.accounts.token_program,
            spl_ata_program: &ctx.accounts.associated_token_program,
            sysvar_instructions: ctx.accounts.pnft_shared.sysvar_instructions.as_ref(),
            source_token_record: ctx.accounts.seller_token_record.as_ref(),
            destination_token_record: ctx.accounts.bid_token_record.as_ref(),
            authorization_rules_program: ctx
                .accounts
                .pnft_shared
                .authorization_rules_program
                .as_ref(),
            authorization_rules,
            authorization_data: authorization_data.clone().map(AuthorizationData::from),
            token_metadata_program: ctx.accounts.pnft_shared.token_metadata_program.as_ref(),
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
            source_ata: &ctx.accounts.bid_ta,
            destination_ata: &ctx.accounts.owner_ta,
            destination: &ctx.accounts.owner.to_account_info(),
            mint: &ctx.accounts.mint,
            metadata: &ctx.accounts.metadata,
            edition: &ctx.accounts.edition,
            system_program: &ctx.accounts.system_program,
            spl_token_program: &ctx.accounts.token_program,
            spl_ata_program: &ctx.accounts.associated_token_program,
            sysvar_instructions: ctx.accounts.pnft_shared.sysvar_instructions.as_ref(),
            source_token_record: ctx.accounts.bid_token_record.as_ref(),
            destination_token_record: ctx.accounts.owner_token_record.as_ref(),
            authorization_rules_program: ctx
                .accounts
                .pnft_shared
                .authorization_rules_program
                .as_ref(),
            authorization_rules,
            authorization_data: authorization_data.map(AuthorizationData::from),
            token_metadata_program: ctx.accounts.pnft_shared.token_metadata_program.as_ref(),
            delegate: None,
        },
        Some(seeds),
    )?;

    // close temp nft escrow account, so it's not dangling
    token_interface::close_account(ctx.accounts.close_bid_ta_ctx().with_signer(seeds))?;

    take_bid_shared(TakeBidArgs {
        bid_state: &mut ctx.accounts.bid_state,
        seller: &ctx.accounts.seller.to_account_info(),
        escrow: &ctx.accounts.shared_escrow,
        owner: &ctx.accounts.owner,
        rent_destination: &ctx.accounts.rent_destination,
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
        marketplace_prog: &ctx.accounts.marketplace_program,
        escrow_prog: &ctx.accounts.escrow_program,
        system_prog: &ctx.accounts.system_program,
    })
}
