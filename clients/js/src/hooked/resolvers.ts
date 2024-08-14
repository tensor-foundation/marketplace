import {
  Address,
  IAccountMeta,
  ProgramDerivedAddress,
  ProgramDerivedAddressBump,
  TransactionSigner,
  generateKeyPair,
  getAddressFromPublicKey,
} from '@solana/web3.js';
import { findAssociatedTokenAccountPda } from '@tensor-foundation/resolvers';
import { Target, findBidTaPda } from '../generated';
import {
  ResolvedAccount,
  expectAddress,
  expectSome,
  isTransactionSigner,
} from '../generated/shared';
import { findFeeVaultPda, findTreeAuthorityPda } from './pdas';

export const resolveBidIdOnCreate = async ({
  args,
}: {
  programAddress: Address;
  accounts: Record<string, ResolvedAccount>;
  args: { target?: Target; targetId?: Address };
}): Promise<Address> => {
  if (expectSome(args.target) === Target.AssetId)
    return await Promise.resolve(expectAddress(args.targetId));
  return await getAddressFromPublicKey((await generateKeyPair()).publicKey);
};

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

export const resolveFeeVaultCurrencyAta = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findAssociatedTokenAccountPda({
      owner: expectAddress(accounts.feeVault?.value),
      mint: expectAddress(accounts.currency?.value),
      tokenProgram: expectAddress(accounts.currencyTokenProgram?.value),
    }),
  };
};

export const resolveOwnerCurrencyAta = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findAssociatedTokenAccountPda({
      owner: expectAddress(accounts.owner?.value),
      mint: expectAddress(accounts.currency?.value),
      tokenProgram: expectAddress(accounts.currencyTokenProgram?.value),
    }),
  };
};

export const resolvePayerCurrencyAta = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findAssociatedTokenAccountPda({
      owner: expectAddress(accounts.payer?.value),
      mint: expectAddress(accounts.currency?.value),
      tokenProgram: expectAddress(accounts.currencyTokenProgram?.value),
    }),
  };
};

export const resolveDistributionCurrencyAta = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  return {
    value: await findAssociatedTokenAccountPda({
      owner: expectAddress(accounts.distribution?.value),
      mint: expectAddress(accounts.currency?.value),
      tokenProgram: expectAddress(accounts.currencyTokenProgram?.value),
    }),
  };
};

export const resolveMakerBrokerCurrencyAta = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  if (!accounts.makerBroker.value) {
    return { value: null };
  }
  return {
    value: await findAssociatedTokenAccountPda({
      owner: expectAddress(accounts.makerBroker?.value),
      mint: expectAddress(accounts.currency?.value),
      tokenProgram: expectAddress(accounts.currencyTokenProgram?.value),
    }),
  };
};

export const resolveTakerBrokerCurrencyAta = async ({
  accounts,
}: {
  accounts: Record<string, ResolvedAccount>;
}): Promise<Partial<{ value: ProgramDerivedAddress | null }>> => {
  if (!accounts.takerBroker.value) {
    return { value: null };
  }
  return {
    value: await findAssociatedTokenAccountPda({
      owner: expectAddress(accounts.takerBroker?.value),
      mint: expectAddress(accounts.currency?.value),
      tokenProgram: expectAddress(accounts.currencyTokenProgram?.value),
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
