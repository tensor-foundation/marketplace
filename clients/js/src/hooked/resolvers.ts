import {
  Address,
  ProgramDerivedAddress,
  ProgramDerivedAddressBump,
} from '@solana/addresses';
import {
  ResolvedAccount,
  expectAddress,
  isTransactionSigner,
} from '../generated';
import {
  findAssociatedTokenAccountPda,
  findExtraAccountMetasPda,
  findMasterEditionPda,
  findMetadataPda,
  findTokenRecordPda,
  findTreeAuthorityPda,
  findWnsApprovePda,
  findWnsDistributionPda,
} from './pdas';
import { TokenStandard } from './types';
import { IAccountMeta } from '@solana/instructions';
import { TransactionSigner } from '@solana/signers';

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

export const resolveTreeAuthorityPda = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findTreeAuthorityPda(
      {
        merkleTree: expectAddress(accounts.merkleTree?.value),
      },
      { programAddress: expectAddress(accounts.bubblegumProgram?.value) }
    ),
  };
};

// satisfy linter
type ArgsWithOptionalCreatorsField = {
  creators?: [Address, number][] | undefined;
  [key: string]: unknown;
};
type ArgsWithOptionalProofAndCanopyDepth = {
  proof?: Address[] | undefined;
  canopyDepth?: number | undefined;
  [key: string]: unknown;
};

export const resolveCreatorPath = ({
  args,
}: {
  programAddress: Address;
  accounts: Record<string, ResolvedAccount>;
  args: ArgsWithOptionalCreatorsField;
}): IAccountMeta[] => {
  const creators = args.creators ?? [];
  return creators.map(([address, share]: [Address, number]) => ({
    address,
    role: +(share > 0),
  }));
};

export const resolveProofPath = ({
  args,
}: {
  programAddress: Address;
  accounts: Record<string, ResolvedAccount>;
  args: ArgsWithOptionalProofAndCanopyDepth;
}): IAccountMeta[] => {
  const proof = args.proof ?? [];
  const canopyDepth = args.canopyDepth ?? 0;
  return proof.slice(0, proof.length - canopyDepth).map((address: Address) => ({
    address,
    role: 0,
  }));
};

export const resolveRemainingSignerWithOwnerOrDelegate = ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): {
  value:
    | Address
    | readonly [Address<string>, ProgramDerivedAddressBump]
    | TransactionSigner
    | null;
} => {
  if (!accounts.owner.value || isTransactionSigner(accounts.owner.value)) {
    return {
      value: accounts.owner.value,
    };
  }
  if (!accounts.delegate.value || isTransactionSigner(accounts.delegate.value))
    return {
      value: accounts.delegate.value,
    };
  throw new Error(
    'Either owner or delegate has to be provided as TransactionSigner.'
  );
};

export const resolveRemainingSignerWithSellerOrDelegate = ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): {
  value:
    | Address
    | readonly [Address<string>, ProgramDerivedAddressBump]
    | TransactionSigner
    | null;
} => {
  if (!accounts.seller.value || isTransactionSigner(accounts.seller.value)) {
    return {
      value: accounts.seller.value,
    };
  }
  if (!accounts.delegate.value || isTransactionSigner(accounts.delegate.value))
    return {
      value: accounts.delegate.value,
    };
  throw new Error(
    'Either seller or delegate has to be provided as TransactionSigner.'
  );
};
