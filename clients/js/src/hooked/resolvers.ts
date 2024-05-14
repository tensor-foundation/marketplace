import { Address, ProgramDerivedAddress } from '@solana/addresses';
import { ResolvedAccount, expectAddress } from '../generated';
import {
  findAssociatedTokenAccountPda,
  findExtraAccountMetasPda,
  findMasterEditionPda,
  findMetadataPda,
  findTokenRecordPda,
  findWnsApprovePda,
  findWnsDistributionPda,
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

export const resolveSellerTokenRecordFromTokenStandard = async ({
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

export const resolveEscrowTokenRecordFromTokenStandard = async ({
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
          token: expectAddress(accounts.escrowAta?.value),
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

export const resolveSellerAta = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findAssociatedTokenAccountPda({
      owner: expectAddress(accounts.seller?.value),
      mint: expectAddress(accounts.mint?.value),
      tokenProgram: expectAddress(accounts.tokenProgram?.value),
    }),
  };
};

export const resolveEscrowAta = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findAssociatedTokenAccountPda({
      owner: expectAddress(accounts.bidState?.value),
      mint: expectAddress(accounts.mint?.value),
      tokenProgram: expectAddress(accounts.tokenProgram?.value),
    }),
  };
};

export const resolveWnsApprovePda = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findWnsApprovePda({
      mint: expectAddress(accounts.mint?.value),
    }),
  };
};

export const resolveWnsDistributionPda = async ({
  args,
}: {
  args: { collection: Address; paymentMint?: Address | null };
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findWnsDistributionPda({
      collection: expectAddress(args.collection),
      paymentMint: args.paymentMint,
    }),
  };
};

export const resolveWnsExtraAccountMetasPda = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findExtraAccountMetasPda(
      {
        mint: expectAddress(accounts.mint?.value),
      },
      { programAddress: expectAddress(accounts.wnsProgram?.value) }
    ),
  };
};
