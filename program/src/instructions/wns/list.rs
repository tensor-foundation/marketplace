use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{close_account, CloseAccount, Token2022, TransferChecked},
    token_interface::{Mint, TokenAccount},
};
use tensor_toolbox::token_2022::{
    transfer::transfer_checked,
    wns::{approve, validate_mint, ApproveAccounts, ApproveParams},
};

use crate::{
    assert_expiry, program::MarketplaceProgram, record_event, ListState, MakeEvent, Target,
    TcompEvent, TcompSigner, CURRENT_TCOMP_VERSION,
};

#[derive(Accounts)]
pub struct ListWns<'info> {
    /// CHECK: the token transfer will fail if owner is wrong (signature error)
    pub owner: Signer<'info>,

    #[account(mut, token::mint = mint, token::authority = owner)]
    pub owner_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = payer,
        seeds=[
            b"list_state".as_ref(),
            mint.key().as_ref(),
        ],
        bump,
        space = ListState::SIZE,
    )]
    pub list_state: Box<Account<'info, ListState>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = list_state,
        associated_token::token_program = token_program,
    )]
    pub list_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    pub mint: Box<InterfaceAccount<'info, Mint>>,

    //separate payer so that a program can list with owner being a PDA
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

    pub cosigner: Option<Signer<'info>>,

    /// SPL token mint of the currency.
    pub currency: Option<Box<InterfaceAccount<'info, Mint>>>,
}

pub fn process_list_wns<'info>(
    ctx: Context<'_, '_, '_, 'info, ListWns<'info>>,
    amount: u64,
    expire_in_sec: Option<u64>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
) -> Result<()> {
    let currency = ctx.accounts.currency.as_ref().map(|c| c.key());

    // validates the mint
    validate_mint(&ctx.accounts.mint.to_account_info())?;

    let approve_accounts = ApproveAccounts {
        payer: ctx.accounts.payer.to_account_info(),
        authority: ctx.accounts.owner.to_account_info(),
        mint: ctx.accounts.mint.to_account_info(),
        approve_account: ctx.accounts.approve.to_account_info(),
        payment_mint: ctx.accounts.currency.as_ref().map(|c| c.to_account_info()),
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
    approve(approve_accounts, ApproveParams::no_royalties())?;

    // transfer the NFT

    let transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.owner_ta.to_account_info(),
            to: ctx.accounts.list_ta.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    transfer_checked(
        transfer_cpi.with_remaining_accounts(vec![
            ctx.accounts.wns_program.to_account_info(),
            ctx.accounts.extra_metas.to_account_info(),
            ctx.accounts.approve.to_account_info(),
        ]),
        1, // supply = 1
        0, // decimals = 0
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

    let expiry = assert_expiry(expire_in_sec, None)?;
    list_state.expiry = expiry;
    list_state.rent_payer = ctx.accounts.payer.key();
    list_state.cosigner = ctx
        .accounts
        .cosigner
        .as_ref()
        .map(|c| c.key())
        .unwrap_or_default();
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
            account: ctx.accounts.owner_ta.to_account_info(),
            destination: ctx.accounts.payer.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
        },
    ))
}
