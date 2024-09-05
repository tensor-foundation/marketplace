//! # Data Wrapper
//! We use CPI calls to circumvent the 10kb log limit on Solana transactions.
//! Instead of logging events to the runtime, we execute a CPI to the `wrapper` program
//! where the log data is serialized into the instruction data.

use crate::*;

// Anchor discriminator length.
const DISCRIMINATOR_LEN: usize = 8;

#[derive(Accounts)]
pub struct TcompNoop<'info> {
    /// CHECK: has to be signed by an account owned by the program (data checked in the instruction)
    #[account(owner = crate::ID)]
    pub tcomp_signer: Signer<'info>,
}

pub fn process_noop(ctx: Context<TcompNoop>) -> Result<()> {
    let data = &(*ctx.accounts.tcomp_signer.data).borrow();
    // the account must not be empty
    if data.len() < DISCRIMINATOR_LEN
        || u64::from_le_bytes(
            data[..DISCRIMINATOR_LEN]
                .try_into()
                .map_err(|_error| ErrorCode::AccountDiscriminatorNotFound)?,
        ) == 0
    {
        return Err(ErrorCode::AccountDiscriminatorNotFound.into());
    }

    // the discriminator must match a Bid or List account
    if data[0..DISCRIMINATOR_LEN] != BID_STATE_DISCRIMINATOR
        && data[0..DISCRIMINATOR_LEN] != LIST_STATE_DISCRIMINATOR
    {
        return Err(ErrorCode::AccountDiscriminatorMismatch.into());
    }

    Ok(())
}

pub(crate) fn record_event<'info>(
    event: &TcompEvent,
    tcomp: &Program<'info, crate::program::MarketplaceProgram>,
    signer: TcompSigner<'_, 'info>,
) -> Result<()> {
    let mut data = Vec::new();
    data.extend_from_slice(&hash::hash("global:tcomp_noop".as_bytes()).to_bytes()[..8]);
    data.extend_from_slice(&event.try_to_vec()?);

    match signer {
        TcompSigner::Bid(bid) => {
            invoke_signed(
                &Instruction {
                    program_id: tcomp.key(),
                    accounts: [AccountMeta {
                        pubkey: bid.key(),
                        is_signer: true,
                        is_writable: false,
                    }; 1]
                        .to_vec(),
                    data,
                },
                &[bid.to_account_info()],
                &[&bid.seeds()],
            )?;
        }
        TcompSigner::List(list) => {
            invoke_signed(
                &Instruction {
                    program_id: tcomp.key(),
                    accounts: [AccountMeta {
                        pubkey: list.key(),
                        is_signer: true,
                        is_writable: false,
                    }; 1]
                        .to_vec(),
                    data,
                },
                &[list.to_account_info()],
                &[&list.seeds()],
            )?;
        }
    };

    Ok(())
}
