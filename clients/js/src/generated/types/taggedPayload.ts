/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Codec, Decoder, Encoder, combineCodec } from '@solana/codecs-core';
import {
  getStructDecoder,
  getStructEncoder,
} from '@solana/codecs-data-structures';
import { getStringDecoder, getStringEncoder } from '@solana/codecs-strings';
import {
  PayloadTypeLocal,
  PayloadTypeLocalArgs,
  getPayloadTypeLocalDecoder,
  getPayloadTypeLocalEncoder,
} from '.';

export type TaggedPayload = { name: string; payload: PayloadTypeLocal };

export type TaggedPayloadArgs = { name: string; payload: PayloadTypeLocalArgs };

export function getTaggedPayloadEncoder() {
  return getStructEncoder<TaggedPayloadArgs>([
    ['name', getStringEncoder()],
    ['payload', getPayloadTypeLocalEncoder()],
  ]) satisfies Encoder<TaggedPayloadArgs>;
}

export function getTaggedPayloadDecoder() {
  return getStructDecoder<TaggedPayload>([
    ['name', getStringDecoder()],
    ['payload', getPayloadTypeLocalDecoder()],
  ]) satisfies Decoder<TaggedPayload>;
}

export function getTaggedPayloadCodec(): Codec<
  TaggedPayloadArgs,
  TaggedPayload
> {
  return combineCodec(getTaggedPayloadEncoder(), getTaggedPayloadDecoder());
}