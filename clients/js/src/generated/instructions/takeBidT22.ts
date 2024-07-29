/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
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
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { getAccountMetaFactory, type ResolvedAccount } from '../shared';

export type TakeBidT22Instruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountSeller extends string | IAccountMeta<string> = string,
  TAccountBidState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountMarginAccount extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountSellerTa extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountOwnerTa extends string | IAccountMeta<string> = string,
  TAccountTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TAccountAssociatedTokenProgram extends
    | string
    | IAccountMeta<string> = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountEscrowProgram extends
    | string
    | IAccountMeta<string> = 'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN',
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountMintProof extends string | IAccountMeta<string> = string,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountFeeVault extends string
        ? WritableAccount<TAccountFeeVault>
        : TAccountFeeVault,
      TAccountSeller extends string
        ? WritableSignerAccount<TAccountSeller> &
            IAccountSignerMeta<TAccountSeller>
        : TAccountSeller,
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
      TAccountSellerTa extends string
        ? WritableAccount<TAccountSellerTa>
        : TAccountSellerTa,
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
      TAccountOwnerTa extends string
        ? WritableAccount<TAccountOwnerTa>
        : TAccountOwnerTa,
      TAccountTokenProgram extends string
        ? ReadonlyAccount<TAccountTokenProgram>
        : TAccountTokenProgram,
      TAccountAssociatedTokenProgram extends string
        ? ReadonlyAccount<TAccountAssociatedTokenProgram>
        : TAccountAssociatedTokenProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountEscrowProgram extends string
        ? ReadonlyAccount<TAccountEscrowProgram>
        : TAccountEscrowProgram,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      TAccountMintProof extends string
        ? ReadonlyAccount<TAccountMintProof>
        : TAccountMintProof,
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      ...TRemainingAccounts,
    ]
  >;

export type TakeBidT22InstructionData = {
  discriminator: ReadonlyUint8Array;
  minAmount: bigint;
};

export type TakeBidT22InstructionDataArgs = { minAmount: number | bigint };

export function getTakeBidT22InstructionDataEncoder(): Encoder<TakeBidT22InstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['minAmount', getU64Encoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([18, 250, 113, 242, 31, 244, 19, 150]),
    })
  );
}

export function getTakeBidT22InstructionDataDecoder(): Decoder<TakeBidT22InstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['minAmount', getU64Decoder()],
  ]);
}

export function getTakeBidT22InstructionDataCodec(): Codec<
  TakeBidT22InstructionDataArgs,
  TakeBidT22InstructionData
> {
  return combineCodec(
    getTakeBidT22InstructionDataEncoder(),
    getTakeBidT22InstructionDataDecoder()
  );
}

export type TakeBidT22Input<
  TAccountFeeVault extends string = string,
  TAccountSeller extends string = string,
  TAccountBidState extends string = string,
  TAccountOwner extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountMarginAccount extends string = string,
  TAccountWhitelist extends string = string,
  TAccountSellerTa extends string = string,
  TAccountMint extends string = string,
  TAccountOwnerTa extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountEscrowProgram extends string = string,
  TAccountCosigner extends string = string,
  TAccountMintProof extends string = string,
  TAccountRentDestination extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  seller: TransactionSigner<TAccountSeller>;
  bidState: Address<TAccountBidState>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  marginAccount: Address<TAccountMarginAccount>;
  whitelist: Address<TAccountWhitelist>;
  sellerTa: Address<TAccountSellerTa>;
  mint: Address<TAccountMint>;
  ownerTa: Address<TAccountOwnerTa>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  escrowProgram?: Address<TAccountEscrowProgram>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
  mintProof: Address<TAccountMintProof>;
  rentDestination: Address<TAccountRentDestination>;
  minAmount: TakeBidT22InstructionDataArgs['minAmount'];
};

export function getTakeBidT22Instruction<
  TAccountFeeVault extends string,
  TAccountSeller extends string,
  TAccountBidState extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountMarginAccount extends string,
  TAccountWhitelist extends string,
  TAccountSellerTa extends string,
  TAccountMint extends string,
  TAccountOwnerTa extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountEscrowProgram extends string,
  TAccountCosigner extends string,
  TAccountMintProof extends string,
  TAccountRentDestination extends string,
>(
  input: TakeBidT22Input<
    TAccountFeeVault,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountSellerTa,
    TAccountMint,
    TAccountOwnerTa,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountEscrowProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDestination
  >
): TakeBidT22Instruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault,
  TAccountSeller,
  TAccountBidState,
  TAccountOwner,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountMarginAccount,
  TAccountWhitelist,
  TAccountSellerTa,
  TAccountMint,
  TAccountOwnerTa,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountSystemProgram,
  TAccountMarketplaceProgram,
  TAccountEscrowProgram,
  TAccountCosigner,
  TAccountMintProof,
  TAccountRentDestination
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    seller: { value: input.seller ?? null, isWritable: true },
    bidState: { value: input.bidState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    marginAccount: { value: input.marginAccount ?? null, isWritable: true },
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    sellerTa: { value: input.sellerTa ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    ownerTa: { value: input.ownerTa ?? null, isWritable: true },
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    associatedTokenProgram: {
      value: input.associatedTokenProgram ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    escrowProgram: { value: input.escrowProgram ?? null, isWritable: false },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
    mintProof: { value: input.mintProof ?? null, isWritable: false },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
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
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.escrowProgram.value) {
    accounts.escrowProgram.value =
      'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN' as Address<'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.seller),
      getAccountMeta(accounts.bidState),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.marginAccount),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.sellerTa),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.ownerTa),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.escrowProgram),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.mintProof),
      getAccountMeta(accounts.rentDestination),
    ],
    programAddress,
    data: getTakeBidT22InstructionDataEncoder().encode(
      args as TakeBidT22InstructionDataArgs
    ),
  } as TakeBidT22Instruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountSellerTa,
    TAccountMint,
    TAccountOwnerTa,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountEscrowProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDestination
  >;

  return instruction;
}

export type ParsedTakeBidT22Instruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
    seller: TAccountMetas[1];
    bidState: TAccountMetas[2];
    owner: TAccountMetas[3];
    takerBroker?: TAccountMetas[4] | undefined;
    makerBroker?: TAccountMetas[5] | undefined;
    marginAccount: TAccountMetas[6];
    whitelist: TAccountMetas[7];
    sellerTa: TAccountMetas[8];
    mint: TAccountMetas[9];
    ownerTa: TAccountMetas[10];
    tokenProgram: TAccountMetas[11];
    associatedTokenProgram: TAccountMetas[12];
    systemProgram: TAccountMetas[13];
    marketplaceProgram: TAccountMetas[14];
    escrowProgram: TAccountMetas[15];
    cosigner?: TAccountMetas[16] | undefined;
    /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
    mintProof: TAccountMetas[17];
    rentDestination: TAccountMetas[18];
  };
  data: TakeBidT22InstructionData;
};

export function parseTakeBidT22Instruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedTakeBidT22Instruction<TProgram, TAccountMetas> {
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
      seller: getNextAccount(),
      bidState: getNextAccount(),
      owner: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      marginAccount: getNextAccount(),
      whitelist: getNextAccount(),
      sellerTa: getNextAccount(),
      mint: getNextAccount(),
      ownerTa: getNextAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      escrowProgram: getNextAccount(),
      cosigner: getNextOptionalAccount(),
      mintProof: getNextAccount(),
      rentDestination: getNextAccount(),
    },
    data: getTakeBidT22InstructionDataDecoder().decode(instruction.data),
  };
}
