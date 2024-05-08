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
import { findFeeVaultPda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';

export type BuyInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountTreeAuthority extends string | IAccountMeta<string> = string,
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
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountRentDest extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
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
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
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
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      ...TRemainingAccounts,
    ]
  >;

export type BuyInstructionData = {
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

export type BuyInstructionDataArgs = {
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

export function getBuyInstructionDataEncoder(): Encoder<BuyInstructionDataArgs> {
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
      discriminator: [102, 6, 61, 18, 1, 218, 235, 234],
      optionalRoyaltyPct: value.optionalRoyaltyPct ?? none(),
    })
  );
}

export function getBuyInstructionDataDecoder(): Decoder<BuyInstructionData> {
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

export function getBuyInstructionDataCodec(): Codec<
  BuyInstructionDataArgs,
  BuyInstructionData
> {
  return combineCodec(
    getBuyInstructionDataEncoder(),
    getBuyInstructionDataDecoder()
  );
}

export type BuyAsyncInput<
  TAccountFeeVault extends string = string,
  TAccountTreeAuthority extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountListState extends string = string,
  TAccountBuyer extends string = string,
  TAccountPayer extends string = string,
  TAccountOwner extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountRentDest extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault?: Address<TAccountFeeVault>;
  treeAuthority: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper: Address<TAccountLogWrapper>;
  compressionProgram: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram: Address<TAccountBubblegumProgram>;
  tcompProgram: Address<TAccountTcompProgram>;
  listState: Address<TAccountListState>;
  buyer: Address<TAccountBuyer>;
  payer: TransactionSigner<TAccountPayer>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDest: Address<TAccountRentDest>;
  nonce: BuyInstructionDataArgs['nonce'];
  index: BuyInstructionDataArgs['index'];
  root: BuyInstructionDataArgs['root'];
  metaHash: BuyInstructionDataArgs['metaHash'];
  creatorShares: BuyInstructionDataArgs['creatorShares'];
  creatorVerified: BuyInstructionDataArgs['creatorVerified'];
  sellerFeeBasisPoints: BuyInstructionDataArgs['sellerFeeBasisPoints'];
  maxAmount: BuyInstructionDataArgs['maxAmount'];
  optionalRoyaltyPct?: BuyInstructionDataArgs['optionalRoyaltyPct'];
};

export async function getBuyInstructionAsync<
  TAccountFeeVault extends string,
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountTcompProgram extends string,
  TAccountListState extends string,
  TAccountBuyer extends string,
  TAccountPayer extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDest extends string,
>(
  input: BuyAsyncInput<
    TAccountFeeVault,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountTcompProgram,
    TAccountListState,
    TAccountBuyer,
    TAccountPayer,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDest
  >
): Promise<
  BuyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountTcompProgram,
    TAccountListState,
    TAccountBuyer,
    TAccountPayer,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDest
  >
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
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
    tcompProgram: { value: input.tcompProgram ?? null, isWritable: false },
    listState: { value: input.listState ?? null, isWritable: true },
    buyer: { value: input.buyer ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
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
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.tcompProgram),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.rentDest),
    ],
    programAddress,
    data: getBuyInstructionDataEncoder().encode(args as BuyInstructionDataArgs),
  } as BuyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountTcompProgram,
    TAccountListState,
    TAccountBuyer,
    TAccountPayer,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDest
  >;

  return instruction;
}

export type BuyInput<
  TAccountFeeVault extends string = string,
  TAccountTreeAuthority extends string = string,
  TAccountMerkleTree extends string = string,
  TAccountLogWrapper extends string = string,
  TAccountCompressionProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountBubblegumProgram extends string = string,
  TAccountTcompProgram extends string = string,
  TAccountListState extends string = string,
  TAccountBuyer extends string = string,
  TAccountPayer extends string = string,
  TAccountOwner extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountRentDest extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  treeAuthority: Address<TAccountTreeAuthority>;
  merkleTree: Address<TAccountMerkleTree>;
  logWrapper: Address<TAccountLogWrapper>;
  compressionProgram: Address<TAccountCompressionProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  bubblegumProgram: Address<TAccountBubblegumProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  listState: Address<TAccountListState>;
  buyer: Address<TAccountBuyer>;
  payer: TransactionSigner<TAccountPayer>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDest: Address<TAccountRentDest>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  nonce: BuyInstructionDataArgs['nonce'];
  index: BuyInstructionDataArgs['index'];
  root: BuyInstructionDataArgs['root'];
  metaHash: BuyInstructionDataArgs['metaHash'];
  creatorShares: BuyInstructionDataArgs['creatorShares'];
  creatorVerified: BuyInstructionDataArgs['creatorVerified'];
  sellerFeeBasisPoints: BuyInstructionDataArgs['sellerFeeBasisPoints'];
  maxAmount: BuyInstructionDataArgs['maxAmount'];
  optionalRoyaltyPct?: BuyInstructionDataArgs['optionalRoyaltyPct'];
};

export function getBuyInstruction<
  TAccountFeeVault extends string,
  TAccountTreeAuthority extends string,
  TAccountMerkleTree extends string,
  TAccountLogWrapper extends string,
  TAccountCompressionProgram extends string,
  TAccountSystemProgram extends string,
  TAccountBubblegumProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountListState extends string,
  TAccountBuyer extends string,
  TAccountPayer extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDest extends string,
  TAccountCosigner extends string,
>(
  input: BuyInput<
    TAccountFeeVault,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountListState,
    TAccountBuyer,
    TAccountPayer,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDest,
    TAccountCosigner
  >
): BuyInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault,
  TAccountTreeAuthority,
  TAccountMerkleTree,
  TAccountLogWrapper,
  TAccountCompressionProgram,
  TAccountSystemProgram,
  TAccountBubblegumProgram,
  TAccountMarketplaceProgram,
  TAccountListState,
  TAccountBuyer,
  TAccountPayer,
  TAccountOwner,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountRentDest,
  TAccountCosigner
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
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
    listState: { value: input.listState ?? null, isWritable: true },
    buyer: { value: input.buyer ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    rentDest: { value: input.rentDest ?? null, isWritable: true },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
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
      getAccountMeta(accounts.merkleTree),
      getAccountMeta(accounts.logWrapper),
      getAccountMeta(accounts.compressionProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.bubblegumProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.rentDest),
      getAccountMeta(accounts.cosigner),
    ],
    programAddress,
    data: getBuyInstructionDataEncoder().encode(args as BuyInstructionDataArgs),
  } as BuyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountTreeAuthority,
    TAccountMerkleTree,
    TAccountLogWrapper,
    TAccountCompressionProgram,
    TAccountSystemProgram,
    TAccountBubblegumProgram,
    TAccountMarketplaceProgram,
    TAccountListState,
    TAccountBuyer,
    TAccountPayer,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDest,
    TAccountCosigner
  >;

  return instruction;
}

export type ParsedBuyInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
    treeAuthority: TAccountMetas[1];
    merkleTree: TAccountMetas[2];
    logWrapper: TAccountMetas[3];
    compressionProgram: TAccountMetas[4];
    systemProgram: TAccountMetas[5];
    bubblegumProgram: TAccountMetas[6];
    marketplaceProgram: TAccountMetas[7];
    listState: TAccountMetas[8];
    buyer: TAccountMetas[9];
    payer: TAccountMetas[10];
    owner: TAccountMetas[11];
    takerBroker?: TAccountMetas[12] | undefined;
    makerBroker?: TAccountMetas[13] | undefined;
    rentDest: TAccountMetas[14];
    cosigner?: TAccountMetas[15] | undefined;
  };
  data: BuyInstructionData;
};

export function parseBuyInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedBuyInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 16) {
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
      merkleTree: getNextAccount(),
      logWrapper: getNextAccount(),
      compressionProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      bubblegumProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      listState: getNextAccount(),
      buyer: getNextAccount(),
      payer: getNextAccount(),
      owner: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      rentDest: getNextAccount(),
      cosigner: getNextOptionalAccount(),
    },
    data: getBuyInstructionDataDecoder().decode(instruction.data),
  };
}
