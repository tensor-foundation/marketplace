/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Address,
  getAddressDecoder,
  getAddressEncoder,
} from '@solana/addresses';
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
import {
  TokenStandard,
  TokenStandardArgs,
  resolveEditionFromTokenStandard,
  resolveListAta,
  resolveListTokenRecordFromTokenStandard,
  resolveMetadata,
  resolveOwnerAta,
  resolveOwnerTokenRecordFromTokenStandard,
} from '../../hooked';
import { findListStatePda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  ResolvedAccount,
  expectAddress,
  expectSome,
  getAccountMetaFactory,
} from '../shared';
import {
  AuthorizationDataLocal,
  AuthorizationDataLocalArgs,
  getAuthorizationDataLocalDecoder,
  getAuthorizationDataLocalEncoder,
} from '../types';

export type ListLegacyInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountOwnerAta extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountListAta extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
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
      TAccountOwner extends string
        ? ReadonlySignerAccount<TAccountOwner> &
            IAccountSignerMeta<TAccountOwner>
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

export type ListLegacyInstructionData = {
  discriminator: Array<number>;
  amount: bigint;
  expireInSec: Option<bigint>;
  currency: Option<Address>;
  privateTaker: Option<Address>;
  makerBroker: Option<Address>;
  authorizationData: Option<AuthorizationDataLocal>;
};

export type ListLegacyInstructionDataArgs = {
  amount: number | bigint;
  expireInSec?: OptionOrNullable<number | bigint>;
  currency?: OptionOrNullable<Address>;
  privateTaker?: OptionOrNullable<Address>;
  makerBroker?: OptionOrNullable<Address>;
  authorizationData?: OptionOrNullable<AuthorizationDataLocalArgs>;
};

export function getListLegacyInstructionDataEncoder(): Encoder<ListLegacyInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['amount', getU64Encoder()],
      ['expireInSec', getOptionEncoder(getU64Encoder())],
      ['currency', getOptionEncoder(getAddressEncoder())],
      ['privateTaker', getOptionEncoder(getAddressEncoder())],
      ['makerBroker', getOptionEncoder(getAddressEncoder())],
      [
        'authorizationData',
        getOptionEncoder(getAuthorizationDataLocalEncoder()),
      ],
    ]),
    (value) => ({
      ...value,
      discriminator: [6, 110, 255, 18, 16, 36, 8, 30],
      expireInSec: value.expireInSec ?? none(),
      currency: value.currency ?? none(),
      privateTaker: value.privateTaker ?? none(),
      makerBroker: value.makerBroker ?? none(),
      authorizationData: value.authorizationData ?? none(),
    })
  );
}

export function getListLegacyInstructionDataDecoder(): Decoder<ListLegacyInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['amount', getU64Decoder()],
    ['expireInSec', getOptionDecoder(getU64Decoder())],
    ['currency', getOptionDecoder(getAddressDecoder())],
    ['privateTaker', getOptionDecoder(getAddressDecoder())],
    ['makerBroker', getOptionDecoder(getAddressDecoder())],
    ['authorizationData', getOptionDecoder(getAuthorizationDataLocalDecoder())],
  ]);
}

export function getListLegacyInstructionDataCodec(): Codec<
  ListLegacyInstructionDataArgs,
  ListLegacyInstructionData
> {
  return combineCodec(
    getListLegacyInstructionDataEncoder(),
    getListLegacyInstructionDataDecoder()
  );
}

export type ListLegacyInstructionExtraArgs = {
  tokenStandard?: TokenStandardArgs;
};

export type ListLegacyAsyncInput<
  TAccountOwner extends string = string,
  TAccountOwnerAta extends string = string,
  TAccountListState extends string = string,
  TAccountListAta extends string = string,
  TAccountMint extends string = string,
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
  owner: TransactionSigner<TAccountOwner>;
  ownerAta?: Address<TAccountOwnerAta>;
  listState?: Address<TAccountListState>;
  listAta?: Address<TAccountListAta>;
  mint: Address<TAccountMint>;
  payer?: TransactionSigner<TAccountPayer>;
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
  amount: ListLegacyInstructionDataArgs['amount'];
  expireInSec?: ListLegacyInstructionDataArgs['expireInSec'];
  currency?: ListLegacyInstructionDataArgs['currency'];
  privateTaker?: ListLegacyInstructionDataArgs['privateTaker'];
  makerBroker?: ListLegacyInstructionDataArgs['makerBroker'];
  authorizationData?: ListLegacyInstructionDataArgs['authorizationData'];
  tokenStandard?: ListLegacyInstructionExtraArgs['tokenStandard'];
};

export async function getListLegacyInstructionAsync<
  TAccountOwner extends string,
  TAccountOwnerAta extends string,
  TAccountListState extends string,
  TAccountListAta extends string,
  TAccountMint extends string,
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
  input: ListLegacyAsyncInput<
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
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
  ListLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
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
    accounts.sysvarInstructions.value =
      'Sysvar1nstructions1111111111111111111111111' as Address<'Sysvar1nstructions1111111111111111111111111'>;
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
    data: getListLegacyInstructionDataEncoder().encode(
      args as ListLegacyInstructionDataArgs
    ),
  } as ListLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
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
  >;

  return instruction;
}

export type ListLegacyInput<
  TAccountOwner extends string = string,
  TAccountOwnerAta extends string = string,
  TAccountListState extends string = string,
  TAccountListAta extends string = string,
  TAccountMint extends string = string,
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
  owner: TransactionSigner<TAccountOwner>;
  ownerAta: Address<TAccountOwnerAta>;
  listState: Address<TAccountListState>;
  listAta: Address<TAccountListAta>;
  mint: Address<TAccountMint>;
  payer?: TransactionSigner<TAccountPayer>;
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
  amount: ListLegacyInstructionDataArgs['amount'];
  expireInSec?: ListLegacyInstructionDataArgs['expireInSec'];
  currency?: ListLegacyInstructionDataArgs['currency'];
  privateTaker?: ListLegacyInstructionDataArgs['privateTaker'];
  makerBroker?: ListLegacyInstructionDataArgs['makerBroker'];
  authorizationData?: ListLegacyInstructionDataArgs['authorizationData'];
  tokenStandard?: ListLegacyInstructionExtraArgs['tokenStandard'];
};

export function getListLegacyInstruction<
  TAccountOwner extends string,
  TAccountOwnerAta extends string,
  TAccountListState extends string,
  TAccountListAta extends string,
  TAccountMint extends string,
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
  input: ListLegacyInput<
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
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
): ListLegacyInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner,
  TAccountOwnerAta,
  TAccountListState,
  TAccountListAta,
  TAccountMint,
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

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerAta),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listAta),
      getAccountMeta(accounts.mint),
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
    data: getListLegacyInstructionDataEncoder().encode(
      args as ListLegacyInstructionDataArgs
    ),
  } as ListLegacyInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
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
  >;

  return instruction;
}

export type ParsedListLegacyInstruction<
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
    tokenProgram: TAccountMetas[6];
    associatedTokenProgram: TAccountMetas[7];
    marketplaceProgram: TAccountMetas[8];
    systemProgram: TAccountMetas[9];
    metadata: TAccountMetas[10];
    edition: TAccountMetas[11];
    ownerTokenRecord?: TAccountMetas[12] | undefined;
    listTokenRecord?: TAccountMetas[13] | undefined;
    authorizationRules?: TAccountMetas[14] | undefined;
    authorizationRulesProgram?: TAccountMetas[15] | undefined;
    tokenMetadataProgram: TAccountMetas[16];
    sysvarInstructions: TAccountMetas[17];
  };
  data: ListLegacyInstructionData;
};

export function parseListLegacyInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedListLegacyInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 18) {
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
    data: getListLegacyInstructionDataDecoder().decode(instruction.data),
  };
}
