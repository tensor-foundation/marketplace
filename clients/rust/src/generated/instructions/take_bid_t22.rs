//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! <https://github.com/kinobi-so/kinobi>
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct TakeBidT22 {
    pub fee_vault: solana_program::pubkey::Pubkey,

    pub seller: solana_program::pubkey::Pubkey,

    pub bid_state: solana_program::pubkey::Pubkey,

    pub owner: solana_program::pubkey::Pubkey,

    pub taker_broker: Option<solana_program::pubkey::Pubkey>,

    pub maker_broker: Option<solana_program::pubkey::Pubkey>,

    pub margin_account: solana_program::pubkey::Pubkey,

    pub whitelist: solana_program::pubkey::Pubkey,

    pub seller_ta: solana_program::pubkey::Pubkey,

    pub mint: solana_program::pubkey::Pubkey,

    pub owner_ta: solana_program::pubkey::Pubkey,

    pub token_program: solana_program::pubkey::Pubkey,

    pub associated_token_program: solana_program::pubkey::Pubkey,

    pub system_program: solana_program::pubkey::Pubkey,

    pub marketplace_program: solana_program::pubkey::Pubkey,

    pub escrow_program: solana_program::pubkey::Pubkey,

    pub cosigner: Option<solana_program::pubkey::Pubkey>,
    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    pub mint_proof: solana_program::pubkey::Pubkey,

    pub rent_destination: solana_program::pubkey::Pubkey,
}

impl TakeBidT22 {
    pub fn instruction(
        &self,
        args: TakeBidT22InstructionArgs,
    ) -> solana_program::instruction::Instruction {
        self.instruction_with_remaining_accounts(args, &[])
    }
    #[allow(clippy::vec_init_then_push)]
    pub fn instruction_with_remaining_accounts(
        &self,
        args: TakeBidT22InstructionArgs,
        remaining_accounts: &[solana_program::instruction::AccountMeta],
    ) -> solana_program::instruction::Instruction {
        let mut accounts = Vec::with_capacity(19 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.fee_vault,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.seller,
            true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.bid_state,
            false,
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
            self.margin_account,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.whitelist,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.seller_ta,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.mint, false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.owner_ta,
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
            self.system_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.marketplace_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.escrow_program,
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
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.mint_proof,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.rent_destination,
            false,
        ));
        accounts.extend_from_slice(remaining_accounts);
        let mut data = TakeBidT22InstructionData::new().try_to_vec().unwrap();
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
pub struct TakeBidT22InstructionData {
    discriminator: [u8; 8],
}

impl TakeBidT22InstructionData {
    pub fn new() -> Self {
        Self {
            discriminator: [18, 250, 113, 242, 31, 244, 19, 150],
        }
    }
}

impl Default for TakeBidT22InstructionData {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(BorshSerialize, BorshDeserialize, Clone, Debug, Eq, PartialEq)]
#[cfg_attr(feature = "serde", derive(serde::Serialize, serde::Deserialize))]
pub struct TakeBidT22InstructionArgs {
    pub min_amount: u64,
}

/// Instruction builder for `TakeBidT22`.
///
/// ### Accounts:
///
///   0. `[writable]` fee_vault
///   1. `[writable, signer]` seller
///   2. `[writable]` bid_state
///   3. `[writable]` owner
///   4. `[writable, optional]` taker_broker
///   5. `[writable, optional]` maker_broker
///   6. `[writable]` margin_account
///   7. `[]` whitelist
///   8. `[writable]` seller_ta
///   9. `[]` mint
///   10. `[writable]` owner_ta
///   11. `[optional]` token_program (default to `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
///   12. `[optional]` associated_token_program (default to `ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL`)
///   13. `[optional]` system_program (default to `11111111111111111111111111111111`)
///   14. `[optional]` marketplace_program (default to `TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp`)
///   15. `[optional]` escrow_program (default to `TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN`)
///   16. `[signer, optional]` cosigner
///   17. `[]` mint_proof
///   18. `[writable]` rent_destination
#[derive(Clone, Debug, Default)]
pub struct TakeBidT22Builder {
    fee_vault: Option<solana_program::pubkey::Pubkey>,
    seller: Option<solana_program::pubkey::Pubkey>,
    bid_state: Option<solana_program::pubkey::Pubkey>,
    owner: Option<solana_program::pubkey::Pubkey>,
    taker_broker: Option<solana_program::pubkey::Pubkey>,
    maker_broker: Option<solana_program::pubkey::Pubkey>,
    margin_account: Option<solana_program::pubkey::Pubkey>,
    whitelist: Option<solana_program::pubkey::Pubkey>,
    seller_ta: Option<solana_program::pubkey::Pubkey>,
    mint: Option<solana_program::pubkey::Pubkey>,
    owner_ta: Option<solana_program::pubkey::Pubkey>,
    token_program: Option<solana_program::pubkey::Pubkey>,
    associated_token_program: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    marketplace_program: Option<solana_program::pubkey::Pubkey>,
    escrow_program: Option<solana_program::pubkey::Pubkey>,
    cosigner: Option<solana_program::pubkey::Pubkey>,
    mint_proof: Option<solana_program::pubkey::Pubkey>,
    rent_destination: Option<solana_program::pubkey::Pubkey>,
    min_amount: Option<u64>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl TakeBidT22Builder {
    pub fn new() -> Self {
        Self::default()
    }
    #[inline(always)]
    pub fn fee_vault(&mut self, fee_vault: solana_program::pubkey::Pubkey) -> &mut Self {
        self.fee_vault = Some(fee_vault);
        self
    }
    #[inline(always)]
    pub fn seller(&mut self, seller: solana_program::pubkey::Pubkey) -> &mut Self {
        self.seller = Some(seller);
        self
    }
    #[inline(always)]
    pub fn bid_state(&mut self, bid_state: solana_program::pubkey::Pubkey) -> &mut Self {
        self.bid_state = Some(bid_state);
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
    pub fn margin_account(&mut self, margin_account: solana_program::pubkey::Pubkey) -> &mut Self {
        self.margin_account = Some(margin_account);
        self
    }
    #[inline(always)]
    pub fn whitelist(&mut self, whitelist: solana_program::pubkey::Pubkey) -> &mut Self {
        self.whitelist = Some(whitelist);
        self
    }
    #[inline(always)]
    pub fn seller_ta(&mut self, seller_ta: solana_program::pubkey::Pubkey) -> &mut Self {
        self.seller_ta = Some(seller_ta);
        self
    }
    #[inline(always)]
    pub fn mint(&mut self, mint: solana_program::pubkey::Pubkey) -> &mut Self {
        self.mint = Some(mint);
        self
    }
    #[inline(always)]
    pub fn owner_ta(&mut self, owner_ta: solana_program::pubkey::Pubkey) -> &mut Self {
        self.owner_ta = Some(owner_ta);
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
    /// `[optional account, default to 'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN']`
    #[inline(always)]
    pub fn escrow_program(&mut self, escrow_program: solana_program::pubkey::Pubkey) -> &mut Self {
        self.escrow_program = Some(escrow_program);
        self
    }
    /// `[optional account]`
    #[inline(always)]
    pub fn cosigner(&mut self, cosigner: Option<solana_program::pubkey::Pubkey>) -> &mut Self {
        self.cosigner = cosigner;
        self
    }
    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    #[inline(always)]
    pub fn mint_proof(&mut self, mint_proof: solana_program::pubkey::Pubkey) -> &mut Self {
        self.mint_proof = Some(mint_proof);
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
    pub fn min_amount(&mut self, min_amount: u64) -> &mut Self {
        self.min_amount = Some(min_amount);
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
        let accounts = TakeBidT22 {
            fee_vault: self.fee_vault.expect("fee_vault is not set"),
            seller: self.seller.expect("seller is not set"),
            bid_state: self.bid_state.expect("bid_state is not set"),
            owner: self.owner.expect("owner is not set"),
            taker_broker: self.taker_broker,
            maker_broker: self.maker_broker,
            margin_account: self.margin_account.expect("margin_account is not set"),
            whitelist: self.whitelist.expect("whitelist is not set"),
            seller_ta: self.seller_ta.expect("seller_ta is not set"),
            mint: self.mint.expect("mint is not set"),
            owner_ta: self.owner_ta.expect("owner_ta is not set"),
            token_program: self.token_program.unwrap_or(solana_program::pubkey!(
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
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
            escrow_program: self.escrow_program.unwrap_or(solana_program::pubkey!(
                "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN"
            )),
            cosigner: self.cosigner,
            mint_proof: self.mint_proof.expect("mint_proof is not set"),
            rent_destination: self.rent_destination.expect("rent_destination is not set"),
        };
        let args = TakeBidT22InstructionArgs {
            min_amount: self.min_amount.clone().expect("min_amount is not set"),
        };

        accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
    }
}

/// `take_bid_t22` CPI accounts.
pub struct TakeBidT22CpiAccounts<'a, 'b> {
    pub fee_vault: &'b solana_program::account_info::AccountInfo<'a>,

    pub seller: &'b solana_program::account_info::AccountInfo<'a>,

    pub bid_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub margin_account: &'b solana_program::account_info::AccountInfo<'a>,

    pub whitelist: &'b solana_program::account_info::AccountInfo<'a>,

    pub seller_ta: &'b solana_program::account_info::AccountInfo<'a>,

    pub mint: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner_ta: &'b solana_program::account_info::AccountInfo<'a>,

    pub token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub escrow_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub cosigner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    pub mint_proof: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_destination: &'b solana_program::account_info::AccountInfo<'a>,
}

/// `take_bid_t22` CPI instruction.
pub struct TakeBidT22Cpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,

    pub fee_vault: &'b solana_program::account_info::AccountInfo<'a>,

    pub seller: &'b solana_program::account_info::AccountInfo<'a>,

    pub bid_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub margin_account: &'b solana_program::account_info::AccountInfo<'a>,

    pub whitelist: &'b solana_program::account_info::AccountInfo<'a>,

    pub seller_ta: &'b solana_program::account_info::AccountInfo<'a>,

    pub mint: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner_ta: &'b solana_program::account_info::AccountInfo<'a>,

    pub token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub marketplace_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub escrow_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub cosigner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    pub mint_proof: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_destination: &'b solana_program::account_info::AccountInfo<'a>,
    /// The arguments for the instruction.
    pub __args: TakeBidT22InstructionArgs,
}

impl<'a, 'b> TakeBidT22Cpi<'a, 'b> {
    pub fn new(
        program: &'b solana_program::account_info::AccountInfo<'a>,
        accounts: TakeBidT22CpiAccounts<'a, 'b>,
        args: TakeBidT22InstructionArgs,
    ) -> Self {
        Self {
            __program: program,
            fee_vault: accounts.fee_vault,
            seller: accounts.seller,
            bid_state: accounts.bid_state,
            owner: accounts.owner,
            taker_broker: accounts.taker_broker,
            maker_broker: accounts.maker_broker,
            margin_account: accounts.margin_account,
            whitelist: accounts.whitelist,
            seller_ta: accounts.seller_ta,
            mint: accounts.mint,
            owner_ta: accounts.owner_ta,
            token_program: accounts.token_program,
            associated_token_program: accounts.associated_token_program,
            system_program: accounts.system_program,
            marketplace_program: accounts.marketplace_program,
            escrow_program: accounts.escrow_program,
            cosigner: accounts.cosigner,
            mint_proof: accounts.mint_proof,
            rent_destination: accounts.rent_destination,
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
        let mut accounts = Vec::with_capacity(19 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.fee_vault.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.seller.key,
            true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.bid_state.key,
            false,
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
            *self.margin_account.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.whitelist.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.seller_ta.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.mint.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.owner_ta.key,
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
            *self.system_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.marketplace_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.escrow_program.key,
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
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.mint_proof.key,
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
        let mut data = TakeBidT22InstructionData::new().try_to_vec().unwrap();
        let mut args = self.__args.try_to_vec().unwrap();
        data.append(&mut args);

        let instruction = solana_program::instruction::Instruction {
            program_id: crate::TENSOR_MARKETPLACE_ID,
            accounts,
            data,
        };
        let mut account_infos = Vec::with_capacity(19 + 1 + remaining_accounts.len());
        account_infos.push(self.__program.clone());
        account_infos.push(self.fee_vault.clone());
        account_infos.push(self.seller.clone());
        account_infos.push(self.bid_state.clone());
        account_infos.push(self.owner.clone());
        if let Some(taker_broker) = self.taker_broker {
            account_infos.push(taker_broker.clone());
        }
        if let Some(maker_broker) = self.maker_broker {
            account_infos.push(maker_broker.clone());
        }
        account_infos.push(self.margin_account.clone());
        account_infos.push(self.whitelist.clone());
        account_infos.push(self.seller_ta.clone());
        account_infos.push(self.mint.clone());
        account_infos.push(self.owner_ta.clone());
        account_infos.push(self.token_program.clone());
        account_infos.push(self.associated_token_program.clone());
        account_infos.push(self.system_program.clone());
        account_infos.push(self.marketplace_program.clone());
        account_infos.push(self.escrow_program.clone());
        if let Some(cosigner) = self.cosigner {
            account_infos.push(cosigner.clone());
        }
        account_infos.push(self.mint_proof.clone());
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

/// Instruction builder for `TakeBidT22` via CPI.
///
/// ### Accounts:
///
///   0. `[writable]` fee_vault
///   1. `[writable, signer]` seller
///   2. `[writable]` bid_state
///   3. `[writable]` owner
///   4. `[writable, optional]` taker_broker
///   5. `[writable, optional]` maker_broker
///   6. `[writable]` margin_account
///   7. `[]` whitelist
///   8. `[writable]` seller_ta
///   9. `[]` mint
///   10. `[writable]` owner_ta
///   11. `[]` token_program
///   12. `[]` associated_token_program
///   13. `[]` system_program
///   14. `[]` marketplace_program
///   15. `[]` escrow_program
///   16. `[signer, optional]` cosigner
///   17. `[]` mint_proof
///   18. `[writable]` rent_destination
#[derive(Clone, Debug)]
pub struct TakeBidT22CpiBuilder<'a, 'b> {
    instruction: Box<TakeBidT22CpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> TakeBidT22CpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(TakeBidT22CpiBuilderInstruction {
            __program: program,
            fee_vault: None,
            seller: None,
            bid_state: None,
            owner: None,
            taker_broker: None,
            maker_broker: None,
            margin_account: None,
            whitelist: None,
            seller_ta: None,
            mint: None,
            owner_ta: None,
            token_program: None,
            associated_token_program: None,
            system_program: None,
            marketplace_program: None,
            escrow_program: None,
            cosigner: None,
            mint_proof: None,
            rent_destination: None,
            min_amount: None,
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
    pub fn seller(
        &mut self,
        seller: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.seller = Some(seller);
        self
    }
    #[inline(always)]
    pub fn bid_state(
        &mut self,
        bid_state: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.bid_state = Some(bid_state);
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
    pub fn margin_account(
        &mut self,
        margin_account: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.margin_account = Some(margin_account);
        self
    }
    #[inline(always)]
    pub fn whitelist(
        &mut self,
        whitelist: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.whitelist = Some(whitelist);
        self
    }
    #[inline(always)]
    pub fn seller_ta(
        &mut self,
        seller_ta: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.seller_ta = Some(seller_ta);
        self
    }
    #[inline(always)]
    pub fn mint(&mut self, mint: &'b solana_program::account_info::AccountInfo<'a>) -> &mut Self {
        self.instruction.mint = Some(mint);
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
    pub fn escrow_program(
        &mut self,
        escrow_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.escrow_program = Some(escrow_program);
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
    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    #[inline(always)]
    pub fn mint_proof(
        &mut self,
        mint_proof: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.mint_proof = Some(mint_proof);
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
    pub fn min_amount(&mut self, min_amount: u64) -> &mut Self {
        self.instruction.min_amount = Some(min_amount);
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
        let args = TakeBidT22InstructionArgs {
            min_amount: self
                .instruction
                .min_amount
                .clone()
                .expect("min_amount is not set"),
        };
        let instruction = TakeBidT22Cpi {
            __program: self.instruction.__program,

            fee_vault: self.instruction.fee_vault.expect("fee_vault is not set"),

            seller: self.instruction.seller.expect("seller is not set"),

            bid_state: self.instruction.bid_state.expect("bid_state is not set"),

            owner: self.instruction.owner.expect("owner is not set"),

            taker_broker: self.instruction.taker_broker,

            maker_broker: self.instruction.maker_broker,

            margin_account: self
                .instruction
                .margin_account
                .expect("margin_account is not set"),

            whitelist: self.instruction.whitelist.expect("whitelist is not set"),

            seller_ta: self.instruction.seller_ta.expect("seller_ta is not set"),

            mint: self.instruction.mint.expect("mint is not set"),

            owner_ta: self.instruction.owner_ta.expect("owner_ta is not set"),

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

            escrow_program: self
                .instruction
                .escrow_program
                .expect("escrow_program is not set"),

            cosigner: self.instruction.cosigner,

            mint_proof: self.instruction.mint_proof.expect("mint_proof is not set"),

            rent_destination: self
                .instruction
                .rent_destination
                .expect("rent_destination is not set"),
            __args: args,
        };
        instruction.invoke_signed_with_remaining_accounts(
            signers_seeds,
            &self.instruction.__remaining_accounts,
        )
    }
}

#[derive(Clone, Debug)]
struct TakeBidT22CpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    fee_vault: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    seller: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    bid_state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    margin_account: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    whitelist: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    seller_ta: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mint: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner_ta: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    associated_token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    marketplace_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    escrow_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    cosigner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mint_proof: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    rent_destination: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    min_amount: Option<u64>,
    /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
    __remaining_accounts: Vec<(
        &'b solana_program::account_info::AccountInfo<'a>,
        bool,
        bool,
    )>,
}
