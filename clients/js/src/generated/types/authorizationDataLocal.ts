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
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
} from '@solana/web3.js';
import {
  TaggedPayload,
  TaggedPayloadArgs,
  getTaggedPayloadDecoder,
  getTaggedPayloadEncoder,
} from '.';

export type AuthorizationDataLocal = { payload: Array<TaggedPayload> };

export type AuthorizationDataLocalArgs = { payload: Array<TaggedPayloadArgs> };

export function getAuthorizationDataLocalEncoder(): Encoder<AuthorizationDataLocalArgs> {
  return getStructEncoder([
    ['payload', getArrayEncoder(getTaggedPayloadEncoder())],
  ]);
}

export function getAuthorizationDataLocalDecoder(): Decoder<AuthorizationDataLocal> {
  return getStructDecoder([
    ['payload', getArrayDecoder(getTaggedPayloadDecoder())],
  ]);
}

export function getAuthorizationDataLocalCodec(): Codec<
  AuthorizationDataLocalArgs,
  AuthorizationDataLocal
> {
  return combineCodec(
    getAuthorizationDataLocalEncoder(),
    getAuthorizationDataLocalDecoder()
  );
}
