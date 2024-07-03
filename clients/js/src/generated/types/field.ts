/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Codec,
  Decoder,
  Encoder,
  combineCodec,
  getEnumDecoder,
  getEnumEncoder,
} from '@solana/web3.js';

export enum Field {
  Name,
}

export type FieldArgs = Field;

export function getFieldEncoder(): Encoder<FieldArgs> {
  return getEnumEncoder(Field);
}

export function getFieldDecoder(): Decoder<Field> {
  return getEnumDecoder(Field);
}

export function getFieldCodec(): Codec<FieldArgs, Field> {
  return combineCodec(getFieldEncoder(), getFieldDecoder());
}
