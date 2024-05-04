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
  combineCodec,
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  getU8Decoder,
  getU8Encoder,
  mapEncoder,
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
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';

export type TakeBidT22Instruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountTcomp extends string | IAccountMeta<string> = string,
  TAccountSeller extends string | IAccountMeta<string> = string,
  TAccountBidState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountMarginAccount extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountNftSellerAcc extends string | IAccountMeta<string> = string,
  TAccountNftMint extends string | IAccountMeta<string> = string,
  TAccountOwnerAtaAcc extends string | IAccountMeta<string> = string,
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
  TAccountTensorswapProgram extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountMintProof extends string | IAccountMeta<string> = string,
  TAccountRentDest extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTcomp extends string
        ? WritableAccount<TAccountTcomp>
        : TAccountTcomp,
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
      TAccountNftSellerAcc extends string
        ? WritableAccount<TAccountNftSellerAcc>
        : TAccountNftSellerAcc,
      TAccountNftMint extends string
        ? ReadonlyAccount<TAccountNftMint>
        : TAccountNftMint,
      TAccountOwnerAtaAcc extends string
        ? WritableAccount<TAccountOwnerAtaAcc>
        : TAccountOwnerAtaAcc,
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
      TAccountTensorswapProgram extends string
        ? ReadonlyAccount<TAccountTensorswapProgram>
        : TAccountTensorswapProgram,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      TAccountMintProof extends string
        ? ReadonlyAccount<TAccountMintProof>
        : TAccountMintProof,
      TAccountRentDest extends string
        ? WritableAccount<TAccountRentDest>
        : TAccountRentDest,
      ...TRemainingAccounts,
    ]
  >;

export type TakeBidT22InstructionData = {
  discriminator: Array<number>;
  minAmount: bigint;
};

export type TakeBidT22InstructionDataArgs = { minAmount: number | bigint };

export function getTakeBidT22InstructionDataEncoder(): Encoder<TakeBidT22InstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['minAmount', getU64Encoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: [18, 250, 113, 242, 31, 244, 19, 150],
    })
  );
}

export function getTakeBidT22InstructionDataDecoder(): Decoder<TakeBidT22InstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
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
  TAccountTcomp extends string = string,
  TAccountSeller extends string = string,
  TAccountBidState extends string = string,
  TAccountOwner extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountMarginAccount extends string = string,
  TAccountWhitelist extends string = string,
  TAccountNftSellerAcc extends string = string,
  TAccountNftMint extends string = string,
  TAccountOwnerAtaAcc extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountTensorswapProgram extends string = string,
  TAccountCosigner extends string = string,
  TAccountMintProof extends string = string,
  TAccountRentDest extends string = string,
> = {
  tcomp: Address<TAccountTcomp>;
  seller: TransactionSigner<TAccountSeller>;
  bidState: Address<TAccountBidState>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  marginAccount: Address<TAccountMarginAccount>;
  whitelist: Address<TAccountWhitelist>;
  nftSellerAcc: Address<TAccountNftSellerAcc>;
  nftMint: Address<TAccountNftMint>;
  ownerAtaAcc: Address<TAccountOwnerAtaAcc>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  tensorswapProgram: Address<TAccountTensorswapProgram>;
  cosigner: TransactionSigner<TAccountCosigner>;
  /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
  mintProof: Address<TAccountMintProof>;
  rentDest: Address<TAccountRentDest>;
  minAmount: TakeBidT22InstructionDataArgs['minAmount'];
};

export function getTakeBidT22Instruction<
  TAccountTcomp extends string,
  TAccountSeller extends string,
  TAccountBidState extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountMarginAccount extends string,
  TAccountWhitelist extends string,
  TAccountNftSellerAcc extends string,
  TAccountNftMint extends string,
  TAccountOwnerAtaAcc extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountTensorswapProgram extends string,
  TAccountCosigner extends string,
  TAccountMintProof extends string,
  TAccountRentDest extends string,
>(
  input: TakeBidT22Input<
    TAccountTcomp,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountNftSellerAcc,
    TAccountNftMint,
    TAccountOwnerAtaAcc,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountTensorswapProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDest
  >
): TakeBidT22Instruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountTcomp,
  TAccountSeller,
  TAccountBidState,
  TAccountOwner,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountMarginAccount,
  TAccountWhitelist,
  TAccountNftSellerAcc,
  TAccountNftMint,
  TAccountOwnerAtaAcc,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountSystemProgram,
  TAccountMarketplaceProgram,
  TAccountTensorswapProgram,
  TAccountCosigner,
  TAccountMintProof,
  TAccountRentDest
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    tcomp: { value: input.tcomp ?? null, isWritable: true },
    seller: { value: input.seller ?? null, isWritable: true },
    bidState: { value: input.bidState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    marginAccount: { value: input.marginAccount ?? null, isWritable: true },
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    nftSellerAcc: { value: input.nftSellerAcc ?? null, isWritable: true },
    nftMint: { value: input.nftMint ?? null, isWritable: false },
    ownerAtaAcc: { value: input.ownerAtaAcc ?? null, isWritable: true },
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
    tensorswapProgram: {
      value: input.tensorswapProgram ?? null,
      isWritable: false,
    },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
    mintProof: { value: input.mintProof ?? null, isWritable: false },
    rentDest: { value: input.rentDest ?? null, isWritable: true },
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

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.tcomp),
      getAccountMeta(accounts.seller),
      getAccountMeta(accounts.bidState),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.marginAccount),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.nftSellerAcc),
      getAccountMeta(accounts.nftMint),
      getAccountMeta(accounts.ownerAtaAcc),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.tensorswapProgram),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.mintProof),
      getAccountMeta(accounts.rentDest),
    ],
    programAddress,
    data: getTakeBidT22InstructionDataEncoder().encode(
      args as TakeBidT22InstructionDataArgs
    ),
  } as TakeBidT22Instruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountTcomp,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountNftSellerAcc,
    TAccountNftMint,
    TAccountOwnerAtaAcc,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountTensorswapProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDest
  >;

  return instruction;
}

export type ParsedTakeBidT22Instruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    tcomp: TAccountMetas[0];
    seller: TAccountMetas[1];
    bidState: TAccountMetas[2];
    owner: TAccountMetas[3];
    takerBroker?: TAccountMetas[4] | undefined;
    makerBroker?: TAccountMetas[5] | undefined;
    marginAccount: TAccountMetas[6];
    whitelist: TAccountMetas[7];
    nftSellerAcc: TAccountMetas[8];
    nftMint: TAccountMetas[9];
    ownerAtaAcc: TAccountMetas[10];
    tokenProgram: TAccountMetas[11];
    associatedTokenProgram: TAccountMetas[12];
    systemProgram: TAccountMetas[13];
    marketplaceProgram: TAccountMetas[14];
    tensorswapProgram: TAccountMetas[15];
    cosigner: TAccountMetas[16];
    /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
    mintProof: TAccountMetas[17];
    rentDest: TAccountMetas[18];
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
      tcomp: getNextAccount(),
      seller: getNextAccount(),
      bidState: getNextAccount(),
      owner: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      marginAccount: getNextAccount(),
      whitelist: getNextAccount(),
      nftSellerAcc: getNextAccount(),
      nftMint: getNextAccount(),
      ownerAtaAcc: getNextAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      tensorswapProgram: getNextAccount(),
      cosigner: getNextAccount(),
      mintProof: getNextAccount(),
      rentDest: getNextAccount(),
    },
    data: getTakeBidT22InstructionDataDecoder().decode(instruction.data),
  };
}
