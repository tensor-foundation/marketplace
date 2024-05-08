//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! [https://github.com/metaplex-foundation/kinobi]
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use solana_program::pubkey::Pubkey;

/// Accounts.
pub struct ListWns {
    pub owner: solana_program::pubkey::Pubkey,

    pub owner_ata: solana_program::pubkey::Pubkey,

    pub list_state: solana_program::pubkey::Pubkey,

    pub list_ata: solana_program::pubkey::Pubkey,

    pub mint: solana_program::pubkey::Pubkey,

    pub payer: solana_program::pubkey::Pubkey,

    pub token_program: solana_program::pubkey::Pubkey,

    pub associated_token_program: solana_program::pubkey::Pubkey,

    pub marketplace_program: solana_program::pubkey::Pubkey,

    pub system_program: solana_program::pubkey::Pubkey,

    pub approve: solana_program::pubkey::Pubkey,

    pub distribution: solana_program::pubkey::Pubkey,

    pub wns_program: solana_program::pubkey::Pubkey,

    pub wns_distribution_program: solana_program::pubkey::Pubkey,

    pub extra_metas: solana_program::pubkey::Pubkey,

    pub cosigner: Option<solana_program::pubkey::Pubkey>,
}

impl ListWns {
    pub fn instruction(
        &self,
        args: ListWnsInstructionArgs,
    ) -> solana_program::instruction::Instruction {
        self.instruction_with_remaining_accounts(args, &[])
    }
    #[allow(clippy::vec_init_then_push)]
    pub fn instruction_with_remaining_accounts(
        &self,
        args: ListWnsInstructionArgs,
        remaining_accounts: &[solana_program::instruction::AccountMeta],
    ) -> solana_program::instruction::Instruction {
        let mut accounts = Vec::with_capacity(16 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.owner, true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.owner_ata,
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
            self.payer, true,
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
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.approve,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.distribution,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.wns_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.wns_distribution_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.extra_metas,
            false,
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
        let mut data = ListWnsInstructionData::new().try_to_vec().unwrap();
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
struct ListWnsInstructionData {
    discriminator: [u8; 8],
}

impl ListWnsInstructionData {
    fn new() -> Self {
        Self {
            discriminator: [23, 202, 102, 138, 255, 190, 39, 196],
        }
    }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct ListWnsInstructionArgs {
    pub amount: u64,
    pub expire_in_sec: Option<u64>,
    pub currency: Option<Pubkey>,
    pub private_taker: Option<Pubkey>,
    pub maker_broker: Option<Pubkey>,
}

/// Instruction builder for `ListWns`.
///
/// ### Accounts:
///
///   0. `[signer]` owner
///   1. `[writable]` owner_ata
///   2. `[writable]` list_state
///   3. `[writable]` list_ata
///   4. `[]` mint
///   5. `[writable, signer]` payer
///   6. `[optional]` token_program (default to `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
///   7. `[optional]` associated_token_program (default to `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`)
///   8. `[optional]` marketplace_program (default to `TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp`)
///   9. `[optional]` system_program (default to `11111111111111111111111111111111`)
///   10. `[writable]` approve
///   11. `[writable]` distribution
///   12. `[optional]` wns_program (default to `wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM`)
///   13. `[optional]` wns_distribution_program (default to `diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay`)
///   14. `[]` extra_metas
///   15. `[signer, optional]` cosigner
#[derive(Default)]
pub struct ListWnsBuilder {
    owner: Option<solana_program::pubkey::Pubkey>,
    owner_ata: Option<solana_program::pubkey::Pubkey>,
    list_state: Option<solana_program::pubkey::Pubkey>,
    list_ata: Option<solana_program::pubkey::Pubkey>,
    mint: Option<solana_program::pubkey::Pubkey>,
    payer: Option<solana_program::pubkey::Pubkey>,
    token_program: Option<solana_program::pubkey::Pubkey>,
    associated_token_program: Option<solana_program::pubkey::Pubkey>,
    marketplace_program: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    approve: Option<solana_program::pubkey::Pubkey>,
    distribution: Option<solana_program::pubkey::Pubkey>,
    wns_program: Option<solana_program::pubkey::Pubkey>,
    wns_distribution_program: Option<solana_program::pubkey::Pubkey>,
    extra_metas: Option<solana_program::pubkey::Pubkey>,
    cosigner: Option<solana_program::pubkey::Pubkey>,
    amount: Option<u64>,
    expire_in_sec: Option<u64>,
    currency: Option<Pubkey>,
    private_taker: Option<Pubkey>,
    maker_broker: Option<Pubkey>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl ListWnsBuilder {
    pub fn new() -> Self {
        Self::default()
    }
    #[inline(always)]
    pub fn owner(&mut self, owner: solana_program::pubkey::Pubkey) -> &mut Self {
        self.owner = Some(owner);
        self
    }
    #[inline(always)]
    pub fn owner_ata(&mut self, owner_ata: solana_program::pubkey::Pubkey) -> &mut Self {
        self.owner_ata = Some(owner_ata);
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
    pub fn payer(&mut self, payer: solana_program::pubkey::Pubkey) -> &mut Self {
        self.payer = Some(payer);
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
    pub fn approve(&mut self, approve: solana_program::pubkey::Pubkey) -> &mut Self {
        self.approve = Some(approve);
        self
    }
    #[inline(always)]
    pub fn distribution(&mut self, distribution: solana_program::pubkey::Pubkey) -> &mut Self {
        self.distribution = Some(distribution);
        self
    }
    /// `[optional account, default to 'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM']`
    #[inline(always)]
    pub fn wns_program(&mut self, wns_program: solana_program::pubkey::Pubkey) -> &mut Self {
        self.wns_program = Some(wns_program);
        self
    }
    /// `[optional account, default to 'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay']`
    #[inline(always)]
    pub fn wns_distribution_program(
        &mut self,
        wns_distribution_program: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.wns_distribution_program = Some(wns_distribution_program);
        self
    }
    #[inline(always)]
    pub fn extra_metas(&mut self, extra_metas: solana_program::pubkey::Pubkey) -> &mut Self {
        self.extra_metas = Some(extra_metas);
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
        let accounts = ListWns {
            owner: self.owner.expect("owner is not set"),
            owner_ata: self.owner_ata.expect("owner_ata is not set"),
            list_state: self.list_state.expect("list_state is not set"),
            list_ata: self.list_ata.expect("list_ata is not set"),
            mint: self.mint.expect("mint is not set"),
            payer: self.payer.expect("payer is not set"),
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
            approve: self.approve.expect("approve is not set"),
            distribution: self.distribution.expect("distribution is not set"),
            wns_program: self.wns_program.unwrap_or(solana_program::pubkey!(
                "wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM"
            )),
            wns_distribution_program: self.wns_distribution_program.unwrap_or(
                solana_program::pubkey!("diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay"),
            ),
            extra_metas: self.extra_metas.expect("extra_metas is not set"),
            cosigner: self.cosigner,
        };
        let args = ListWnsInstructionArgs {
            amount: self.amount.clone().expect("amount is not set"),
            expire_in_sec: self.expire_in_sec.clone(),
            currency: self.currency.clone(),
            private_taker: self.private_taker.clone(),
            maker_broker: self.maker_broker.clone(),
        };

        accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
    }
}

/// `list_wns` CPI accounts.
pub struct ListWnsCpiAccounts<'a, 'b> {
    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner_ata: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_ata: &'b solana_program::account_info::AccountInfo<'a>,

    pub mint: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: &'b solana_program::account_info::AccountInfo<'a>,

    pub token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub approve: &'b solana_program::account_info::AccountInfo<'a>,

    pub distribution: &'b solana_program::account_info::AccountInfo<'a>,

    pub wns_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub wns_distribution_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub extra_metas: &'b solana_program::account_info::AccountInfo<'a>,

    pub cosigner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
}

/// `list_wns` CPI instruction.
pub struct ListWnsCpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner_ata: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_ata: &'b solana_program::account_info::AccountInfo<'a>,

    pub mint: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: &'b solana_program::account_info::AccountInfo<'a>,

    pub token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub approve: &'b solana_program::account_info::AccountInfo<'a>,

    pub distribution: &'b solana_program::account_info::AccountInfo<'a>,

    pub wns_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub wns_distribution_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub extra_metas: &'b solana_program::account_info::AccountInfo<'a>,

    pub cosigner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    /// The arguments for the instruction.
    pub __args: ListWnsInstructionArgs,
}

impl<'a, 'b> ListWnsCpi<'a, 'b> {
    pub fn new(
        program: &'b solana_program::account_info::AccountInfo<'a>,
        accounts: ListWnsCpiAccounts<'a, 'b>,
        args: ListWnsInstructionArgs,
    ) -> Self {
        Self {
            __program: program,
            owner: accounts.owner,
            owner_ata: accounts.owner_ata,
            list_state: accounts.list_state,
            list_ata: accounts.list_ata,
            mint: accounts.mint,
            payer: accounts.payer,
            token_program: accounts.token_program,
            associated_token_program: accounts.associated_token_program,
            marketplace_program: accounts.marketplace_program,
            system_program: accounts.system_program,
            approve: accounts.approve,
            distribution: accounts.distribution,
            wns_program: accounts.wns_program,
            wns_distribution_program: accounts.wns_distribution_program,
            extra_metas: accounts.extra_metas,
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
        let mut accounts = Vec::with_capacity(16 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.owner.key,
            true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.owner_ata.key,
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
            *self.payer.key,
            true,
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
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.approve.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.distribution.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.wns_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.wns_distribution_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.extra_metas.key,
            false,
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
        let mut data = ListWnsInstructionData::new().try_to_vec().unwrap();
        let mut args = self.__args.try_to_vec().unwrap();
        data.append(&mut args);

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(16 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.owner.clone());
        account_infos.push(self.owner_ata.clone());
        account_infos.push(self.list_state.clone());
        account_infos.push(self.list_ata.clone());
        account_infos.push(self.mint.clone());
        account_infos.push(self.payer.clone());
        account_infos.push(self.token_program.clone());
        account_infos.push(self.associated_token_program.clone());
        account_infos.push(self.marketplace_program.clone());
        account_infos.push(self.system_program.clone());
        account_infos.push(self.approve.clone());
        account_infos.push(self.distribution.clone());
        account_infos.push(self.wns_program.clone());
        account_infos.push(self.wns_distribution_program.clone());
        account_infos.push(self.extra_metas.clone());
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

/// Instruction builder for `ListWns` via CPI.
///
/// ### Accounts:
///
///   0. `[signer]` owner
///   1. `[writable]` owner_ata
///   2. `[writable]` list_state
///   3. `[writable]` list_ata
///   4. `[]` mint
///   5. `[writable, signer]` payer
///   6. `[]` token_program
///   7. `[]` associated_token_program
///   8. `[]` marketplace_program
///   9. `[]` system_program
///   10. `[writable]` approve
///   11. `[writable]` distribution
///   12. `[]` wns_program
///   13. `[]` wns_distribution_program
///   14. `[]` extra_metas
///   15. `[signer, optional]` cosigner
pub struct ListWnsCpiBuilder<'a, 'b> {
    instruction: Box<ListWnsCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> ListWnsCpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(ListWnsCpiBuilderInstruction {
            __program: program,
            owner: None,
            owner_ata: None,
            list_state: None,
            list_ata: None,
            mint: None,
            payer: None,
            token_program: None,
            associated_token_program: None,
            marketplace_program: None,
            system_program: None,
            approve: None,
            distribution: None,
            wns_program: None,
            wns_distribution_program: None,
            extra_metas: None,
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
    pub fn owner(&mut self, owner: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.owner = Some(owner);
        self
    }
    #[inline(always)]
    pub fn owner_ata(
        &mut self,
        owner_ata: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.owner_ata = Some(owner_ata);
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
    pub fn payer(&mut self, payer: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.payer = Some(payer);
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
    pub fn approve(
        &mut self,
        approve: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.approve = Some(approve);
        self
    }
    #[inline(always)]
    pub fn distribution(
        &mut self,
        distribution: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.distribution = Some(distribution);
        self
    }
    #[inline(always)]
    pub fn wns_program(
        &mut self,
        wns_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.wns_program = Some(wns_program);
        self
    }
    #[inline(always)]
    pub fn wns_distribution_program(
        &mut self,
        wns_distribution_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.wns_distribution_program = Some(wns_distribution_program);
        self
    }
    #[inline(always)]
    pub fn extra_metas(
        &mut self,
        extra_metas: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.extra_metas = Some(extra_metas);
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
        let args = ListWnsInstructionArgs {
            amount: self.instruction.amount.clone().expect("amount is not set"),
            expire_in_sec: self.instruction.expire_in_sec.clone(),
            currency: self.instruction.currency.clone(),
            private_taker: self.instruction.private_taker.clone(),
            maker_broker: self.instruction.maker_broker.clone(),
        };
        let instruction = ListWnsCpi {
            __program: self.instruction.__program,

            owner: self.instruction.owner.expect("owner is not set"),

            owner_ata: self.instruction.owner_ata.expect("owner_ata is not set"),

            list_state: self.instruction.list_state.expect("list_state is not set"),

            list_ata: self.instruction.list_ata.expect("list_ata is not set"),

            mint: self.instruction.mint.expect("mint is not set"),

            payer: self.instruction.payer.expect("payer is not set"),

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

            approve: self.instruction.approve.expect("approve is not set"),

            distribution: self
                .instruction
                .distribution
                .expect("distribution is not set"),

            wns_program: self
                .instruction
                .wns_program
                .expect("wns_program is not set"),

            wns_distribution_program: self
                .instruction
                .wns_distribution_program
                .expect("wns_distribution_program is not set"),

            extra_metas: self
                .instruction
                .extra_metas
                .expect("extra_metas is not set"),

            cosigner: self.instruction.cosigner,
            __args: args,
        };
        instruction.invoke_signed_with_remaining_accounts(
            signers_seeds,
            &self.instruction.__remaining_accounts,
        )
    }
}

struct ListWnsCpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner_ata: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    list_state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    list_ata: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mint: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    payer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    associated_token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    marketplace_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    approve: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    distribution: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    wns_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    wns_distribution_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    extra_metas: Option<&'b solana_program::account_info::AccountInfo<'a>>,
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
