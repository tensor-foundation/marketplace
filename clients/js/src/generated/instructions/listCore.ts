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

export type ListCoreInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountListState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountPayer extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountMplCoreProgram extends
    | string
    | IAccountMeta<string> = 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  TAccountTcompProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountAsset extends string
        ? WritableAccount<TAccountAsset>
        : TAccountAsset,
      TAccountCollection extends string
        ? ReadonlyAccount<TAccountCollection>
        : TAccountCollection,
      TAccountListState extends string
        ? WritableAccount<TAccountListState>
        : TAccountListState,
      TAccountOwner extends string
        ? ReadonlySignerAccount<TAccountOwner> &
            IAccountSignerMeta<TAccountOwner>
        : TAccountOwner,
      TAccountPayer extends string
        ? WritableSignerAccount<TAccountPayer> &
            IAccountSignerMeta<TAccountPayer>
        : TAccountPayer,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      TAccountMplCoreProgram extends string
        ? ReadonlyAccount<TAccountMplCoreProgram>
        : TAccountMplCoreProgram,
      TAccountTcompProgram extends string
        ? ReadonlyAccount<TAccountTcompProgram>
        : TAccountTcompProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type ListCoreInstructionData = {
  discriminator: Array<number>;
  amount: bigint;
  expireInSec: Option<bigint>;
  currency: Option<Address>;
  privateTaker: Option<Address>;
  makerBroker: Option<Address>;
};

export type ListCoreInstructionDataArgs = {
  amount: number | bigint;
  expireInSec?: OptionOrNullable<number | bigint>;
  currency?: OptionOrNullable<Address>;
  privateTaker?: OptionOrNullable<Address>;
  makerBroker?: OptionOrNullable<Address>;
};

export function getListCoreInstructionDataEncoder(): Encoder<ListCoreInstructionDataArgs> {
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
      discriminator: [173, 76, 167, 125, 118, 71, 1, 153],
      expireInSec: value.expireInSec ?? none(),
      currency: value.currency ?? none(),
      privateTaker: value.privateTaker ?? none(),
      makerBroker: value.makerBroker ?? none(),
    })
  );
}

export function getListCoreInstructionDataDecoder(): Decoder<ListCoreInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['amount', getU64Decoder()],
    ['expireInSec', getOptionDecoder(getU64Decoder())],
    ['currency', getOptionDecoder(getAddressDecoder())],
    ['privateTaker', getOptionDecoder(getAddressDecoder())],
    ['makerBroker', getOptionDecoder(getAddressDecoder())],
  ]);
}

export function getListCoreInstructionDataCodec(): Codec<
  ListCoreInstructionDataArgs,
  ListCoreInstructionData
> {
  return combineCodec(
    getListCoreInstructionDataEncoder(),
    getListCoreInstructionDataDecoder()
  );
}

export type ListCoreInput<
  TAccountAsset extends string = string,
  TAccountCollection extends string = string,
  TAccountListState extends string = string,
  TAccountOwner extends string = string,
  TAccountPayer extends string = string,
  TAccountCosigner extends string = string,
  TAccountMplCoreProgram extends string = string,
  TAccountTcompProgram extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  listState: Address<TAccountListState>;
  owner: TransactionSigner<TAccountOwner>;
  payer: TransactionSigner<TAccountPayer>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  mplCoreProgram?: Address<TAccountMplCoreProgram>;
  tcompProgram: Address<TAccountTcompProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  amount: ListCoreInstructionDataArgs['amount'];
  expireInSec?: ListCoreInstructionDataArgs['expireInSec'];
  currency?: ListCoreInstructionDataArgs['currency'];
  privateTaker?: ListCoreInstructionDataArgs['privateTaker'];
  makerBroker?: ListCoreInstructionDataArgs['makerBroker'];
};

export function getListCoreInstruction<
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountListState extends string,
  TAccountOwner extends string,
  TAccountPayer extends string,
  TAccountCosigner extends string,
  TAccountMplCoreProgram extends string,
  TAccountTcompProgram extends string,
  TAccountSystemProgram extends string,
>(
  input: ListCoreInput<
    TAccountAsset,
    TAccountCollection,
    TAccountListState,
    TAccountOwner,
    TAccountPayer,
    TAccountCosigner,
    TAccountMplCoreProgram,
    TAccountTcompProgram,
    TAccountSystemProgram
  >
): ListCoreInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountAsset,
  TAccountCollection,
  TAccountListState,
  TAccountOwner,
  TAccountPayer,
  TAccountCosigner,
  TAccountMplCoreProgram,
  TAccountTcompProgram,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    asset: { value: input.asset ?? null, isWritable: true },
    collection: { value: input.collection ?? null, isWritable: false },
    listState: { value: input.listState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: false },
    payer: { value: input.payer ?? null, isWritable: true },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
    mplCoreProgram: { value: input.mplCoreProgram ?? null, isWritable: false },
    tcompProgram: { value: input.tcompProgram ?? null, isWritable: false },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.mplCoreProgram.value) {
    accounts.mplCoreProgram.value =
      'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d' as Address<'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.asset),
      getAccountMeta(accounts.collection),
      getAccountMeta(accounts.listState),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.payer),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.mplCoreProgram),
      getAccountMeta(accounts.tcompProgram),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getListCoreInstructionDataEncoder().encode(
      args as ListCoreInstructionDataArgs
    ),
  } as ListCoreInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountAsset,
    TAccountCollection,
    TAccountListState,
    TAccountOwner,
    TAccountPayer,
    TAccountCosigner,
    TAccountMplCoreProgram,
    TAccountTcompProgram,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedListCoreInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    asset: TAccountMetas[0];
    collection?: TAccountMetas[1] | undefined;
    listState: TAccountMetas[2];
    owner: TAccountMetas[3];
    payer: TAccountMetas[4];
    cosigner?: TAccountMetas[5] | undefined;
    mplCoreProgram: TAccountMetas[6];
    tcompProgram: TAccountMetas[7];
    systemProgram: TAccountMetas[8];
  };
  data: ListCoreInstructionData;
};

export function parseListCoreInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedListCoreInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 9) {
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
      asset: getNextAccount(),
      collection: getNextOptionalAccount(),
      listState: getNextAccount(),
      owner: getNextAccount(),
      payer: getNextAccount(),
      cosigner: getNextOptionalAccount(),
      mplCoreProgram: getNextAccount(),
      tcompProgram: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getListCoreInstructionDataDecoder().decode(instruction.data),
  };
}
