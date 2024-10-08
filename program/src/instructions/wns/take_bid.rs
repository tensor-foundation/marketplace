use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_2022::spl_token_2022,
    token_interface::{Mint, Token2022, TokenAccount, TransferChecked},
};
use mpl_token_metadata::types::TokenStandard;
use spl_token_metadata_interface::state::TokenMetadata;
use spl_type_length_value::state::{TlvState, TlvStateBorrowed};
use tensor_toolbox::{
    assert_fee_account, calc_creators_fee,
    token_2022::{
        transfer::transfer_checked as tensor_transfer_checked,
        wns::{approve, validate_mint, ApproveAccounts, ApproveParams},
    },
};
use tensor_vipers::Validate;
use tensorswap::program::EscrowProgram;
use whitelist_program::verify_whitelist_generic;

use crate::{
    take_bid_common::{take_bid_shared, TakeBidArgs},
    BidState, Field, Target, TcompError, CURRENT_TCOMP_VERSION,
};

#[derive(Accounts)]
pub struct TakeBidWns<'info> {
    /// CHECK: checked in assert_fee_account()
    #[account(mut)]
    pub fee_vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub seller: Signer<'info>,

    /// CHECK: this ensures that specific asset_id belongs to specific owner
    #[account(
        mut,
        seeds = [b"bid_state".as_ref(), owner.key().as_ref(), bid_state.bid_id.as_ref()],
        bump = bid_state.bump[0],
        has_one = owner
    )]
    pub bid_state: Box<Account<'info, BidState>>,

    // Owner needs to be passed in as mutable account, so we reassign lamports back to them
    /// CHECK: has_one = owner on bid_state
    #[account(mut)]
    pub owner: UncheckedAccount<'info>,

    /// CHECK: none, can be anything
    #[account(mut)]
    pub taker_broker: Option<UncheckedAccount<'info>>,

    /// CHECK: checked in validate()
    #[account(mut)]
    pub maker_broker: Option<UncheckedAccount<'info>>,

    /// CHECK: optional, manually handled in handler: 1)seeds, 2)program owner, 3)normal owner, 4)margin acc stored on pool
    #[account(mut)]
    pub shared_escrow: UncheckedAccount<'info>,

    /// CHECK: manually below, since this account is optional
    pub whitelist: UncheckedAccount<'info>,

    #[account(mut, token::mint = mint, token::authority = seller)]
    pub seller_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: whitelist, token::mint in seller_token, associated_token::mint in owner_ata_acc
    #[account(
        mint::token_program = spl_token_2022::id(),
    )]
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = seller,
        associated_token::mint = mint,
        associated_token::authority = owner,
        associated_token::token_program = token_program,
    )]
    pub owner_ta: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Program<'info, Token2022>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,

    pub marketplace_program: Program<'info, crate::program::MarketplaceProgram>,

    pub escrow_program: Program<'info, EscrowProgram>,

    // cosigner is checked in validate()
    pub cosigner: Option<Signer<'info>>,

    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    /// CHECK: assert_decode_mint_proof
    pub mint_proof: UncheckedAccount<'info>,

    /// CHECK: bid_state.get_rent_payer()
    #[account(mut,
        constraint = rent_destination.key() == bid_state.get_rent_payer() @ TcompError::BadRentDest
    )]
    pub rent_destination: UncheckedAccount<'info>,

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

impl<'info> Validate<'info> for TakeBidWns<'info> {
    fn validate(&self) -> Result<()> {
        assert_fee_account(
            &self.fee_vault.to_account_info(),
            &self.bid_state.to_account_info(),
        )?;

        let bid_state = &self.bid_state;

        require!(
            bid_state.version == CURRENT_TCOMP_VERSION,
            TcompError::WrongStateVersion
        );

        require!(
            bid_state.expiry >= Clock::get()?.unix_timestamp,
            TcompError::BidExpired
        );

        if let Some(private_taker) = bid_state.private_taker {
            require!(
                private_taker == self.seller.key(),
                TcompError::TakerNotAllowed
            );
        }

        require!(
            bid_state.maker_broker == self.maker_broker.as_ref().map(|acc| acc.key()),
            TcompError::BrokerMismatch
        );

        // check if the cosigner is required
        if bid_state.cosigner != Pubkey::default() {
            let signer = self.cosigner.as_ref().ok_or(TcompError::BadCosigner)?;

            require!(bid_state.cosigner == *signer.key, TcompError::BadCosigner);
        }

        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn process_take_bid_wns<'info>(
    ctx: Context<'_, '_, '_, 'info, TakeBidWns<'info>>,
    // Passing these in so seller doesn't get rugged
    min_amount: u64,
) -> Result<()> {
    // validate mint account
    let seller_fee_basis_points = validate_mint(&ctx.accounts.mint.to_account_info())?;
    let creators_fee = calc_creators_fee(
        seller_fee_basis_points,
        min_amount,
        Some(100), // <- enforced royalties
    )?;

    let bid_state = &ctx.accounts.bid_state;
    let mint = ctx.accounts.mint.key();

    match bid_state.target {
        Target::AssetId => {
            require!(bid_state.target_id == mint, TcompError::WrongTargetId);
        }
        Target::Whitelist => {
            // Ensure the correct whitelist is passed in
            require!(
                *ctx.accounts.whitelist.key == bid_state.target_id,
                TcompError::WrongTargetId
            );

            verify_whitelist_generic(
                &ctx.accounts.whitelist.to_account_info(),
                Some(&ctx.accounts.mint_proof.to_account_info()),
                &ctx.accounts.mint.to_account_info(),
                None, // Collection and Creator verification not supported on T22 standards yet.
            )?;
        }
    }

    //check the bid field filter if it exists
    if let Some(field) = &bid_state.field {
        match field {
            &Field::Name => {
                let mint_info = &ctx.accounts.mint.to_account_info();
                let token_metadata = {
                    let buffer = mint_info.try_borrow_data()?;
                    let state = TlvStateBorrowed::unpack(&buffer)?;
                    state.get_first_variable_len_value::<TokenMetadata>()?
                };

                let mut name_arr = [0u8; 32];
                let length = std::cmp::min(token_metadata.name.len(), name_arr.len());
                name_arr[..length].copy_from_slice(&token_metadata.name.as_bytes()[..length]);
                require!(
                    name_arr
                        == bid_state
                            .field_id
                            .ok_or(TcompError::WrongBidFieldId)?
                            .to_bytes(),
                    TcompError::WrongBidFieldId
                );
            }
        }
    }

    // TODO: we are currently using the seller to pay royalties directly, but this should be
    // the bid_state PDA, otherwise the seller is required to have enough lamports to pay upfront.
    // WNS approve instruction does not allow to pay royalties from a PDA. When we change this,
    // we need to subtract the royalties values from the left_for_seller variable.

    let approve_accounts = ApproveAccounts {
        payer: ctx.accounts.seller.to_account_info(),
        authority: ctx.accounts.seller.to_account_info(),
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
    // royalty payment
    approve(
        approve_accounts,
        ApproveParams {
            price: min_amount,
            royalty_fee: creators_fee,
            signer_seeds: &[],
        },
    )?;

    // transfer the NFT

    let transfer_cpi = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        TransferChecked {
            from: ctx.accounts.seller_ta.to_account_info(),
            to: ctx.accounts.owner_ta.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
        },
    );

    tensor_transfer_checked(
        transfer_cpi.with_remaining_accounts(vec![
            ctx.accounts.wns_program.to_account_info(),
            ctx.accounts.extra_metas.to_account_info(),
            ctx.accounts.approve.to_account_info(),
        ]),
        1, // supply = 1
        0, // decimals = 0
    )?;

    take_bid_shared(TakeBidArgs {
        bid_state: &mut ctx.accounts.bid_state,
        seller: &ctx.accounts.seller.to_account_info(),
        escrow: &ctx.accounts.shared_escrow,
        owner: &ctx.accounts.owner,
        rent_destination: &ctx.accounts.rent_destination,
        maker_broker: &ctx.accounts.maker_broker,
        taker_broker: &ctx.accounts.taker_broker,
        fee_vault: &ctx.accounts.fee_vault.to_account_info(),
        asset_id: mint,
        token_standard: Some(TokenStandard::NonFungible), // <- royalty value was already paid on approve
        creators: vec![], // <- royalty value was already paid on approve
        min_amount,
        optional_royalty_pct: None,
        seller_fee_basis_points: 0, // <- royalty value was already paid on approve
        creator_accounts: ctx.remaining_accounts,
        marketplace_prog: &ctx.accounts.marketplace_program,
        escrow_prog: &ctx.accounts.escrow_program,
        system_prog: &ctx.accounts.system_program,
    })
}
