/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Codec, Decoder, Encoder, combineCodec } from '@solana/codecs-core';
import {
  getScalarEnumDecoder,
  getScalarEnumEncoder,
} from '@solana/codecs-data-structures';

export enum TTokenProgramVersion {
  Original,
  Token2022,
}

export type TTokenProgramVersionArgs = TTokenProgramVersion;

export function getTTokenProgramVersionEncoder() {
  return getScalarEnumEncoder(
    TTokenProgramVersion
  ) satisfies Encoder<TTokenProgramVersionArgs>;
}

export function getTTokenProgramVersionDecoder() {
  return getScalarEnumDecoder(
    TTokenProgramVersion
  ) satisfies Decoder<TTokenProgramVersion>;
}

export function getTTokenProgramVersionCodec(): Codec<
  TTokenProgramVersionArgs,
  TTokenProgramVersion
> {
  return combineCodec(
    getTTokenProgramVersionEncoder(),
    getTTokenProgramVersionDecoder()
  );
}