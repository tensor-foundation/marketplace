use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{transfer_checked, Token2022, TransferChecked},
    token_interface::{Mint, TokenAccount},
};

use crate::{
    maker_broker_is_whitelisted, program::MarketplaceProgram, record_event, ListState, MakeEvent,
    Target, TcompError, TcompEvent, TcompSigner, CURRENT_TCOMP_VERSION, LIST_STATE_SIZE,
    MAX_EXPIRY_SEC,
};

#[derive(Accounts)]
pub struct ListT22<'info> {
    #[account(mut, token::mint = mint, token::authority = owner)]
    pub owner_token: Box<InterfaceAccount<'info, TokenAccount>>,

    pub mint: Box<InterfaceAccount<'info, Mint>>,

    /// Implicitly checked via transfer. Will fail if wrong account
    #[account(
        init, //<-- this HAS to be init, not init_if_needed for safety (else single listings and pool listings can get mixed)
        payer = payer,
        seeds=[
            b"list_token".as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        token::mint = mint,
        token::authority = list_state,
    )]
    pub list_token: Box<InterfaceAccount<'info, TokenAccount>>,

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

    /// CHECK: the token transfer will fail if owner is wrong (signature error)
    pub owner: Signer<'info>,

    //separate payer so that a program can list with owner being a PDA
    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, Token2022>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,
}

pub fn process_list_t22<'info>(
    ctx: Context<'_, '_, '_, 'info, ListT22<'info>>,
    amount: u64,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
) -> Result<()> {
    require!(
        maker_broker_is_whitelisted(maker_broker),
        TcompError::MakerBrokerNotYetWhitelisted
    );

    // transfer the NFT

    let transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.owner_token.to_account_info(),
            to: ctx.accounts.list_token.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    transfer_checked(transfer_cpi, 1, 0)?; // supply = 1, decimals = 0

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
    list_state.rent_payer = ctx.accounts.payer.key();

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
    )
}