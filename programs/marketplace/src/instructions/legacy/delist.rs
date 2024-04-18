use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{close_account, CloseAccount, Mint, TokenAccount, TokenInterface},
};
use mpl_token_metadata::types::AuthorizationData;

use crate::{
    program::MarketplaceProgram, record_event, AuthorizationDataLocal, ListState, MakeEvent,
    Target, TcompError, TcompEvent, TcompSigner,
};

#[derive(Accounts)]
pub struct DelistLegacy<'info> {
    #[account(mut, token::mint = mint, token::authority = owner)]
    pub owner_token: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: seed in nft_escrow & nft_receipt
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds=[
            b"nft_escrow".as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        token::mint = mint,
        token::authority = list_state,
    )]
    pub list_token: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        close = rent_dest,
        seeds=[
            b"list_state".as_ref(),
            mint.key().as_ref(),
        ],
        bump = list_state.bump[0],
        has_one = owner
    )]
    pub list_state: Box<Account<'info, ListState>>,

    /// CHECK: the token transfer will fail if owner is wrong (signature error)
    pub owner: Signer<'info>,

    //separate payer so that a program can list with owner being a PDA
    #[account(
        mut,
        constraint = rent_dest.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_dest: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub tcomp_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,

    // ------------------------------------------------ Token Metadata accounts
    /// CHECK: assert_decode_metadata + seeds below
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

    /// CHECK: seeds checked on Token Metadata CPI
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
    //#[account(address = MPL_TOKEN_AUTH_RULES_ID)]
    pub authorization_rules_program: Option<UncheckedAccount<'info>>,

    /// CHECK: address below
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: UncheckedAccount<'info>,

    /// CHECK: address below
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub sysvar_instructions: UncheckedAccount<'info>,
}

pub fn process_delist_legacy<'info>(
    ctx: Context<'_, '_, '_, 'info, DelistLegacy<'info>>,
    authorization_data: Option<AuthorizationDataLocal>,
) -> Result<()> {
    // transfer the NFT (the mint is validated on the transfer)

    tensor_toolbox::token_metadata::transfer(
        tensor_toolbox::token_metadata::TransferArgs {
            owner: &ctx.accounts.list_state.to_account_info(),
            payer: &ctx.accounts.rent_dest,
            source_ata: &ctx.accounts.list_token,
            destination_ata: &ctx.accounts.owner_token,
            destination_owner: &ctx.accounts.owner,
            mint: &ctx.accounts.mint,
            metadata: &ctx.accounts.metadata,
            edition: &ctx.accounts.edition,
            system_program: &ctx.accounts.system_program,
            spl_token_program: &ctx.accounts.token_program,
            spl_ata_program: &ctx.accounts.associated_token_program,
            sysvar_instructions: &ctx.accounts.sysvar_instructions,
            owner_token_record: ctx.accounts.list_token_record.as_ref(),
            destination_token_record: ctx.accounts.owner_token_record.as_ref(),
            authorization_rules_program: ctx.accounts.authorization_rules_program.as_ref(),
            authorization_rules: ctx.accounts.authorization_rules.as_ref(),
            authorization_data: authorization_data.map(AuthorizationData::from),
            token_metadata_program: &ctx.accounts.token_metadata_program,
            delegate: None,
        },
        None,
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
            quantity: 1, // <-- represents how many NFTs got delisted
            currency: list_state.currency,
            expiry: list_state.expiry,
            private_taker: list_state.private_taker,
            asset_id: Some(list_state.asset_id),
        }),
        &ctx.accounts.tcomp_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    // closes the list token account

    close_account(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.list_token.to_account_info(),
                destination: ctx.accounts.rent_dest.to_account_info(),
                authority: ctx.accounts.list_state.to_account_info(),
            },
        )
        .with_signer(&[&ctx.accounts.list_state.seeds()]),
    )
}