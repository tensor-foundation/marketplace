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
  none,
} from '@solana/codecs';
import {
  AccountRole,
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
import {
  TokenStandard,
  TokenStandardArgs,
  resolveBuyerAta,
  resolveBuyerTokenRecordFromTokenStandard,
  resolveEditionFromTokenStandard,
  resolveListAta,
  resolveListTokenRecordFromTokenStandard,
  resolveMetadata,
} from '../../hooked';
import { findFeeVaultPda, findListStatePda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  ResolvedAccount,
  expectAddress,
  expectSome,
  expectTransactionSigner,
  getAccountMetaFactory,
} from '../shared';
import {
  AuthorizationDataLocal,
  AuthorizationDataLocalArgs,
  getAuthorizationDataLocalDecoder,
  getAuthorizationDataLocalEncoder,
} from '../types';

export type BuyLegacyInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountBuyerAta extends string | IAccountMeta<string> = string,
  TAccountListAta extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  TAccountAssociatedTokenProgram extends
    | string
    | IAccountMeta<string> = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountMetadata extends string | IAccountMeta<string> = string,
  TAccountEdition extends string | IAccountMeta<string> = string,
  TAccountBuyerTokenRecord extends string | IAccountMeta<string> = string,
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
      TAccountBuyer extends string
        ? ReadonlyAccount<TAccountBuyer>
        : TAccountBuyer,
      TAccountBuyerAta extends string
        ? WritableAccount<TAccountBuyerAta>
        : TAccountBuyerAta,
      TAccountListAta extends string
        ? WritableAccount<TAccountListAta>
        : TAccountListAta,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
      TAccountOwner extends string
        ? WritableAccount<TAccountOwner>
        : TAccountOwner,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountTakerBroker extends string
        ? WritableAccount<TAccountTakerBroker>
        : TAccountTakerBroker,
      TAccountMakerBroker extends string
        ? WritableAccount<TAccountMakerBroker>
        : TAccountMakerBroker,
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
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
      TAccountBuyerTokenRecord extends string
        ? WritableAccount<TAccountBuyerTokenRecord>
        : TAccountBuyerTokenRecord,
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
  optionalRoyaltyPct?: OptionOrNullable<number>;
  authorizationData?: OptionOrNullable<AuthorizationDataLocalArgs>;
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
      optionalRoyaltyPct: value.optionalRoyaltyPct ?? none(),
      authorizationData: value.authorizationData ?? none(),
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

export type BuyLegacyInstructionExtraArgs = {
  tokenStandard?: TokenStandardArgs;
};

export type BuyLegacyAsyncInput<
  TAccountFeeVault extends string = string,
  TAccountBuyer extends string = string,
  TAccountBuyerAta extends string = string,
  TAccountListAta extends string = string,
  TAccountListState extends string = string,
  TAccountMint extends string = string,
  TAccountOwner extends string = string,
  TAccountPayer extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountRentDestination extends string = string,
  TAccountCosigner extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMetadata extends string = string,
  TAccountEdition extends string = string,
  TAccountBuyerTokenRecord extends string = string,
  TAccountListTokenRecord extends string = string,
  TAccountAuthorizationRules extends string = string,
  TAccountAuthorizationRulesProgram extends string = string,
  TAccountTokenMetadataProgram extends string = string,
  TAccountSysvarInstructions extends string = string,
> = {
  feeVault?: Address<TAccountFeeVault>;
  buyer?: Address<TAccountBuyer>;
  buyerAta?: Address<TAccountBuyerAta>;
  listAta?: Address<TAccountListAta>;
  listState?: Address<TAccountListState>;
  mint: Address<TAccountMint>;
  owner: Address<TAccountOwner>;
  payer: TransactionSigner<TAccountPayer>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDestination?: Address<TAccountRentDestination>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  metadata?: Address<TAccountMetadata>;
  edition?: Address<TAccountEdition>;
  buyerTokenRecord?: Address<TAccountBuyerTokenRecord>;
  listTokenRecord?: Address<TAccountListTokenRecord>;
  authorizationRules?: Address<TAccountAuthorizationRules>;
  authorizationRulesProgram?: Address<TAccountAuthorizationRulesProgram>;
  tokenMetadataProgram?: Address<TAccountTokenMetadataProgram>;
  sysvarInstructions?: Address<TAccountSysvarInstructions>;
  maxAmount: BuyLegacyInstructionDataArgs['maxAmount'];
  optionalRoyaltyPct?: BuyLegacyInstructionDataArgs['optionalRoyaltyPct'];
  authorizationData?: BuyLegacyInstructionDataArgs['authorizationData'];
  tokenStandard?: BuyLegacyInstructionExtraArgs['tokenStandard'];
  creators?: Array<Address>;
};

export async function getBuyLegacyInstructionAsync<
  TAccountFeeVault extends string,
  TAccountBuyer extends string,
  TAccountBuyerAta extends string,
  TAccountListAta extends string,
  TAccountListState extends string,
  TAccountMint extends string,
  TAccountOwner extends string,
  TAccountPayer extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDestination extends string,
  TAccountCosigner extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMetadata extends string,
  TAccountEdition extends string,
  TAccountBuyerTokenRecord extends string,
  TAccountListTokenRecord extends string,
  TAccountAuthorizationRules extends string,
  TAccountAuthorizationRulesProgram extends string,
  TAccountTokenMetadataProgram extends string,
  TAccountSysvarInstructions extends string,
>(
  input: BuyLegacyAsyncInput<
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerAta,
    TAccountListAta,
    TAccountListState,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountCosigner,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountMetadata,
    TAccountEdition,
    TAccountBuyerTokenRecord,
    TAccountListTokenRecord,
    TAccountAuthorizationRules,
    TAccountAuthorizationRulesProgram,
    TAccountTokenMetadataProgram,
    TAccountSysvarInstructions
  >
): Promise<
  BuyLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerAta,
    TAccountListAta,
    TAccountListState,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountCosigner,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountMetadata,
    TAccountEdition,
    TAccountBuyerTokenRecord,
    TAccountListTokenRecord,
    TAccountAuthorizationRules,
    TAccountAuthorizationRulesProgram,
    TAccountTokenMetadataProgram,
    TAccountSysvarInstructions
  >
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    buyer: { value: input.buyer ?? null, isWritable: false },
    buyerAta: { value: input.buyerAta ?? null, isWritable: true },
    listAta: { value: input.listAta ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
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
    buyerTokenRecord: {
      value: input.buyerTokenRecord ?? null,
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

  // Resolver scope.
  const resolverScope = { programAddress, accounts, args };

  // Resolve default values.
  if (!accounts.feeVault.value) {
    accounts.feeVault.value = await findFeeVaultPda();
  }
  if (!accounts.buyer.value) {
    accounts.buyer.value = expectTransactionSigner(
      accounts.payer.value
    ).address;
  }
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
  }
  if (!accounts.buyerAta.value) {
    accounts.buyerAta = {
      ...accounts.buyerAta,
      ...(await resolveBuyerAta(resolverScope)),
    };
  }
  if (!accounts.listState.value) {
    accounts.listState.value = await findListStatePda({
      mint: expectAddress(accounts.mint.value),
    });
  }
  if (!accounts.listAta.value) {
    accounts.listAta = {
      ...accounts.listAta,
      ...(await resolveListAta(resolverScope)),
    };
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }
  if (!accounts.associatedTokenProgram.value) {
    accounts.associatedTokenProgram.value =
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.metadata.value) {
    accounts.metadata = {
      ...accounts.metadata,
      ...(await resolveMetadata(resolverScope)),
    };
  }
  if (!args.tokenStandard) {
    args.tokenStandard = TokenStandard.NonFungible;
  }
  if (!accounts.edition.value) {
    accounts.edition = {
      ...accounts.edition,
      ...(await resolveEditionFromTokenStandard(resolverScope)),
    };
  }
  if (!accounts.buyerTokenRecord.value) {
    accounts.buyerTokenRecord = {
      ...accounts.buyerTokenRecord,
      ...(await resolveBuyerTokenRecordFromTokenStandard(resolverScope)),
    };
  }
  if (!accounts.listTokenRecord.value) {
    accounts.listTokenRecord = {
      ...accounts.listTokenRecord,
      ...(await resolveListTokenRecordFromTokenStandard(resolverScope)),
    };
  }
  if (!accounts.authorizationRulesProgram.value) {
    if (accounts.authorizationRules.value) {
      accounts.authorizationRulesProgram.value =
        'auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg' as Address<'auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg'>;
    }
  }
  if (!accounts.tokenMetadataProgram.value) {
    accounts.tokenMetadataProgram.value =
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>;
  }
  if (!accounts.sysvarInstructions.value) {
    accounts.sysvarInstructions.value =
      'Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>;
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = (args.creators ?? []).map(
    (address) => ({ address, role: AccountRole.WRITABLE })
  );

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.buyerAta),
      getAccountMeta(accounts.listAta),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.metadata),
      getAccountMeta(accounts.edition),
      getAccountMeta(accounts.buyerTokenRecord),
      getAccountMeta(accounts.listTokenRecord),
      getAccountMeta(accounts.authorizationRules),
      getAccountMeta(accounts.authorizationRulesProgram),
      getAccountMeta(accounts.tokenMetadataProgram),
      getAccountMeta(accounts.sysvarInstructions),
      ...remainingAccounts,
    ],
    programAddress,
    data: getBuyLegacyInstructionDataEncoder().encode(
      args as BuyLegacyInstructionDataArgs
    ),
  } as BuyLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerAta,
    TAccountListAta,
    TAccountListState,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountCosigner,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountMetadata,
    TAccountEdition,
    TAccountBuyerTokenRecord,
    TAccountListTokenRecord,
    TAccountAuthorizationRules,
    TAccountAuthorizationRulesProgram,
    TAccountTokenMetadataProgram,
    TAccountSysvarInstructions
  >;

  return instruction;
}

export type BuyLegacyInput<
  TAccountFeeVault extends string = string,
  TAccountBuyer extends string = string,
  TAccountBuyerAta extends string = string,
  TAccountListAta extends string = string,
  TAccountListState extends string = string,
  TAccountMint extends string = string,
  TAccountOwner extends string = string,
  TAccountPayer extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountRentDestination extends string = string,
  TAccountCosigner extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMetadata extends string = string,
  TAccountEdition extends string = string,
  TAccountBuyerTokenRecord extends string = string,
  TAccountListTokenRecord extends string = string,
  TAccountAuthorizationRules extends string = string,
  TAccountAuthorizationRulesProgram extends string = string,
  TAccountTokenMetadataProgram extends string = string,
  TAccountSysvarInstructions extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  buyer?: Address<TAccountBuyer>;
  buyerAta: Address<TAccountBuyerAta>;
  listAta: Address<TAccountListAta>;
  listState: Address<TAccountListState>;
  mint: Address<TAccountMint>;
  owner: Address<TAccountOwner>;
  payer: TransactionSigner<TAccountPayer>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDestination?: Address<TAccountRentDestination>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  metadata: Address<TAccountMetadata>;
  edition: Address<TAccountEdition>;
  buyerTokenRecord?: Address<TAccountBuyerTokenRecord>;
  listTokenRecord?: Address<TAccountListTokenRecord>;
  authorizationRules?: Address<TAccountAuthorizationRules>;
  authorizationRulesProgram?: Address<TAccountAuthorizationRulesProgram>;
  tokenMetadataProgram?: Address<TAccountTokenMetadataProgram>;
  sysvarInstructions?: Address<TAccountSysvarInstructions>;
  maxAmount: BuyLegacyInstructionDataArgs['maxAmount'];
  optionalRoyaltyPct?: BuyLegacyInstructionDataArgs['optionalRoyaltyPct'];
  authorizationData?: BuyLegacyInstructionDataArgs['authorizationData'];
  tokenStandard?: BuyLegacyInstructionExtraArgs['tokenStandard'];
  creators?: Array<Address>;
};

export function getBuyLegacyInstruction<
  TAccountFeeVault extends string,
  TAccountBuyer extends string,
  TAccountBuyerAta extends string,
  TAccountListAta extends string,
  TAccountListState extends string,
  TAccountMint extends string,
  TAccountOwner extends string,
  TAccountPayer extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDestination extends string,
  TAccountCosigner extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMetadata extends string,
  TAccountEdition extends string,
  TAccountBuyerTokenRecord extends string,
  TAccountListTokenRecord extends string,
  TAccountAuthorizationRules extends string,
  TAccountAuthorizationRulesProgram extends string,
  TAccountTokenMetadataProgram extends string,
  TAccountSysvarInstructions extends string,
>(
  input: BuyLegacyInput<
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerAta,
    TAccountListAta,
    TAccountListState,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountCosigner,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountMetadata,
    TAccountEdition,
    TAccountBuyerTokenRecord,
    TAccountListTokenRecord,
    TAccountAuthorizationRules,
    TAccountAuthorizationRulesProgram,
    TAccountTokenMetadataProgram,
    TAccountSysvarInstructions
  >
): BuyLegacyInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault,
  TAccountBuyer,
  TAccountBuyerAta,
  TAccountListAta,
  TAccountListState,
  TAccountMint,
  TAccountOwner,
  TAccountPayer,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountRentDestination,
  TAccountCosigner,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountMarketplaceProgram,
  TAccountSystemProgram,
  TAccountMetadata,
  TAccountEdition,
  TAccountBuyerTokenRecord,
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
    buyer: { value: input.buyer ?? null, isWritable: false },
    buyerAta: { value: input.buyerAta ?? null, isWritable: true },
    listAta: { value: input.listAta ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
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
    buyerTokenRecord: {
      value: input.buyerTokenRecord ?? null,
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
  if (!accounts.buyer.value) {
    accounts.buyer.value = expectTransactionSigner(
      accounts.payer.value
    ).address;
  }
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }
  if (!accounts.associatedTokenProgram.value) {
    accounts.associatedTokenProgram.value =
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!args.tokenStandard) {
    args.tokenStandard = TokenStandard.NonFungible;
  }
  if (!accounts.authorizationRulesProgram.value) {
    if (accounts.authorizationRules.value) {
      accounts.authorizationRulesProgram.value =
        'auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg' as Address<'auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg'>;
    }
  }
  if (!accounts.tokenMetadataProgram.value) {
    accounts.tokenMetadataProgram.value =
      'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>;
  }
  if (!accounts.sysvarInstructions.value) {
    accounts.sysvarInstructions.value =
      'Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>;
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = (args.creators ?? []).map(
    (address) => ({ address, role: AccountRole.WRITABLE })
  );

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.buyerAta),
      getAccountMeta(accounts.listAta),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.metadata),
      getAccountMeta(accounts.edition),
      getAccountMeta(accounts.buyerTokenRecord),
      getAccountMeta(accounts.listTokenRecord),
      getAccountMeta(accounts.authorizationRules),
      getAccountMeta(accounts.authorizationRulesProgram),
      getAccountMeta(accounts.tokenMetadataProgram),
      getAccountMeta(accounts.sysvarInstructions),
      ...remainingAccounts,
    ],
    programAddress,
    data: getBuyLegacyInstructionDataEncoder().encode(
      args as BuyLegacyInstructionDataArgs
    ),
  } as BuyLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerAta,
    TAccountListAta,
    TAccountListState,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountCosigner,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountMetadata,
    TAccountEdition,
    TAccountBuyerTokenRecord,
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
    buyer: TAccountMetas[1];
    buyerAta: TAccountMetas[2];
    listAta: TAccountMetas[3];
    listState: TAccountMetas[4];
    mint: TAccountMetas[5];
    owner: TAccountMetas[6];
    payer: TAccountMetas[7];
    takerBroker?: TAccountMetas[8] | undefined;
    makerBroker?: TAccountMetas[9] | undefined;
    rentDestination: TAccountMetas[10];
    cosigner?: TAccountMetas[11] | undefined;
    tokenProgram: TAccountMetas[12];
    associatedTokenProgram: TAccountMetas[13];
    marketplaceProgram: TAccountMetas[14];
    systemProgram: TAccountMetas[15];
    metadata: TAccountMetas[16];
    edition: TAccountMetas[17];
    buyerTokenRecord?: TAccountMetas[18] | undefined;
    listTokenRecord?: TAccountMetas[19] | undefined;
    authorizationRules?: TAccountMetas[20] | undefined;
    authorizationRulesProgram?: TAccountMetas[21] | undefined;
    tokenMetadataProgram: TAccountMetas[22];
    sysvarInstructions: TAccountMetas[23];
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
  if (instruction.accounts.length < 24) {
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
      buyer: getNextAccount(),
      buyerAta: getNextAccount(),
      listAta: getNextAccount(),
      listState: getNextAccount(),
      mint: getNextAccount(),
      owner: getNextAccount(),
      payer: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      rentDestination: getNextAccount(),
      cosigner: getNextOptionalAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      metadata: getNextAccount(),
      edition: getNextAccount(),
      buyerTokenRecord: getNextOptionalAccount(),
      listTokenRecord: getNextOptionalAccount(),
      authorizationRules: getNextOptionalAccount(),
      authorizationRulesProgram: getNextOptionalAccount(),
      tokenMetadataProgram: getNextAccount(),
      sysvarInstructions: getNextAccount(),
    },
    data: getBuyLegacyInstructionDataDecoder().decode(instruction.data),
  };
}
