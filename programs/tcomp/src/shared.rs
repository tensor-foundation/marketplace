use crate::*;
use mpl_token_auth_rules::payload::{Payload, PayloadType, ProofInfo, SeedsVec};
use mpl_token_metadata::{self, processor::AuthorizationData, state::TokenStandard};
use tensorswap::common::get_tswap_addr;

// --------------------------------------- stuff related to swap/twhitelist

#[inline(never)]
pub fn assert_decode_margin_account<'info>(
    margin_account_info: &AccountInfo<'info>,
    owner: &AccountInfo<'info>,
) -> Result<Account<'info, MarginAccount>> {
    let margin_account: Account<'info, MarginAccount> = Account::try_from(margin_account_info)?;

    let program_id = tensorswap::id();
    let (key, _) = margin_pda(&get_tswap_addr(), &owner.key(), margin_account.nr);
    if key != *margin_account_info.key {
        throw_err!(TcompError::BadMargin);
    }
    // Check program owner (redundant because of find_program_address above, but why not).
    if *margin_account_info.owner != program_id {
        throw_err!(TcompError::BadMargin);
    }
    // Check normal owner (not redundant - this actually checks if the account is initialized and stores the owner correctly).
    if margin_account.owner != owner.key() {
        throw_err!(TcompError::BadMargin);
    }

    Ok(margin_account)
}

pub fn assert_decode_whitelist<'info>(
    whitelist_info: &AccountInfo<'info>,
) -> Result<Account<'info, Whitelist>> {
    let whitelist: Account<'info, Whitelist> = Account::try_from(whitelist_info)?;

    let (key, _) = Pubkey::find_program_address(&[&whitelist.uuid], &tensor_whitelist::id());
    if key != *whitelist.to_account_info().key {
        throw_err!(TcompError::BadWhitelist);
    }
    // Check account owner (redundant because of find_program_address above, but why not).
    if *whitelist_info.owner != tensor_whitelist::id() {
        throw_err!(TcompError::BadWhitelist);
    }

    Ok(whitelist)
}

// --------------------------------------- helper functions

pub fn calc_creators_fee(
    seller_fee_basis_points: u16,
    amount: u64,
    token_standard: Option<TokenStandard>,
    optional_royalty_pct: Option<u16>,
) -> Result<u64> {
    // Enforce royalties on pnfts.
    let adj_optional_royalty_pct =
        if let Some(TokenStandard::ProgrammableNonFungible) = token_standard {
            Some(100)
        } else {
            optional_royalty_pct
        };
    tensor_nft::calc_creators_fee(seller_fee_basis_points, amount, adj_optional_royalty_pct)
}

// --------------------------------------- can't move this to common because it relies on adapter that HAS TO be in this crate

pub(crate) enum TcompSigner<'a, 'info> {
    Bid(&'a Account<'info, BidState>),
    List(&'a Account<'info, ListState>),
}

pub(crate) enum MetadataSrc {
    Metadata(TMetadataArgs),
    DataHash(DataHashArgs),
}

pub(crate) struct DataHashArgs {
    pub meta_hash: [u8; 32],
    pub creator_shares: Vec<u8>,
    pub creator_verified: Vec<bool>,
    pub seller_fee_basis_points: u16,
}

pub(crate) struct MakeCnftArgs<'a, 'info> {
    pub(crate) nonce: u64,
    pub(crate) metadata_src: MetadataSrc,
    pub(crate) merkle_tree: &'a AccountInfo<'info>,
    pub(crate) creator_accounts: &'a [AccountInfo<'info>],
}

pub(crate) struct CnftArgs {
    pub(crate) asset_id: Pubkey,
    pub(crate) data_hash: [u8; 32],
    pub(crate) creator_hash: [u8; 32],
    pub(crate) creators: Vec<Creator>,
}

pub(crate) fn make_cnft_args(args: MakeCnftArgs) -> Result<CnftArgs> {
    let MakeCnftArgs {
        metadata_src,
        creator_accounts,
        nonce,
        merkle_tree,
    } = args;

    // --------------------------------------- from bubblegum/process_mint_v1

    let (data_hash, creator_hash, creators) = match metadata_src {
        MetadataSrc::Metadata(metadata) => {
            // Serialize metadata into original metaplex format
            let mplex_metadata = metadata.into(creator_accounts);
            let creator_hash = hash_creators(&mplex_metadata.creators)?;
            let metadata_args_hash = hashv(&[mplex_metadata.try_to_vec()?.as_slice()]);
            let data_hash = hashv(&[
                &metadata_args_hash.to_bytes(),
                &mplex_metadata.seller_fee_basis_points.to_le_bytes(),
            ])
            .to_bytes();

            (data_hash, creator_hash, mplex_metadata.creators)
        }
        MetadataSrc::DataHash(DataHashArgs {
            meta_hash,
            creator_shares,
            creator_verified,
            seller_fee_basis_points,
        }) => {
            // Verify seller fee basis points
            let data_hash = hashv(&[&meta_hash, &seller_fee_basis_points.to_le_bytes()]).to_bytes();
            // Verify creators
            let creators = creator_accounts
                .iter()
                .zip(creator_shares.iter())
                .zip(creator_verified.iter())
                .map(|((c, s), v)| Creator {
                    address: c.key(),
                    verified: *v,
                    share: *s,
                })
                .collect::<Vec<_>>();
            let creator_hash = hash_creators(&creators)?;

            (data_hash, creator_hash, creators)
        }
    };

    Ok(CnftArgs {
        asset_id: get_asset_id(&merkle_tree.key(), nonce),
        data_hash,
        creator_hash,
        creators,
    })
}

// --------------------------------------- replicating mplex type for anchor IDL export
//have to do this because anchor won't include foreign structs in the IDL

#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct AuthorizationDataLocal {
    pub payload: Vec<TaggedPayload>,
}
impl From<AuthorizationDataLocal> for AuthorizationData {
    fn from(val: AuthorizationDataLocal) -> Self {
        let mut p = Payload::new();
        val.payload.into_iter().for_each(|tp| {
            p.insert(tp.name, PayloadType::try_from(tp.payload).unwrap());
        });
        AuthorizationData { payload: p }
    }
}

//Unfortunately anchor doesn't like HashMaps, nor Tuples, so you can't pass in:
// HashMap<String, PayloadType>, nor
// Vec<(String, PayloadTypeLocal)>
// so have to create this stupid temp struct for IDL to serialize correctly
#[derive(AnchorSerialize, AnchorDeserialize, Debug, Clone)]
pub struct TaggedPayload {
    name: String,
    payload: PayloadTypeLocal,
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
            PayloadTypeLocal::Seeds(seeds) => {
                PayloadType::Seeds(SeedsVec::try_from(seeds).unwrap())
            }
            PayloadTypeLocal::MerkleProof(proof) => {
                PayloadType::MerkleProof(ProofInfo::try_from(proof).unwrap())
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
    #[account(address = mpl_token_metadata::id())]
    pub token_metadata_program: UncheckedAccount<'info>,
    //sysvar ixs don't deserialize in anchor
    /// CHECK: address below
    #[account(address = anchor_lang::solana_program::sysvar::instructions::ID)]
    pub instructions: UncheckedAccount<'info>,
    /// CHECK: address below
    #[account(address = mpl_token_auth_rules::id())]
    pub authorization_rules_program: UncheckedAccount<'info>,
}
