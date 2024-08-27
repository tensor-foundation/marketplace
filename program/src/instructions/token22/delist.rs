use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{Token2022, TransferChecked},
    token_interface::{close_account, CloseAccount, Mint, TokenAccount},
};
use tensor_toolbox::token_2022::{
    transfer::transfer_checked as tensor_transfer_checked, validate_mint,
};

use crate::{
    program::MarketplaceProgram, record_event, ListState, MakeEvent, Target, TcompError,
    TcompEvent, TcompSigner,
};

#[derive(Accounts)]
pub struct DelistT22<'info> {
    /// CHECK: the token transfer will fail if owner is wrong (signature error)
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
        associated_token::token_program = token_program,
    )]
    pub list_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: seed in nft_escrow & nft_receipt
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: list_state.get_rent_payer()
    #[account(
        mut,
        constraint = rent_destination.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub token_program: Program<'info, Token2022>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,
    //
    // ---- [0..n] remaining accounts for royalties transfer hook
}

pub fn process_delist_t22<'info>(ctx: Context<'_, '_, '_, 'info, DelistT22<'info>>) -> Result<()> {
    // validates the mint

    let royalties = validate_mint(&ctx.accounts.mint.to_account_info())?;

    // transfer the NFT

    let mut transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.list_ta.to_account_info(),
            to: ctx.accounts.owner_ta.to_account_info(),
            authority: ctx.accounts.list_state.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    // this will only add the remaining accounts required by a transfer hook if we
    // recognize the hook as a royalty one
    if royalties.is_some() {
        transfer_cpi = transfer_cpi.with_remaining_accounts(ctx.remaining_accounts.to_vec());
    }

    tensor_transfer_checked(
        transfer_cpi.with_signer(&[&ctx.accounts.list_state.seeds()]),
        1, // supply = 1
        0, // decimals = 0
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

    // payer receives the rent from the list_ta (most likely had to pay for
    // the owner_ta rent)
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
