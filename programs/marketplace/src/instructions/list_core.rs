use mpl_core::instructions::TransferV1CpiBuilder;
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
        space = LIST_STATE_SIZE,
    )]
    pub list_state: Box<Account<'info, ListState>>,

    /// CHECK: the token transfer will fail if owner is wrong (signature error)
    pub owner: Signer<'info>,

    pub mpl_core_program: Program<'info, MetaplexCore>,

    pub tcomp_program: Program<'info, MarketplaceProgram>,

    pub system_program: Program<'info, System>,

    //separate payer so that a program can list with owner being a PDA
    #[account(mut)]
    pub payer: Signer<'info>,
}

pub fn process_list_core<'info>(
    ctx: Context<'_, '_, '_, 'info, ListCore<'info>>,
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
        &ctx.accounts.tcomp_program,
        TcompSigner::List(&ctx.accounts.list_state),
    )?;

    Ok(())
}