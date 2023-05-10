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

pub(crate) struct DataHashArgs {
    pub meta_hash: [u8; 32],
    pub creator_shares: Vec<u8>,
    pub creator_verified: Vec<bool>,
    pub seller_fee_basis_points: u16,
}
pub(crate) enum MetadataSrc {
    Metadata(TMetadataArgs),
    DataHash(DataHashArgs),
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

pub(crate) enum TcompSigner<'a, 'info> {
    Bid(&'a Account<'info, BidState>),
    List(&'a Account<'info, ListState>),
}
pub(crate) struct TransferArgs<'a, 'info> {
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
    pub(crate) signer: Option<&'a TcompSigner<'a, 'info>>,
}

pub(crate) fn transfer_cnft(args: TransferArgs) -> Result<()> {
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
            acct.is_signer = true;
        }
        if acct.pubkey == leaf_owner.key() && leaf_owner.is_signer {
            acct.is_signer = true;
        }
        //for cpi to work
        if let Some(signer) = signer {
            match signer {
                TcompSigner::Bid(bid) => {
                    if acct.pubkey == bid.key() {
                        acct.is_signer = true;
                    }
                }
                TcompSigner::List(list) => {
                    if acct.pubkey == list.key() {
                        acct.is_signer = true;
                    }
                }
            }
        }
    }
    for node in proof_accounts {
        transfer_account_metas.push(AccountMeta::new_readonly(*node.key, false));
    }

    let mut transfer_cpi_account_infos = transfer_accounts.to_account_infos();
    transfer_cpi_account_infos.extend_from_slice(proof_accounts);

    if let Some(signer) = signer {
        match signer {
            TcompSigner::Bid(bid) => {
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
            TcompSigner::List(list) => {
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
        (TCOMP_FEE_BPS as u64)
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
    seller_fee_basis_points: u16,
    amount: u64,
    optional_royalty_pct: Option<u16>,
) -> Result<u64> {
    let creator_fee_bps = if let Some(optional_royalty_pct) = optional_royalty_pct {
        require!(optional_royalty_pct <= 100, TcompError::BadRoyaltiesPct);

        // If optional passed, pay optional royalties
        unwrap_checked!({
            (seller_fee_basis_points as u64)
                .checked_mul(optional_royalty_pct as u64)?
                .checked_div(100_u64)
        })
    } else {
        // Else pay 0
        0_u64
    };
    let fee = unwrap_checked!({
        creator_fee_bps
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

pub(crate) struct FromExternal<'b, 'info> {
    pub(crate) from: &'b AccountInfo<'info>,
    pub(crate) sys_prog: &'b AccountInfo<'info>,
}
pub(crate) enum FromAcc<'a, 'info> {
    Pda(&'a AccountInfo<'info>),
    External(&'a FromExternal<'a, 'info>),
}
pub(crate) fn transfer_creators_fee<'a, 'info>(
    from: &'a FromAcc<'a, 'info>,
    creators: &'a Vec<Creator>,
    creator_accounts: &mut Iter<AccountInfo<'info>>,
    creator_fee: u64,
) -> Result<u64> {
    // Send royalties: taken from AH's calculation:
    // https://github.com/metaplex-foundation/metaplex-program-library/blob/2320b30ec91b729b153f0c0fe719f96d325b2358/auction-house/program/src/utils.rs#L366-L471
    let mut remaining_fee = creator_fee;
    for creator in creators {
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

#[inline(never)]
pub fn assert_decode_margin_account<'info>(
    margin_account_info: &AccountInfo<'info>,
    owner: &AccountInfo<'info>,
) -> Result<Account<'info, MarginAccount>> {
    let margin_account: Account<'info, MarginAccount> = Account::try_from(margin_account_info)?;

    let program_id = tensorswap::id();
    let tswap = &Pubkey::from_str(TSWAP_ADDR).unwrap();
    let (key, _) = margin_pda(tswap, &owner.key(), margin_account.nr);
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

// NB: Keep verify here in case we need for future reference.
// pub(crate) struct VerifyArgs<'a, 'info> {
//     pub(crate) root: [u8; 32],
//     pub(crate) nonce: u64,
//     pub(crate) index: u32,
//     pub(crate) metadata_src: MetadataSrc,
//     pub(crate) merkle_tree: &'a AccountInfo<'info>,
//     pub(crate) leaf_owner: &'a AccountInfo<'info>,
//     pub(crate) leaf_delegate: &'a AccountInfo<'info>,
//     pub(crate) creator_accounts: &'a [AccountInfo<'info>],
//     pub(crate) proof_accounts: &'a [AccountInfo<'info>],
// }
// pub(crate) fn verify_cnft(args: VerifyArgs) -> Result<(Pubkey, [u8; 32], [u8; 32], Vec<Creator>)> {
//     let VerifyArgs {
//         root,
//         nonce,
//         index,
//         metadata_src,
//         merkle_tree,
//         leaf_owner,
//         leaf_delegate,
//         creator_accounts,
//         proof_accounts,
//     } = args;

//     // --------------------------------------- from bubblegum/process_mint_v1

//     let (data_hash, creator_hash, creators) = match metadata_src {
//         MetadataSrc::Metadata(metadata) => {
//             // Serialize metadata into original metaplex format
//             let mplex_metadata = metadata.into(creator_accounts);
//             let creator_hash = hash_creators(&mplex_metadata.creators)?;
//             let metadata_args_hash = hashv(&[mplex_metadata.try_to_vec()?.as_slice()]);
//             let data_hash = hashv(&[
//                 &metadata_args_hash.to_bytes(),
//                 &mplex_metadata.seller_fee_basis_points.to_le_bytes(),
//             ])
//             .to_bytes();

//             (data_hash, creator_hash, mplex_metadata.creators)
//         }
//         MetadataSrc::DataHash(DataHashArgs {
//             meta_hash,
//             creator_shares,
//             creator_verified,
//             seller_fee_basis_points,
//         }) => {
//             // Verify seller fee basis points
//             let data_hash = hashv(&[&meta_hash, &seller_fee_basis_points.to_le_bytes()]).to_bytes();
//             // Verify creators
//             let creators = creator_accounts
//                 .iter()
//                 .zip(creator_shares.iter())
//                 .zip(creator_verified.iter())
//                 .map(|((c, s), v)| Creator {
//                     address: c.key(),
//                     verified: *v,
//                     share: *s,
//                 })
//                 .collect::<Vec<_>>();
//             let creator_hash = hash_creators(&creators)?;

//             (data_hash, creator_hash, creators)
//         }
//     };

//     // Nonce is used for asset it, not index
//     let asset_id = get_asset_id(&merkle_tree.key(), nonce);

//     let leaf = LeafSchema::new_v0(
//         asset_id,
//         leaf_owner.key(),
//         leaf_delegate.key(),
//         nonce, // Nonce is also stored in the schema, not index
//         data_hash,
//         creator_hash,
//     )
//     .to_node();

//     // --------------------------------------- from spl_compression/verify_leaf
//     // Can't CPI into it because failed CPI calls can't be caught with match

//     require_eq!(
//         *merkle_tree.owner,
//         spl_account_compression::id(),
//         TcompError::FailedLeafVerification
//     );
//     let merkle_tree_bytes = merkle_tree.try_borrow_data()?;
//     let (header_bytes, rest) = merkle_tree_bytes.split_at(CONCURRENT_MERKLE_TREE_HEADER_SIZE_V1);

//     let header = ConcurrentMerkleTreeHeader::try_from_slice(header_bytes)?;
//     header.assert_valid()?;
//     header.assert_valid_leaf_index(index)?;

//     let merkle_tree_size = merkle_tree_get_size(&header)?;
//     let (tree_bytes, canopy_bytes) = rest.split_at(merkle_tree_size);

//     let mut proof = vec![];
//     for node in proof_accounts.iter() {
//         proof.push(node.key().to_bytes());
//     }
//     fill_in_proof_from_canopy(canopy_bytes, header.get_max_depth(), index, &mut proof)?;
//     let id = merkle_tree.key();

//     match merkle_tree_apply_fn!(header, id, tree_bytes, prove_leaf, root, leaf, &proof, index) {
//         Ok(_) => Ok((asset_id, creator_hash, data_hash, creators)),
//         Err(e) => {
//             msg!("FAILED LEAF VERIFICATION: {:?}", e);
//             Err(TcompError::FailedLeafVerification.into())
//         }
//     }
// }

// https://github.com/coral-xyz/sealevel-attacks/blob/master/programs/9-closing-accounts/secure/src/lib.rs
pub fn close_account(
    pda_to_close: &mut AccountInfo,
    sol_destination: &mut AccountInfo,
) -> Result<()> {
    // Transfer tokens from the account to the sol_destination.
    let dest_starting_lamports = sol_destination.lamports();
    **sol_destination.lamports.borrow_mut() =
        unwrap_int!(dest_starting_lamports.checked_add(pda_to_close.lamports()));
    **pda_to_close.lamports.borrow_mut() = 0;

    // Mark the account discriminator as closed.
    let mut data = pda_to_close.try_borrow_mut_data()?;
    for byte in data.deref_mut().iter_mut() {
        *byte = 0;
    }

    let dst: &mut [u8] = &mut data;
    let mut cursor = std::io::Cursor::new(dst);
    cursor.write_all(&CLOSED_ACCOUNT_DISCRIMINATOR).unwrap();

    Ok(())
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
