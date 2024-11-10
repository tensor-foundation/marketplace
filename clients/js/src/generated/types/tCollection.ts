/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  combineCodec,
  getAddressDecoder,
  getAddressEncoder,
  getBooleanDecoder,
  getBooleanEncoder,
  getStructDecoder,
  getStructEncoder,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
} from '@solana/web3.js';

export type TCollection = { verified: boolean; key: Address };

export type TCollectionArgs = TCollection;

export function getTCollectionEncoder(): Encoder<TCollectionArgs> {
  return getStructEncoder([
    ['verified', getBooleanEncoder()],
    ['key', getAddressEncoder()],
  ]);
}

export function getTCollectionDecoder(): Decoder<TCollection> {
  return getStructDecoder([
    ['verified', getBooleanDecoder()],
    ['key', getAddressDecoder()],
  ]);
}

export function getTCollectionCodec(): Codec<TCollectionArgs, TCollection> {
  return combineCodec(getTCollectionEncoder(), getTCollectionDecoder());
}
