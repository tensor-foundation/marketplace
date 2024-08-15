/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
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
  getU8Decoder,
  getU8Encoder,
  getUtf8Decoder,
  getUtf8Encoder,
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
} from '@solana/web3.js';
import {
  resolveCreatorPath,
  resolveFeeVaultPdaFromBidState,
  resolveProofPath,
  resolveTreeAuthorityPda,
} from '../../hooked';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  expectSome,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';
import {
  getTCollectionDecoder,
  getTCollectionEncoder,
  getTTokenProgramVersionDecoder,
  getTTokenProgramVersionEncoder,
  getTTokenStandardDecoder,
  getTTokenStandardEncoder,
  getTUsesDecoder,
  getTUsesEncoder,
  type TCollection,
  type TCollectionArgs,
  type TTokenProgramVersion,
  type TTokenProgramVersionArgs,
  type TTokenStandard,
  type TTokenStandardArgs,
  type TUses,
  type TUsesArgs,
} from '../types';

export type TakeBidCompressedFullMetaInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
  TAccountSeller extends string | IAccountMeta<string> = string,
  TAccountDelegate extends string | IAccountMeta<string> = string,
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
  TAccountTensorswapProgram extends
    | string
    | IAccountMeta<string> = 'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN',
  TAccountBidState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountMargin extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
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
      TAccountMargin extends string
        ? WritableAccount<TAccountMargin>
        : TAccountMargin,
      TAccountWhitelist extends string
        ? ReadonlyAccount<TAccountWhitelist>
        : TAccountWhitelist,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      ...TRemainingAccounts,
    ]
  >;

export type TakeBidCompressedFullMetaInstructionData = {
  discriminator: ReadonlyUint8Array;
  nonce: bigint;
  index: number;
  root: ReadonlyUint8Array;
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
  creatorShares: ReadonlyUint8Array;
  creatorVerified: Array<boolean>;
  minAmount: bigint;
  optionalRoyaltyPct: Option<number>;
};

export type TakeBidCompressedFullMetaInstructionDataArgs = {
  nonce: number | bigint;
  index: number;
  root: ReadonlyUint8Array;
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
  creatorShares: ReadonlyUint8Array;
  creatorVerified: Array<boolean>;
  minAmount: number | bigint;
  optionalRoyaltyPct?: OptionOrNullable<number>;
};

export function getTakeBidCompressedFullMetaInstructionDataEncoder(): Encoder<TakeBidCompressedFullMetaInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['nonce', getU64Encoder()],
      ['index', getU32Encoder()],
      ['root', fixEncoderSize(getBytesEncoder(), 32)],
      ['name', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      ['symbol', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      ['uri', addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
      ['sellerFeeBasisPoints', getU16Encoder()],
      ['primarySaleHappened', getBooleanEncoder()],
      ['isMutable', getBooleanEncoder()],
      ['editionNonce', getOptionEncoder(getU8Encoder())],
      ['tokenStandard', getOptionEncoder(getTTokenStandardEncoder())],
      ['collection', getOptionEncoder(getTCollectionEncoder())],
      ['uses', getOptionEncoder(getTUsesEncoder())],
      ['tokenProgramVersion', getTTokenProgramVersionEncoder()],
      [
        'creatorShares',
        addEncoderSizePrefix(getBytesEncoder(), getU32Encoder()),
      ],
      ['creatorVerified', getArrayEncoder(getBooleanEncoder())],
      ['minAmount', getU64Encoder()],
      ['optionalRoyaltyPct', getOptionEncoder(getU16Encoder())],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([242, 194, 203, 225, 234, 53, 10, 96]),
      optionalRoyaltyPct: value.optionalRoyaltyPct ?? 100,
    })
  );
}

export function getTakeBidCompressedFullMetaInstructionDataDecoder(): Decoder<TakeBidCompressedFullMetaInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['nonce', getU64Decoder()],
    ['index', getU32Decoder()],
    ['root', fixDecoderSize(getBytesDecoder(), 32)],
    ['name', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ['symbol', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ['uri', addDecoderSizePrefix(getUtf8Decoder(), getU32Decoder())],
    ['sellerFeeBasisPoints', getU16Decoder()],
    ['primarySaleHappened', getBooleanDecoder()],
    ['isMutable', getBooleanDecoder()],
    ['editionNonce', getOptionDecoder(getU8Decoder())],
    ['tokenStandard', getOptionDecoder(getTTokenStandardDecoder())],
    ['collection', getOptionDecoder(getTCollectionDecoder())],
    ['uses', getOptionDecoder(getTUsesDecoder())],
    ['tokenProgramVersion', getTTokenProgramVersionDecoder()],
    ['creatorShares', addDecoderSizePrefix(getBytesDecoder(), getU32Decoder())],
    ['creatorVerified', getArrayDecoder(getBooleanDecoder())],
    ['minAmount', getU64Decoder()],
    ['optionalRoyaltyPct', getOptionDecoder(getU16Decoder())],
  ]);
}

export function getTakeBidCompressedFullMetaInstructionDataCodec(): Codec<
  TakeBidCompressedFullMetaInstructionDataArgs,
  TakeBidCompressedFullMetaInstructionData
> {
  return combineCodec(
    getTakeBidCompressedFullMetaInstructionDataEncoder(),
    getTakeBidCompressedFullMetaInstructionDataDecoder()
  );
}

export type TakeBidCompressedFullMetaInstructionExtraArgs = {
  /** creators, structured like [ [creator_pubkey_1,creator_shares_1], ..., [creator_pubkey_n, creator_shares_n] ] */
  creators?: Array<readonly [Address, number]>;
  /** proof path, can be shortened if canopyDepth of merkle tree is also specified */
  proof?: Array<Address>;
  /** canopy depth of merkle tree, reduces proofPath length if specified */
  canopyDepth?: number;
};

export type TakeBidCompressedFullMetaAsyncInput<
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
  TAccountMargin extends string = string,
  TAccountWhitelist extends string = string,
  TAccountCosigner extends string = string,
  TAccountRentDestination extends string = string,
> = {
  feeVault?: Address<TAccountFeeVault>;
  treeAuthority?: Address<TAccountTreeAuthority>;
  seller: Address<TAccountSeller>;
  delegate?: Address<TAccountDelegate>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper?: Address<TAccountLogWrapper>;
  compressionProgram?: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram?: Address<TAccountBubblegumProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  tensorswapProgram?: Address<TAccountTensorswapProgram>;
  bidState: Address<TAccountBidState>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  margin: Address<TAccountMargin>;
  whitelist: Address<TAccountWhitelist>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  rentDestination?: Address<TAccountRentDestination>;
  nonce?: TakeBidCompressedFullMetaInstructionDataArgs['nonce'];
  index: TakeBidCompressedFullMetaInstructionDataArgs['index'];
  root: TakeBidCompressedFullMetaInstructionDataArgs['root'];
  name: TakeBidCompressedFullMetaInstructionDataArgs['name'];
  symbol: TakeBidCompressedFullMetaInstructionDataArgs['symbol'];
  uri: TakeBidCompressedFullMetaInstructionDataArgs['uri'];
  sellerFeeBasisPoints: TakeBidCompressedFullMetaInstructionDataArgs['sellerFeeBasisPoints'];
  primarySaleHappened: TakeBidCompressedFullMetaInstructionDataArgs['primarySaleHappened'];
  isMutable: TakeBidCompressedFullMetaInstructionDataArgs['isMutable'];
  editionNonce: TakeBidCompressedFullMetaInstructionDataArgs['editionNonce'];
  tokenStandard: TakeBidCompressedFullMetaInstructionDataArgs['tokenStandard'];
  collection: TakeBidCompressedFullMetaInstructionDataArgs['collection'];
  uses: TakeBidCompressedFullMetaInstructionDataArgs['uses'];
  tokenProgramVersion: TakeBidCompressedFullMetaInstructionDataArgs['tokenProgramVersion'];
  creatorShares: TakeBidCompressedFullMetaInstructionDataArgs['creatorShares'];
  creatorVerified: TakeBidCompressedFullMetaInstructionDataArgs['creatorVerified'];
  minAmount: TakeBidCompressedFullMetaInstructionDataArgs['minAmount'];
  optionalRoyaltyPct?: TakeBidCompressedFullMetaInstructionDataArgs['optionalRoyaltyPct'];
  creators?: TakeBidCompressedFullMetaInstructionExtraArgs['creators'];
  proof?: TakeBidCompressedFullMetaInstructionExtraArgs['proof'];
  canopyDepth?: TakeBidCompressedFullMetaInstructionExtraArgs['canopyDepth'];
};

export async function getTakeBidCompressedFullMetaInstructionAsync<
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
  TAccountMargin extends string,
  TAccountWhitelist extends string,
  TAccountCosigner extends string,
  TAccountRentDestination extends string,
>(
  input: TakeBidCompressedFullMetaAsyncInput<
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
    TAccountMargin,
    TAccountWhitelist,
    TAccountCosigner,
    TAccountRentDestination
  >
): Promise<
  TakeBidCompressedFullMetaInstruction<
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
    TAccountMargin,
    TAccountWhitelist,
    TAccountCosigner,
    TAccountRentDestination
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
    margin: { value: input.margin ?? null, isWritable: true },
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
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
      ...(await resolveFeeVaultPdaFromBidState(resolverScope)),
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
  if (!accounts.delegate.value) {
    accounts.delegate.value = expectSome(accounts.seller.value);
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
  if (!accounts.tensorswapProgram.value) {
    accounts.tensorswapProgram.value =
      'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN' as Address<'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN'>;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }
  if (!args.nonce) {
    args.nonce = expectSome(args.index);
  }
  if (!args.creators) {
    args.creators = [];
  }
  if (!args.proof) {
    args.proof = [];
  }
  if (!args.canopyDepth) {
    args.canopyDepth = 0;
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = [
    ...resolveCreatorPath(resolverScope),
    ...resolveProofPath(resolverScope),
  ];

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
      getAccountMeta(accounts.margin),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.rentDestination),
      ...remainingAccounts,
    ],
    programAddress,
    data: getTakeBidCompressedFullMetaInstructionDataEncoder().encode(
      args as TakeBidCompressedFullMetaInstructionDataArgs
    ),
  } as TakeBidCompressedFullMetaInstruction<
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
    TAccountMargin,
    TAccountWhitelist,
    TAccountCosigner,
    TAccountRentDestination
  >;

  return instruction;
}

export type TakeBidCompressedFullMetaInput<
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
  TAccountMargin extends string = string,
  TAccountWhitelist extends string = string,
  TAccountCosigner extends string = string,
  TAccountRentDestination extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  treeAuthority: Address<TAccountTreeAuthority>;
  seller: Address<TAccountSeller>;
  delegate?: Address<TAccountDelegate>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper?: Address<TAccountLogWrapper>;
  compressionProgram?: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram?: Address<TAccountBubblegumProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  tensorswapProgram?: Address<TAccountTensorswapProgram>;
  bidState: Address<TAccountBidState>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  margin: Address<TAccountMargin>;
  whitelist: Address<TAccountWhitelist>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  rentDestination?: Address<TAccountRentDestination>;
  nonce?: TakeBidCompressedFullMetaInstructionDataArgs['nonce'];
  index: TakeBidCompressedFullMetaInstructionDataArgs['index'];
  root: TakeBidCompressedFullMetaInstructionDataArgs['root'];
  name: TakeBidCompressedFullMetaInstructionDataArgs['name'];
  symbol: TakeBidCompressedFullMetaInstructionDataArgs['symbol'];
  uri: TakeBidCompressedFullMetaInstructionDataArgs['uri'];
  sellerFeeBasisPoints: TakeBidCompressedFullMetaInstructionDataArgs['sellerFeeBasisPoints'];
  primarySaleHappened: TakeBidCompressedFullMetaInstructionDataArgs['primarySaleHappened'];
  isMutable: TakeBidCompressedFullMetaInstructionDataArgs['isMutable'];
  editionNonce: TakeBidCompressedFullMetaInstructionDataArgs['editionNonce'];
  tokenStandard: TakeBidCompressedFullMetaInstructionDataArgs['tokenStandard'];
  collection: TakeBidCompressedFullMetaInstructionDataArgs['collection'];
  uses: TakeBidCompressedFullMetaInstructionDataArgs['uses'];
  tokenProgramVersion: TakeBidCompressedFullMetaInstructionDataArgs['tokenProgramVersion'];
  creatorShares: TakeBidCompressedFullMetaInstructionDataArgs['creatorShares'];
  creatorVerified: TakeBidCompressedFullMetaInstructionDataArgs['creatorVerified'];
  minAmount: TakeBidCompressedFullMetaInstructionDataArgs['minAmount'];
  optionalRoyaltyPct?: TakeBidCompressedFullMetaInstructionDataArgs['optionalRoyaltyPct'];
  creators?: TakeBidCompressedFullMetaInstructionExtraArgs['creators'];
  proof?: TakeBidCompressedFullMetaInstructionExtraArgs['proof'];
  canopyDepth?: TakeBidCompressedFullMetaInstructionExtraArgs['canopyDepth'];
};

export function getTakeBidCompressedFullMetaInstruction<
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
  TAccountMargin extends string,
  TAccountWhitelist extends string,
  TAccountCosigner extends string,
  TAccountRentDestination extends string,
>(
  input: TakeBidCompressedFullMetaInput<
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
    TAccountMargin,
    TAccountWhitelist,
    TAccountCosigner,
    TAccountRentDestination
  >
): TakeBidCompressedFullMetaInstruction<
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
  TAccountMargin,
  TAccountWhitelist,
  TAccountCosigner,
  TAccountRentDestination
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
    margin: { value: input.margin ?? null, isWritable: true },
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
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
  if (!accounts.delegate.value) {
    accounts.delegate.value = expectSome(accounts.seller.value);
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
  if (!accounts.tensorswapProgram.value) {
    accounts.tensorswapProgram.value =
      'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN' as Address<'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN'>;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }
  if (!args.nonce) {
    args.nonce = expectSome(args.index);
  }
  if (!args.creators) {
    args.creators = [];
  }
  if (!args.proof) {
    args.proof = [];
  }
  if (!args.canopyDepth) {
    args.canopyDepth = 0;
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = [
    ...resolveCreatorPath(resolverScope),
    ...resolveProofPath(resolverScope),
  ];

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
      getAccountMeta(accounts.margin),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.rentDestination),
      ...remainingAccounts,
    ],
    programAddress,
    data: getTakeBidCompressedFullMetaInstructionDataEncoder().encode(
      args as TakeBidCompressedFullMetaInstructionDataArgs
    ),
  } as TakeBidCompressedFullMetaInstruction<
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
    TAccountMargin,
    TAccountWhitelist,
    TAccountCosigner,
    TAccountRentDestination
  >;

  return instruction;
}

export type ParsedTakeBidCompressedFullMetaInstruction<
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
    margin: TAccountMetas[15];
    whitelist: TAccountMetas[16];
    cosigner?: TAccountMetas[17] | undefined;
    rentDestination: TAccountMetas[18];
  };
  data: TakeBidCompressedFullMetaInstructionData;
};

export function parseTakeBidCompressedFullMetaInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedTakeBidCompressedFullMetaInstruction<TProgram, TAccountMetas> {
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
      margin: getNextAccount(),
      whitelist: getNextAccount(),
      cosigner: getNextOptionalAccount(),
      rentDestination: getNextAccount(),
    },
    data: getTakeBidCompressedFullMetaInstructionDataDecoder().decode(
      instruction.data
    ),
  };
}
