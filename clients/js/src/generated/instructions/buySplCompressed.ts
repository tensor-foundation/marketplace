/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  addDecoderSizePrefix,
  addEncoderSizePrefix,
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getArrayDecoder,
  getArrayEncoder,
  getBooleanDecoder,
  getBooleanEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getOptionDecoder,
  getOptionEncoder,
  getStructDecoder,
  getStructEncoder,
  getU16Decoder,
  getU16Encoder,
  getU32Decoder,
  getU32Encoder,
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
  type Option,
  type OptionOrNullable,
  type ReadonlyAccount,
  type ReadonlySignerAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import {
  resolveFeeVaultPdaFromListState,
  resolveTreeAuthorityPda,
} from '@tensor-foundation/resolvers';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  expectSome,
  expectTransactionSigner,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export const BUY_SPL_COMPRESSED_DISCRIMINATOR = new Uint8Array([
  65, 136, 254, 255, 59, 130, 234, 174,
]);

export function getBuySplCompressedDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(
    BUY_SPL_COMPRESSED_DISCRIMINATOR
  );
}

export type BuySplCompressedInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountFeeVaultTa extends string | IAccountMeta<string> = string,
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountMerkleTree extends string | IAccountMeta<string> = string,
  TAccountLogWrapper extends
    | string
    | IAccountMeta<string> = 'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV',
  TAccountCompressionProgram extends
    | string
    | IAccountMeta<string> = 'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK',
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountBubblegumProgram extends
    | string
    | IAccountMeta<string> = 'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY',
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TAccountAssociatedTokenProgram extends
    | string
    | IAccountMeta<string> = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountPayerSource extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountOwnerDestination extends string | IAccountMeta<string> = string,
  TAccountCurrency extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountTakerBrokerCurrencyTa extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBrokerCurrencyTa extends string | IAccountMeta<string> = string,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TAccountRentPayer extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountFeeVault extends string
        ? WritableAccount<TAccountFeeVault>
        : TAccountFeeVault,
      TAccountFeeVaultTa extends string
        ? WritableAccount<TAccountFeeVaultTa>
        : TAccountFeeVaultTa,
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
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountTokenProgram extends string
        ? ReadonlyAccount<TAccountTokenProgram>
        : TAccountTokenProgram,
      TAccountAssociatedTokenProgram extends string
        ? ReadonlyAccount<TAccountAssociatedTokenProgram>
        : TAccountAssociatedTokenProgram,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountBuyer extends string
        ? ReadonlyAccount<TAccountBuyer>
        : TAccountBuyer,
      TAccountPayer extends string
        ? ReadonlySignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountPayerSource extends string
        ? WritableAccount<TAccountPayerSource>
        : TAccountPayerSource,
      TAccountOwner extends string
        ? ReadonlyAccount<TAccountOwner>
        : TAccountOwner,
      TAccountOwnerDestination extends string
        ? WritableAccount<TAccountOwnerDestination>
        : TAccountOwnerDestination,
      TAccountCurrency extends string
        ? ReadonlyAccount<TAccountCurrency>
        : TAccountCurrency,
      TAccountTakerBroker extends string
        ? WritableAccount<TAccountTakerBroker>
        : TAccountTakerBroker,
      TAccountTakerBrokerCurrencyTa extends string
        ? WritableAccount<TAccountTakerBrokerCurrencyTa>
        : TAccountTakerBrokerCurrencyTa,
      TAccountMakerBroker extends string
        ? WritableAccount<TAccountMakerBroker>
        : TAccountMakerBroker,
      TAccountMakerBrokerCurrencyTa extends string
        ? WritableAccount<TAccountMakerBrokerCurrencyTa>
        : TAccountMakerBrokerCurrencyTa,
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      TAccountRentPayer extends string
        ? WritableSignerAccount<TAccountRentPayer> &
            IAccountSignerMeta<TAccountRentPayer>
        : TAccountRentPayer,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      ...TRemainingAccounts,
    ]
  >;

export type BuySplCompressedInstructionData = {
  discriminator: ReadonlyUint8Array;
  nonce: bigint;
  index: number;
  root: ReadonlyUint8Array;
  metaHash: ReadonlyUint8Array;
  creatorShares: ReadonlyUint8Array;
  creatorVerified: Array<boolean>;
  sellerFeeBasisPoints: number;
  maxAmount: bigint;
  optionalRoyaltyPct: Option<number>;
};

export type BuySplCompressedInstructionDataArgs = {
  nonce: number | bigint;
  index: number;
  root: ReadonlyUint8Array;
  metaHash: ReadonlyUint8Array;
  creatorShares: ReadonlyUint8Array;
  creatorVerified: Array<boolean>;
  sellerFeeBasisPoints: number;
  maxAmount: number | bigint;
  optionalRoyaltyPct?: OptionOrNullable<number>;
};

export function getBuySplCompressedInstructionDataEncoder(): Encoder<BuySplCompressedInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['nonce', getU64Encoder()],
      ['index', getU32Encoder()],
      ['root', fixEncoderSize(getBytesEncoder(), 32)],
      ['metaHash', fixEncoderSize(getBytesEncoder(), 32)],
      [
        'creatorShares',
        addEncoderSizePrefix(getBytesEncoder(), getU32Encoder()),
      ],
      ['creatorVerified', getArrayEncoder(getBooleanEncoder())],
      ['sellerFeeBasisPoints', getU16Encoder()],
      ['maxAmount', getU64Encoder()],
      ['optionalRoyaltyPct', getOptionEncoder(getU16Encoder())],
    ]),
    (value) => ({
      ...value,
      discriminator: BUY_SPL_COMPRESSED_DISCRIMINATOR,
      optionalRoyaltyPct: value.optionalRoyaltyPct ?? 100,
    })
  );
}

export function getBuySplCompressedInstructionDataDecoder(): Decoder<BuySplCompressedInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['nonce', getU64Decoder()],
    ['index', getU32Decoder()],
    ['root', fixDecoderSize(getBytesDecoder(), 32)],
    ['metaHash', fixDecoderSize(getBytesDecoder(), 32)],
    ['creatorShares', addDecoderSizePrefix(getBytesDecoder(), getU32Decoder())],
    ['creatorVerified', getArrayDecoder(getBooleanDecoder())],
    ['sellerFeeBasisPoints', getU16Decoder()],
    ['maxAmount', getU64Decoder()],
    ['optionalRoyaltyPct', getOptionDecoder(getU16Decoder())],
  ]);
}

export function getBuySplCompressedInstructionDataCodec(): Codec<
  BuySplCompressedInstructionDataArgs,
  BuySplCompressedInstructionData
> {
  return combineCodec(
    getBuySplCompressedInstructionDataEncoder(),
    getBuySplCompressedInstructionDataDecoder()
  );
}

export type BuySplCompressedAsyncInput<
  TAccountFeeVault extends string = string,
  TAccountFeeVaultTa extends string = string,
  TAccountTreeAuthority extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountListState extends string = string,
  TAccountBuyer extends string = string,
  TAccountPayer extends string = string,
  TAccountPayerSource extends string = string,
  TAccountOwner extends string = string,
  TAccountOwnerDestination extends string = string,
  TAccountCurrency extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountTakerBrokerCurrencyTa extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountMakerBrokerCurrencyTa extends string = string,
  TAccountRentDestination extends string = string,
  TAccountRentPayer extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault?: Address<TAccountFeeVault>;
  feeVaultTa: Address<TAccountFeeVaultTa>;
  treeAuthority?: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper?: Address<TAccountLogWrapper>;
  compressionProgram?: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram?: Address<TAccountBubblegumProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  listState: Address<TAccountListState>;
  buyer?: Address<TAccountBuyer>;
  payer: TransactionSigner<TAccountPayer>;
  payerSource: Address<TAccountPayerSource>;
  owner: Address<TAccountOwner>;
  ownerDestination: Address<TAccountOwnerDestination>;
  currency: Address<TAccountCurrency>;
  takerBroker?: Address<TAccountTakerBroker>;
  takerBrokerCurrencyTa?: Address<TAccountTakerBrokerCurrencyTa>;
  makerBroker?: Address<TAccountMakerBroker>;
  makerBrokerCurrencyTa?: Address<TAccountMakerBrokerCurrencyTa>;
  rentDestination?: Address<TAccountRentDestination>;
  rentPayer: TransactionSigner<TAccountRentPayer>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  nonce?: BuySplCompressedInstructionDataArgs['nonce'];
  index: BuySplCompressedInstructionDataArgs['index'];
  root: BuySplCompressedInstructionDataArgs['root'];
  metaHash: BuySplCompressedInstructionDataArgs['metaHash'];
  creatorShares: BuySplCompressedInstructionDataArgs['creatorShares'];
  creatorVerified: BuySplCompressedInstructionDataArgs['creatorVerified'];
  sellerFeeBasisPoints: BuySplCompressedInstructionDataArgs['sellerFeeBasisPoints'];
  maxAmount: BuySplCompressedInstructionDataArgs['maxAmount'];
  optionalRoyaltyPct?: BuySplCompressedInstructionDataArgs['optionalRoyaltyPct'];
};

export async function getBuySplCompressedInstructionAsync<
  TAccountFeeVault extends string,
  TAccountFeeVaultTa extends string,
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountListState extends string,
  TAccountBuyer extends string,
  TAccountPayer extends string,
  TAccountPayerSource extends string,
  TAccountOwner extends string,
  TAccountOwnerDestination extends string,
  TAccountCurrency extends string,
  TAccountTakerBroker extends string,
  TAccountTakerBrokerCurrencyTa extends string,
  TAccountMakerBroker extends string,
  TAccountMakerBrokerCurrencyTa extends string,
  TAccountRentDestination extends string,
  TAccountRentPayer extends string,
  TAccountCosigner extends string,
  TProgramAddress extends Address = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
>(
  input: BuySplCompressedAsyncInput<
    TAccountFeeVault,
    TAccountFeeVaultTa,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountListState,
    TAccountBuyer,
    TAccountPayer,
    TAccountPayerSource,
    TAccountOwner,
    TAccountOwnerDestination,
    TAccountCurrency,
    TAccountTakerBroker,
    TAccountTakerBrokerCurrencyTa,
    TAccountMakerBroker,
    TAccountMakerBrokerCurrencyTa,
    TAccountRentDestination,
    TAccountRentPayer,
    TAccountCosigner
  >,
  config?: { programAddress?: TProgramAddress }
): Promise<
  BuySplCompressedInstruction<
    TProgramAddress,
    TAccountFeeVault,
    TAccountFeeVaultTa,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountListState,
    TAccountBuyer,
    TAccountPayer,
    TAccountPayerSource,
    TAccountOwner,
    TAccountOwnerDestination,
    TAccountCurrency,
    TAccountTakerBroker,
    TAccountTakerBrokerCurrencyTa,
    TAccountMakerBroker,
    TAccountMakerBrokerCurrencyTa,
    TAccountRentDestination,
    TAccountRentPayer,
    TAccountCosigner
  >
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    feeVaultTa: { value: input.feeVaultTa ?? null, isWritable: true },
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
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    associatedTokenProgram: {
      value: input.associatedTokenProgram ?? null,
      isWritable: false,
    },
    listState: { value: input.listState ?? null, isWritable: true },
    buyer: { value: input.buyer ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: false },
    payerSource: { value: input.payerSource ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: false },
    ownerDestination: {
      value: input.ownerDestination ?? null,
      isWritable: true,
    },
    currency: { value: input.currency ?? null, isWritable: false },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    takerBrokerCurrencyTa: {
      value: input.takerBrokerCurrencyTa ?? null,
      isWritable: true,
    },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    makerBrokerCurrencyTa: {
      value: input.makerBrokerCurrencyTa ?? null,
      isWritable: true,
    },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
    rentPayer: { value: input.rentPayer ?? null, isWritable: true },
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
  if (!accounts.feeVault.value) {
    accounts.feeVault = {
      ...accounts.feeVault,
      ...(await resolveFeeVaultPdaFromListState(resolverScope)),
    };
  }
  if (!accounts.bubblegumProgram.value) {
    accounts.bubblegumProgram.value =
      'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY' as Address<'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY'>;
  }
  if (!accounts.treeAuthority.value) {
    accounts.treeAuthority = {
      ...accounts.treeAuthority,
      ...(await resolveTreeAuthorityPda(resolverScope)),
    };
  }
  if (!accounts.logWrapper.value) {
    accounts.logWrapper.value =
      'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV' as Address<'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV'>;
  }
  if (!accounts.compressionProgram.value) {
    accounts.compressionProgram.value =
      'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK' as Address<'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
  }
  if (!accounts.associatedTokenProgram.value) {
    accounts.associatedTokenProgram.value =
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>;
  }
  if (!accounts.buyer.value) {
    accounts.buyer.value = expectTransactionSigner(
      accounts.payer.value
    ).address;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }
  if (!args.nonce) {
    args.nonce = expectSome(args.index);
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.feeVaultTa),
      getAccountMeta(accounts.treeAuthority),
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.payerSource),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerDestination),
      getAccountMeta(accounts.currency),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.takerBrokerCurrencyTa),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.makerBrokerCurrencyTa),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.rentPayer),
      getAccountMeta(accounts.cosigner),
    ],
    programAddress,
    data: getBuySplCompressedInstructionDataEncoder().encode(
      args as BuySplCompressedInstructionDataArgs
    ),
  } as BuySplCompressedInstruction<
    TProgramAddress,
    TAccountFeeVault,
    TAccountFeeVaultTa,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountListState,
    TAccountBuyer,
    TAccountPayer,
    TAccountPayerSource,
    TAccountOwner,
    TAccountOwnerDestination,
    TAccountCurrency,
    TAccountTakerBroker,
    TAccountTakerBrokerCurrencyTa,
    TAccountMakerBroker,
    TAccountMakerBrokerCurrencyTa,
    TAccountRentDestination,
    TAccountRentPayer,
    TAccountCosigner
  >;

  return instruction;
}

export type BuySplCompressedInput<
  TAccountFeeVault extends string = string,
  TAccountFeeVaultTa extends string = string,
  TAccountTreeAuthority extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountListState extends string = string,
  TAccountBuyer extends string = string,
  TAccountPayer extends string = string,
  TAccountPayerSource extends string = string,
  TAccountOwner extends string = string,
  TAccountOwnerDestination extends string = string,
  TAccountCurrency extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountTakerBrokerCurrencyTa extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountMakerBrokerCurrencyTa extends string = string,
  TAccountRentDestination extends string = string,
  TAccountRentPayer extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  feeVaultTa: Address<TAccountFeeVaultTa>;
  treeAuthority: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper?: Address<TAccountLogWrapper>;
  compressionProgram?: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram?: Address<TAccountBubblegumProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  listState: Address<TAccountListState>;
  buyer?: Address<TAccountBuyer>;
  payer: TransactionSigner<TAccountPayer>;
  payerSource: Address<TAccountPayerSource>;
  owner: Address<TAccountOwner>;
  ownerDestination: Address<TAccountOwnerDestination>;
  currency: Address<TAccountCurrency>;
  takerBroker?: Address<TAccountTakerBroker>;
  takerBrokerCurrencyTa?: Address<TAccountTakerBrokerCurrencyTa>;
  makerBroker?: Address<TAccountMakerBroker>;
  makerBrokerCurrencyTa?: Address<TAccountMakerBrokerCurrencyTa>;
  rentDestination?: Address<TAccountRentDestination>;
  rentPayer: TransactionSigner<TAccountRentPayer>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  nonce?: BuySplCompressedInstructionDataArgs['nonce'];
  index: BuySplCompressedInstructionDataArgs['index'];
  root: BuySplCompressedInstructionDataArgs['root'];
  metaHash: BuySplCompressedInstructionDataArgs['metaHash'];
  creatorShares: BuySplCompressedInstructionDataArgs['creatorShares'];
  creatorVerified: BuySplCompressedInstructionDataArgs['creatorVerified'];
  sellerFeeBasisPoints: BuySplCompressedInstructionDataArgs['sellerFeeBasisPoints'];
  maxAmount: BuySplCompressedInstructionDataArgs['maxAmount'];
  optionalRoyaltyPct?: BuySplCompressedInstructionDataArgs['optionalRoyaltyPct'];
};

export function getBuySplCompressedInstruction<
  TAccountFeeVault extends string,
  TAccountFeeVaultTa extends string,
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountListState extends string,
  TAccountBuyer extends string,
  TAccountPayer extends string,
  TAccountPayerSource extends string,
  TAccountOwner extends string,
  TAccountOwnerDestination extends string,
  TAccountCurrency extends string,
  TAccountTakerBroker extends string,
  TAccountTakerBrokerCurrencyTa extends string,
  TAccountMakerBroker extends string,
  TAccountMakerBrokerCurrencyTa extends string,
  TAccountRentDestination extends string,
  TAccountRentPayer extends string,
  TAccountCosigner extends string,
  TProgramAddress extends Address = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
>(
  input: BuySplCompressedInput<
    TAccountFeeVault,
    TAccountFeeVaultTa,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountListState,
    TAccountBuyer,
    TAccountPayer,
    TAccountPayerSource,
    TAccountOwner,
    TAccountOwnerDestination,
    TAccountCurrency,
    TAccountTakerBroker,
    TAccountTakerBrokerCurrencyTa,
    TAccountMakerBroker,
    TAccountMakerBrokerCurrencyTa,
    TAccountRentDestination,
    TAccountRentPayer,
    TAccountCosigner
  >,
  config?: { programAddress?: TProgramAddress }
): BuySplCompressedInstruction<
  TProgramAddress,
  TAccountFeeVault,
  TAccountFeeVaultTa,
  TAccountTreeAuthority,
  TAccountMerkleTree,
  TAccountLogWrapper,
  TAccountCompressionProgram,
  TAccountSystemProgram,
  TAccountBubblegumProgram,
  TAccountMarketplaceProgram,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountListState,
  TAccountBuyer,
  TAccountPayer,
  TAccountPayerSource,
  TAccountOwner,
  TAccountOwnerDestination,
  TAccountCurrency,
  TAccountTakerBroker,
  TAccountTakerBrokerCurrencyTa,
  TAccountMakerBroker,
  TAccountMakerBrokerCurrencyTa,
  TAccountRentDestination,
  TAccountRentPayer,
  TAccountCosigner
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    feeVaultTa: { value: input.feeVaultTa ?? null, isWritable: true },
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
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    associatedTokenProgram: {
      value: input.associatedTokenProgram ?? null,
      isWritable: false,
    },
    listState: { value: input.listState ?? null, isWritable: true },
    buyer: { value: input.buyer ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: false },
    payerSource: { value: input.payerSource ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: false },
    ownerDestination: {
      value: input.ownerDestination ?? null,
      isWritable: true,
    },
    currency: { value: input.currency ?? null, isWritable: false },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    takerBrokerCurrencyTa: {
      value: input.takerBrokerCurrencyTa ?? null,
      isWritable: true,
    },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    makerBrokerCurrencyTa: {
      value: input.makerBrokerCurrencyTa ?? null,
      isWritable: true,
    },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
    rentPayer: { value: input.rentPayer ?? null, isWritable: true },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.bubblegumProgram.value) {
    accounts.bubblegumProgram.value =
      'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY' as Address<'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY'>;
  }
  if (!accounts.logWrapper.value) {
    accounts.logWrapper.value =
      'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV' as Address<'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV'>;
  }
  if (!accounts.compressionProgram.value) {
    accounts.compressionProgram.value =
      'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK' as Address<'cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
  }
  if (!accounts.associatedTokenProgram.value) {
    accounts.associatedTokenProgram.value =
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>;
  }
  if (!accounts.buyer.value) {
    accounts.buyer.value = expectTransactionSigner(
      accounts.payer.value
    ).address;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }
  if (!args.nonce) {
    args.nonce = expectSome(args.index);
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.feeVaultTa),
      getAccountMeta(accounts.treeAuthority),
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.payerSource),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerDestination),
      getAccountMeta(accounts.currency),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.takerBrokerCurrencyTa),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.makerBrokerCurrencyTa),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.rentPayer),
      getAccountMeta(accounts.cosigner),
    ],
    programAddress,
    data: getBuySplCompressedInstructionDataEncoder().encode(
      args as BuySplCompressedInstructionDataArgs
    ),
  } as BuySplCompressedInstruction<
    TProgramAddress,
    TAccountFeeVault,
    TAccountFeeVaultTa,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountListState,
    TAccountBuyer,
    TAccountPayer,
    TAccountPayerSource,
    TAccountOwner,
    TAccountOwnerDestination,
    TAccountCurrency,
    TAccountTakerBroker,
    TAccountTakerBrokerCurrencyTa,
    TAccountMakerBroker,
    TAccountMakerBrokerCurrencyTa,
    TAccountRentDestination,
    TAccountRentPayer,
    TAccountCosigner
  >;

  return instruction;
}

export type ParsedBuySplCompressedInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
    feeVaultTa: TAccountMetas[1];
    treeAuthority: TAccountMetas[2];
    merkleTree: TAccountMetas[3];
    logWrapper: TAccountMetas[4];
    compressionProgram: TAccountMetas[5];
    systemProgram: TAccountMetas[6];
    bubblegumProgram: TAccountMetas[7];
    marketplaceProgram: TAccountMetas[8];
    tokenProgram: TAccountMetas[9];
    associatedTokenProgram: TAccountMetas[10];
    listState: TAccountMetas[11];
    buyer: TAccountMetas[12];
    payer: TAccountMetas[13];
    payerSource: TAccountMetas[14];
    owner: TAccountMetas[15];
    ownerDestination: TAccountMetas[16];
    currency: TAccountMetas[17];
    takerBroker?: TAccountMetas[18] | undefined;
    takerBrokerCurrencyTa?: TAccountMetas[19] | undefined;
    makerBroker?: TAccountMetas[20] | undefined;
    makerBrokerCurrencyTa?: TAccountMetas[21] | undefined;
    rentDestination: TAccountMetas[22];
    rentPayer: TAccountMetas[23];
    cosigner?: TAccountMetas[24] | undefined;
  };
  data: BuySplCompressedInstructionData;
};

export function parseBuySplCompressedInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedBuySplCompressedInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 25) {
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
      feeVaultTa: getNextAccount(),
      treeAuthority: getNextAccount(),
      merkleTree: getNextAccount(),
      logWrapper: getNextAccount(),
      compressionProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      bubblegumProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      listState: getNextAccount(),
      buyer: getNextAccount(),
      payer: getNextAccount(),
      payerSource: getNextAccount(),
      owner: getNextAccount(),
      ownerDestination: getNextAccount(),
      currency: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      takerBrokerCurrencyTa: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      makerBrokerCurrencyTa: getNextOptionalAccount(),
      rentDestination: getNextAccount(),
      rentPayer: getNextAccount(),
      cosigner: getNextOptionalAccount(),
    },
    data: getBuySplCompressedInstructionDataDecoder().decode(instruction.data),
  };
}
