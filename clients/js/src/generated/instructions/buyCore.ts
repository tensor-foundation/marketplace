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
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  getU8Decoder,
  getU8Encoder,
  mapEncoder,
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
import { findFeeVaultPda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';

export type BuyCoreInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountRentDest extends string | IAccountMeta<string> = string,
  TAccountMplCoreProgram extends
    | string
    | IAccountMeta<string> = 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountFeeVault extends string
        ? WritableAccount<TAccountFeeVault>
        : TAccountFeeVault,
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
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      ...TRemainingAccounts,
    ]
  >;

export type BuyCoreInstructionData = {
  discriminator: Array<number>;
  maxAmount: bigint;
};

export type BuyCoreInstructionDataArgs = { maxAmount: number | bigint };

export function getBuyCoreInstructionDataEncoder(): Encoder<BuyCoreInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['maxAmount', getU64Encoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: [169, 227, 87, 255, 76, 86, 255, 25],
    })
  );
}

export function getBuyCoreInstructionDataDecoder(): Decoder<BuyCoreInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['maxAmount', getU64Decoder()],
  ]);
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

export type BuyCoreAsyncInput<
  TAccountFeeVault extends string = string,
  TAccountListState extends string = string,
  TAccountAsset extends string = string,
  TAccountCollection extends string = string,
  TAccountBuyer extends string = string,
  TAccountPayer extends string = string,
  TAccountOwner extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountRentDest extends string = string,
  TAccountMplCoreProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault?: Address<TAccountFeeVault>;
  listState: Address<TAccountListState>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  buyer: Address<TAccountBuyer>;
  payer: TransactionSigner<TAccountPayer>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDest: Address<TAccountRentDest>;
  mplCoreProgram?: Address<TAccountMplCoreProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  maxAmount: BuyCoreInstructionDataArgs['maxAmount'];
};

export async function getBuyCoreInstructionAsync<
  TAccountFeeVault extends string,
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
>(
  input: BuyCoreAsyncInput<
    TAccountFeeVault,
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
): Promise<
  BuyCoreInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
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
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
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
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.feeVault.value) {
    accounts.feeVault.value = await findFeeVaultPda();
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

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.asset),
      getAccountMeta(accounts.collection),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.rentDest),
      getAccountMeta(accounts.mplCoreProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getBuyCoreInstructionDataEncoder().encode(
      args as BuyCoreInstructionDataArgs
    ),
  } as BuyCoreInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
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

  return instruction;
}

export type BuyCoreInput<
  TAccountFeeVault extends string = string,
  TAccountListState extends string = string,
  TAccountAsset extends string = string,
  TAccountCollection extends string = string,
  TAccountBuyer extends string = string,
  TAccountPayer extends string = string,
  TAccountOwner extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountRentDest extends string = string,
  TAccountMplCoreProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  listState: Address<TAccountListState>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  buyer: Address<TAccountBuyer>;
  payer: TransactionSigner<TAccountPayer>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDest: Address<TAccountRentDest>;
  mplCoreProgram?: Address<TAccountMplCoreProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  maxAmount: BuyCoreInstructionDataArgs['maxAmount'];
};

export function getBuyCoreInstruction<
  TAccountFeeVault extends string,
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
  TAccountCosigner extends string,
>(
  input: BuyCoreInput<
    TAccountFeeVault,
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
    TAccountCosigner
  >
): BuyCoreInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault,
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
  TAccountCosigner
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
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
    cosigner: { value: input.cosigner ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

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

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.asset),
      getAccountMeta(accounts.collection),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.rentDest),
      getAccountMeta(accounts.mplCoreProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.cosigner),
    ],
    programAddress,
    data: getBuyCoreInstructionDataEncoder().encode(
      args as BuyCoreInstructionDataArgs
    ),
  } as BuyCoreInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
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
    TAccountCosigner
  >;

  return instruction;
}

export type ParsedBuyCoreInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
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
    cosigner?: TAccountMetas[13] | undefined;
  };
  data: BuyCoreInstructionData;
};

export function parseBuyCoreInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedBuyCoreInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 14) {
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
      feeVault: getNextAccount(),
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
      cosigner: getNextOptionalAccount(),
    },
    data: getBuyCoreInstructionDataDecoder().decode(instruction.data),
  };
}
