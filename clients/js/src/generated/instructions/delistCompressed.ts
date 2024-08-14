/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU32Decoder,
  getU32Encoder,
  getU64Decoder,
  getU64Encoder,
  transformEncoder,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
  type IAccountMeta,
  type IAccountSignerMeta,
  type IInstruction,
  type IInstructionWithAccounts,
  type IInstructionWithData,
  type ReadonlyAccount,
  type ReadonlySignerAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
} from '@solana/web3.js';
import { resolveProofPath, resolveTreeAuthorityPda } from '../../hooked';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  expectSome,
  expectTransactionSigner,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export type DelistCompressedInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountMerkleTree extends string | IAccountMeta<string> = string,
  TAccountLogWrapper extends
    | string
    | IAccountMeta<string> = 'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV',
  TAccountCompressionProgram extends
    | string
    | IAccountMeta<string> = 'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK',
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountBubblegumProgram extends
    | string
    | IAccountMeta<string> = 'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY',
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTreeAuthority extends string
        ? ReadonlyAccount<TAccountTreeAuthority>
        : TAccountTreeAuthority,
      TAccountMerkleTree extends string
        ? WritableAccount<TAccountMerkleTree>
        : TAccountMerkleTree,
      TAccountLogWrapper extends string
        ? ReadonlyAccount<TAccountLogWrapper>
        : TAccountLogWrapper,
      TAccountCompressionProgram extends string
        ? ReadonlyAccount<TAccountCompressionProgram>
        : TAccountCompressionProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountBubblegumProgram extends string
        ? ReadonlyAccount<TAccountBubblegumProgram>
        : TAccountBubblegumProgram,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountOwner extends string
        ? ReadonlyAccount<TAccountOwner>
        : TAccountOwner,
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      ...TRemainingAccounts,
    ]
  >;

export type DelistCompressedInstructionData = {
  discriminator: ReadonlyUint8Array;
  nonce: bigint;
  index: number;
  root: ReadonlyUint8Array;
  dataHash: ReadonlyUint8Array;
  creatorHash: ReadonlyUint8Array;
};

export type DelistCompressedInstructionDataArgs = {
  nonce: number | bigint;
  index: number;
  root: ReadonlyUint8Array;
  dataHash: ReadonlyUint8Array;
  creatorHash: ReadonlyUint8Array;
};

export function getDelistCompressedInstructionDataEncoder(): Encoder<DelistCompressedInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['nonce', getU64Encoder()],
      ['index', getU32Encoder()],
      ['root', fixEncoderSize(getBytesEncoder(), 32)],
      ['dataHash', fixEncoderSize(getBytesEncoder(), 32)],
      ['creatorHash', fixEncoderSize(getBytesEncoder(), 32)],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([55, 136, 205, 107, 107, 173, 4, 31]),
    })
  );
}

export function getDelistCompressedInstructionDataDecoder(): Decoder<DelistCompressedInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['nonce', getU64Decoder()],
    ['index', getU32Decoder()],
    ['root', fixDecoderSize(getBytesDecoder(), 32)],
    ['dataHash', fixDecoderSize(getBytesDecoder(), 32)],
    ['creatorHash', fixDecoderSize(getBytesDecoder(), 32)],
  ]);
}

export function getDelistCompressedInstructionDataCodec(): Codec<
  DelistCompressedInstructionDataArgs,
  DelistCompressedInstructionData
> {
  return combineCodec(
    getDelistCompressedInstructionDataEncoder(),
    getDelistCompressedInstructionDataDecoder()
  );
}

export type DelistCompressedInstructionExtraArgs = {
  /** proof path, can be shortened if canopyDepth of merkle tree is also specified */
  proof?: Array<Address>;
  /** canopy depth of merkle tree, reduces proofPath length if specified */
  canopyDepth?: number;
};

export type DelistCompressedAsyncInput<
  TAccountTreeAuthority extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountListState extends string = string,
  TAccountOwner extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountRentDestination extends string = string,
> = {
  treeAuthority?: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper?: Address<TAccountLogWrapper>;
  compressionProgram?: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram?: Address<TAccountBubblegumProgram>;
  listState: Address<TAccountListState>;
  owner: Address<TAccountOwner> | TransactionSigner<TAccountOwner>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  rentDestination?: Address<TAccountRentDestination>;
  nonce?: DelistCompressedInstructionDataArgs['nonce'];
  index: DelistCompressedInstructionDataArgs['index'];
  root: DelistCompressedInstructionDataArgs['root'];
  dataHash: DelistCompressedInstructionDataArgs['dataHash'];
  creatorHash: DelistCompressedInstructionDataArgs['creatorHash'];
  proof?: DelistCompressedInstructionExtraArgs['proof'];
  canopyDepth?: DelistCompressedInstructionExtraArgs['canopyDepth'];
};

export async function getDelistCompressedInstructionAsync<
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountMarketplaceProgram extends string,
  TAccountRentDestination extends string,
>(
  input: DelistCompressedAsyncInput<
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountListState,
    TAccountOwner,
    TAccountMarketplaceProgram,
    TAccountRentDestination
  >
): Promise<
  DelistCompressedInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountListState,
    (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
      ? ReadonlySignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
      : TAccountOwner,
    TAccountMarketplaceProgram,
    TAccountRentDestination
  >
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    treeAuthority: { value: input.treeAuthority ?? null, isWritable: false },
    merkleTree: { value: input.merkleTree ?? null, isWritable: true },
    logWrapper: { value: input.logWrapper ?? null, isWritable: false },
    compressionProgram: {
      value: input.compressionProgram ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    bubblegumProgram: {
      value: input.bubblegumProgram ?? null,
      isWritable: false,
    },
    listState: { value: input.listState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: false },
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolver scope.
  const resolverScope = { programAddress, accounts, args };

  // Resolve default values.
  if (!accounts.bubblegumProgram.value) {
    accounts.bubblegumProgram.value =
      'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY' as Address<'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY'>;
  }
  if (!accounts.treeAuthority.value) {
    accounts.treeAuthority = {
      ...accounts.treeAuthority,
      ...(await resolveTreeAuthorityPda(resolverScope)),
    };
  }
  if (!accounts.logWrapper.value) {
    accounts.logWrapper.value =
      'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV' as Address<'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV'>;
  }
  if (!accounts.compressionProgram.value) {
    accounts.compressionProgram.value =
      'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK' as Address<'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectTransactionSigner(
      accounts.owner.value
    ).address;
  }
  if (!args.nonce) {
    args.nonce = expectSome(args.index);
  }
  if (!args.proof) {
    args.proof = [];
  }
  if (!args.canopyDepth) {
    args.canopyDepth = 0;
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = resolveProofPath(resolverScope);

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.treeAuthority),
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.rentDestination),
      ...remainingAccounts,
    ],
    programAddress,
    data: getDelistCompressedInstructionDataEncoder().encode(
      args as DelistCompressedInstructionDataArgs
    ),
  } as DelistCompressedInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountListState,
    (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
      ? ReadonlySignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
      : TAccountOwner,
    TAccountMarketplaceProgram,
    TAccountRentDestination
  >;

  return instruction;
}

export type DelistCompressedInput<
  TAccountTreeAuthority extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountListState extends string = string,
  TAccountOwner extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountRentDestination extends string = string,
> = {
  treeAuthority: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper?: Address<TAccountLogWrapper>;
  compressionProgram?: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram?: Address<TAccountBubblegumProgram>;
  listState: Address<TAccountListState>;
  owner: Address<TAccountOwner> | TransactionSigner<TAccountOwner>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  rentDestination?: Address<TAccountRentDestination>;
  nonce?: DelistCompressedInstructionDataArgs['nonce'];
  index: DelistCompressedInstructionDataArgs['index'];
  root: DelistCompressedInstructionDataArgs['root'];
  dataHash: DelistCompressedInstructionDataArgs['dataHash'];
  creatorHash: DelistCompressedInstructionDataArgs['creatorHash'];
  proof?: DelistCompressedInstructionExtraArgs['proof'];
  canopyDepth?: DelistCompressedInstructionExtraArgs['canopyDepth'];
};

export function getDelistCompressedInstruction<
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountMarketplaceProgram extends string,
  TAccountRentDestination extends string,
>(
  input: DelistCompressedInput<
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountListState,
    TAccountOwner,
    TAccountMarketplaceProgram,
    TAccountRentDestination
  >
): DelistCompressedInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountTreeAuthority,
  TAccountMerkleTree,
  TAccountLogWrapper,
  TAccountCompressionProgram,
  TAccountSystemProgram,
  TAccountBubblegumProgram,
  TAccountListState,
  (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
    ? ReadonlySignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
    : TAccountOwner,
  TAccountMarketplaceProgram,
  TAccountRentDestination
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    treeAuthority: { value: input.treeAuthority ?? null, isWritable: false },
    merkleTree: { value: input.merkleTree ?? null, isWritable: true },
    logWrapper: { value: input.logWrapper ?? null, isWritable: false },
    compressionProgram: {
      value: input.compressionProgram ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    bubblegumProgram: {
      value: input.bubblegumProgram ?? null,
      isWritable: false,
    },
    listState: { value: input.listState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: false },
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolver scope.
  const resolverScope = { programAddress, accounts, args };

  // Resolve default values.
  if (!accounts.bubblegumProgram.value) {
    accounts.bubblegumProgram.value =
      'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY' as Address<'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY'>;
  }
  if (!accounts.logWrapper.value) {
    accounts.logWrapper.value =
      'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV' as Address<'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV'>;
  }
  if (!accounts.compressionProgram.value) {
    accounts.compressionProgram.value =
      'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK' as Address<'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectTransactionSigner(
      accounts.owner.value
    ).address;
  }
  if (!args.nonce) {
    args.nonce = expectSome(args.index);
  }
  if (!args.proof) {
    args.proof = [];
  }
  if (!args.canopyDepth) {
    args.canopyDepth = 0;
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = resolveProofPath(resolverScope);

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.treeAuthority),
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.rentDestination),
      ...remainingAccounts,
    ],
    programAddress,
    data: getDelistCompressedInstructionDataEncoder().encode(
      args as DelistCompressedInstructionDataArgs
    ),
  } as DelistCompressedInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountListState,
    (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
      ? ReadonlySignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
      : TAccountOwner,
    TAccountMarketplaceProgram,
    TAccountRentDestination
  >;

  return instruction;
}

export type ParsedDelistCompressedInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    treeAuthority: TAccountMetas[0];
    merkleTree: TAccountMetas[1];
    logWrapper: TAccountMetas[2];
    compressionProgram: TAccountMetas[3];
    systemProgram: TAccountMetas[4];
    bubblegumProgram: TAccountMetas[5];
    listState: TAccountMetas[6];
    owner: TAccountMetas[7];
    marketplaceProgram: TAccountMetas[8];
    rentDestination: TAccountMetas[9];
  };
  data: DelistCompressedInstructionData;
};

export function parseDelistCompressedInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedDelistCompressedInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 10) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      treeAuthority: getNextAccount(),
      merkleTree: getNextAccount(),
      logWrapper: getNextAccount(),
      compressionProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      bubblegumProgram: getNextAccount(),
      listState: getNextAccount(),
      owner: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      rentDestination: getNextAccount(),
    },
    data: getDelistCompressedInstructionDataDecoder().decode(instruction.data),
  };
}
