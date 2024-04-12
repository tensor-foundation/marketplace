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
  getStructDecoder,
  getStructEncoder,
} from '@solana/codecs-data-structures';
import { getU8Decoder, getU8Encoder } from '@solana/codecs-numbers';
import {
  AccountRole,
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  WritableAccount,
  WritableSignerAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import {
  ResolvedAccount,
  accountMetaWithDefault,
  getAccountMetasWithSigners,
} from '../shared';

export type DelistCoreInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountMplCoreProgram extends string | IAccountMeta<string> = string,
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountAsset extends string
        ? WritableAccount<TAccountAsset>
        : TAccountAsset,
      TAccountCollection extends string
        ? ReadonlyAccount<TAccountCollection>
        : TAccountCollection,
      TAccountOwner extends string
        ? WritableSignerAccount<TAccountOwner>
        : TAccountOwner,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountMplCoreProgram extends string
        ? ReadonlyAccount<TAccountMplCoreProgram>
        : TAccountMplCoreProgram,
      TAccountTcompProgram extends string
        ? ReadonlyAccount<TAccountTcompProgram>
        : TAccountTcompProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountRentDest extends string
        ? WritableSignerAccount<TAccountRentDest>
        : TAccountRentDest,
      ...TRemainingAccounts
    ]
  >;

export type DelistCoreInstructionWithSigners<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountMplCoreProgram extends string | IAccountMeta<string> = string,
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountAsset extends string
        ? WritableAccount<TAccountAsset>
        : TAccountAsset,
      TAccountCollection extends string
        ? ReadonlyAccount<TAccountCollection>
        : TAccountCollection,
      TAccountOwner extends string
        ? WritableSignerAccount<TAccountOwner> &
            IAccountSignerMeta<TAccountOwner>
        : TAccountOwner,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountMplCoreProgram extends string
        ? ReadonlyAccount<TAccountMplCoreProgram>
        : TAccountMplCoreProgram,
      TAccountTcompProgram extends string
        ? ReadonlyAccount<TAccountTcompProgram>
        : TAccountTcompProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountRentDest extends string
        ? WritableSignerAccount<TAccountRentDest> &
            IAccountSignerMeta<TAccountRentDest>
        : TAccountRentDest,
      ...TRemainingAccounts
    ]
  >;

export type DelistCoreInstructionData = { discriminator: Array<number> };

export type DelistCoreInstructionDataArgs = {};

export function getDelistCoreInstructionDataEncoder() {
  return mapEncoder(
    getStructEncoder<{ discriminator: Array<number> }>([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
    ]),
    (value) => ({ ...value, discriminator: [56, 24, 231, 2, 227, 19, 14, 68] })
  ) satisfies Encoder<DelistCoreInstructionDataArgs>;
}

export function getDelistCoreInstructionDataDecoder() {
  return getStructDecoder<DelistCoreInstructionData>([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
  ]) satisfies Decoder<DelistCoreInstructionData>;
}

export function getDelistCoreInstructionDataCodec(): Codec<
  DelistCoreInstructionDataArgs,
  DelistCoreInstructionData
> {
  return combineCodec(
    getDelistCoreInstructionDataEncoder(),
    getDelistCoreInstructionDataDecoder()
  );
}

export type DelistCoreInput<
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountOwner extends string,
  TAccountListState extends string,
  TAccountMplCoreProgram extends string,
  TAccountTcompProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRentDest extends string
> = {
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  owner: Address<TAccountOwner>;
  listState: Address<TAccountListState>;
  mplCoreProgram: Address<TAccountMplCoreProgram>;
  tcompProgram: Address<TAccountTcompProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  rentDest?: Address<TAccountRentDest>;
};

export type DelistCoreInputWithSigners<
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountOwner extends string,
  TAccountListState extends string,
  TAccountMplCoreProgram extends string,
  TAccountTcompProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRentDest extends string
> = {
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  owner: TransactionSigner<TAccountOwner>;
  listState: Address<TAccountListState>;
  mplCoreProgram: Address<TAccountMplCoreProgram>;
  tcompProgram: Address<TAccountTcompProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  rentDest?: TransactionSigner<TAccountRentDest>;
};

export function getDelistCoreInstruction<
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountOwner extends string,
  TAccountListState extends string,
  TAccountMplCoreProgram extends string,
  TAccountTcompProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: DelistCoreInputWithSigners<
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountListState,
    TAccountMplCoreProgram,
    TAccountTcompProgram,
    TAccountSystemProgram,
    TAccountRentDest
  >
): DelistCoreInstructionWithSigners<
  TProgram,
  TAccountAsset,
  TAccountCollection,
  TAccountOwner,
  TAccountListState,
  TAccountMplCoreProgram,
  TAccountTcompProgram,
  TAccountSystemProgram,
  TAccountRentDest
>;
export function getDelistCoreInstruction<
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountOwner extends string,
  TAccountListState extends string,
  TAccountMplCoreProgram extends string,
  TAccountTcompProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: DelistCoreInput<
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountListState,
    TAccountMplCoreProgram,
    TAccountTcompProgram,
    TAccountSystemProgram,
    TAccountRentDest
  >
): DelistCoreInstruction<
  TProgram,
  TAccountAsset,
  TAccountCollection,
  TAccountOwner,
  TAccountListState,
  TAccountMplCoreProgram,
  TAccountTcompProgram,
  TAccountSystemProgram,
  TAccountRentDest
>;
export function getDelistCoreInstruction<
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountOwner extends string,
  TAccountListState extends string,
  TAccountMplCoreProgram extends string,
  TAccountTcompProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: DelistCoreInput<
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountListState,
    TAccountMplCoreProgram,
    TAccountTcompProgram,
    TAccountSystemProgram,
    TAccountRentDest
  >
): IInstruction {
  // Program address.
  const programAddress =
    'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getDelistCoreInstructionRaw<
      TProgram,
      TAccountAsset,
      TAccountCollection,
      TAccountOwner,
      TAccountListState,
      TAccountMplCoreProgram,
      TAccountTcompProgram,
      TAccountSystemProgram,
      TAccountRentDest
    >
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
    asset: { value: input.asset ?? null, isWritable: true },
    collection: { value: input.collection ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    mplCoreProgram: { value: input.mplCoreProgram ?? null, isWritable: false },
    tcompProgram: { value: input.tcompProgram ?? null, isWritable: false },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    rentDest: { value: input.rentDest ?? null, isWritable: true },
  };

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

  const instruction = getDelistCoreInstructionRaw(
    accountMetas as Record<keyof AccountMetas, IAccountMeta>,
    programAddress
  );

  return instruction;
}

export function getDelistCoreInstructionRaw<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountMplCoreProgram extends string | IAccountMeta<string> = string,
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
>(
  accounts: {
    asset: TAccountAsset extends string
      ? Address<TAccountAsset>
      : TAccountAsset;
    collection?: TAccountCollection extends string
      ? Address<TAccountCollection>
      : TAccountCollection;
    owner: TAccountOwner extends string
      ? Address<TAccountOwner>
      : TAccountOwner;
    listState: TAccountListState extends string
      ? Address<TAccountListState>
      : TAccountListState;
    mplCoreProgram: TAccountMplCoreProgram extends string
      ? Address<TAccountMplCoreProgram>
      : TAccountMplCoreProgram;
    tcompProgram: TAccountTcompProgram extends string
      ? Address<TAccountTcompProgram>
      : TAccountTcompProgram;
    systemProgram?: TAccountSystemProgram extends string
      ? Address<TAccountSystemProgram>
      : TAccountSystemProgram;
    rentDest?: TAccountRentDest extends string
      ? Address<TAccountRentDest>
      : TAccountRentDest;
  },
  programAddress: Address<TProgram> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<TProgram>,
  remainingAccounts?: TRemainingAccounts
) {
  return {
    accounts: [
      accountMetaWithDefault(accounts.asset, AccountRole.WRITABLE),
      accountMetaWithDefault(
        accounts.collection ?? {
          address:
            'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>,
          role: AccountRole.READONLY,
        },
        AccountRole.READONLY
      ),
      accountMetaWithDefault(accounts.owner, AccountRole.WRITABLE_SIGNER),
      accountMetaWithDefault(accounts.listState, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.mplCoreProgram, AccountRole.READONLY),
      accountMetaWithDefault(accounts.tcompProgram, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.systemProgram ??
          ('11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>),
        AccountRole.READONLY
      ),
      accountMetaWithDefault(
        accounts.rentDest ??
          ('SysvarRent111111111111111111111111111111111' as Address<'SysvarRent111111111111111111111111111111111'>),
        AccountRole.WRITABLE_SIGNER
      ),
      ...(remainingAccounts ?? []),
    ],
    data: getDelistCoreInstructionDataEncoder().encode({}),
    programAddress,
  } as DelistCoreInstruction<
    TProgram,
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountListState,
    TAccountMplCoreProgram,
    TAccountTcompProgram,
    TAccountSystemProgram,
    TAccountRentDest,
    TRemainingAccounts
  >;
}

export type ParsedDelistCoreInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[]
> = {
  programAddress: Address<TProgram>;
  accounts: {
    asset: TAccountMetas[0];
    collection?: TAccountMetas[1] | undefined;
    owner: TAccountMetas[2];
    listState: TAccountMetas[3];
    mplCoreProgram: TAccountMetas[4];
    tcompProgram: TAccountMetas[5];
    systemProgram: TAccountMetas[6];
    rentDest: TAccountMetas[7];
  };
  data: DelistCoreInstructionData;
};

export function parseDelistCoreInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[]
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedDelistCoreInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 8) {
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
    return accountMeta.address === 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
      ? undefined
      : accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      asset: getNextAccount(),
      collection: getNextOptionalAccount(),
      owner: getNextAccount(),
      listState: getNextAccount(),
      mplCoreProgram: getNextAccount(),
      tcompProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      rentDest: getNextAccount(),
    },
    data: getDelistCoreInstructionDataDecoder().decode(instruction.data),
  };
}
