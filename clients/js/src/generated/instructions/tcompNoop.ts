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
  mapEncoder,
} from '@solana/codecs-core';
import {
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
} from '@solana/codecs-data-structures';
import { getU8Decoder, getU8Encoder } from '@solana/codecs-numbers';
import {
  AccountRole,
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlySignerAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import {
  ResolvedAccount,
  accountMetaWithDefault,
  getAccountMetasWithSigners,
} from '../shared';
import {
  TcompEvent,
  TcompEventArgs,
  getTcompEventDecoder,
  getTcompEventEncoder,
} from '../types';

export type TcompNoopInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTcompSigner extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTcompSigner extends string
        ? ReadonlySignerAccount<TAccountTcompSigner>
        : TAccountTcompSigner,
      ...TRemainingAccounts
    ]
  >;

export type TcompNoopInstructionWithSigners<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTcompSigner extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTcompSigner extends string
        ? ReadonlySignerAccount<TAccountTcompSigner> &
            IAccountSignerMeta<TAccountTcompSigner>
        : TAccountTcompSigner,
      ...TRemainingAccounts
    ]
  >;

export type TcompNoopInstructionData = {
  discriminator: Array<number>;
  event: TcompEvent;
};

export type TcompNoopInstructionDataArgs = { event: TcompEventArgs };

export function getTcompNoopInstructionDataEncoder() {
  return mapEncoder(
    getStructEncoder<{ discriminator: Array<number>; event: TcompEventArgs }>([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['event', getTcompEventEncoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: [106, 162, 10, 226, 132, 68, 223, 21],
    })
  ) satisfies Encoder<TcompNoopInstructionDataArgs>;
}

export function getTcompNoopInstructionDataDecoder() {
  return getStructDecoder<TcompNoopInstructionData>([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['event', getTcompEventDecoder()],
  ]) satisfies Decoder<TcompNoopInstructionData>;
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

export type TcompNoopInput<TAccountTcompSigner extends string> = {
  tcompSigner: Address<TAccountTcompSigner>;
  event: TcompNoopInstructionDataArgs['event'];
};

export type TcompNoopInputWithSigners<TAccountTcompSigner extends string> = {
  tcompSigner: TransactionSigner<TAccountTcompSigner>;
  event: TcompNoopInstructionDataArgs['event'];
};

export function getTcompNoopInstruction<
  TAccountTcompSigner extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: TcompNoopInputWithSigners<TAccountTcompSigner>
): TcompNoopInstructionWithSigners<TProgram, TAccountTcompSigner>;
export function getTcompNoopInstruction<
  TAccountTcompSigner extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: TcompNoopInput<TAccountTcompSigner>
): TcompNoopInstruction<TProgram, TAccountTcompSigner>;
export function getTcompNoopInstruction<
  TAccountTcompSigner extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(input: TcompNoopInput<TAccountTcompSigner>): IInstruction {
  // Program address.
  const programAddress =
    'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getTcompNoopInstructionRaw<TProgram, TAccountTcompSigner>
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
    tcompSigner: { value: input.tcompSigner ?? null, isWritable: false },
  };

  // Original args.
  const args = { ...input };

  // Get account metas and signers.
  const accountMetas = getAccountMetasWithSigners(
    accounts,
    'programId',
    programAddress
  );

  const instruction = getTcompNoopInstructionRaw(
    accountMetas as Record<keyof AccountMetas, IAccountMeta>,
    args as TcompNoopInstructionDataArgs,
    programAddress
  );

  return instruction;
}

export function getTcompNoopInstructionRaw<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTcompSigner extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
>(
  accounts: {
    tcompSigner: TAccountTcompSigner extends string
      ? Address<TAccountTcompSigner>
      : TAccountTcompSigner;
  },
  args: TcompNoopInstructionDataArgs,
  programAddress: Address<TProgram> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<TProgram>,
  remainingAccounts?: TRemainingAccounts
) {
  return {
    accounts: [
      accountMetaWithDefault(accounts.tcompSigner, AccountRole.READONLY_SIGNER),
      ...(remainingAccounts ?? []),
    ],
    data: getTcompNoopInstructionDataEncoder().encode(args),
    programAddress,
  } as TcompNoopInstruction<TProgram, TAccountTcompSigner, TRemainingAccounts>;
}

export type ParsedTcompNoopInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[]
> = {
  programAddress: Address<TProgram>;
  accounts: {
    tcompSigner: TAccountMetas[0];
  };
  data: TcompNoopInstructionData;
};

export function parseTcompNoopInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[]
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