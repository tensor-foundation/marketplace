//! # Data Wrapper
//! We use CPI calls to circumvent the 10kb log limit on Solana transactions.
//! Instead of logging events to the runtime, we execute a CPI to the `wrapper` program
//! where the log data is serialized into the instruction data.

use crate::*;

pub fn record_event<'info>(event: &TcompEvent, noop_program: &Program<'info, Noop>) -> Result<()> {
    invoke(
        &spl_noop::instruction(event.try_to_vec()?),
        &[noop_program.to_account_info()],
    )?;
    Ok(())
}
