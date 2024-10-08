use metaplex_core::instructions::TransferV1CpiBuilder;
use tensor_toolbox::metaplex_core::{validate_asset, MetaplexCore};

use crate::*;

use self::program::MarketplaceProgram;

#[derive(Accounts)]
pub struct CloseExpiredListingCore<'info> {
    #[account(
        mut,
        seeds=[b"list_state".as_ref(), asset.key.as_ref()],
        bump = list_state.bump[0],
        close = rent_destination,
        has_one = owner,
        constraint = list_state.expiry < Clock::get()?.unix_timestamp @ TcompError::ListingNotYetExpired
    )]
    pub list_state: Box<Account<'info, ListState>>,

    /// CHECK: validated on instruction handler
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,

    /// CHECK: validated on instruction handler
    pub collection: Option<UncheckedAccount<'info>>,

    /// CHECK: stored on list_state. In this case doesn't have to sign since the listing expired.
    pub owner: UncheckedAccount<'info>,

    pub mpl_core_program: Program<'info, MetaplexCore>,

    pub system_program: Program<'info, System>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    /// CHECK: list_state.get_rent_payer()
    #[account(mut,
        constraint = rent_destination.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,
}

pub fn process_close_expired_listing_core<'info>(
    ctx: Context<'_, '_, '_, 'info, CloseExpiredListingCore<'info>>,
) -> Result<()> {
    let list_state = &ctx.accounts.list_state;
    validate_asset(
        &ctx.accounts.asset,
        ctx.accounts.collection.as_ref().map(|c| c.as_ref()),
    )?;

    TransferV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
        .asset(&ctx.accounts.asset)
        .authority(Some(&ctx.accounts.list_state.to_account_info()))
        .new_owner(&ctx.accounts.owner.to_account_info())
        .payer(&ctx.accounts.list_state.to_account_info()) // pay for what?
        .collection(ctx.accounts.collection.as_ref().map(|c| c.as_ref()))
        .invoke_signed(&[&ctx.accounts.list_state.seeds()])?;

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

    Ok(())
}
