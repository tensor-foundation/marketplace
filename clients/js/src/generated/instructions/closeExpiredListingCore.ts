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
  transformEncoder,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
  type IAccountMeta,
  type IInstruction,
  type IInstructionWithAccounts,
  type IInstructionWithData,
  type ReadonlyAccount,
  type ReadonlyUint8Array,
  type WritableAccount,
} from '@solana/web3.js';
import { findAssetListStatePda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  expectAddress,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export type CloseExpiredListingCoreInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountMplCoreProgram extends
    | string
    | IAccountMeta<string> = 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountAsset extends string
        ? WritableAccount<TAccountAsset>
        : TAccountAsset,
      TAccountCollection extends string
        ? ReadonlyAccount<TAccountCollection>
        : TAccountCollection,
      TAccountOwner extends string
        ? ReadonlyAccount<TAccountOwner>
        : TAccountOwner,
      TAccountMplCoreProgram extends string
        ? ReadonlyAccount<TAccountMplCoreProgram>
        : TAccountMplCoreProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      ...TRemainingAccounts,
    ]
  >;

export type CloseExpiredListingCoreInstructionData = {
  discriminator: ReadonlyUint8Array;
};

export type CloseExpiredListingCoreInstructionDataArgs = {};

export function getCloseExpiredListingCoreInstructionDataEncoder(): Encoder<CloseExpiredListingCoreInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([['discriminator', fixEncoderSize(getBytesEncoder(), 8)]]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([89, 171, 78, 80, 74, 188, 63, 58]),
    })
  );
}

export function getCloseExpiredListingCoreInstructionDataDecoder(): Decoder<CloseExpiredListingCoreInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
  ]);
}

export function getCloseExpiredListingCoreInstructionDataCodec(): Codec<
  CloseExpiredListingCoreInstructionDataArgs,
  CloseExpiredListingCoreInstructionData
> {
  return combineCodec(
    getCloseExpiredListingCoreInstructionDataEncoder(),
    getCloseExpiredListingCoreInstructionDataDecoder()
  );
}

export type CloseExpiredListingCoreAsyncInput<
  TAccountListState extends string = string,
  TAccountAsset extends string = string,
  TAccountCollection extends string = string,
  TAccountOwner extends string = string,
  TAccountMplCoreProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountRentDestination extends string = string,
> = {
  listState?: Address<TAccountListState>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  owner: Address<TAccountOwner>;
  mplCoreProgram?: Address<TAccountMplCoreProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  rentDestination: Address<TAccountRentDestination>;
};

export async function getCloseExpiredListingCoreInstructionAsync<
  TAccountListState extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountOwner extends string,
  TAccountMplCoreProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountRentDestination extends string,
>(
  input: CloseExpiredListingCoreAsyncInput<
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountRentDestination
  >
): Promise<
  CloseExpiredListingCoreInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountRentDestination
  >
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    listState: { value: input.listState ?? null, isWritable: true },
    asset: { value: input.asset ?? null, isWritable: true },
    collection: { value: input.collection ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: false },
    mplCoreProgram: { value: input.mplCoreProgram ?? null, isWritable: false },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
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

  // Resolve default values.
  if (!accounts.listState.value) {
    accounts.listState.value = await findAssetListStatePda({
      asset: expectAddress(accounts.asset.value),
    });
  }
  if (!accounts.mplCoreProgram.value) {
    accounts.mplCoreProgram.value =
      'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d' as Address<'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.asset),
      getAccountMeta(accounts.collection),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.mplCoreProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.rentDestination),
    ],
    programAddress,
    data: getCloseExpiredListingCoreInstructionDataEncoder().encode({}),
  } as CloseExpiredListingCoreInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountRentDestination
  >;

  return instruction;
}

export type CloseExpiredListingCoreInput<
  TAccountListState extends string = string,
  TAccountAsset extends string = string,
  TAccountCollection extends string = string,
  TAccountOwner extends string = string,
  TAccountMplCoreProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountRentDestination extends string = string,
> = {
  listState: Address<TAccountListState>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  owner: Address<TAccountOwner>;
  mplCoreProgram?: Address<TAccountMplCoreProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  rentDestination: Address<TAccountRentDestination>;
};

export function getCloseExpiredListingCoreInstruction<
  TAccountListState extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountOwner extends string,
  TAccountMplCoreProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountRentDestination extends string,
>(
  input: CloseExpiredListingCoreInput<
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountRentDestination
  >
): CloseExpiredListingCoreInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountListState,
  TAccountAsset,
  TAccountCollection,
  TAccountOwner,
  TAccountMplCoreProgram,
  TAccountSystemProgram,
  TAccountMarketplaceProgram,
  TAccountRentDestination
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    listState: { value: input.listState ?? null, isWritable: true },
    asset: { value: input.asset ?? null, isWritable: true },
    collection: { value: input.collection ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: false },
    mplCoreProgram: { value: input.mplCoreProgram ?? null, isWritable: false },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
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

  // Resolve default values.
  if (!accounts.mplCoreProgram.value) {
    accounts.mplCoreProgram.value =
      'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d' as Address<'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.asset),
      getAccountMeta(accounts.collection),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.mplCoreProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.rentDestination),
    ],
    programAddress,
    data: getCloseExpiredListingCoreInstructionDataEncoder().encode({}),
  } as CloseExpiredListingCoreInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountRentDestination
  >;

  return instruction;
}

export type ParsedCloseExpiredListingCoreInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    listState: TAccountMetas[0];
    asset: TAccountMetas[1];
    collection?: TAccountMetas[2] | undefined;
    owner: TAccountMetas[3];
    mplCoreProgram: TAccountMetas[4];
    systemProgram: TAccountMetas[5];
    marketplaceProgram: TAccountMetas[6];
    rentDestination: TAccountMetas[7];
  };
  data: CloseExpiredListingCoreInstructionData;
};

export function parseCloseExpiredListingCoreInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCloseExpiredListingCoreInstruction<TProgram, TAccountMetas> {
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
    return accountMeta.address === TENSOR_MARKETPLACE_PROGRAM_ADDRESS
      ? undefined
      : accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      listState: getNextAccount(),
      asset: getNextAccount(),
      collection: getNextOptionalAccount(),
      owner: getNextAccount(),
      mplCoreProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      rentDestination: getNextAccount(),
    },
    data: getCloseExpiredListingCoreInstructionDataDecoder().decode(
      instruction.data
    ),
  };
}
