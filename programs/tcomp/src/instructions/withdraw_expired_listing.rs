// TODO: delete after

// use crate::*;
//
// #[derive(Accounts)]
// pub struct WithdrawExpiredListing<'info> {
//     /// CHECK: this account is empty because we already closed it (but didn't withdraw the nft)
//     pub list_state: UncheckedAccount<'info>,
//     /// CHECK: stored on list_state. In this case doesn't have to sign since the listing expired.
//     #[account(mut)]
//     pub owner: UncheckedAccount<'info>,
//     pub system_program: Program<'info, System>,
//     pub tcomp_program: Program<'info, crate::program::Tcomp>,
//     /// CHECK: downstream
//     pub tree_authority: UncheckedAccount<'info>,
//     /// CHECK: downstream
//     #[account(mut)]
//     pub merkle_tree: UncheckedAccount<'info>,
//     pub log_wrapper: Program<'info, Noop>,
//     pub compression_program: Program<'info, SplAccountCompression>,
//     pub bubblegum_program: Program<'info, Bubblegum>,
//     #[account(constraint = *cosigner.key == Pubkey::from_str("6WQvG9Z6D1NZM76Ljz3WjgR7gGXRBJohHASdQxXyKi8q").unwrap())]
//     pub cosigner: Signer<'info>,
// }
//
// pub fn handler<'info>(
//     ctx: Context<'_, '_, '_, 'info, WithdrawExpiredListing<'info>>,
//     nonce: u64,
//     index: u32,
//     root: [u8; 32],
//     data_hash: [u8; 32],
//     creator_hash: [u8; 32],
// ) -> Result<()> {
//     let data = mpl_bubblegum::instruction::Transfer {
//         root,
//         data_hash,
//         creator_hash,
//         nonce,
//         index,
//     }
//     .data();
//
//     // transfer_cnft(TransferArgs {
//     //     root,
//     //     nonce,
//     //     index,
//     //     data_hash,
//     //     creator_hash,
//     //     tree_authority: &ctx.accounts.tree_authority.to_account_info(),
//     //     leaf_owner: &ctx.accounts.list_state.to_account_info(),
//     //     leaf_delegate: &ctx.accounts.list_state.to_account_info(),
//     //     new_leaf_owner: &ctx.accounts.owner.to_account_info(),
//     //     merkle_tree: &ctx.accounts.merkle_tree.to_account_info(),
//     //     log_wrapper: &ctx.accounts.log_wrapper.to_account_info(),
//     //     compression_program: &ctx.accounts.compression_program.to_account_info(),
//     //     system_program: &ctx.accounts.system_program.to_account_info(),
//     //     bubblegum_program: &ctx.accounts.bubblegum_program.to_account_info(),
//     //     proof_accounts: ctx.remaining_accounts,
//     //     signer: Some(&TcompSigner::List(&ctx.accounts.list_state)),
//     // })?;
//
//     // TODO: this is not great, have to copy pasta, since the fn expects list_state to be deserialized
//     let tree_authority = &ctx.accounts.tree_authority.to_account_info();
//     let leaf_owner = &ctx.accounts.list_state.to_account_info();
//     let leaf_delegate = &ctx.accounts.list_state.to_account_info();
//     let new_leaf_owner = &ctx.accounts.owner.to_account_info();
//     let merkle_tree = &ctx.accounts.merkle_tree.to_account_info();
//     let log_wrapper = &ctx.accounts.log_wrapper.to_account_info();
//     let compression_program = &ctx.accounts.compression_program.to_account_info();
//     let system_program = &ctx.accounts.system_program.to_account_info();
//     let list_state = &ctx.accounts.list_state.to_account_info();
//     let bubblegum_program = &ctx.accounts.bubblegum_program.to_account_info();
//     let proof_accounts = ctx.remaining_accounts;
//
//     require_eq!(list_state.lamports(), 0, TcompError::ArithmeticError);
//
//     // Get the account metas for the CPI call
//     // @notice: the reason why we need to manually call `to_account_metas` is because `Bubblegum::transfer` takes
//     //          either the owner or the delegate as an optional signer. Since the delegate is a PDA in this case the
//     //          client side code cannot set its is_signer flag to true, and Anchor drops it's is_signer flag when converting
//     //          CpiContext to account metas on the CPI call since there is no Signer specified in the instructions context.
//     let transfer_accounts = mpl_bubblegum::cpi::accounts::Transfer {
//         tree_authority: tree_authority.clone(),
//         leaf_owner: leaf_owner.clone(),
//         leaf_delegate: leaf_delegate.clone(),
//         new_leaf_owner: new_leaf_owner.clone(),
//         merkle_tree: merkle_tree.clone(),
//         log_wrapper: log_wrapper.clone(),
//         compression_program: compression_program.clone(),
//         system_program: system_program.clone(),
//     };
//     let mut transfer_account_metas = transfer_accounts.to_account_metas(Some(true));
//     for acct in transfer_account_metas.iter_mut() {
//         if acct.pubkey == leaf_delegate.key() && leaf_delegate.is_signer {
//             acct.is_signer = true;
//         }
//         if acct.pubkey == leaf_owner.key() && leaf_owner.is_signer {
//             acct.is_signer = true;
//         }
//
//         //for cpi to work
//         if acct.pubkey == list_state.key() {
//             acct.is_signer = true;
//         }
//     }
//     for node in proof_accounts {
//         transfer_account_metas.push(AccountMeta::new_readonly(*node.key, false));
//     }
//
//     let mut transfer_cpi_account_infos = transfer_accounts.to_account_infos();
//     transfer_cpi_account_infos.extend_from_slice(proof_accounts);
//
//     let asset_id = get_asset_id(&ctx.accounts.merkle_tree.key(), nonce);
//
//     let (pk, seed) =
//         Pubkey::find_program_address(&[b"list_state".as_ref(), asset_id.as_ref()], ctx.program_id);
//     require!(pk == *list_state.key, TcompError::ArithmeticError);
//
//     invoke_signed(
//         &Instruction {
//             program_id: bubblegum_program.key(),
//             accounts: transfer_account_metas,
//             data,
//         },
//         &(transfer_cpi_account_infos[..]),
//         &[&[b"list_state".as_ref(), asset_id.as_ref(), &[seed]]],
//     )?;
//
//     Ok(())
// }
