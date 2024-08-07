//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct CloseExpiredListingWns {
    pub owner: solana_program::pubkey::Pubkey,

    pub owner_ta: solana_program::pubkey::Pubkey,

    pub list_state: solana_program::pubkey::Pubkey,

    pub list_ta: solana_program::pubkey::Pubkey,

    pub mint: solana_program::pubkey::Pubkey,

    pub rent_destination: solana_program::pubkey::Pubkey,

    pub payer: solana_program::pubkey::Pubkey,

    pub token_program: solana_program::pubkey::Pubkey,

    pub associated_token_program: solana_program::pubkey::Pubkey,

    pub system_program: solana_program::pubkey::Pubkey,

    pub marketplace_program: solana_program::pubkey::Pubkey,

    pub approve: solana_program::pubkey::Pubkey,

    pub distribution: solana_program::pubkey::Pubkey,

    pub wns_program: solana_program::pubkey::Pubkey,

    pub distribution_program: solana_program::pubkey::Pubkey,

    pub extra_metas: solana_program::pubkey::Pubkey,
}

impl CloseExpiredListingWns {
    pub fn instruction(&self) -> solana_program::instruction::Instruction {
        self.instruction_with_remaining_accounts(&[])
    }
    #[allow(clippy::vec_init_then_push)]
    pub fn instruction_with_remaining_accounts(
        &self,
        remaining_accounts: &[solana_program::instruction::AccountMeta],
    ) -> solana_program::instruction::Instruction {
        let mut accounts = Vec::with_capacity(16 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.owner, false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.owner_ta,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.list_state,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.list_ta,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.mint, false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.rent_destination,
            false,
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
            self.system_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.marketplace_program,
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
            self.distribution_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.extra_metas,
            false,
        ));
        accounts.extend_from_slice(remaining_accounts);
        let data = CloseExpiredListingWnsInstructionData::new()
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
pub struct CloseExpiredListingWnsInstructionData {
    discriminator: [u8; 8],
}

impl CloseExpiredListingWnsInstructionData {
    pub fn new() -> Self {
        Self {
            discriminator: [222, 31, 183, 134, 230, 207, 7, 132],
        }
    }
}

impl Default for CloseExpiredListingWnsInstructionData {
    fn default() -> Self {
        Self::new()
    }
}

/// Instruction builder for `CloseExpiredListingWns`.
///
/// ### Accounts:
///
///   0. `[]` owner
///   1. `[writable]` owner_ta
///   2. `[writable]` list_state
///   3. `[writable]` list_ta
///   4. `[]` mint
///   5. `[writable]` rent_destination
///   6. `[writable, signer]` payer
///   7. `[optional]` token_program (default to `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`)
///   8. `[optional]` associated_token_program (default to `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`)
///   9. `[optional]` system_program (default to `11111111111111111111111111111111`)
///   10. `[optional]` marketplace_program (default to `TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp`)
///   11. `[writable]` approve
///   12. `[writable]` distribution
///   13. `[optional]` wns_program (default to `wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM`)
///   14. `[optional]` distribution_program (default to `diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay`)
///   15. `[]` extra_metas
#[derive(Clone, Debug, Default)]
pub struct CloseExpiredListingWnsBuilder {
    owner: Option<solana_program::pubkey::Pubkey>,
    owner_ta: Option<solana_program::pubkey::Pubkey>,
    list_state: Option<solana_program::pubkey::Pubkey>,
    list_ta: Option<solana_program::pubkey::Pubkey>,
    mint: Option<solana_program::pubkey::Pubkey>,
    rent_destination: Option<solana_program::pubkey::Pubkey>,
    payer: Option<solana_program::pubkey::Pubkey>,
    token_program: Option<solana_program::pubkey::Pubkey>,
    associated_token_program: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    marketplace_program: Option<solana_program::pubkey::Pubkey>,
    approve: Option<solana_program::pubkey::Pubkey>,
    distribution: Option<solana_program::pubkey::Pubkey>,
    wns_program: Option<solana_program::pubkey::Pubkey>,
    distribution_program: Option<solana_program::pubkey::Pubkey>,
    extra_metas: Option<solana_program::pubkey::Pubkey>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl CloseExpiredListingWnsBuilder {
    pub fn new() -> Self {
        Self::default()
    }
    #[inline(always)]
    pub fn owner(&mut self, owner: solana_program::pubkey::Pubkey) -> &mut Self {
        self.owner = Some(owner);
        self
    }
    #[inline(always)]
    pub fn owner_ta(&mut self, owner_ta: solana_program::pubkey::Pubkey) -> &mut Self {
        self.owner_ta = Some(owner_ta);
        self
    }
    #[inline(always)]
    pub fn list_state(&mut self, list_state: solana_program::pubkey::Pubkey) -> &mut Self {
        self.list_state = Some(list_state);
        self
    }
    #[inline(always)]
    pub fn list_ta(&mut self, list_ta: solana_program::pubkey::Pubkey) -> &mut Self {
        self.list_ta = Some(list_ta);
        self
    }
    #[inline(always)]
    pub fn mint(&mut self, mint: solana_program::pubkey::Pubkey) -> &mut Self {
        self.mint = Some(mint);
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
    #[inline(always)]
    pub fn payer(&mut self, payer: solana_program::pubkey::Pubkey) -> &mut Self {
        self.payer = Some(payer);
        self
    }
    /// `[optional account, default to 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb']`
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
    pub fn distribution_program(
        &mut self,
        distribution_program: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.distribution_program = Some(distribution_program);
        self
    }
    #[inline(always)]
    pub fn extra_metas(&mut self, extra_metas: solana_program::pubkey::Pubkey) -> &mut Self {
        self.extra_metas = Some(extra_metas);
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
        let accounts = CloseExpiredListingWns {
            owner: self.owner.expect("owner is not set"),
            owner_ta: self.owner_ta.expect("owner_ta is not set"),
            list_state: self.list_state.expect("list_state is not set"),
            list_ta: self.list_ta.expect("list_ta is not set"),
            mint: self.mint.expect("mint is not set"),
            rent_destination: self.rent_destination.expect("rent_destination is not set"),
            payer: self.payer.expect("payer is not set"),
            token_program: self.token_program.unwrap_or(solana_program::pubkey!(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
            )),
            associated_token_program: self.associated_token_program.unwrap_or(
                solana_program::pubkey!("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
            ),
            system_program: self
                .system_program
                .unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
            marketplace_program: self.marketplace_program.unwrap_or(solana_program::pubkey!(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp"
            )),
            approve: self.approve.expect("approve is not set"),
            distribution: self.distribution.expect("distribution is not set"),
            wns_program: self.wns_program.unwrap_or(solana_program::pubkey!(
                "wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM"
            )),
            distribution_program: self.distribution_program.unwrap_or(solana_program::pubkey!(
                "diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay"
            )),
            extra_metas: self.extra_metas.expect("extra_metas is not set"),
        };

        accounts.instruction_with_remaining_accounts(&self.__remaining_accounts)
    }
}

/// `close_expired_listing_wns` CPI accounts.
pub struct CloseExpiredListingWnsCpiAccounts<'a, 'b> {
    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner_ta: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_ta: &'b solana_program::account_info::AccountInfo<'a>,

    pub mint: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_destination: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: &'b solana_program::account_info::AccountInfo<'a>,

    pub token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub approve: &'b solana_program::account_info::AccountInfo<'a>,

    pub distribution: &'b solana_program::account_info::AccountInfo<'a>,

    pub wns_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub distribution_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub extra_metas: &'b solana_program::account_info::AccountInfo<'a>,
}

/// `close_expired_listing_wns` CPI instruction.
pub struct CloseExpiredListingWnsCpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner_ta: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub list_ta: &'b solana_program::account_info::AccountInfo<'a>,

    pub mint: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_destination: &'b solana_program::account_info::AccountInfo<'a>,

    pub payer: &'b solana_program::account_info::AccountInfo<'a>,

    pub token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub approve: &'b solana_program::account_info::AccountInfo<'a>,

    pub distribution: &'b solana_program::account_info::AccountInfo<'a>,

    pub wns_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub distribution_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub extra_metas: &'b solana_program::account_info::AccountInfo<'a>,
}

impl<'a, 'b> CloseExpiredListingWnsCpi<'a, 'b> {
    pub fn new(
        program: &'b solana_program::account_info::AccountInfo<'a>,
        accounts: CloseExpiredListingWnsCpiAccounts<'a, 'b>,
    ) -> Self {
        Self {
            __program: program,
            owner: accounts.owner,
            owner_ta: accounts.owner_ta,
            list_state: accounts.list_state,
            list_ta: accounts.list_ta,
            mint: accounts.mint,
            rent_destination: accounts.rent_destination,
            payer: accounts.payer,
            token_program: accounts.token_program,
            associated_token_program: accounts.associated_token_program,
            system_program: accounts.system_program,
            marketplace_program: accounts.marketplace_program,
            approve: accounts.approve,
            distribution: accounts.distribution,
            wns_program: accounts.wns_program,
            distribution_program: accounts.distribution_program,
            extra_metas: accounts.extra_metas,
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
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.owner_ta.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.list_state.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.list_ta.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.mint.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.rent_destination.key,
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
            *self.system_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.marketplace_program.key,
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
            *self.distribution_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.extra_metas.key,
            false,
        ));
        remaining_accounts.iter().for_each(|remaining_account| {
            accounts.push(solana_program::instruction::AccountMeta {
                pubkey: *remaining_account.0.key,
                is_signer: remaining_account.1,
                is_writable: remaining_account.2,
            })
        });
        let data = CloseExpiredListingWnsInstructionData::new()
            .try_to_vec()
            .unwrap();

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(16 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.owner.clone());
        account_infos.push(self.owner_ta.clone());
        account_infos.push(self.list_state.clone());
        account_infos.push(self.list_ta.clone());
        account_infos.push(self.mint.clone());
        account_infos.push(self.rent_destination.clone());
        account_infos.push(self.payer.clone());
        account_infos.push(self.token_program.clone());
        account_infos.push(self.associated_token_program.clone());
        account_infos.push(self.system_program.clone());
        account_infos.push(self.marketplace_program.clone());
        account_infos.push(self.approve.clone());
        account_infos.push(self.distribution.clone());
        account_infos.push(self.wns_program.clone());
        account_infos.push(self.distribution_program.clone());
        account_infos.push(self.extra_metas.clone());
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

/// Instruction builder for `CloseExpiredListingWns` via CPI.
///
/// ### Accounts:
///
///   0. `[]` owner
///   1. `[writable]` owner_ta
///   2. `[writable]` list_state
///   3. `[writable]` list_ta
///   4. `[]` mint
///   5. `[writable]` rent_destination
///   6. `[writable, signer]` payer
///   7. `[]` token_program
///   8. `[]` associated_token_program
///   9. `[]` system_program
///   10. `[]` marketplace_program
///   11. `[writable]` approve
///   12. `[writable]` distribution
///   13. `[]` wns_program
///   14. `[]` distribution_program
///   15. `[]` extra_metas
#[derive(Clone, Debug)]
pub struct CloseExpiredListingWnsCpiBuilder<'a, 'b> {
    instruction: Box<CloseExpiredListingWnsCpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> CloseExpiredListingWnsCpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(CloseExpiredListingWnsCpiBuilderInstruction {
            __program: program,
            owner: None,
            owner_ta: None,
            list_state: None,
            list_ta: None,
            mint: None,
            rent_destination: None,
            payer: None,
            token_program: None,
            associated_token_program: None,
            system_program: None,
            marketplace_program: None,
            approve: None,
            distribution: None,
            wns_program: None,
            distribution_program: None,
            extra_metas: None,
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
    pub fn owner_ta(
        &mut self,
        owner_ta: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.owner_ta = Some(owner_ta);
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
    pub fn list_ta(
        &mut self,
        list_ta: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.list_ta = Some(list_ta);
        self
    }
    #[inline(always)]
    pub fn mint(&mut self, mint: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.mint = Some(mint);
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
    pub fn distribution_program(
        &mut self,
        distribution_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.distribution_program = Some(distribution_program);
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
        let instruction = CloseExpiredListingWnsCpi {
            __program: self.instruction.__program,

            owner: self.instruction.owner.expect("owner is not set"),

            owner_ta: self.instruction.owner_ta.expect("owner_ta is not set"),

            list_state: self.instruction.list_state.expect("list_state is not set"),

            list_ta: self.instruction.list_ta.expect("list_ta is not set"),

            mint: self.instruction.mint.expect("mint is not set"),

            rent_destination: self
                .instruction
                .rent_destination
                .expect("rent_destination is not set"),

            payer: self.instruction.payer.expect("payer is not set"),

            token_program: self
                .instruction
                .token_program
                .expect("token_program is not set"),

            associated_token_program: self
                .instruction
                .associated_token_program
                .expect("associated_token_program is not set"),

            system_program: self
                .instruction
                .system_program
                .expect("system_program is not set"),

            marketplace_program: self
                .instruction
                .marketplace_program
                .expect("marketplace_program is not set"),

            approve: self.instruction.approve.expect("approve is not set"),

            distribution: self
                .instruction
                .distribution
                .expect("distribution is not set"),

            wns_program: self
                .instruction
                .wns_program
                .expect("wns_program is not set"),

            distribution_program: self
                .instruction
                .distribution_program
                .expect("distribution_program is not set"),

            extra_metas: self
                .instruction
                .extra_metas
                .expect("extra_metas is not set"),
        };
        instruction.invoke_signed_with_remaining_accounts(
            signers_seeds,
            &self.instruction.__remaining_accounts,
        )
    }
}

#[derive(Clone, Debug)]
struct CloseExpiredListingWnsCpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner_ta: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    list_state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    list_ta: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mint: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    rent_destination: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    payer: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    associated_token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    marketplace_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    approve: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    distribution: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    wns_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    distribution_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    extra_metas: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
    __remaining_accounts: Vec<(
        &'b solana_program::account_info::AccountInfo<'a>,
        bool,
        bool,
    )>,
}
