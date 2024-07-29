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
  getStructDecoder,
  getStructEncoder,
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
  type ReadonlySignerAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
} from '@solana/web3.js';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import { getAccountMetaFactory, type ResolvedAccount } from '../shared';
import {
  getTcompEventDecoder,
  getTcompEventEncoder,
  type TcompEvent,
  type TcompEventArgs,
} from '../types';

export type TcompNoopInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountTcompSigner extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTcompSigner extends string
        ? ReadonlySignerAccount<TAccountTcompSigner> &
            IAccountSignerMeta<TAccountTcompSigner>
        : TAccountTcompSigner,
      ...TRemainingAccounts,
    ]
  >;

export type TcompNoopInstructionData = {
  discriminator: ReadonlyUint8Array;
  event: TcompEvent;
};

export type TcompNoopInstructionDataArgs = { event: TcompEventArgs };

export function getTcompNoopInstructionDataEncoder(): Encoder<TcompNoopInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['event', getTcompEventEncoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([106, 162, 10, 226, 132, 68, 223, 21]),
    })
  );
}

export function getTcompNoopInstructionDataDecoder(): Decoder<TcompNoopInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['event', getTcompEventDecoder()],
  ]);
}

export function getTcompNoopInstructionDataCodec(): Codec<
  TcompNoopInstructionDataArgs,
  TcompNoopInstructionData
> {
  return combineCodec(
    getTcompNoopInstructionDataEncoder(),
    getTcompNoopInstructionDataDecoder()
  );
}

export type TcompNoopInput<TAccountTcompSigner extends string = string> = {
  tcompSigner: TransactionSigner<TAccountTcompSigner>;
  event: TcompNoopInstructionDataArgs['event'];
};

export function getTcompNoopInstruction<TAccountTcompSigner extends string>(
  input: TcompNoopInput<TAccountTcompSigner>
): TcompNoopInstruction<
  typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountTcompSigner
> {
  // Program address.
  const programAddress = TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    tcompSigner: { value: input.tcompSigner ?? null, isWritable: false },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [getAccountMeta(accounts.tcompSigner)],
    programAddress,
    data: getTcompNoopInstructionDataEncoder().encode(
      args as TcompNoopInstructionDataArgs
    ),
  } as TcompNoopInstruction<
    typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    TAccountTcompSigner
  >;

  return instruction;
}

export type ParsedTcompNoopInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    tcompSigner: TAccountMetas[0];
  };
  data: TcompNoopInstructionData;
};

export function parseTcompNoopInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedTcompNoopInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 1) {
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
      tcompSigner: getNextAccount(),
    },
    data: getTcompNoopInstructionDataDecoder().decode(instruction.data),
  };
}
