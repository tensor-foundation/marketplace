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
import {
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
  WritableSignerAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import {
  ResolvedAccount,
  accountMetaWithDefault,
  getAccountMetasWithSigners,
} from '../shared';

export type BuyCoreInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTcomp extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TAccountMplCoreProgram extends string | IAccountMeta<string> = string,
  TAccountMarketplaceProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTcomp extends string
        ? WritableAccount<TAccountTcomp>
        : TAccountTcomp,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountAsset extends string
        ? WritableAccount<TAccountAsset>
        : TAccountAsset,
      TAccountCollection extends string
        ? ReadonlyAccount<TAccountCollection>
        : TAccountCollection,
      TAccountBuyer extends string
        ? ReadonlyAccount<TAccountBuyer>
        : TAccountBuyer,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer>
        : TAccountPayer,
      TAccountOwner extends string
        ? WritableAccount<TAccountOwner>
        : TAccountOwner,
      TAccountTakerBroker extends string
        ? WritableAccount<TAccountTakerBroker>
        : TAccountTakerBroker,
      TAccountMakerBroker extends string
        ? WritableAccount<TAccountMakerBroker>
        : TAccountMakerBroker,
      TAccountRentDest extends string
        ? WritableAccount<TAccountRentDest>
        : TAccountRentDest,
      TAccountMplCoreProgram extends string
        ? ReadonlyAccount<TAccountMplCoreProgram>
        : TAccountMplCoreProgram,
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts
    ]
  >;

export type BuyCoreInstructionWithSigners<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTcomp extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TAccountMplCoreProgram extends string | IAccountMeta<string> = string,
  TAccountMarketplaceProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTcomp extends string
        ? WritableAccount<TAccountTcomp>
        : TAccountTcomp,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountAsset extends string
        ? WritableAccount<TAccountAsset>
        : TAccountAsset,
      TAccountCollection extends string
        ? ReadonlyAccount<TAccountCollection>
        : TAccountCollection,
      TAccountBuyer extends string
        ? ReadonlyAccount<TAccountBuyer>
        : TAccountBuyer,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountOwner extends string
        ? WritableAccount<TAccountOwner>
        : TAccountOwner,
      TAccountTakerBroker extends string
        ? WritableAccount<TAccountTakerBroker>
        : TAccountTakerBroker,
      TAccountMakerBroker extends string
        ? WritableAccount<TAccountMakerBroker>
        : TAccountMakerBroker,
      TAccountRentDest extends string
        ? WritableAccount<TAccountRentDest>
        : TAccountRentDest,
      TAccountMplCoreProgram extends string
        ? ReadonlyAccount<TAccountMplCoreProgram>
        : TAccountMplCoreProgram,
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts
    ]
  >;

export type BuyCoreInstructionData = {
  discriminator: Array<number>;
  maxAmount: bigint;
};

export type BuyCoreInstructionDataArgs = { maxAmount: number | bigint };

export function getBuyCoreInstructionDataEncoder() {
  return mapEncoder(
    getStructEncoder<{
      discriminator: Array<number>;
      maxAmount: number | bigint;
    }>([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['maxAmount', getU64Encoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: [169, 227, 87, 255, 76, 86, 255, 25],
    })
  ) satisfies Encoder<BuyCoreInstructionDataArgs>;
}

export function getBuyCoreInstructionDataDecoder() {
  return getStructDecoder<BuyCoreInstructionData>([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['maxAmount', getU64Decoder()],
  ]) satisfies Decoder<BuyCoreInstructionData>;
}

export function getBuyCoreInstructionDataCodec(): Codec<
  BuyCoreInstructionDataArgs,
  BuyCoreInstructionData
> {
  return combineCodec(
    getBuyCoreInstructionDataEncoder(),
    getBuyCoreInstructionDataDecoder()
  );
}

export type BuyCoreInput<
  TAccountTcomp extends string,
  TAccountListState extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountBuyer extends string,
  TAccountPayer extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDest extends string,
  TAccountMplCoreProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string
> = {
  tcomp: Address<TAccountTcomp>;
  listState: Address<TAccountListState>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  buyer: Address<TAccountBuyer>;
  payer: Address<TAccountPayer>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDest?: Address<TAccountRentDest>;
  mplCoreProgram: Address<TAccountMplCoreProgram>;
  marketplaceProgram: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  maxAmount: BuyCoreInstructionDataArgs['maxAmount'];
};

export type BuyCoreInputWithSigners<
  TAccountTcomp extends string,
  TAccountListState extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountBuyer extends string,
  TAccountPayer extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDest extends string,
  TAccountMplCoreProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string
> = {
  tcomp: Address<TAccountTcomp>;
  listState: Address<TAccountListState>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  buyer: Address<TAccountBuyer>;
  payer: TransactionSigner<TAccountPayer>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDest?: Address<TAccountRentDest>;
  mplCoreProgram: Address<TAccountMplCoreProgram>;
  marketplaceProgram: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  maxAmount: BuyCoreInstructionDataArgs['maxAmount'];
};

export function getBuyCoreInstruction<
  TAccountTcomp extends string,
  TAccountListState extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountBuyer extends string,
  TAccountPayer extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDest extends string,
  TAccountMplCoreProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: BuyCoreInputWithSigners<
    TAccountTcomp,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountBuyer,
    TAccountPayer,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDest,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram
  >
): BuyCoreInstructionWithSigners<
  TProgram,
  TAccountTcomp,
  TAccountListState,
  TAccountAsset,
  TAccountCollection,
  TAccountBuyer,
  TAccountPayer,
  TAccountOwner,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountRentDest,
  TAccountMplCoreProgram,
  TAccountMarketplaceProgram,
  TAccountSystemProgram
>;
export function getBuyCoreInstruction<
  TAccountTcomp extends string,
  TAccountListState extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountBuyer extends string,
  TAccountPayer extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDest extends string,
  TAccountMplCoreProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: BuyCoreInput<
    TAccountTcomp,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountBuyer,
    TAccountPayer,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDest,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram
  >
): BuyCoreInstruction<
  TProgram,
  TAccountTcomp,
  TAccountListState,
  TAccountAsset,
  TAccountCollection,
  TAccountBuyer,
  TAccountPayer,
  TAccountOwner,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountRentDest,
  TAccountMplCoreProgram,
  TAccountMarketplaceProgram,
  TAccountSystemProgram
>;
export function getBuyCoreInstruction<
  TAccountTcomp extends string,
  TAccountListState extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountBuyer extends string,
  TAccountPayer extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDest extends string,
  TAccountMplCoreProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: BuyCoreInput<
    TAccountTcomp,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountBuyer,
    TAccountPayer,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDest,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram
  >
): IInstruction {
  // Program address.
  const programAddress =
    'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getBuyCoreInstructionRaw<
      TProgram,
      TAccountTcomp,
      TAccountListState,
      TAccountAsset,
      TAccountCollection,
      TAccountBuyer,
      TAccountPayer,
      TAccountOwner,
      TAccountTakerBroker,
      TAccountMakerBroker,
      TAccountRentDest,
      TAccountMplCoreProgram,
      TAccountMarketplaceProgram,
      TAccountSystemProgram
    >
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
    tcomp: { value: input.tcomp ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    asset: { value: input.asset ?? null, isWritable: true },
    collection: { value: input.collection ?? null, isWritable: false },
    buyer: { value: input.buyer ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    rentDest: { value: input.rentDest ?? null, isWritable: true },
    mplCoreProgram: { value: input.mplCoreProgram ?? null, isWritable: false },
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.rentDest.value) {
    accounts.rentDest.value =
      'SysvarRent111111111111111111111111111111111' as Address<'SysvarRent111111111111111111111111111111111'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  // Get account metas and signers.
  const accountMetas = getAccountMetasWithSigners(
    accounts,
    'programId',
    programAddress
  );

  const instruction = getBuyCoreInstructionRaw(
    accountMetas as Record<keyof AccountMetas, IAccountMeta>,
    args as BuyCoreInstructionDataArgs,
    programAddress
  );

  return instruction;
}

export function getBuyCoreInstructionRaw<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTcomp extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TAccountMplCoreProgram extends string | IAccountMeta<string> = string,
  TAccountMarketplaceProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
>(
  accounts: {
    tcomp: TAccountTcomp extends string
      ? Address<TAccountTcomp>
      : TAccountTcomp;
    listState: TAccountListState extends string
      ? Address<TAccountListState>
      : TAccountListState;
    asset: TAccountAsset extends string
      ? Address<TAccountAsset>
      : TAccountAsset;
    collection?: TAccountCollection extends string
      ? Address<TAccountCollection>
      : TAccountCollection;
    buyer: TAccountBuyer extends string
      ? Address<TAccountBuyer>
      : TAccountBuyer;
    payer: TAccountPayer extends string
      ? Address<TAccountPayer>
      : TAccountPayer;
    owner: TAccountOwner extends string
      ? Address<TAccountOwner>
      : TAccountOwner;
    takerBroker?: TAccountTakerBroker extends string
      ? Address<TAccountTakerBroker>
      : TAccountTakerBroker;
    makerBroker?: TAccountMakerBroker extends string
      ? Address<TAccountMakerBroker>
      : TAccountMakerBroker;
    rentDest?: TAccountRentDest extends string
      ? Address<TAccountRentDest>
      : TAccountRentDest;
    mplCoreProgram: TAccountMplCoreProgram extends string
      ? Address<TAccountMplCoreProgram>
      : TAccountMplCoreProgram;
    marketplaceProgram: TAccountMarketplaceProgram extends string
      ? Address<TAccountMarketplaceProgram>
      : TAccountMarketplaceProgram;
    systemProgram?: TAccountSystemProgram extends string
      ? Address<TAccountSystemProgram>
      : TAccountSystemProgram;
  },
  args: BuyCoreInstructionDataArgs,
  programAddress: Address<TProgram> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<TProgram>,
  remainingAccounts?: TRemainingAccounts
) {
  return {
    accounts: [
      accountMetaWithDefault(accounts.tcomp, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.listState, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.asset, AccountRole.WRITABLE),
      accountMetaWithDefault(
        accounts.collection ?? {
          address:
            'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>,
          role: AccountRole.READONLY,
        },
        AccountRole.READONLY
      ),
      accountMetaWithDefault(accounts.buyer, AccountRole.READONLY),
      accountMetaWithDefault(accounts.payer, AccountRole.WRITABLE_SIGNER),
      accountMetaWithDefault(accounts.owner, AccountRole.WRITABLE),
      accountMetaWithDefault(
        accounts.takerBroker ?? {
          address:
            'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>,
          role: AccountRole.READONLY,
        },
        AccountRole.WRITABLE
      ),
      accountMetaWithDefault(
        accounts.makerBroker ?? {
          address:
            'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>,
          role: AccountRole.READONLY,
        },
        AccountRole.WRITABLE
      ),
      accountMetaWithDefault(
        accounts.rentDest ??
          ('SysvarRent111111111111111111111111111111111' as Address<'SysvarRent111111111111111111111111111111111'>),
        AccountRole.WRITABLE
      ),
      accountMetaWithDefault(accounts.mplCoreProgram, AccountRole.READONLY),
      accountMetaWithDefault(accounts.marketplaceProgram, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.systemProgram ??
          ('11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>),
        AccountRole.READONLY
      ),
      ...(remainingAccounts ?? []),
    ],
    data: getBuyCoreInstructionDataEncoder().encode(args),
    programAddress,
  } as BuyCoreInstruction<
    TProgram,
    TAccountTcomp,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountBuyer,
    TAccountPayer,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDest,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TRemainingAccounts
  >;
}

export type ParsedBuyCoreInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[]
> = {
  programAddress: Address<TProgram>;
  accounts: {
    tcomp: TAccountMetas[0];
    listState: TAccountMetas[1];
    asset: TAccountMetas[2];
    collection?: TAccountMetas[3] | undefined;
    buyer: TAccountMetas[4];
    payer: TAccountMetas[5];
    owner: TAccountMetas[6];
    takerBroker?: TAccountMetas[7] | undefined;
    makerBroker?: TAccountMetas[8] | undefined;
    rentDest: TAccountMetas[9];
    mplCoreProgram: TAccountMetas[10];
    marketplaceProgram: TAccountMetas[11];
    systemProgram: TAccountMetas[12];
  };
  data: BuyCoreInstructionData;
};

export function parseBuyCoreInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[]
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedBuyCoreInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 13) {
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
      tcomp: getNextAccount(),
      listState: getNextAccount(),
      asset: getNextAccount(),
      collection: getNextOptionalAccount(),
      buyer: getNextAccount(),
      payer: getNextAccount(),
      owner: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      rentDest: getNextAccount(),
      mplCoreProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getBuyCoreInstructionDataDecoder().decode(instruction.data),
  };
}
