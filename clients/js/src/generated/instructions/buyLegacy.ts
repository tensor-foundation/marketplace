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

export type BuyLegacyInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountListToken extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountBuyerToken extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountRentDest extends string | IAccountMeta<string> = string,
  TAccountTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TAccountAssociatedTokenProgram extends string | IAccountMeta<string> = string,
  TAccountMarketplaceProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountMetadata extends string | IAccountMeta<string> = string,
  TAccountEdition extends string | IAccountMeta<string> = string,
  TAccountOwnerTokenRecord extends string | IAccountMeta<string> = string,
  TAccountListTokenRecord extends string | IAccountMeta<string> = string,
  TAccountAuthorizationRules extends string | IAccountMeta<string> = string,
  TAccountAuthorizationRulesProgram extends
    | string
    | IAccountMeta<string> = string,
  TAccountTokenMetadataProgram extends
    | string
    | IAccountMeta<string> = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
  TAccountSysvarInstructions extends
    | string
    | IAccountMeta<string> = 'Sysvar1nstructions1111111111111111111111111',
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountFeeVault extends string
        ? WritableAccount<TAccountFeeVault>
        : TAccountFeeVault,
      TAccountListToken extends string
        ? WritableAccount<TAccountListToken>
        : TAccountListToken,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
      TAccountBuyer extends string
        ? ReadonlyAccount<TAccountBuyer>
        : TAccountBuyer,
      TAccountBuyerToken extends string
        ? WritableAccount<TAccountBuyerToken>
        : TAccountBuyerToken,
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
      TAccountTokenProgram extends string
        ? ReadonlyAccount<TAccountTokenProgram>
        : TAccountTokenProgram,
      TAccountAssociatedTokenProgram extends string
        ? ReadonlyAccount<TAccountAssociatedTokenProgram>
        : TAccountAssociatedTokenProgram,
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountMetadata extends string
        ? WritableAccount<TAccountMetadata>
        : TAccountMetadata,
      TAccountEdition extends string
        ? ReadonlyAccount<TAccountEdition>
        : TAccountEdition,
      TAccountOwnerTokenRecord extends string
        ? WritableAccount<TAccountOwnerTokenRecord>
        : TAccountOwnerTokenRecord,
      TAccountListTokenRecord extends string
        ? WritableAccount<TAccountListTokenRecord>
        : TAccountListTokenRecord,
      TAccountAuthorizationRules extends string
        ? ReadonlyAccount<TAccountAuthorizationRules>
        : TAccountAuthorizationRules,
      TAccountAuthorizationRulesProgram extends string
        ? ReadonlyAccount<TAccountAuthorizationRulesProgram>
        : TAccountAuthorizationRulesProgram,
      TAccountTokenMetadataProgram extends string
        ? ReadonlyAccount<TAccountTokenMetadataProgram>
        : TAccountTokenMetadataProgram,
      TAccountSysvarInstructions extends string
        ? ReadonlyAccount<TAccountSysvarInstructions>
        : TAccountSysvarInstructions,
      ...TRemainingAccounts,
    ]
  >;

export type BuyLegacyInstructionData = {
  discriminator: Array<number>;
  maxAmount: bigint;
  optionalRoyaltyPct: Option<number>;
  authorizationData: Option<AuthorizationDataLocal>;
};

export type BuyLegacyInstructionDataArgs = {
  maxAmount: number | bigint;
  optionalRoyaltyPct: OptionOrNullable<number>;
  authorizationData: OptionOrNullable<AuthorizationDataLocalArgs>;
};

export function getBuyLegacyInstructionDataEncoder(): Encoder<BuyLegacyInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['maxAmount', getU64Encoder()],
      ['optionalRoyaltyPct', getOptionEncoder(getU16Encoder())],
      [
        'authorizationData',
        getOptionEncoder(getAuthorizationDataLocalEncoder()),
      ],
    ]),
    (value) => ({
      ...value,
      discriminator: [68, 127, 43, 8, 212, 31, 249, 114],
    })
  );
}

export function getBuyLegacyInstructionDataDecoder(): Decoder<BuyLegacyInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['maxAmount', getU64Decoder()],
    ['optionalRoyaltyPct', getOptionDecoder(getU16Decoder())],
    ['authorizationData', getOptionDecoder(getAuthorizationDataLocalDecoder())],
  ]);
}

export function getBuyLegacyInstructionDataCodec(): Codec<
  BuyLegacyInstructionDataArgs,
  BuyLegacyInstructionData
> {
  return combineCodec(
    getBuyLegacyInstructionDataEncoder(),
    getBuyLegacyInstructionDataDecoder()
  );
}

export type BuyLegacyInput<
  TAccountFeeVault extends string = string,
  TAccountListToken extends string = string,
  TAccountListState extends string = string,
  TAccountMint extends string = string,
  TAccountBuyer extends string = string,
  TAccountBuyerToken extends string = string,
  TAccountPayer extends string = string,
  TAccountOwner extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountRentDest extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMetadata extends string = string,
  TAccountEdition extends string = string,
  TAccountOwnerTokenRecord extends string = string,
  TAccountListTokenRecord extends string = string,
  TAccountAuthorizationRules extends string = string,
  TAccountAuthorizationRulesProgram extends string = string,
  TAccountTokenMetadataProgram extends string = string,
  TAccountSysvarInstructions extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  listToken: Address<TAccountListToken>;
  listState: Address<TAccountListState>;
  mint: Address<TAccountMint>;
  buyer: Address<TAccountBuyer>;
  buyerToken: Address<TAccountBuyerToken>;
  payer: TransactionSigner<TAccountPayer>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDest: Address<TAccountRentDest>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  metadata: Address<TAccountMetadata>;
  edition: Address<TAccountEdition>;
  ownerTokenRecord?: Address<TAccountOwnerTokenRecord>;
  listTokenRecord?: Address<TAccountListTokenRecord>;
  authorizationRules?: Address<TAccountAuthorizationRules>;
  authorizationRulesProgram?: Address<TAccountAuthorizationRulesProgram>;
  tokenMetadataProgram?: Address<TAccountTokenMetadataProgram>;
  sysvarInstructions?: Address<TAccountSysvarInstructions>;
  maxAmount: BuyLegacyInstructionDataArgs['maxAmount'];
  optionalRoyaltyPct: BuyLegacyInstructionDataArgs['optionalRoyaltyPct'];
  authorizationData: BuyLegacyInstructionDataArgs['authorizationData'];
};

export function getBuyLegacyInstruction<
  TAccountFeeVault extends string,
  TAccountListToken extends string,
  TAccountListState extends string,
  TAccountMint extends string,
  TAccountBuyer extends string,
  TAccountBuyerToken extends string,
  TAccountPayer extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDest extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMetadata extends string,
  TAccountEdition extends string,
  TAccountOwnerTokenRecord extends string,
  TAccountListTokenRecord extends string,
  TAccountAuthorizationRules extends string,
  TAccountAuthorizationRulesProgram extends string,
  TAccountTokenMetadataProgram extends string,
  TAccountSysvarInstructions extends string,
>(
  input: BuyLegacyInput<
    TAccountFeeVault,
    TAccountListToken,
    TAccountListState,
    TAccountMint,
    TAccountBuyer,
    TAccountBuyerToken,
    TAccountPayer,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDest,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountMetadata,
    TAccountEdition,
    TAccountOwnerTokenRecord,
    TAccountListTokenRecord,
    TAccountAuthorizationRules,
    TAccountAuthorizationRulesProgram,
    TAccountTokenMetadataProgram,
    TAccountSysvarInstructions
  >
): BuyLegacyInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault,
  TAccountListToken,
  TAccountListState,
  TAccountMint,
  TAccountBuyer,
  TAccountBuyerToken,
  TAccountPayer,
  TAccountOwner,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountRentDest,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountMarketplaceProgram,
  TAccountSystemProgram,
  TAccountMetadata,
  TAccountEdition,
  TAccountOwnerTokenRecord,
  TAccountListTokenRecord,
  TAccountAuthorizationRules,
  TAccountAuthorizationRulesProgram,
  TAccountTokenMetadataProgram,
  TAccountSysvarInstructions
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    listToken: { value: input.listToken ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    buyer: { value: input.buyer ?? null, isWritable: false },
    buyerToken: { value: input.buyerToken ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    rentDest: { value: input.rentDest ?? null, isWritable: true },
    tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    associatedTokenProgram: {
      value: input.associatedTokenProgram ?? null,
      isWritable: false,
    },
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    metadata: { value: input.metadata ?? null, isWritable: true },
    edition: { value: input.edition ?? null, isWritable: false },
    ownerTokenRecord: {
      value: input.ownerTokenRecord ?? null,
      isWritable: true,
    },
    listTokenRecord: { value: input.listTokenRecord ?? null, isWritable: true },
    authorizationRules: {
      value: input.authorizationRules ?? null,
      isWritable: false,
    },
    authorizationRulesProgram: {
      value: input.authorizationRulesProgram ?? null,
      isWritable: false,
    },
    tokenMetadataProgram: {
      value: input.tokenMetadataProgram ?? null,
      isWritable: false,
    },
    sysvarInstructions: {
      value: input.sysvarInstructions ?? null,
      isWritable: false,
    },
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
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.tokenMetadataProgram.value) {
    accounts.tokenMetadataProgram.value =
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>;
  }
  if (!accounts.sysvarInstructions.value) {
    accounts.sysvarInstructions.value =
      'Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.listToken),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.buyerToken),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.rentDest),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.metadata),
      getAccountMeta(accounts.edition),
      getAccountMeta(accounts.ownerTokenRecord),
      getAccountMeta(accounts.listTokenRecord),
      getAccountMeta(accounts.authorizationRules),
      getAccountMeta(accounts.authorizationRulesProgram),
      getAccountMeta(accounts.tokenMetadataProgram),
      getAccountMeta(accounts.sysvarInstructions),
    ],
    programAddress,
    data: getBuyLegacyInstructionDataEncoder().encode(
      args as BuyLegacyInstructionDataArgs
    ),
  } as BuyLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountListToken,
    TAccountListState,
    TAccountMint,
    TAccountBuyer,
    TAccountBuyerToken,
    TAccountPayer,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDest,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountMetadata,
    TAccountEdition,
    TAccountOwnerTokenRecord,
    TAccountListTokenRecord,
    TAccountAuthorizationRules,
    TAccountAuthorizationRulesProgram,
    TAccountTokenMetadataProgram,
    TAccountSysvarInstructions
  >;

  return instruction;
}

export type ParsedBuyLegacyInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
    listToken: TAccountMetas[1];
    listState: TAccountMetas[2];
    mint: TAccountMetas[3];
    buyer: TAccountMetas[4];
    buyerToken: TAccountMetas[5];
    payer: TAccountMetas[6];
    owner: TAccountMetas[7];
    takerBroker?: TAccountMetas[8] | undefined;
    makerBroker?: TAccountMetas[9] | undefined;
    rentDest: TAccountMetas[10];
    tokenProgram: TAccountMetas[11];
    associatedTokenProgram: TAccountMetas[12];
    marketplaceProgram: TAccountMetas[13];
    systemProgram: TAccountMetas[14];
    metadata: TAccountMetas[15];
    edition: TAccountMetas[16];
    ownerTokenRecord?: TAccountMetas[17] | undefined;
    listTokenRecord?: TAccountMetas[18] | undefined;
    authorizationRules?: TAccountMetas[19] | undefined;
    authorizationRulesProgram?: TAccountMetas[20] | undefined;
    tokenMetadataProgram: TAccountMetas[21];
    sysvarInstructions: TAccountMetas[22];
  };
  data: BuyLegacyInstructionData;
};

export function parseBuyLegacyInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedBuyLegacyInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 23) {
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
      listToken: getNextAccount(),
      listState: getNextAccount(),
      mint: getNextAccount(),
      buyer: getNextAccount(),
      buyerToken: getNextAccount(),
      payer: getNextAccount(),
      owner: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      rentDest: getNextAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      metadata: getNextAccount(),
      edition: getNextAccount(),
      ownerTokenRecord: getNextOptionalAccount(),
      listTokenRecord: getNextOptionalAccount(),
      authorizationRules: getNextOptionalAccount(),
      authorizationRulesProgram: getNextOptionalAccount(),
      tokenMetadataProgram: getNextAccount(),
      sysvarInstructions: getNextAccount(),
    },
    data: getBuyLegacyInstructionDataDecoder().decode(instruction.data),
  };
}