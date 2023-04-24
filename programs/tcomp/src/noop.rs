//! # Data Wrapper
//! We use CPI calls to circumvent the 10kb log limit on Solana transactions.
//! Instead of logging events to the runtime, we execute a CPI to the `wrapper` program
//! where the log data is serialized into the instruction data.

use crate::*;

#[derive(Accounts)]
pub struct TcompNoop<'info> {
    pub tcomp: Program<'info, crate::program::Tcomp>,
}

pub fn record_event<'info>(
    event: &TcompEvent,
    tcomp: &Program<'info, crate::program::Tcomp>,
) -> Result<()> {
    let mut data = Vec::new();
    data.extend_from_slice(&hash::hash("global:tcomp_noop".as_bytes()).to_bytes()[..8]);
    data.extend_from_slice(&event.try_to_vec()?);
    invoke(
        &Instruction {
            program_id: tcomp.key(),
            accounts: [AccountMeta {
                pubkey: tcomp.key(),
                is_signer: false,
                is_writable: false,
            }; 1]
                .to_vec(),
            data,
        },
        &[tcomp.to_account_info()],
    )?;
    Ok(())
}
