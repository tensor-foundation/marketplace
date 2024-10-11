use crate::*;

// (!) DONT USE UNDERSCORES (3_000) OR WONT BE ABLE TO READ JS-SIDE
#[constant]
pub const CURRENT_TCOMP_VERSION: u8 = 1;
#[constant]
pub const MAX_EXPIRY_SEC: i64 = 31536000; // Max 365 days (can't be too short o/w liquidity disappears too early)

pub const BID_STATE_DISCRIMINATOR: [u8; 8] = [155, 197, 5, 97, 189, 60, 8, 183];
pub const LIST_STATE_DISCRIMINATOR: [u8; 8] = [78, 242, 89, 138, 161, 221, 176, 75];
pub const DISCRIMINATOR_SIZE: usize = 8;

//(!!) sync with sdk.ts:getRentPayer()
#[inline(always)]
fn get_rent_payer(rent_payer: Pubkey, owner: Pubkey) -> Pubkey {
    if rent_payer != Pubkey::default() {
        rent_payer
    } else {
        owner
    }
}

// --------------------------------------- listing

#[account]
#[derive(InitSpace)]
pub struct ListState {
    pub version: u8,
    pub bump: [u8; 1],
    // IDs
    pub owner: Pubkey,
    pub asset_id: Pubkey,
    // Amount
    pub amount: u64,
    pub currency: Option<Pubkey>,
    // Extras
    pub expiry: i64,
    pub private_taker: Option<Pubkey>,
    pub maker_broker: Option<Pubkey>,
    /// Owner is the rent payer when this is None.
    /// Default Pubkey represents a None value.
    pub rent_payer: Pubkey,
    /// Cosigner
    /// Default Pubkey represents a None value.
    pub cosigner: Pubkey,
    pub _reserved1: [u8; 64],
}

impl ListState {
    pub const SIZE: usize = DISCRIMINATOR_SIZE + Self::INIT_SPACE;

    pub fn seeds(&self) -> [&[u8]; 3] {
        [b"list_state".as_ref(), self.asset_id.as_ref(), &self.bump]
    }
    pub fn get_rent_payer(&self) -> Pubkey {
        get_rent_payer(self.rent_payer, self.owner)
    }
}

// Dummy account
#[account]
pub struct AssetListState {}

// --------------------------------------- bidding

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, InitSpace, PartialEq, Eq)]
pub enum Target {
    AssetId = 0,
    Whitelist = 1,
}

#[repr(u8)]
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, InitSpace, PartialEq, Eq)]
pub enum Field {
    Name = 0,
}

#[account]
#[derive(InitSpace)]
pub struct BidState {
    pub version: u8,
    pub bump: [u8; 1],
    // IDs
    pub owner: Pubkey,
    /// Randomly picked pubkey used in bid seeds. To avoid dangling bids can use assetId here.
    pub bid_id: Pubkey,
    // Obviously would be better to use an enum-tuple / enum-struct but anchor doesn't serialize them
    pub target: Target,
    pub target_id: Pubkey,
    // In addition to target can bid on a subset of the collection by choosing a field in the struct
    pub field: Option<Field>,
    pub field_id: Option<Pubkey>,
    pub quantity: u32,
    pub filled_quantity: u32,
    // Amount
    pub amount: u64,
    pub currency: Option<Pubkey>,
    // Extras
    pub expiry: i64,
    pub private_taker: Option<Pubkey>,
    pub maker_broker: Option<Pubkey>,
    pub margin: Option<Pubkey>,
    pub updated_at: i64,

    /// Cosigner
    /// Default Pubkey represents a None value.
    pub cosigner: Pubkey,
    /// Owner is the rent payer when this is None.
    /// Default Pubkey represents a None value.
    pub rent_payer: Pubkey,

    //borsh not implemented for u8;56
    pub _reserved: [u8; 8],
    pub _reserved1: [u8; 16],
    pub _reserved2: [u8; 32],
}

impl BidState {
    pub const SIZE: usize = DISCRIMINATOR_SIZE + Self::INIT_SPACE;

    pub fn can_buy_more(&self) -> bool {
        self.filled_quantity < self.quantity
    }

    // Subtract 1 assuming it's being taken
    pub fn quantity_left(&self) -> Result<u32> {
        let left = unwrap_int!(self.quantity.checked_sub(self.filled_quantity));
        Ok(left)
    }

    pub fn incr_filled_quantity(&mut self) -> Result<()> {
        self.filled_quantity = unwrap_int!(self.filled_quantity.checked_add(1));
        Ok(())
    }

    pub fn seeds(&self) -> [&[u8]; 4] {
        [
            b"bid_state".as_ref(),
            self.owner.as_ref(),
            self.bid_id.as_ref(),
            &self.bump,
        ]
    }

    pub fn get_rent_payer(&self) -> Pubkey {
        get_rent_payer(self.rent_payer, self.owner)
    }

    /// Bid account balance after rent is deducted. Not associated with margin account balance
    pub fn bid_balance(bid_state: &Account<BidState>) -> Result<u64> {
        let info: &AccountInfo = bid_state.as_ref();
        let bid_rent = Rent::get()?.minimum_balance(info.data_len());
        let bid_balance = unwrap_int!(info.lamports().checked_sub(bid_rent));
        Ok(bid_balance)
    }
    /// Verify the bid account balance is empty, so that exact rent can be returned to the rent payer
    pub fn verify_empty_balance(bid_state: &Account<BidState>) -> Result<()> {
        let info: &AccountInfo = bid_state.as_ref();
        let bid_rent = Rent::get()?.minimum_balance(info.data_len());
        require!(
            info.try_lamports()? == bid_rent,
            TcompError::BidBalanceNotEmptied
        );
        Ok(())
    }
}

// Dummy account to allow generating findPda client function.
#[account]
pub struct BidTa {}
