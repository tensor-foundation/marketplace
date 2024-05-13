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
  Option,
  OptionOrNullable,
  combineCodec,
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
  getU8Decoder,
  getU8Encoder,
  mapEncoder,
  none,
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
import { resolveTreeAuthorityPda } from '../../hooked';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';

export type BuySplInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountFeeVaultAta extends string | IAccountMeta<string> = string,
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
  TAccountOwnerDest extends string | IAccountMeta<string> = string,
  TAccountCurrency extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountTakerBrokerAta extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBrokerAta extends string | IAccountMeta<string> = string,
  TAccountRentDest extends string | IAccountMeta<string> = string,
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
      TAccountFeeVaultAta extends string
        ? WritableAccount<TAccountFeeVaultAta>
        : TAccountFeeVaultAta,
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
      TAccountOwnerDest extends string
        ? WritableAccount<TAccountOwnerDest>
        : TAccountOwnerDest,
      TAccountCurrency extends string
        ? ReadonlyAccount<TAccountCurrency>
        : TAccountCurrency,
      TAccountTakerBroker extends string
        ? WritableAccount<TAccountTakerBroker>
        : TAccountTakerBroker,
      TAccountTakerBrokerAta extends string
        ? WritableAccount<TAccountTakerBrokerAta>
        : TAccountTakerBrokerAta,
      TAccountMakerBroker extends string
        ? WritableAccount<TAccountMakerBroker>
        : TAccountMakerBroker,
      TAccountMakerBrokerAta extends string
        ? WritableAccount<TAccountMakerBrokerAta>
        : TAccountMakerBrokerAta,
      TAccountRentDest extends string
        ? WritableAccount<TAccountRentDest>
        : TAccountRentDest,
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

export type BuySplInstructionData = {
  discriminator: Array<number>;
  nonce: bigint;
  index: number;
  root: Uint8Array;
  metaHash: Uint8Array;
  creatorShares: Uint8Array;
  creatorVerified: Array<boolean>;
  sellerFeeBasisPoints: number;
  maxAmount: bigint;
  optionalRoyaltyPct: Option<number>;
};

export type BuySplInstructionDataArgs = {
  nonce: number | bigint;
  index: number;
  root: Uint8Array;
  metaHash: Uint8Array;
  creatorShares: Uint8Array;
  creatorVerified: Array<boolean>;
  sellerFeeBasisPoints: number;
  maxAmount: number | bigint;
  optionalRoyaltyPct?: OptionOrNullable<number>;
};

export function getBuySplInstructionDataEncoder(): Encoder<BuySplInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['nonce', getU64Encoder()],
      ['index', getU32Encoder()],
      ['root', getBytesEncoder({ size: 32 })],
      ['metaHash', getBytesEncoder({ size: 32 })],
      ['creatorShares', getBytesEncoder({ size: getU32Encoder() })],
      ['creatorVerified', getArrayEncoder(getBooleanEncoder())],
      ['sellerFeeBasisPoints', getU16Encoder()],
      ['maxAmount', getU64Encoder()],
      ['optionalRoyaltyPct', getOptionEncoder(getU16Encoder())],
    ]),
    (value) => ({
      ...value,
      discriminator: [65, 136, 254, 255, 59, 130, 234, 174],
      optionalRoyaltyPct: value.optionalRoyaltyPct ?? none(),
    })
  );
}

export function getBuySplInstructionDataDecoder(): Decoder<BuySplInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['nonce', getU64Decoder()],
    ['index', getU32Decoder()],
    ['root', getBytesDecoder({ size: 32 })],
    ['metaHash', getBytesDecoder({ size: 32 })],
    ['creatorShares', getBytesDecoder({ size: getU32Decoder() })],
    ['creatorVerified', getArrayDecoder(getBooleanDecoder())],
    ['sellerFeeBasisPoints', getU16Decoder()],
    ['maxAmount', getU64Decoder()],
    ['optionalRoyaltyPct', getOptionDecoder(getU16Decoder())],
  ]);
}

export function getBuySplInstructionDataCodec(): Codec<
  BuySplInstructionDataArgs,
  BuySplInstructionData
> {
  return combineCodec(
    getBuySplInstructionDataEncoder(),
    getBuySplInstructionDataDecoder()
  );
}

export type BuySplAsyncInput<
  TAccountFeeVault extends string = string,
  TAccountFeeVaultAta extends string = string,
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
  TAccountOwnerDest extends string = string,
  TAccountCurrency extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountTakerBrokerAta extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountMakerBrokerAta extends string = string,
  TAccountRentDest extends string = string,
  TAccountRentPayer extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  feeVaultAta: Address<TAccountFeeVaultAta>;
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
  buyer: Address<TAccountBuyer>;
  payer: TransactionSigner<TAccountPayer>;
  payerSource: Address<TAccountPayerSource>;
  owner: Address<TAccountOwner>;
  ownerDest: Address<TAccountOwnerDest>;
  currency: Address<TAccountCurrency>;
  takerBroker?: Address<TAccountTakerBroker>;
  takerBrokerAta?: Address<TAccountTakerBrokerAta>;
  makerBroker?: Address<TAccountMakerBroker>;
  makerBrokerAta?: Address<TAccountMakerBrokerAta>;
  rentDest: Address<TAccountRentDest>;
  rentPayer: TransactionSigner<TAccountRentPayer>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  nonce: BuySplInstructionDataArgs['nonce'];
  index: BuySplInstructionDataArgs['index'];
  root: BuySplInstructionDataArgs['root'];
  metaHash: BuySplInstructionDataArgs['metaHash'];
  creatorShares: BuySplInstructionDataArgs['creatorShares'];
  creatorVerified: BuySplInstructionDataArgs['creatorVerified'];
  sellerFeeBasisPoints: BuySplInstructionDataArgs['sellerFeeBasisPoints'];
  maxAmount: BuySplInstructionDataArgs['maxAmount'];
  optionalRoyaltyPct?: BuySplInstructionDataArgs['optionalRoyaltyPct'];
};

export async function getBuySplInstructionAsync<
  TAccountFeeVault extends string,
  TAccountFeeVaultAta extends string,
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
  TAccountOwnerDest extends string,
  TAccountCurrency extends string,
  TAccountTakerBroker extends string,
  TAccountTakerBrokerAta extends string,
  TAccountMakerBroker extends string,
  TAccountMakerBrokerAta extends string,
  TAccountRentDest extends string,
  TAccountRentPayer extends string,
  TAccountCosigner extends string,
>(
  input: BuySplAsyncInput<
    TAccountFeeVault,
    TAccountFeeVaultAta,
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
    TAccountOwnerDest,
    TAccountCurrency,
    TAccountTakerBroker,
    TAccountTakerBrokerAta,
    TAccountMakerBroker,
    TAccountMakerBrokerAta,
    TAccountRentDest,
    TAccountRentPayer,
    TAccountCosigner
  >
): Promise<
  BuySplInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountFeeVaultAta,
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
    TAccountOwnerDest,
    TAccountCurrency,
    TAccountTakerBroker,
    TAccountTakerBrokerAta,
    TAccountMakerBroker,
    TAccountMakerBrokerAta,
    TAccountRentDest,
    TAccountRentPayer,
    TAccountCosigner
  >
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    feeVaultAta: { value: input.feeVaultAta ?? null, isWritable: true },
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
    ownerDest: { value: input.ownerDest ?? null, isWritable: true },
    currency: { value: input.currency ?? null, isWritable: false },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    takerBrokerAta: { value: input.takerBrokerAta ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    makerBrokerAta: { value: input.makerBrokerAta ?? null, isWritable: true },
    rentDest: { value: input.rentDest ?? null, isWritable: true },
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

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.feeVaultAta),
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
      getAccountMeta(accounts.ownerDest),
      getAccountMeta(accounts.currency),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.takerBrokerAta),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.makerBrokerAta),
      getAccountMeta(accounts.rentDest),
      getAccountMeta(accounts.rentPayer),
      getAccountMeta(accounts.cosigner),
    ],
    programAddress,
    data: getBuySplInstructionDataEncoder().encode(
      args as BuySplInstructionDataArgs
    ),
  } as BuySplInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountFeeVaultAta,
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
    TAccountOwnerDest,
    TAccountCurrency,
    TAccountTakerBroker,
    TAccountTakerBrokerAta,
    TAccountMakerBroker,
    TAccountMakerBrokerAta,
    TAccountRentDest,
    TAccountRentPayer,
    TAccountCosigner
  >;

  return instruction;
}

export type BuySplInput<
  TAccountFeeVault extends string = string,
  TAccountFeeVaultAta extends string = string,
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
  TAccountOwnerDest extends string = string,
  TAccountCurrency extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountTakerBrokerAta extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountMakerBrokerAta extends string = string,
  TAccountRentDest extends string = string,
  TAccountRentPayer extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  feeVaultAta: Address<TAccountFeeVaultAta>;
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
  buyer: Address<TAccountBuyer>;
  payer: TransactionSigner<TAccountPayer>;
  payerSource: Address<TAccountPayerSource>;
  owner: Address<TAccountOwner>;
  ownerDest: Address<TAccountOwnerDest>;
  currency: Address<TAccountCurrency>;
  takerBroker?: Address<TAccountTakerBroker>;
  takerBrokerAta?: Address<TAccountTakerBrokerAta>;
  makerBroker?: Address<TAccountMakerBroker>;
  makerBrokerAta?: Address<TAccountMakerBrokerAta>;
  rentDest: Address<TAccountRentDest>;
  rentPayer: TransactionSigner<TAccountRentPayer>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  nonce: BuySplInstructionDataArgs['nonce'];
  index: BuySplInstructionDataArgs['index'];
  root: BuySplInstructionDataArgs['root'];
  metaHash: BuySplInstructionDataArgs['metaHash'];
  creatorShares: BuySplInstructionDataArgs['creatorShares'];
  creatorVerified: BuySplInstructionDataArgs['creatorVerified'];
  sellerFeeBasisPoints: BuySplInstructionDataArgs['sellerFeeBasisPoints'];
  maxAmount: BuySplInstructionDataArgs['maxAmount'];
  optionalRoyaltyPct?: BuySplInstructionDataArgs['optionalRoyaltyPct'];
};

export function getBuySplInstruction<
  TAccountFeeVault extends string,
  TAccountFeeVaultAta extends string,
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
  TAccountOwnerDest extends string,
  TAccountCurrency extends string,
  TAccountTakerBroker extends string,
  TAccountTakerBrokerAta extends string,
  TAccountMakerBroker extends string,
  TAccountMakerBrokerAta extends string,
  TAccountRentDest extends string,
  TAccountRentPayer extends string,
  TAccountCosigner extends string,
>(
  input: BuySplInput<
    TAccountFeeVault,
    TAccountFeeVaultAta,
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
    TAccountOwnerDest,
    TAccountCurrency,
    TAccountTakerBroker,
    TAccountTakerBrokerAta,
    TAccountMakerBroker,
    TAccountMakerBrokerAta,
    TAccountRentDest,
    TAccountRentPayer,
    TAccountCosigner
  >
): BuySplInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault,
  TAccountFeeVaultAta,
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
  TAccountOwnerDest,
  TAccountCurrency,
  TAccountTakerBroker,
  TAccountTakerBrokerAta,
  TAccountMakerBroker,
  TAccountMakerBrokerAta,
  TAccountRentDest,
  TAccountRentPayer,
  TAccountCosigner
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    feeVaultAta: { value: input.feeVaultAta ?? null, isWritable: true },
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
    ownerDest: { value: input.ownerDest ?? null, isWritable: true },
    currency: { value: input.currency ?? null, isWritable: false },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    takerBrokerAta: { value: input.takerBrokerAta ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    makerBrokerAta: { value: input.makerBrokerAta ?? null, isWritable: true },
    rentDest: { value: input.rentDest ?? null, isWritable: true },
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

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.feeVaultAta),
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
      getAccountMeta(accounts.ownerDest),
      getAccountMeta(accounts.currency),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.takerBrokerAta),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.makerBrokerAta),
      getAccountMeta(accounts.rentDest),
      getAccountMeta(accounts.rentPayer),
      getAccountMeta(accounts.cosigner),
    ],
    programAddress,
    data: getBuySplInstructionDataEncoder().encode(
      args as BuySplInstructionDataArgs
    ),
  } as BuySplInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountFeeVaultAta,
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
    TAccountOwnerDest,
    TAccountCurrency,
    TAccountTakerBroker,
    TAccountTakerBrokerAta,
    TAccountMakerBroker,
    TAccountMakerBrokerAta,
    TAccountRentDest,
    TAccountRentPayer,
    TAccountCosigner
  >;

  return instruction;
}

export type ParsedBuySplInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
    feeVaultAta: TAccountMetas[1];
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
    ownerDest: TAccountMetas[16];
    currency: TAccountMetas[17];
    takerBroker?: TAccountMetas[18] | undefined;
    takerBrokerAta?: TAccountMetas[19] | undefined;
    makerBroker?: TAccountMetas[20] | undefined;
    makerBrokerAta?: TAccountMetas[21] | undefined;
    rentDest: TAccountMetas[22];
    rentPayer: TAccountMetas[23];
    cosigner?: TAccountMetas[24] | undefined;
  };
  data: BuySplInstructionData;
};

export function parseBuySplInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedBuySplInstruction<TProgram, TAccountMetas> {
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
      feeVaultAta: getNextAccount(),
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
      ownerDest: getNextAccount(),
      currency: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      takerBrokerAta: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      makerBrokerAta: getNextOptionalAccount(),
      rentDest: getNextAccount(),
      rentPayer: getNextAccount(),
      cosigner: getNextOptionalAccount(),
    },
    data: getBuySplInstructionDataDecoder().decode(instruction.data),
  };
}
