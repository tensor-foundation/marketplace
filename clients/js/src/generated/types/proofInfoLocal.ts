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
  ReadonlyUint8Array,
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getArrayDecoder,
  getArrayEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
} from '@solana/web3.js';

export type ProofInfoLocal = {
  /** The merkle proof. */
  proof: Array<ReadonlyUint8Array>;
};

export type ProofInfoLocalArgs = ProofInfoLocal;

export function getProofInfoLocalEncoder(): Encoder<ProofInfoLocalArgs> {
  return getStructEncoder([
    ['proof', getArrayEncoder(fixEncoderSize(getBytesEncoder(), 32))],
  ]);
}

export function getProofInfoLocalDecoder(): Decoder<ProofInfoLocal> {
  return getStructDecoder([
    ['proof', getArrayDecoder(fixDecoderSize(getBytesDecoder(), 32))],
  ]);
}

export function getProofInfoLocalCodec(): Codec<
  ProofInfoLocalArgs,
  ProofInfoLocal
> {
  return combineCodec(getProofInfoLocalEncoder(), getProofInfoLocalDecoder());
}
