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
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { ResolvedAccount, getAccountMetaFactory } from '../shared';

export type ListWnsInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountOwnerToken extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountListToken extends string | IAccountMeta<string> = string,
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
  TAccountWnsProgram extends string | IAccountMeta<string> = string,
  TAccountWnsDistributionProgram extends string | IAccountMeta<string> = string,
  TAccountExtraMetas extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountOwner extends string
        ? ReadonlySignerAccount<TAccountOwner> &
            IAccountSignerMeta<TAccountOwner>
        : TAccountOwner,
      TAccountOwnerToken extends string
        ? WritableAccount<TAccountOwnerToken>
        : TAccountOwnerToken,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountListToken extends string
        ? WritableAccount<TAccountListToken>
        : TAccountListToken,
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
      ...TRemainingAccounts,
    ]
  >;

export type ListWnsInstructionData = {
  discriminator: Array<number>;
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
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['amount', getU64Encoder()],
      ['expireInSec', getOptionEncoder(getU64Encoder())],
      ['currency', getOptionEncoder(getAddressEncoder())],
      ['privateTaker', getOptionEncoder(getAddressEncoder())],
      ['makerBroker', getOptionEncoder(getAddressEncoder())],
    ]),
    (value) => ({
      ...value,
      discriminator: [23, 202, 102, 138, 255, 190, 39, 196],
      expireInSec: value.expireInSec ?? none(),
      currency: value.currency ?? none(),
      privateTaker: value.privateTaker ?? none(),
      makerBroker: value.makerBroker ?? none(),
    })
  );
}

export function getListWnsInstructionDataDecoder(): Decoder<ListWnsInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
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

export type ListWnsInput<
  TAccountOwner extends string = string,
  TAccountOwnerToken extends string = string,
  TAccountListState extends string = string,
  TAccountListToken extends string = string,
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
> = {
  owner: TransactionSigner<TAccountOwner>;
  ownerToken: Address<TAccountOwnerToken>;
  listState: Address<TAccountListState>;
  /** Implicitly checked via transfer. Will fail if wrong account */
  listToken: Address<TAccountListToken>;
  mint: Address<TAccountMint>;
  payer: TransactionSigner<TAccountPayer>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  approve: Address<TAccountApprove>;
  distribution: Address<TAccountDistribution>;
  wnsProgram: Address<TAccountWnsProgram>;
  wnsDistributionProgram: Address<TAccountWnsDistributionProgram>;
  extraMetas: Address<TAccountExtraMetas>;
  amount: ListWnsInstructionDataArgs['amount'];
  expireInSec?: ListWnsInstructionDataArgs['expireInSec'];
  currency?: ListWnsInstructionDataArgs['currency'];
  privateTaker?: ListWnsInstructionDataArgs['privateTaker'];
  makerBroker?: ListWnsInstructionDataArgs['makerBroker'];
};

export function getListWnsInstruction<
  TAccountOwner extends string,
  TAccountOwnerToken extends string,
  TAccountListState extends string,
  TAccountListToken extends string,
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
>(
  input: ListWnsInput<
    TAccountOwner,
    TAccountOwnerToken,
    TAccountListState,
    TAccountListToken,
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
    TAccountExtraMetas
  >
): ListWnsInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner,
  TAccountOwnerToken,
  TAccountListState,
  TAccountListToken,
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
  TAccountExtraMetas
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    owner: { value: input.owner ?? null, isWritable: false },
    ownerToken: { value: input.ownerToken ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    listToken: { value: input.listToken ?? null, isWritable: true },
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
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerToken),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listToken),
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
    ],
    programAddress,
    data: getListWnsInstructionDataEncoder().encode(
      args as ListWnsInstructionDataArgs
    ),
  } as ListWnsInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerToken,
    TAccountListState,
    TAccountListToken,
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
    TAccountExtraMetas
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
    ownerToken: TAccountMetas[1];
    listState: TAccountMetas[2];
    /** Implicitly checked via transfer. Will fail if wrong account */
    listToken: TAccountMetas[3];
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
  if (instruction.accounts.length < 15) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      owner: getNextAccount(),
      ownerToken: getNextAccount(),
      listState: getNextAccount(),
      listToken: getNextAccount(),
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
    },
    data: getListWnsInstructionDataDecoder().decode(instruction.data),
  };
}
