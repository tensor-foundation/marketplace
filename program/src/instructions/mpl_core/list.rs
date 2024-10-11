use metaplex_core::instructions::TransferV1CpiBuilder;
use tensor_toolbox::metaplex_core::{validate_asset, MetaplexCore};

use crate::*;

use self::program::MarketplaceProgram;

#[derive(Accounts)]
pub struct ListCore<'info> {
    /// CHECK: validated on instruction handler
    #[account(mut)]
    pub asset: UncheckedAccount<'info>,

    /// CHECK: validated on instruction handler
    pub collection: Option<UncheckedAccount<'info>>,

    #[account(init, payer = payer,
        seeds=[
            b"list_state".as_ref(),
            asset.key.as_ref(),
        ],
        bump,
        space = ListState::SIZE,
    )]
    pub list_state: Box<Account<'info, ListState>>,

    /// CHECK: the token transfer will fail if owner is wrong (signature error)
    pub owner: Signer<'info>,

    pub mpl_core_program: Program<'info, MetaplexCore>,

    pub marketplace_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,

    //separate payer so that a program can list with owner being a PDA
    #[account(mut)]
    pub payer: Signer<'info>,

    pub cosigner: Option<Signer<'info>>,
}

pub fn process_list_core<'info>(
    ctx: Context<'_, '_, '_, 'info, ListCore<'info>>,
    amount: u64,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
) -> Result<()> {
    validate_asset(
        &ctx.accounts.asset,
        ctx.accounts.collection.as_ref().map(|c| c.as_ref()),
    )?;

    // transfer the NFT

    TransferV1CpiBuilder::new(&ctx.accounts.mpl_core_program)
        .asset(&ctx.accounts.asset)
        .authority(Some(&ctx.accounts.owner.to_account_info()))
        .new_owner(&ctx.accounts.list_state.to_account_info())
        .payer(&ctx.accounts.payer) // pay for what?
        .collection(ctx.accounts.collection.as_ref().map(|c| c.as_ref()))
        .invoke()?;

    let asset_id = ctx.accounts.asset.key();

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
    // serializes the account data
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

    Ok(())
}
