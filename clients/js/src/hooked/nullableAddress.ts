import { combineCodec, createDecoder, createEncoder } from '@solana/web3.js';
import {
  Address,
  address,
  getAddressDecoder,
  getAddressEncoder,
} from '@solana/web3.js';

export type NullableAddress = Address | null;
export type NullableAddressArgs = NullableAddress;

const DEFAULT_ADDRESS = address('11111111111111111111111111111111');

export const getNullableAddressEncoder = () =>
  createEncoder<NullableAddress>({
    fixedSize: 32,
    write(value, bytes, offset) {
      if (value === null) {
        bytes.set(getAddressEncoder().encode(DEFAULT_ADDRESS), offset);
      } else {
        bytes.set(getAddressEncoder().encode(value), offset);
      }
      return offset + 32;
    },
  });

export const getNullableAddressDecoder = () =>
  createDecoder<NullableAddress>({
    fixedSize: 32,
    read(bytes, offset) {
      if (getAddressDecoder().decode(bytes, offset) === DEFAULT_ADDRESS) {
        return [null, offset + 32];
      } else {
        return [getAddressDecoder().decode(bytes, offset), offset + 32];
      }
    },
  });

export const getNullableAddressCodec = () =>
  combineCodec(getNullableAddressEncoder(), getNullableAddressDecoder());
