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

export type DelistWnsInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountOwnerToken extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountListToken extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
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
      TAccountRentDestination extends string
        ? WritableSignerAccount<TAccountRentDestination> &
            IAccountSignerMeta<TAccountRentDestination>
        : TAccountRentDestination,
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

export type DelistWnsInstructionData = { discriminator: Array<number> };

export type DelistWnsInstructionDataArgs = {};

export function getDelistWnsInstructionDataEncoder(): Encoder<DelistWnsInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
    ]),
    (value) => ({
      ...value,
      discriminator: [172, 171, 57, 16, 74, 158, 32, 57],
    })
  );
}

export function getDelistWnsInstructionDataDecoder(): Decoder<DelistWnsInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
  ]);
}

export function getDelistWnsInstructionDataCodec(): Codec<
  DelistWnsInstructionDataArgs,
  DelistWnsInstructionData
> {
  return combineCodec(
    getDelistWnsInstructionDataEncoder(),
    getDelistWnsInstructionDataDecoder()
  );
}

export type DelistWnsInput<
  TAccountOwner extends string = string,
  TAccountOwnerToken extends string = string,
  TAccountListState extends string = string,
  TAccountListToken extends string = string,
  TAccountMint extends string = string,
  TAccountRentDestination extends string = string,
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
  listToken: Address<TAccountListToken>;
  mint: Address<TAccountMint>;
  rentDestination: TransactionSigner<TAccountRentDestination>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  approve: Address<TAccountApprove>;
  distribution: Address<TAccountDistribution>;
  wnsProgram: Address<TAccountWnsProgram>;
  wnsDistributionProgram: Address<TAccountWnsDistributionProgram>;
  extraMetas: Address<TAccountExtraMetas>;
};

export function getDelistWnsInstruction<
  TAccountOwner extends string,
  TAccountOwnerToken extends string,
  TAccountListState extends string,
  TAccountListToken extends string,
  TAccountMint extends string,
  TAccountRentDestination extends string,
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
  input: DelistWnsInput<
    TAccountOwner,
    TAccountOwnerToken,
    TAccountListState,
    TAccountListToken,
    TAccountMint,
    TAccountRentDestination,
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
): DelistWnsInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner,
  TAccountOwnerToken,
  TAccountListState,
  TAccountListToken,
  TAccountMint,
  TAccountRentDestination,
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
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
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
      getAccountMeta(accounts.rentDestination),
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
    data: getDelistWnsInstructionDataEncoder().encode({}),
  } as DelistWnsInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerToken,
    TAccountListState,
    TAccountListToken,
    TAccountMint,
    TAccountRentDestination,
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

export type ParsedDelistWnsInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    owner: TAccountMetas[0];
    ownerToken: TAccountMetas[1];
    listState: TAccountMetas[2];
    listToken: TAccountMetas[3];
    mint: TAccountMetas[4];
    rentDestination: TAccountMetas[5];
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
  data: DelistWnsInstructionData;
};

export function parseDelistWnsInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedDelistWnsInstruction<TProgram, TAccountMetas> {
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
      rentDestination: getNextAccount(),
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
    data: getDelistWnsInstructionDataDecoder().decode(instruction.data),
  };
}
