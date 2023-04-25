//! # Data Wrapper
//! We use CPI calls to circumvent the 10kb log limit on Solana transactions.
//! Instead of logging events to the runtime, we execute a CPI to the `wrapper` program
//! where the log data is serialized into the instruction data.

use crate::*;

#[derive(Accounts)]
pub struct TcompNoop<'info> {
    // TODO: is this secure enough? or do we need to bother checking seeds?
    /// CHECK: has to be signed by an account owned by tcomp
    #[account(owner = crate::id())]
    pub tcomp_signer: Signer<'info>,
}

pub fn handler(_ctx: Context<TcompNoop>) -> Result<()> {
    Ok(())
}

pub(crate) fn record_event<'info>(
    event: &TcompEvent,
    tcomp: &Program<'info, crate::program::Tcomp>,
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
