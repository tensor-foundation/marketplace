use metaplex_core::instructions::TransferV1CpiBuilder;
use tensor_toolbox::metaplex_core::{validate_asset, MetaplexCore};

use crate::*;

use self::program::MarketplaceProgram;

#[derive(Accounts)]
pub struct DelistCore<'info> {
    /// CHECK: validated on instruction handler
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,

    /// CHECK: validated on instruction handler
    pub collection: Option<UncheckedAccount<'info>>,

    /// CHECK: has_one = owner in single_listing
    #[account(mut)]
    pub owner: Signer<'info>,

    /// CHECK: this ensures that specific asset_id belongs to specific owner
    #[account(mut, close = rent_destination,
        seeds=[
            b"list_state".as_ref(),
            asset.key.as_ref(),
        ],
        bump = list_state.bump[0],
        has_one = owner
    )]
    pub list_state: Box<Account<'info, ListState>>,

    pub mpl_core_program: Program<'info, MetaplexCore>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,

    //separate payer so that a program can list with owner being a PDA
    /// CHECK: list_state.get_rent_payer()
    #[account(mut,
        constraint = rent_destination.key() == list_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,
}

pub fn process_delist_core<'info>(
    ctx: Context<'_, '_, '_, 'info, DelistCore<'info>>,
) -> Result<()> {
    validate_asset(
        &ctx.accounts.asset,
        ctx.accounts.collection.as_ref().map(|c| c.as_ref()),
    )?;

    TransferV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
        .asset(&ctx.accounts.asset)
        .authority(Some(&ctx.accounts.list_state.to_account_info()))
        .new_owner(&ctx.accounts.owner.to_account_info())
        .payer(&ctx.accounts.rent_destination) // pay for what?
        .collection(ctx.accounts.collection.as_ref().map(|c| c.as_ref()))
        .invoke_signed(&[&ctx.accounts.list_state.seeds()])?;

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
        &ctx.accounts.marketplace_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    Ok(())
}
