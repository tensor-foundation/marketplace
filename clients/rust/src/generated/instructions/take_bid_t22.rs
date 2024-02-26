//! This code was AUTOGENERATED using the kinobi library.
//! Please DO NOT EDIT THIS FILE, instead use visitors
//! to add features, then rerun kinobi to update it.
//!
//! [https://github.com/metaplex-foundation/kinobi]
//!

use borsh::BorshDeserialize;
use borsh::BorshSerialize;

/// Accounts.
pub struct TakeBidT22 {
    pub tcomp: solana_program::pubkey::Pubkey,

    pub seller: solana_program::pubkey::Pubkey,

    pub bid_state: solana_program::pubkey::Pubkey,

    pub owner: solana_program::pubkey::Pubkey,

    pub taker_broker: Option<solana_program::pubkey::Pubkey>,

    pub maker_broker: Option<solana_program::pubkey::Pubkey>,

    pub margin_account: solana_program::pubkey::Pubkey,

    pub whitelist: solana_program::pubkey::Pubkey,

    pub nft_seller_acc: solana_program::pubkey::Pubkey,

    pub nft_mint: solana_program::pubkey::Pubkey,

    pub owner_ata_acc: solana_program::pubkey::Pubkey,

    pub token_program: solana_program::pubkey::Pubkey,

    pub associated_token_program: solana_program::pubkey::Pubkey,

    pub system_program: solana_program::pubkey::Pubkey,

    pub tcomp_program: solana_program::pubkey::Pubkey,

    pub tensorswap_program: solana_program::pubkey::Pubkey,

    pub cosigner: solana_program::pubkey::Pubkey,
    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    pub mint_proof: solana_program::pubkey::Pubkey,

    pub rent_dest: solana_program::pubkey::Pubkey,
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
            self.tcomp, false,
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
            self.nft_seller_acc,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.nft_mint,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.owner_ata_acc,
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
            self.tcomp_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.tensorswap_program,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.cosigner,
            true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            self.mint_proof,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            self.rent_dest,
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
struct TakeBidT22InstructionData {
    discriminator: [u8; 8],
}

impl TakeBidT22InstructionData {
    fn new() -> Self {
        Self {
            discriminator: [18, 250, 113, 242, 31, 244, 19, 150],
        }
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
///   0. `[writable]` tcomp
///   1. `[writable, signer]` seller
///   2. `[writable]` bid_state
///   3. `[writable]` owner
///   4. `[writable, optional]` taker_broker
///   5. `[writable, optional]` maker_broker
///   6. `[writable]` margin_account
///   7. `[]` whitelist
///   8. `[writable]` nft_seller_acc
///   9. `[]` nft_mint
///   10. `[writable]` owner_ata_acc
///   11. `[optional]` token_program (default to `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
///   12. `[]` associated_token_program
///   13. `[optional]` system_program (default to `11111111111111111111111111111111`)
///   14. `[]` tcomp_program
///   15. `[]` tensorswap_program
///   16. `[signer]` cosigner
///   17. `[]` mint_proof
///   18. `[writable, optional]` rent_dest (default to `SysvarRent111111111111111111111111111111111`)
#[derive(Default)]
pub struct TakeBidT22Builder {
    tcomp: Option<solana_program::pubkey::Pubkey>,
    seller: Option<solana_program::pubkey::Pubkey>,
    bid_state: Option<solana_program::pubkey::Pubkey>,
    owner: Option<solana_program::pubkey::Pubkey>,
    taker_broker: Option<solana_program::pubkey::Pubkey>,
    maker_broker: Option<solana_program::pubkey::Pubkey>,
    margin_account: Option<solana_program::pubkey::Pubkey>,
    whitelist: Option<solana_program::pubkey::Pubkey>,
    nft_seller_acc: Option<solana_program::pubkey::Pubkey>,
    nft_mint: Option<solana_program::pubkey::Pubkey>,
    owner_ata_acc: Option<solana_program::pubkey::Pubkey>,
    token_program: Option<solana_program::pubkey::Pubkey>,
    associated_token_program: Option<solana_program::pubkey::Pubkey>,
    system_program: Option<solana_program::pubkey::Pubkey>,
    tcomp_program: Option<solana_program::pubkey::Pubkey>,
    tensorswap_program: Option<solana_program::pubkey::Pubkey>,
    cosigner: Option<solana_program::pubkey::Pubkey>,
    mint_proof: Option<solana_program::pubkey::Pubkey>,
    rent_dest: Option<solana_program::pubkey::Pubkey>,
    min_amount: Option<u64>,
    __remaining_accounts: Vec<solana_program::instruction::AccountMeta>,
}

impl TakeBidT22Builder {
    pub fn new() -> Self {
        Self::default()
    }
    #[inline(always)]
    pub fn tcomp(&mut self, tcomp: solana_program::pubkey::Pubkey) -> &mut Self {
        self.tcomp = Some(tcomp);
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
    pub fn nft_seller_acc(&mut self, nft_seller_acc: solana_program::pubkey::Pubkey) -> &mut Self {
        self.nft_seller_acc = Some(nft_seller_acc);
        self
    }
    #[inline(always)]
    pub fn nft_mint(&mut self, nft_mint: solana_program::pubkey::Pubkey) -> &mut Self {
        self.nft_mint = Some(nft_mint);
        self
    }
    #[inline(always)]
    pub fn owner_ata_acc(&mut self, owner_ata_acc: solana_program::pubkey::Pubkey) -> &mut Self {
        self.owner_ata_acc = Some(owner_ata_acc);
        self
    }
    /// `[optional account, default to 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA']`
    #[inline(always)]
    pub fn token_program(&mut self, token_program: solana_program::pubkey::Pubkey) -> &mut Self {
        self.token_program = Some(token_program);
        self
    }
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
    #[inline(always)]
    pub fn tcomp_program(&mut self, tcomp_program: solana_program::pubkey::Pubkey) -> &mut Self {
        self.tcomp_program = Some(tcomp_program);
        self
    }
    #[inline(always)]
    pub fn tensorswap_program(
        &mut self,
        tensorswap_program: solana_program::pubkey::Pubkey,
    ) -> &mut Self {
        self.tensorswap_program = Some(tensorswap_program);
        self
    }
    #[inline(always)]
    pub fn cosigner(&mut self, cosigner: solana_program::pubkey::Pubkey) -> &mut Self {
        self.cosigner = Some(cosigner);
        self
    }
    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    #[inline(always)]
    pub fn mint_proof(&mut self, mint_proof: solana_program::pubkey::Pubkey) -> &mut Self {
        self.mint_proof = Some(mint_proof);
        self
    }
    /// `[optional account, default to 'SysvarRent111111111111111111111111111111111']`
    #[inline(always)]
    pub fn rent_dest(&mut self, rent_dest: solana_program::pubkey::Pubkey) -> &mut Self {
        self.rent_dest = Some(rent_dest);
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
            tcomp: self.tcomp.expect("tcomp is not set"),
            seller: self.seller.expect("seller is not set"),
            bid_state: self.bid_state.expect("bid_state is not set"),
            owner: self.owner.expect("owner is not set"),
            taker_broker: self.taker_broker,
            maker_broker: self.maker_broker,
            margin_account: self.margin_account.expect("margin_account is not set"),
            whitelist: self.whitelist.expect("whitelist is not set"),
            nft_seller_acc: self.nft_seller_acc.expect("nft_seller_acc is not set"),
            nft_mint: self.nft_mint.expect("nft_mint is not set"),
            owner_ata_acc: self.owner_ata_acc.expect("owner_ata_acc is not set"),
            token_program: self.token_program.unwrap_or(solana_program::pubkey!(
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            )),
            associated_token_program: self
                .associated_token_program
                .expect("associated_token_program is not set"),
            system_program: self
                .system_program
                .unwrap_or(solana_program::pubkey!("11111111111111111111111111111111")),
            tcomp_program: self.tcomp_program.expect("tcomp_program is not set"),
            tensorswap_program: self
                .tensorswap_program
                .expect("tensorswap_program is not set"),
            cosigner: self.cosigner.expect("cosigner is not set"),
            mint_proof: self.mint_proof.expect("mint_proof is not set"),
            rent_dest: self.rent_dest.unwrap_or(solana_program::pubkey!(
                "SysvarRent111111111111111111111111111111111"
            )),
        };
        let args = TakeBidT22InstructionArgs {
            min_amount: self.min_amount.clone().expect("min_amount is not set"),
        };

        accounts.instruction_with_remaining_accounts(args, &self.__remaining_accounts)
    }
}

/// `take_bid_t22` CPI accounts.
pub struct TakeBidT22CpiAccounts<'a, 'b> {
    pub tcomp: &'b solana_program::account_info::AccountInfo<'a>,

    pub seller: &'b solana_program::account_info::AccountInfo<'a>,

    pub bid_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub margin_account: &'b solana_program::account_info::AccountInfo<'a>,

    pub whitelist: &'b solana_program::account_info::AccountInfo<'a>,

    pub nft_seller_acc: &'b solana_program::account_info::AccountInfo<'a>,

    pub nft_mint: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner_ata_acc: &'b solana_program::account_info::AccountInfo<'a>,

    pub token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub tcomp_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub tensorswap_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub cosigner: &'b solana_program::account_info::AccountInfo<'a>,
    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    pub mint_proof: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_dest: &'b solana_program::account_info::AccountInfo<'a>,
}

/// `take_bid_t22` CPI instruction.
pub struct TakeBidT22Cpi<'a, 'b> {
    /// The program to invoke.
    pub __program: &'b solana_program::account_info::AccountInfo<'a>,

    pub tcomp: &'b solana_program::account_info::AccountInfo<'a>,

    pub seller: &'b solana_program::account_info::AccountInfo<'a>,

    pub bid_state: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner: &'b solana_program::account_info::AccountInfo<'a>,

    pub taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,

    pub margin_account: &'b solana_program::account_info::AccountInfo<'a>,

    pub whitelist: &'b solana_program::account_info::AccountInfo<'a>,

    pub nft_seller_acc: &'b solana_program::account_info::AccountInfo<'a>,

    pub nft_mint: &'b solana_program::account_info::AccountInfo<'a>,

    pub owner_ata_acc: &'b solana_program::account_info::AccountInfo<'a>,

    pub token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub associated_token_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub system_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub tcomp_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub tensorswap_program: &'b solana_program::account_info::AccountInfo<'a>,

    pub cosigner: &'b solana_program::account_info::AccountInfo<'a>,
    /// intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification
    pub mint_proof: &'b solana_program::account_info::AccountInfo<'a>,

    pub rent_dest: &'b solana_program::account_info::AccountInfo<'a>,
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
            tcomp: accounts.tcomp,
            seller: accounts.seller,
            bid_state: accounts.bid_state,
            owner: accounts.owner,
            taker_broker: accounts.taker_broker,
            maker_broker: accounts.maker_broker,
            margin_account: accounts.margin_account,
            whitelist: accounts.whitelist,
            nft_seller_acc: accounts.nft_seller_acc,
            nft_mint: accounts.nft_mint,
            owner_ata_acc: accounts.owner_ata_acc,
            token_program: accounts.token_program,
            associated_token_program: accounts.associated_token_program,
            system_program: accounts.system_program,
            tcomp_program: accounts.tcomp_program,
            tensorswap_program: accounts.tensorswap_program,
            cosigner: accounts.cosigner,
            mint_proof: accounts.mint_proof,
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
        let mut accounts = Vec::with_capacity(19 + remaining_accounts.len());
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.tcomp.key,
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
            *self.nft_seller_acc.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.nft_mint.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new(
            *self.owner_ata_acc.key,
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
            *self.tcomp_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.tensorswap_program.key,
            false,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.cosigner.key,
            true,
        ));
        accounts.push(solana_program::instruction::AccountMeta::new_readonly(
            *self.mint_proof.key,
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
        account_infos.push(self.tcomp.clone());
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
        account_infos.push(self.nft_seller_acc.clone());
        account_infos.push(self.nft_mint.clone());
        account_infos.push(self.owner_ata_acc.clone());
        account_infos.push(self.token_program.clone());
        account_infos.push(self.associated_token_program.clone());
        account_infos.push(self.system_program.clone());
        account_infos.push(self.tcomp_program.clone());
        account_infos.push(self.tensorswap_program.clone());
        account_infos.push(self.cosigner.clone());
        account_infos.push(self.mint_proof.clone());
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

/// Instruction builder for `TakeBidT22` via CPI.
///
/// ### Accounts:
///
///   0. `[writable]` tcomp
///   1. `[writable, signer]` seller
///   2. `[writable]` bid_state
///   3. `[writable]` owner
///   4. `[writable, optional]` taker_broker
///   5. `[writable, optional]` maker_broker
///   6. `[writable]` margin_account
///   7. `[]` whitelist
///   8. `[writable]` nft_seller_acc
///   9. `[]` nft_mint
///   10. `[writable]` owner_ata_acc
///   11. `[]` token_program
///   12. `[]` associated_token_program
///   13. `[]` system_program
///   14. `[]` tcomp_program
///   15. `[]` tensorswap_program
///   16. `[signer]` cosigner
///   17. `[]` mint_proof
///   18. `[writable]` rent_dest
pub struct TakeBidT22CpiBuilder<'a, 'b> {
    instruction: Box<TakeBidT22CpiBuilderInstruction<'a, 'b>>,
}

impl<'a, 'b> TakeBidT22CpiBuilder<'a, 'b> {
    pub fn new(program: &'b solana_program::account_info::AccountInfo<'a>) -> Self {
        let instruction = Box::new(TakeBidT22CpiBuilderInstruction {
            __program: program,
            tcomp: None,
            seller: None,
            bid_state: None,
            owner: None,
            taker_broker: None,
            maker_broker: None,
            margin_account: None,
            whitelist: None,
            nft_seller_acc: None,
            nft_mint: None,
            owner_ata_acc: None,
            token_program: None,
            associated_token_program: None,
            system_program: None,
            tcomp_program: None,
            tensorswap_program: None,
            cosigner: None,
            mint_proof: None,
            rent_dest: None,
            min_amount: None,
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
    pub fn nft_seller_acc(
        &mut self,
        nft_seller_acc: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.nft_seller_acc = Some(nft_seller_acc);
        self
    }
    #[inline(always)]
    pub fn nft_mint(
        &mut self,
        nft_mint: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.nft_mint = Some(nft_mint);
        self
    }
    #[inline(always)]
    pub fn owner_ata_acc(
        &mut self,
        owner_ata_acc: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.owner_ata_acc = Some(owner_ata_acc);
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
    pub fn tcomp_program(
        &mut self,
        tcomp_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.tcomp_program = Some(tcomp_program);
        self
    }
    #[inline(always)]
    pub fn tensorswap_program(
        &mut self,
        tensorswap_program: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.tensorswap_program = Some(tensorswap_program);
        self
    }
    #[inline(always)]
    pub fn cosigner(
        &mut self,
        cosigner: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.cosigner = Some(cosigner);
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
    pub fn rent_dest(
        &mut self,
        rent_dest: &'b solana_program::account_info::AccountInfo<'a>,
    ) -> &mut Self {
        self.instruction.rent_dest = Some(rent_dest);
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

            tcomp: self.instruction.tcomp.expect("tcomp is not set"),

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

            nft_seller_acc: self
                .instruction
                .nft_seller_acc
                .expect("nft_seller_acc is not set"),

            nft_mint: self.instruction.nft_mint.expect("nft_mint is not set"),

            owner_ata_acc: self
                .instruction
                .owner_ata_acc
                .expect("owner_ata_acc is not set"),

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

            tcomp_program: self
                .instruction
                .tcomp_program
                .expect("tcomp_program is not set"),

            tensorswap_program: self
                .instruction
                .tensorswap_program
                .expect("tensorswap_program is not set"),

            cosigner: self.instruction.cosigner.expect("cosigner is not set"),

            mint_proof: self.instruction.mint_proof.expect("mint_proof is not set"),

            rent_dest: self.instruction.rent_dest.expect("rent_dest is not set"),
            __args: args,
        };
        instruction.invoke_signed_with_remaining_accounts(
            signers_seeds,
            &self.instruction.__remaining_accounts,
        )
    }
}

struct TakeBidT22CpiBuilderInstruction<'a, 'b> {
    __program: &'b solana_program::account_info::AccountInfo<'a>,
    tcomp: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    seller: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    bid_state: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    taker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    maker_broker: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    margin_account: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    whitelist: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    nft_seller_acc: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    nft_mint: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    owner_ata_acc: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    associated_token_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    system_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    tcomp_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    tensorswap_program: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    cosigner: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    mint_proof: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    rent_dest: Option<&'b solana_program::account_info::AccountInfo<'a>>,
    min_amount: Option<u64>,
    /// Additional instruction accounts `(AccountInfo, is_writable, is_signer)`.
    __remaining_accounts: Vec<(
        &'b solana_program::account_info::AccountInfo<'a>,
        bool,
        bool,
    )>,
}
