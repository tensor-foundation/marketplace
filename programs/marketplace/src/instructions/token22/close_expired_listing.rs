use anchor_spl::{
    token_2022::{close_account, transfer_checked, CloseAccount, Token2022, TransferChecked},
    token_interface::{Mint, TokenAccount},
};

use self::program::MarketplaceProgram;
use crate::*;

#[derive(Accounts)]
pub struct CloseExpiredListingT22<'info> {
    #[account(mut, token::mint = mint, token::authority = owner)]
    pub owner_token: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
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
        mut,
        seeds=[b"list_state".as_ref(), mint.key().as_ref()],
        bump = list_state.bump[0],
        close = rent_destination,
        has_one = owner,
    )]
    pub list_state: Box<Account<'info, ListState>>,

    /// CHECK: seed in nft_escrow & nft_receipt
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: stored on list_state. In this case doesn't have to sign since the listing expired.
    pub owner: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token2022>,

    pub system_program: Program<'info, System>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    /// CHECK: list_state.get_rent_payer()
    #[account(mut,
        constraint = rent_destination.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,
}

pub fn process_close_expired_listing_t22<'info>(
    ctx: Context<'_, '_, '_, 'info, CloseExpiredListingT22<'info>>,
) -> Result<()> {
    let list_state = &ctx.accounts.list_state;
    require!(
        list_state.expiry < Clock::get()?.unix_timestamp,
        TcompError::ListingNotYetExpired
    );

    // transfer the NFT

    let transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.list_token.to_account_info(),
            to: ctx.accounts.owner_token.to_account_info(),
            authority: ctx.accounts.list_state.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    transfer_checked(
        transfer_cpi.with_signer(&[&ctx.accounts.list_state.seeds()]),
        1,
        0,
    )?; // supply = 1, decimals = 0

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
        &ctx.accounts.marketplace_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    // closes the list token account

    close_account(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.list_token.to_account_info(),
                destination: ctx.accounts.rent_destination.to_account_info(),
                authority: ctx.accounts.list_state.to_account_info(),
            },
        )
        .with_signer(&[&ctx.accounts.list_state.seeds()]),
    )?;

    Ok(())
}
