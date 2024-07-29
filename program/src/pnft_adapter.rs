//! Adapter types.
//!
//! Replicating mplex type for anchor IDL export
//! have to do this because anchor won't include foreign structs in the IDL

use anchor_lang::prelude::*;
use mpl_token_metadata::types::{AuthorizationData, Payload, PayloadType, ProofInfo, SeedsVec};
use std::collections::HashMap;
use tensor_toolbox::mpl_token_auth_rules;

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct AuthorizationDataLocal {
    pub payload: Vec<TaggedPayload>,
}

impl From<AuthorizationDataLocal> for AuthorizationData {
    fn from(val: AuthorizationDataLocal) -> Self {
        let mut map = HashMap::<String, PayloadType>::new();
        val.payload.into_iter().for_each(|tp| {
            map.insert(tp.name, PayloadType::from(tp.payload));
        });
        AuthorizationData {
            payload: Payload { map },
        }
    }
}

//Unfortunately anchor doesn't like HashMaps, nor Tuples, so you can't pass in:
// HashMap<String, PayloadType>, nor
// Vec<(String, PayloadTypeLocal)>
// so have to create this stupid temp struct for IDL to serialize correctly
#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct TaggedPayload {
    pub name: String,
    pub payload: PayloadTypeLocal,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub enum PayloadTypeLocal {
    /// A plain `Pubkey`.
    Pubkey(Pubkey),
    /// PDA derivation seeds.
    Seeds(SeedsVecLocal),
    /// A merkle proof.
    MerkleProof(ProofInfoLocal),
    /// A plain `u64` used for `Amount`.
    Number(u64),
}
impl From<PayloadTypeLocal> for PayloadType {
    fn from(val: PayloadTypeLocal) -> Self {
        match val {
            PayloadTypeLocal::Pubkey(pubkey) => PayloadType::Pubkey(pubkey),
            PayloadTypeLocal::Seeds(seeds) => PayloadType::Seeds(SeedsVec::from(seeds)),
            PayloadTypeLocal::MerkleProof(proof) => {
                PayloadType::MerkleProof(ProofInfo::from(proof))
            }
            PayloadTypeLocal::Number(number) => PayloadType::Number(number),
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct SeedsVecLocal {
    /// The vector of derivation seeds.
    pub seeds: Vec<Vec<u8>>,
}
impl From<SeedsVecLocal> for SeedsVec {
    fn from(val: SeedsVecLocal) -> Self {
        SeedsVec { seeds: val.seeds }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct ProofInfoLocal {
    /// The merkle proof.
    pub proof: Vec<[u8; 32]>,
}
impl From<ProofInfoLocal> for ProofInfo {
    fn from(val: ProofInfoLocal) -> Self {
        ProofInfo { proof: val.proof }
    }
}

#[derive(Accounts)]
pub struct ProgNftShared<'info> {
    //can't deserialize directly coz Anchor traits not implemented
    /// CHECK: address below
    #[account(address = mpl_token_metadata::ID)]
    pub token_metadata_program: Option<UncheckedAccount<'info>>,

    //sysvar ixs don't deserialize in anchor
    /// CHECK: address below
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub sysvar_instructions: Option<UncheckedAccount<'info>>,

    /// CHECK: address below
    #[account(address = mpl_token_auth_rules::ID)]
    pub authorization_rules_program: Option<UncheckedAccount<'info>>,
}
