/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  AccountRole,
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
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
  type WritableSignerAccount,
} from '@solana/web3.js';
import {
  resolveCreatorsCurrencyAta,
  resolveFeeVaultCurrencyAta,
  resolveFeeVaultPdaFromListState,
  resolveMakerBrokerCurrencyAta,
  resolveOwnerCurrencyAta,
  resolvePayerCurrencyAta,
  resolveTakerBrokerCurrencyAta,
} from '@tensor-foundation/resolvers';
import { findAssetListStatePda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  expectAddress,
  expectSome,
  expectTransactionSigner,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export type BuyCoreSplInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountFeeVaultCurrencyTa extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountCurrency extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountOwnerCurrencyTa extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountPayerCurrencyTa extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountTakerBrokerTa extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBrokerTa extends string | IAccountMeta<string> = string,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TAccountCurrencyTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TAccountAssociatedTokenProgram extends
    | string
    | IAccountMeta<string> = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
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
      TAccountFeeVaultCurrencyTa extends string
        ? WritableAccount<TAccountFeeVaultCurrencyTa>
        : TAccountFeeVaultCurrencyTa,
      TAccountBuyer extends string
        ? ReadonlyAccount<TAccountBuyer>
        : TAccountBuyer,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountAsset extends string
        ? WritableAccount<TAccountAsset>
        : TAccountAsset,
      TAccountCollection extends string
        ? ReadonlyAccount<TAccountCollection>
        : TAccountCollection,
      TAccountCurrency extends string
        ? ReadonlyAccount<TAccountCurrency>
        : TAccountCurrency,
      TAccountOwner extends string
        ? WritableAccount<TAccountOwner>
        : TAccountOwner,
      TAccountOwnerCurrencyTa extends string
        ? WritableAccount<TAccountOwnerCurrencyTa>
        : TAccountOwnerCurrencyTa,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountPayerCurrencyTa extends string
        ? WritableAccount<TAccountPayerCurrencyTa>
        : TAccountPayerCurrencyTa,
      TAccountTakerBroker extends string
        ? WritableAccount<TAccountTakerBroker>
        : TAccountTakerBroker,
      TAccountTakerBrokerTa extends string
        ? WritableAccount<TAccountTakerBrokerTa>
        : TAccountTakerBrokerTa,
      TAccountMakerBroker extends string
        ? WritableAccount<TAccountMakerBroker>
        : TAccountMakerBroker,
      TAccountMakerBrokerTa extends string
        ? WritableAccount<TAccountMakerBrokerTa>
        : TAccountMakerBrokerTa,
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      TAccountCurrencyTokenProgram extends string
        ? ReadonlyAccount<TAccountCurrencyTokenProgram>
        : TAccountCurrencyTokenProgram,
      TAccountAssociatedTokenProgram extends string
        ? ReadonlyAccount<TAccountAssociatedTokenProgram>
        : TAccountAssociatedTokenProgram,
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

export type BuyCoreSplInstructionData = {
  discriminator: ReadonlyUint8Array;
  maxAmount: bigint;
};

export type BuyCoreSplInstructionDataArgs = { maxAmount: number | bigint };

export function getBuyCoreSplInstructionDataEncoder(): Encoder<BuyCoreSplInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['maxAmount', getU64Encoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([234, 28, 37, 122, 114, 239, 233, 208]),
    })
  );
}

export function getBuyCoreSplInstructionDataDecoder(): Decoder<BuyCoreSplInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['maxAmount', getU64Decoder()],
  ]);
}

export function getBuyCoreSplInstructionDataCodec(): Codec<
  BuyCoreSplInstructionDataArgs,
  BuyCoreSplInstructionData
> {
  return combineCodec(
    getBuyCoreSplInstructionDataEncoder(),
    getBuyCoreSplInstructionDataDecoder()
  );
}

export type BuyCoreSplInstructionExtraArgs = {
  creators: Array<Address>;
  creatorsCurrencyTa: Array<Address>;
};

export type BuyCoreSplAsyncInput<
  TAccountFeeVault extends string = string,
  TAccountFeeVaultCurrencyTa extends string = string,
  TAccountBuyer extends string = string,
  TAccountListState extends string = string,
  TAccountAsset extends string = string,
  TAccountCollection extends string = string,
  TAccountCurrency extends string = string,
  TAccountOwner extends string = string,
  TAccountOwnerCurrencyTa extends string = string,
  TAccountPayer extends string = string,
  TAccountPayerCurrencyTa extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountTakerBrokerTa extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountMakerBrokerTa extends string = string,
  TAccountRentDestination extends string = string,
  TAccountCurrencyTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMplCoreProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault?: Address<TAccountFeeVault>;
  feeVaultCurrencyTa?: Address<TAccountFeeVaultCurrencyTa>;
  buyer?: Address<TAccountBuyer>;
  listState?: Address<TAccountListState>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  currency: Address<TAccountCurrency>;
  owner: Address<TAccountOwner>;
  ownerCurrencyTa?: Address<TAccountOwnerCurrencyTa>;
  payer: TransactionSigner<TAccountPayer>;
  payerCurrencyTa?: Address<TAccountPayerCurrencyTa>;
  takerBroker?: Address<TAccountTakerBroker>;
  takerBrokerTa?: Address<TAccountTakerBrokerTa>;
  makerBroker?: Address<TAccountMakerBroker>;
  makerBrokerTa?: Address<TAccountMakerBrokerTa>;
  rentDestination?: Address<TAccountRentDestination>;
  /** Token Program used for the currency. */
  currencyTokenProgram?: Address<TAccountCurrencyTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  mplCoreProgram?: Address<TAccountMplCoreProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  maxAmount: BuyCoreSplInstructionDataArgs['maxAmount'];
  creators: BuyCoreSplInstructionExtraArgs['creators'];
  creatorsCurrencyTa?: BuyCoreSplInstructionExtraArgs['creatorsCurrencyTa'];
};

export async function getBuyCoreSplInstructionAsync<
  TAccountFeeVault extends string,
  TAccountFeeVaultCurrencyTa extends string,
  TAccountBuyer extends string,
  TAccountListState extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountCurrency extends string,
  TAccountOwner extends string,
  TAccountOwnerCurrencyTa extends string,
  TAccountPayer extends string,
  TAccountPayerCurrencyTa extends string,
  TAccountTakerBroker extends string,
  TAccountTakerBrokerTa extends string,
  TAccountMakerBroker extends string,
  TAccountMakerBrokerTa extends string,
  TAccountRentDestination extends string,
  TAccountCurrencyTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMplCoreProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountCosigner extends string,
>(
  input: BuyCoreSplAsyncInput<
    TAccountFeeVault,
    TAccountFeeVaultCurrencyTa,
    TAccountBuyer,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountCurrency,
    TAccountOwner,
    TAccountOwnerCurrencyTa,
    TAccountPayer,
    TAccountPayerCurrencyTa,
    TAccountTakerBroker,
    TAccountTakerBrokerTa,
    TAccountMakerBroker,
    TAccountMakerBrokerTa,
    TAccountRentDestination,
    TAccountCurrencyTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountCosigner
  >
): Promise<
  BuyCoreSplInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountFeeVaultCurrencyTa,
    TAccountBuyer,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountCurrency,
    TAccountOwner,
    TAccountOwnerCurrencyTa,
    TAccountPayer,
    TAccountPayerCurrencyTa,
    TAccountTakerBroker,
    TAccountTakerBrokerTa,
    TAccountMakerBroker,
    TAccountMakerBrokerTa,
    TAccountRentDestination,
    TAccountCurrencyTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountCosigner
  >
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    feeVaultCurrencyTa: {
      value: input.feeVaultCurrencyTa ?? null,
      isWritable: true,
    },
    buyer: { value: input.buyer ?? null, isWritable: false },
    listState: { value: input.listState ?? null, isWritable: true },
    asset: { value: input.asset ?? null, isWritable: true },
    collection: { value: input.collection ?? null, isWritable: false },
    currency: { value: input.currency ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    ownerCurrencyTa: { value: input.ownerCurrencyTa ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
    payerCurrencyTa: { value: input.payerCurrencyTa ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    takerBrokerTa: { value: input.takerBrokerTa ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    makerBrokerTa: { value: input.makerBrokerTa ?? null, isWritable: true },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
    currencyTokenProgram: {
      value: input.currencyTokenProgram ?? null,
      isWritable: false,
    },
    associatedTokenProgram: {
      value: input.associatedTokenProgram ?? null,
      isWritable: false,
    },
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

  // Resolver scope.
  const resolverScope = { programAddress, accounts, args };

  // Resolve default values.
  if (!accounts.listState.value) {
    accounts.listState.value = await findAssetListStatePda({
      asset: expectAddress(accounts.asset.value),
    });
  }
  if (!accounts.feeVault.value) {
    accounts.feeVault = {
      ...accounts.feeVault,
      ...(await resolveFeeVaultPdaFromListState(resolverScope)),
    };
  }
  if (!accounts.currencyTokenProgram.value) {
    accounts.currencyTokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
  }
  if (!accounts.feeVaultCurrencyTa.value) {
    accounts.feeVaultCurrencyTa = {
      ...accounts.feeVaultCurrencyTa,
      ...(await resolveFeeVaultCurrencyAta(resolverScope)),
    };
  }
  if (!accounts.buyer.value) {
    accounts.buyer.value = expectTransactionSigner(
      accounts.payer.value
    ).address;
  }
  if (!accounts.ownerCurrencyTa.value) {
    accounts.ownerCurrencyTa = {
      ...accounts.ownerCurrencyTa,
      ...(await resolveOwnerCurrencyAta(resolverScope)),
    };
  }
  if (!accounts.payerCurrencyTa.value) {
    accounts.payerCurrencyTa = {
      ...accounts.payerCurrencyTa,
      ...(await resolvePayerCurrencyAta(resolverScope)),
    };
  }
  if (!accounts.takerBrokerTa.value) {
    accounts.takerBrokerTa = {
      ...accounts.takerBrokerTa,
      ...(await resolveTakerBrokerCurrencyAta(resolverScope)),
    };
  }
  if (!accounts.makerBrokerTa.value) {
    accounts.makerBrokerTa = {
      ...accounts.makerBrokerTa,
      ...(await resolveMakerBrokerCurrencyAta(resolverScope)),
    };
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }
  if (!accounts.associatedTokenProgram.value) {
    accounts.associatedTokenProgram.value =
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>;
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
  if (!args.creatorsCurrencyTa) {
    args.creatorsCurrencyTa = await resolveCreatorsCurrencyAta(resolverScope);
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = [
    ...(args.creators ?? []).map((address) => ({
      address,
      role: AccountRole.WRITABLE,
    })),
    ...(args.creatorsCurrencyTa ?? []).map((address) => ({
      address,
      role: AccountRole.WRITABLE,
    })),
  ];

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.feeVaultCurrencyTa),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.asset),
      getAccountMeta(accounts.collection),
      getAccountMeta(accounts.currency),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerCurrencyTa),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.payerCurrencyTa),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.takerBrokerTa),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.makerBrokerTa),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.currencyTokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.mplCoreProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.cosigner),
      ...remainingAccounts,
    ],
    programAddress,
    data: getBuyCoreSplInstructionDataEncoder().encode(
      args as BuyCoreSplInstructionDataArgs
    ),
  } as BuyCoreSplInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountFeeVaultCurrencyTa,
    TAccountBuyer,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountCurrency,
    TAccountOwner,
    TAccountOwnerCurrencyTa,
    TAccountPayer,
    TAccountPayerCurrencyTa,
    TAccountTakerBroker,
    TAccountTakerBrokerTa,
    TAccountMakerBroker,
    TAccountMakerBrokerTa,
    TAccountRentDestination,
    TAccountCurrencyTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountCosigner
  >;

  return instruction;
}

export type BuyCoreSplInput<
  TAccountFeeVault extends string = string,
  TAccountFeeVaultCurrencyTa extends string = string,
  TAccountBuyer extends string = string,
  TAccountListState extends string = string,
  TAccountAsset extends string = string,
  TAccountCollection extends string = string,
  TAccountCurrency extends string = string,
  TAccountOwner extends string = string,
  TAccountOwnerCurrencyTa extends string = string,
  TAccountPayer extends string = string,
  TAccountPayerCurrencyTa extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountTakerBrokerTa extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountMakerBrokerTa extends string = string,
  TAccountRentDestination extends string = string,
  TAccountCurrencyTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMplCoreProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  feeVaultCurrencyTa: Address<TAccountFeeVaultCurrencyTa>;
  buyer?: Address<TAccountBuyer>;
  listState: Address<TAccountListState>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  currency: Address<TAccountCurrency>;
  owner: Address<TAccountOwner>;
  ownerCurrencyTa: Address<TAccountOwnerCurrencyTa>;
  payer: TransactionSigner<TAccountPayer>;
  payerCurrencyTa: Address<TAccountPayerCurrencyTa>;
  takerBroker?: Address<TAccountTakerBroker>;
  takerBrokerTa?: Address<TAccountTakerBrokerTa>;
  makerBroker?: Address<TAccountMakerBroker>;
  makerBrokerTa?: Address<TAccountMakerBrokerTa>;
  rentDestination?: Address<TAccountRentDestination>;
  /** Token Program used for the currency. */
  currencyTokenProgram?: Address<TAccountCurrencyTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  mplCoreProgram?: Address<TAccountMplCoreProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  maxAmount: BuyCoreSplInstructionDataArgs['maxAmount'];
  creators: BuyCoreSplInstructionExtraArgs['creators'];
  creatorsCurrencyTa?: BuyCoreSplInstructionExtraArgs['creatorsCurrencyTa'];
};

export function getBuyCoreSplInstruction<
  TAccountFeeVault extends string,
  TAccountFeeVaultCurrencyTa extends string,
  TAccountBuyer extends string,
  TAccountListState extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountCurrency extends string,
  TAccountOwner extends string,
  TAccountOwnerCurrencyTa extends string,
  TAccountPayer extends string,
  TAccountPayerCurrencyTa extends string,
  TAccountTakerBroker extends string,
  TAccountTakerBrokerTa extends string,
  TAccountMakerBroker extends string,
  TAccountMakerBrokerTa extends string,
  TAccountRentDestination extends string,
  TAccountCurrencyTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMplCoreProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountCosigner extends string,
>(
  input: BuyCoreSplInput<
    TAccountFeeVault,
    TAccountFeeVaultCurrencyTa,
    TAccountBuyer,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountCurrency,
    TAccountOwner,
    TAccountOwnerCurrencyTa,
    TAccountPayer,
    TAccountPayerCurrencyTa,
    TAccountTakerBroker,
    TAccountTakerBrokerTa,
    TAccountMakerBroker,
    TAccountMakerBrokerTa,
    TAccountRentDestination,
    TAccountCurrencyTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountCosigner
  >
): BuyCoreSplInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault,
  TAccountFeeVaultCurrencyTa,
  TAccountBuyer,
  TAccountListState,
  TAccountAsset,
  TAccountCollection,
  TAccountCurrency,
  TAccountOwner,
  TAccountOwnerCurrencyTa,
  TAccountPayer,
  TAccountPayerCurrencyTa,
  TAccountTakerBroker,
  TAccountTakerBrokerTa,
  TAccountMakerBroker,
  TAccountMakerBrokerTa,
  TAccountRentDestination,
  TAccountCurrencyTokenProgram,
  TAccountAssociatedTokenProgram,
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
    feeVaultCurrencyTa: {
      value: input.feeVaultCurrencyTa ?? null,
      isWritable: true,
    },
    buyer: { value: input.buyer ?? null, isWritable: false },
    listState: { value: input.listState ?? null, isWritable: true },
    asset: { value: input.asset ?? null, isWritable: true },
    collection: { value: input.collection ?? null, isWritable: false },
    currency: { value: input.currency ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    ownerCurrencyTa: { value: input.ownerCurrencyTa ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
    payerCurrencyTa: { value: input.payerCurrencyTa ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    takerBrokerTa: { value: input.takerBrokerTa ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    makerBrokerTa: { value: input.makerBrokerTa ?? null, isWritable: true },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
    currencyTokenProgram: {
      value: input.currencyTokenProgram ?? null,
      isWritable: false,
    },
    associatedTokenProgram: {
      value: input.associatedTokenProgram ?? null,
      isWritable: false,
    },
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
  if (!accounts.currencyTokenProgram.value) {
    accounts.currencyTokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
  }
  if (!accounts.buyer.value) {
    accounts.buyer.value = expectTransactionSigner(
      accounts.payer.value
    ).address;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }
  if (!accounts.associatedTokenProgram.value) {
    accounts.associatedTokenProgram.value =
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>;
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

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = [
    ...(args.creators ?? []).map((address) => ({
      address,
      role: AccountRole.WRITABLE,
    })),
    ...(args.creatorsCurrencyTa ?? []).map((address) => ({
      address,
      role: AccountRole.WRITABLE,
    })),
  ];

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.feeVaultCurrencyTa),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.asset),
      getAccountMeta(accounts.collection),
      getAccountMeta(accounts.currency),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerCurrencyTa),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.payerCurrencyTa),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.takerBrokerTa),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.makerBrokerTa),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.currencyTokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.mplCoreProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.cosigner),
      ...remainingAccounts,
    ],
    programAddress,
    data: getBuyCoreSplInstructionDataEncoder().encode(
      args as BuyCoreSplInstructionDataArgs
    ),
  } as BuyCoreSplInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountFeeVaultCurrencyTa,
    TAccountBuyer,
    TAccountListState,
    TAccountAsset,
    TAccountCollection,
    TAccountCurrency,
    TAccountOwner,
    TAccountOwnerCurrencyTa,
    TAccountPayer,
    TAccountPayerCurrencyTa,
    TAccountTakerBroker,
    TAccountTakerBrokerTa,
    TAccountMakerBroker,
    TAccountMakerBrokerTa,
    TAccountRentDestination,
    TAccountCurrencyTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMplCoreProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountCosigner
  >;

  return instruction;
}

export type ParsedBuyCoreSplInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
    feeVaultCurrencyTa: TAccountMetas[1];
    buyer: TAccountMetas[2];
    listState: TAccountMetas[3];
    asset: TAccountMetas[4];
    collection?: TAccountMetas[5] | undefined;
    currency: TAccountMetas[6];
    owner: TAccountMetas[7];
    ownerCurrencyTa: TAccountMetas[8];
    payer: TAccountMetas[9];
    payerCurrencyTa: TAccountMetas[10];
    takerBroker?: TAccountMetas[11] | undefined;
    takerBrokerTa?: TAccountMetas[12] | undefined;
    makerBroker?: TAccountMetas[13] | undefined;
    makerBrokerTa?: TAccountMetas[14] | undefined;
    rentDestination: TAccountMetas[15];
    /** Token Program used for the currency. */
    currencyTokenProgram: TAccountMetas[16];
    associatedTokenProgram: TAccountMetas[17];
    mplCoreProgram: TAccountMetas[18];
    marketplaceProgram: TAccountMetas[19];
    systemProgram: TAccountMetas[20];
    cosigner?: TAccountMetas[21] | undefined;
  };
  data: BuyCoreSplInstructionData;
};

export function parseBuyCoreSplInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedBuyCoreSplInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 22) {
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
      feeVaultCurrencyTa: getNextAccount(),
      buyer: getNextAccount(),
      listState: getNextAccount(),
      asset: getNextAccount(),
      collection: getNextOptionalAccount(),
      currency: getNextAccount(),
      owner: getNextAccount(),
      ownerCurrencyTa: getNextAccount(),
      payer: getNextAccount(),
      payerCurrencyTa: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      takerBrokerTa: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      makerBrokerTa: getNextOptionalAccount(),
      rentDestination: getNextAccount(),
      currencyTokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      mplCoreProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      cosigner: getNextOptionalAccount(),
    },
    data: getBuyCoreSplInstructionDataDecoder().decode(instruction.data),
  };
}
