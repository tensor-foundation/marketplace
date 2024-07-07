//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct CloseExpiredListingCore {
    pub list_state: solana_program::pubkey::Pubkey,

    pub asset: solana_program::pubkey::Pubkey,

    pub collection: Option<solana_program::pubkey::Pubkey>,

    pub owner: solana_program::pubkey::Pubkey,

    pub mpl_core_program: solana_program::pubkey::Pubkey,

    pub system_program: solana_program::pubkey::Pubkey,

    pub marketplace_program: solana_program::pubkey::Pubkey,

    pub rent_destination: solana_program::pubkey::Pubkey,
}

impl CloseExpiredListingCore {
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
            self.list_state,
            false,
        ));
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
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.owner, false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.mpl_core_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.system_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.marketplace_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.rent_destination,
            false,
        ));
        accounts.extend_from_slice(remaining_accounts);
        let data = CloseExpiredListingCoreInstructionData::new()
            .try_to_vec()
            .unwrap();

        solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct CloseExpiredListingCoreInstructionData {
    discriminator: [u8; 8],
}

impl CloseExpiredListingCoreInstructionData {
    pub fn new() -> Self {
        Self {
            discriminator: [89, 171, 78, 80, 74, 188, 63, 58],
        }
    }
}

impl Default for CloseExpiredListingCoreInstructionData {
    fn default() -> Self {
        Self::new()
    }
}

/// Instruction builder for `CloseExpiredListingCore`.
///
/// ### Accounts:
///
///   0. `[writable]` list_state
///   1. `[writable]` asset
///   2. `[optional]` collection
///   3. `[]` owner
///   4. `[optional]` mpl_core_program (default to `CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d`)
///   5. `[optional]` system_program (default to `11111111111111111111111111111111`)
///   6. `[optional]` marketplace_program (default to `TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp`)
///   7. `[writable]` rent_destination
#[derive(Clone, Debug, Default)]
pub struct CloseExpiredListingCoreBuilder {
    list_state: Option<solana_program::pubkey::Pubkey>,
    asset: Option<solana_program::pubkey::Pubkey>,
    collection: Option<solana_program::pubkey::Pubkey>,
    owner: Option<solana_program::pubkey::Pubkey>,
    mpl_core_program: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    marketplace_program: Option<solana_program::pubkey::Pubkey>,
    rent_destination: Option<solana_program::pubkey::Pubkey>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl CloseExpiredListingCoreBuilder {
    pub fn new() -> Self {
        Self::default()
    }
    #[inline(always)]
    pub fn list_state(&mut self, list_state: solana_program::pubkey::Pubkey) -> &mut Self {
        self.list_state = Some(list_state);
        self
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
    /// `[optional account, default to 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d']`
    #[inline(always)]
    pub fn mpl_core_program(
        &mut self,
        mpl_core_program: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.mpl_core_program = Some(mpl_core_program);
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
    pub fn rent_destination(
        &mut self,
        rent_destination: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.rent_destination = Some(rent_destination);
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
        let accounts = CloseExpiredListingCore {
            list_state: self.list_state.expect("list_state is not set"),
            asset: self.asset.expect("asset is not set"),
            collection: self.collection,
            owner: self.owner.expect("owner is not set"),
            mpl_core_program: self.mpl_core_program.unwrap_or(solana_program::pubkey!(
                "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
            )),
            system_program: self
                .system_program
                .unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
            marketplace_program: self.marketplace_program.unwrap_or(solana_program::pubkey!(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp"
            )),
            rent_destination: self.rent_destination.expect("rent_destination is not set"),
        };

        accounts.instruction_with_remaining_accounts(&self.__remaining_accounts)
    }
}

/// `close_expired_listing_core` CPI accounts.
pub struct CloseExpiredListingCoreCpiAccounts<'a, 'b> {
    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub asset: &'b solana_program::account_info::AccountInfo<'a>,

    pub collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_destination: &'b solana_program::account_info::AccountInfo<'a>,
}

/// `close_expired_listing_core` CPI instruction.
pub struct CloseExpiredListingCoreCpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub asset: &'b solana_program::account_info::AccountInfo<'a>,

    pub collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_destination: &'b solana_program::account_info::AccountInfo<'a>,
}

impl<'a, 'b> CloseExpiredListingCoreCpi<'a, 'b> {
    pub fn new(
        program: &'b solana_program::account_info::AccountInfo<'a>,
        accounts: CloseExpiredListingCoreCpiAccounts<'a, 'b>,
    ) -> Self {
        Self {
            __program: program,
            list_state: accounts.list_state,
            asset: accounts.asset,
            collection: accounts.collection,
            owner: accounts.owner,
            mpl_core_program: accounts.mpl_core_program,
            system_program: accounts.system_program,
            marketplace_program: accounts.marketplace_program,
            rent_destination: accounts.rent_destination,
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
            *self.list_state.key,
            false,
        ));
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
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.owner.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.mpl_core_program.key,
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
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.rent_destination.key,
            false,
        ));
        remaining_accounts.iter().for_each(|remaining_account| {
            accounts.push(solana_program::instruction::AccountMeta {
                pubkey: *remaining_account.0.key,
                is_signer: remaining_account.1,
                is_writable: remaining_account.2,
            })
        });
        let data = CloseExpiredListingCoreInstructionData::new()
            .try_to_vec()
            .unwrap();

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(8 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.list_state.clone());
        account_infos.push(self.asset.clone());
        if let Some(collection) = self.collection {
            account_infos.push(collection.clone());
        }
        account_infos.push(self.owner.clone());
        account_infos.push(self.mpl_core_program.clone());
        account_infos.push(self.system_program.clone());
        account_infos.push(self.marketplace_program.clone());
        account_infos.push(self.rent_destination.clone());
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

/// Instruction builder for `CloseExpiredListingCore` via CPI.
///
/// ### Accounts:
///
///   0. `[writable]` list_state
///   1. `[writable]` asset
///   2. `[optional]` collection
///   3. `[]` owner
///   4. `[]` mpl_core_program
///   5. `[]` system_program
///   6. `[]` marketplace_program
///   7. `[writable]` rent_destination
#[derive(Clone, Debug)]
pub struct CloseExpiredListingCoreCpiBuilder<'a, 'b> {
    instruction: Box<CloseExpiredListingCoreCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> CloseExpiredListingCoreCpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(CloseExpiredListingCoreCpiBuilderInstruction {
            __program: program,
            list_state: None,
            asset: None,
            collection: None,
            owner: None,
            mpl_core_program: None,
            system_program: None,
            marketplace_program: None,
            rent_destination: None,
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
    pub fn mpl_core_program(
        &mut self,
        mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.mpl_core_program = Some(mpl_core_program);
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
    pub fn rent_destination(
        &mut self,
        rent_destination: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.rent_destination = Some(rent_destination);
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
        let instruction = CloseExpiredListingCoreCpi {
            __program: self.instruction.__program,

            list_state: self.instruction.list_state.expect("list_state is not set"),

            asset: self.instruction.asset.expect("asset is not set"),

            collection: self.instruction.collection,

            owner: self.instruction.owner.expect("owner is not set"),

            mpl_core_program: self
                .instruction
                .mpl_core_program
                .expect("mpl_core_program is not set"),

            system_program: self
                .instruction
                .system_program
                .expect("system_program is not set"),

            marketplace_program: self
                .instruction
                .marketplace_program
                .expect("marketplace_program is not set"),

            rent_destination: self
                .instruction
                .rent_destination
                .expect("rent_destination is not set"),
        };
        instruction.invoke_signed_with_remaining_accounts(
            signers_seeds,
            &self.instruction.__remaining_accounts,
        )
    }
}

#[derive(Clone, Debug)]
struct CloseExpiredListingCoreCpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    list_state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    asset: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mpl_core_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    marketplace_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    rent_destination: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
    __remaining_accounts: Vec<(
        &'b solana_program::account_info::AccountInfo<'a>,
        bool,
        bool,
    )>,
}
