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

// Most of the stuff below is taken from process_mint_v1 in bubblegum
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
    );
    let cpi_ctx = CpiContext::new(
        compression_program.clone(),
        spl_account_compression::cpi::accounts::VerifyLeaf {
            merkle_tree: merkle_tree.clone(),
        },
    )
    .with_remaining_accounts(proof_accounts.to_vec());

    // TODO alright ffs this isn't gonig to work have to copy paste verification code from spl compression
    // TODO: not currently taking into account the canopy

    // msg!("hashed leaf, ${:?}", leaf.to_node());

    // SPL compression receives index, not nonce
    let r = spl_account_compression::cpi::verify_leaf(cpi_ctx, root, leaf.to_node(), index);

    // let data = spl_account_compression::instruction::VerifyLeaf {
    //     root,
    //     leaf: leaf.to_node(),
    //     index,
    // }
    // .data();
    //
    // let verify_accounts = spl_account_compression::cpi::accounts::VerifyLeaf {
    //     merkle_tree: merkle_tree.clone(),
    // };
    // let mut verify_account_metas = verify_accounts.to_account_metas(Some(true));
    // for node in proof_accounts {
    //     verify_account_metas.push(AccountMeta::new_readonly(*node.key, false));
    // }
    //
    //
    //
    // let mut verify_cpi_account_infos = verify_accounts.to_account_infos();
    // verify_cpi_account_infos.extend_from_slice(proof_accounts);
    //
    // msg!("345");
    //
    // let r = invoke(
    //     &Instruction {
    //         program_id: compression_program.key(),
    //         accounts: verify_account_metas,
    //         data,
    //     },
    //     &(verify_cpi_account_infos[..]),
    // );

    return match r {
        Ok(_) => {
            msg!("yay valid");
            Ok((asset_id, creator_hash, data_hash, mplex_metadata))
        }
        Err(e) => {
            msg!("OH NOOO: {:?}", e);
            Err(TcompError::ArithmeticError.into())
        }
    };
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
    // Not pretty but less painful than trying to pass in seeds of varialbe length
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
        if acct.pubkey == leaf_owner.key() {
            (*acct).is_signer = true;
        }
    }
    for node in proof_accounts {
        transfer_account_metas.push(AccountMeta::new_readonly(*node.key, false));
    }

    // TODO: not currently taking into account the canopy

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

pub fn transfer_all_lamports_from_tswap<'info>(
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

pub fn transfer_creators_fee<'b, 'info>(
    // Not possible have a private enum in Anchor, it's always stuffed into IDL, which leads to:
    // IdlError: Type not found: {"type":{"defined":"&'bAccountInfo<'info>"},"name":"0"}
    // Hence the next 2 lines are 2x Options instead of 1 Enum. First Option dictates branch
    from_pda: Option<&'b AccountInfo<'info>>,
    from_ext: Option<FromExternal<'b, 'info>>,
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

        // TODO: we'll have to seed tcomp with some sol as well to prevent this error

        // Prevents InsufficientFundsForRent, where creator acc doesn't have enough fee
        // https://explorer.solana.com/tx/vY5nYA95ELVrs9SU5u7sfU2ucHj4CRd3dMCi1gWrY7MSCBYQLiPqzABj9m8VuvTLGHb9vmhGaGY7mkqPa1NLAFE
        if unwrap_int!(current_creator_info.lamports().checked_add(creator_fee)) < rent {
            //skip current creator, we can't pay them
            continue;
        }

        remaining_fee = unwrap_int!(remaining_fee.checked_sub(creator_fee));
        if creator_fee > 0 {
            match from_pda {
                Some(from) => {
                    transfer_lamports_from_pda(from, current_creator_info, creator_fee)?;
                }
                None => {
                    let FromExternal { from, sys_prog } = from_ext.as_ref().unwrap();
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
