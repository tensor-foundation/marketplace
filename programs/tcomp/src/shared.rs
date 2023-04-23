use spl_account_compression::{
    _merkle_tree_apply_fn, _merkle_tree_depth_size_apply_fn,
    canopy::fill_in_proof_from_canopy,
    merkle_tree_apply_fn,
    state::{
        merkle_tree_get_size, ConcurrentMerkleTreeHeader, CONCURRENT_MERKLE_TREE_HEADER_SIZE_V1,
    },
    zero_copy::ZeroCopy,
    AccountCompressionError, ChangeLogEvent, ConcurrentMerkleTree,
};

use crate::*;

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
    pub metadata: TMetadataArgs,
    pub merkle_tree: &'a AccountInfo<'info>,
    pub leaf_owner: &'a AccountInfo<'info>,
    pub leaf_delegate: &'a AccountInfo<'info>,
    pub compression_program: &'a AccountInfo<'info>,
    pub creator_accounts: &'a [AccountInfo<'info>],
    pub proof_accounts: &'a [AccountInfo<'info>],
}

pub fn verify_cnft(args: VerifyArgs) -> Result<(Pubkey, [u8; 32], [u8; 32], MetadataArgs)> {
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

    // --------------------------------------- from bubblegum/process_mint_v1

    // Serialize metadata into original metaplex format
    let mplex_metadata = metadata.into(creator_accounts);

    // msg!("creators {:?}", creator_accounts.len());
    // msg!("proof {:?}", proof_accounts.len());
    // msg!("root {:?}", root);
    // msg!(
    //     "leaf: {:?}{:?}{:?}{}{:?}",
    //     get_asset_id(&merkle_tree.key(), nonce),
    //     leaf_owner,
    //     leaf_delegate,
    //     nonce,
    //     mplex_metadata.clone()
    // );

    let creator_hash = hash_creators(&mplex_metadata.creators)?;
    let metadata_args_hash = hashv(&[mplex_metadata.try_to_vec()?.as_slice()]);
    let data_hash = hashv(&[
        &metadata_args_hash.to_bytes(),
        &mplex_metadata.seller_fee_basis_points.to_le_bytes(),
    ])
    .to_bytes();

    // msg!("data_hash {:?}", data_hash);
    // msg!("creator_hash {:?}", creator_hash);
    // msg!("proof accounts {:?}", proof_accounts);
    // msg!("tree {:?}", merkle_tree.key());

    // Nonce is used for asset it, not index
    let asset_id = get_asset_id(&merkle_tree.key(), nonce);
    let leaf = LeafSchema::new_v0(
        asset_id,
        leaf_owner.key(),
        leaf_delegate.key(),
        nonce, // Nonce is also stored in the schema, not index
        data_hash,
        creator_hash,
    )
    .to_node();

    // --------------------------------------- from spl_compression/verify_leaf
    // Can't CPI into it because failed CPI calls can't be caught with match

    require_eq!(
        *merkle_tree.owner,
        spl_account_compression::id(),
        TcompError::FailedLeafVerification
    );
    let merkle_tree_bytes = merkle_tree.try_borrow_data()?;
    let (header_bytes, rest) = merkle_tree_bytes.split_at(CONCURRENT_MERKLE_TREE_HEADER_SIZE_V1);

    let header = ConcurrentMerkleTreeHeader::try_from_slice(header_bytes)?;
    header.assert_valid()?;
    header.assert_valid_leaf_index(index)?;

    let merkle_tree_size = merkle_tree_get_size(&header)?;
    let (tree_bytes, canopy_bytes) = rest.split_at(merkle_tree_size);

    let mut proof = vec![];
    for node in proof_accounts.iter() {
        proof.push(node.key().to_bytes());
    }
    fill_in_proof_from_canopy(canopy_bytes, header.get_max_depth(), index, &mut proof)?;
    let id = merkle_tree.key();

    return match merkle_tree_apply_fn!(
        header, id, tree_bytes, prove_leaf, root, leaf, &proof, index
    ) {
        Ok(_) => {
            msg!("Leaf Valid");
            Ok((asset_id, creator_hash, data_hash, mplex_metadata))
        }
        Err(e) => {
            msg!("FAILED LEAF VERIFICATION: {:?}", e);
            Err(TcompError::FailedLeafVerification.into())
        }
    };
}

#[derive(AnchorDeserialize, AnchorSerialize)]
#[repr(C)]
pub(crate) enum TransferSigner<'a, 'info> {
    Bid(&'a Account<'info, BidState>),
    List(&'a Account<'info, ListState>),
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
    pub(crate) signer: Option<&'a TransferSigner<'a, 'info>>,
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
        signer,
    } = args;

    let data = mpl_bubblegum::instruction::Transfer {
        root,
        data_hash,
        creator_hash,
        nonce,
        index,
    }
    .data();

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
        if acct.pubkey == leaf_delegate.key() && leaf_delegate.is_signer {
            (*acct).is_signer = true;
        }
        if acct.pubkey == leaf_owner.key() && (leaf_owner.is_signer) {
            (*acct).is_signer = true;
        }
        //for cpi to work
        if let Some(signer) = signer {
            match signer {
                TransferSigner::Bid(bid) => {
                    if acct.pubkey == bid.key() {
                        (*acct).is_signer = true;
                    }
                }
                TransferSigner::List(list) => {
                    if acct.pubkey == list.key() {
                        (*acct).is_signer = true;
                    }
                }
            }
        }

        if acct.pubkey == leaf_owner.key() && leaf_owner.is_signer {
            (*acct).is_signer = true;
        }
    }
    for node in proof_accounts {
        transfer_account_metas.push(AccountMeta::new_readonly(*node.key, false));
    }

    let mut transfer_cpi_account_infos = transfer_accounts.to_account_infos();
    transfer_cpi_account_infos.extend_from_slice(proof_accounts);

    if let Some(signer) = signer {
        match signer {
            TransferSigner::Bid(bid) => {
                invoke_signed(
                    &Instruction {
                        program_id: bubblegum_program.key(),
                        accounts: transfer_account_metas,
                        data,
                    },
                    &(transfer_cpi_account_infos[..]),
                    &[&bid.seeds()],
                )?;
            }
            TransferSigner::List(list) => {
                invoke_signed(
                    &Instruction {
                        program_id: bubblegum_program.key(),
                        accounts: transfer_account_metas,
                        data,
                    },
                    &(transfer_cpi_account_infos[..]),
                    &[&list.seeds()],
                )?;
            }
        }
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

pub fn calc_fees(amount: u64) -> Result<(u64, u64)> {
    let full_fee = unwrap_checked!({
        (FEE_BPS as u64)
            .checked_mul(amount)?
            .checked_div(HUNDRED_PCT_BPS as u64)
    });
    let broker_fee = unwrap_checked!({
        full_fee
            .checked_mul(TAKER_BROKER_PCT as u64)?
            .checked_div(100)
    });
    let tcomp_fee = unwrap_checked!({ full_fee.checked_sub(broker_fee) });

    // Stupidity check, broker should never be higher than main fee
    require!(tcomp_fee > broker_fee, TcompError::ArithmeticError);

    Ok((tcomp_fee, broker_fee))
}

pub fn calc_creators_fee(
    metadata: &MetadataArgs,
    amount: u64,
    optional_royalty_pct: Option<u16>,
) -> Result<u64> {
    let creators_fee_bps = if metadata.token_standard.is_some() && false
    // TODO: currently bubblegum doesn't recognize pNFTs, keeping as placeholder for when it does
    // metadata.token_standard.unwrap() == TokenStandard::ProgrammableNonFungible
    {
        // For pnfts, pay full royalties
        metadata.seller_fee_basis_points as u64
    } else if let Some(optional_royalty_pct) = optional_royalty_pct {
        require!(optional_royalty_pct < 100, TcompError::BadRoyaltiesPct);

        // If optional passed, pay optional royalties
        unwrap_checked!({
            (metadata.seller_fee_basis_points as u64)
                .checked_mul(optional_royalty_pct as u64)?
                .checked_div(100_u64)
        })
    } else {
        // Else pay 0
        0_u64
    };
    let fee = unwrap_checked!({
        creators_fee_bps
            .checked_mul(amount)?
            .checked_div(HUNDRED_PCT_BPS as u64)
    });

    Ok(fee)
}

pub fn transfer_all_lamports_from_tcomp<'info>(
    from_pda: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
) -> Result<()> {
    let rent = Rent::get()?.minimum_balance(from_pda.data_len());
    let to_move = unwrap_int!(from_pda.lamports().checked_sub(rent));

    transfer_lamports_from_pda(from_pda, to, to_move)
}

pub fn transfer_lamports_from_pda<'info>(
    from_pda: &AccountInfo<'info>,
    to: &AccountInfo<'info>,
    lamports: u64,
) -> Result<()> {
    let remaining_pda_lamports = unwrap_int!(from_pda.lamports().checked_sub(lamports));
    // Check we are not withdrawing into our rent.
    let rent = Rent::get()?.minimum_balance(from_pda.data_len());
    require!(
        remaining_pda_lamports >= rent,
        TcompError::InsufficientBalance
    );

    **from_pda.try_borrow_mut_lamports()? = remaining_pda_lamports;

    let new_to = unwrap_int!(to.lamports.borrow().checked_add(lamports));
    **to.lamports.borrow_mut() = new_to;

    Ok(())
}

pub struct FromExternal<'b, 'info> {
    pub from: &'b AccountInfo<'info>,
    pub sys_prog: &'b AccountInfo<'info>,
}

#[derive(AnchorDeserialize, AnchorSerialize)]
#[repr(C)]
pub(crate) enum FromAcc<'a, 'info> {
    Pda(&'a AccountInfo<'info>),
    External(&'a FromExternal<'a, 'info>),
}

pub(crate) fn transfer_creators_fee<'a, 'info>(
    from: &'a FromAcc<'a, 'info>,
    metadata: &MetadataArgs,
    creator_accounts: &mut Iter<AccountInfo<'info>>,
    creator_fee: u64,
) -> Result<u64> {
    // Send royalties: taken from AH's calculation:
    // https://github.com/metaplex-foundation/metaplex-program-library/blob/2320b30ec91b729b153f0c0fe719f96d325b2358/auction-house/program/src/utils.rs#L366-L471
    let mut remaining_fee = creator_fee;
    for creator in &metadata.creators {
        let current_creator_info = next_account_info(creator_accounts)?;
        require!(
            creator.address.eq(current_creator_info.key),
            TcompError::CreatorMismatch
        );

        let rent = Rent::get()?.minimum_balance(current_creator_info.data_len());

        let pct = creator.share as u64;
        let creator_fee = unwrap_checked!({ pct.checked_mul(creator_fee)?.checked_div(100) });

        // Prevents InsufficientFundsForRent, where creator acc doesn't have enough fee
        // https://explorer.solana.com/tx/vY5nYA95ELVrs9SU5u7sfU2ucHj4CRd3dMCi1gWrY7MSCBYQLiPqzABj9m8VuvTLGHb9vmhGaGY7mkqPa1NLAFE
        if unwrap_int!(current_creator_info.lamports().checked_add(creator_fee)) < rent {
            //skip current creator, we can't pay them
            continue;
        }

        remaining_fee = unwrap_int!(remaining_fee.checked_sub(creator_fee));
        if creator_fee > 0 {
            match from {
                FromAcc::Pda(from_pda) => {
                    transfer_lamports_from_pda(from_pda, current_creator_info, creator_fee)?;
                }
                FromAcc::External(from_ext) => {
                    let FromExternal { from, sys_prog } = from_ext;
                    invoke(
                        &system_instruction::transfer(
                            from.key,
                            current_creator_info.key,
                            creator_fee,
                        ),
                        &[
                            (*from).clone(),
                            current_creator_info.clone(),
                            (*sys_prog).clone(),
                        ],
                    )?;
                }
            }
        }
    }

    // Return the amount that was sent (minus any dust).
    Ok(unwrap_int!(creator_fee.checked_sub(remaining_fee)))
}
