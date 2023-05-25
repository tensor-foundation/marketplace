use crate::*;

#[derive(Accounts)]
#[instruction(bid_id: Pubkey)]
pub struct Bid<'info> {
    pub system_program: Program<'info, System>,
    pub tcomp_program: Program<'info, crate::program::Tcomp>,
    #[account(init_if_needed, payer = owner,
        seeds=[b"bid_state".as_ref(), owner.key().as_ref(), bid_id.as_ref()],
        bump,
        space = BID_STATE_SIZE,
    )]
    pub bid_state: Box<Account<'info, BidState>>,
    #[account(mut)]
    pub owner: Signer<'info>,
    /// CHECK: optional, manually handled in handler: 1)seeds, 2)program owner, 3)normal owner, 4)margin acc stored on pool
    #[account(mut)]
    pub margin_account: UncheckedAccount<'info>,
}

impl<'info> Bid<'info> {
    fn transfer_lamports(&self, to: &AccountInfo<'info>, lamports: u64) -> Result<()> {
        invoke(
            &system_instruction::transfer(self.owner.key, to.key, lamports),
            &[
                self.owner.to_account_info(),
                to.clone(),
                self.system_program.to_account_info(),
            ],
        )
        .map_err(Into::into)
    }
}

impl<'info> Validate<'info> for Bid<'info> {
    fn validate(&self) -> Result<()> {
        Ok(())
    }
}

#[access_control(ctx.accounts.validate())]
pub fn handler<'info>(
    ctx: Context<'_, '_, '_, 'info, Bid<'info>>,
    bid_id: Pubkey,
    target: Target,
    target_id: Pubkey,
    field: Option<Field>,
    field_id: Option<Pubkey>,
    amount: u64,
    quantity: u32,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
) -> Result<()> {
    // TODO: temp while we enable them
    require!(currency.is_none(), TcompError::CurrencyNotYetEnabled);
    require!(maker_broker.is_none(), TcompError::MakerBrokerNotYetEnabled);

    let bid_state = &mut ctx.accounts.bid_state;

    // Passed in quantity can't be smaller than what's already been filled
    // Initially this value is 0, so it'll always pass
    require!(
        quantity >= bid_state.filled_quantity,
        TcompError::BadQuantity
    );
    // At least 1 seems reasonable, else why bother
    require!(quantity >= 1, TcompError::BadQuantity);

    bid_state.version = CURRENT_TCOMP_VERSION;
    bid_state.bump = [unwrap_bump!(ctx, "bid_state")];
    bid_state.amount = amount;
    bid_state.quantity = quantity;
    bid_state.currency = currency;
    bid_state.private_taker = private_taker;
    bid_state.maker_broker = maker_broker;
    bid_state.margin = None; //overwritten below if margin present

    // Since this is part of the seeds we're safe to always update this
    bid_state.owner = ctx.accounts.owner.key();
    bid_state.bid_id = bid_id;

    if target == Target::AssetId {
        require!(quantity == 1, TcompError::BadQuantity);
        require!(target_id == bid_id, TcompError::TargetIdMustEqualBidId);
        require!(field.is_none(), TcompError::BadBidField);
        require!(field_id.is_none(), TcompError::BadBidField);
    }

    // Can only be set once.
    if bid_state.target_id == Pubkey::default() {
        bid_state.target = target.clone();
        bid_state.target_id = target_id;
        bid_state.field = field.clone();
        bid_state.field_id = field_id;
    } else {
        // Verify to make sure the bidder isn't expecting anything else.
        require!(bid_state.target == target, TcompError::CannotModifyTarget);
        require!(
            bid_state.target_id == target_id,
            TcompError::CannotModifyTarget
        );
        require!(bid_state.field == field, TcompError::CannotModifyTarget);
        require!(
            bid_state.field_id == field_id,
            TcompError::CannotModifyTarget
        );
    }

    // Grab current expiry in case they're editing a bid
    let current_expiry = bid_state.expiry;
    // Figure out new expiry
    let expiry = match expire_in_sec {
        Some(expire_in_sec) => {
            let expire_in_i64 = i64::try_from(expire_in_sec).unwrap();
            require!(expire_in_i64 <= MAX_EXPIRY_SEC, TcompError::ExpiryTooLarge);
            Clock::get()?.unix_timestamp + expire_in_i64
        }
        // When creating bid for the first time.
        None if current_expiry == 0 => Clock::get()?.unix_timestamp + MAX_EXPIRY_SEC,
        // Editing a bid.
        None => current_expiry,
    };
    bid_state.expiry = expiry;

    let remaining_quantity = unwrap_int!(quantity.checked_sub(bid_state.filled_quantity));

    // (!) Has to go before lamport transfers to prevent "sum of account balances before and after instruction do not match"
    record_event(
        &TcompEvent::Maker(MakeEvent {
            maker: *ctx.accounts.owner.key,
            bid_id: Some(bid_id),
            target,
            target_id,
            field,
            field_id,
            amount,
            quantity: remaining_quantity,
            currency,
            expiry,
            private_taker,
        }),
        &ctx.accounts.tcomp_program,
        TcompSigner::Bid(&ctx.accounts.bid_state),
    )?;

    let bid_rent =
        Rent::get()?.minimum_balance(ctx.accounts.bid_state.to_account_info().data_len());
    let bid_balance = unwrap_int!(ctx
        .accounts
        .bid_state
        .to_account_info()
        .lamports()
        .checked_sub(bid_rent));

    //transfer lamports
    let margin_account_info = &ctx.accounts.margin_account.to_account_info();
    let margin_account_result =
        assert_decode_margin_account(margin_account_info, &ctx.accounts.owner.to_account_info());

    let deposit_amount = unwrap_int!(amount.checked_mul(remaining_quantity as u64));

    match margin_account_result {
        //marginated
        Ok(margin_account) => {
            // Redundant (assert_decode_margin_account already checks this) but why not
            require!(
                margin_account.owner == *ctx.accounts.owner.key,
                TcompError::BadMargin
            );
            let bid_state = &mut ctx.accounts.bid_state;
            bid_state.margin = Some(margin_account_info.key());
            //transfer any existing balance back to user (this is in case they're editing an existing non-marginated bid)
            if bid_balance > 0 {
                transfer_lamports_from_pda(
                    &ctx.accounts.bid_state.to_account_info(),
                    &ctx.accounts.owner.to_account_info(),
                    bid_balance,
                )?;
            }
            //(!)We do NOT transfer lamports to margin if insufficient, assume done in a separate ix if needed
        }
        // Not marginated
        Err(_) => {
            if bid_balance > deposit_amount {
                let diff = unwrap_int!(bid_balance.checked_sub(deposit_amount));
                //transfer the excess back to user
                transfer_lamports_from_pda(
                    &ctx.accounts.bid_state.to_account_info(),
                    &ctx.accounts.owner.to_account_info(),
                    diff,
                )?;
            } else {
                let diff = unwrap_int!(deposit_amount.checked_sub(bid_balance));
                ctx.accounts
                    .transfer_lamports(&ctx.accounts.bid_state.to_account_info(), diff)?;
            }
        }
    }

    Ok(())
}
