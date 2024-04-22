//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! [https://github.com/metaplex-foundation/kinobi]
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct BuyCore {
    pub tcomp: solana_program::pubkey::Pubkey,

    pub list_state: solana_program::pubkey::Pubkey,

    pub asset: solana_program::pubkey::Pubkey,

    pub collection: Option<solana_program::pubkey::Pubkey>,

    pub buyer: solana_program::pubkey::Pubkey,

    pub payer: solana_program::pubkey::Pubkey,

    pub owner: solana_program::pubkey::Pubkey,

    pub taker_broker: Option<solana_program::pubkey::Pubkey>,

    pub maker_broker: Option<solana_program::pubkey::Pubkey>,

    pub rent_dest: solana_program::pubkey::Pubkey,

    pub mpl_core_program: solana_program::pubkey::Pubkey,

    pub marketplace_program: solana_program::pubkey::Pubkey,

    pub system_program: solana_program::pubkey::Pubkey,
}

impl BuyCore {
    pub fn instruction(
        &self,
        args: BuyCoreInstructionArgs,
    ) -> solana_program::instruction::Instruction {
        self.instruction_with_remaining_accounts(args, &[])
    }
    #[allow(clippy::vec_init_then_push)]
    pub fn instruction_with_remaining_accounts(
        &self,
        args: BuyCoreInstructionArgs,
        remaining_accounts: &[solana_program::instruction::AccountMeta],
    ) -> solana_program::instruction::Instruction {
        let mut accounts = Vec::with_capacity(13 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.tcomp, false,
        ));
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
            self.buyer, false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.payer, true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.owner, false,
        ));
        if let Some(taker_broker) = self.taker_broker {
            accounts.push(solana_program::instruction::AccountMeta::new(
                taker_broker,
                false,
            ));
        } else {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                crate::TENSOR_MARKETPLACE_ID,
                false,
            ));
        }
        if let Some(maker_broker) = self.maker_broker {
            accounts.push(solana_program::instruction::AccountMeta::new(
                maker_broker,
                false,
            ));
        } else {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                crate::TENSOR_MARKETPLACE_ID,
                false,
            ));
        }
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.rent_dest,
            false,
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
        accounts.extend_from_slice(remaining_accounts);
        let mut data = BuyCoreInstructionData::new().try_to_vec().unwrap();
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
struct BuyCoreInstructionData {
    discriminator: [u8; 8],
}

impl BuyCoreInstructionData {
    fn new() -> Self {
        Self {
            discriminator: [169, 227, 87, 255, 76, 86, 255, 25],
        }
    }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct BuyCoreInstructionArgs {
    pub max_amount: u64,
}

/// Instruction builder for `BuyCore`.
///
/// ### Accounts:
///
///   0. `[writable]` tcomp
///   1. `[writable]` list_state
///   2. `[writable]` asset
///   3. `[optional]` collection
///   4. `[]` buyer
///   5. `[writable, signer]` payer
///   6. `[writable]` owner
///   7. `[writable, optional]` taker_broker
///   8. `[writable, optional]` maker_broker
///   9. `[writable]` rent_dest
///   10. `[optional]` mpl_core_program (default to `CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d`)
///   11. `[optional]` marketplace_program (default to `TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp`)
///   12. `[optional]` system_program (default to `11111111111111111111111111111111`)
#[derive(Default)]
pub struct BuyCoreBuilder {
    tcomp: Option<solana_program::pubkey::Pubkey>,
    list_state: Option<solana_program::pubkey::Pubkey>,
    asset: Option<solana_program::pubkey::Pubkey>,
    collection: Option<solana_program::pubkey::Pubkey>,
    buyer: Option<solana_program::pubkey::Pubkey>,
    payer: Option<solana_program::pubkey::Pubkey>,
    owner: Option<solana_program::pubkey::Pubkey>,
    taker_broker: Option<solana_program::pubkey::Pubkey>,
    maker_broker: Option<solana_program::pubkey::Pubkey>,
    rent_dest: Option<solana_program::pubkey::Pubkey>,
    mpl_core_program: Option<solana_program::pubkey::Pubkey>,
    marketplace_program: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    max_amount: Option<u64>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl BuyCoreBuilder {
    pub fn new() -> Self {
        Self::default()
    }
    #[inline(always)]
    pub fn tcomp(&mut self, tcomp: solana_program::pubkey::Pubkey) -> &mut Self {
        self.tcomp = Some(tcomp);
        self
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
    pub fn buyer(&mut self, buyer: solana_program::pubkey::Pubkey) -> &mut Self {
        self.buyer = Some(buyer);
        self
    }
    #[inline(always)]
    pub fn payer(&mut self, payer: solana_program::pubkey::Pubkey) -> &mut Self {
        self.payer = Some(payer);
        self
    }
    #[inline(always)]
    pub fn owner(&mut self, owner: solana_program::pubkey::Pubkey) -> &mut Self {
        self.owner = Some(owner);
        self
    }
    /// `[optional account]`
    #[inline(always)]
    pub fn taker_broker(
        &mut self,
        taker_broker: Option<solana_program::pubkey::Pubkey>,
    ) -> &mut Self {
        self.taker_broker = taker_broker;
        self
    }
    /// `[optional account]`
    #[inline(always)]
    pub fn maker_broker(
        &mut self,
        maker_broker: Option<solana_program::pubkey::Pubkey>,
    ) -> &mut Self {
        self.maker_broker = maker_broker;
        self
    }
    #[inline(always)]
    pub fn rent_dest(&mut self, rent_dest: solana_program::pubkey::Pubkey) -> &mut Self {
        self.rent_dest = Some(rent_dest);
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
    pub fn max_amount(&mut self, max_amount: u64) -> &mut Self {
        self.max_amount = Some(max_amount);
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
        let accounts = BuyCore {
            tcomp: self.tcomp.expect("tcomp is not set"),
            list_state: self.list_state.expect("list_state is not set"),
            asset: self.asset.expect("asset is not set"),
            collection: self.collection,
            buyer: self.buyer.expect("buyer is not set"),
            payer: self.payer.expect("payer is not set"),
            owner: self.owner.expect("owner is not set"),
            taker_broker: self.taker_broker,
            maker_broker: self.maker_broker,
            rent_dest: self.rent_dest.expect("rent_dest is not set"),
            mpl_core_program: self.mpl_core_program.unwrap_or(solana_program::pubkey!(
                "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
            )),
            marketplace_program: self.marketplace_program.unwrap_or(solana_program::pubkey!(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp"
            )),
            system_program: self
                .system_program
                .unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
        };
        let args = BuyCoreInstructionArgs {
            max_amount: self.max_amount.clone().expect("max_amount is not set"),
        };

        accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
    }
}

/// `buy_core` CPI accounts.
pub struct BuyCoreCpiAccounts<'a, 'b> {
    pub tcomp: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub asset: &'b solana_program::account_info::AccountInfo<'a>,

    pub collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub buyer: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub rent_dest: &'b solana_program::account_info::AccountInfo<'a>,

    pub mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
}

/// `buy_core` CPI instruction.
pub struct BuyCoreCpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,

    pub tcomp: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub asset: &'b solana_program::account_info::AccountInfo<'a>,

    pub collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub buyer: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub rent_dest: &'b solana_program::account_info::AccountInfo<'a>,

    pub mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
    /// The arguments for the instruction.
    pub __args: BuyCoreInstructionArgs,
}

impl<'a, 'b> BuyCoreCpi<'a, 'b> {
    pub fn new(
        program: &'b solana_program::account_info::AccountInfo<'a>,
        accounts: BuyCoreCpiAccounts<'a, 'b>,
        args: BuyCoreInstructionArgs,
    ) -> Self {
        Self {
            __program: program,
            tcomp: accounts.tcomp,
            list_state: accounts.list_state,
            asset: accounts.asset,
            collection: accounts.collection,
            buyer: accounts.buyer,
            payer: accounts.payer,
            owner: accounts.owner,
            taker_broker: accounts.taker_broker,
            maker_broker: accounts.maker_broker,
            rent_dest: accounts.rent_dest,
            mpl_core_program: accounts.mpl_core_program,
            marketplace_program: accounts.marketplace_program,
            system_program: accounts.system_program,
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
        let mut accounts = Vec::with_capacity(13 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.tcomp.key,
            false,
        ));
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
            *self.buyer.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.payer.key,
            true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.owner.key,
            false,
        ));
        if let Some(taker_broker) = self.taker_broker {
            accounts.push(solana_program::instruction::AccountMeta::new(
                *taker_broker.key,
                false,
            ));
        } else {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                crate::TENSOR_MARKETPLACE_ID,
                false,
            ));
        }
        if let Some(maker_broker) = self.maker_broker {
            accounts.push(solana_program::instruction::AccountMeta::new(
                *maker_broker.key,
                false,
            ));
        } else {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                crate::TENSOR_MARKETPLACE_ID,
                false,
            ));
        }
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.rent_dest.key,
            false,
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
        remaining_accounts.iter().for_each(|remaining_account| {
            accounts.push(solana_program::instruction::AccountMeta {
                pubkey: *remaining_account.0.key,
                is_signer: remaining_account.1,
                is_writable: remaining_account.2,
            })
        });
        let mut data = BuyCoreInstructionData::new().try_to_vec().unwrap();
        let mut args = self.__args.try_to_vec().unwrap();
        data.append(&mut args);

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(13 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.tcomp.clone());
        account_infos.push(self.list_state.clone());
        account_infos.push(self.asset.clone());
        if let Some(collection) = self.collection {
            account_infos.push(collection.clone());
        }
        account_infos.push(self.buyer.clone());
        account_infos.push(self.payer.clone());
        account_infos.push(self.owner.clone());
        if let Some(taker_broker) = self.taker_broker {
            account_infos.push(taker_broker.clone());
        }
        if let Some(maker_broker) = self.maker_broker {
            account_infos.push(maker_broker.clone());
        }
        account_infos.push(self.rent_dest.clone());
        account_infos.push(self.mpl_core_program.clone());
        account_infos.push(self.marketplace_program.clone());
        account_infos.push(self.system_program.clone());
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

/// Instruction builder for `BuyCore` via CPI.
///
/// ### Accounts:
///
///   0. `[writable]` tcomp
///   1. `[writable]` list_state
///   2. `[writable]` asset
///   3. `[optional]` collection
///   4. `[]` buyer
///   5. `[writable, signer]` payer
///   6. `[writable]` owner
///   7. `[writable, optional]` taker_broker
///   8. `[writable, optional]` maker_broker
///   9. `[writable]` rent_dest
///   10. `[]` mpl_core_program
///   11. `[]` marketplace_program
///   12. `[]` system_program
pub struct BuyCoreCpiBuilder<'a, 'b> {
    instruction: Box<BuyCoreCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> BuyCoreCpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(BuyCoreCpiBuilderInstruction {
            __program: program,
            tcomp: None,
            list_state: None,
            asset: None,
            collection: None,
            buyer: None,
            payer: None,
            owner: None,
            taker_broker: None,
            maker_broker: None,
            rent_dest: None,
            mpl_core_program: None,
            marketplace_program: None,
            system_program: None,
            max_amount: None,
            __remaining_accounts: Vec::new(),
        });
        Self { instruction }
    }
    #[inline(always)]
    pub fn tcomp(&mut self, tcomp: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.tcomp = Some(tcomp);
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
    pub fn buyer(&mut self, buyer: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.buyer = Some(buyer);
        self
    }
    #[inline(always)]
    pub fn payer(&mut self, payer: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.payer = Some(payer);
        self
    }
    #[inline(always)]
    pub fn owner(&mut self, owner: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.owner = Some(owner);
        self
    }
    /// `[optional account]`
    #[inline(always)]
    pub fn taker_broker(
        &mut self,
        taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    ) -> &mut Self {
        self.instruction.taker_broker = taker_broker;
        self
    }
    /// `[optional account]`
    #[inline(always)]
    pub fn maker_broker(
        &mut self,
        maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    ) -> &mut Self {
        self.instruction.maker_broker = maker_broker;
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
    pub fn max_amount(&mut self, max_amount: u64) -> &mut Self {
        self.instruction.max_amount = Some(max_amount);
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
        let args = BuyCoreInstructionArgs {
            max_amount: self
                .instruction
                .max_amount
                .clone()
                .expect("max_amount is not set"),
        };
        let instruction = BuyCoreCpi {
            __program: self.instruction.__program,

            tcomp: self.instruction.tcomp.expect("tcomp is not set"),

            list_state: self.instruction.list_state.expect("list_state is not set"),

            asset: self.instruction.asset.expect("asset is not set"),

            collection: self.instruction.collection,

            buyer: self.instruction.buyer.expect("buyer is not set"),

            payer: self.instruction.payer.expect("payer is not set"),

            owner: self.instruction.owner.expect("owner is not set"),

            taker_broker: self.instruction.taker_broker,

            maker_broker: self.instruction.maker_broker,

            rent_dest: self.instruction.rent_dest.expect("rent_dest is not set"),

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
            __args: args,
        };
        instruction.invoke_signed_with_remaining_accounts(
            signers_seeds,
            &self.instruction.__remaining_accounts,
        )
    }
}

struct BuyCoreCpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    tcomp: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    list_state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    asset: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    buyer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    payer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    rent_dest: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mpl_core_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    marketplace_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    max_amount: Option<u64>,
    /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
    __remaining_accounts: Vec<(
        &'b solana_program::account_info::AccountInfo<'a>,
        bool,
        bool,
    )>,
}
