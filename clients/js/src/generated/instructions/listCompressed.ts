/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Address,
  getAddressDecoder,
  getAddressEncoder,
} from '@solana/addresses';
import {
  Codec,
  Decoder,
  Encoder,
  Option,
  OptionOrNullable,
  combineCodec,
  getArrayDecoder,
  getArrayEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getOptionDecoder,
  getOptionEncoder,
  getStructDecoder,
  getStructEncoder,
  getU32Decoder,
  getU32Encoder,
  getU64Decoder,
  getU64Encoder,
  getU8Decoder,
  getU8Encoder,
  mapEncoder,
  none,
} from '@solana/codecs';
import {
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  ReadonlySignerAccount,
  WritableAccount,
  WritableSignerAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import {
  resolveProofPath,
  resolveRemainingSignerWithOwnerOrDelegate,
  resolveTreeAuthorityPda,
} from '../../hooked';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, expectSome, getAccountMetaFactory } from '../shared';

export type ListCompressedInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountDelegate extends string | IAccountMeta<string> = string,
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
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountRentPayer extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTreeAuthority extends string
        ? ReadonlyAccount<TAccountTreeAuthority>
        : TAccountTreeAuthority,
      TAccountOwner extends string
        ? ReadonlyAccount<TAccountOwner>
        : TAccountOwner,
      TAccountDelegate extends string
        ? ReadonlyAccount<TAccountDelegate>
        : TAccountDelegate,
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
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountRentPayer extends string
        ? WritableSignerAccount<TAccountRentPayer> &
            IAccountSignerMeta<TAccountRentPayer>
        : TAccountRentPayer,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      ...TRemainingAccounts,
    ]
  >;

export type ListCompressedInstructionData = {
  discriminator: Array<number>;
  nonce: bigint;
  index: number;
  root: Uint8Array;
  dataHash: Uint8Array;
  creatorHash: Uint8Array;
  amount: bigint;
  expireInSec: Option<bigint>;
  currency: Option<Address>;
  privateTaker: Option<Address>;
  makerBroker: Option<Address>;
};

export type ListCompressedInstructionDataArgs = {
  nonce: number | bigint;
  index: number;
  root: Uint8Array;
  dataHash: Uint8Array;
  creatorHash: Uint8Array;
  amount: number | bigint;
  expireInSec?: OptionOrNullable<number | bigint>;
  currency?: OptionOrNullable<Address>;
  privateTaker?: OptionOrNullable<Address>;
  makerBroker?: OptionOrNullable<Address>;
};

export function getListCompressedInstructionDataEncoder(): Encoder<ListCompressedInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['nonce', getU64Encoder()],
      ['index', getU32Encoder()],
      ['root', getBytesEncoder({ size: 32 })],
      ['dataHash', getBytesEncoder({ size: 32 })],
      ['creatorHash', getBytesEncoder({ size: 32 })],
      ['amount', getU64Encoder()],
      ['expireInSec', getOptionEncoder(getU64Encoder())],
      ['currency', getOptionEncoder(getAddressEncoder())],
      ['privateTaker', getOptionEncoder(getAddressEncoder())],
      ['makerBroker', getOptionEncoder(getAddressEncoder())],
    ]),
    (value) => ({
      ...value,
      discriminator: [54, 174, 193, 67, 17, 41, 132, 38],
      expireInSec: value.expireInSec ?? none(),
      currency: value.currency ?? none(),
      privateTaker: value.privateTaker ?? none(),
      makerBroker: value.makerBroker ?? none(),
    })
  );
}

export function getListCompressedInstructionDataDecoder(): Decoder<ListCompressedInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['nonce', getU64Decoder()],
    ['index', getU32Decoder()],
    ['root', getBytesDecoder({ size: 32 })],
    ['dataHash', getBytesDecoder({ size: 32 })],
    ['creatorHash', getBytesDecoder({ size: 32 })],
    ['amount', getU64Decoder()],
    ['expireInSec', getOptionDecoder(getU64Decoder())],
    ['currency', getOptionDecoder(getAddressDecoder())],
    ['privateTaker', getOptionDecoder(getAddressDecoder())],
    ['makerBroker', getOptionDecoder(getAddressDecoder())],
  ]);
}

export function getListCompressedInstructionDataCodec(): Codec<
  ListCompressedInstructionDataArgs,
  ListCompressedInstructionData
> {
  return combineCodec(
    getListCompressedInstructionDataEncoder(),
    getListCompressedInstructionDataDecoder()
  );
}

export type ListCompressedInstructionExtraArgs = {
  /** proof path, can be shortened if canopyDepth of merkle tree is also specified */
  proof?: Array<Address>;
  /** canopy depth of merkle tree, reduces proofPath length if specified */
  canopyDepth?: number;
};

export type ListCompressedAsyncInput<
  TAccountTreeAuthority extends string = string,
  TAccountOwner extends string = string,
  TAccountDelegate extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountListState extends string = string,
  TAccountRentPayer extends string = string,
  TAccountCosigner extends string = string,
> = {
  treeAuthority?: Address<TAccountTreeAuthority>;
  owner: Address<TAccountOwner> | TransactionSigner<TAccountOwner>;
  delegate?: Address<TAccountDelegate> | TransactionSigner<TAccountDelegate>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper?: Address<TAccountLogWrapper>;
  compressionProgram?: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram?: Address<TAccountBubblegumProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  listState: Address<TAccountListState>;
  rentPayer?: TransactionSigner<TAccountRentPayer>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  nonce?: ListCompressedInstructionDataArgs['nonce'];
  index: ListCompressedInstructionDataArgs['index'];
  root: ListCompressedInstructionDataArgs['root'];
  dataHash: ListCompressedInstructionDataArgs['dataHash'];
  creatorHash: ListCompressedInstructionDataArgs['creatorHash'];
  amount: ListCompressedInstructionDataArgs['amount'];
  expireInSec?: ListCompressedInstructionDataArgs['expireInSec'];
  currency?: ListCompressedInstructionDataArgs['currency'];
  privateTaker?: ListCompressedInstructionDataArgs['privateTaker'];
  makerBroker?: ListCompressedInstructionDataArgs['makerBroker'];
  proof?: ListCompressedInstructionExtraArgs['proof'];
  canopyDepth?: ListCompressedInstructionExtraArgs['canopyDepth'];
};

export async function getListCompressedInstructionAsync<
  TAccountTreeAuthority extends string,
  TAccountOwner extends string,
  TAccountDelegate extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountListState extends string,
  TAccountRentPayer extends string,
  TAccountCosigner extends string,
>(
  input: ListCompressedAsyncInput<
    TAccountTreeAuthority,
    TAccountOwner,
    TAccountDelegate,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountListState,
    TAccountRentPayer,
    TAccountCosigner
  >
): Promise<
  ListCompressedInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountTreeAuthority,
    (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
      ? ReadonlySignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
      : TAccountOwner,
    (typeof input)['delegate'] extends TransactionSigner<TAccountDelegate>
      ? ReadonlySignerAccount<TAccountDelegate> &
          IAccountSignerMeta<TAccountDelegate>
      : TAccountDelegate,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountListState,
    TAccountRentPayer,
    TAccountCosigner
  >
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    treeAuthority: { value: input.treeAuthority ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: false },
    delegate: { value: input.delegate ?? null, isWritable: false },
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
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    listState: { value: input.listState ?? null, isWritable: true },
    rentPayer: { value: input.rentPayer ?? null, isWritable: true },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
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
  if (!accounts.delegate.value) {
    accounts.delegate.value = expectSome(accounts.owner.value);
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
  if (!accounts.rentPayer.value) {
    accounts.rentPayer = {
      ...accounts.rentPayer,
      ...resolveRemainingSignerWithOwnerOrDelegate(resolverScope),
    };
  }
  if (!accounts.cosigner.value) {
    accounts.cosigner = {
      ...accounts.cosigner,
      ...resolveRemainingSignerWithOwnerOrDelegate(resolverScope),
    };
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
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.delegate),
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.rentPayer),
      getAccountMeta(accounts.cosigner),
      ...remainingAccounts,
    ],
    programAddress,
    data: getListCompressedInstructionDataEncoder().encode(
      args as ListCompressedInstructionDataArgs
    ),
  } as ListCompressedInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountTreeAuthority,
    (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
      ? ReadonlySignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
      : TAccountOwner,
    (typeof input)['delegate'] extends TransactionSigner<TAccountDelegate>
      ? ReadonlySignerAccount<TAccountDelegate> &
          IAccountSignerMeta<TAccountDelegate>
      : TAccountDelegate,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountListState,
    TAccountRentPayer,
    TAccountCosigner
  >;

  return instruction;
}

export type ListCompressedInput<
  TAccountTreeAuthority extends string = string,
  TAccountOwner extends string = string,
  TAccountDelegate extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountListState extends string = string,
  TAccountRentPayer extends string = string,
  TAccountCosigner extends string = string,
> = {
  treeAuthority: Address<TAccountTreeAuthority>;
  owner: Address<TAccountOwner> | TransactionSigner<TAccountOwner>;
  delegate?: Address<TAccountDelegate> | TransactionSigner<TAccountDelegate>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper?: Address<TAccountLogWrapper>;
  compressionProgram?: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram?: Address<TAccountBubblegumProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  listState: Address<TAccountListState>;
  rentPayer?: TransactionSigner<TAccountRentPayer>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  nonce?: ListCompressedInstructionDataArgs['nonce'];
  index: ListCompressedInstructionDataArgs['index'];
  root: ListCompressedInstructionDataArgs['root'];
  dataHash: ListCompressedInstructionDataArgs['dataHash'];
  creatorHash: ListCompressedInstructionDataArgs['creatorHash'];
  amount: ListCompressedInstructionDataArgs['amount'];
  expireInSec?: ListCompressedInstructionDataArgs['expireInSec'];
  currency?: ListCompressedInstructionDataArgs['currency'];
  privateTaker?: ListCompressedInstructionDataArgs['privateTaker'];
  makerBroker?: ListCompressedInstructionDataArgs['makerBroker'];
  proof?: ListCompressedInstructionExtraArgs['proof'];
  canopyDepth?: ListCompressedInstructionExtraArgs['canopyDepth'];
};

export function getListCompressedInstruction<
  TAccountTreeAuthority extends string,
  TAccountOwner extends string,
  TAccountDelegate extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountListState extends string,
  TAccountRentPayer extends string,
  TAccountCosigner extends string,
>(
  input: ListCompressedInput<
    TAccountTreeAuthority,
    TAccountOwner,
    TAccountDelegate,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountListState,
    TAccountRentPayer,
    TAccountCosigner
  >
): ListCompressedInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountTreeAuthority,
  (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
    ? ReadonlySignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
    : TAccountOwner,
  (typeof input)['delegate'] extends TransactionSigner<TAccountDelegate>
    ? ReadonlySignerAccount<TAccountDelegate> &
        IAccountSignerMeta<TAccountDelegate>
    : TAccountDelegate,
  TAccountMerkleTree,
  TAccountLogWrapper,
  TAccountCompressionProgram,
  TAccountSystemProgram,
  TAccountBubblegumProgram,
  TAccountMarketplaceProgram,
  TAccountListState,
  TAccountRentPayer,
  TAccountCosigner
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    treeAuthority: { value: input.treeAuthority ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: false },
    delegate: { value: input.delegate ?? null, isWritable: false },
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
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    listState: { value: input.listState ?? null, isWritable: true },
    rentPayer: { value: input.rentPayer ?? null, isWritable: true },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
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
  if (!accounts.delegate.value) {
    accounts.delegate.value = expectSome(accounts.owner.value);
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
  if (!accounts.rentPayer.value) {
    accounts.rentPayer = {
      ...accounts.rentPayer,
      ...resolveRemainingSignerWithOwnerOrDelegate(resolverScope),
    };
  }
  if (!accounts.cosigner.value) {
    accounts.cosigner = {
      ...accounts.cosigner,
      ...resolveRemainingSignerWithOwnerOrDelegate(resolverScope),
    };
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
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.delegate),
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.rentPayer),
      getAccountMeta(accounts.cosigner),
      ...remainingAccounts,
    ],
    programAddress,
    data: getListCompressedInstructionDataEncoder().encode(
      args as ListCompressedInstructionDataArgs
    ),
  } as ListCompressedInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountTreeAuthority,
    (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
      ? ReadonlySignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
      : TAccountOwner,
    (typeof input)['delegate'] extends TransactionSigner<TAccountDelegate>
      ? ReadonlySignerAccount<TAccountDelegate> &
          IAccountSignerMeta<TAccountDelegate>
      : TAccountDelegate,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountListState,
    TAccountRentPayer,
    TAccountCosigner
  >;

  return instruction;
}

export type ParsedListCompressedInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    treeAuthority: TAccountMetas[0];
    owner: TAccountMetas[1];
    delegate: TAccountMetas[2];
    merkleTree: TAccountMetas[3];
    logWrapper: TAccountMetas[4];
    compressionProgram: TAccountMetas[5];
    systemProgram: TAccountMetas[6];
    bubblegumProgram: TAccountMetas[7];
    marketplaceProgram: TAccountMetas[8];
    listState: TAccountMetas[9];
    rentPayer: TAccountMetas[10];
    cosigner?: TAccountMetas[11] | undefined;
  };
  data: ListCompressedInstructionData;
};

export function parseListCompressedInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedListCompressedInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 12) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  const getNextOptionalAccount = () => {
    const accountMeta = getNextAccount();
    return accountMeta.address === TENSOR_MARKETPLACE_PROGRAM_ADDRESS
      ? undefined
      : accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      treeAuthority: getNextAccount(),
      owner: getNextAccount(),
      delegate: getNextAccount(),
      merkleTree: getNextAccount(),
      logWrapper: getNextAccount(),
      compressionProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      bubblegumProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      listState: getNextAccount(),
      rentPayer: getNextAccount(),
      cosigner: getNextOptionalAccount(),
    },
    data: getListCompressedInstructionDataDecoder().decode(instruction.data),
  };
}
