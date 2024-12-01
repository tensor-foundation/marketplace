/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
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
  type IAccountSignerMeta,
  type IInstruction,
  type IInstructionWithAccounts,
  type IInstructionWithData,
  type ReadonlyAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import { findAssetListStatePda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  expectAddress,
  expectTransactionSigner,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export const DELIST_CORE_DISCRIMINATOR = new Uint8Array([
  56, 24, 231, 2, 227, 19, 14, 68,
]);

export function getDelistCoreDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(DELIST_CORE_DISCRIMINATOR);
}

export type DelistCoreInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountMplCoreProgram extends
    | string
    | IAccountMeta<string> = 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
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
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      ...TRemainingAccounts,
    ]
  >;

export type DelistCoreInstructionData = { discriminator: ReadonlyUint8Array };

export type DelistCoreInstructionDataArgs = {};

export function getDelistCoreInstructionDataEncoder(): Encoder<DelistCoreInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([['discriminator', fixEncoderSize(getBytesEncoder(), 8)]]),
    (value) => ({ ...value, discriminator: DELIST_CORE_DISCRIMINATOR })
  );
}

export function getDelistCoreInstructionDataDecoder(): Decoder<DelistCoreInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
  ]);
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

export type DelistCoreAsyncInput<
  TAccountAsset extends string = string,
  TAccountCollection extends string = string,
  TAccountOwner extends string = string,
  TAccountListState extends string = string,
  TAccountMplCoreProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountRentDestination extends string = string,
> = {
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  owner: TransactionSigner<TAccountOwner>;
  listState?: Address<TAccountListState>;
  mplCoreProgram?: Address<TAccountMplCoreProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  rentDestination?: Address<TAccountRentDestination>;
};

export async function getDelistCoreInstructionAsync<
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountOwner extends string,
  TAccountListState extends string,
  TAccountMplCoreProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRentDestination extends string,
  TProgramAddress extends Address = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
>(
  input: DelistCoreAsyncInput<
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountListState,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountRentDestination
  >,
  config?: { programAddress?: TProgramAddress }
): Promise<
  DelistCoreInstruction<
    TProgramAddress,
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountListState,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountRentDestination
  >
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    asset: { value: input.asset ?? null, isWritable: true },
    collection: { value: input.collection ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    mplCoreProgram: { value: input.mplCoreProgram ?? null, isWritable: false },
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
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
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectTransactionSigner(
      accounts.owner.value
    ).address;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.asset),
      getAccountMeta(accounts.collection),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.mplCoreProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.rentDestination),
    ],
    programAddress,
    data: getDelistCoreInstructionDataEncoder().encode({}),
  } as DelistCoreInstruction<
    TProgramAddress,
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountListState,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountRentDestination
  >;

  return instruction;
}

export type DelistCoreInput<
  TAccountAsset extends string = string,
  TAccountCollection extends string = string,
  TAccountOwner extends string = string,
  TAccountListState extends string = string,
  TAccountMplCoreProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountRentDestination extends string = string,
> = {
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  owner: TransactionSigner<TAccountOwner>;
  listState: Address<TAccountListState>;
  mplCoreProgram?: Address<TAccountMplCoreProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  rentDestination?: Address<TAccountRentDestination>;
};

export function getDelistCoreInstruction<
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountOwner extends string,
  TAccountListState extends string,
  TAccountMplCoreProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountRentDestination extends string,
  TProgramAddress extends Address = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
>(
  input: DelistCoreInput<
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountListState,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountRentDestination
  >,
  config?: { programAddress?: TProgramAddress }
): DelistCoreInstruction<
  TProgramAddress,
  TAccountAsset,
  TAccountCollection,
  TAccountOwner,
  TAccountListState,
  TAccountMplCoreProgram,
  TAccountMarketplaceProgram,
  TAccountSystemProgram,
  TAccountRentDestination
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    asset: { value: input.asset ?? null, isWritable: true },
    collection: { value: input.collection ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    mplCoreProgram: { value: input.mplCoreProgram ?? null, isWritable: false },
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
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
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectTransactionSigner(
      accounts.owner.value
    ).address;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.asset),
      getAccountMeta(accounts.collection),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.mplCoreProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.rentDestination),
    ],
    programAddress,
    data: getDelistCoreInstructionDataEncoder().encode({}),
  } as DelistCoreInstruction<
    TProgramAddress,
    TAccountAsset,
    TAccountCollection,
    TAccountOwner,
    TAccountListState,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountRentDestination
  >;

  return instruction;
}

export type ParsedDelistCoreInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    asset: TAccountMetas[0];
    collection?: TAccountMetas[1] | undefined;
    owner: TAccountMetas[2];
    listState: TAccountMetas[3];
    mplCoreProgram: TAccountMetas[4];
    marketplaceProgram: TAccountMetas[5];
    systemProgram: TAccountMetas[6];
    rentDestination: TAccountMetas[7];
  };
  data: DelistCoreInstructionData;
};

export function parseDelistCoreInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
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
    return accountMeta.address === TENSOR_MARKETPLACE_PROGRAM_ADDRESS
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
      marketplaceProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      rentDestination: getNextAccount(),
    },
    data: getDelistCoreInstructionDataDecoder().decode(instruction.data),
  };
}
