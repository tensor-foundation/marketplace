//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct BuyCore {
    pub fee_vault: solana_program::pubkey::Pubkey,

    pub list_state: solana_program::pubkey::Pubkey,

    pub asset: solana_program::pubkey::Pubkey,

    pub collection: Option<solana_program::pubkey::Pubkey>,

    pub buyer: solana_program::pubkey::Pubkey,

    pub payer: (solana_program::pubkey::Pubkey, bool),

    pub owner: solana_program::pubkey::Pubkey,

    pub taker_broker: Option<solana_program::pubkey::Pubkey>,

    pub maker_broker: Option<solana_program::pubkey::Pubkey>,

    pub rent_destination: solana_program::pubkey::Pubkey,

    pub mpl_core_program: solana_program::pubkey::Pubkey,

    pub marketplace_program: solana_program::pubkey::Pubkey,

    pub system_program: solana_program::pubkey::Pubkey,

    pub cosigner: Option<(solana_program::pubkey::Pubkey, bool)>,
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
        let mut accounts = Vec::with_capacity(14 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.fee_vault,
            false,
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
            self.payer.0,
            self.payer.1,
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
            self.rent_destination,
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
        if let Some((cosigner, signer)) = self.cosigner {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                cosigner, signer,
            ));
        } else {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                crate::TENSOR_MARKETPLACE_ID,
                false,
            ));
        }
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
pub struct BuyCoreInstructionData {
    discriminator: [u8; 8],
}

impl BuyCoreInstructionData {
    pub fn new() -> Self {
        Self {
            discriminator: [169, 227, 87, 255, 76, 86, 255, 25],
        }
    }
}

impl Default for BuyCoreInstructionData {
    fn default() -> Self {
        Self::new()
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
///   0. `[writable]` fee_vault
///   1. `[writable]` list_state
///   2. `[writable]` asset
///   3. `[optional]` collection
///   4. `[]` buyer
///   5. `[writable, signer]` payer
///   6. `[writable]` owner
///   7. `[writable, optional]` taker_broker
///   8. `[writable, optional]` maker_broker
///   9. `[writable]` rent_destination
///   10. `[optional]` mpl_core_program (default to `CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d`)
///   11. `[optional]` marketplace_program (default to `TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp`)
///   12. `[optional]` system_program (default to `11111111111111111111111111111111`)
///   13. `[signer, optional]` cosigner (default to `TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp`)
#[derive(Clone, Debug, Default)]
pub struct BuyCoreBuilder {
    fee_vault: Option<solana_program::pubkey::Pubkey>,
    list_state: Option<solana_program::pubkey::Pubkey>,
    asset: Option<solana_program::pubkey::Pubkey>,
    collection: Option<solana_program::pubkey::Pubkey>,
    buyer: Option<solana_program::pubkey::Pubkey>,
    payer: Option<(solana_program::pubkey::Pubkey, bool)>,
    owner: Option<solana_program::pubkey::Pubkey>,
    taker_broker: Option<solana_program::pubkey::Pubkey>,
    maker_broker: Option<solana_program::pubkey::Pubkey>,
    rent_destination: Option<solana_program::pubkey::Pubkey>,
    mpl_core_program: Option<solana_program::pubkey::Pubkey>,
    marketplace_program: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    cosigner: Option<(solana_program::pubkey::Pubkey, bool)>,
    max_amount: Option<u64>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl BuyCoreBuilder {
    pub fn new() -> Self {
        Self::default()
    }
    #[inline(always)]
    pub fn fee_vault(&mut self, fee_vault: solana_program::pubkey::Pubkey) -> &mut Self {
        self.fee_vault = Some(fee_vault);
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
    pub fn payer(&mut self, payer: solana_program::pubkey::Pubkey, as_signer: bool) -> &mut Self {
        self.payer = Some((payer, as_signer));
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
    pub fn rent_destination(
        &mut self,
        rent_destination: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.rent_destination = Some(rent_destination);
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
    /// `[optional account]`
    #[inline(always)]
    pub fn cosigner(
        &mut self,
        cosigner: Option<solana_program::pubkey::Pubkey>,
        as_signer: bool,
    ) -> &mut Self {
        if let Some(cosigner) = cosigner {
            self.cosigner = Some((cosigner, as_signer));
        } else {
            self.cosigner = None;
        }
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
            fee_vault: self.fee_vault.expect("fee_vault is not set"),
            list_state: self.list_state.expect("list_state is not set"),
            asset: self.asset.expect("asset is not set"),
            collection: self.collection,
            buyer: self.buyer.expect("buyer is not set"),
            payer: self.payer.expect("payer is not set"),
            owner: self.owner.expect("owner is not set"),
            taker_broker: self.taker_broker,
            maker_broker: self.maker_broker,
            rent_destination: self.rent_destination.expect("rent_destination is not set"),
            mpl_core_program: self.mpl_core_program.unwrap_or(solana_program::pubkey!(
                "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d"
            )),
            marketplace_program: self.marketplace_program.unwrap_or(solana_program::pubkey!(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp"
            )),
            system_program: self
                .system_program
                .unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
            cosigner: self.cosigner,
        };
        let args = BuyCoreInstructionArgs {
            max_amount: self.max_amount.clone().expect("max_amount is not set"),
        };

        accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
    }
}

/// `buy_core` CPI accounts.
pub struct BuyCoreCpiAccounts<'a, 'b> {
    pub fee_vault: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub asset: &'b solana_program::account_info::AccountInfo<'a>,

    pub collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub buyer: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: (&'b solana_program::account_info::AccountInfo<'a>, bool),

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub rent_destination: &'b solana_program::account_info::AccountInfo<'a>,

    pub mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub cosigner: Option<(&'b solana_program::account_info::AccountInfo<'a>, bool)>,
}

/// `buy_core` CPI instruction.
pub struct BuyCoreCpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,

    pub fee_vault: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub asset: &'b solana_program::account_info::AccountInfo<'a>,

    pub collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub buyer: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: (&'b solana_program::account_info::AccountInfo<'a>, bool),

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub rent_destination: &'b solana_program::account_info::AccountInfo<'a>,

    pub mpl_core_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub cosigner: Option<(&'b solana_program::account_info::AccountInfo<'a>, bool)>,
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
            fee_vault: accounts.fee_vault,
            list_state: accounts.list_state,
            asset: accounts.asset,
            collection: accounts.collection,
            buyer: accounts.buyer,
            payer: accounts.payer,
            owner: accounts.owner,
            taker_broker: accounts.taker_broker,
            maker_broker: accounts.maker_broker,
            rent_destination: accounts.rent_destination,
            mpl_core_program: accounts.mpl_core_program,
            marketplace_program: accounts.marketplace_program,
            system_program: accounts.system_program,
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
        let mut accounts = Vec::with_capacity(14 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.fee_vault.key,
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
            *self.payer.0.key,
            self.payer.1,
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
            *self.rent_destination.key,
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
        if let Some((cosigner, signer)) = self.cosigner {
            accounts.push(solana_program::instruction::AccountMeta::new_readonly(
                *cosigner.key,
                signer,
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
        let mut data = BuyCoreInstructionData::new().try_to_vec().unwrap();
        let mut args = self.__args.try_to_vec().unwrap();
        data.append(&mut args);

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(14 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.fee_vault.clone());
        account_infos.push(self.list_state.clone());
        account_infos.push(self.asset.clone());
        if let Some(collection) = self.collection {
            account_infos.push(collection.clone());
        }
        account_infos.push(self.buyer.clone());
        account_infos.push(self.payer.0.clone());
        account_infos.push(self.owner.clone());
        if let Some(taker_broker) = self.taker_broker {
            account_infos.push(taker_broker.clone());
        }
        if let Some(maker_broker) = self.maker_broker {
            account_infos.push(maker_broker.clone());
        }
        account_infos.push(self.rent_destination.clone());
        account_infos.push(self.mpl_core_program.clone());
        account_infos.push(self.marketplace_program.clone());
        account_infos.push(self.system_program.clone());
        if let Some(cosigner) = self.cosigner {
            account_infos.push(cosigner.0.clone());
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

/// Instruction builder for `BuyCore` via CPI.
///
/// ### Accounts:
///
///   0. `[writable]` fee_vault
///   1. `[writable]` list_state
///   2. `[writable]` asset
///   3. `[optional]` collection
///   4. `[]` buyer
///   5. `[writable, signer]` payer
///   6. `[writable]` owner
///   7. `[writable, optional]` taker_broker
///   8. `[writable, optional]` maker_broker
///   9. `[writable]` rent_destination
///   10. `[]` mpl_core_program
///   11. `[]` marketplace_program
///   12. `[]` system_program
///   13. `[signer, optional]` cosigner
#[derive(Clone, Debug)]
pub struct BuyCoreCpiBuilder<'a, 'b> {
    instruction: Box<BuyCoreCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> BuyCoreCpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(BuyCoreCpiBuilderInstruction {
            __program: program,
            fee_vault: None,
            list_state: None,
            asset: None,
            collection: None,
            buyer: None,
            payer: None,
            owner: None,
            taker_broker: None,
            maker_broker: None,
            rent_destination: None,
            mpl_core_program: None,
            marketplace_program: None,
            system_program: None,
            cosigner: None,
            max_amount: None,
            __remaining_accounts: Vec::new(),
        });
        Self { instruction }
    }
    #[inline(always)]
    pub fn fee_vault(
        &mut self,
        fee_vault: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.fee_vault = Some(fee_vault);
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
    pub fn payer(
        &mut self,
        payer: &'b solana_program::account_info::AccountInfo<'a>,
        as_signer: bool,
    ) -> &mut Self {
        self.instruction.payer = Some((payer, as_signer));
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
    pub fn rent_destination(
        &mut self,
        rent_destination: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.rent_destination = Some(rent_destination);
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
    /// `[optional account]`
    #[inline(always)]
    pub fn cosigner(
        &mut self,
        cosigner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
        as_signer: bool,
    ) -> &mut Self {
        if let Some(cosigner) = cosigner {
            self.instruction.cosigner = Some((cosigner, as_signer));
        } else {
            self.instruction.cosigner = None;
        }
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

            fee_vault: self.instruction.fee_vault.expect("fee_vault is not set"),

            list_state: self.instruction.list_state.expect("list_state is not set"),

            asset: self.instruction.asset.expect("asset is not set"),

            collection: self.instruction.collection,

            buyer: self.instruction.buyer.expect("buyer is not set"),

            payer: self.instruction.payer.expect("payer is not set"),

            owner: self.instruction.owner.expect("owner is not set"),

            taker_broker: self.instruction.taker_broker,

            maker_broker: self.instruction.maker_broker,

            rent_destination: self
                .instruction
                .rent_destination
                .expect("rent_destination is not set"),

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
struct BuyCoreCpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    fee_vault: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    list_state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    asset: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    collection: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    buyer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    payer: Option<(&'b solana_program::account_info::AccountInfo<'a>, bool)>,
    owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    rent_destination: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mpl_core_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    marketplace_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    cosigner: Option<(&'b solana_program::account_info::AccountInfo<'a>, bool)>,
    max_amount: Option<u64>,
    /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
    __remaining_accounts: Vec<(
        &'b solana_program::account_info::AccountInfo<'a>,
        bool,
        bool,
    )>,
}
