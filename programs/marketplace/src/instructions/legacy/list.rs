use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{close_account, CloseAccount},
    token_interface::{Mint, TokenAccount, TokenInterface},
};
use mpl_token_metadata::types::AuthorizationData;
use tensor_toolbox::{
    token_metadata::{transfer, TransferArgs},
    NullableOption,
};

use crate::{
    program::MarketplaceProgram, record_event, AuthorizationDataLocal, ListState, MakeEvent,
    Target, TcompError, TcompEvent, TcompSigner, CURRENT_TCOMP_VERSION, LIST_STATE_SIZE,
    MAX_EXPIRY_SEC,
};

#[derive(Accounts)]
pub struct ListLegacy<'info> {
    /// CHECK: the token transfer will fail if owner is wrong (signature error)
    pub owner: Signer<'info>,

    #[account(
        mut,
        token::mint = mint,
        token::authority = owner,
    )]
    pub owner_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = payer,
        seeds=[
            b"list_state".as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        space = LIST_STATE_SIZE,
    )]
    pub list_state: Box<Account<'info, ListState>>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = list_state,
    )]
    pub list_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    pub mint: Box<InterfaceAccount<'info, Mint>>,

    //separate payer so that a program can list with owner being a PDA
    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Interface<'info, TokenInterface>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

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

    pub cosigner: Option<Signer<'info>>,
}

pub fn process_list_legacy<'info>(
    ctx: Context<'_, '_, '_, 'info, ListLegacy<'info>>,
    amount: u64,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
    authorization_data: Option<AuthorizationDataLocal>,
) -> Result<()> {
    // transfer the NFT (the mint is validated on the transfer)

    transfer(
        TransferArgs {
            source: &ctx.accounts.owner,
            payer: &ctx.accounts.payer,
            source_ata: &ctx.accounts.owner_ata,
            destination_ata: &ctx.accounts.list_ata,
            destination: &ctx.accounts.list_state.to_account_info(),
            mint: &ctx.accounts.mint,
            metadata: &ctx.accounts.metadata,
            edition: &ctx.accounts.edition,
            system_program: &ctx.accounts.system_program,
            spl_token_program: &ctx.accounts.token_program,
            spl_ata_program: &ctx.accounts.associated_token_program,
            sysvar_instructions: Some(&ctx.accounts.sysvar_instructions),
            source_token_record: ctx.accounts.owner_token_record.as_ref(),
            destination_token_record: ctx.accounts.list_token_record.as_ref(),
            authorization_rules_program: ctx.accounts.authorization_rules_program.as_ref(),
            authorization_rules: ctx.accounts.authorization_rules.as_ref(),
            authorization_data: authorization_data.map(AuthorizationData::from),
            token_metadata_program: Some(&ctx.accounts.token_metadata_program),
            delegate: None,
        },
        None,
    )?;

    // creates the listing state

    let asset_id = ctx.accounts.mint.key();

    let list_state = &mut ctx.accounts.list_state;
    list_state.version = CURRENT_TCOMP_VERSION;
    list_state.bump = [ctx.bumps.list_state];
    list_state.asset_id = asset_id;
    list_state.owner = ctx.accounts.owner.key();
    list_state.amount = amount;
    list_state.currency = currency;
    list_state.private_taker = private_taker;
    list_state.maker_broker = maker_broker;

    let expiry = match expire_in_sec {
        Some(expire_in_sec) => {
            let expire_in_i64 = i64::try_from(expire_in_sec).unwrap();
            require!(expire_in_i64 <= MAX_EXPIRY_SEC, TcompError::ExpiryTooLarge);
            Clock::get()?.unix_timestamp + expire_in_i64
        }
        None => Clock::get()?.unix_timestamp + MAX_EXPIRY_SEC,
    };
    list_state.expiry = expiry;
    list_state.rent_payer = NullableOption::new(ctx.accounts.payer.key());
    list_state.cosigner = ctx.accounts.cosigner.as_ref().map(|c| c.key()).into();
    // seriallizes the account data
    list_state.exit(ctx.program_id)?;

    record_event(
        &TcompEvent::Maker(MakeEvent {
            maker: *ctx.accounts.owner.key,
            bid_id: None,
            target: Target::AssetId,
            target_id: asset_id,
            field: None,
            field_id: None,
            amount,
            quantity: 1,
            currency,
            expiry,
            private_taker,
            asset_id: Some(asset_id),
        }),
        &ctx.accounts.marketplace_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    // closes the owner token account

    close_account(CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.owner_ata.to_account_info(),
            destination: ctx.accounts.payer.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        },
    ))
}
