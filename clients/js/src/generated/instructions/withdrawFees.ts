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
  getU64Decoder,
  getU64Encoder,
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

export type WithdrawFeesInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountTswap extends string | IAccountMeta<string> = string,
  TAccountTcomp extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountDestination extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTswap extends string
        ? WritableAccount<TAccountTswap>
        : TAccountTswap,
      TAccountTcomp extends string
        ? WritableAccount<TAccountTcomp>
        : TAccountTcomp,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      TAccountOwner extends string
        ? WritableSignerAccount<TAccountOwner> &
            IAccountSignerMeta<TAccountOwner>
        : TAccountOwner,
      TAccountDestination extends string
        ? WritableAccount<TAccountDestination>
        : TAccountDestination,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      ...TRemainingAccounts,
    ]
  >;

export type WithdrawFeesInstructionData = {
  discriminator: Array<number>;
  amount: bigint;
};

export type WithdrawFeesInstructionDataArgs = { amount: number | bigint };

export function getWithdrawFeesInstructionDataEncoder(): Encoder<WithdrawFeesInstructionDataArgs> {
  return mapEncoder(
    getStructEncoder([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['amount', getU64Encoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: [198, 212, 171, 109, 144, 215, 174, 89],
    })
  );
}

export function getWithdrawFeesInstructionDataDecoder(): Decoder<WithdrawFeesInstructionData> {
  return getStructDecoder([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['amount', getU64Decoder()],
  ]);
}

export function getWithdrawFeesInstructionDataCodec(): Codec<
  WithdrawFeesInstructionDataArgs,
  WithdrawFeesInstructionData
> {
  return combineCodec(
    getWithdrawFeesInstructionDataEncoder(),
    getWithdrawFeesInstructionDataDecoder()
  );
}

export type WithdrawFeesInput<
  TAccountTswap extends string = string,
  TAccountTcomp extends string = string,
  TAccountCosigner extends string = string,
  TAccountOwner extends string = string,
  TAccountDestination extends string = string,
  TAccountSystemProgram extends string = string,
> = {
  tswap: Address<TAccountTswap>;
  tcomp: Address<TAccountTcomp>;
  /** We ask also for a signature just to make sure this wallet can actually sign things */
  cosigner: TransactionSigner<TAccountCosigner>;
  owner: TransactionSigner<TAccountOwner>;
  destination: Address<TAccountDestination>;
  systemProgram?: Address<TAccountSystemProgram>;
  amount: WithdrawFeesInstructionDataArgs['amount'];
};

export function getWithdrawFeesInstruction<
  TAccountTswap extends string,
  TAccountTcomp extends string,
  TAccountCosigner extends string,
  TAccountOwner extends string,
  TAccountDestination extends string,
  TAccountSystemProgram extends string,
>(
  input: WithdrawFeesInput<
    TAccountTswap,
    TAccountTcomp,
    TAccountCosigner,
    TAccountOwner,
    TAccountDestination,
    TAccountSystemProgram
  >
): WithdrawFeesInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountTswap,
  TAccountTcomp,
  TAccountCosigner,
  TAccountOwner,
  TAccountDestination,
  TAccountSystemProgram
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    tswap: { value: input.tswap ?? null, isWritable: true },
    tcomp: { value: input.tcomp ?? null, isWritable: true },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
    owner: { value: input.owner ?? null, isWritable: true },
    destination: { value: input.destination ?? null, isWritable: true },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.tswap),
      getAccountMeta(accounts.tcomp),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.destination),
      getAccountMeta(accounts.systemProgram),
    ],
    programAddress,
    data: getWithdrawFeesInstructionDataEncoder().encode(
      args as WithdrawFeesInstructionDataArgs
    ),
  } as WithdrawFeesInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountTswap,
    TAccountTcomp,
    TAccountCosigner,
    TAccountOwner,
    TAccountDestination,
    TAccountSystemProgram
  >;

  return instruction;
}

export type ParsedWithdrawFeesInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    tswap: TAccountMetas[0];
    tcomp: TAccountMetas[1];
    /** We ask also for a signature just to make sure this wallet can actually sign things */
    cosigner: TAccountMetas[2];
    owner: TAccountMetas[3];
    destination: TAccountMetas[4];
    systemProgram: TAccountMetas[5];
  };
  data: WithdrawFeesInstructionData;
};

export function parseWithdrawFeesInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedWithdrawFeesInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 6) {
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
      tswap: getNextAccount(),
      tcomp: getNextAccount(),
      cosigner: getNextAccount(),
      owner: getNextAccount(),
      destination: getNextAccount(),
      systemProgram: getNextAccount(),
    },
    data: getWithdrawFeesInstructionDataDecoder().decode(instruction.data),
  };
}
