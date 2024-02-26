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

export enum TTokenStandard {
  NonFungible,
  FungibleAsset,
  Fungible,
  NonFungibleEdition,
}

export type TTokenStandardArgs = TTokenStandard;

export function getTTokenStandardEncoder() {
  return getScalarEnumEncoder(
    TTokenStandard
  ) satisfies Encoder<TTokenStandardArgs>;
}

export function getTTokenStandardDecoder() {
  return getScalarEnumDecoder(TTokenStandard) satisfies Decoder<TTokenStandard>;
}

export function getTTokenStandardCodec(): Codec<
  TTokenStandardArgs,
  TTokenStandard
> {
  return combineCodec(getTTokenStandardEncoder(), getTTokenStandardDecoder());
}
