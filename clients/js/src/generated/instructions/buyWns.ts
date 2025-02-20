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
  resolveBuyerAta,
  resolveFeeVaultPdaFromListState,
  resolveListAta,
  resolveWnsApprovePda,
  resolveWnsDistributionPda,
  resolveWnsExtraAccountMetasPda,
} from '@tensor-foundation/resolvers';
import { findListStatePda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  expectAddress,
  expectSome,
  expectTransactionSigner,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export const BUY_WNS_DISCRIMINATOR = new Uint8Array([
  168, 43, 179, 217, 44, 59, 35, 244,
]);

export function getBuyWnsDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(BUY_WNS_DISCRIMINATOR);
}

export type BuyWnsInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountBuyerTa extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountListTa extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TAccountTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
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
  TAccountDistributionProgram extends
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
      TAccountBuyer extends string
        ? ReadonlyAccount<TAccountBuyer>
        : TAccountBuyer,
      TAccountBuyerTa extends string
        ? WritableAccount<TAccountBuyerTa>
        : TAccountBuyerTa,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountListTa extends string
        ? WritableAccount<TAccountListTa>
        : TAccountListTa,
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
      TAccountOwner extends string
        ? WritableAccount<TAccountOwner>
        : TAccountOwner,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountTakerBroker extends string
        ? WritableAccount<TAccountTakerBroker>
        : TAccountTakerBroker,
      TAccountMakerBroker extends string
        ? WritableAccount<TAccountMakerBroker>
        : TAccountMakerBroker,
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
      TAccountDistributionProgram extends string
        ? ReadonlyAccount<TAccountDistributionProgram>
        : TAccountDistributionProgram,
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

export type BuyWnsInstructionData = {
  discriminator: ReadonlyUint8Array;
  maxAmount: bigint;
};

export type BuyWnsInstructionDataArgs = { maxAmount: number | bigint };

export function getBuyWnsInstructionDataEncoder(): Encoder<BuyWnsInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['maxAmount', getU64Encoder()],
    ]),
    (value) => ({ ...value, discriminator: BUY_WNS_DISCRIMINATOR })
  );
}

export function getBuyWnsInstructionDataDecoder(): Decoder<BuyWnsInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['maxAmount', getU64Decoder()],
  ]);
}

export function getBuyWnsInstructionDataCodec(): Codec<
  BuyWnsInstructionDataArgs,
  BuyWnsInstructionData
> {
  return combineCodec(
    getBuyWnsInstructionDataEncoder(),
    getBuyWnsInstructionDataDecoder()
  );
}

export type BuyWnsInstructionExtraArgs = {
  collection: Address;
  paymentMint?: Address;
};

export type BuyWnsAsyncInput<
  TAccountFeeVault extends string = string,
  TAccountBuyer extends string = string,
  TAccountBuyerTa extends string = string,
  TAccountListState extends string = string,
  TAccountListTa extends string = string,
  TAccountMint extends string = string,
  TAccountOwner extends string = string,
  TAccountPayer extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountRentDestination extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountApprove extends string = string,
  TAccountDistribution extends string = string,
  TAccountWnsProgram extends string = string,
  TAccountDistributionProgram extends string = string,
  TAccountExtraMetas extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault?: Address<TAccountFeeVault>;
  buyer?: Address<TAccountBuyer>;
  buyerTa?: Address<TAccountBuyerTa>;
  listState?: Address<TAccountListState>;
  listTa?: Address<TAccountListTa>;
  mint: Address<TAccountMint>;
  owner: Address<TAccountOwner>;
  payer: TransactionSigner<TAccountPayer>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDestination?: Address<TAccountRentDestination>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  approve?: Address<TAccountApprove>;
  distribution?: Address<TAccountDistribution>;
  wnsProgram?: Address<TAccountWnsProgram>;
  distributionProgram?: Address<TAccountDistributionProgram>;
  extraMetas?: Address<TAccountExtraMetas>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  maxAmount: BuyWnsInstructionDataArgs['maxAmount'];
  collection: BuyWnsInstructionExtraArgs['collection'];
  paymentMint?: BuyWnsInstructionExtraArgs['paymentMint'];
};

export async function getBuyWnsInstructionAsync<
  TAccountFeeVault extends string,
  TAccountBuyer extends string,
  TAccountBuyerTa extends string,
  TAccountListState extends string,
  TAccountListTa extends string,
  TAccountMint extends string,
  TAccountOwner extends string,
  TAccountPayer extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDestination extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountApprove extends string,
  TAccountDistribution extends string,
  TAccountWnsProgram extends string,
  TAccountDistributionProgram extends string,
  TAccountExtraMetas extends string,
  TAccountCosigner extends string,
  TProgramAddress extends Address = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
>(
  input: BuyWnsAsyncInput<
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >,
  config?: { programAddress?: TProgramAddress }
): Promise<
  BuyWnsInstruction<
    TProgramAddress,
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    buyer: { value: input.buyer ?? null, isWritable: false },
    buyerTa: { value: input.buyerTa ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    listTa: { value: input.listTa ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
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
    distributionProgram: {
      value: input.distributionProgram ?? null,
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

  // Resolver scope.
  const resolverScope = { programAddress, accounts, args };

  // Resolve default values.
  if (!accounts.listState.value) {
    accounts.listState.value = await findListStatePda({
      mint: expectAddress(accounts.mint.value),
    });
  }
  if (!accounts.feeVault.value) {
    accounts.feeVault = {
      ...accounts.feeVault,
      ...(await resolveFeeVaultPdaFromListState(resolverScope)),
    };
  }
  if (!accounts.buyer.value) {
    accounts.buyer.value = expectTransactionSigner(
      accounts.payer.value
    ).address;
  }
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Address<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;
  }
  if (!accounts.buyerTa.value) {
    accounts.buyerTa = {
      ...accounts.buyerTa,
      ...(await resolveBuyerAta(resolverScope)),
    };
  }
  if (!accounts.listTa.value) {
    accounts.listTa = {
      ...accounts.listTa,
      ...(await resolveListAta(resolverScope)),
    };
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
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
  if (!accounts.approve.value) {
    accounts.approve = {
      ...accounts.approve,
      ...(await resolveWnsApprovePda(resolverScope)),
    };
  }
  if (!args.paymentMint) {
    args.paymentMint =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.distribution.value) {
    accounts.distribution = {
      ...accounts.distribution,
      ...(await resolveWnsDistributionPda(resolverScope)),
    };
  }
  if (!accounts.wnsProgram.value) {
    accounts.wnsProgram.value =
      'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM' as Address<'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM'>;
  }
  if (!accounts.distributionProgram.value) {
    accounts.distributionProgram.value =
      'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay' as Address<'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay'>;
  }
  if (!accounts.extraMetas.value) {
    accounts.extraMetas = {
      ...accounts.extraMetas,
      ...(await resolveWnsExtraAccountMetasPda(resolverScope)),
    };
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.buyerTa),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listTa),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.approve),
      getAccountMeta(accounts.distribution),
      getAccountMeta(accounts.wnsProgram),
      getAccountMeta(accounts.distributionProgram),
      getAccountMeta(accounts.extraMetas),
      getAccountMeta(accounts.cosigner),
    ],
    programAddress,
    data: getBuyWnsInstructionDataEncoder().encode(
      args as BuyWnsInstructionDataArgs
    ),
  } as BuyWnsInstruction<
    TProgramAddress,
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >;

  return instruction;
}

export type BuyWnsInput<
  TAccountFeeVault extends string = string,
  TAccountBuyer extends string = string,
  TAccountBuyerTa extends string = string,
  TAccountListState extends string = string,
  TAccountListTa extends string = string,
  TAccountMint extends string = string,
  TAccountOwner extends string = string,
  TAccountPayer extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountRentDestination extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountApprove extends string = string,
  TAccountDistribution extends string = string,
  TAccountWnsProgram extends string = string,
  TAccountDistributionProgram extends string = string,
  TAccountExtraMetas extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  buyer?: Address<TAccountBuyer>;
  buyerTa: Address<TAccountBuyerTa>;
  listState: Address<TAccountListState>;
  listTa: Address<TAccountListTa>;
  mint: Address<TAccountMint>;
  owner: Address<TAccountOwner>;
  payer: TransactionSigner<TAccountPayer>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDestination?: Address<TAccountRentDestination>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  approve: Address<TAccountApprove>;
  distribution: Address<TAccountDistribution>;
  wnsProgram?: Address<TAccountWnsProgram>;
  distributionProgram?: Address<TAccountDistributionProgram>;
  extraMetas: Address<TAccountExtraMetas>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  maxAmount: BuyWnsInstructionDataArgs['maxAmount'];
  collection: BuyWnsInstructionExtraArgs['collection'];
  paymentMint?: BuyWnsInstructionExtraArgs['paymentMint'];
};

export function getBuyWnsInstruction<
  TAccountFeeVault extends string,
  TAccountBuyer extends string,
  TAccountBuyerTa extends string,
  TAccountListState extends string,
  TAccountListTa extends string,
  TAccountMint extends string,
  TAccountOwner extends string,
  TAccountPayer extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDestination extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountApprove extends string,
  TAccountDistribution extends string,
  TAccountWnsProgram extends string,
  TAccountDistributionProgram extends string,
  TAccountExtraMetas extends string,
  TAccountCosigner extends string,
  TProgramAddress extends Address = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
>(
  input: BuyWnsInput<
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >,
  config?: { programAddress?: TProgramAddress }
): BuyWnsInstruction<
  TProgramAddress,
  TAccountFeeVault,
  TAccountBuyer,
  TAccountBuyerTa,
  TAccountListState,
  TAccountListTa,
  TAccountMint,
  TAccountOwner,
  TAccountPayer,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountRentDestination,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountMarketplaceProgram,
  TAccountSystemProgram,
  TAccountApprove,
  TAccountDistribution,
  TAccountWnsProgram,
  TAccountDistributionProgram,
  TAccountExtraMetas,
  TAccountCosigner
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    buyer: { value: input.buyer ?? null, isWritable: false },
    buyerTa: { value: input.buyerTa ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    listTa: { value: input.listTa ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
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
    distributionProgram: {
      value: input.distributionProgram ?? null,
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
  if (!accounts.buyer.value) {
    accounts.buyer.value = expectTransactionSigner(
      accounts.payer.value
    ).address;
  }
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Address<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
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
  if (!args.paymentMint) {
    args.paymentMint =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.wnsProgram.value) {
    accounts.wnsProgram.value =
      'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM' as Address<'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM'>;
  }
  if (!accounts.distributionProgram.value) {
    accounts.distributionProgram.value =
      'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay' as Address<'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.buyerTa),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listTa),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.approve),
      getAccountMeta(accounts.distribution),
      getAccountMeta(accounts.wnsProgram),
      getAccountMeta(accounts.distributionProgram),
      getAccountMeta(accounts.extraMetas),
      getAccountMeta(accounts.cosigner),
    ],
    programAddress,
    data: getBuyWnsInstructionDataEncoder().encode(
      args as BuyWnsInstructionDataArgs
    ),
  } as BuyWnsInstruction<
    TProgramAddress,
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >;

  return instruction;
}

export type ParsedBuyWnsInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
    buyer: TAccountMetas[1];
    buyerTa: TAccountMetas[2];
    listState: TAccountMetas[3];
    listTa: TAccountMetas[4];
    mint: TAccountMetas[5];
    owner: TAccountMetas[6];
    payer: TAccountMetas[7];
    takerBroker?: TAccountMetas[8] | undefined;
    makerBroker?: TAccountMetas[9] | undefined;
    rentDestination: TAccountMetas[10];
    tokenProgram: TAccountMetas[11];
    associatedTokenProgram: TAccountMetas[12];
    marketplaceProgram: TAccountMetas[13];
    systemProgram: TAccountMetas[14];
    approve: TAccountMetas[15];
    distribution: TAccountMetas[16];
    wnsProgram: TAccountMetas[17];
    distributionProgram: TAccountMetas[18];
    extraMetas: TAccountMetas[19];
    cosigner?: TAccountMetas[20] | undefined;
  };
  data: BuyWnsInstructionData;
};

export function parseBuyWnsInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedBuyWnsInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 21) {
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
      buyer: getNextAccount(),
      buyerTa: getNextAccount(),
      listState: getNextAccount(),
      listTa: getNextAccount(),
      mint: getNextAccount(),
      owner: getNextAccount(),
      payer: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      rentDestination: getNextAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      approve: getNextAccount(),
      distribution: getNextAccount(),
      wnsProgram: getNextAccount(),
      distributionProgram: getNextAccount(),
      extraMetas: getNextAccount(),
      cosigner: getNextOptionalAccount(),
    },
    data: getBuyWnsInstructionDataDecoder().decode(instruction.data),
  };
}
