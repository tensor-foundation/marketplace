use anchor_lang::prelude::*;
use mpl_bubblegum::{self, program::Bubblegum};
use spl_account_compression::{
    program::SplAccountCompression, wrap_application_data_v1, Node, Noop,
};

declare_id!("CS7Db7Me9YB9UqUfCF9VhcdNPNxGGQgUqpFsvx9mhuqL");

#[program]
pub mod tcomp {
    use anchor_lang::solana_program::{
        instruction::Instruction,
        program::{invoke, invoke_signed},
    };

    use super::*;

    pub fn execute_buy<'info>(
        ctx: Context<'_, '_, '_, 'info, ExecuteBuy<'info>>,
        root: [u8; 32],
        data_hash: [u8; 32],
        creator_hash: [u8; 32],
        nonce: u64,
        index: u32,
    ) -> Result<()> {
        msg!("is signer: {}", ctx.accounts.leaf_owner.is_signer);

        // todo role of delegate?
        // mpl_bubblegum::cpi::transfer(
        //     CpiContext::new(
        //         ctx.accounts.bubblegum.to_account_info(),
        //         mpl_bubblegum::cpi::accounts::Transfer {
        //             tree_authority: ctx.accounts.tree_authority.to_account_info(),
        //             leaf_owner: ctx.accounts.leaf_owner.to_account_info(),
        //             leaf_delegate: ctx.accounts.leaf_delegate.to_account_info(),
        //             new_leaf_owner: ctx.accounts.new_leaf_owner.to_account_info(),
        //             merkle_tree: ctx.accounts.merkle_tree.to_account_info(),
        //             log_wrapper: ctx.accounts.log_wrapper.to_account_info(),
        //             compression_program: ctx.accounts.compression_program.to_account_info(),
        //             system_program: ctx.accounts.system_program.to_account_info(),
        //         },
        //     )
        //     .with_remaining_accounts(ctx.remaining_accounts.to_vec()),
        //     root,
        //     data_hash,
        //     creator_hash,
        //     nonce,
        //     index,
        // )?;

        let transfer_instruction_data = mpl_bubblegum::instruction::Transfer {
            root,
            data_hash,
            creator_hash,
            nonce,
            index,
        };

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
        let proof_accounts = ctx.remaining_accounts;
        for node in proof_accounts.iter() {
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
}
