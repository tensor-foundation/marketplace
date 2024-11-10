/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  combineCodec,
  getEnumDecoder,
  getEnumEncoder,
  type Codec,
  type Decoder,
  type Encoder,
} from '@solana/web3.js';

export enum TUseMethod {
  Burn,
  Multiple,
  Single,
}

export type TUseMethodArgs = TUseMethod;

export function getTUseMethodEncoder(): Encoder<TUseMethodArgs> {
  return getEnumEncoder(TUseMethod);
}

export function getTUseMethodDecoder(): Decoder<TUseMethod> {
  return getEnumDecoder(TUseMethod);
}

export function getTUseMethodCodec(): Codec<TUseMethodArgs, TUseMethod> {
  return combineCodec(getTUseMethodEncoder(), getTUseMethodDecoder());
}
