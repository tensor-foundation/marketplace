use crate::{
    accounts::ListState,
    types::{Field, Target},
};
use solana_program::pubkey::Pubkey;
use std::fmt::{self, Display, Formatter};

impl ListState {
    pub fn get_rent_payer(&self) -> Pubkey {
        if let Some(rent_payer) = self.rent_payer.to_option() {
            rent_payer
        } else {
            self.owner
        }
    }
}

impl Display for Target {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            Target::AssetId => write!(f, "AssetId"),
            Target::Whitelist => write!(f, "Whitelist"),
        }
    }
}

impl Display for Field {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            Field::Name => write!(f, "Name"),
        }
    }
}
