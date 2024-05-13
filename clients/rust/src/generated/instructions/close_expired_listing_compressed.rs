//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! [https://github.com/metaplex-foundation/kinobi]
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct CloseExpiredListingCompressed {
    pub list_state: solana_program::pubkey::Pubkey,

    pub owner: solana_program::pubkey::Pubkey,

    pub system_program: solana_program::pubkey::Pubkey,

    pub marketplace_program: solana_program::pubkey::Pubkey,

    pub tree_authority: solana_program::pubkey::Pubkey,

    pub merkle_tree: solana_program::pubkey::Pubkey,

    pub log_wrapper: solana_program::pubkey::Pubkey,

    pub compression_program: solana_program::pubkey::Pubkey,

    pub bubblegum_program: solana_program::pubkey::Pubkey,

    pub rent_dest: solana_program::pubkey::Pubkey,
}

impl CloseExpiredListingCompressed {
    pub fn instruction(
        &self,
        args: CloseExpiredListingCompressedInstructionArgs,
    ) -> solana_program::instruction::Instruction {
        self.instruction_with_remaining_accounts(args, &[])
    }
    #[allow(clippy::vec_init_then_push)]
    pub fn instruction_with_remaining_accounts(
        &self,
        args: CloseExpiredListingCompressedInstructionArgs,
        remaining_accounts: &[solana_program::instruction::AccountMeta],
    ) -> solana_program::instruction::Instruction {
        let mut accounts = Vec::with_capacity(10 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.list_state,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.owner, false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.system_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.marketplace_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.tree_authority,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.merkle_tree,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.log_wrapper,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.compression_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.bubblegum_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.rent_dest,
            false,
        ));
        accounts.extend_from_slice(remaining_accounts);
        let mut data = CloseExpiredListingCompressedInstructionData::new()
            .try_to_vec()
            .unwrap();
        let mut args = args.try_to_vec().unwrap();
        data.append(&mut args);

        solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CloseExpiredListingCompressedInstructionData {
    discriminator: [u8; 8],
}

impl CloseExpiredListingCompressedInstructionData {
    pub fn new() -> Self {
        Self {
            discriminator: [150, 70, 13, 135, 9, 204, 75, 4],
        }
    }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct CloseExpiredListingCompressedInstructionArgs {
    pub nonce: u64,
    pub index: u32,
    pub root: [u8; 32],
    pub data_hash: [u8; 32],
    pub creator_hash: [u8; 32],
}

/// Instruction builder for `CloseExpiredListingCompressed`.
///
/// ### Accounts:
///
///   0. `[writable]` list_state
///   1. `[]` owner
///   2. `[optional]` system_program (default to `11111111111111111111111111111111`)
///   3. `[optional]` marketplace_program (default to `TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp`)
///   4. `[]` tree_authority
///   5. `[writable]` merkle_tree
///   6. `[optional]` log_wrapper (default to `noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV`)
///   7. `[optional]` compression_program (default to `cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK`)
///   8. `[optional]` bubblegum_program (default to `BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY`)
///   9. `[writable]` rent_dest
#[derive(Default)]
pub struct CloseExpiredListingCompressedBuilder {
    list_state: Option<solana_program::pubkey::Pubkey>,
    owner: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    marketplace_program: Option<solana_program::pubkey::Pubkey>,
    tree_authority: Option<solana_program::pubkey::Pubkey>,
    merkle_tree: Option<solana_program::pubkey::Pubkey>,
    log_wrapper: Option<solana_program::pubkey::Pubkey>,
    compression_program: Option<solana_program::pubkey::Pubkey>,
    bubblegum_program: Option<solana_program::pubkey::Pubkey>,
    rent_dest: Option<solana_program::pubkey::Pubkey>,
    nonce: Option<u64>,
    index: Option<u32>,
    root: Option<[u8; 32]>,
    data_hash: Option<[u8; 32]>,
    creator_hash: Option<[u8; 32]>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl CloseExpiredListingCompressedBuilder {
    pub fn new() -> Self {
        Self::default()
    }
    #[inline(always)]
    pub fn list_state(&mut self, list_state: solana_program::pubkey::Pubkey) -> &mut Self {
        self.list_state = Some(list_state);
        self
    }
    #[inline(always)]
    pub fn owner(&mut self, owner: solana_program::pubkey::Pubkey) -> &mut Self {
        self.owner = Some(owner);
        self
    }
    /// `[optional account, default to '11111111111111111111111111111111']`
    #[inline(always)]
    pub fn system_program(&mut self, system_program: solana_program::pubkey::Pubkey) -> &mut Self {
        self.system_program = Some(system_program);
        self
    }
    /// `[optional account, default to 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp']`
    #[inline(always)]
    pub fn marketplace_program(
        &mut self,
        marketplace_program: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.marketplace_program = Some(marketplace_program);
        self
    }
    #[inline(always)]
    pub fn tree_authority(&mut self, tree_authority: solana_program::pubkey::Pubkey) -> &mut Self {
        self.tree_authority = Some(tree_authority);
        self
    }
    #[inline(always)]
    pub fn merkle_tree(&mut self, merkle_tree: solana_program::pubkey::Pubkey) -> &mut Self {
        self.merkle_tree = Some(merkle_tree);
        self
    }
    /// `[optional account, default to 'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV']`
    #[inline(always)]
    pub fn log_wrapper(&mut self, log_wrapper: solana_program::pubkey::Pubkey) -> &mut Self {
        self.log_wrapper = Some(log_wrapper);
        self
    }
    /// `[optional account, default to 'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK']`
    #[inline(always)]
    pub fn compression_program(
        &mut self,
        compression_program: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.compression_program = Some(compression_program);
        self
    }
    /// `[optional account, default to 'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY']`
    #[inline(always)]
    pub fn bubblegum_program(
        &mut self,
        bubblegum_program: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.bubblegum_program = Some(bubblegum_program);
        self
    }
    #[inline(always)]
    pub fn rent_dest(&mut self, rent_dest: solana_program::pubkey::Pubkey) -> &mut Self {
        self.rent_dest = Some(rent_dest);
        self
    }
    #[inline(always)]
    pub fn nonce(&mut self, nonce: u64) -> &mut Self {
        self.nonce = Some(nonce);
        self
    }
    #[inline(always)]
    pub fn index(&mut self, index: u32) -> &mut Self {
        self.index = Some(index);
        self
    }
    #[inline(always)]
    pub fn root(&mut self, root: [u8; 32]) -> &mut Self {
        self.root = Some(root);
        self
    }
    #[inline(always)]
    pub fn data_hash(&mut self, data_hash: [u8; 32]) -> &mut Self {
        self.data_hash = Some(data_hash);
        self
    }
    #[inline(always)]
    pub fn creator_hash(&mut self, creator_hash: [u8; 32]) -> &mut Self {
        self.creator_hash = Some(creator_hash);
        self
    }
    /// Add an aditional account to the instruction.
    #[inline(always)]
    pub fn add_remaining_account(
        &mut self,
        account: solana_program::instruction::AccountMeta,
    ) -> &mut Self {
        self.__remaining_accounts.push(account);
        self
    }
    /// Add additional accounts to the instruction.
    #[inline(always)]
    pub fn add_remaining_accounts(
        &mut self,
        accounts: &[solana_program::instruction::AccountMeta],
    ) -> &mut Self {
        self.__remaining_accounts.extend_from_slice(accounts);
        self
    }
    #[allow(clippy::clone_on_copy)]
    pub fn instruction(&self) -> solana_program::instruction::Instruction {
        let accounts = CloseExpiredListingCompressed {
            list_state: self.list_state.expect("list_state is not set"),
            owner: self.owner.expect("owner is not set"),
            system_program: self
                .system_program
                .unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
            marketplace_program: self.marketplace_program.unwrap_or(solana_program::pubkey!(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp"
            )),
            tree_authority: self.tree_authority.expect("tree_authority is not set"),
            merkle_tree: self.merkle_tree.expect("merkle_tree is not set"),
            log_wrapper: self.log_wrapper.unwrap_or(solana_program::pubkey!(
                "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV"
            )),
            compression_program: self.compression_program.unwrap_or(solana_program::pubkey!(
                "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK"
            )),
            bubblegum_program: self.bubblegum_program.unwrap_or(solana_program::pubkey!(
                "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY"
            )),
            rent_dest: self.rent_dest.expect("rent_dest is not set"),
        };
        let args = CloseExpiredListingCompressedInstructionArgs {
            nonce: self.nonce.clone().expect("nonce is not set"),
            index: self.index.clone().expect("index is not set"),
            root: self.root.clone().expect("root is not set"),
            data_hash: self.data_hash.clone().expect("data_hash is not set"),
            creator_hash: self.creator_hash.clone().expect("creator_hash is not set"),
        };

        accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
    }
}

/// `close_expired_listing_compressed` CPI accounts.
pub struct CloseExpiredListingCompressedCpiAccounts<'a, 'b> {
    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub tree_authority: &'b solana_program::account_info::AccountInfo<'a>,

    pub merkle_tree: &'b solana_program::account_info::AccountInfo<'a>,

    pub log_wrapper: &'b solana_program::account_info::AccountInfo<'a>,

    pub compression_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub bubblegum_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_dest: &'b solana_program::account_info::AccountInfo<'a>,
}

/// `close_expired_listing_compressed` CPI instruction.
pub struct CloseExpiredListingCompressedCpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub tree_authority: &'b solana_program::account_info::AccountInfo<'a>,

    pub merkle_tree: &'b solana_program::account_info::AccountInfo<'a>,

    pub log_wrapper: &'b solana_program::account_info::AccountInfo<'a>,

    pub compression_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub bubblegum_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_dest: &'b solana_program::account_info::AccountInfo<'a>,
    /// The arguments for the instruction.
    pub __args: CloseExpiredListingCompressedInstructionArgs,
}

impl<'a, 'b> CloseExpiredListingCompressedCpi<'a, 'b> {
    pub fn new(
        program: &'b solana_program::account_info::AccountInfo<'a>,
        accounts: CloseExpiredListingCompressedCpiAccounts<'a, 'b>,
        args: CloseExpiredListingCompressedInstructionArgs,
    ) -> Self {
        Self {
            __program: program,
            list_state: accounts.list_state,
            owner: accounts.owner,
            system_program: accounts.system_program,
            marketplace_program: accounts.marketplace_program,
            tree_authority: accounts.tree_authority,
            merkle_tree: accounts.merkle_tree,
            log_wrapper: accounts.log_wrapper,
            compression_program: accounts.compression_program,
            bubblegum_program: accounts.bubblegum_program,
            rent_dest: accounts.rent_dest,
            __args: args,
        }
    }
    #[inline(always)]
    pub fn invoke(&self) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed_with_remaining_accounts(&[], &[])
    }
    #[inline(always)]
    pub fn invoke_with_remaining_accounts(
        &self,
        remaining_accounts: &[(
            &'b solana_program::account_info::AccountInfo<'a>,
            bool,
            bool,
        )],
    ) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed_with_remaining_accounts(&[], remaining_accounts)
    }
    #[inline(always)]
    pub fn invoke_signed(
        &self,
        signers_seeds: &[&[&[u8]]],
    ) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed_with_remaining_accounts(signers_seeds, &[])
    }
    #[allow(clippy::clone_on_copy)]
    #[allow(clippy::vec_init_then_push)]
    pub fn invoke_signed_with_remaining_accounts(
        &self,
        signers_seeds: &[&[&[u8]]],
        remaining_accounts: &[(
            &'b solana_program::account_info::AccountInfo<'a>,
            bool,
            bool,
        )],
    ) -> solana_program::entrypoint::ProgramResult {
        let mut accounts = Vec::with_capacity(10 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.list_state.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.owner.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.system_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.marketplace_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.tree_authority.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.merkle_tree.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.log_wrapper.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.compression_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.bubblegum_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.rent_dest.key,
            false,
        ));
        remaining_accounts.iter().for_each(|remaining_account| {
            accounts.push(solana_program::instruction::AccountMeta {
                pubkey: *remaining_account.0.key,
                is_signer: remaining_account.1,
                is_writable: remaining_account.2,
            })
        });
        let mut data = CloseExpiredListingCompressedInstructionData::new()
            .try_to_vec()
            .unwrap();
        let mut args = self.__args.try_to_vec().unwrap();
        data.append(&mut args);

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(10 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.list_state.clone());
        account_infos.push(self.owner.clone());
        account_infos.push(self.system_program.clone());
        account_infos.push(self.marketplace_program.clone());
        account_infos.push(self.tree_authority.clone());
        account_infos.push(self.merkle_tree.clone());
        account_infos.push(self.log_wrapper.clone());
        account_infos.push(self.compression_program.clone());
        account_infos.push(self.bubblegum_program.clone());
        account_infos.push(self.rent_dest.clone());
        remaining_accounts
            .iter()
            .for_each(|remaining_account| account_infos.push(remaining_account.0.clone()));

        if signers_seeds.is_empty() {
            solana_program::program::invoke(&instruction, &account_infos)
        } else {
            solana_program::program::invoke_signed(&instruction, &account_infos, signers_seeds)
        }
    }
}

/// Instruction builder for `CloseExpiredListingCompressed` via CPI.
///
/// ### Accounts:
///
///   0. `[writable]` list_state
///   1. `[]` owner
///   2. `[]` system_program
///   3. `[]` marketplace_program
///   4. `[]` tree_authority
///   5. `[writable]` merkle_tree
///   6. `[]` log_wrapper
///   7. `[]` compression_program
///   8. `[]` bubblegum_program
///   9. `[writable]` rent_dest
pub struct CloseExpiredListingCompressedCpiBuilder<'a, 'b> {
    instruction: Box<CloseExpiredListingCompressedCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> CloseExpiredListingCompressedCpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(CloseExpiredListingCompressedCpiBuilderInstruction {
            __program: program,
            list_state: None,
            owner: None,
            system_program: None,
            marketplace_program: None,
            tree_authority: None,
            merkle_tree: None,
            log_wrapper: None,
            compression_program: None,
            bubblegum_program: None,
            rent_dest: None,
            nonce: None,
            index: None,
            root: None,
            data_hash: None,
            creator_hash: None,
            __remaining_accounts: Vec::new(),
        });
        Self { instruction }
    }
    #[inline(always)]
    pub fn list_state(
        &mut self,
        list_state: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.list_state = Some(list_state);
        self
    }
    #[inline(always)]
    pub fn owner(&mut self, owner: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.owner = Some(owner);
        self
    }
    #[inline(always)]
    pub fn system_program(
        &mut self,
        system_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.system_program = Some(system_program);
        self
    }
    #[inline(always)]
    pub fn marketplace_program(
        &mut self,
        marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.marketplace_program = Some(marketplace_program);
        self
    }
    #[inline(always)]
    pub fn tree_authority(
        &mut self,
        tree_authority: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.tree_authority = Some(tree_authority);
        self
    }
    #[inline(always)]
    pub fn merkle_tree(
        &mut self,
        merkle_tree: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.merkle_tree = Some(merkle_tree);
        self
    }
    #[inline(always)]
    pub fn log_wrapper(
        &mut self,
        log_wrapper: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.log_wrapper = Some(log_wrapper);
        self
    }
    #[inline(always)]
    pub fn compression_program(
        &mut self,
        compression_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.compression_program = Some(compression_program);
        self
    }
    #[inline(always)]
    pub fn bubblegum_program(
        &mut self,
        bubblegum_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.bubblegum_program = Some(bubblegum_program);
        self
    }
    #[inline(always)]
    pub fn rent_dest(
        &mut self,
        rent_dest: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.rent_dest = Some(rent_dest);
        self
    }
    #[inline(always)]
    pub fn nonce(&mut self, nonce: u64) -> &mut Self {
        self.instruction.nonce = Some(nonce);
        self
    }
    #[inline(always)]
    pub fn index(&mut self, index: u32) -> &mut Self {
        self.instruction.index = Some(index);
        self
    }
    #[inline(always)]
    pub fn root(&mut self, root: [u8; 32]) -> &mut Self {
        self.instruction.root = Some(root);
        self
    }
    #[inline(always)]
    pub fn data_hash(&mut self, data_hash: [u8; 32]) -> &mut Self {
        self.instruction.data_hash = Some(data_hash);
        self
    }
    #[inline(always)]
    pub fn creator_hash(&mut self, creator_hash: [u8; 32]) -> &mut Self {
        self.instruction.creator_hash = Some(creator_hash);
        self
    }
    /// Add an additional account to the instruction.
    #[inline(always)]
    pub fn add_remaining_account(
        &mut self,
        account: &'b solana_program::account_info::AccountInfo<'a>,
        is_writable: bool,
        is_signer: bool,
    ) -> &mut Self {
        self.instruction
            .__remaining_accounts
            .push((account, is_writable, is_signer));
        self
    }
    /// Add additional accounts to the instruction.
    ///
    /// Each account is represented by a tuple of the `AccountInfo`, a `bool` indicating whether the account is writable or not,
    /// and a `bool` indicating whether the account is a signer or not.
    #[inline(always)]
    pub fn add_remaining_accounts(
        &mut self,
        accounts: &[(
            &'b solana_program::account_info::AccountInfo<'a>,
            bool,
            bool,
        )],
    ) -> &mut Self {
        self.instruction
            .__remaining_accounts
            .extend_from_slice(accounts);
        self
    }
    #[inline(always)]
    pub fn invoke(&self) -> solana_program::entrypoint::ProgramResult {
        self.invoke_signed(&[])
    }
    #[allow(clippy::clone_on_copy)]
    #[allow(clippy::vec_init_then_push)]
    pub fn invoke_signed(
        &self,
        signers_seeds: &[&[&[u8]]],
    ) -> solana_program::entrypoint::ProgramResult {
        let args = CloseExpiredListingCompressedInstructionArgs {
            nonce: self.instruction.nonce.clone().expect("nonce is not set"),
            index: self.instruction.index.clone().expect("index is not set"),
            root: self.instruction.root.clone().expect("root is not set"),
            data_hash: self
                .instruction
                .data_hash
                .clone()
                .expect("data_hash is not set"),
            creator_hash: self
                .instruction
                .creator_hash
                .clone()
                .expect("creator_hash is not set"),
        };
        let instruction = CloseExpiredListingCompressedCpi {
            __program: self.instruction.__program,

            list_state: self.instruction.list_state.expect("list_state is not set"),

            owner: self.instruction.owner.expect("owner is not set"),

            system_program: self
                .instruction
                .system_program
                .expect("system_program is not set"),

            marketplace_program: self
                .instruction
                .marketplace_program
                .expect("marketplace_program is not set"),

            tree_authority: self
                .instruction
                .tree_authority
                .expect("tree_authority is not set"),

            merkle_tree: self
                .instruction
                .merkle_tree
                .expect("merkle_tree is not set"),

            log_wrapper: self
                .instruction
                .log_wrapper
                .expect("log_wrapper is not set"),

            compression_program: self
                .instruction
                .compression_program
                .expect("compression_program is not set"),

            bubblegum_program: self
                .instruction
                .bubblegum_program
                .expect("bubblegum_program is not set"),

            rent_dest: self.instruction.rent_dest.expect("rent_dest is not set"),
            __args: args,
        };
        instruction.invoke_signed_with_remaining_accounts(
            signers_seeds,
            &self.instruction.__remaining_accounts,
        )
    }
}

struct CloseExpiredListingCompressedCpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    list_state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    marketplace_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    tree_authority: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    merkle_tree: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    log_wrapper: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    compression_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    bubblegum_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    rent_dest: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    nonce: Option<u64>,
    index: Option<u32>,
    root: Option<[u8; 32]>,
    data_hash: Option<[u8; 32]>,
    creator_hash: Option<[u8; 32]>,
    /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
    __remaining_accounts: Vec<(
        &'b solana_program::account_info::AccountInfo<'a>,
        bool,
        bool,
    )>,
}
