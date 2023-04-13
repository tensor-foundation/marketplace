use anchor_lang::{
    prelude::*,
    solana_program::{
        instruction::Instruction,
        keccak::hashv,
        program::{invoke, invoke_signed},
    },
};
use mpl_bubblegum::{
    self,
    program::Bubblegum,
    state::{leaf_schema::LeafSchema, metaplex_adapter::Creator},
    utils::get_asset_id,
};
use spl_account_compression::{
    program::SplAccountCompression, wrap_application_data_v1, Node, Noop,
};
pub mod bubblegum_adapter;
pub use bubblegum_adapter::*;

declare_id!("CS7Db7Me9YB9UqUfCF9VhcdNPNxGGQgUqpFsvx9mhuqL");

pub fn hash_creators(creators: &[Creator]) -> Result<[u8; 32]> {
    // Convert creator Vec to bytes Vec.
    let creator_data = creators
        .iter()
        .map(|c| [c.address.as_ref(), &[c.verified as u8], &[c.share]].concat())
        .collect::<Vec<_>>();
    // Calculate new creator hash.
    Ok(hashv(
        creator_data
            .iter()
            .map(|c| c.as_slice())
            .collect::<Vec<&[u8]>>()
            .as_ref(),
    )
    .to_bytes())
}

#[program]
pub mod tcomp {
    use super::*;

    pub fn execute_buy<'info>(
        ctx: Context<'_, '_, '_, 'info, ExecuteBuy<'info>>,
        root: [u8; 32],
        nonce: u64,
        index: u32,
        metadata: MetadataArgs,
    ) -> Result<()> {
        // --------------------------------------- verify collection first
        // @dev: most of the stuff below is taken from process_mint_v1 in bubblegum

        let merkle_tree = ctx.accounts.merkle_tree.to_account_info();
        let (creator_accounts, proof_accounts) = ctx
            .remaining_accounts
            .split_at(metadata.creator_shares.len());
        let owner = ctx.accounts.leaf_owner.to_account_info();
        let delegate = ctx.accounts.leaf_delegate.to_account_info();
        let compression_program = &ctx.accounts.compression_program.to_account_info();

        //this is the correct metadat that matches metaplex's format
        let mplexMetadata = metadata.into(creator_accounts);

        let creator_hash = hash_creators(&mplexMetadata.creators)?;

        let metadata_args_hash = hashv(&[mplexMetadata.try_to_vec()?.as_slice()]);
        let data_hash = hashv(&[
            &metadata_args_hash.to_bytes(),
            &mplexMetadata.seller_fee_basis_points.to_le_bytes(),
        ]);

        if mplexMetadata.collection.is_some() {
            let asset_id = get_asset_id(&merkle_tree.key(), nonce);
            let leaf = LeafSchema::new_v0(
                asset_id,
                owner.key(),
                delegate.key(),
                nonce,
                data_hash.to_bytes(),
                creator_hash,
            );

            let cpi_ctx = CpiContext::new(
                compression_program.clone(),
                spl_account_compression::cpi::accounts::VerifyLeaf {
                    merkle_tree: merkle_tree.clone(),
                },
            )
            .with_remaining_accounts(proof_accounts.to_vec());
            spl_account_compression::cpi::verify_leaf(cpi_ctx, root, leaf.to_node(), index)?;

            msg!("yay valid");
        }

        // --------------------------------------- TODO pay sol & royalties

        // --------------------------------------- transfer next

        let transfer_instruction_data = mpl_bubblegum::instruction::Transfer {
            root,
            data_hash: data_hash.to_bytes(),
            creator_hash,
            nonce,
            index,
        };

        const INSTRUCTION_DATA_SIZE: usize = 108 + 8;
        const INSTRUCTION_TAG: [u8; 8] = [163, 52, 200, 231, 140, 3, 69, 186];

        let mut data: Vec<u8> = Vec::with_capacity(INSTRUCTION_DATA_SIZE);
        data.extend_from_slice(&INSTRUCTION_TAG);
        data.extend_from_slice(&root);
        data.extend_from_slice(&data_hash.to_bytes());
        data.extend_from_slice(&creator_hash);
        data.extend_from_slice(&nonce.to_le_bytes());
        data.extend_from_slice(&index.to_le_bytes());

        // Get the account metas for the CPI call
        // @notice: the reason why we need to manually call `to_account_metas` is because `Bubblegum::transfer` takes
        //          either the owner or the delegate as an optional signer. Since the delegate is a PDA in this case the
        //          client side code cannot set its is_signer flag to true, and Anchor drops it's is_signer flag when converting
        //          CpiContext to account metas on the CPI call since there is no Signer specified in the instructions context.
        // @TODO:   Consider TransferWithOwner and TransferWithDelegate instructions to avoid this slightly messy CPI
        let transfer_accounts = mpl_bubblegum::cpi::accounts::Transfer {
            tree_authority: ctx.accounts.tree_authority.to_account_info(),
            leaf_owner: ctx.accounts.leaf_owner.to_account_info(),
            leaf_delegate: ctx.accounts.leaf_delegate.to_account_info(),
            new_leaf_owner: ctx.accounts.new_leaf_owner.to_account_info(),
            merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
            log_wrapper: ctx.accounts.log_wrapper.to_account_info(),
            compression_program: ctx.accounts.compression_program.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
        };
        let mut transfer_account_metas = transfer_accounts.to_account_metas(Some(true));
        for acct in transfer_account_metas.iter_mut() {
            if acct.pubkey == ctx.accounts.leaf_owner.key() {
                (*acct).is_signer = true;
            }
        }
        for node in proof_accounts {
            transfer_account_metas.push(AccountMeta::new_readonly(*node.key, false));
        }

        let mut transfer_cpi_account_infos = transfer_accounts.to_account_infos();
        transfer_cpi_account_infos.extend_from_slice(proof_accounts);
        invoke(
            &Instruction {
                program_id: ctx.accounts.bubblegum.key(),
                accounts: transfer_account_metas,
                data,
            },
            &(transfer_cpi_account_infos[..]),
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ExecuteBuy<'info> {
    /// CHECK: downstream
    pub tree_authority: UncheckedAccount<'info>,
    /// CHECK: downstream
    pub leaf_owner: Signer<'info>,
    /// CHECK: downstream
    pub leaf_delegate: Signer<'info>,
    /// CHECK: downstream
    pub new_leaf_owner: UncheckedAccount<'info>,
    #[account(mut)]
    /// CHECK: downstream
    pub merkle_tree: UncheckedAccount<'info>,
    pub log_wrapper: Program<'info, Noop>,
    pub compression_program: Program<'info, SplAccountCompression>,
    pub system_program: Program<'info, System>,
    pub bubblegum: Program<'info, Bubblegum>,
    // Remaining accounts:
    // 1. 1-5 creators
    // 2. proof
}
