use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{Token2022, TransferChecked},
    token_interface::{close_account, CloseAccount, Mint, TokenAccount},
};
use tensor_toolbox::token_2022::{
    transfer::transfer_checked as tensor_transfer_checked,
    wns::{approve, ApproveAccounts, ApproveParams},
};

use crate::{
    program::MarketplaceProgram, record_event, ListState, MakeEvent, Target, TcompError,
    TcompEvent, TcompSigner,
};

#[derive(Accounts)]
pub struct DelistWns<'info> {
    /// CHECK: the token transfer will fail if owner is wrong (signature error)
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

    //separate payer so that a program can list with owner being a PDA
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

    // ---- WNS royalty enforcement
    /// CHECK: checked on approve CPI
    #[account(mut)]
    pub approve: UncheckedAccount<'info>,

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

pub fn process_delist_wns<'info>(ctx: Context<'_, '_, '_, 'info, DelistWns<'info>>) -> Result<()> {
    let approve_accounts = ApproveAccounts {
        payer: ctx.accounts.payer.to_account_info(),
        authority: ctx.accounts.list_state.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        approve_account: ctx.accounts.approve.to_account_info(),
        payment_mint: None,
        authority_token_account: None,
        distribution_account: ctx.accounts.distribution.to_account_info(),
        distribution_token_account: None,
        system_program: ctx.accounts.system_program.to_account_info(),
        distribution_program: ctx.accounts.distribution_program.to_account_info(),
        wns_program: ctx.accounts.wns_program.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        payment_token_program: None,
    };

    // no need for royalty enforcement here
    approve(
        approve_accounts,
        ApproveParams::no_royalties_with_signer_seeds(&[&ctx.accounts.list_state.seeds()]),
    )?;

    // transfer the NFT
    let transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.list_ta.to_account_info(),
            to: ctx.accounts.owner_ta.to_account_info(),
            authority: ctx.accounts.list_state.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    tensor_transfer_checked(
        transfer_cpi
            .with_remaining_accounts(vec![
                ctx.accounts.wns_program.to_account_info(),
                ctx.accounts.extra_metas.to_account_info(),
                ctx.accounts.approve.to_account_info(),
            ])
            .with_signer(&[&ctx.accounts.list_state.seeds()]),
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
