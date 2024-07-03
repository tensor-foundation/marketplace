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
  IAccountSignerMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  ReadonlySignerAccount,
  ReadonlyUint8Array,
  TransactionSigner,
  WritableAccount,
  WritableSignerAccount,
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
} from '@solana/web3.js';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';

export type BuyWnsSplInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountFeeVaultCurrencyTa extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountBuyerTa extends string | IAccountMeta<string> = string,
  TAccountListTa extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
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
  TAccountTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TAccountAssociatedTokenProgram extends
    | string
    | IAccountMeta<string> = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountApprove extends string | IAccountMeta<string> = string,
  TAccountDistribution extends string | IAccountMeta<string> = string,
  TAccountWnsProgram extends
    | string
    | IAccountMeta<string> = 'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM',
  TAccountWnsDistributionProgram extends
    | string
    | IAccountMeta<string> = 'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay',
  TAccountExtraMetas extends string | IAccountMeta<string> = string,
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
      TAccountBuyerTa extends string
        ? WritableAccount<TAccountBuyerTa>
        : TAccountBuyerTa,
      TAccountListTa extends string
        ? WritableAccount<TAccountListTa>
        : TAccountListTa,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
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
      TAccountTokenProgram extends string
        ? ReadonlyAccount<TAccountTokenProgram>
        : TAccountTokenProgram,
      TAccountAssociatedTokenProgram extends string
        ? ReadonlyAccount<TAccountAssociatedTokenProgram>
        : TAccountAssociatedTokenProgram,
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountApprove extends string
        ? WritableAccount<TAccountApprove>
        : TAccountApprove,
      TAccountDistribution extends string
        ? WritableAccount<TAccountDistribution>
        : TAccountDistribution,
      TAccountWnsProgram extends string
        ? ReadonlyAccount<TAccountWnsProgram>
        : TAccountWnsProgram,
      TAccountWnsDistributionProgram extends string
        ? ReadonlyAccount<TAccountWnsDistributionProgram>
        : TAccountWnsDistributionProgram,
      TAccountExtraMetas extends string
        ? ReadonlyAccount<TAccountExtraMetas>
        : TAccountExtraMetas,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      ...TRemainingAccounts,
    ]
  >;

export type BuyWnsSplInstructionData = {
  discriminator: ReadonlyUint8Array;
  maxAmount: bigint;
};

export type BuyWnsSplInstructionDataArgs = { maxAmount: number | bigint };

export function getBuyWnsSplInstructionDataEncoder(): Encoder<BuyWnsSplInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['maxAmount', getU64Encoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([113, 137, 57, 23, 186, 196, 217, 210]),
    })
  );
}

export function getBuyWnsSplInstructionDataDecoder(): Decoder<BuyWnsSplInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['maxAmount', getU64Decoder()],
  ]);
}

export function getBuyWnsSplInstructionDataCodec(): Codec<
  BuyWnsSplInstructionDataArgs,
  BuyWnsSplInstructionData
> {
  return combineCodec(
    getBuyWnsSplInstructionDataEncoder(),
    getBuyWnsSplInstructionDataDecoder()
  );
}

export type BuyWnsSplInput<
  TAccountFeeVault extends string = string,
  TAccountFeeVaultCurrencyTa extends string = string,
  TAccountBuyer extends string = string,
  TAccountBuyerTa extends string = string,
  TAccountListTa extends string = string,
  TAccountListState extends string = string,
  TAccountMint extends string = string,
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
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountApprove extends string = string,
  TAccountDistribution extends string = string,
  TAccountWnsProgram extends string = string,
  TAccountWnsDistributionProgram extends string = string,
  TAccountExtraMetas extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  feeVaultCurrencyTa: Address<TAccountFeeVaultCurrencyTa>;
  buyer: Address<TAccountBuyer>;
  buyerTa: Address<TAccountBuyerTa>;
  listTa: Address<TAccountListTa>;
  listState: Address<TAccountListState>;
  /** WNS asset mint. */
  mint: Address<TAccountMint>;
  /** SPL token mint of the currency. */
  currency: Address<TAccountCurrency>;
  owner: Address<TAccountOwner>;
  ownerCurrencyTa: Address<TAccountOwnerCurrencyTa>;
  payer: TransactionSigner<TAccountPayer>;
  payerCurrencyTa: Address<TAccountPayerCurrencyTa>;
  takerBroker?: Address<TAccountTakerBroker>;
  takerBrokerTa?: Address<TAccountTakerBrokerTa>;
  makerBroker?: Address<TAccountMakerBroker>;
  makerBrokerTa?: Address<TAccountMakerBrokerTa>;
  rentDestination: Address<TAccountRentDestination>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  approve: Address<TAccountApprove>;
  distribution: Address<TAccountDistribution>;
  wnsProgram?: Address<TAccountWnsProgram>;
  wnsDistributionProgram?: Address<TAccountWnsDistributionProgram>;
  extraMetas: Address<TAccountExtraMetas>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  maxAmount: BuyWnsSplInstructionDataArgs['maxAmount'];
};

export function getBuyWnsSplInstruction<
  TAccountFeeVault extends string,
  TAccountFeeVaultCurrencyTa extends string,
  TAccountBuyer extends string,
  TAccountBuyerTa extends string,
  TAccountListTa extends string,
  TAccountListState extends string,
  TAccountMint extends string,
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
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountApprove extends string,
  TAccountDistribution extends string,
  TAccountWnsProgram extends string,
  TAccountWnsDistributionProgram extends string,
  TAccountExtraMetas extends string,
  TAccountCosigner extends string,
>(
  input: BuyWnsSplInput<
    TAccountFeeVault,
    TAccountFeeVaultCurrencyTa,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListTa,
    TAccountListState,
    TAccountMint,
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
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountWnsDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >
): BuyWnsSplInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault,
  TAccountFeeVaultCurrencyTa,
  TAccountBuyer,
  TAccountBuyerTa,
  TAccountListTa,
  TAccountListState,
  TAccountMint,
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
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountMarketplaceProgram,
  TAccountSystemProgram,
  TAccountApprove,
  TAccountDistribution,
  TAccountWnsProgram,
  TAccountWnsDistributionProgram,
  TAccountExtraMetas,
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
    buyerTa: { value: input.buyerTa ?? null, isWritable: true },
    listTa: { value: input.listTa ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
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
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    associatedTokenProgram: {
      value: input.associatedTokenProgram ?? null,
      isWritable: false,
    },
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    approve: { value: input.approve ?? null, isWritable: true },
    distribution: { value: input.distribution ?? null, isWritable: true },
    wnsProgram: { value: input.wnsProgram ?? null, isWritable: false },
    wnsDistributionProgram: {
      value: input.wnsDistributionProgram ?? null,
      isWritable: false,
    },
    extraMetas: { value: input.extraMetas ?? null, isWritable: false },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
  }
  if (!accounts.associatedTokenProgram.value) {
    accounts.associatedTokenProgram.value =
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.wnsProgram.value) {
    accounts.wnsProgram.value =
      'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM' as Address<'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM'>;
  }
  if (!accounts.wnsDistributionProgram.value) {
    accounts.wnsDistributionProgram.value =
      'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay' as Address<'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.feeVaultCurrencyTa),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.buyerTa),
      getAccountMeta(accounts.listTa),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.mint),
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
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.approve),
      getAccountMeta(accounts.distribution),
      getAccountMeta(accounts.wnsProgram),
      getAccountMeta(accounts.wnsDistributionProgram),
      getAccountMeta(accounts.extraMetas),
      getAccountMeta(accounts.cosigner),
    ],
    programAddress,
    data: getBuyWnsSplInstructionDataEncoder().encode(
      args as BuyWnsSplInstructionDataArgs
    ),
  } as BuyWnsSplInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountFeeVaultCurrencyTa,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListTa,
    TAccountListState,
    TAccountMint,
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
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountWnsDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >;

  return instruction;
}

export type ParsedBuyWnsSplInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
    feeVaultCurrencyTa: TAccountMetas[1];
    buyer: TAccountMetas[2];
    buyerTa: TAccountMetas[3];
    listTa: TAccountMetas[4];
    listState: TAccountMetas[5];
    /** WNS asset mint. */
    mint: TAccountMetas[6];
    /** SPL token mint of the currency. */
    currency: TAccountMetas[7];
    owner: TAccountMetas[8];
    ownerCurrencyTa: TAccountMetas[9];
    payer: TAccountMetas[10];
    payerCurrencyTa: TAccountMetas[11];
    takerBroker?: TAccountMetas[12] | undefined;
    takerBrokerTa?: TAccountMetas[13] | undefined;
    makerBroker?: TAccountMetas[14] | undefined;
    makerBrokerTa?: TAccountMetas[15] | undefined;
    rentDestination: TAccountMetas[16];
    tokenProgram: TAccountMetas[17];
    associatedTokenProgram: TAccountMetas[18];
    marketplaceProgram: TAccountMetas[19];
    systemProgram: TAccountMetas[20];
    approve: TAccountMetas[21];
    distribution: TAccountMetas[22];
    wnsProgram: TAccountMetas[23];
    wnsDistributionProgram: TAccountMetas[24];
    extraMetas: TAccountMetas[25];
    cosigner?: TAccountMetas[26] | undefined;
  };
  data: BuyWnsSplInstructionData;
};

export function parseBuyWnsSplInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedBuyWnsSplInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 27) {
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
      buyerTa: getNextAccount(),
      listTa: getNextAccount(),
      listState: getNextAccount(),
      mint: getNextAccount(),
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
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      approve: getNextAccount(),
      distribution: getNextAccount(),
      wnsProgram: getNextAccount(),
      wnsDistributionProgram: getNextAccount(),
      extraMetas: getNextAccount(),
      cosigner: getNextOptionalAccount(),
    },
    data: getBuyWnsSplInstructionDataDecoder().decode(instruction.data),
  };
}
