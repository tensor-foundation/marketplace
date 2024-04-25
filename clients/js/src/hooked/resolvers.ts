import { ProgramDerivedAddress } from '@solana/addresses';
import { ResolvedAccount, expectAddress } from '../generated';
import {
  findAssociatedTokenAccountPda,
  findMasterEditionPda,
  findMetadataPda,
  findTokenRecordPda,
} from './pdas';
import { TokenStandard } from './types';

export const resolveMetadata = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findMetadataPda({
      mint: expectAddress(accounts.mint?.value),
    }),
  };
};

export const resolveEditionFromTokenStandard = async ({
  accounts,
  args,
}: {
  accounts: Record<string, ResolvedAccount>;
  args: { tokenStandard?: TokenStandard | undefined };
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return args.tokenStandard === TokenStandard.NonFungible ||
    args.tokenStandard === TokenStandard.ProgrammableNonFungible
    ? {
        value: await findMasterEditionPda({
          mint: expectAddress(accounts.mint?.value),
        }),
      }
    : { value: null };
};

export const resolveOwnerTokenRecordFromTokenStandard = async ({
  accounts,
  args,
}: {
  accounts: Record<string, ResolvedAccount>;
  args: { tokenStandard?: TokenStandard | undefined };
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return args.tokenStandard === TokenStandard.ProgrammableNonFungible ||
    args.tokenStandard === TokenStandard.ProgrammableNonFungibleEdition
    ? {
        value: await findTokenRecordPda({
          mint: expectAddress(accounts.mint?.value),
          token: expectAddress(accounts.ownerAta?.value),
        }),
      }
    : { value: null };
};

export const resolveListTokenRecordFromTokenStandard = async ({
  accounts,
  args,
}: {
  accounts: Record<string, ResolvedAccount>;
  args: { tokenStandard?: TokenStandard | undefined };
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return args.tokenStandard === TokenStandard.ProgrammableNonFungible ||
    args.tokenStandard === TokenStandard.ProgrammableNonFungibleEdition
    ? {
        value: await findTokenRecordPda({
          mint: expectAddress(accounts.mint?.value),
          token: expectAddress(accounts.listAta?.value),
        }),
      }
    : { value: null };
};

export const resolveBuyerTokenRecordFromTokenStandard = async ({
  accounts,
  args,
}: {
  accounts: Record<string, ResolvedAccount>;
  args: { tokenStandard?: TokenStandard | undefined };
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return args.tokenStandard === TokenStandard.ProgrammableNonFungible ||
    args.tokenStandard === TokenStandard.ProgrammableNonFungibleEdition
    ? {
        value: await findTokenRecordPda({
          mint: expectAddress(accounts.mint?.value),
          token: expectAddress(accounts.buyerAta?.value),
        }),
      }
    : { value: null };
};

export const resolveBuyerAta = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findAssociatedTokenAccountPda({
      owner: expectAddress(accounts.buyer?.value),
      mint: expectAddress(accounts.mint?.value),
      tokenProgram: expectAddress(accounts.tokenProgram?.value),
    }),
  };
};

export const resolveListAta = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findAssociatedTokenAccountPda({
      owner: expectAddress(accounts.listState?.value),
      mint: expectAddress(accounts.mint?.value),
      tokenProgram: expectAddress(accounts.tokenProgram?.value),
    }),
  };
};

export const resolveOwnerAta = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findAssociatedTokenAccountPda({
      owner: expectAddress(accounts.owner?.value),
      mint: expectAddress(accounts.mint?.value),
      tokenProgram: expectAddress(accounts.tokenProgram?.value),
    }),
  };
};
