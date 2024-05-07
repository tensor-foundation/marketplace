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
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import { findFeeVaultPda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';

export type TakeBidMetaHashInstruction<
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
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
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
      TAccountTcompProgram extends string
        ? ReadonlyAccount<TAccountTcompProgram>
        : TAccountTcompProgram,
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

export type TakeBidMetaHashInstructionData = {
  discriminator: Array<number>;
  nonce: bigint;
  index: number;
  root: Uint8Array;
  metaHash: Uint8Array;
  creatorShares: Uint8Array;
  creatorVerified: Array<boolean>;
  sellerFeeBasisPoints: number;
  minAmount: bigint;
  optionalRoyaltyPct: Option<number>;
};

export type TakeBidMetaHashInstructionDataArgs = {
  nonce: number | bigint;
  index: number;
  root: Uint8Array;
  metaHash: Uint8Array;
  creatorShares: Uint8Array;
  creatorVerified: Array<boolean>;
  sellerFeeBasisPoints: number;
  minAmount: number | bigint;
  optionalRoyaltyPct?: OptionOrNullable<number>;
};

export function getTakeBidMetaHashInstructionDataEncoder(): Encoder<TakeBidMetaHashInstructionDataArgs> {
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
      ['minAmount', getU64Encoder()],
      ['optionalRoyaltyPct', getOptionEncoder(getU16Encoder())],
    ]),
    (value) => ({
      ...value,
      discriminator: [85, 227, 202, 70, 45, 215, 10, 193],
      optionalRoyaltyPct: value.optionalRoyaltyPct ?? none(),
    })
  );
}

export function getTakeBidMetaHashInstructionDataDecoder(): Decoder<TakeBidMetaHashInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['nonce', getU64Decoder()],
    ['index', getU32Decoder()],
    ['root', getBytesDecoder({ size: 32 })],
    ['metaHash', getBytesDecoder({ size: 32 })],
    ['creatorShares', getBytesDecoder({ size: getU32Decoder() })],
    ['creatorVerified', getArrayDecoder(getBooleanDecoder())],
    ['sellerFeeBasisPoints', getU16Decoder()],
    ['minAmount', getU64Decoder()],
    ['optionalRoyaltyPct', getOptionDecoder(getU16Decoder())],
  ]);
}

export function getTakeBidMetaHashInstructionDataCodec(): Codec<
  TakeBidMetaHashInstructionDataArgs,
  TakeBidMetaHashInstructionData
> {
  return combineCodec(
    getTakeBidMetaHashInstructionDataEncoder(),
    getTakeBidMetaHashInstructionDataDecoder()
  );
}

export type TakeBidMetaHashAsyncInput<
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
  nonce: TakeBidMetaHashInstructionDataArgs['nonce'];
  index: TakeBidMetaHashInstructionDataArgs['index'];
  root: TakeBidMetaHashInstructionDataArgs['root'];
  metaHash: TakeBidMetaHashInstructionDataArgs['metaHash'];
  creatorShares: TakeBidMetaHashInstructionDataArgs['creatorShares'];
  creatorVerified: TakeBidMetaHashInstructionDataArgs['creatorVerified'];
  sellerFeeBasisPoints: TakeBidMetaHashInstructionDataArgs['sellerFeeBasisPoints'];
  minAmount: TakeBidMetaHashInstructionDataArgs['minAmount'];
  optionalRoyaltyPct?: TakeBidMetaHashInstructionDataArgs['optionalRoyaltyPct'];
};

export async function getTakeBidMetaHashInstructionAsync<
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
  input: TakeBidMetaHashAsyncInput<
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
  TakeBidMetaHashInstruction<
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
    data: getTakeBidMetaHashInstructionDataEncoder().encode(
      args as TakeBidMetaHashInstructionDataArgs
    ),
  } as TakeBidMetaHashInstruction<
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

export type TakeBidMetaHashInput<
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
  nonce: TakeBidMetaHashInstructionDataArgs['nonce'];
  index: TakeBidMetaHashInstructionDataArgs['index'];
  root: TakeBidMetaHashInstructionDataArgs['root'];
  metaHash: TakeBidMetaHashInstructionDataArgs['metaHash'];
  creatorShares: TakeBidMetaHashInstructionDataArgs['creatorShares'];
  creatorVerified: TakeBidMetaHashInstructionDataArgs['creatorVerified'];
  sellerFeeBasisPoints: TakeBidMetaHashInstructionDataArgs['sellerFeeBasisPoints'];
  minAmount: TakeBidMetaHashInstructionDataArgs['minAmount'];
  optionalRoyaltyPct?: TakeBidMetaHashInstructionDataArgs['optionalRoyaltyPct'];
};

export function getTakeBidMetaHashInstruction<
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
  input: TakeBidMetaHashInput<
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
): TakeBidMetaHashInstruction<
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
    data: getTakeBidMetaHashInstructionDataEncoder().encode(
      args as TakeBidMetaHashInstructionDataArgs
    ),
  } as TakeBidMetaHashInstruction<
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

export type ParsedTakeBidMetaHashInstruction<
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
    tcompProgram: TAccountMetas[9];
    tensorswapProgram: TAccountMetas[10];
    bidState: TAccountMetas[11];
    owner: TAccountMetas[12];
    takerBroker?: TAccountMetas[13] | undefined;
    makerBroker?: TAccountMetas[14] | undefined;
    marginAccount: TAccountMetas[15];
    whitelist: TAccountMetas[16];
    cosigner: TAccountMetas[17];
    rentDest: TAccountMetas[18];
  };
  data: TakeBidMetaHashInstructionData;
};

export function parseTakeBidMetaHashInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedTakeBidMetaHashInstruction<TProgram, TAccountMetas> {
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
      tcompProgram: getNextAccount(),
      tensorswapProgram: getNextAccount(),
      bidState: getNextAccount(),
      owner: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      marginAccount: getNextAccount(),
      whitelist: getNextAccount(),
      cosigner: getNextAccount(),
      rentDest: getNextAccount(),
    },
    data: getTakeBidMetaHashInstructionDataDecoder().decode(instruction.data),
  };
}
