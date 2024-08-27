use crate::accounts::ListState;
use solana_program::pubkey::Pubkey;

impl ListState {
    pub fn get_rent_payer(&self) -> Pubkey {
        if let Some(rent_payer) = self.rent_payer.to_option() {
            rent_payer
        } else {
            self.owner
        }
    }
}
