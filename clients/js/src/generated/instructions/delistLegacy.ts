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
  getOptionDecoder,
  getOptionEncoder,
  getStructDecoder,
  getStructEncoder,
  none,
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
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import {
  TokenStandard,
  resolveAuthorizationRulesProgramFromTokenStandard,
  resolveEditionFromTokenStandard,
  resolveListAta,
  resolveListTokenRecordFromTokenStandard,
  resolveMetadata,
  resolveOwnerAta,
  resolveOwnerTokenRecordFromTokenStandard,
  resolveSysvarInstructionsFromTokenStandard,
  resolveTokenMetadataProgramFromTokenStandard,
  type TokenStandardArgs,
} from '@tensor-foundation/resolvers';
import { findListStatePda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  expectAddress,
  expectSome,
  expectTransactionSigner,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';
import {
  getAuthorizationDataLocalDecoder,
  getAuthorizationDataLocalEncoder,
  type AuthorizationDataLocal,
  type AuthorizationDataLocalArgs,
} from '../types';

export type DelistLegacyInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountOwnerTa extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountListTa extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
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
  TAccountOwnerTokenRecord extends string | IAccountMeta<string> = string,
  TAccountListTokenRecord extends string | IAccountMeta<string> = string,
  TAccountAuthorizationRules extends string | IAccountMeta<string> = string,
  TAccountAuthorizationRulesProgram extends
    | string
    | IAccountMeta<string> = string,
  TAccountTokenMetadataProgram extends string | IAccountMeta<string> = string,
  TAccountSysvarInstructions extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountOwner extends string
        ? WritableAccount<TAccountOwner>
        : TAccountOwner,
      TAccountOwnerTa extends string
        ? WritableAccount<TAccountOwnerTa>
        : TAccountOwnerTa,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountListTa extends string
        ? WritableAccount<TAccountListTa>
        : TAccountListTa,
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      TAccountPayer extends string
        ? WritableAccount<TAccountPayer>
        : TAccountPayer,
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

export type DelistLegacyInstructionData = {
  discriminator: ReadonlyUint8Array;
  authorizationData: Option<AuthorizationDataLocal>;
};

export type DelistLegacyInstructionDataArgs = {
  authorizationData?: OptionOrNullable<AuthorizationDataLocalArgs>;
};

export function getDelistLegacyInstructionDataEncoder(): Encoder<DelistLegacyInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      [
        'authorizationData',
        getOptionEncoder(getAuthorizationDataLocalEncoder()),
      ],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([88, 35, 231, 184, 110, 218, 149, 23]),
      authorizationData: value.authorizationData ?? none(),
    })
  );
}

export function getDelistLegacyInstructionDataDecoder(): Decoder<DelistLegacyInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['authorizationData', getOptionDecoder(getAuthorizationDataLocalDecoder())],
  ]);
}

export function getDelistLegacyInstructionDataCodec(): Codec<
  DelistLegacyInstructionDataArgs,
  DelistLegacyInstructionData
> {
  return combineCodec(
    getDelistLegacyInstructionDataEncoder(),
    getDelistLegacyInstructionDataDecoder()
  );
}

export type DelistLegacyInstructionExtraArgs = {
  tokenStandard?: TokenStandardArgs;
};

export type DelistLegacyAsyncInput<
  TAccountOwner extends string = string,
  TAccountOwnerTa extends string = string,
  TAccountListState extends string = string,
  TAccountListTa extends string = string,
  TAccountMint extends string = string,
  TAccountRentDestination extends string = string,
  TAccountPayer extends string = string,
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
  owner: Address<TAccountOwner> | TransactionSigner<TAccountOwner>;
  ownerTa?: Address<TAccountOwnerTa>;
  listState?: Address<TAccountListState>;
  listTa?: Address<TAccountListTa>;
  mint: Address<TAccountMint>;
  rentDestination?: Address<TAccountRentDestination>;
  payer?: Address<TAccountPayer> | TransactionSigner<TAccountPayer>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  metadata?: Address<TAccountMetadata>;
  edition?: Address<TAccountEdition>;
  ownerTokenRecord?: Address<TAccountOwnerTokenRecord>;
  listTokenRecord?: Address<TAccountListTokenRecord>;
  authorizationRules?: Address<TAccountAuthorizationRules>;
  authorizationRulesProgram?: Address<TAccountAuthorizationRulesProgram>;
  tokenMetadataProgram?: Address<TAccountTokenMetadataProgram>;
  sysvarInstructions?: Address<TAccountSysvarInstructions>;
  authorizationData?: DelistLegacyInstructionDataArgs['authorizationData'];
  tokenStandard?: DelistLegacyInstructionExtraArgs['tokenStandard'];
};

export async function getDelistLegacyInstructionAsync<
  TAccountOwner extends string,
  TAccountOwnerTa extends string,
  TAccountListState extends string,
  TAccountListTa extends string,
  TAccountMint extends string,
  TAccountRentDestination extends string,
  TAccountPayer extends string,
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
  input: DelistLegacyAsyncInput<
    TAccountOwner,
    TAccountOwnerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountRentDestination,
    TAccountPayer,
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
): Promise<
  DelistLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
      ? WritableSignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
      : TAccountOwner,
    TAccountOwnerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountRentDestination,
    (typeof input)['payer'] extends TransactionSigner<TAccountPayer>
      ? WritableSignerAccount<TAccountPayer> & IAccountSignerMeta<TAccountPayer>
      : TAccountPayer,
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
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    owner: { value: input.owner ?? null, isWritable: true },
    ownerTa: { value: input.ownerTa ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    listTa: { value: input.listTa ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
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

  // Resolver scope.
  const resolverScope = { programAddress, accounts, args };

  // Resolve default values.
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
  }
  if (!accounts.ownerTa.value) {
    accounts.ownerTa = {
      ...accounts.ownerTa,
      ...(await resolveOwnerAta(resolverScope)),
    };
  }
  if (!accounts.listState.value) {
    accounts.listState.value = await findListStatePda({
      mint: expectAddress(accounts.mint.value),
    });
  }
  if (!accounts.listTa.value) {
    accounts.listTa = {
      ...accounts.listTa,
      ...(await resolveListAta(resolverScope)),
    };
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectTransactionSigner(
      accounts.owner.value
    ).address;
  }
  if (!accounts.payer.value) {
    accounts.payer.value = expectSome(accounts.owner.value);
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
    args.tokenStandard = TokenStandard.ProgrammableNonFungible;
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
    accounts.authorizationRulesProgram = {
      ...accounts.authorizationRulesProgram,
      ...resolveAuthorizationRulesProgramFromTokenStandard(resolverScope),
    };
  }
  if (!accounts.tokenMetadataProgram.value) {
    accounts.tokenMetadataProgram = {
      ...accounts.tokenMetadataProgram,
      ...resolveTokenMetadataProgramFromTokenStandard(resolverScope),
    };
  }
  if (!accounts.sysvarInstructions.value) {
    accounts.sysvarInstructions = {
      ...accounts.sysvarInstructions,
      ...resolveSysvarInstructionsFromTokenStandard(resolverScope),
    };
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerTa),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listTa),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.payer),
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
    data: getDelistLegacyInstructionDataEncoder().encode(
      args as DelistLegacyInstructionDataArgs
    ),
  } as DelistLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
      ? WritableSignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
      : TAccountOwner,
    TAccountOwnerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountRentDestination,
    (typeof input)['payer'] extends TransactionSigner<TAccountPayer>
      ? WritableSignerAccount<TAccountPayer> & IAccountSignerMeta<TAccountPayer>
      : TAccountPayer,
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

export type DelistLegacyInput<
  TAccountOwner extends string = string,
  TAccountOwnerTa extends string = string,
  TAccountListState extends string = string,
  TAccountListTa extends string = string,
  TAccountMint extends string = string,
  TAccountRentDestination extends string = string,
  TAccountPayer extends string = string,
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
  owner: Address<TAccountOwner> | TransactionSigner<TAccountOwner>;
  ownerTa: Address<TAccountOwnerTa>;
  listState: Address<TAccountListState>;
  listTa: Address<TAccountListTa>;
  mint: Address<TAccountMint>;
  rentDestination?: Address<TAccountRentDestination>;
  payer?: Address<TAccountPayer> | TransactionSigner<TAccountPayer>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  metadata: Address<TAccountMetadata>;
  edition: Address<TAccountEdition>;
  ownerTokenRecord?: Address<TAccountOwnerTokenRecord>;
  listTokenRecord?: Address<TAccountListTokenRecord>;
  authorizationRules?: Address<TAccountAuthorizationRules>;
  authorizationRulesProgram?: Address<TAccountAuthorizationRulesProgram>;
  tokenMetadataProgram?: Address<TAccountTokenMetadataProgram>;
  sysvarInstructions?: Address<TAccountSysvarInstructions>;
  authorizationData?: DelistLegacyInstructionDataArgs['authorizationData'];
  tokenStandard?: DelistLegacyInstructionExtraArgs['tokenStandard'];
};

export function getDelistLegacyInstruction<
  TAccountOwner extends string,
  TAccountOwnerTa extends string,
  TAccountListState extends string,
  TAccountListTa extends string,
  TAccountMint extends string,
  TAccountRentDestination extends string,
  TAccountPayer extends string,
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
  input: DelistLegacyInput<
    TAccountOwner,
    TAccountOwnerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountRentDestination,
    TAccountPayer,
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
): DelistLegacyInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
    ? WritableSignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
    : TAccountOwner,
  TAccountOwnerTa,
  TAccountListState,
  TAccountListTa,
  TAccountMint,
  TAccountRentDestination,
  (typeof input)['payer'] extends TransactionSigner<TAccountPayer>
    ? WritableSignerAccount<TAccountPayer> & IAccountSignerMeta<TAccountPayer>
    : TAccountPayer,
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
    owner: { value: input.owner ?? null, isWritable: true },
    ownerTa: { value: input.ownerTa ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    listTa: { value: input.listTa ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
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

  // Resolver scope.
  const resolverScope = { programAddress, accounts, args };

  // Resolve default values.
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' as Address<'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'>;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectTransactionSigner(
      accounts.owner.value
    ).address;
  }
  if (!accounts.payer.value) {
    accounts.payer.value = expectSome(accounts.owner.value);
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
    args.tokenStandard = TokenStandard.ProgrammableNonFungible;
  }
  if (!accounts.authorizationRulesProgram.value) {
    accounts.authorizationRulesProgram = {
      ...accounts.authorizationRulesProgram,
      ...resolveAuthorizationRulesProgramFromTokenStandard(resolverScope),
    };
  }
  if (!accounts.tokenMetadataProgram.value) {
    accounts.tokenMetadataProgram = {
      ...accounts.tokenMetadataProgram,
      ...resolveTokenMetadataProgramFromTokenStandard(resolverScope),
    };
  }
  if (!accounts.sysvarInstructions.value) {
    accounts.sysvarInstructions = {
      ...accounts.sysvarInstructions,
      ...resolveSysvarInstructionsFromTokenStandard(resolverScope),
    };
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerTa),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listTa),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.payer),
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
    data: getDelistLegacyInstructionDataEncoder().encode(
      args as DelistLegacyInstructionDataArgs
    ),
  } as DelistLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    (typeof input)['owner'] extends TransactionSigner<TAccountOwner>
      ? WritableSignerAccount<TAccountOwner> & IAccountSignerMeta<TAccountOwner>
      : TAccountOwner,
    TAccountOwnerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountRentDestination,
    (typeof input)['payer'] extends TransactionSigner<TAccountPayer>
      ? WritableSignerAccount<TAccountPayer> & IAccountSignerMeta<TAccountPayer>
      : TAccountPayer,
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

export type ParsedDelistLegacyInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    owner: TAccountMetas[0];
    ownerTa: TAccountMetas[1];
    listState: TAccountMetas[2];
    listTa: TAccountMetas[3];
    mint: TAccountMetas[4];
    rentDestination: TAccountMetas[5];
    payer: TAccountMetas[6];
    tokenProgram: TAccountMetas[7];
    associatedTokenProgram: TAccountMetas[8];
    marketplaceProgram: TAccountMetas[9];
    systemProgram: TAccountMetas[10];
    metadata: TAccountMetas[11];
    edition: TAccountMetas[12];
    ownerTokenRecord?: TAccountMetas[13] | undefined;
    listTokenRecord?: TAccountMetas[14] | undefined;
    authorizationRules?: TAccountMetas[15] | undefined;
    authorizationRulesProgram?: TAccountMetas[16] | undefined;
    tokenMetadataProgram?: TAccountMetas[17] | undefined;
    sysvarInstructions?: TAccountMetas[18] | undefined;
  };
  data: DelistLegacyInstructionData;
};

export function parseDelistLegacyInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedDelistLegacyInstruction<TProgram, TAccountMetas> {
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
      ownerTa: getNextAccount(),
      listState: getNextAccount(),
      listTa: getNextAccount(),
      mint: getNextAccount(),
      rentDestination: getNextAccount(),
      payer: getNextAccount(),
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
      tokenMetadataProgram: getNextOptionalAccount(),
      sysvarInstructions: getNextOptionalAccount(),
    },
    data: getDelistLegacyInstructionDataDecoder().decode(instruction.data),
  };
}
