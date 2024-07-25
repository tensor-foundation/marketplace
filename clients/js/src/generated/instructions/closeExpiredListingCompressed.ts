/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Address,
  Codec,
  Decoder,
  Encoder,
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  ReadonlyUint8Array,
  WritableAccount,
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
} from '@solana/web3.js';
import {
  resolveCreatorPath,
  resolveProofPath,
  resolveTreeAuthorityPda,
} from '../../hooked';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, expectSome, getAccountMetaFactory } from '../shared';

export type CloseExpiredListingCompressedInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountMerkleTree extends string | IAccountMeta<string> = string,
  TAccountLogWrapper extends
    | string
    | IAccountMeta<string> = 'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV',
  TAccountCompressionProgram extends
    | string
    | IAccountMeta<string> = 'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK',
  TAccountBubblegumProgram extends
    | string
    | IAccountMeta<string> = 'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY',
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountOwner extends string
        ? ReadonlyAccount<TAccountOwner>
        : TAccountOwner,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
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
      TAccountBubblegumProgram extends string
        ? ReadonlyAccount<TAccountBubblegumProgram>
        : TAccountBubblegumProgram,
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      ...TRemainingAccounts,
    ]
  >;

export type CloseExpiredListingCompressedInstructionData = {
  discriminator: ReadonlyUint8Array;
  nonce: bigint;
  index: number;
  root: ReadonlyUint8Array;
  dataHash: ReadonlyUint8Array;
  creatorHash: ReadonlyUint8Array;
};

export type CloseExpiredListingCompressedInstructionDataArgs = {
  nonce: number | bigint;
  index: number;
  root: ReadonlyUint8Array;
  dataHash: ReadonlyUint8Array;
  creatorHash: ReadonlyUint8Array;
};

export function getCloseExpiredListingCompressedInstructionDataEncoder(): Encoder<CloseExpiredListingCompressedInstructionDataArgs> {
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
      discriminator: new Uint8Array([150, 70, 13, 135, 9, 204, 75, 4]),
    })
  );
}

export function getCloseExpiredListingCompressedInstructionDataDecoder(): Decoder<CloseExpiredListingCompressedInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['nonce', getU64Decoder()],
    ['index', getU32Decoder()],
    ['root', fixDecoderSize(getBytesDecoder(), 32)],
    ['dataHash', fixDecoderSize(getBytesDecoder(), 32)],
    ['creatorHash', fixDecoderSize(getBytesDecoder(), 32)],
  ]);
}

export function getCloseExpiredListingCompressedInstructionDataCodec(): Codec<
  CloseExpiredListingCompressedInstructionDataArgs,
  CloseExpiredListingCompressedInstructionData
> {
  return combineCodec(
    getCloseExpiredListingCompressedInstructionDataEncoder(),
    getCloseExpiredListingCompressedInstructionDataDecoder()
  );
}

export type CloseExpiredListingCompressedInstructionExtraArgs = {
  /** creators, structured like [ [creator_pubkey_1,creator_shares_1], ..., [creator_pubkey_n, creator_shares_n] ] */
  creators?: Array<readonly [Address, number]>;
  /** proof path, can be shortened if canopyDepth of merkle tree is also specified */
  proof?: Array<Address>;
  /** canopy depth of merkle tree, reduces proofPath length if specified */
  canopyDepth?: number;
};

export type CloseExpiredListingCompressedAsyncInput<
  TAccountListState extends string = string,
  TAccountOwner extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountTreeAuthority extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountRentDestination extends string = string,
> = {
  listState: Address<TAccountListState>;
  owner: Address<TAccountOwner>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  treeAuthority?: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper?: Address<TAccountLogWrapper>;
  compressionProgram?: Address<TAccountCompressionProgram>;
  bubblegumProgram?: Address<TAccountBubblegumProgram>;
  rentDestination?: Address<TAccountRentDestination>;
  nonce?: CloseExpiredListingCompressedInstructionDataArgs['nonce'];
  index: CloseExpiredListingCompressedInstructionDataArgs['index'];
  root: CloseExpiredListingCompressedInstructionDataArgs['root'];
  dataHash: CloseExpiredListingCompressedInstructionDataArgs['dataHash'];
  creatorHash: CloseExpiredListingCompressedInstructionDataArgs['creatorHash'];
  creators?: CloseExpiredListingCompressedInstructionExtraArgs['creators'];
  proof?: CloseExpiredListingCompressedInstructionExtraArgs['proof'];
  canopyDepth?: CloseExpiredListingCompressedInstructionExtraArgs['canopyDepth'];
};

export async function getCloseExpiredListingCompressedInstructionAsync<
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountRentDestination extends string,
>(
  input: CloseExpiredListingCompressedAsyncInput<
    TAccountListState,
    TAccountOwner,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountBubblegumProgram,
    TAccountRentDestination
  >
): Promise<
  CloseExpiredListingCompressedInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountListState,
    TAccountOwner,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountBubblegumProgram,
    TAccountRentDestination
  >
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    listState: { value: input.listState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: false },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    treeAuthority: { value: input.treeAuthority ?? null, isWritable: false },
    merkleTree: { value: input.merkleTree ?? null, isWritable: true },
    logWrapper: { value: input.logWrapper ?? null, isWritable: false },
    compressionProgram: {
      value: input.compressionProgram ?? null,
      isWritable: false,
    },
    bubblegumProgram: {
      value: input.bubblegumProgram ?? null,
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
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
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
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }
  if (!args.nonce) {
    args.nonce = expectSome(args.index);
  }
  if (!args.creators) {
    args.creators = [];
  }
  if (!args.proof) {
    args.proof = [];
  }
  if (!args.canopyDepth) {
    args.canopyDepth = 0;
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = [
    ...resolveCreatorPath(resolverScope),
    ...resolveProofPath(resolverScope),
  ];

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.treeAuthority),
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.rentDestination),
      ...remainingAccounts,
    ],
    programAddress,
    data: getCloseExpiredListingCompressedInstructionDataEncoder().encode(
      args as CloseExpiredListingCompressedInstructionDataArgs
    ),
  } as CloseExpiredListingCompressedInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountListState,
    TAccountOwner,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountBubblegumProgram,
    TAccountRentDestination
  >;

  return instruction;
}

export type CloseExpiredListingCompressedInput<
  TAccountListState extends string = string,
  TAccountOwner extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountTreeAuthority extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountRentDestination extends string = string,
> = {
  listState: Address<TAccountListState>;
  owner: Address<TAccountOwner>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  treeAuthority: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper?: Address<TAccountLogWrapper>;
  compressionProgram?: Address<TAccountCompressionProgram>;
  bubblegumProgram?: Address<TAccountBubblegumProgram>;
  rentDestination?: Address<TAccountRentDestination>;
  nonce?: CloseExpiredListingCompressedInstructionDataArgs['nonce'];
  index: CloseExpiredListingCompressedInstructionDataArgs['index'];
  root: CloseExpiredListingCompressedInstructionDataArgs['root'];
  dataHash: CloseExpiredListingCompressedInstructionDataArgs['dataHash'];
  creatorHash: CloseExpiredListingCompressedInstructionDataArgs['creatorHash'];
  creators?: CloseExpiredListingCompressedInstructionExtraArgs['creators'];
  proof?: CloseExpiredListingCompressedInstructionExtraArgs['proof'];
  canopyDepth?: CloseExpiredListingCompressedInstructionExtraArgs['canopyDepth'];
};

export function getCloseExpiredListingCompressedInstruction<
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountRentDestination extends string,
>(
  input: CloseExpiredListingCompressedInput<
    TAccountListState,
    TAccountOwner,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountBubblegumProgram,
    TAccountRentDestination
  >
): CloseExpiredListingCompressedInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountListState,
  TAccountOwner,
  TAccountSystemProgram,
  TAccountMarketplaceProgram,
  TAccountTreeAuthority,
  TAccountMerkleTree,
  TAccountLogWrapper,
  TAccountCompressionProgram,
  TAccountBubblegumProgram,
  TAccountRentDestination
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    listState: { value: input.listState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: false },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    treeAuthority: { value: input.treeAuthority ?? null, isWritable: false },
    merkleTree: { value: input.merkleTree ?? null, isWritable: true },
    logWrapper: { value: input.logWrapper ?? null, isWritable: false },
    compressionProgram: {
      value: input.compressionProgram ?? null,
      isWritable: false,
    },
    bubblegumProgram: {
      value: input.bubblegumProgram ?? null,
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
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
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
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }
  if (!args.nonce) {
    args.nonce = expectSome(args.index);
  }
  if (!args.creators) {
    args.creators = [];
  }
  if (!args.proof) {
    args.proof = [];
  }
  if (!args.canopyDepth) {
    args.canopyDepth = 0;
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = [
    ...resolveCreatorPath(resolverScope),
    ...resolveProofPath(resolverScope),
  ];

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.treeAuthority),
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.rentDestination),
      ...remainingAccounts,
    ],
    programAddress,
    data: getCloseExpiredListingCompressedInstructionDataEncoder().encode(
      args as CloseExpiredListingCompressedInstructionDataArgs
    ),
  } as CloseExpiredListingCompressedInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountListState,
    TAccountOwner,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountBubblegumProgram,
    TAccountRentDestination
  >;

  return instruction;
}

export type ParsedCloseExpiredListingCompressedInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    listState: TAccountMetas[0];
    owner: TAccountMetas[1];
    systemProgram: TAccountMetas[2];
    marketplaceProgram: TAccountMetas[3];
    treeAuthority: TAccountMetas[4];
    merkleTree: TAccountMetas[5];
    logWrapper: TAccountMetas[6];
    compressionProgram: TAccountMetas[7];
    bubblegumProgram: TAccountMetas[8];
    rentDestination: TAccountMetas[9];
  };
  data: CloseExpiredListingCompressedInstructionData;
};

export function parseCloseExpiredListingCompressedInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCloseExpiredListingCompressedInstruction<TProgram, TAccountMetas> {
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
      listState: getNextAccount(),
      owner: getNextAccount(),
      systemProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      treeAuthority: getNextAccount(),
      merkleTree: getNextAccount(),
      logWrapper: getNextAccount(),
      compressionProgram: getNextAccount(),
      bubblegumProgram: getNextAccount(),
      rentDestination: getNextAccount(),
    },
    data: getCloseExpiredListingCompressedInstructionDataDecoder().decode(
      instruction.data
    ),
  };
}
