use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::{close_account, transfer_checked, CloseAccount, Token2022, TransferChecked},
    token_interface::{Mint, TokenAccount},
};
use tensor_toolbox::{token_2022::validate_mint, NullableOption};

use crate::{
    program::MarketplaceProgram, record_event, validate_cosigner, ListState, MakeEvent, Target,
    TcompError, TcompEvent, TcompSigner, CURRENT_TCOMP_VERSION, LIST_STATE_SIZE, MAX_EXPIRY_SEC,
};

#[derive(Accounts)]
pub struct ListT22<'info> {
    /// CHECK: the token transfer will fail if owner is wrong (signature error)
    pub owner: Signer<'info>,

    #[account(mut, token::mint = mint, token::authority = owner)]
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

    pub token_program: Program<'info, Token2022>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,

    pub cosigner: Option<UncheckedAccount<'info>>,
    //
    // ---- [0..n] remaining accounts for royalties transfer hook
}

pub fn process_list_t22<'info>(
    ctx: Context<'_, '_, '_, 'info, ListT22<'info>>,
    amount: u64,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
) -> Result<()> {
    let list_state = &ctx.accounts.list_state;

    // In case we have an extra remaining account.
    let mut v = Vec::with_capacity(ctx.remaining_accounts.len() + 1);

    // Validate the cosigner and fetch additional remaining account if it exists.
    // Cosigner could be a remaining account from an old client.
    let remaining_accounts =
        if let Some(remaining_account) = validate_cosigner(&ctx.accounts.cosigner, list_state)? {
            v.push(remaining_account);
            v.extend_from_slice(ctx.remaining_accounts);
            v
        } else {
            ctx.remaining_accounts.to_vec()
        };

    // validates the mint

    let royalties = validate_mint(&ctx.accounts.mint.to_account_info())?;

    // transfer the NFT

    let mut transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.owner_ata.to_account_info(),
            to: ctx.accounts.list_ata.to_account_info(),
            authority: ctx.accounts.owner.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    // this will only add the remaining accounts required by a transfer hook if we
    // recognize the hook as a royalty one
    if royalties.is_some() {
        transfer_cpi = transfer_cpi.with_remaining_accounts(remaining_accounts);
    }

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