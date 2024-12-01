/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  assertAccountExists,
  assertAccountsExist,
  combineCodec,
  decodeAccount,
  fetchEncodedAccount,
  fetchEncodedAccounts,
  fixDecoderSize,
  fixEncoderSize,
  getAddressDecoder,
  getAddressEncoder,
  getArrayDecoder,
  getArrayEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getI64Decoder,
  getI64Encoder,
  getOptionDecoder,
  getOptionEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  getU8Decoder,
  getU8Encoder,
  transformEncoder,
  type Account,
  type Address,
  type Codec,
  type Decoder,
  type EncodedAccount,
  type Encoder,
  type FetchAccountConfig,
  type FetchAccountsConfig,
  type MaybeAccount,
  type MaybeEncodedAccount,
  type Option,
  type OptionOrNullable,
  type ReadonlyUint8Array,
} from '@solana/web3.js';
import {
  getNullableAddressDecoder,
  getNullableAddressEncoder,
  type NullableAddress,
  type NullableAddressArgs,
} from '../../hooked';
import { ListStateSeeds, findListStatePda } from '../pdas';

export const LIST_STATE_DISCRIMINATOR = new Uint8Array([
  78, 242, 89, 138, 161, 221, 176, 75,
]);

export function getListStateDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(LIST_STATE_DISCRIMINATOR);
}

export type ListState = {
  discriminator: ReadonlyUint8Array;
  version: number;
  bump: Array<number>;
  owner: Address;
  assetId: Address;
  amount: bigint;
  currency: Option<Address>;
  expiry: bigint;
  privateTaker: Option<Address>;
  makerBroker: Option<Address>;
  /**
   * Owner is the rent payer when this is None.
   * Default Pubkey represents a None value.
   */
  rentPayer: NullableAddress;
  /**
   * Cosigner
   * Default Pubkey represents a None value.
   */
  cosigner: NullableAddress;
  reserved1: ReadonlyUint8Array;
};

export type ListStateArgs = {
  version: number;
  bump: Array<number>;
  owner: Address;
  assetId: Address;
  amount: number | bigint;
  currency: OptionOrNullable<Address>;
  expiry: number | bigint;
  privateTaker: OptionOrNullable<Address>;
  makerBroker: OptionOrNullable<Address>;
  /**
   * Owner is the rent payer when this is None.
   * Default Pubkey represents a None value.
   */
  rentPayer: NullableAddressArgs;
  /**
   * Cosigner
   * Default Pubkey represents a None value.
   */
  cosigner: NullableAddressArgs;
  reserved1: ReadonlyUint8Array;
};

export function getListStateEncoder(): Encoder<ListStateArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['version', getU8Encoder()],
      ['bump', getArrayEncoder(getU8Encoder(), { size: 1 })],
      ['owner', getAddressEncoder()],
      ['assetId', getAddressEncoder()],
      ['amount', getU64Encoder()],
      ['currency', getOptionEncoder(getAddressEncoder())],
      ['expiry', getI64Encoder()],
      ['privateTaker', getOptionEncoder(getAddressEncoder())],
      ['makerBroker', getOptionEncoder(getAddressEncoder())],
      ['rentPayer', getNullableAddressEncoder()],
      ['cosigner', getNullableAddressEncoder()],
      ['reserved1', fixEncoderSize(getBytesEncoder(), 64)],
    ]),
    (value) => ({ ...value, discriminator: LIST_STATE_DISCRIMINATOR })
  );
}

export function getListStateDecoder(): Decoder<ListState> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['version', getU8Decoder()],
    ['bump', getArrayDecoder(getU8Decoder(), { size: 1 })],
    ['owner', getAddressDecoder()],
    ['assetId', getAddressDecoder()],
    ['amount', getU64Decoder()],
    ['currency', getOptionDecoder(getAddressDecoder())],
    ['expiry', getI64Decoder()],
    ['privateTaker', getOptionDecoder(getAddressDecoder())],
    ['makerBroker', getOptionDecoder(getAddressDecoder())],
    ['rentPayer', getNullableAddressDecoder()],
    ['cosigner', getNullableAddressDecoder()],
    ['reserved1', fixDecoderSize(getBytesDecoder(), 64)],
  ]);
}

export function getListStateCodec(): Codec<ListStateArgs, ListState> {
  return combineCodec(getListStateEncoder(), getListStateDecoder());
}

export function decodeListState<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress>
): Account<ListState, TAddress>;
export function decodeListState<TAddress extends string = string>(
  encodedAccount: MaybeEncodedAccount<TAddress>
): MaybeAccount<ListState, TAddress>;
export function decodeListState<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
): Account<ListState, TAddress> | MaybeAccount<ListState, TAddress> {
  return decodeAccount(
    encodedAccount as MaybeEncodedAccount<TAddress>,
    getListStateDecoder()
  );
}

export async function fetchListState<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<Account<ListState, TAddress>> {
  const maybeAccount = await fetchMaybeListState(rpc, address, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeListState<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<MaybeAccount<ListState, TAddress>> {
  const maybeAccount = await fetchEncodedAccount(rpc, address, config);
  return decodeListState(maybeAccount);
}

export async function fetchAllListState(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<Account<ListState>[]> {
  const maybeAccounts = await fetchAllMaybeListState(rpc, addresses, config);
  assertAccountsExist(maybeAccounts);
  return maybeAccounts;
}

export async function fetchAllMaybeListState(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<MaybeAccount<ListState>[]> {
  const maybeAccounts = await fetchEncodedAccounts(rpc, addresses, config);
  return maybeAccounts.map((maybeAccount) => decodeListState(maybeAccount));
}

export async function fetchListStateFromSeeds(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  seeds: ListStateSeeds,
  config: FetchAccountConfig & { programAddress?: Address } = {}
): Promise<Account<ListState>> {
  const maybeAccount = await fetchMaybeListStateFromSeeds(rpc, seeds, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeListStateFromSeeds(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  seeds: ListStateSeeds,
  config: FetchAccountConfig & { programAddress?: Address } = {}
): Promise<MaybeAccount<ListState>> {
  const { programAddress, ...fetchConfig } = config;
  const [address] = await findListStatePda(seeds, { programAddress });
  return await fetchMaybeListState(rpc, address, fetchConfig);
}
