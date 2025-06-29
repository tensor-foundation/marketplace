use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{close_account, CloseAccount, Mint, TokenAccount, TokenInterface},
};
use mpl_token_metadata::types::AuthorizationData;
use tensor_toolbox::{
    mpl_token_auth_rules,
    token_metadata::{transfer, TransferArgs},
};

use crate::{
    program::MarketplaceProgram, record_event, AuthorizationDataLocal, ListState, MakeEvent,
    Target, TcompError, TcompEvent, TcompSigner,
};

#[derive(Accounts)]
pub struct DelistLegacy<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = owner,
    )]
    pub owner_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        close = rent_destination,
        seeds=[
            b"list_state".as_ref(),
            mint.key().as_ref(),
        ],
        bump = list_state.bump[0],
        has_one = owner
    )]
    pub list_state: Box<Account<'info, ListState>>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = list_state,
    )]
    pub list_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    // NB: no constraint on mint.supply == 1, since we're closing the listing
    // this should even succeed if supply > 1
    #[account(
        mint::token_program = token_program,
        constraint = mint.decimals == 0 @ TcompError::InvalidMint
    )]
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: list_state.get_rent_payer()
    #[account(
        mut,
        constraint = rent_destination.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,

    // ------------------------------------------------ Token Metadata accounts
    /// CHECK: seeds check below
    #[account(
        mut,
        seeds=[
            mpl_token_metadata::accounts::Metadata::PREFIX,
            mpl_token_metadata::ID.as_ref(),
            mint.key().as_ref(),
        ],
        seeds::program = mpl_token_metadata::ID,
        bump
    )]
    pub metadata: UncheckedAccount<'info>,

    /// CHECK: ensure the edition is a valid edition account and belongs to the mint - can be empty, fungible tokens have no edition
    #[account(
        seeds=[
            mpl_token_metadata::accounts::MasterEdition::PREFIX.0,
            mpl_token_metadata::ID.as_ref(),
            mint.key().as_ref(),
            mpl_token_metadata::accounts::MasterEdition::PREFIX.1,
        ],
        seeds::program = mpl_token_metadata::ID,
        bump,
    )]
    pub edition: UncheckedAccount<'info>,

    /// CHECK: seeds checked on Token Metadata CPI
    #[account(mut)]
    pub owner_token_record: Option<UncheckedAccount<'info>>,

    /// CHECK: seeds checked on Token Metadata CPI
    #[account(mut)]
    pub list_token_record: Option<UncheckedAccount<'info>>,

    /// CHECK: validated by mplex's pnft code
    pub authorization_rules: Option<UncheckedAccount<'info>>,

    /// CHECK: address below
    #[account(address = mpl_token_auth_rules::ID)]
    pub authorization_rules_program: Option<UncheckedAccount<'info>>,

    /// CHECK: address below
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: Option<UncheckedAccount<'info>>,

    /// CHECK: address below
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub sysvar_instructions: Option<UncheckedAccount<'info>>,
}

pub fn process_delist_legacy<'info>(
    ctx: Context<'_, '_, '_, 'info, DelistLegacy<'info>>,
    authorization_data: Option<AuthorizationDataLocal>,
) -> Result<()> {
    // transfer the NFT (the mint is validated on the transfer)

    transfer(
        TransferArgs {
            source: &ctx.accounts.list_state.to_account_info(),
            payer: &ctx.accounts.payer,
            source_ata: &ctx.accounts.list_ta,
            destination_ata: &ctx.accounts.owner_ta,
            destination: &ctx.accounts.owner,
            mint: &ctx.accounts.mint,
            metadata: &ctx.accounts.metadata,
            edition: &ctx.accounts.edition,
            system_program: &ctx.accounts.system_program,
            spl_token_program: &ctx.accounts.token_program,
            spl_ata_program: &ctx.accounts.associated_token_program,
            sysvar_instructions: ctx.accounts.sysvar_instructions.as_ref(),
            source_token_record: ctx.accounts.list_token_record.as_ref(),
            destination_token_record: ctx.accounts.owner_token_record.as_ref(),
            authorization_rules_program: ctx.accounts.authorization_rules_program.as_ref(),
            authorization_rules: ctx.accounts.authorization_rules.as_ref(),
            authorization_data: authorization_data.map(AuthorizationData::from),
            token_metadata_program: ctx.accounts.token_metadata_program.as_ref(),
            delegate: None,
        },
        Some(&[&ctx.accounts.list_state.seeds()]),
    )?;

    // records the delisting

    let list_state = &ctx.accounts.list_state;

    record_event(
        &TcompEvent::Maker(MakeEvent {
            maker: *ctx.accounts.owner.key,
            bid_id: None,
            target: Target::AssetId,
            target_id: list_state.asset_id,
            field: None,
            field_id: None,
            amount: list_state.amount,
            quantity: 0,
            currency: list_state.currency,
            expiry: list_state.expiry,
            private_taker: list_state.private_taker,
            asset_id: Some(list_state.asset_id),
        }),
        &ctx.accounts.marketplace_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    // closes the list token account

    // returns the rent to the payer (most likely the payer funded the owner ta)
    close_account(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.list_ta.to_account_info(),
                destination: ctx.accounts.payer.to_account_info(),
                authority: ctx.accounts.list_state.to_account_info(),
            },
        )
        .with_signer(&[&ctx.accounts.list_state.seeds()]),
    )
}
