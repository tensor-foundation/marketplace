/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  AccountRole,
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getAddressDecoder,
  getAddressEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getOptionDecoder,
  getOptionEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
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
  type ReadonlySignerAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import {
  resolveListAta,
  resolveOwnerAta,
  resolveWnsApprovePda,
  resolveWnsExtraAccountMetasPda,
} from '@tensor-foundation/resolvers';
import { findListStatePda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  expectAddress,
  expectSome,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export type ListWnsInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountOwnerTa extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountListTa extends string | IAccountMeta<string> = string,
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
  TAccountApprove extends string | IAccountMeta<string> = string,
  TAccountDistribution extends string | IAccountMeta<string> = string,
  TAccountWnsProgram extends
    | string
    | IAccountMeta<string> = 'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM',
  TAccountWnsDistributionProgram extends
    | string
    | IAccountMeta<string> = 'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay',
  TAccountExtraMetas extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountOwner extends string
        ? ReadonlySignerAccount<TAccountOwner> &
            IAccountSignerMeta<TAccountOwner>
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
      TAccountApprove extends string
        ? WritableAccount<TAccountApprove>
        : TAccountApprove,
      TAccountDistribution extends string
        ? WritableAccount<TAccountDistribution>
        : TAccountDistribution,
      TAccountWnsProgram extends string
        ? ReadonlyAccount<TAccountWnsProgram>
        : TAccountWnsProgram,
      TAccountWnsDistributionProgram extends string
        ? ReadonlyAccount<TAccountWnsDistributionProgram>
        : TAccountWnsDistributionProgram,
      TAccountExtraMetas extends string
        ? ReadonlyAccount<TAccountExtraMetas>
        : TAccountExtraMetas,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      ...TRemainingAccounts,
    ]
  >;

export type ListWnsInstructionData = {
  discriminator: ReadonlyUint8Array;
  amount: bigint;
  expireInSec: Option<bigint>;
  currency: Option<Address>;
  privateTaker: Option<Address>;
  makerBroker: Option<Address>;
};

export type ListWnsInstructionDataArgs = {
  amount: number | bigint;
  expireInSec?: OptionOrNullable<number | bigint>;
  currency?: OptionOrNullable<Address>;
  privateTaker?: OptionOrNullable<Address>;
  makerBroker?: OptionOrNullable<Address>;
};

export function getListWnsInstructionDataEncoder(): Encoder<ListWnsInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['amount', getU64Encoder()],
      ['expireInSec', getOptionEncoder(getU64Encoder())],
      ['currency', getOptionEncoder(getAddressEncoder())],
      ['privateTaker', getOptionEncoder(getAddressEncoder())],
      ['makerBroker', getOptionEncoder(getAddressEncoder())],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([23, 202, 102, 138, 255, 190, 39, 196]),
      expireInSec: value.expireInSec ?? none(),
      currency: value.currency ?? none(),
      privateTaker: value.privateTaker ?? none(),
      makerBroker: value.makerBroker ?? none(),
    })
  );
}

export function getListWnsInstructionDataDecoder(): Decoder<ListWnsInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['amount', getU64Decoder()],
    ['expireInSec', getOptionDecoder(getU64Decoder())],
    ['currency', getOptionDecoder(getAddressDecoder())],
    ['privateTaker', getOptionDecoder(getAddressDecoder())],
    ['makerBroker', getOptionDecoder(getAddressDecoder())],
  ]);
}

export function getListWnsInstructionDataCodec(): Codec<
  ListWnsInstructionDataArgs,
  ListWnsInstructionData
> {
  return combineCodec(
    getListWnsInstructionDataEncoder(),
    getListWnsInstructionDataDecoder()
  );
}

export type ListWnsAsyncInput<
  TAccountOwner extends string = string,
  TAccountOwnerTa extends string = string,
  TAccountListState extends string = string,
  TAccountListTa extends string = string,
  TAccountMint extends string = string,
  TAccountPayer extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountApprove extends string = string,
  TAccountDistribution extends string = string,
  TAccountWnsProgram extends string = string,
  TAccountWnsDistributionProgram extends string = string,
  TAccountExtraMetas extends string = string,
  TAccountCosigner extends string = string,
> = {
  owner: TransactionSigner<TAccountOwner>;
  ownerTa?: Address<TAccountOwnerTa>;
  listState?: Address<TAccountListState>;
  listTa?: Address<TAccountListTa>;
  mint: Address<TAccountMint>;
  payer?: TransactionSigner<TAccountPayer>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  approve?: Address<TAccountApprove>;
  distribution: Address<TAccountDistribution>;
  wnsProgram?: Address<TAccountWnsProgram>;
  wnsDistributionProgram?: Address<TAccountWnsDistributionProgram>;
  extraMetas?: Address<TAccountExtraMetas>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  amount: ListWnsInstructionDataArgs['amount'];
  expireInSec?: ListWnsInstructionDataArgs['expireInSec'];
  currency?: ListWnsInstructionDataArgs['currency'];
  privateTaker?: ListWnsInstructionDataArgs['privateTaker'];
  makerBroker?: ListWnsInstructionDataArgs['makerBroker'];
  transferHookAccounts: Array<Address>;
};

export async function getListWnsInstructionAsync<
  TAccountOwner extends string,
  TAccountOwnerTa extends string,
  TAccountListState extends string,
  TAccountListTa extends string,
  TAccountMint extends string,
  TAccountPayer extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountApprove extends string,
  TAccountDistribution extends string,
  TAccountWnsProgram extends string,
  TAccountWnsDistributionProgram extends string,
  TAccountExtraMetas extends string,
  TAccountCosigner extends string,
>(
  input: ListWnsAsyncInput<
    TAccountOwner,
    TAccountOwnerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountPayer,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountWnsDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >
): Promise<
  ListWnsInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountPayer,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountWnsDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    owner: { value: input.owner ?? null, isWritable: false },
    ownerTa: { value: input.ownerTa ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    listTa: { value: input.listTa ?? null, isWritable: true },
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
    approve: { value: input.approve ?? null, isWritable: true },
    distribution: { value: input.distribution ?? null, isWritable: true },
    wnsProgram: { value: input.wnsProgram ?? null, isWritable: false },
    wnsDistributionProgram: {
      value: input.wnsDistributionProgram ?? null,
      isWritable: false,
    },
    extraMetas: { value: input.extraMetas ?? null, isWritable: false },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
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
  if (!accounts.approve.value) {
    accounts.approve = {
      ...accounts.approve,
      ...(await resolveWnsApprovePda(resolverScope)),
    };
  }
  if (!accounts.wnsProgram.value) {
    accounts.wnsProgram.value =
      'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM' as Address<'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM'>;
  }
  if (!accounts.wnsDistributionProgram.value) {
    accounts.wnsDistributionProgram.value =
      'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay' as Address<'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay'>;
  }
  if (!accounts.extraMetas.value) {
    accounts.extraMetas = {
      ...accounts.extraMetas,
      ...(await resolveWnsExtraAccountMetasPda(resolverScope)),
    };
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = args.transferHookAccounts.map(
    (address) => ({ address, role: AccountRole.READONLY })
  );

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerTa),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listTa),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.approve),
      getAccountMeta(accounts.distribution),
      getAccountMeta(accounts.wnsProgram),
      getAccountMeta(accounts.wnsDistributionProgram),
      getAccountMeta(accounts.extraMetas),
      getAccountMeta(accounts.cosigner),
      ...remainingAccounts,
    ],
    programAddress,
    data: getListWnsInstructionDataEncoder().encode(
      args as ListWnsInstructionDataArgs
    ),
  } as ListWnsInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountPayer,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountWnsDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >;

  return instruction;
}

export type ListWnsInput<
  TAccountOwner extends string = string,
  TAccountOwnerTa extends string = string,
  TAccountListState extends string = string,
  TAccountListTa extends string = string,
  TAccountMint extends string = string,
  TAccountPayer extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountApprove extends string = string,
  TAccountDistribution extends string = string,
  TAccountWnsProgram extends string = string,
  TAccountWnsDistributionProgram extends string = string,
  TAccountExtraMetas extends string = string,
  TAccountCosigner extends string = string,
> = {
  owner: TransactionSigner<TAccountOwner>;
  ownerTa: Address<TAccountOwnerTa>;
  listState: Address<TAccountListState>;
  listTa: Address<TAccountListTa>;
  mint: Address<TAccountMint>;
  payer?: TransactionSigner<TAccountPayer>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  approve: Address<TAccountApprove>;
  distribution: Address<TAccountDistribution>;
  wnsProgram?: Address<TAccountWnsProgram>;
  wnsDistributionProgram?: Address<TAccountWnsDistributionProgram>;
  extraMetas: Address<TAccountExtraMetas>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  amount: ListWnsInstructionDataArgs['amount'];
  expireInSec?: ListWnsInstructionDataArgs['expireInSec'];
  currency?: ListWnsInstructionDataArgs['currency'];
  privateTaker?: ListWnsInstructionDataArgs['privateTaker'];
  makerBroker?: ListWnsInstructionDataArgs['makerBroker'];
  transferHookAccounts: Array<Address>;
};

export function getListWnsInstruction<
  TAccountOwner extends string,
  TAccountOwnerTa extends string,
  TAccountListState extends string,
  TAccountListTa extends string,
  TAccountMint extends string,
  TAccountPayer extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountApprove extends string,
  TAccountDistribution extends string,
  TAccountWnsProgram extends string,
  TAccountWnsDistributionProgram extends string,
  TAccountExtraMetas extends string,
  TAccountCosigner extends string,
>(
  input: ListWnsInput<
    TAccountOwner,
    TAccountOwnerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountPayer,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountWnsDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >
): ListWnsInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner,
  TAccountOwnerTa,
  TAccountListState,
  TAccountListTa,
  TAccountMint,
  TAccountPayer,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountMarketplaceProgram,
  TAccountSystemProgram,
  TAccountApprove,
  TAccountDistribution,
  TAccountWnsProgram,
  TAccountWnsDistributionProgram,
  TAccountExtraMetas,
  TAccountCosigner
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    owner: { value: input.owner ?? null, isWritable: false },
    ownerTa: { value: input.ownerTa ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    listTa: { value: input.listTa ?? null, isWritable: true },
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
    approve: { value: input.approve ?? null, isWritable: true },
    distribution: { value: input.distribution ?? null, isWritable: true },
    wnsProgram: { value: input.wnsProgram ?? null, isWritable: false },
    wnsDistributionProgram: {
      value: input.wnsDistributionProgram ?? null,
      isWritable: false,
    },
    extraMetas: { value: input.extraMetas ?? null, isWritable: false },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
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
  if (!accounts.wnsProgram.value) {
    accounts.wnsProgram.value =
      'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM' as Address<'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM'>;
  }
  if (!accounts.wnsDistributionProgram.value) {
    accounts.wnsDistributionProgram.value =
      'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay' as Address<'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay'>;
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = args.transferHookAccounts.map(
    (address) => ({ address, role: AccountRole.READONLY })
  );

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerTa),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listTa),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.approve),
      getAccountMeta(accounts.distribution),
      getAccountMeta(accounts.wnsProgram),
      getAccountMeta(accounts.wnsDistributionProgram),
      getAccountMeta(accounts.extraMetas),
      getAccountMeta(accounts.cosigner),
      ...remainingAccounts,
    ],
    programAddress,
    data: getListWnsInstructionDataEncoder().encode(
      args as ListWnsInstructionDataArgs
    ),
  } as ListWnsInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountPayer,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountApprove,
    TAccountDistribution,
    TAccountWnsProgram,
    TAccountWnsDistributionProgram,
    TAccountExtraMetas,
    TAccountCosigner
  >;

  return instruction;
}

export type ParsedListWnsInstruction<
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
    payer: TAccountMetas[5];
    tokenProgram: TAccountMetas[6];
    associatedTokenProgram: TAccountMetas[7];
    marketplaceProgram: TAccountMetas[8];
    systemProgram: TAccountMetas[9];
    approve: TAccountMetas[10];
    distribution: TAccountMetas[11];
    wnsProgram: TAccountMetas[12];
    wnsDistributionProgram: TAccountMetas[13];
    extraMetas: TAccountMetas[14];
    cosigner?: TAccountMetas[15] | undefined;
  };
  data: ListWnsInstructionData;
};

export function parseListWnsInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedListWnsInstruction<TProgram, TAccountMetas> {
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
      owner: getNextAccount(),
      ownerTa: getNextAccount(),
      listState: getNextAccount(),
      listTa: getNextAccount(),
      mint: getNextAccount(),
      payer: getNextAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      approve: getNextAccount(),
      distribution: getNextAccount(),
      wnsProgram: getNextAccount(),
      wnsDistributionProgram: getNextAccount(),
      extraMetas: getNextAccount(),
      cosigner: getNextOptionalAccount(),
    },
    data: getListWnsInstructionDataDecoder().decode(instruction.data),
  };
}
