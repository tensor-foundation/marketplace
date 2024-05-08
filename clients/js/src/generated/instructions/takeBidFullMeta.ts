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
  getStringDecoder,
  getStringEncoder,
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
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import { findFeeVaultPda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';
import {
  TCollection,
  TCollectionArgs,
  TTokenProgramVersion,
  TTokenProgramVersionArgs,
  TTokenStandard,
  TTokenStandardArgs,
  TUses,
  TUsesArgs,
  getTCollectionDecoder,
  getTCollectionEncoder,
  getTTokenProgramVersionDecoder,
  getTTokenProgramVersionEncoder,
  getTTokenStandardDecoder,
  getTTokenStandardEncoder,
  getTUsesDecoder,
  getTUsesEncoder,
} from '../types';

export type TakeBidFullMetaInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountSeller extends string | IAccountMeta<string> = string,
  TAccountDelegate extends string | IAccountMeta<string> = string,
  TAccountMerkleTree extends string | IAccountMeta<string> = string,
  TAccountLogWrapper extends string | IAccountMeta<string> = string,
  TAccountCompressionProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountBubblegumProgram extends string | IAccountMeta<string> = string,
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTensorswapProgram extends string | IAccountMeta<string> = string,
  TAccountBidState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountMarginAccount extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountRentDest extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountFeeVault extends string
        ? WritableAccount<TAccountFeeVault>
        : TAccountFeeVault,
      TAccountTreeAuthority extends string
        ? ReadonlyAccount<TAccountTreeAuthority>
        : TAccountTreeAuthority,
      TAccountSeller extends string
        ? WritableAccount<TAccountSeller>
        : TAccountSeller,
      TAccountDelegate extends string
        ? ReadonlyAccount<TAccountDelegate>
        : TAccountDelegate,
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
      TAccountTensorswapProgram extends string
        ? ReadonlyAccount<TAccountTensorswapProgram>
        : TAccountTensorswapProgram,
      TAccountBidState extends string
        ? WritableAccount<TAccountBidState>
        : TAccountBidState,
      TAccountOwner extends string
        ? WritableAccount<TAccountOwner>
        : TAccountOwner,
      TAccountTakerBroker extends string
        ? WritableAccount<TAccountTakerBroker>
        : TAccountTakerBroker,
      TAccountMakerBroker extends string
        ? WritableAccount<TAccountMakerBroker>
        : TAccountMakerBroker,
      TAccountMarginAccount extends string
        ? WritableAccount<TAccountMarginAccount>
        : TAccountMarginAccount,
      TAccountWhitelist extends string
        ? ReadonlyAccount<TAccountWhitelist>
        : TAccountWhitelist,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      TAccountRentDest extends string
        ? WritableAccount<TAccountRentDest>
        : TAccountRentDest,
      ...TRemainingAccounts,
    ]
  >;

export type TakeBidFullMetaInstructionData = {
  discriminator: Array<number>;
  nonce: bigint;
  index: number;
  root: Uint8Array;
  /** The name of the asset */
  name: string;
  /** The symbol for the asset */
  symbol: string;
  /** URI pointing to JSON representing the asset */
  uri: string;
  /** Royalty basis points that goes to creators in secondary sales (0-10000) */
  sellerFeeBasisPoints: number;
  primarySaleHappened: boolean;
  isMutable: boolean;
  /** nonce for easy calculation of editions, if present */
  editionNonce: Option<number>;
  /** Since we cannot easily change Metadata, we add the new DataV2 fields here at the end. */
  tokenStandard: Option<TTokenStandard>;
  /** Collection */
  collection: Option<TCollection>;
  /** Uses */
  uses: Option<TUses>;
  tokenProgramVersion: TTokenProgramVersion;
  creatorShares: Uint8Array;
  creatorVerified: Array<boolean>;
  minAmount: bigint;
  optionalRoyaltyPct: Option<number>;
};

export type TakeBidFullMetaInstructionDataArgs = {
  nonce: number | bigint;
  index: number;
  root: Uint8Array;
  /** The name of the asset */
  name: string;
  /** The symbol for the asset */
  symbol: string;
  /** URI pointing to JSON representing the asset */
  uri: string;
  /** Royalty basis points that goes to creators in secondary sales (0-10000) */
  sellerFeeBasisPoints: number;
  primarySaleHappened: boolean;
  isMutable: boolean;
  /** nonce for easy calculation of editions, if present */
  editionNonce: OptionOrNullable<number>;
  /** Since we cannot easily change Metadata, we add the new DataV2 fields here at the end. */
  tokenStandard: OptionOrNullable<TTokenStandardArgs>;
  /** Collection */
  collection: OptionOrNullable<TCollectionArgs>;
  /** Uses */
  uses: OptionOrNullable<TUsesArgs>;
  tokenProgramVersion: TTokenProgramVersionArgs;
  creatorShares: Uint8Array;
  creatorVerified: Array<boolean>;
  minAmount: number | bigint;
  optionalRoyaltyPct?: OptionOrNullable<number>;
};

export function getTakeBidFullMetaInstructionDataEncoder(): Encoder<TakeBidFullMetaInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['nonce', getU64Encoder()],
      ['index', getU32Encoder()],
      ['root', getBytesEncoder({ size: 32 })],
      ['name', getStringEncoder()],
      ['symbol', getStringEncoder()],
      ['uri', getStringEncoder()],
      ['sellerFeeBasisPoints', getU16Encoder()],
      ['primarySaleHappened', getBooleanEncoder()],
      ['isMutable', getBooleanEncoder()],
      ['editionNonce', getOptionEncoder(getU8Encoder())],
      ['tokenStandard', getOptionEncoder(getTTokenStandardEncoder())],
      ['collection', getOptionEncoder(getTCollectionEncoder())],
      ['uses', getOptionEncoder(getTUsesEncoder())],
      ['tokenProgramVersion', getTTokenProgramVersionEncoder()],
      ['creatorShares', getBytesEncoder({ size: getU32Encoder() })],
      ['creatorVerified', getArrayEncoder(getBooleanEncoder())],
      ['minAmount', getU64Encoder()],
      ['optionalRoyaltyPct', getOptionEncoder(getU16Encoder())],
    ]),
    (value) => ({
      ...value,
      discriminator: [242, 194, 203, 225, 234, 53, 10, 96],
      optionalRoyaltyPct: value.optionalRoyaltyPct ?? none(),
    })
  );
}

export function getTakeBidFullMetaInstructionDataDecoder(): Decoder<TakeBidFullMetaInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['nonce', getU64Decoder()],
    ['index', getU32Decoder()],
    ['root', getBytesDecoder({ size: 32 })],
    ['name', getStringDecoder()],
    ['symbol', getStringDecoder()],
    ['uri', getStringDecoder()],
    ['sellerFeeBasisPoints', getU16Decoder()],
    ['primarySaleHappened', getBooleanDecoder()],
    ['isMutable', getBooleanDecoder()],
    ['editionNonce', getOptionDecoder(getU8Decoder())],
    ['tokenStandard', getOptionDecoder(getTTokenStandardDecoder())],
    ['collection', getOptionDecoder(getTCollectionDecoder())],
    ['uses', getOptionDecoder(getTUsesDecoder())],
    ['tokenProgramVersion', getTTokenProgramVersionDecoder()],
    ['creatorShares', getBytesDecoder({ size: getU32Decoder() })],
    ['creatorVerified', getArrayDecoder(getBooleanDecoder())],
    ['minAmount', getU64Decoder()],
    ['optionalRoyaltyPct', getOptionDecoder(getU16Decoder())],
  ]);
}

export function getTakeBidFullMetaInstructionDataCodec(): Codec<
  TakeBidFullMetaInstructionDataArgs,
  TakeBidFullMetaInstructionData
> {
  return combineCodec(
    getTakeBidFullMetaInstructionDataEncoder(),
    getTakeBidFullMetaInstructionDataDecoder()
  );
}

export type TakeBidFullMetaAsyncInput<
  TAccountFeeVault extends string = string,
  TAccountTreeAuthority extends string = string,
  TAccountSeller extends string = string,
  TAccountDelegate extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountTensorswapProgram extends string = string,
  TAccountBidState extends string = string,
  TAccountOwner extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountMarginAccount extends string = string,
  TAccountWhitelist extends string = string,
  TAccountCosigner extends string = string,
  TAccountRentDest extends string = string,
> = {
  feeVault?: Address<TAccountFeeVault>;
  treeAuthority: Address<TAccountTreeAuthority>;
  seller: Address<TAccountSeller>;
  delegate: Address<TAccountDelegate>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper: Address<TAccountLogWrapper>;
  compressionProgram: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram: Address<TAccountBubblegumProgram>;
  tcompProgram: Address<TAccountTcompProgram>;
  tensorswapProgram: Address<TAccountTensorswapProgram>;
  bidState: Address<TAccountBidState>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  marginAccount: Address<TAccountMarginAccount>;
  whitelist: Address<TAccountWhitelist>;
  cosigner: TransactionSigner<TAccountCosigner>;
  rentDest: Address<TAccountRentDest>;
  nonce: TakeBidFullMetaInstructionDataArgs['nonce'];
  index: TakeBidFullMetaInstructionDataArgs['index'];
  root: TakeBidFullMetaInstructionDataArgs['root'];
  name: TakeBidFullMetaInstructionDataArgs['name'];
  symbol: TakeBidFullMetaInstructionDataArgs['symbol'];
  uri: TakeBidFullMetaInstructionDataArgs['uri'];
  sellerFeeBasisPoints: TakeBidFullMetaInstructionDataArgs['sellerFeeBasisPoints'];
  primarySaleHappened: TakeBidFullMetaInstructionDataArgs['primarySaleHappened'];
  isMutable: TakeBidFullMetaInstructionDataArgs['isMutable'];
  editionNonce: TakeBidFullMetaInstructionDataArgs['editionNonce'];
  tokenStandard: TakeBidFullMetaInstructionDataArgs['tokenStandard'];
  collection: TakeBidFullMetaInstructionDataArgs['collection'];
  uses: TakeBidFullMetaInstructionDataArgs['uses'];
  tokenProgramVersion: TakeBidFullMetaInstructionDataArgs['tokenProgramVersion'];
  creatorShares: TakeBidFullMetaInstructionDataArgs['creatorShares'];
  creatorVerified: TakeBidFullMetaInstructionDataArgs['creatorVerified'];
  minAmount: TakeBidFullMetaInstructionDataArgs['minAmount'];
  optionalRoyaltyPct?: TakeBidFullMetaInstructionDataArgs['optionalRoyaltyPct'];
};

export async function getTakeBidFullMetaInstructionAsync<
  TAccountFeeVault extends string,
  TAccountTreeAuthority extends string,
  TAccountSeller extends string,
  TAccountDelegate extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountTcompProgram extends string,
  TAccountTensorswapProgram extends string,
  TAccountBidState extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountMarginAccount extends string,
  TAccountWhitelist extends string,
  TAccountCosigner extends string,
  TAccountRentDest extends string,
>(
  input: TakeBidFullMetaAsyncInput<
    TAccountFeeVault,
    TAccountTreeAuthority,
    TAccountSeller,
    TAccountDelegate,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountTcompProgram,
    TAccountTensorswapProgram,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountCosigner,
    TAccountRentDest
  >
): Promise<
  TakeBidFullMetaInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountTreeAuthority,
    TAccountSeller,
    TAccountDelegate,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountTcompProgram,
    TAccountTensorswapProgram,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountCosigner,
    TAccountRentDest
  >
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    treeAuthority: { value: input.treeAuthority ?? null, isWritable: false },
    seller: { value: input.seller ?? null, isWritable: true },
    delegate: { value: input.delegate ?? null, isWritable: false },
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
    tcompProgram: { value: input.tcompProgram ?? null, isWritable: false },
    tensorswapProgram: {
      value: input.tensorswapProgram ?? null,
      isWritable: false,
    },
    bidState: { value: input.bidState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    marginAccount: { value: input.marginAccount ?? null, isWritable: true },
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
    rentDest: { value: input.rentDest ?? null, isWritable: true },
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
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.treeAuthority),
      getAccountMeta(accounts.seller),
      getAccountMeta(accounts.delegate),
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.tcompProgram),
      getAccountMeta(accounts.tensorswapProgram),
      getAccountMeta(accounts.bidState),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.marginAccount),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.rentDest),
    ],
    programAddress,
    data: getTakeBidFullMetaInstructionDataEncoder().encode(
      args as TakeBidFullMetaInstructionDataArgs
    ),
  } as TakeBidFullMetaInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountTreeAuthority,
    TAccountSeller,
    TAccountDelegate,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountTcompProgram,
    TAccountTensorswapProgram,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountCosigner,
    TAccountRentDest
  >;

  return instruction;
}

export type TakeBidFullMetaInput<
  TAccountFeeVault extends string = string,
  TAccountTreeAuthority extends string = string,
  TAccountSeller extends string = string,
  TAccountDelegate extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountTcompProgram extends string = string,
  TAccountTensorswapProgram extends string = string,
  TAccountBidState extends string = string,
  TAccountOwner extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountMarginAccount extends string = string,
  TAccountWhitelist extends string = string,
  TAccountCosigner extends string = string,
  TAccountRentDest extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  treeAuthority: Address<TAccountTreeAuthority>;
  seller: Address<TAccountSeller>;
  delegate: Address<TAccountDelegate>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper: Address<TAccountLogWrapper>;
  compressionProgram: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram: Address<TAccountBubblegumProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  tensorswapProgram: Address<TAccountTensorswapProgram>;
  bidState: Address<TAccountBidState>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  marginAccount: Address<TAccountMarginAccount>;
  whitelist: Address<TAccountWhitelist>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  rentDest: Address<TAccountRentDest>;
  nonce: TakeBidFullMetaInstructionDataArgs['nonce'];
  index: TakeBidFullMetaInstructionDataArgs['index'];
  root: TakeBidFullMetaInstructionDataArgs['root'];
  name: TakeBidFullMetaInstructionDataArgs['name'];
  symbol: TakeBidFullMetaInstructionDataArgs['symbol'];
  uri: TakeBidFullMetaInstructionDataArgs['uri'];
  sellerFeeBasisPoints: TakeBidFullMetaInstructionDataArgs['sellerFeeBasisPoints'];
  primarySaleHappened: TakeBidFullMetaInstructionDataArgs['primarySaleHappened'];
  isMutable: TakeBidFullMetaInstructionDataArgs['isMutable'];
  editionNonce: TakeBidFullMetaInstructionDataArgs['editionNonce'];
  tokenStandard: TakeBidFullMetaInstructionDataArgs['tokenStandard'];
  collection: TakeBidFullMetaInstructionDataArgs['collection'];
  uses: TakeBidFullMetaInstructionDataArgs['uses'];
  tokenProgramVersion: TakeBidFullMetaInstructionDataArgs['tokenProgramVersion'];
  creatorShares: TakeBidFullMetaInstructionDataArgs['creatorShares'];
  creatorVerified: TakeBidFullMetaInstructionDataArgs['creatorVerified'];
  minAmount: TakeBidFullMetaInstructionDataArgs['minAmount'];
  optionalRoyaltyPct?: TakeBidFullMetaInstructionDataArgs['optionalRoyaltyPct'];
};

export function getTakeBidFullMetaInstruction<
  TAccountFeeVault extends string,
  TAccountTreeAuthority extends string,
  TAccountSeller extends string,
  TAccountDelegate extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountTensorswapProgram extends string,
  TAccountBidState extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountMarginAccount extends string,
  TAccountWhitelist extends string,
  TAccountCosigner extends string,
  TAccountRentDest extends string,
>(
  input: TakeBidFullMetaInput<
    TAccountFeeVault,
    TAccountTreeAuthority,
    TAccountSeller,
    TAccountDelegate,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountTensorswapProgram,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountCosigner,
    TAccountRentDest
  >
): TakeBidFullMetaInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault,
  TAccountTreeAuthority,
  TAccountSeller,
  TAccountDelegate,
  TAccountMerkleTree,
  TAccountLogWrapper,
  TAccountCompressionProgram,
  TAccountSystemProgram,
  TAccountBubblegumProgram,
  TAccountMarketplaceProgram,
  TAccountTensorswapProgram,
  TAccountBidState,
  TAccountOwner,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountMarginAccount,
  TAccountWhitelist,
  TAccountCosigner,
  TAccountRentDest
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    treeAuthority: { value: input.treeAuthority ?? null, isWritable: false },
    seller: { value: input.seller ?? null, isWritable: true },
    delegate: { value: input.delegate ?? null, isWritable: false },
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
    tensorswapProgram: {
      value: input.tensorswapProgram ?? null,
      isWritable: false,
    },
    bidState: { value: input.bidState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    marginAccount: { value: input.marginAccount ?? null, isWritable: true },
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
    rentDest: { value: input.rentDest ?? null, isWritable: true },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
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
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.treeAuthority),
      getAccountMeta(accounts.seller),
      getAccountMeta(accounts.delegate),
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.tensorswapProgram),
      getAccountMeta(accounts.bidState),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.marginAccount),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.rentDest),
    ],
    programAddress,
    data: getTakeBidFullMetaInstructionDataEncoder().encode(
      args as TakeBidFullMetaInstructionDataArgs
    ),
  } as TakeBidFullMetaInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountTreeAuthority,
    TAccountSeller,
    TAccountDelegate,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountTensorswapProgram,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountCosigner,
    TAccountRentDest
  >;

  return instruction;
}

export type ParsedTakeBidFullMetaInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
    treeAuthority: TAccountMetas[1];
    seller: TAccountMetas[2];
    delegate: TAccountMetas[3];
    merkleTree: TAccountMetas[4];
    logWrapper: TAccountMetas[5];
    compressionProgram: TAccountMetas[6];
    systemProgram: TAccountMetas[7];
    bubblegumProgram: TAccountMetas[8];
    marketplaceProgram: TAccountMetas[9];
    tensorswapProgram: TAccountMetas[10];
    bidState: TAccountMetas[11];
    owner: TAccountMetas[12];
    takerBroker?: TAccountMetas[13] | undefined;
    makerBroker?: TAccountMetas[14] | undefined;
    marginAccount: TAccountMetas[15];
    whitelist: TAccountMetas[16];
    cosigner?: TAccountMetas[17] | undefined;
    rentDest: TAccountMetas[18];
  };
  data: TakeBidFullMetaInstructionData;
};

export function parseTakeBidFullMetaInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedTakeBidFullMetaInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 19) {
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
      treeAuthority: getNextAccount(),
      seller: getNextAccount(),
      delegate: getNextAccount(),
      merkleTree: getNextAccount(),
      logWrapper: getNextAccount(),
      compressionProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      bubblegumProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      tensorswapProgram: getNextAccount(),
      bidState: getNextAccount(),
      owner: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      marginAccount: getNextAccount(),
      whitelist: getNextAccount(),
      cosigner: getNextOptionalAccount(),
      rentDest: getNextAccount(),
    },
    data: getTakeBidFullMetaInstructionDataDecoder().decode(instruction.data),
  };
}
