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
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
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
  type ReadonlyAccount,
  type ReadonlySignerAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import { resolveBuyerAta, resolveListAta } from '@tensor-foundation/resolvers';
import { resolveFeeVaultPdaFromListState } from '../../hooked';
import { findListStatePda } from '../pdas';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  expectAddress,
  expectSome,
  expectTransactionSigner,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export type BuyT22Instruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountBuyer extends string | IAccountMeta<string> = string,
  TAccountBuyerTa extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountListTa extends string | IAccountMeta<string> = string,
  TAccountMint extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TAccountTokenProgram extends
    | string
    | IAccountMeta<string> = 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
  TAccountAssociatedTokenProgram extends
    | string
    | IAccountMeta<string> = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountCosigner extends string | IAccountMeta<string> = string,
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
      TAccountBuyerTa extends string
        ? WritableAccount<TAccountBuyerTa>
        : TAccountBuyerTa,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountListTa extends string
        ? WritableAccount<TAccountListTa>
        : TAccountListTa,
      TAccountMint extends string
        ? ReadonlyAccount<TAccountMint>
        : TAccountMint,
      TAccountOwner extends string
        ? WritableAccount<TAccountOwner>
        : TAccountOwner,
      TAccountPayer extends string
        ? WritableAccount<TAccountPayer>
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
      TAccountCosigner extends string
        ? ReadonlyAccount<TAccountCosigner>
        : TAccountCosigner,
      ...TRemainingAccounts,
    ]
  >;

export type BuyT22InstructionData = {
  discriminator: ReadonlyUint8Array;
  maxAmount: bigint;
};

export type BuyT22InstructionDataArgs = { maxAmount: number | bigint };

export function getBuyT22InstructionDataEncoder(): Encoder<BuyT22InstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['maxAmount', getU64Encoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([81, 98, 227, 171, 201, 105, 180, 216]),
    })
  );
}

export function getBuyT22InstructionDataDecoder(): Decoder<BuyT22InstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['maxAmount', getU64Decoder()],
  ]);
}

export function getBuyT22InstructionDataCodec(): Codec<
  BuyT22InstructionDataArgs,
  BuyT22InstructionData
> {
  return combineCodec(
    getBuyT22InstructionDataEncoder(),
    getBuyT22InstructionDataDecoder()
  );
}

export type BuyT22AsyncInput<
  TAccountFeeVault extends string = string,
  TAccountBuyer extends string = string,
  TAccountBuyerTa extends string = string,
  TAccountListState extends string = string,
  TAccountListTa extends string = string,
  TAccountMint extends string = string,
  TAccountOwner extends string = string,
  TAccountPayer extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountRentDestination extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault?: Address<TAccountFeeVault>;
  buyer?: Address<TAccountBuyer>;
  buyerTa?: Address<TAccountBuyerTa>;
  listState?: Address<TAccountListState>;
  listTa?: Address<TAccountListTa>;
  mint: Address<TAccountMint>;
  owner: Address<TAccountOwner>;
  payer: Address<TAccountPayer> | TransactionSigner<TAccountPayer>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDestination?: Address<TAccountRentDestination>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  cosigner?: Address<TAccountCosigner> | TransactionSigner<TAccountCosigner>;
  maxAmount: BuyT22InstructionDataArgs['maxAmount'];
  creators?: Array<Address>;
  transferHookAccounts: Array<Address>;
};

export async function getBuyT22InstructionAsync<
  TAccountFeeVault extends string,
  TAccountBuyer extends string,
  TAccountBuyerTa extends string,
  TAccountListState extends string,
  TAccountListTa extends string,
  TAccountMint extends string,
  TAccountOwner extends string,
  TAccountPayer extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDestination extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountCosigner extends string,
>(
  input: BuyT22AsyncInput<
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountCosigner
  >
): Promise<
  BuyT22Instruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountOwner,
    (typeof input)['payer'] extends TransactionSigner<TAccountPayer>
      ? WritableSignerAccount<TAccountPayer> & IAccountSignerMeta<TAccountPayer>
      : TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    (typeof input)['cosigner'] extends TransactionSigner<TAccountCosigner>
      ? ReadonlySignerAccount<TAccountCosigner> &
          IAccountSignerMeta<TAccountCosigner>
      : TAccountCosigner
  >
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    buyer: { value: input.buyer ?? null, isWritable: false },
    buyerTa: { value: input.buyerTa ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    listTa: { value: input.listTa ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
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
  if (!accounts.listState.value) {
    accounts.listState.value = await findListStatePda({
      mint: expectAddress(accounts.mint.value),
    });
  }
  if (!accounts.feeVault.value) {
    accounts.feeVault = {
      ...accounts.feeVault,
      ...(await resolveFeeVaultPdaFromListState(resolverScope)),
    };
  }
  if (!accounts.buyer.value) {
    accounts.buyer.value = expectTransactionSigner(
      accounts.payer.value
    ).address;
  }
  if (!accounts.tokenProgram.value) {
    accounts.tokenProgram.value =
      'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Address<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;
  }
  if (!accounts.buyerTa.value) {
    accounts.buyerTa = {
      ...accounts.buyerTa,
      ...(await resolveBuyerAta(resolverScope)),
    };
  }
  if (!accounts.listTa.value) {
    accounts.listTa = {
      ...accounts.listTa,
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

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = [
    ...(args.creators ?? []).map((address) => ({
      address,
      role: AccountRole.WRITABLE,
    })),
    ...args.transferHookAccounts.map((address) => ({
      address,
      role: AccountRole.READONLY,
    })),
  ];

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.buyerTa),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listTa),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.cosigner),
      ...remainingAccounts,
    ],
    programAddress,
    data: getBuyT22InstructionDataEncoder().encode(
      args as BuyT22InstructionDataArgs
    ),
  } as BuyT22Instruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountOwner,
    (typeof input)['payer'] extends TransactionSigner<TAccountPayer>
      ? WritableSignerAccount<TAccountPayer> & IAccountSignerMeta<TAccountPayer>
      : TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    (typeof input)['cosigner'] extends TransactionSigner<TAccountCosigner>
      ? ReadonlySignerAccount<TAccountCosigner> &
          IAccountSignerMeta<TAccountCosigner>
      : TAccountCosigner
  >;

  return instruction;
}

export type BuyT22Input<
  TAccountFeeVault extends string = string,
  TAccountBuyer extends string = string,
  TAccountBuyerTa extends string = string,
  TAccountListState extends string = string,
  TAccountListTa extends string = string,
  TAccountMint extends string = string,
  TAccountOwner extends string = string,
  TAccountPayer extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountRentDestination extends string = string,
  TAccountTokenProgram extends string = string,
  TAccountAssociatedTokenProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountCosigner extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  buyer?: Address<TAccountBuyer>;
  buyerTa: Address<TAccountBuyerTa>;
  listState: Address<TAccountListState>;
  listTa: Address<TAccountListTa>;
  mint: Address<TAccountMint>;
  owner: Address<TAccountOwner>;
  payer: Address<TAccountPayer> | TransactionSigner<TAccountPayer>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  rentDestination?: Address<TAccountRentDestination>;
  tokenProgram?: Address<TAccountTokenProgram>;
  associatedTokenProgram?: Address<TAccountAssociatedTokenProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  cosigner?: Address<TAccountCosigner> | TransactionSigner<TAccountCosigner>;
  maxAmount: BuyT22InstructionDataArgs['maxAmount'];
  creators?: Array<Address>;
  transferHookAccounts: Array<Address>;
};

export function getBuyT22Instruction<
  TAccountFeeVault extends string,
  TAccountBuyer extends string,
  TAccountBuyerTa extends string,
  TAccountListState extends string,
  TAccountListTa extends string,
  TAccountMint extends string,
  TAccountOwner extends string,
  TAccountPayer extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountRentDestination extends string,
  TAccountTokenProgram extends string,
  TAccountAssociatedTokenProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountSystemProgram extends string,
  TAccountCosigner extends string,
>(
  input: BuyT22Input<
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountOwner,
    TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    TAccountCosigner
  >
): BuyT22Instruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault,
  TAccountBuyer,
  TAccountBuyerTa,
  TAccountListState,
  TAccountListTa,
  TAccountMint,
  TAccountOwner,
  (typeof input)['payer'] extends TransactionSigner<TAccountPayer>
    ? WritableSignerAccount<TAccountPayer> & IAccountSignerMeta<TAccountPayer>
    : TAccountPayer,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountRentDestination,
  TAccountTokenProgram,
  TAccountAssociatedTokenProgram,
  TAccountMarketplaceProgram,
  TAccountSystemProgram,
  (typeof input)['cosigner'] extends TransactionSigner<TAccountCosigner>
    ? ReadonlySignerAccount<TAccountCosigner> &
        IAccountSignerMeta<TAccountCosigner>
    : TAccountCosigner
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    buyer: { value: input.buyer ?? null, isWritable: false },
    buyerTa: { value: input.buyerTa ?? null, isWritable: true },
    listState: { value: input.listState ?? null, isWritable: true },
    listTa: { value: input.listTa ?? null, isWritable: true },
    mint: { value: input.mint ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    payer: { value: input.payer ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
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
    cosigner: { value: input.cosigner ?? null, isWritable: false },
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
      'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb' as Address<'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'>;
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

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = [
    ...(args.creators ?? []).map((address) => ({
      address,
      role: AccountRole.WRITABLE,
    })),
    ...args.transferHookAccounts.map((address) => ({
      address,
      role: AccountRole.READONLY,
    })),
  ];

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.buyer),
      getAccountMeta(accounts.buyerTa),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.listTa),
      getAccountMeta(accounts.mint),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.rentDestination),
      getAccountMeta(accounts.tokenProgram),
      getAccountMeta(accounts.associatedTokenProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.cosigner),
      ...remainingAccounts,
    ],
    programAddress,
    data: getBuyT22InstructionDataEncoder().encode(
      args as BuyT22InstructionDataArgs
    ),
  } as BuyT22Instruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountFeeVault,
    TAccountBuyer,
    TAccountBuyerTa,
    TAccountListState,
    TAccountListTa,
    TAccountMint,
    TAccountOwner,
    (typeof input)['payer'] extends TransactionSigner<TAccountPayer>
      ? WritableSignerAccount<TAccountPayer> & IAccountSignerMeta<TAccountPayer>
      : TAccountPayer,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountRentDestination,
    TAccountTokenProgram,
    TAccountAssociatedTokenProgram,
    TAccountMarketplaceProgram,
    TAccountSystemProgram,
    (typeof input)['cosigner'] extends TransactionSigner<TAccountCosigner>
      ? ReadonlySignerAccount<TAccountCosigner> &
          IAccountSignerMeta<TAccountCosigner>
      : TAccountCosigner
  >;

  return instruction;
}

export type ParsedBuyT22Instruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
    buyer: TAccountMetas[1];
    buyerTa: TAccountMetas[2];
    listState: TAccountMetas[3];
    listTa: TAccountMetas[4];
    mint: TAccountMetas[5];
    owner: TAccountMetas[6];
    payer: TAccountMetas[7];
    takerBroker?: TAccountMetas[8] | undefined;
    makerBroker?: TAccountMetas[9] | undefined;
    rentDestination: TAccountMetas[10];
    tokenProgram: TAccountMetas[11];
    associatedTokenProgram: TAccountMetas[12];
    marketplaceProgram: TAccountMetas[13];
    systemProgram: TAccountMetas[14];
    cosigner?: TAccountMetas[15] | undefined;
  };
  data: BuyT22InstructionData;
};

export function parseBuyT22Instruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedBuyT22Instruction<TProgram, TAccountMetas> {
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
      feeVault: getNextAccount(),
      buyer: getNextAccount(),
      buyerTa: getNextAccount(),
      listState: getNextAccount(),
      listTa: getNextAccount(),
      mint: getNextAccount(),
      owner: getNextAccount(),
      payer: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      rentDestination: getNextAccount(),
      tokenProgram: getNextAccount(),
      associatedTokenProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      cosigner: getNextOptionalAccount(),
    },
    data: getBuyT22InstructionDataDecoder().decode(instruction.data),
  };
}
