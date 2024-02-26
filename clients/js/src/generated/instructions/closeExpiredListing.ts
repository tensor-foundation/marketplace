/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Address } from '@solana/addresses';
import {
  Codec,
  Decoder,
  Encoder,
  combineCodec,
  mapEncoder,
} from '@solana/codecs-core';
import {
  getArrayDecoder,
  getArrayEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
} from '@solana/codecs-data-structures';
import {
  getU32Decoder,
  getU32Encoder,
  getU64Decoder,
  getU64Encoder,
  getU8Decoder,
  getU8Encoder,
} from '@solana/codecs-numbers';
import {
  AccountRole,
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  WritableAccount,
} from '@solana/instructions';
import {
  ResolvedAccount,
  accountMetaWithDefault,
  getAccountMetasWithSigners,
} from '../shared';

export type CloseExpiredListingInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountMerkleTree extends string | IAccountMeta<string> = string,
  TAccountLogWrapper extends string | IAccountMeta<string> = string,
  TAccountCompressionProgram extends string | IAccountMeta<string> = string,
  TAccountBubblegumProgram extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
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
      TAccountTcompProgram extends string
        ? ReadonlyAccount<TAccountTcompProgram>
        : TAccountTcompProgram,
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
      TAccountRentDest extends string
        ? WritableAccount<TAccountRentDest>
        : TAccountRentDest,
      ...TRemainingAccounts
    ]
  >;

export type CloseExpiredListingInstructionWithSigners<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountMerkleTree extends string | IAccountMeta<string> = string,
  TAccountLogWrapper extends string | IAccountMeta<string> = string,
  TAccountCompressionProgram extends string | IAccountMeta<string> = string,
  TAccountBubblegumProgram extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
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
      TAccountTcompProgram extends string
        ? ReadonlyAccount<TAccountTcompProgram>
        : TAccountTcompProgram,
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
      TAccountRentDest extends string
        ? WritableAccount<TAccountRentDest>
        : TAccountRentDest,
      ...TRemainingAccounts
    ]
  >;

export type CloseExpiredListingInstructionData = {
  discriminator: Array<number>;
  nonce: bigint;
  index: number;
  root: Uint8Array;
  dataHash: Uint8Array;
  creatorHash: Uint8Array;
};

export type CloseExpiredListingInstructionDataArgs = {
  nonce: number | bigint;
  index: number;
  root: Uint8Array;
  dataHash: Uint8Array;
  creatorHash: Uint8Array;
};

export function getCloseExpiredListingInstructionDataEncoder() {
  return mapEncoder(
    getStructEncoder<{
      discriminator: Array<number>;
      nonce: number | bigint;
      index: number;
      root: Uint8Array;
      dataHash: Uint8Array;
      creatorHash: Uint8Array;
    }>([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['nonce', getU64Encoder()],
      ['index', getU32Encoder()],
      ['root', getBytesEncoder({ size: 32 })],
      ['dataHash', getBytesEncoder({ size: 32 })],
      ['creatorHash', getBytesEncoder({ size: 32 })],
    ]),
    (value) => ({ ...value, discriminator: [150, 70, 13, 135, 9, 204, 75, 4] })
  ) satisfies Encoder<CloseExpiredListingInstructionDataArgs>;
}

export function getCloseExpiredListingInstructionDataDecoder() {
  return getStructDecoder<CloseExpiredListingInstructionData>([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['nonce', getU64Decoder()],
    ['index', getU32Decoder()],
    ['root', getBytesDecoder({ size: 32 })],
    ['dataHash', getBytesDecoder({ size: 32 })],
    ['creatorHash', getBytesDecoder({ size: 32 })],
  ]) satisfies Decoder<CloseExpiredListingInstructionData>;
}

export function getCloseExpiredListingInstructionDataCodec(): Codec<
  CloseExpiredListingInstructionDataArgs,
  CloseExpiredListingInstructionData
> {
  return combineCodec(
    getCloseExpiredListingInstructionDataEncoder(),
    getCloseExpiredListingInstructionDataDecoder()
  );
}

export type CloseExpiredListingInput<
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountSystemProgram extends string,
  TAccountTcompProgram extends string,
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountRentDest extends string
> = {
  listState: Address<TAccountListState>;
  owner: Address<TAccountOwner>;
  systemProgram?: Address<TAccountSystemProgram>;
  tcompProgram: Address<TAccountTcompProgram>;
  treeAuthority: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper: Address<TAccountLogWrapper>;
  compressionProgram: Address<TAccountCompressionProgram>;
  bubblegumProgram: Address<TAccountBubblegumProgram>;
  rentDest?: Address<TAccountRentDest>;
  nonce: CloseExpiredListingInstructionDataArgs['nonce'];
  index: CloseExpiredListingInstructionDataArgs['index'];
  root: CloseExpiredListingInstructionDataArgs['root'];
  dataHash: CloseExpiredListingInstructionDataArgs['dataHash'];
  creatorHash: CloseExpiredListingInstructionDataArgs['creatorHash'];
};

export type CloseExpiredListingInputWithSigners<
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountSystemProgram extends string,
  TAccountTcompProgram extends string,
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountRentDest extends string
> = {
  listState: Address<TAccountListState>;
  owner: Address<TAccountOwner>;
  systemProgram?: Address<TAccountSystemProgram>;
  tcompProgram: Address<TAccountTcompProgram>;
  treeAuthority: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper: Address<TAccountLogWrapper>;
  compressionProgram: Address<TAccountCompressionProgram>;
  bubblegumProgram: Address<TAccountBubblegumProgram>;
  rentDest?: Address<TAccountRentDest>;
  nonce: CloseExpiredListingInstructionDataArgs['nonce'];
  index: CloseExpiredListingInstructionDataArgs['index'];
  root: CloseExpiredListingInstructionDataArgs['root'];
  dataHash: CloseExpiredListingInstructionDataArgs['dataHash'];
  creatorHash: CloseExpiredListingInstructionDataArgs['creatorHash'];
};

export function getCloseExpiredListingInstruction<
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountSystemProgram extends string,
  TAccountTcompProgram extends string,
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: CloseExpiredListingInputWithSigners<
    TAccountListState,
    TAccountOwner,
    TAccountSystemProgram,
    TAccountTcompProgram,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountBubblegumProgram,
    TAccountRentDest
  >
): CloseExpiredListingInstructionWithSigners<
  TProgram,
  TAccountListState,
  TAccountOwner,
  TAccountSystemProgram,
  TAccountTcompProgram,
  TAccountTreeAuthority,
  TAccountMerkleTree,
  TAccountLogWrapper,
  TAccountCompressionProgram,
  TAccountBubblegumProgram,
  TAccountRentDest
>;
export function getCloseExpiredListingInstruction<
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountSystemProgram extends string,
  TAccountTcompProgram extends string,
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: CloseExpiredListingInput<
    TAccountListState,
    TAccountOwner,
    TAccountSystemProgram,
    TAccountTcompProgram,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountBubblegumProgram,
    TAccountRentDest
  >
): CloseExpiredListingInstruction<
  TProgram,
  TAccountListState,
  TAccountOwner,
  TAccountSystemProgram,
  TAccountTcompProgram,
  TAccountTreeAuthority,
  TAccountMerkleTree,
  TAccountLogWrapper,
  TAccountCompressionProgram,
  TAccountBubblegumProgram,
  TAccountRentDest
>;
export function getCloseExpiredListingInstruction<
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountSystemProgram extends string,
  TAccountTcompProgram extends string,
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: CloseExpiredListingInput<
    TAccountListState,
    TAccountOwner,
    TAccountSystemProgram,
    TAccountTcompProgram,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountBubblegumProgram,
    TAccountRentDest
  >
): IInstruction {
  // Program address.
  const programAddress =
    'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getCloseExpiredListingInstructionRaw<
      TProgram,
      TAccountListState,
      TAccountOwner,
      TAccountSystemProgram,
      TAccountTcompProgram,
      TAccountTreeAuthority,
      TAccountMerkleTree,
      TAccountLogWrapper,
      TAccountCompressionProgram,
      TAccountBubblegumProgram,
      TAccountRentDest
    >
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
    listState: { value: input.listState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: false },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    tcompProgram: { value: input.tcompProgram ?? null, isWritable: false },
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
    rentDest: { value: input.rentDest ?? null, isWritable: true },
  };

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.rentDest.value) {
    accounts.rentDest.value =
      'SysvarRent111111111111111111111111111111111' as Address<'SysvarRent111111111111111111111111111111111'>;
  }

  // Get account metas and signers.
  const accountMetas = getAccountMetasWithSigners(
    accounts,
    'programId',
    programAddress
  );

  const instruction = getCloseExpiredListingInstructionRaw(
    accountMetas as Record<keyof AccountMetas, IAccountMeta>,
    args as CloseExpiredListingInstructionDataArgs,
    programAddress
  );

  return instruction;
}

export function getCloseExpiredListingInstructionRaw<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountMerkleTree extends string | IAccountMeta<string> = string,
  TAccountLogWrapper extends string | IAccountMeta<string> = string,
  TAccountCompressionProgram extends string | IAccountMeta<string> = string,
  TAccountBubblegumProgram extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
>(
  accounts: {
    listState: TAccountListState extends string
      ? Address<TAccountListState>
      : TAccountListState;
    owner: TAccountOwner extends string
      ? Address<TAccountOwner>
      : TAccountOwner;
    systemProgram?: TAccountSystemProgram extends string
      ? Address<TAccountSystemProgram>
      : TAccountSystemProgram;
    tcompProgram: TAccountTcompProgram extends string
      ? Address<TAccountTcompProgram>
      : TAccountTcompProgram;
    treeAuthority: TAccountTreeAuthority extends string
      ? Address<TAccountTreeAuthority>
      : TAccountTreeAuthority;
    merkleTree: TAccountMerkleTree extends string
      ? Address<TAccountMerkleTree>
      : TAccountMerkleTree;
    logWrapper: TAccountLogWrapper extends string
      ? Address<TAccountLogWrapper>
      : TAccountLogWrapper;
    compressionProgram: TAccountCompressionProgram extends string
      ? Address<TAccountCompressionProgram>
      : TAccountCompressionProgram;
    bubblegumProgram: TAccountBubblegumProgram extends string
      ? Address<TAccountBubblegumProgram>
      : TAccountBubblegumProgram;
    rentDest?: TAccountRentDest extends string
      ? Address<TAccountRentDest>
      : TAccountRentDest;
  },
  args: CloseExpiredListingInstructionDataArgs,
  programAddress: Address<TProgram> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<TProgram>,
  remainingAccounts?: TRemainingAccounts
) {
  return {
    accounts: [
      accountMetaWithDefault(accounts.listState, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.owner, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.systemProgram ??
          ('11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>),
        AccountRole.READONLY
      ),
      accountMetaWithDefault(accounts.tcompProgram, AccountRole.READONLY),
      accountMetaWithDefault(accounts.treeAuthority, AccountRole.READONLY),
      accountMetaWithDefault(accounts.merkleTree, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.logWrapper, AccountRole.READONLY),
      accountMetaWithDefault(accounts.compressionProgram, AccountRole.READONLY),
      accountMetaWithDefault(accounts.bubblegumProgram, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.rentDest ??
          ('SysvarRent111111111111111111111111111111111' as Address<'SysvarRent111111111111111111111111111111111'>),
        AccountRole.WRITABLE
      ),
      ...(remainingAccounts ?? []),
    ],
    data: getCloseExpiredListingInstructionDataEncoder().encode(args),
    programAddress,
  } as CloseExpiredListingInstruction<
    TProgram,
    TAccountListState,
    TAccountOwner,
    TAccountSystemProgram,
    TAccountTcompProgram,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountBubblegumProgram,
    TAccountRentDest,
    TRemainingAccounts
  >;
}

export type ParsedCloseExpiredListingInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[]
> = {
  programAddress: Address<TProgram>;
  accounts: {
    listState: TAccountMetas[0];
    owner: TAccountMetas[1];
    systemProgram: TAccountMetas[2];
    tcompProgram: TAccountMetas[3];
    treeAuthority: TAccountMetas[4];
    merkleTree: TAccountMetas[5];
    logWrapper: TAccountMetas[6];
    compressionProgram: TAccountMetas[7];
    bubblegumProgram: TAccountMetas[8];
    rentDest: TAccountMetas[9];
  };
  data: CloseExpiredListingInstructionData;
};

export function parseCloseExpiredListingInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[]
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCloseExpiredListingInstruction<TProgram, TAccountMetas> {
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
      tcompProgram: getNextAccount(),
      treeAuthority: getNextAccount(),
      merkleTree: getNextAccount(),
      logWrapper: getNextAccount(),
      compressionProgram: getNextAccount(),
      bubblegumProgram: getNextAccount(),
      rentDest: getNextAccount(),
    },
    data: getCloseExpiredListingInstructionDataDecoder().decode(
      instruction.data
    ),
  };
}
