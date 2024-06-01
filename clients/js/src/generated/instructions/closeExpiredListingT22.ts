/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Address,
  Codec,
  Decoder,
  Encoder,
  IAccountMeta,
  IAccountSignerMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  ReadonlyUint8Array,
  TransactionSigner,
  WritableAccount,
  WritableSignerAccount,
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  transformEncoder,
} from '@solana/web3.js';
import { resolveListAta, resolveOwnerAta } from '@tensor-foundation/resolvers';
import { findListStatePda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  ResolvedAccount,
  expectAddress,
  expectSome,
  expectTransactionSigner,
  getAccountMetaFactory,
} from '../shared';

export type CloseExpiredListingT22Instruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountOwnerAta extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountListAta extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
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
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
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
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      ...TRemainingAccounts,
    ]
  >;

export type CloseExpiredListingT22InstructionData = {
  discriminator: ReadonlyUint8Array;
};

export type CloseExpiredListingT22InstructionDataArgs = {};

export function getCloseExpiredListingT22InstructionDataEncoder(): Encoder<CloseExpiredListingT22InstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([['discriminator', fixEncoderSize(getBytesEncoder(), 8)]]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([69, 2, 190, 122, 144, 119, 122, 220]),
    })
  );
}

export function getCloseExpiredListingT22InstructionDataDecoder(): Decoder<CloseExpiredListingT22InstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
  ]);
}

export function getCloseExpiredListingT22InstructionDataCodec(): Codec<
  CloseExpiredListingT22InstructionDataArgs,
  CloseExpiredListingT22InstructionData
> {
  return combineCodec(
    getCloseExpiredListingT22InstructionDataEncoder(),
    getCloseExpiredListingT22InstructionDataDecoder()
  );
}

export type CloseExpiredListingT22AsyncInput<
  TAccountOwner extends string = string,
  TAccountOwnerAta extends string = string,
  TAccountListState extends string = string,
  TAccountListAta extends string = string,
  TAccountMint extends string = string,
  TAccountRentDestination extends string = string,
  TAccountPayer extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
> = {
  owner?: Address<TAccountOwner>;
  ownerAta?: Address<TAccountOwnerAta>;
  listState?: Address<TAccountListState>;
  listAta?: Address<TAccountListAta>;
  mint: Address<TAccountMint>;
  rentDestination?: Address<TAccountRentDestination>;
  payer: TransactionSigner<TAccountPayer>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
};

export async function getCloseExpiredListingT22InstructionAsync<
  TAccountOwner extends string,
  TAccountOwnerAta extends string,
  TAccountListState extends string,
  TAccountListAta extends string,
  TAccountMint extends string,
  TAccountRentDestination extends string,
  TAccountPayer extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
>(
  input: CloseExpiredListingT22AsyncInput<
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
    TAccountRentDestination,
    TAccountPayer,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram
  >
): Promise<
  CloseExpiredListingT22Instruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
    TAccountRentDestination,
    TAccountPayer,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram
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
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
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
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Resolver scope.
  const resolverScope = { programAddress, accounts };

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

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerAta),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listAta),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
    ],
    programAddress,
    data: getCloseExpiredListingT22InstructionDataEncoder().encode({}),
  } as CloseExpiredListingT22Instruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
    TAccountRentDestination,
    TAccountPayer,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram
  >;

  return instruction;
}

export type CloseExpiredListingT22Input<
  TAccountOwner extends string = string,
  TAccountOwnerAta extends string = string,
  TAccountListState extends string = string,
  TAccountListAta extends string = string,
  TAccountMint extends string = string,
  TAccountRentDestination extends string = string,
  TAccountPayer extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
> = {
  owner?: Address<TAccountOwner>;
  ownerAta: Address<TAccountOwnerAta>;
  listState: Address<TAccountListState>;
  listAta: Address<TAccountListAta>;
  mint: Address<TAccountMint>;
  rentDestination?: Address<TAccountRentDestination>;
  payer: TransactionSigner<TAccountPayer>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
};

export function getCloseExpiredListingT22Instruction<
  TAccountOwner extends string,
  TAccountOwnerAta extends string,
  TAccountListState extends string,
  TAccountListAta extends string,
  TAccountMint extends string,
  TAccountRentDestination extends string,
  TAccountPayer extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
>(
  input: CloseExpiredListingT22Input<
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
    TAccountRentDestination,
    TAccountPayer,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram
  >
): CloseExpiredListingT22Instruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountOwner,
  TAccountOwnerAta,
  TAccountListState,
  TAccountListAta,
  TAccountMint,
  TAccountRentDestination,
  TAccountPayer,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountSystemProgram,
  TAccountMarketplaceProgram
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
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
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
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

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

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.ownerAta),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listAta),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
    ],
    programAddress,
    data: getCloseExpiredListingT22InstructionDataEncoder().encode({}),
  } as CloseExpiredListingT22Instruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountOwner,
    TAccountOwnerAta,
    TAccountListState,
    TAccountListAta,
    TAccountMint,
    TAccountRentDestination,
    TAccountPayer,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram
  >;

  return instruction;
}

export type ParsedCloseExpiredListingT22Instruction<
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
    rentDestination: TAccountMetas[5];
    payer: TAccountMetas[6];
    tokenProgram: TAccountMetas[7];
    associatedTokenProgram: TAccountMetas[8];
    systemProgram: TAccountMetas[9];
    marketplaceProgram: TAccountMetas[10];
  };
  data: CloseExpiredListingT22InstructionData;
};

export function parseCloseExpiredListingT22Instruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedCloseExpiredListingT22Instruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 11) {
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
      ownerAta: getNextAccount(),
      listState: getNextAccount(),
      listAta: getNextAccount(),
      mint: getNextAccount(),
      rentDestination: getNextAccount(),
      payer: getNextAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
    },
    data: getCloseExpiredListingT22InstructionDataDecoder().decode(
      instruction.data
    ),
  };
}
