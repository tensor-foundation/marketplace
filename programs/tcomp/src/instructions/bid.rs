use crate::*;

#[derive(Accounts)]
#[instruction(asset_id: Pubkey)]
pub struct Bid<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub tcomp_program: Program<'info, crate::program::Tcomp>,
    #[account(init_if_needed, payer = owner,
        seeds=[
            b"bid_state".as_ref(),
            owner.key().as_ref(),
            asset_id.as_ref()
        ],
        bump,
        space = BID_STATE_SIZE,
    )]
    pub bid_state: Box<Account<'info, BidState>>,
    /// CHECK: optional, manually handled in handler: 1)seeds, 2)program owner, 3)normal owner, 4)margin acc stored on pool
    #[account(mut)]
    pub margin_account: UncheckedAccount<'info>,
    #[account(
        seeds = [],
        bump = tswap.bump[0],
        seeds::program = tensorswap::id(),
    )]
    pub tswap: Box<Account<'info, TSwap>>,
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
    asset_id: Pubkey,
    amount: u64,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
) -> Result<()> {
    let bid_state = &mut ctx.accounts.bid_state;
    bid_state.version = CURRENT_TCOMP_VERSION;
    bid_state.bump = [unwrap_bump!(ctx, "bid_state")];
    bid_state.asset_id = asset_id;
    bid_state.owner = ctx.accounts.owner.key();
    bid_state.amount = amount;
    bid_state.currency = currency;
    bid_state.private_taker = private_taker;
    bid_state.margin = None; //overwritten below if margin present

    //grab current expiry in case they're editing a bid
    let current_expiry = bid_state.expiry;
    //figure out new expiry
    let expiry = match expire_in_sec {
        Some(expire_in_sec) => {
            let expire_in_i64 = i64::try_from(expire_in_sec).unwrap();
            require!(expire_in_i64 < MAX_EXPIRY_SEC, TcompError::ExpiryTooLarge);
            Clock::get()?.unix_timestamp + expire_in_i64
        }
        None if current_expiry == 0 => Clock::get()?.unix_timestamp + MAX_EXPIRY_SEC,
        None => current_expiry,
    };
    bid_state.expiry = expiry;

    // (!) Has to go before lamport transfers to prevent "sum of account balances before and after instruction do not match"
    record_event(
        &TcompEvent::Maker(MakeEvent {
            maker: *ctx.accounts.owner.key,
            asset_id,
            amount,
            currency,
            expiry,
            private_taker,
        }),
        &ctx.accounts.tcomp_program,
        TcompSigner::Bid(&ctx.accounts.bid_state),
    )?;

    //transfer lamports
    let margin_account_info = &ctx.accounts.margin_account.to_account_info();
    let margin_account_result = assert_decode_margin_account(
        margin_account_info,
        &ctx.accounts.tswap.to_account_info(),
        &ctx.accounts.owner.to_account_info(),
    );

    match margin_account_result {
        //marginated
        Ok(margin_account) => {
            require!(
                margin_account.owner == *ctx.accounts.owner.key,
                TcompError::BadMargin
            );
            let bid_state = &mut ctx.accounts.bid_state;
            bid_state.margin = Some(margin_account_info.key());
            //transfer any existing balance back to user (this is in case they're editing an existing non-marginated bid)
            let bid_rent =
                Rent::get()?.minimum_balance(ctx.accounts.bid_state.to_account_info().data_len());
            let bid_balance = unwrap_int!(ctx
                .accounts
                .bid_state
                .to_account_info()
                .lamports()
                .checked_sub(bid_rent));
            if bid_balance > 0 {
                transfer_lamports_from_pda(
                    &ctx.accounts.bid_state.to_account_info(),
                    &ctx.accounts.owner.to_account_info(),
                    bid_balance,
                )?;
            }
            //(!)We do NOT transfer lamports to margin if insufficient, assume done in a separate ix if needed
        }
        //not marginated
        Err(_) => {
            let bid_rent =
                Rent::get()?.minimum_balance(ctx.accounts.bid_state.to_account_info().data_len());
            let bid_balance = unwrap_int!(ctx
                .accounts
                .bid_state
                .to_account_info()
                .lamports()
                .checked_sub(bid_rent));
            if bid_balance > amount {
                let diff = unwrap_int!(bid_balance.checked_sub(amount));
                //transfer the excess back to user
                transfer_lamports_from_pda(
                    &ctx.accounts.bid_state.to_account_info(),
                    &ctx.accounts.owner.to_account_info(),
                    diff,
                )?;
            } else {
                let diff = unwrap_int!(amount.checked_sub(bid_balance));
                ctx.accounts
                    .transfer_lamports(&ctx.accounts.bid_state.to_account_info(), diff)?;
            }
        }
    }

    Ok(())
}
