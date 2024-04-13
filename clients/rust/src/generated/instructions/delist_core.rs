//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! [https://github.com/metaplex-foundation/kinobi]
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct DelistCore {
    pub asset: solana_program::pubkey::Pubkey,

    pub collection: Option<solana_program::pubkey::Pubkey>,

    pub owner: solana_program::pubkey::Pubkey,

    pub list_state: solana_program::pubkey::Pubkey,

    pub mpl_core_program: solana_program::pubkey::Pubkey,

    pub tcomp_program: solana_program::pubkey::Pubkey,

    pub system_program: solana_program::pubkey::Pubkey,

    pub rent_dest: solana_program::pubkey::Pubkey,
}

impl DelistCore {
    pub fn instruction(&self) -> solana_program::instruction::Instruction {
        self.instruction_with_remaining_accounts(&[])
    }
    #[allow(clippy::vec_init_then_push)]
    pub fn instruction_with_remaining_accounts(
        &self,
        remaining_accounts: &[solana_program::instruction::AccountMeta],
    ) -> solana_program::instruction::Instruction {
        let mut accounts = Vec::with_capacity(8 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.asset, false,
        ));
        if let Some(collection) = self.collection {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                collection, false,
            ));
        } else {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                crate::TENSOR_MARKETPLACE_ID,
                false,
            ));
        }
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.owner, true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.list_state,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.mpl_core_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.tcomp_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.system_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.rent_dest,
            true,
        ));
        accounts.extend_from_slice(remaining_accounts);
        let data = DelistCoreInstructionData::new().try_to_vec().unwrap();

        solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
struct DelistCoreInstructionData {
    discriminator: [u8; 8],
}

impl DelistCoreInstructionData {
    fn new() -> Self {
        Self {
            discriminator: [56, 24, 231, 2, 227, 19, 14, 68],
        }
    }
}

/// Instruction builder for `DelistCore`.
///
/// ### Accounts:
///
///   0. `[writable]` asset
///   1. `[optional]` collection
///   2. `[writable, signer]` owner
///   3. `[writable]` list_state
///   4. `[]` mpl_core_program
///   5. `[]` tcomp_program
///   6. `[optional]` system_program (default to `11111111111111111111111111111111`)
///   7. `[writable, signer, optional]` rent_dest (default to `SysvarRent111111111111111111111111111111111`)
#[derive(Default)]
pub struct DelistCoreBuilder {
    asset: Option<solana_program::pubkey::Pubkey>,
    collection: Option<solana_program::pubkey::Pubkey>,
    owner: Option<solana_program::pubkey::Pubkey>,
    list_state: Option<solana_program::pubkey::Pubkey>,
    mpl_core_program: Option<solana_program::pubkey::Pubkey>,
    tcomp_program: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    rent_dest: Option<solana_program::pubkey::Pubkey>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl DelistCoreBuilder {
    pub fn new() -> Self {
        Self::default()
    }
    #[inline(always)]
    pub fn asset(&mut self, asset: solana_program::pubkey::Pubkey) -> &mut Self {
        self.asset = Some(asset);
        self
    }
    /// `[optional account]`
    #[inline(always)]
    pub fn collection(&mut self, collection: Option<solana_program::pubkey::Pubkey>) -> &mut Self {
        self.collection = collection;
        self
    }
    #[inline(always)]
    pub fn owner(&mut self, owner: solana_program::pubkey::Pubkey) -> &mut Self {
        self.owner = Some(owner);
        self
    }
    #[inline(always)]
    pub fn list_state(&mut self, list_state: solana_program::pubkey::Pubkey) -> &mut Self {
        self.list_state = Some(list_state);
        self
    }
    #[inline(always)]
    pub fn mpl_core_program(
        &mut self,
        mpl_core_program: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.mpl_core_program = Some(mpl_core_program);
        self
    }
    #[inline(always)]
    pub fn tcomp_program(&mut self, tcomp_program: solana_program::pubkey::Pubkey) -> &mut Self {
        self.tcomp_program = Some(tcomp_program);
        self
    }
    /// `[optional account, default to '11111111111111111111111111111111']`
    #[inline(always)]
    pub fn system_program(&mut self, system_program: solana_program::pubkey::Pubkey) -> &mut Self {
        self.system_program = Some(system_program);
        self
    }
    /// `[optional account, default to 'SysvarRent111111111111111111111111111111111']`
    #[inline(always)]
    pub fn rent_dest(&mut self, rent_dest: solana_program::pubkey::Pubkey) -> &mut Self {
        self.rent_dest = Some(rent_dest);
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
        let accounts = DelistCore {
            asset: self.asset.expect("asset is not set"),
            collection: self.collection,
            owner: self.owner.expect("owner is not set"),
            list_state: self.list_state.expect("list_state is not set"),
            mpl_core_program: self.mpl_core_program.expect("mpl_core_program is not set"),
            tcomp_program: self.tcomp_program.expect("tcomp_program is not set"),
            system_program: self
                .system_program
                .unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
            rent_dest: self.rent_dest.unwrap_or(solana_program::pubkey!(
                "SysvarRent111111111111111111111111111111111"
            )),
        };

        accounts.instruction_with_remaining_accounts(&self.__remaining_accounts)
    }
}

/// `delist_core` CPI accounts.
pub struct DelistCoreCpiAccounts<'a, 'b> {
    pub asset: &'b solana_program::account_info::AccountInfo<'a>,

    pub collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub tcomp_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_dest: &'b solana_program::account_info::AccountInfo<'a>,
}

/// `delist_core` CPI instruction.
pub struct DelistCoreCpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,

    pub asset: &'b solana_program::account_info::AccountInfo<'a>,

    pub collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub tcomp_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_dest: &'b solana_program::account_info::AccountInfo<'a>,
}

impl<'a, 'b> DelistCoreCpi<'a, 'b> {
    pub fn new(
        program: &'b solana_program::account_info::AccountInfo<'a>,
        accounts: DelistCoreCpiAccounts<'a, 'b>,
    ) -> Self {
        Self {
            __program: program,
            asset: accounts.asset,
            collection: accounts.collection,
            owner: accounts.owner,
            list_state: accounts.list_state,
            mpl_core_program: accounts.mpl_core_program,
            tcomp_program: accounts.tcomp_program,
            system_program: accounts.system_program,
            rent_dest: accounts.rent_dest,
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
        let mut accounts = Vec::with_capacity(8 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.asset.key,
            false,
        ));
        if let Some(collection) = self.collection {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                *collection.key,
                false,
            ));
        } else {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                crate::TENSOR_MARKETPLACE_ID,
                false,
            ));
        }
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.owner.key,
            true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.list_state.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.mpl_core_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.tcomp_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.system_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.rent_dest.key,
            true,
        ));
        remaining_accounts.iter().for_each(|remaining_account| {
            accounts.push(solana_program::instruction::AccountMeta {
                pubkey: *remaining_account.0.key,
                is_signer: remaining_account.1,
                is_writable: remaining_account.2,
            })
        });
        let data = DelistCoreInstructionData::new().try_to_vec().unwrap();

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(8 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.asset.clone());
        if let Some(collection) = self.collection {
            account_infos.push(collection.clone());
        }
        account_infos.push(self.owner.clone());
        account_infos.push(self.list_state.clone());
        account_infos.push(self.mpl_core_program.clone());
        account_infos.push(self.tcomp_program.clone());
        account_infos.push(self.system_program.clone());
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

/// Instruction builder for `DelistCore` via CPI.
///
/// ### Accounts:
///
///   0. `[writable]` asset
///   1. `[optional]` collection
///   2. `[writable, signer]` owner
///   3. `[writable]` list_state
///   4. `[]` mpl_core_program
///   5. `[]` tcomp_program
///   6. `[]` system_program
///   7. `[writable, signer]` rent_dest
pub struct DelistCoreCpiBuilder<'a, 'b> {
    instruction: Box<DelistCoreCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> DelistCoreCpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(DelistCoreCpiBuilderInstruction {
            __program: program,
            asset: None,
            collection: None,
            owner: None,
            list_state: None,
            mpl_core_program: None,
            tcomp_program: None,
            system_program: None,
            rent_dest: None,
            __remaining_accounts: Vec::new(),
        });
        Self { instruction }
    }
    #[inline(always)]
    pub fn asset(&mut self, asset: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.asset = Some(asset);
        self
    }
    /// `[optional account]`
    #[inline(always)]
    pub fn collection(
        &mut self,
        collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    ) -> &mut Self {
        self.instruction.collection = collection;
        self
    }
    #[inline(always)]
    pub fn owner(&mut self, owner: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.owner = Some(owner);
        self
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
    pub fn mpl_core_program(
        &mut self,
        mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.mpl_core_program = Some(mpl_core_program);
        self
    }
    #[inline(always)]
    pub fn tcomp_program(
        &mut self,
        tcomp_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.tcomp_program = Some(tcomp_program);
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
    pub fn rent_dest(
        &mut self,
        rent_dest: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.rent_dest = Some(rent_dest);
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
        let instruction = DelistCoreCpi {
            __program: self.instruction.__program,

            asset: self.instruction.asset.expect("asset is not set"),

            collection: self.instruction.collection,

            owner: self.instruction.owner.expect("owner is not set"),

            list_state: self.instruction.list_state.expect("list_state is not set"),

            mpl_core_program: self
                .instruction
                .mpl_core_program
                .expect("mpl_core_program is not set"),

            tcomp_program: self
                .instruction
                .tcomp_program
                .expect("tcomp_program is not set"),

            system_program: self
                .instruction
                .system_program
                .expect("system_program is not set"),

            rent_dest: self.instruction.rent_dest.expect("rent_dest is not set"),
        };
        instruction.invoke_signed_with_remaining_accounts(
            signers_seeds,
            &self.instruction.__remaining_accounts,
        )
    }
}

struct DelistCoreCpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    asset: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    list_state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mpl_core_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    tcomp_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    rent_dest: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
    __remaining_accounts: Vec<(
        &'b solana_program::account_info::AccountInfo<'a>,
        bool,
        bool,
    )>,
}