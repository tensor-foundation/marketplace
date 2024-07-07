import {
  Address,
  IAccountMeta,
  ProgramDerivedAddress,
  ProgramDerivedAddressBump,
  TransactionSigner,
} from '@solana/web3.js';
import { findBidTaPda } from '../generated';
import {
  ResolvedAccount,
  expectAddress,
  isTransactionSigner,
} from '../generated/shared';
import { findFeeVaultPda, findTreeAuthorityPda } from './pdas';

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
  creators?: (readonly [Address, number])[] | undefined;
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
  args: ArgsWithOptionalCreatorsField;
}): IAccountMeta[] => {
  const creators = args.creators ?? [];
  return creators.map(([creator, share]) => ({
    address: creator,
    role: +(share > 0),
  }));
};

export const resolveProofPath = ({
  args,
}: {
  args: ArgsWithOptionalProofAndCanopyDepth;
}): IAccountMeta[] => {
  const proof = args.proof ?? [];
  const canopyDepth = args.canopyDepth ?? 0;
  return proof.slice(0, proof.length - canopyDepth).map((proof: Address) => ({
    address: proof,
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
  if (!!accounts.owner.value && isTransactionSigner(accounts.owner.value)) {
    return {
      value: accounts.owner.value,
    };
  }
  if (!!accounts.delegate.value && isTransactionSigner(accounts.delegate.value))
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
  if (!!accounts.seller.value && isTransactionSigner(accounts.seller.value)) {
    return {
      value: accounts.seller.value,
    };
  }
  if (!!accounts.delegate.value && isTransactionSigner(accounts.delegate.value))
    return {
      value: accounts.delegate.value,
    };
  throw new Error(
    'Either seller or delegate has to be provided as TransactionSigner.'
  );
};

export const resolveBidTa = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findBidTaPda({
      mint: expectAddress(accounts.mint?.value),
    }),
  };
};
