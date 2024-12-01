/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  combineCodec,
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
  type Codec,
  type Decoder,
  type Encoder,
} from '@solana/web3.js';
import {
  getTaggedPayloadDecoder,
  getTaggedPayloadEncoder,
  type TaggedPayload,
  type TaggedPayloadArgs,
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
