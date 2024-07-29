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

export type TakeBidCompressedMetaHashInstruction<
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
  TAccountMarginAccount extends string | IAccountMeta<string> = string,
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
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      ...TRemainingAccounts,
    ]
  >;

export type TakeBidCompressedMetaHashInstructionData = {
  discriminator: ReadonlyUint8Array;
  nonce: bigint;
  index: number;
  root: ReadonlyUint8Array;
  metaHash: ReadonlyUint8Array;
  creatorShares: ReadonlyUint8Array;
  creatorVerified: Array<boolean>;
  sellerFeeBasisPoints: number;
  minAmount: bigint;
  optionalRoyaltyPct: Option<number>;
};

export type TakeBidCompressedMetaHashInstructionDataArgs = {
  nonce: number | bigint;
  index: number;
  root: ReadonlyUint8Array;
  metaHash: ReadonlyUint8Array;
  creatorShares: ReadonlyUint8Array;
  creatorVerified: Array<boolean>;
  sellerFeeBasisPoints: number;
  minAmount: number | bigint;
  optionalRoyaltyPct?: OptionOrNullable<number>;
};

export function getTakeBidCompressedMetaHashInstructionDataEncoder(): Encoder<TakeBidCompressedMetaHashInstructionDataArgs> {
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
      ['minAmount', getU64Encoder()],
      ['optionalRoyaltyPct', getOptionEncoder(getU16Encoder())],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([85, 227, 202, 70, 45, 215, 10, 193]),
      optionalRoyaltyPct: value.optionalRoyaltyPct ?? 100,
    })
  );
}

export function getTakeBidCompressedMetaHashInstructionDataDecoder(): Decoder<TakeBidCompressedMetaHashInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['nonce', getU64Decoder()],
    ['index', getU32Decoder()],
    ['root', fixDecoderSize(getBytesDecoder(), 32)],
    ['metaHash', fixDecoderSize(getBytesDecoder(), 32)],
    ['creatorShares', addDecoderSizePrefix(getBytesDecoder(), getU32Decoder())],
    ['creatorVerified', getArrayDecoder(getBooleanDecoder())],
    ['sellerFeeBasisPoints', getU16Decoder()],
    ['minAmount', getU64Decoder()],
    ['optionalRoyaltyPct', getOptionDecoder(getU16Decoder())],
  ]);
}

export function getTakeBidCompressedMetaHashInstructionDataCodec(): Codec<
  TakeBidCompressedMetaHashInstructionDataArgs,
  TakeBidCompressedMetaHashInstructionData
> {
  return combineCodec(
    getTakeBidCompressedMetaHashInstructionDataEncoder(),
    getTakeBidCompressedMetaHashInstructionDataDecoder()
  );
}

export type TakeBidCompressedMetaHashInstructionExtraArgs = {
  /** creators, structured like [ [creator_pubkey_1,creator_shares_1], ..., [creator_pubkey_n, creator_shares_n] ] */
  creators?: Array<readonly [Address, number]>;
  /** proof path, can be shortened if canopyDepth of merkle tree is also specified */
  proof?: Array<Address>;
  /** canopy depth of merkle tree, reduces proofPath length if specified */
  canopyDepth?: number;
};

export type TakeBidCompressedMetaHashAsyncInput<
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
  TAccountRentDestination extends string = string,
> = {
  feeVault?: Address<TAccountFeeVault>;
  treeAuthority?: Address<TAccountTreeAuthority>;
  seller: Address<TAccountSeller> | TransactionSigner<TAccountSeller>;
  delegate?: Address<TAccountDelegate> | TransactionSigner<TAccountDelegate>;
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
  marginAccount?: Address<TAccountMarginAccount>;
  whitelist: Address<TAccountWhitelist>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  rentDestination?: Address<TAccountRentDestination>;
  nonce?: TakeBidCompressedMetaHashInstructionDataArgs['nonce'];
  index: TakeBidCompressedMetaHashInstructionDataArgs['index'];
  root: TakeBidCompressedMetaHashInstructionDataArgs['root'];
  metaHash: TakeBidCompressedMetaHashInstructionDataArgs['metaHash'];
  creatorShares: TakeBidCompressedMetaHashInstructionDataArgs['creatorShares'];
  creatorVerified: TakeBidCompressedMetaHashInstructionDataArgs['creatorVerified'];
  sellerFeeBasisPoints: TakeBidCompressedMetaHashInstructionDataArgs['sellerFeeBasisPoints'];
  minAmount: TakeBidCompressedMetaHashInstructionDataArgs['minAmount'];
  optionalRoyaltyPct?: TakeBidCompressedMetaHashInstructionDataArgs['optionalRoyaltyPct'];
  creators?: TakeBidCompressedMetaHashInstructionExtraArgs['creators'];
  proof?: TakeBidCompressedMetaHashInstructionExtraArgs['proof'];
  canopyDepth?: TakeBidCompressedMetaHashInstructionExtraArgs['canopyDepth'];
};

export async function getTakeBidCompressedMetaHashInstructionAsync<
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
  TAccountRentDestination extends string,
>(
  input: TakeBidCompressedMetaHashAsyncInput<
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
    TAccountRentDestination
  >
): Promise<
  TakeBidCompressedMetaHashInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountTreeAuthority,
    (typeof input)['seller'] extends TransactionSigner<TAccountSeller>
      ? WritableSignerAccount<TAccountSeller> &
          IAccountSignerMeta<TAccountSeller>
      : TAccountSeller,
    (typeof input)['delegate'] extends TransactionSigner<TAccountDelegate>
      ? ReadonlySignerAccount<TAccountDelegate> &
          IAccountSignerMeta<TAccountDelegate>
      : TAccountDelegate,
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
    marginAccount: { value: input.marginAccount ?? null, isWritable: true },
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
  if (!accounts.marginAccount.value) {
    accounts.marginAccount.value = expectSome(accounts.tensorswapProgram.value);
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
      getAccountMeta(accounts.marginAccount),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.rentDestination),
      ...remainingAccounts,
    ],
    programAddress,
    data: getTakeBidCompressedMetaHashInstructionDataEncoder().encode(
      args as TakeBidCompressedMetaHashInstructionDataArgs
    ),
  } as TakeBidCompressedMetaHashInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountTreeAuthority,
    (typeof input)['seller'] extends TransactionSigner<TAccountSeller>
      ? WritableSignerAccount<TAccountSeller> &
          IAccountSignerMeta<TAccountSeller>
      : TAccountSeller,
    (typeof input)['delegate'] extends TransactionSigner<TAccountDelegate>
      ? ReadonlySignerAccount<TAccountDelegate> &
          IAccountSignerMeta<TAccountDelegate>
      : TAccountDelegate,
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
    TAccountRentDestination
  >;

  return instruction;
}

export type TakeBidCompressedMetaHashInput<
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
  TAccountRentDestination extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  treeAuthority: Address<TAccountTreeAuthority>;
  seller: Address<TAccountSeller> | TransactionSigner<TAccountSeller>;
  delegate?: Address<TAccountDelegate> | TransactionSigner<TAccountDelegate>;
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
  marginAccount?: Address<TAccountMarginAccount>;
  whitelist: Address<TAccountWhitelist>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  rentDestination?: Address<TAccountRentDestination>;
  nonce?: TakeBidCompressedMetaHashInstructionDataArgs['nonce'];
  index: TakeBidCompressedMetaHashInstructionDataArgs['index'];
  root: TakeBidCompressedMetaHashInstructionDataArgs['root'];
  metaHash: TakeBidCompressedMetaHashInstructionDataArgs['metaHash'];
  creatorShares: TakeBidCompressedMetaHashInstructionDataArgs['creatorShares'];
  creatorVerified: TakeBidCompressedMetaHashInstructionDataArgs['creatorVerified'];
  sellerFeeBasisPoints: TakeBidCompressedMetaHashInstructionDataArgs['sellerFeeBasisPoints'];
  minAmount: TakeBidCompressedMetaHashInstructionDataArgs['minAmount'];
  optionalRoyaltyPct?: TakeBidCompressedMetaHashInstructionDataArgs['optionalRoyaltyPct'];
  creators?: TakeBidCompressedMetaHashInstructionExtraArgs['creators'];
  proof?: TakeBidCompressedMetaHashInstructionExtraArgs['proof'];
  canopyDepth?: TakeBidCompressedMetaHashInstructionExtraArgs['canopyDepth'];
};

export function getTakeBidCompressedMetaHashInstruction<
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
  TAccountRentDestination extends string,
>(
  input: TakeBidCompressedMetaHashInput<
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
    TAccountRentDestination
  >
): TakeBidCompressedMetaHashInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault,
  TAccountTreeAuthority,
  (typeof input)['seller'] extends TransactionSigner<TAccountSeller>
    ? WritableSignerAccount<TAccountSeller> & IAccountSignerMeta<TAccountSeller>
    : TAccountSeller,
  (typeof input)['delegate'] extends TransactionSigner<TAccountDelegate>
    ? ReadonlySignerAccount<TAccountDelegate> &
        IAccountSignerMeta<TAccountDelegate>
    : TAccountDelegate,
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
    marginAccount: { value: input.marginAccount ?? null, isWritable: true },
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
  if (!accounts.marginAccount.value) {
    accounts.marginAccount.value = expectSome(accounts.tensorswapProgram.value);
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
      getAccountMeta(accounts.marginAccount),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.rentDestination),
      ...remainingAccounts,
    ],
    programAddress,
    data: getTakeBidCompressedMetaHashInstructionDataEncoder().encode(
      args as TakeBidCompressedMetaHashInstructionDataArgs
    ),
  } as TakeBidCompressedMetaHashInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountTreeAuthority,
    (typeof input)['seller'] extends TransactionSigner<TAccountSeller>
      ? WritableSignerAccount<TAccountSeller> &
          IAccountSignerMeta<TAccountSeller>
      : TAccountSeller,
    (typeof input)['delegate'] extends TransactionSigner<TAccountDelegate>
      ? ReadonlySignerAccount<TAccountDelegate> &
          IAccountSignerMeta<TAccountDelegate>
      : TAccountDelegate,
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
    TAccountRentDestination
  >;

  return instruction;
}

export type ParsedTakeBidCompressedMetaHashInstruction<
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
    rentDestination: TAccountMetas[18];
  };
  data: TakeBidCompressedMetaHashInstructionData;
};

export function parseTakeBidCompressedMetaHashInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedTakeBidCompressedMetaHashInstruction<TProgram, TAccountMetas> {
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
      rentDestination: getNextAccount(),
    },
    data: getTakeBidCompressedMetaHashInstructionDataDecoder().decode(
      instruction.data
    ),
  };
}
