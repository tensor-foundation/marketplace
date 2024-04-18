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
  getOptionDecoder,
  getOptionEncoder,
  getStructDecoder,
  getStructEncoder,
  getU16Decoder,
  getU16Encoder,
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
import {
  AuthorizationDataLocal,
  AuthorizationDataLocalArgs,
  getAuthorizationDataLocalDecoder,
  getAuthorizationDataLocalEncoder,
} from '../types';

export type TakeBidLegacyInstruction<
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
  TAccountNftMetadata extends string | IAccountMeta<string> = string,
  TAccountOwnerAtaAcc extends string | IAccountMeta<string> = string,
  TAccountNftEdition extends string | IAccountMeta<string> = string,
  TAccountOwnerTokenRecord extends string | IAccountMeta<string> = string,
  TAccountDestTokenRecord extends string | IAccountMeta<string> = string,
  TAccountTokenMetadataProgram extends
    | string
    | IAccountMeta<string> = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  TAccountInstructions extends string | IAccountMeta<string> = string,
  TAccountAuthorizationRulesProgram extends
    | string
    | IAccountMeta<string> = 'auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg',
  TAccountNftEscrow extends string | IAccountMeta<string> = string,
  TAccountTempEscrowTokenRecord extends string | IAccountMeta<string> = string,
  TAccountAuthRules extends string | IAccountMeta<string> = string,
  TAccountTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TAccountAssociatedTokenProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
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
      TAccountNftMetadata extends string
        ? WritableAccount<TAccountNftMetadata>
        : TAccountNftMetadata,
      TAccountOwnerAtaAcc extends string
        ? WritableAccount<TAccountOwnerAtaAcc>
        : TAccountOwnerAtaAcc,
      TAccountNftEdition extends string
        ? ReadonlyAccount<TAccountNftEdition>
        : TAccountNftEdition,
      TAccountOwnerTokenRecord extends string
        ? WritableAccount<TAccountOwnerTokenRecord>
        : TAccountOwnerTokenRecord,
      TAccountDestTokenRecord extends string
        ? WritableAccount<TAccountDestTokenRecord>
        : TAccountDestTokenRecord,
      TAccountTokenMetadataProgram extends string
        ? ReadonlyAccount<TAccountTokenMetadataProgram>
        : TAccountTokenMetadataProgram,
      TAccountInstructions extends string
        ? ReadonlyAccount<TAccountInstructions>
        : TAccountInstructions,
      TAccountAuthorizationRulesProgram extends string
        ? ReadonlyAccount<TAccountAuthorizationRulesProgram>
        : TAccountAuthorizationRulesProgram,
      TAccountNftEscrow extends string
        ? WritableAccount<TAccountNftEscrow>
        : TAccountNftEscrow,
      TAccountTempEscrowTokenRecord extends string
        ? WritableAccount<TAccountTempEscrowTokenRecord>
        : TAccountTempEscrowTokenRecord,
      TAccountAuthRules extends string
        ? ReadonlyAccount<TAccountAuthRules>
        : TAccountAuthRules,
      TAccountTokenProgram extends string
        ? ReadonlyAccount<TAccountTokenProgram>
        : TAccountTokenProgram,
      TAccountAssociatedTokenProgram extends string
        ? ReadonlyAccount<TAccountAssociatedTokenProgram>
        : TAccountAssociatedTokenProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountTcompProgram extends string
        ? ReadonlyAccount<TAccountTcompProgram>
        : TAccountTcompProgram,
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

export type TakeBidLegacyInstructionData = {
  discriminator: Array<number>;
  minAmount: bigint;
  optionalRoyaltyPct: Option<number>;
  rulesAccPresent: boolean;
  authorizationData: Option<AuthorizationDataLocal>;
};

export type TakeBidLegacyInstructionDataArgs = {
  minAmount: number | bigint;
  optionalRoyaltyPct: OptionOrNullable<number>;
  rulesAccPresent: boolean;
  authorizationData: OptionOrNullable<AuthorizationDataLocalArgs>;
};

export function getTakeBidLegacyInstructionDataEncoder(): Encoder<TakeBidLegacyInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['minAmount', getU64Encoder()],
      ['optionalRoyaltyPct', getOptionEncoder(getU16Encoder())],
      ['rulesAccPresent', getBooleanEncoder()],
      [
        'authorizationData',
        getOptionEncoder(getAuthorizationDataLocalEncoder()),
      ],
    ]),
    (value) => ({
      ...value,
      discriminator: [188, 35, 116, 108, 0, 233, 237, 201],
    })
  );
}

export function getTakeBidLegacyInstructionDataDecoder(): Decoder<TakeBidLegacyInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['minAmount', getU64Decoder()],
    ['optionalRoyaltyPct', getOptionDecoder(getU16Decoder())],
    ['rulesAccPresent', getBooleanDecoder()],
    ['authorizationData', getOptionDecoder(getAuthorizationDataLocalDecoder())],
  ]);
}

export function getTakeBidLegacyInstructionDataCodec(): Codec<
  TakeBidLegacyInstructionDataArgs,
  TakeBidLegacyInstructionData
> {
  return combineCodec(
    getTakeBidLegacyInstructionDataEncoder(),
    getTakeBidLegacyInstructionDataDecoder()
  );
}

export type TakeBidLegacyInput<
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
  TAccountNftMetadata extends string = string,
  TAccountOwnerAtaAcc extends string = string,
  TAccountNftEdition extends string = string,
  TAccountOwnerTokenRecord extends string = string,
  TAccountDestTokenRecord extends string = string,
  TAccountTokenMetadataProgram extends string = string,
  TAccountInstructions extends string = string,
  TAccountAuthorizationRulesProgram extends string = string,
  TAccountNftEscrow extends string = string,
  TAccountTempEscrowTokenRecord extends string = string,
  TAccountAuthRules extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountTcompProgram extends string = string,
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
  nftMetadata: Address<TAccountNftMetadata>;
  ownerAtaAcc: Address<TAccountOwnerAtaAcc>;
  nftEdition: Address<TAccountNftEdition>;
  ownerTokenRecord: Address<TAccountOwnerTokenRecord>;
  destTokenRecord: Address<TAccountDestTokenRecord>;
  tokenMetadataProgram?: Address<TAccountTokenMetadataProgram>;
  instructions: Address<TAccountInstructions>;
  authorizationRulesProgram?: Address<TAccountAuthorizationRulesProgram>;
  /** Implicitly checked via transfer. Will fail if wrong account */
  nftEscrow: Address<TAccountNftEscrow>;
  tempEscrowTokenRecord: Address<TAccountTempEscrowTokenRecord>;
  authRules: Address<TAccountAuthRules>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram: Address<TAccountAssociatedTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  tcompProgram: Address<TAccountTcompProgram>;
  tensorswapProgram: Address<TAccountTensorswapProgram>;
  cosigner: TransactionSigner<TAccountCosigner>;
  /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
  mintProof: Address<TAccountMintProof>;
  rentDest: Address<TAccountRentDest>;
  minAmount: TakeBidLegacyInstructionDataArgs['minAmount'];
  optionalRoyaltyPct: TakeBidLegacyInstructionDataArgs['optionalRoyaltyPct'];
  rulesAccPresent: TakeBidLegacyInstructionDataArgs['rulesAccPresent'];
  authorizationData: TakeBidLegacyInstructionDataArgs['authorizationData'];
};

export function getTakeBidLegacyInstruction<
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
  TAccountNftMetadata extends string,
  TAccountOwnerAtaAcc extends string,
  TAccountNftEdition extends string,
  TAccountOwnerTokenRecord extends string,
  TAccountDestTokenRecord extends string,
  TAccountTokenMetadataProgram extends string,
  TAccountInstructions extends string,
  TAccountAuthorizationRulesProgram extends string,
  TAccountNftEscrow extends string,
  TAccountTempEscrowTokenRecord extends string,
  TAccountAuthRules extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountSystemProgram extends string,
  TAccountTcompProgram extends string,
  TAccountTensorswapProgram extends string,
  TAccountCosigner extends string,
  TAccountMintProof extends string,
  TAccountRentDest extends string,
>(
  input: TakeBidLegacyInput<
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
    TAccountNftMetadata,
    TAccountOwnerAtaAcc,
    TAccountNftEdition,
    TAccountOwnerTokenRecord,
    TAccountDestTokenRecord,
    TAccountTokenMetadataProgram,
    TAccountInstructions,
    TAccountAuthorizationRulesProgram,
    TAccountNftEscrow,
    TAccountTempEscrowTokenRecord,
    TAccountAuthRules,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountTcompProgram,
    TAccountTensorswapProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDest
  >
): TakeBidLegacyInstruction<
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
  TAccountNftMetadata,
  TAccountOwnerAtaAcc,
  TAccountNftEdition,
  TAccountOwnerTokenRecord,
  TAccountDestTokenRecord,
  TAccountTokenMetadataProgram,
  TAccountInstructions,
  TAccountAuthorizationRulesProgram,
  TAccountNftEscrow,
  TAccountTempEscrowTokenRecord,
  TAccountAuthRules,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountSystemProgram,
  TAccountTcompProgram,
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
    nftMetadata: { value: input.nftMetadata ?? null, isWritable: true },
    ownerAtaAcc: { value: input.ownerAtaAcc ?? null, isWritable: true },
    nftEdition: { value: input.nftEdition ?? null, isWritable: false },
    ownerTokenRecord: {
      value: input.ownerTokenRecord ?? null,
      isWritable: true,
    },
    destTokenRecord: { value: input.destTokenRecord ?? null, isWritable: true },
    tokenMetadataProgram: {
      value: input.tokenMetadataProgram ?? null,
      isWritable: false,
    },
    instructions: { value: input.instructions ?? null, isWritable: false },
    authorizationRulesProgram: {
      value: input.authorizationRulesProgram ?? null,
      isWritable: false,
    },
    nftEscrow: { value: input.nftEscrow ?? null, isWritable: true },
    tempEscrowTokenRecord: {
      value: input.tempEscrowTokenRecord ?? null,
      isWritable: true,
    },
    authRules: { value: input.authRules ?? null, isWritable: false },
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    associatedTokenProgram: {
      value: input.associatedTokenProgram ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    tcompProgram: { value: input.tcompProgram ?? null, isWritable: false },
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
  if (!accounts.tokenMetadataProgram.value) {
    accounts.tokenMetadataProgram.value =
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>;
  }
  if (!accounts.authorizationRulesProgram.value) {
    accounts.authorizationRulesProgram.value =
      'auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg' as Address<'auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg'>;
  }
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
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
      getAccountMeta(accounts.nftMetadata),
      getAccountMeta(accounts.ownerAtaAcc),
      getAccountMeta(accounts.nftEdition),
      getAccountMeta(accounts.ownerTokenRecord),
      getAccountMeta(accounts.destTokenRecord),
      getAccountMeta(accounts.tokenMetadataProgram),
      getAccountMeta(accounts.instructions),
      getAccountMeta(accounts.authorizationRulesProgram),
      getAccountMeta(accounts.nftEscrow),
      getAccountMeta(accounts.tempEscrowTokenRecord),
      getAccountMeta(accounts.authRules),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.tcompProgram),
      getAccountMeta(accounts.tensorswapProgram),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.mintProof),
      getAccountMeta(accounts.rentDest),
    ],
    programAddress,
    data: getTakeBidLegacyInstructionDataEncoder().encode(
      args as TakeBidLegacyInstructionDataArgs
    ),
  } as TakeBidLegacyInstruction<
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
    TAccountNftMetadata,
    TAccountOwnerAtaAcc,
    TAccountNftEdition,
    TAccountOwnerTokenRecord,
    TAccountDestTokenRecord,
    TAccountTokenMetadataProgram,
    TAccountInstructions,
    TAccountAuthorizationRulesProgram,
    TAccountNftEscrow,
    TAccountTempEscrowTokenRecord,
    TAccountAuthRules,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountTcompProgram,
    TAccountTensorswapProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDest
  >;

  return instruction;
}

export type ParsedTakeBidLegacyInstruction<
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
    nftMetadata: TAccountMetas[10];
    ownerAtaAcc: TAccountMetas[11];
    nftEdition: TAccountMetas[12];
    ownerTokenRecord: TAccountMetas[13];
    destTokenRecord: TAccountMetas[14];
    tokenMetadataProgram: TAccountMetas[15];
    instructions: TAccountMetas[16];
    authorizationRulesProgram: TAccountMetas[17];
    /** Implicitly checked via transfer. Will fail if wrong account */
    nftEscrow: TAccountMetas[18];
    tempEscrowTokenRecord: TAccountMetas[19];
    authRules: TAccountMetas[20];
    tokenProgram: TAccountMetas[21];
    associatedTokenProgram: TAccountMetas[22];
    systemProgram: TAccountMetas[23];
    tcompProgram: TAccountMetas[24];
    tensorswapProgram: TAccountMetas[25];
    cosigner: TAccountMetas[26];
    /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
    mintProof: TAccountMetas[27];
    rentDest: TAccountMetas[28];
  };
  data: TakeBidLegacyInstructionData;
};

export function parseTakeBidLegacyInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedTakeBidLegacyInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 29) {
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
      nftMetadata: getNextAccount(),
      ownerAtaAcc: getNextAccount(),
      nftEdition: getNextAccount(),
      ownerTokenRecord: getNextAccount(),
      destTokenRecord: getNextAccount(),
      tokenMetadataProgram: getNextAccount(),
      instructions: getNextAccount(),
      authorizationRulesProgram: getNextAccount(),
      nftEscrow: getNextAccount(),
      tempEscrowTokenRecord: getNextAccount(),
      authRules: getNextAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      tcompProgram: getNextAccount(),
      tensorswapProgram: getNextAccount(),
      cosigner: getNextAccount(),
      mintProof: getNextAccount(),
      rentDest: getNextAccount(),
    },
    data: getTakeBidLegacyInstructionDataDecoder().decode(instruction.data),
  };
}
