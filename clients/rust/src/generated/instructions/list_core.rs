//! This code was AUTOGENERATED using the codama library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun codama to update it.
//!
//! <https://github.com/codama-idl/codama>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use solana_program::pubkey::Pubkey;

/// Accounts.
pub struct ListCore {
    pub asset: solana_program::pubkey::Pubkey,

    pub collection: Option<solana_program::pubkey::Pubkey>,

    pub list_state: solana_program::pubkey::Pubkey,

    pub owner: solana_program::pubkey::Pubkey,

    pub mpl_core_program: solana_program::pubkey::Pubkey,

    pub marketplace_program: solana_program::pubkey::Pubkey,

    pub system_program: solana_program::pubkey::Pubkey,

    pub payer: solana_program::pubkey::Pubkey,

    pub cosigner: Option<solana_program::pubkey::Pubkey>,
}

impl ListCore {
    pub fn instruction(
        &self,
        args: ListCoreInstructionArgs,
    ) -> solana_program::instruction::Instruction {
        self.instruction_with_remaining_accounts(args, &[])
    }
    #[allow(clippy::vec_init_then_push)]
    pub fn instruction_with_remaining_accounts(
        &self,
        args: ListCoreInstructionArgs,
        remaining_accounts: &[solana_program::instruction::AccountMeta],
    ) -> solana_program::instruction::Instruction {
        let mut accounts = Vec::with_capacity(9 + remaining_accounts.len());
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
            self.list_state,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.owner, true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.mpl_core_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.marketplace_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.system_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.payer, true,
        ));
        if let Some(cosigner) = self.cosigner {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                cosigner, true,
            ));
        } else {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                crate::TENSOR_MARKETPLACE_ID,
                false,
            ));
        }
        accounts.extend_from_slice(remaining_accounts);
        let mut data = ListCoreInstructionData::new().try_to_vec().unwrap();
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
pub struct ListCoreInstructionData {
    discriminator: [u8; 8],
}

impl ListCoreInstructionData {
    pub fn new() -> Self {
        Self {
            discriminator: [173, 76, 167, 125, 118, 71, 1, 153],
        }
    }
}

impl Default for ListCoreInstructionData {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct ListCoreInstructionArgs {
    pub amount: u64,
    pub expire_in_sec: Option<u64>,
    pub currency: Option<Pubkey>,
    pub private_taker: Option<Pubkey>,
    pub maker_broker: Option<Pubkey>,
}

/// Instruction builder for `ListCore`.
///
/// ### Accounts:
///
///   0. `[writable]` asset
///   1. `[optional]` collection
///   2. `[writable]` list_state
///   3. `[signer]` owner
///   4. `[optional]` mpl_core_program (default to `CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d`)
///   5. `[optional]` marketplace_program (default to `TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp`)
///   6. `[optional]` system_program (default to `11111111111111111111111111111111`)
///   7. `[writable, signer]` payer
///   8. `[signer, optional]` cosigner
#[derive(Clone, Debug, Default)]
pub struct ListCoreBuilder {
    asset: Option<solana_program::pubkey::Pubkey>,
    collection: Option<solana_program::pubkey::Pubkey>,
    list_state: Option<solana_program::pubkey::Pubkey>,
    owner: Option<solana_program::pubkey::Pubkey>,
    mpl_core_program: Option<solana_program::pubkey::Pubkey>,
    marketplace_program: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    payer: Option<solana_program::pubkey::Pubkey>,
    cosigner: Option<solana_program::pubkey::Pubkey>,
    amount: Option<u64>,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl ListCoreBuilder {
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
    pub fn list_state(&mut self, list_state: solana_program::pubkey::Pubkey) -> &mut Self {
        self.list_state = Some(list_state);
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
    /// `[optional account, default to 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp']`
    #[inline(always)]
    pub fn marketplace_program(
        &mut self,
        marketplace_program: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.marketplace_program = Some(marketplace_program);
        self
    }
    /// `[optional account, default to '11111111111111111111111111111111']`
    #[inline(always)]
    pub fn system_program(&mut self, system_program: solana_program::pubkey::Pubkey) -> &mut Self {
        self.system_program = Some(system_program);
        self
    }
    #[inline(always)]
    pub fn payer(&mut self, payer: solana_program::pubkey::Pubkey) -> &mut Self {
        self.payer = Some(payer);
        self
    }
    /// `[optional account]`
    #[inline(always)]
    pub fn cosigner(&mut self, cosigner: Option<solana_program::pubkey::Pubkey>) -> &mut Self {
        self.cosigner = cosigner;
        self
    }
    #[inline(always)]
    pub fn amount(&mut self, amount: u64) -> &mut Self {
        self.amount = Some(amount);
        self
    }
    /// `[optional argument]`
    #[inline(always)]
    pub fn expire_in_sec(&mut self, expire_in_sec: u64) -> &mut Self {
        self.expire_in_sec = Some(expire_in_sec);
        self
    }
    /// `[optional argument]`
    #[inline(always)]
    pub fn currency(&mut self, currency: Pubkey) -> &mut Self {
        self.currency = Some(currency);
        self
    }
    /// `[optional argument]`
    #[inline(always)]
    pub fn private_taker(&mut self, private_taker: Pubkey) -> &mut Self {
        self.private_taker = Some(private_taker);
        self
    }
    /// `[optional argument]`
    #[inline(always)]
    pub fn maker_broker(&mut self, maker_broker: Pubkey) -> &mut Self {
        self.maker_broker = Some(maker_broker);
        self
    }
    /// Add an additional account to the instruction.
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
        let accounts = ListCore {
            asset: self.asset.expect("asset is not set"),
            collection: self.collection,
            list_state: self.list_state.expect("list_state is not set"),
            owner: self.owner.expect("owner is not set"),
            mpl_core_program: self.mpl_core_program.unwrap_or(solana_program::pubkey!(
                "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
            )),
            marketplace_program: self.marketplace_program.unwrap_or(solana_program::pubkey!(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp"
            )),
            system_program: self
                .system_program
                .unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
            payer: self.payer.expect("payer is not set"),
            cosigner: self.cosigner,
        };
        let args = ListCoreInstructionArgs {
            amount: self.amount.clone().expect("amount is not set"),
            expire_in_sec: self.expire_in_sec.clone(),
            currency: self.currency.clone(),
            private_taker: self.private_taker.clone(),
            maker_broker: self.maker_broker.clone(),
        };

        accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
    }
}

/// `list_core` CPI accounts.
pub struct ListCoreCpiAccounts<'a, 'b> {
    pub asset: &'b solana_program::account_info::AccountInfo<'a>,

    pub collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: &'b solana_program::account_info::AccountInfo<'a>,

    pub cosigner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
}

/// `list_core` CPI instruction.
pub struct ListCoreCpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,

    pub asset: &'b solana_program::account_info::AccountInfo<'a>,

    pub collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: &'b solana_program::account_info::AccountInfo<'a>,

    pub cosigner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    /// The arguments for the instruction.
    pub __args: ListCoreInstructionArgs,
}

impl<'a, 'b> ListCoreCpi<'a, 'b> {
    pub fn new(
        program: &'b solana_program::account_info::AccountInfo<'a>,
        accounts: ListCoreCpiAccounts<'a, 'b>,
        args: ListCoreInstructionArgs,
    ) -> Self {
        Self {
            __program: program,
            asset: accounts.asset,
            collection: accounts.collection,
            list_state: accounts.list_state,
            owner: accounts.owner,
            mpl_core_program: accounts.mpl_core_program,
            marketplace_program: accounts.marketplace_program,
            system_program: accounts.system_program,
            payer: accounts.payer,
            cosigner: accounts.cosigner,
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
        let mut accounts = Vec::with_capacity(9 + remaining_accounts.len());
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
            *self.list_state.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.owner.key,
            true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.mpl_core_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.marketplace_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.system_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.payer.key,
            true,
        ));
        if let Some(cosigner) = self.cosigner {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                *cosigner.key,
                true,
            ));
        } else {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                crate::TENSOR_MARKETPLACE_ID,
                false,
            ));
        }
        remaining_accounts.iter().for_each(|remaining_account| {
            accounts.push(solana_program::instruction::AccountMeta {
                pubkey: *remaining_account.0.key,
                is_signer: remaining_account.1,
                is_writable: remaining_account.2,
            })
        });
        let mut data = ListCoreInstructionData::new().try_to_vec().unwrap();
        let mut args = self.__args.try_to_vec().unwrap();
        data.append(&mut args);

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(9 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.asset.clone());
        if let Some(collection) = self.collection {
            account_infos.push(collection.clone());
        }
        account_infos.push(self.list_state.clone());
        account_infos.push(self.owner.clone());
        account_infos.push(self.mpl_core_program.clone());
        account_infos.push(self.marketplace_program.clone());
        account_infos.push(self.system_program.clone());
        account_infos.push(self.payer.clone());
        if let Some(cosigner) = self.cosigner {
            account_infos.push(cosigner.clone());
        }
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

/// Instruction builder for `ListCore` via CPI.
///
/// ### Accounts:
///
///   0. `[writable]` asset
///   1. `[optional]` collection
///   2. `[writable]` list_state
///   3. `[signer]` owner
///   4. `[]` mpl_core_program
///   5. `[]` marketplace_program
///   6. `[]` system_program
///   7. `[writable, signer]` payer
///   8. `[signer, optional]` cosigner
#[derive(Clone, Debug)]
pub struct ListCoreCpiBuilder<'a, 'b> {
    instruction: Box<ListCoreCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> ListCoreCpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(ListCoreCpiBuilderInstruction {
            __program: program,
            asset: None,
            collection: None,
            list_state: None,
            owner: None,
            mpl_core_program: None,
            marketplace_program: None,
            system_program: None,
            payer: None,
            cosigner: None,
            amount: None,
            expire_in_sec: None,
            currency: None,
            private_taker: None,
            maker_broker: None,
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
    pub fn mpl_core_program(
        &mut self,
        mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.mpl_core_program = Some(mpl_core_program);
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
    pub fn system_program(
        &mut self,
        system_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.system_program = Some(system_program);
        self
    }
    #[inline(always)]
    pub fn payer(&mut self, payer: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.payer = Some(payer);
        self
    }
    /// `[optional account]`
    #[inline(always)]
    pub fn cosigner(
        &mut self,
        cosigner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    ) -> &mut Self {
        self.instruction.cosigner = cosigner;
        self
    }
    #[inline(always)]
    pub fn amount(&mut self, amount: u64) -> &mut Self {
        self.instruction.amount = Some(amount);
        self
    }
    /// `[optional argument]`
    #[inline(always)]
    pub fn expire_in_sec(&mut self, expire_in_sec: u64) -> &mut Self {
        self.instruction.expire_in_sec = Some(expire_in_sec);
        self
    }
    /// `[optional argument]`
    #[inline(always)]
    pub fn currency(&mut self, currency: Pubkey) -> &mut Self {
        self.instruction.currency = Some(currency);
        self
    }
    /// `[optional argument]`
    #[inline(always)]
    pub fn private_taker(&mut self, private_taker: Pubkey) -> &mut Self {
        self.instruction.private_taker = Some(private_taker);
        self
    }
    /// `[optional argument]`
    #[inline(always)]
    pub fn maker_broker(&mut self, maker_broker: Pubkey) -> &mut Self {
        self.instruction.maker_broker = Some(maker_broker);
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
        let args = ListCoreInstructionArgs {
            amount: self.instruction.amount.clone().expect("amount is not set"),
            expire_in_sec: self.instruction.expire_in_sec.clone(),
            currency: self.instruction.currency.clone(),
            private_taker: self.instruction.private_taker.clone(),
            maker_broker: self.instruction.maker_broker.clone(),
        };
        let instruction = ListCoreCpi {
            __program: self.instruction.__program,

            asset: self.instruction.asset.expect("asset is not set"),

            collection: self.instruction.collection,

            list_state: self.instruction.list_state.expect("list_state is not set"),

            owner: self.instruction.owner.expect("owner is not set"),

            mpl_core_program: self
                .instruction
                .mpl_core_program
                .expect("mpl_core_program is not set"),

            marketplace_program: self
                .instruction
                .marketplace_program
                .expect("marketplace_program is not set"),

            system_program: self
                .instruction
                .system_program
                .expect("system_program is not set"),

            payer: self.instruction.payer.expect("payer is not set"),

            cosigner: self.instruction.cosigner,
            __args: args,
        };
        instruction.invoke_signed_with_remaining_accounts(
            signers_seeds,
            &self.instruction.__remaining_accounts,
        )
    }
}

#[derive(Clone, Debug)]
struct ListCoreCpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    asset: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    list_state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mpl_core_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    marketplace_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    payer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    cosigner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    amount: Option<u64>,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
    /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
    __remaining_accounts: Vec<(
        &'b solana_program::account_info::AccountInfo<'a>,
        bool,
        bool,
    )>,
}
