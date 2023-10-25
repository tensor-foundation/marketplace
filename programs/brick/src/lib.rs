#![deny(missing_docs)]

//! A brick.
//! Deploy in case of emergency.
//! anchor build --program-name brick ->
//! write to buffer -> set authority -> deploy

pub use solana_program;

solana_program::declare_id!("TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp");

pub mod entrypoint;
