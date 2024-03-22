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
  ReadonlySignerAccount,
  WritableAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import {
  ResolvedAccount,
  accountMetaWithDefault,
  getAccountMetasWithSigners,
} from '../shared';

export type DelistInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountMerkleTree extends string | IAccountMeta<string> = string,
  TAccountLogWrapper extends string | IAccountMeta<string> = string,
  TAccountCompressionProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountBubblegumProgram extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
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
        ? ReadonlySignerAccount<TAccountOwner>
        : TAccountOwner,
      TAccountTcompProgram extends string
        ? ReadonlyAccount<TAccountTcompProgram>
        : TAccountTcompProgram,
      TAccountRentDest extends string
        ? WritableAccount<TAccountRentDest>
        : TAccountRentDest,
      ...TRemainingAccounts
    ]
  >;

export type DelistInstructionWithSigners<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountMerkleTree extends string | IAccountMeta<string> = string,
  TAccountLogWrapper extends string | IAccountMeta<string> = string,
  TAccountCompressionProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountBubblegumProgram extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
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
        ? ReadonlySignerAccount<TAccountOwner> &
            IAccountSignerMeta<TAccountOwner>
        : TAccountOwner,
      TAccountTcompProgram extends string
        ? ReadonlyAccount<TAccountTcompProgram>
        : TAccountTcompProgram,
      TAccountRentDest extends string
        ? WritableAccount<TAccountRentDest>
        : TAccountRentDest,
      ...TRemainingAccounts
    ]
  >;

export type DelistInstructionData = {
  discriminator: Array<number>;
  nonce: bigint;
  index: number;
  root: Uint8Array;
  dataHash: Uint8Array;
  creatorHash: Uint8Array;
};

export type DelistInstructionDataArgs = {
  nonce: number | bigint;
  index: number;
  root: Uint8Array;
  dataHash: Uint8Array;
  creatorHash: Uint8Array;
};

export function getDelistInstructionDataEncoder() {
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
    (value) => ({
      ...value,
      discriminator: [55, 136, 205, 107, 107, 173, 4, 31],
    })
  ) satisfies Encoder<DelistInstructionDataArgs>;
}

export function getDelistInstructionDataDecoder() {
  return getStructDecoder<DelistInstructionData>([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['nonce', getU64Decoder()],
    ['index', getU32Decoder()],
    ['root', getBytesDecoder({ size: 32 })],
    ['dataHash', getBytesDecoder({ size: 32 })],
    ['creatorHash', getBytesDecoder({ size: 32 })],
  ]) satisfies Decoder<DelistInstructionData>;
}

export function getDelistInstructionDataCodec(): Codec<
  DelistInstructionDataArgs,
  DelistInstructionData
> {
  return combineCodec(
    getDelistInstructionDataEncoder(),
    getDelistInstructionDataDecoder()
  );
}

export type DelistInput<
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountTcompProgram extends string,
  TAccountRentDest extends string
> = {
  treeAuthority: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper: Address<TAccountLogWrapper>;
  compressionProgram: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram: Address<TAccountBubblegumProgram>;
  listState: Address<TAccountListState>;
  owner: Address<TAccountOwner>;
  tcompProgram: Address<TAccountTcompProgram>;
  rentDest?: Address<TAccountRentDest>;
  nonce: DelistInstructionDataArgs['nonce'];
  index: DelistInstructionDataArgs['index'];
  root: DelistInstructionDataArgs['root'];
  dataHash: DelistInstructionDataArgs['dataHash'];
  creatorHash: DelistInstructionDataArgs['creatorHash'];
};

export type DelistInputWithSigners<
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountTcompProgram extends string,
  TAccountRentDest extends string
> = {
  treeAuthority: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper: Address<TAccountLogWrapper>;
  compressionProgram: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram: Address<TAccountBubblegumProgram>;
  listState: Address<TAccountListState>;
  owner: TransactionSigner<TAccountOwner>;
  tcompProgram: Address<TAccountTcompProgram>;
  rentDest?: Address<TAccountRentDest>;
  nonce: DelistInstructionDataArgs['nonce'];
  index: DelistInstructionDataArgs['index'];
  root: DelistInstructionDataArgs['root'];
  dataHash: DelistInstructionDataArgs['dataHash'];
  creatorHash: DelistInstructionDataArgs['creatorHash'];
};

export function getDelistInstruction<
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountTcompProgram extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: DelistInputWithSigners<
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountListState,
    TAccountOwner,
    TAccountTcompProgram,
    TAccountRentDest
  >
): DelistInstructionWithSigners<
  TProgram,
  TAccountTreeAuthority,
  TAccountMerkleTree,
  TAccountLogWrapper,
  TAccountCompressionProgram,
  TAccountSystemProgram,
  TAccountBubblegumProgram,
  TAccountListState,
  TAccountOwner,
  TAccountTcompProgram,
  TAccountRentDest
>;
export function getDelistInstruction<
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountTcompProgram extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: DelistInput<
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountListState,
    TAccountOwner,
    TAccountTcompProgram,
    TAccountRentDest
  >
): DelistInstruction<
  TProgram,
  TAccountTreeAuthority,
  TAccountMerkleTree,
  TAccountLogWrapper,
  TAccountCompressionProgram,
  TAccountSystemProgram,
  TAccountBubblegumProgram,
  TAccountListState,
  TAccountOwner,
  TAccountTcompProgram,
  TAccountRentDest
>;
export function getDelistInstruction<
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountTcompProgram extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: DelistInput<
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountListState,
    TAccountOwner,
    TAccountTcompProgram,
    TAccountRentDest
  >
): IInstruction {
  // Program address.
  const programAddress =
    'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getDelistInstructionRaw<
      TProgram,
      TAccountTreeAuthority,
      TAccountMerkleTree,
      TAccountLogWrapper,
      TAccountCompressionProgram,
      TAccountSystemProgram,
      TAccountBubblegumProgram,
      TAccountListState,
      TAccountOwner,
      TAccountTcompProgram,
      TAccountRentDest
    >
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
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
    tcompProgram: { value: input.tcompProgram ?? null, isWritable: false },
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

  const instruction = getDelistInstructionRaw(
    accountMetas as Record<keyof AccountMetas, IAccountMeta>,
    args as DelistInstructionDataArgs,
    programAddress
  );

  return instruction;
}

export function getDelistInstructionRaw<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountMerkleTree extends string | IAccountMeta<string> = string,
  TAccountLogWrapper extends string | IAccountMeta<string> = string,
  TAccountCompressionProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountBubblegumProgram extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
>(
  accounts: {
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
    systemProgram?: TAccountSystemProgram extends string
      ? Address<TAccountSystemProgram>
      : TAccountSystemProgram;
    bubblegumProgram: TAccountBubblegumProgram extends string
      ? Address<TAccountBubblegumProgram>
      : TAccountBubblegumProgram;
    listState: TAccountListState extends string
      ? Address<TAccountListState>
      : TAccountListState;
    owner: TAccountOwner extends string
      ? Address<TAccountOwner>
      : TAccountOwner;
    tcompProgram: TAccountTcompProgram extends string
      ? Address<TAccountTcompProgram>
      : TAccountTcompProgram;
    rentDest?: TAccountRentDest extends string
      ? Address<TAccountRentDest>
      : TAccountRentDest;
  },
  args: DelistInstructionDataArgs,
  programAddress: Address<TProgram> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<TProgram>,
  remainingAccounts?: TRemainingAccounts
) {
  return {
    accounts: [
      accountMetaWithDefault(accounts.treeAuthority, AccountRole.READONLY),
      accountMetaWithDefault(accounts.merkleTree, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.logWrapper, AccountRole.READONLY),
      accountMetaWithDefault(accounts.compressionProgram, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.systemProgram ??
          ('11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>),
        AccountRole.READONLY
      ),
      accountMetaWithDefault(accounts.bubblegumProgram, AccountRole.READONLY),
      accountMetaWithDefault(accounts.listState, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.owner, AccountRole.READONLY_SIGNER),
      accountMetaWithDefault(accounts.tcompProgram, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.rentDest ??
          ('SysvarRent111111111111111111111111111111111' as Address<'SysvarRent111111111111111111111111111111111'>),
        AccountRole.WRITABLE
      ),
      ...(remainingAccounts ?? []),
    ],
    data: getDelistInstructionDataEncoder().encode(args),
    programAddress,
  } as DelistInstruction<
    TProgram,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountListState,
    TAccountOwner,
    TAccountTcompProgram,
    TAccountRentDest,
    TRemainingAccounts
  >;
}

export type ParsedDelistInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[]
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
    tcompProgram: TAccountMetas[8];
    rentDest: TAccountMetas[9];
  };
  data: DelistInstructionData;
};

export function parseDelistInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[]
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedDelistInstruction<TProgram, TAccountMetas> {
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
      tcompProgram: getNextAccount(),
      rentDest: getNextAccount(),
    },
    data: getDelistInstructionDataDecoder().decode(instruction.data),
  };
}