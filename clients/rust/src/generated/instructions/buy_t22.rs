//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! [https://github.com/metaplex-foundation/kinobi]
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct BuyT22 {
    pub fee_vault: solana_program::pubkey::Pubkey,

    pub buyer: solana_program::pubkey::Pubkey,

    pub buyer_ata: solana_program::pubkey::Pubkey,

    pub list_state: solana_program::pubkey::Pubkey,

    pub list_ata: solana_program::pubkey::Pubkey,

    pub mint: solana_program::pubkey::Pubkey,

    pub owner: solana_program::pubkey::Pubkey,

    pub payer: solana_program::pubkey::Pubkey,

    pub taker_broker: Option<solana_program::pubkey::Pubkey>,

    pub maker_broker: Option<solana_program::pubkey::Pubkey>,

    pub rent_destination: solana_program::pubkey::Pubkey,

    pub token_program: solana_program::pubkey::Pubkey,

    pub associated_token_program: solana_program::pubkey::Pubkey,

    pub marketplace_program: solana_program::pubkey::Pubkey,

    pub system_program: solana_program::pubkey::Pubkey,
}

impl BuyT22 {
    pub fn instruction(
        &self,
        args: BuyT22InstructionArgs,
    ) -> solana_program::instruction::Instruction {
        self.instruction_with_remaining_accounts(args, &[])
    }
    #[allow(clippy::vec_init_then_push)]
    pub fn instruction_with_remaining_accounts(
        &self,
        args: BuyT22InstructionArgs,
        remaining_accounts: &[solana_program::instruction::AccountMeta],
    ) -> solana_program::instruction::Instruction {
        let mut accounts = Vec::with_capacity(15 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.fee_vault,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.buyer, false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.buyer_ata,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.list_state,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.list_ata,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.mint, false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.owner, false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.payer, true,
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
            self.token_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.associated_token_program,
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
        let mut data = BuyT22InstructionData::new().try_to_vec().unwrap();
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
struct BuyT22InstructionData {
    discriminator: [u8; 8],
}

impl BuyT22InstructionData {
    fn new() -> Self {
        Self {
            discriminator: [81, 98, 227, 171, 201, 105, 180, 216],
        }
    }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct BuyT22InstructionArgs {
    pub max_amount: u64,
}

/// Instruction builder for `BuyT22`.
///
/// ### Accounts:
///
///   0. `[writable]` fee_vault
///   1. `[]` buyer
///   2. `[writable]` buyer_ata
///   3. `[writable]` list_state
///   4. `[writable]` list_ata
///   5. `[]` mint
///   6. `[writable]` owner
///   7. `[writable, signer]` payer
///   8. `[writable, optional]` taker_broker
///   9. `[writable, optional]` maker_broker
///   10. `[writable]` rent_destination
///   11. `[optional]` token_program (default to `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
///   12. `[optional]` associated_token_program (default to `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`)
///   13. `[optional]` marketplace_program (default to `TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp`)
///   14. `[optional]` system_program (default to `11111111111111111111111111111111`)
#[derive(Default)]
pub struct BuyT22Builder {
    fee_vault: Option<solana_program::pubkey::Pubkey>,
    buyer: Option<solana_program::pubkey::Pubkey>,
    buyer_ata: Option<solana_program::pubkey::Pubkey>,
    list_state: Option<solana_program::pubkey::Pubkey>,
    list_ata: Option<solana_program::pubkey::Pubkey>,
    mint: Option<solana_program::pubkey::Pubkey>,
    owner: Option<solana_program::pubkey::Pubkey>,
    payer: Option<solana_program::pubkey::Pubkey>,
    taker_broker: Option<solana_program::pubkey::Pubkey>,
    maker_broker: Option<solana_program::pubkey::Pubkey>,
    rent_destination: Option<solana_program::pubkey::Pubkey>,
    token_program: Option<solana_program::pubkey::Pubkey>,
    associated_token_program: Option<solana_program::pubkey::Pubkey>,
    marketplace_program: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    max_amount: Option<u64>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl BuyT22Builder {
    pub fn new() -> Self {
        Self::default()
    }
    #[inline(always)]
    pub fn fee_vault(&mut self, fee_vault: solana_program::pubkey::Pubkey) -> &mut Self {
        self.fee_vault = Some(fee_vault);
        self
    }
    #[inline(always)]
    pub fn buyer(&mut self, buyer: solana_program::pubkey::Pubkey) -> &mut Self {
        self.buyer = Some(buyer);
        self
    }
    #[inline(always)]
    pub fn buyer_ata(&mut self, buyer_ata: solana_program::pubkey::Pubkey) -> &mut Self {
        self.buyer_ata = Some(buyer_ata);
        self
    }
    #[inline(always)]
    pub fn list_state(&mut self, list_state: solana_program::pubkey::Pubkey) -> &mut Self {
        self.list_state = Some(list_state);
        self
    }
    #[inline(always)]
    pub fn list_ata(&mut self, list_ata: solana_program::pubkey::Pubkey) -> &mut Self {
        self.list_ata = Some(list_ata);
        self
    }
    #[inline(always)]
    pub fn mint(&mut self, mint: solana_program::pubkey::Pubkey) -> &mut Self {
        self.mint = Some(mint);
        self
    }
    #[inline(always)]
    pub fn owner(&mut self, owner: solana_program::pubkey::Pubkey) -> &mut Self {
        self.owner = Some(owner);
        self
    }
    #[inline(always)]
    pub fn payer(&mut self, payer: solana_program::pubkey::Pubkey) -> &mut Self {
        self.payer = Some(payer);
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
    /// `[optional account, default to 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA']`
    #[inline(always)]
    pub fn token_program(&mut self, token_program: solana_program::pubkey::Pubkey) -> &mut Self {
        self.token_program = Some(token_program);
        self
    }
    /// `[optional account, default to 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL']`
    #[inline(always)]
    pub fn associated_token_program(
        &mut self,
        associated_token_program: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.associated_token_program = Some(associated_token_program);
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
        let accounts = BuyT22 {
            fee_vault: self.fee_vault.expect("fee_vault is not set"),
            buyer: self.buyer.expect("buyer is not set"),
            buyer_ata: self.buyer_ata.expect("buyer_ata is not set"),
            list_state: self.list_state.expect("list_state is not set"),
            list_ata: self.list_ata.expect("list_ata is not set"),
            mint: self.mint.expect("mint is not set"),
            owner: self.owner.expect("owner is not set"),
            payer: self.payer.expect("payer is not set"),
            taker_broker: self.taker_broker,
            maker_broker: self.maker_broker,
            rent_destination: self.rent_destination.expect("rent_destination is not set"),
            token_program: self.token_program.unwrap_or(solana_program::pubkey!(
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            )),
            associated_token_program: self.associated_token_program.unwrap_or(
                solana_program::pubkey!("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
            ),
            marketplace_program: self.marketplace_program.unwrap_or(solana_program::pubkey!(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp"
            )),
            system_program: self
                .system_program
                .unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
        };
        let args = BuyT22InstructionArgs {
            max_amount: self.max_amount.clone().expect("max_amount is not set"),
        };

        accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
    }
}

/// `buy_t22` CPI accounts.
pub struct BuyT22CpiAccounts<'a, 'b> {
    pub fee_vault: &'b solana_program::account_info::AccountInfo<'a>,

    pub buyer: &'b solana_program::account_info::AccountInfo<'a>,

    pub buyer_ata: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_ata: &'b solana_program::account_info::AccountInfo<'a>,

    pub mint: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: &'b solana_program::account_info::AccountInfo<'a>,

    pub taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub rent_destination: &'b solana_program::account_info::AccountInfo<'a>,

    pub token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
}

/// `buy_t22` CPI instruction.
pub struct BuyT22Cpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,

    pub fee_vault: &'b solana_program::account_info::AccountInfo<'a>,

    pub buyer: &'b solana_program::account_info::AccountInfo<'a>,

    pub buyer_ata: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_ata: &'b solana_program::account_info::AccountInfo<'a>,

    pub mint: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: &'b solana_program::account_info::AccountInfo<'a>,

    pub taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub rent_destination: &'b solana_program::account_info::AccountInfo<'a>,

    pub token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,
    /// The arguments for the instruction.
    pub __args: BuyT22InstructionArgs,
}

impl<'a, 'b> BuyT22Cpi<'a, 'b> {
    pub fn new(
        program: &'b solana_program::account_info::AccountInfo<'a>,
        accounts: BuyT22CpiAccounts<'a, 'b>,
        args: BuyT22InstructionArgs,
    ) -> Self {
        Self {
            __program: program,
            fee_vault: accounts.fee_vault,
            buyer: accounts.buyer,
            buyer_ata: accounts.buyer_ata,
            list_state: accounts.list_state,
            list_ata: accounts.list_ata,
            mint: accounts.mint,
            owner: accounts.owner,
            payer: accounts.payer,
            taker_broker: accounts.taker_broker,
            maker_broker: accounts.maker_broker,
            rent_destination: accounts.rent_destination,
            token_program: accounts.token_program,
            associated_token_program: accounts.associated_token_program,
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
        let mut accounts = Vec::with_capacity(15 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.fee_vault.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.buyer.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.buyer_ata.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.list_state.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.list_ata.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.mint.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.owner.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.payer.key,
            true,
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
            *self.token_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.associated_token_program.key,
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
        let mut data = BuyT22InstructionData::new().try_to_vec().unwrap();
        let mut args = self.__args.try_to_vec().unwrap();
        data.append(&mut args);

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(15 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.fee_vault.clone());
        account_infos.push(self.buyer.clone());
        account_infos.push(self.buyer_ata.clone());
        account_infos.push(self.list_state.clone());
        account_infos.push(self.list_ata.clone());
        account_infos.push(self.mint.clone());
        account_infos.push(self.owner.clone());
        account_infos.push(self.payer.clone());
        if let Some(taker_broker) = self.taker_broker {
            account_infos.push(taker_broker.clone());
        }
        if let Some(maker_broker) = self.maker_broker {
            account_infos.push(maker_broker.clone());
        }
        account_infos.push(self.rent_destination.clone());
        account_infos.push(self.token_program.clone());
        account_infos.push(self.associated_token_program.clone());
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

/// Instruction builder for `BuyT22` via CPI.
///
/// ### Accounts:
///
///   0. `[writable]` fee_vault
///   1. `[]` buyer
///   2. `[writable]` buyer_ata
///   3. `[writable]` list_state
///   4. `[writable]` list_ata
///   5. `[]` mint
///   6. `[writable]` owner
///   7. `[writable, signer]` payer
///   8. `[writable, optional]` taker_broker
///   9. `[writable, optional]` maker_broker
///   10. `[writable]` rent_destination
///   11. `[]` token_program
///   12. `[]` associated_token_program
///   13. `[]` marketplace_program
///   14. `[]` system_program
pub struct BuyT22CpiBuilder<'a, 'b> {
    instruction: Box<BuyT22CpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> BuyT22CpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(BuyT22CpiBuilderInstruction {
            __program: program,
            fee_vault: None,
            buyer: None,
            buyer_ata: None,
            list_state: None,
            list_ata: None,
            mint: None,
            owner: None,
            payer: None,
            taker_broker: None,
            maker_broker: None,
            rent_destination: None,
            token_program: None,
            associated_token_program: None,
            marketplace_program: None,
            system_program: None,
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
    pub fn buyer(&mut self, buyer: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.buyer = Some(buyer);
        self
    }
    #[inline(always)]
    pub fn buyer_ata(
        &mut self,
        buyer_ata: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.buyer_ata = Some(buyer_ata);
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
    pub fn list_ata(
        &mut self,
        list_ata: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.list_ata = Some(list_ata);
        self
    }
    #[inline(always)]
    pub fn mint(&mut self, mint: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.mint = Some(mint);
        self
    }
    #[inline(always)]
    pub fn owner(&mut self, owner: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.owner = Some(owner);
        self
    }
    #[inline(always)]
    pub fn payer(&mut self, payer: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.payer = Some(payer);
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
    pub fn token_program(
        &mut self,
        token_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.token_program = Some(token_program);
        self
    }
    #[inline(always)]
    pub fn associated_token_program(
        &mut self,
        associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.associated_token_program = Some(associated_token_program);
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
        let args = BuyT22InstructionArgs {
            max_amount: self
                .instruction
                .max_amount
                .clone()
                .expect("max_amount is not set"),
        };
        let instruction = BuyT22Cpi {
            __program: self.instruction.__program,

            fee_vault: self.instruction.fee_vault.expect("fee_vault is not set"),

            buyer: self.instruction.buyer.expect("buyer is not set"),

            buyer_ata: self.instruction.buyer_ata.expect("buyer_ata is not set"),

            list_state: self.instruction.list_state.expect("list_state is not set"),

            list_ata: self.instruction.list_ata.expect("list_ata is not set"),

            mint: self.instruction.mint.expect("mint is not set"),

            owner: self.instruction.owner.expect("owner is not set"),

            payer: self.instruction.payer.expect("payer is not set"),

            taker_broker: self.instruction.taker_broker,

            maker_broker: self.instruction.maker_broker,

            rent_destination: self
                .instruction
                .rent_destination
                .expect("rent_destination is not set"),

            token_program: self
                .instruction
                .token_program
                .expect("token_program is not set"),

            associated_token_program: self
                .instruction
                .associated_token_program
                .expect("associated_token_program is not set"),

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

struct BuyT22CpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    fee_vault: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    buyer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    buyer_ata: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    list_state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    list_ata: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mint: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    payer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    rent_destination: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    associated_token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
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
