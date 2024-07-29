/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  combineCodec,
  getAddressDecoder,
  getAddressEncoder,
  getOptionDecoder,
  getOptionEncoder,
  getStructDecoder,
  getStructEncoder,
  getU32Decoder,
  getU32Encoder,
  getU64Decoder,
  getU64Encoder,
  transformEncoder,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
  type Option,
  type OptionOrNullable,
} from '@solana/web3.js';
import {
  getFieldDecoder,
  getFieldEncoder,
  getTargetDecoder,
  getTargetEncoder,
  type Field,
  type FieldArgs,
  type Target,
  type TargetArgs,
} from '.';

export type TakeEvent = {
  taker: Address;
  bidId: Option<Address>;
  target: Target;
  targetId: Address;
  field: Option<Field>;
  fieldId: Option<Address>;
  amount: bigint;
  quantity: number;
  tcompFee: bigint;
  takerBrokerFee: bigint;
  makerBrokerFee: bigint;
  creatorFee: bigint;
  currency: Option<Address>;
  assetId: Option<Address>;
};

export type TakeEventArgs = {
  taker: Address;
  bidId: OptionOrNullable<Address>;
  target: TargetArgs;
  targetId: Address;
  field: OptionOrNullable<FieldArgs>;
  fieldId: OptionOrNullable<Address>;
  amount: number | bigint;
  quantity?: number;
  tcompFee: number | bigint;
  takerBrokerFee: number | bigint;
  makerBrokerFee: number | bigint;
  creatorFee: number | bigint;
  currency: OptionOrNullable<Address>;
  assetId: OptionOrNullable<Address>;
};

export function getTakeEventEncoder(): Encoder<TakeEventArgs> {
  return transformEncoder(
    getStructEncoder([
      ['taker', getAddressEncoder()],
      ['bidId', getOptionEncoder(getAddressEncoder())],
      ['target', getTargetEncoder()],
      ['targetId', getAddressEncoder()],
      ['field', getOptionEncoder(getFieldEncoder())],
      ['fieldId', getOptionEncoder(getAddressEncoder())],
      ['amount', getU64Encoder()],
      ['quantity', getU32Encoder()],
      ['tcompFee', getU64Encoder()],
      ['takerBrokerFee', getU64Encoder()],
      ['makerBrokerFee', getU64Encoder()],
      ['creatorFee', getU64Encoder()],
      ['currency', getOptionEncoder(getAddressEncoder())],
      ['assetId', getOptionEncoder(getAddressEncoder())],
    ]),
    (value) => ({ ...value, quantity: value.quantity ?? 1 })
  );
}

export function getTakeEventDecoder(): Decoder<TakeEvent> {
  return getStructDecoder([
    ['taker', getAddressDecoder()],
    ['bidId', getOptionDecoder(getAddressDecoder())],
    ['target', getTargetDecoder()],
    ['targetId', getAddressDecoder()],
    ['field', getOptionDecoder(getFieldDecoder())],
    ['fieldId', getOptionDecoder(getAddressDecoder())],
    ['amount', getU64Decoder()],
    ['quantity', getU32Decoder()],
    ['tcompFee', getU64Decoder()],
    ['takerBrokerFee', getU64Decoder()],
    ['makerBrokerFee', getU64Decoder()],
    ['creatorFee', getU64Decoder()],
    ['currency', getOptionDecoder(getAddressDecoder())],
    ['assetId', getOptionDecoder(getAddressDecoder())],
  ]);
}

export function getTakeEventCodec(): Codec<TakeEventArgs, TakeEvent> {
  return combineCodec(getTakeEventEncoder(), getTakeEventDecoder());
}
