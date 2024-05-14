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
  WritableAccount,
  WritableSignerAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import {
  TokenStandard,
  TokenStandardArgs,
  resolveEditionFromTokenStandard,
  resolveListAta,
  resolveListTokenRecordFromTokenStandard,
  resolveMetadata,
  resolveOwnerAta,
  resolveOwnerTokenRecordFromTokenStandard,
} from '@tensor-foundation/resolvers';
import { findListStatePda } from '../pdas';
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

export type CloseExpiredListingLegacyInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountOwnerAta extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountListAta extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
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
  TAccountSysvarInstructions extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountOwner extends string
        ? ReadonlyAccount<TAccountOwner>
        : TAccountOwner,
      TAccountOwnerAta extends string
        ? WritableAccount<TAccountOwnerAta>
        : TAccountOwnerAta,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountListAta extends string
        ? WritableAccount<TAccountListAta>
        : TAccountListAta,
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
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

export type CloseExpiredListingLegacyInstructionData = {
  discriminator: Array<number>;
  authorizationData: Option<AuthorizationDataLocal>;
};

export type CloseExpiredListingLegacyInstructionDataArgs = {
  authorizationData?: OptionOrNullable<AuthorizationDataLocalArgs>;
};

export function getCloseExpiredListingLegacyInstructionDataEncoder(): Encoder<CloseExpiredListingLegacyInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      [
        'authorizationData',
        getOptionEncoder(getAuthorizationDataLocalEncoder()),
      ],
    ]),
    (value) => ({
      ...value,
      discriminator: [56, 16, 96, 188, 55, 68, 250, 58],
      authorizationData: value.authorizationData ?? none(),
    })
  );
}

export function getCloseExpiredListingLegacyInstructionDataDecoder(): Decoder<CloseExpiredListingLegacyInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['authorizationData', getOptionDecoder(getAuthorizationDataLocalDecoder())],
  ]);
}

export function getCloseExpiredListingLegacyInstructionDataCodec(): Codec<
  CloseExpiredListingLegacyInstructionDataArgs,
  CloseExpiredListingLegacyInstructionData
> {
  return combineCodec(
    getCloseExpiredListingLegacyInstructionDataEncoder(),
    getCloseExpiredListingLegacyInstructionDataDecoder()
  );
}

export type CloseExpiredListingLegacyInstructionExtraArgs = {
  tokenStandard?: TokenStandardArgs;
};

export type CloseExpiredListingLegacyAsyncInput<
  TAccountOwner extends string = string,
  TAccountOwnerAta extends string = string,
  TAccountListState extends string = string,
  TAccountListAta extends string = string,
  TAccountMint extends string = string,
  TAccountPayer extends string = string,
  TAccountRentDestination extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountMetadata extends string = string,
  TAccountEdition extends string = string,
  TAccountOwnerTokenRecord extends string = string,
  TAccountListTokenRecord extends string = string,
  TAccountAuthorizationRules extends string = string,
  TAccountAuthorizationRulesProgram extends string = string,
  TAccountTokenMetadataProgram extends string = string,
  TAccountSysvarInstructions extends string = string,
> = {
  owner?: Address<TAccountOwner>;
  ownerAta?: Address<TAccountOwnerAta>;
  listState?: Address<TAccountListState>;
  listAta?: Address<TAccountListAta>;
  mint: Address<TAccountMint>;
  payer: TransactionSigner<TAccountPayer>;
  rentDestination?: Address<TAccountRentDestination>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  metadata?: Address<TAccountMetadata>;
  edition?: Address<TAccountEdition>;
  ownerTokenRecord?: Address<TAccountOwnerTokenRecord>;
  listTokenRecord?: Address<TAccountListTokenRecord>;
  authorizationRules?: Address<TAccountAuthorizationRules>;
  authorizationRulesProgram?: Address<TAccountAuthorizationRulesProgram>;
  tokenMetadataProgram?: Address<TAccountTokenMetadataProgram>;
  sysvarInstructions?: Address<TAccountSysvarInstructions>;
  authorizationData?: CloseExpiredListingLegacyInstructionDataArgs['authorizationData'];
  tokenStandard?: CloseExpiredListingLegacyInstructionExtraArgs['tokenStandard'];
};

export async function getCloseExpiredListingLegacyInstructionAsync<
  TAccountOwner extends string,
  TAccountOwnerAta extends string,
  TAccountListState extends string,
  TAccountListAta extends string,
  TAccountMint extends string,
  TAccountPayer extends string,
  TAccountRentDestination extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountMetadata extends string,
  TAccountEdition extends string,
  TAccountOwnerTokenRecord extends string,
  TAccountListTokenRecord extends string,
  TAccountAuthorizationRules extends string,
  TAccountAuthorizationRulesProgram extends string,
  TAccountTokenMetadataProgram extends string,
  TAccountSysvarInstructions extends string,
>(
  input: CloseExpiredListingLegacyAsyncInput<
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
    TAccountPayer,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountMetadata,
    TAccountEdition,
    TAccountOwnerTokenRecord,
    TAccountListTokenRecord,
    TAccountAuthorizationRules,
    TAccountAuthorizationRulesProgram,
    TAccountTokenMetadataProgram,
    TAccountSysvarInstructions
  >
): Promise<
  CloseExpiredListingLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
    TAccountPayer,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountMetadata,
    TAccountEdition,
    TAccountOwnerTokenRecord,
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
    owner: { value: input.owner ?? null, isWritable: false },
    ownerAta: { value: input.ownerAta ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    listAta: { value: input.listAta ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
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

  // Resolver scope.
  const resolverScope = { programAddress, accounts, args };

  // Resolve default values.
  if (!accounts.owner.value) {
    accounts.owner.value = expectTransactionSigner(
      accounts.payer.value
    ).address;
  }
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
  }
  if (!accounts.ownerAta.value) {
    accounts.ownerAta = {
      ...accounts.ownerAta,
      ...(await resolveOwnerAta(resolverScope)),
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
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
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
  if (!accounts.ownerTokenRecord.value) {
    accounts.ownerTokenRecord = {
      ...accounts.ownerTokenRecord,
      ...(await resolveOwnerTokenRecordFromTokenStandard(resolverScope)),
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
    if (args.tokenStandard === TokenStandard.ProgrammableNonFungible) {
      accounts.sysvarInstructions.value =
        'Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>;
    } else {
      if (args.tokenStandard === TokenStandard.ProgrammableNonFungibleEdition) {
        accounts.sysvarInstructions.value =
          'Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>;
      }
    }
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerAta),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listAta),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
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
    data: getCloseExpiredListingLegacyInstructionDataEncoder().encode(
      args as CloseExpiredListingLegacyInstructionDataArgs
    ),
  } as CloseExpiredListingLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
    TAccountPayer,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
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

export type CloseExpiredListingLegacyInput<
  TAccountOwner extends string = string,
  TAccountOwnerAta extends string = string,
  TAccountListState extends string = string,
  TAccountListAta extends string = string,
  TAccountMint extends string = string,
  TAccountPayer extends string = string,
  TAccountRentDestination extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountMetadata extends string = string,
  TAccountEdition extends string = string,
  TAccountOwnerTokenRecord extends string = string,
  TAccountListTokenRecord extends string = string,
  TAccountAuthorizationRules extends string = string,
  TAccountAuthorizationRulesProgram extends string = string,
  TAccountTokenMetadataProgram extends string = string,
  TAccountSysvarInstructions extends string = string,
> = {
  owner?: Address<TAccountOwner>;
  ownerAta: Address<TAccountOwnerAta>;
  listState: Address<TAccountListState>;
  listAta: Address<TAccountListAta>;
  mint: Address<TAccountMint>;
  payer: TransactionSigner<TAccountPayer>;
  rentDestination?: Address<TAccountRentDestination>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  metadata: Address<TAccountMetadata>;
  edition: Address<TAccountEdition>;
  ownerTokenRecord?: Address<TAccountOwnerTokenRecord>;
  listTokenRecord?: Address<TAccountListTokenRecord>;
  authorizationRules?: Address<TAccountAuthorizationRules>;
  authorizationRulesProgram?: Address<TAccountAuthorizationRulesProgram>;
  tokenMetadataProgram?: Address<TAccountTokenMetadataProgram>;
  sysvarInstructions?: Address<TAccountSysvarInstructions>;
  authorizationData?: CloseExpiredListingLegacyInstructionDataArgs['authorizationData'];
  tokenStandard?: CloseExpiredListingLegacyInstructionExtraArgs['tokenStandard'];
};

export function getCloseExpiredListingLegacyInstruction<
  TAccountOwner extends string,
  TAccountOwnerAta extends string,
  TAccountListState extends string,
  TAccountListAta extends string,
  TAccountMint extends string,
  TAccountPayer extends string,
  TAccountRentDestination extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountMetadata extends string,
  TAccountEdition extends string,
  TAccountOwnerTokenRecord extends string,
  TAccountListTokenRecord extends string,
  TAccountAuthorizationRules extends string,
  TAccountAuthorizationRulesProgram extends string,
  TAccountTokenMetadataProgram extends string,
  TAccountSysvarInstructions extends string,
>(
  input: CloseExpiredListingLegacyInput<
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
    TAccountPayer,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountMetadata,
    TAccountEdition,
    TAccountOwnerTokenRecord,
    TAccountListTokenRecord,
    TAccountAuthorizationRules,
    TAccountAuthorizationRulesProgram,
    TAccountTokenMetadataProgram,
    TAccountSysvarInstructions
  >
): CloseExpiredListingLegacyInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner,
  TAccountOwnerAta,
  TAccountListState,
  TAccountListAta,
  TAccountMint,
  TAccountPayer,
  TAccountRentDestination,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountSystemProgram,
  TAccountMarketplaceProgram,
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
    owner: { value: input.owner ?? null, isWritable: false },
    ownerAta: { value: input.ownerAta ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    listAta: { value: input.listAta ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
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
  if (!accounts.owner.value) {
    accounts.owner.value = expectTransactionSigner(
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
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
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
    if (args.tokenStandard === TokenStandard.ProgrammableNonFungible) {
      accounts.sysvarInstructions.value =
        'Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>;
    } else {
      if (args.tokenStandard === TokenStandard.ProgrammableNonFungibleEdition) {
        accounts.sysvarInstructions.value =
          'Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>;
      }
    }
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerAta),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listAta),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
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
    data: getCloseExpiredListingLegacyInstructionDataEncoder().encode(
      args as CloseExpiredListingLegacyInstructionDataArgs
    ),
  } as CloseExpiredListingLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
    TAccountPayer,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
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

export type ParsedCloseExpiredListingLegacyInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    owner: TAccountMetas[0];
    ownerAta: TAccountMetas[1];
    listState: TAccountMetas[2];
    listAta: TAccountMetas[3];
    mint: TAccountMetas[4];
    payer: TAccountMetas[5];
    rentDestination: TAccountMetas[6];
    tokenProgram: TAccountMetas[7];
    associatedTokenProgram: TAccountMetas[8];
    systemProgram: TAccountMetas[9];
    marketplaceProgram: TAccountMetas[10];
    metadata: TAccountMetas[11];
    edition: TAccountMetas[12];
    ownerTokenRecord?: TAccountMetas[13] | undefined;
    listTokenRecord?: TAccountMetas[14] | undefined;
    authorizationRules?: TAccountMetas[15] | undefined;
    authorizationRulesProgram?: TAccountMetas[16] | undefined;
    tokenMetadataProgram: TAccountMetas[17];
    sysvarInstructions?: TAccountMetas[18] | undefined;
  };
  data: CloseExpiredListingLegacyInstructionData;
};

export function parseCloseExpiredListingLegacyInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCloseExpiredListingLegacyInstruction<TProgram, TAccountMetas> {
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
      owner: getNextAccount(),
      ownerAta: getNextAccount(),
      listState: getNextAccount(),
      listAta: getNextAccount(),
      mint: getNextAccount(),
      payer: getNextAccount(),
      rentDestination: getNextAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      metadata: getNextAccount(),
      edition: getNextAccount(),
      ownerTokenRecord: getNextOptionalAccount(),
      listTokenRecord: getNextOptionalAccount(),
      authorizationRules: getNextOptionalAccount(),
      authorizationRulesProgram: getNextOptionalAccount(),
      tokenMetadataProgram: getNextAccount(),
      sysvarInstructions: getNextOptionalAccount(),
    },
    data: getCloseExpiredListingLegacyInstructionDataDecoder().decode(
      instruction.data
    ),
  };
}
