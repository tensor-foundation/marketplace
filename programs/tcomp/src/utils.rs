pub use crate::*;

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

pub struct VerifyArgs<'a, 'info> {
    pub root: [u8; 32],
    pub nonce: u64,
    pub index: u32,
    pub metadata: MetadataArgs,
    pub merkle_tree: &'a AccountInfo<'info>,
    pub leaf_owner: &'a AccountInfo<'info>,
    pub leaf_delegate: &'a AccountInfo<'info>,
    pub compression_program: &'a AccountInfo<'info>,
    pub creator_accounts: &'a [AccountInfo<'info>],
    pub proof_accounts: &'a [AccountInfo<'info>],
}

// most of the stuff below is taken from process_mint_v1 in bubblegum
pub fn verify_cnft(args: VerifyArgs) -> Result<(Pubkey, [u8; 32], [u8; 32])> {
    let VerifyArgs {
        root,
        nonce,
        index,
        metadata,
        merkle_tree,
        leaf_owner,
        leaf_delegate,
        compression_program,
        creator_accounts,
        proof_accounts,
    } = args;

    //this is the correct metadat that matches metaplex's format
    let mplex_metadata = metadata.into(creator_accounts);
    let creator_hash = hash_creators(&mplex_metadata.creators)?;
    let metadata_args_hash = hashv(&[mplex_metadata.try_to_vec()?.as_slice()]);
    let data_hash = hashv(&[
        &metadata_args_hash.to_bytes(),
        &mplex_metadata.seller_fee_basis_points.to_le_bytes(),
    ])
    .to_bytes();

    let asset_id = get_asset_id(&merkle_tree.key(), nonce);
    let leaf = LeafSchema::new_v0(
        asset_id,
        leaf_owner.key(),
        leaf_delegate.key(),
        nonce,
        data_hash,
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

    // TODO remove
    msg!("yay valid");

    return Ok((asset_id, creator_hash, data_hash));
}

pub struct TransferArgs<'a, 'info> {
    pub root: [u8; 32],
    pub nonce: u64,
    pub index: u32,
    pub data_hash: [u8; 32],
    pub creator_hash: [u8; 32],
    pub tree_authority: &'a AccountInfo<'info>,
    pub leaf_owner: &'a AccountInfo<'info>,
    pub leaf_delegate: &'a AccountInfo<'info>,
    pub new_leaf_owner: &'a AccountInfo<'info>,
    pub merkle_tree: &'a AccountInfo<'info>,
    pub log_wrapper: &'a AccountInfo<'info>,
    pub compression_program: &'a AccountInfo<'info>,
    pub system_program: &'a AccountInfo<'info>,
    pub bubblegum_program: &'a AccountInfo<'info>,
    pub proof_accounts: &'a [AccountInfo<'info>],
    //not pretty but less painful than trying to pass in seeds of varialbe length
    pub signer_bid: Option<&'a Account<'info, BidState>>,
    pub signer_listing: Option<&'a Account<'info, ListState>>,
}

pub fn transfer_cnft(args: TransferArgs) -> Result<()> {
    let TransferArgs {
        root,
        nonce,
        index,
        data_hash,
        creator_hash,
        tree_authority,
        leaf_owner,
        leaf_delegate,
        new_leaf_owner,
        merkle_tree,
        log_wrapper,
        compression_program,
        system_program,
        bubblegum_program,
        proof_accounts,
        signer_bid,
        signer_listing,
    } = args;

    // TODO dunno why this .data() doesn't work
    // let transfer_instruction_data = mpl_bubblegum::instruction::Transfer {
    //     root,
    //     data_hash,
    //     creator_hash,
    //     nonce,
    //     index,
    // }
    // .data();

    const INSTRUCTION_DATA_SIZE: usize = 108 + 8;
    const INSTRUCTION_TAG: [u8; 8] = [163, 52, 200, 231, 140, 3, 69, 186];

    let mut data: Vec<u8> = Vec::with_capacity(INSTRUCTION_DATA_SIZE);
    data.extend_from_slice(&INSTRUCTION_TAG);
    data.extend_from_slice(&root);
    data.extend_from_slice(&data_hash);
    data.extend_from_slice(&creator_hash);
    data.extend_from_slice(&nonce.to_le_bytes());
    data.extend_from_slice(&index.to_le_bytes());

    // Get the account metas for the CPI call
    // @notice: the reason why we need to manually call `to_account_metas` is because `Bubblegum::transfer` takes
    //          either the owner or the delegate as an optional signer. Since the delegate is a PDA in this case the
    //          client side code cannot set its is_signer flag to true, and Anchor drops it's is_signer flag when converting
    //          CpiContext to account metas on the CPI call since there is no Signer specified in the instructions context.
    let transfer_accounts = mpl_bubblegum::cpi::accounts::Transfer {
        tree_authority: tree_authority.clone(),
        leaf_owner: leaf_owner.clone(),
        leaf_delegate: leaf_delegate.clone(),
        new_leaf_owner: new_leaf_owner.clone(),
        merkle_tree: merkle_tree.clone(),
        log_wrapper: log_wrapper.clone(),
        compression_program: compression_program.clone(),
        system_program: system_program.clone(),
    };
    let mut transfer_account_metas = transfer_accounts.to_account_metas(Some(true));
    for acct in transfer_account_metas.iter_mut() {
        if acct.pubkey == leaf_owner.key() {
            (*acct).is_signer = true;
        }
    }
    for node in proof_accounts {
        transfer_account_metas.push(AccountMeta::new_readonly(*node.key, false));
    }

    // TODO not currently taking into account the canopy

    let mut transfer_cpi_account_infos = transfer_accounts.to_account_infos();
    transfer_cpi_account_infos.extend_from_slice(proof_accounts);

    if let Some(signer_bid) = signer_bid {
        invoke_signed(
            &Instruction {
                program_id: bubblegum_program.key(),
                accounts: transfer_account_metas,
                data,
            },
            &(transfer_cpi_account_infos[..]),
            &[&signer_bid.seeds()],
        )?;
        return Ok(());
    }

    if let Some(signer_listing) = signer_listing {
        invoke_signed(
            &Instruction {
                program_id: bubblegum_program.key(),
                accounts: transfer_account_metas,
                data,
            },
            &(transfer_cpi_account_infos[..]),
            &[&signer_listing.seeds()],
        )?;
        return Ok(());
    }

    invoke(
        &Instruction {
            program_id: bubblegum_program.key(),
            accounts: transfer_account_metas,
            data,
        },
        &(transfer_cpi_account_infos[..]),
    )?;

    Ok(())
}
