import { ProgramDerivedAddress } from '@solana/addresses';
import { ResolvedAccount, expectAddress } from '../generated';
import { findFeeVaultPda } from './pdas';

//---- Fee Vault resolvers

export const resolveFeeVaultPdaFromListState = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findFeeVaultPda({
      address: expectAddress(accounts.listState?.value),
    }),
  };
};

export const resolveFeeVaultPdaFromBidState = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findFeeVaultPda({
      address: expectAddress(accounts.bidState?.value),
    }),
  };
};
