/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Account,
  EncodedAccount,
  FetchAccountConfig,
  FetchAccountsConfig,
  MaybeAccount,
  MaybeEncodedAccount,
  assertAccountExists,
  assertAccountsExist,
  decodeAccount,
  fetchEncodedAccount,
  fetchEncodedAccounts,
} from '@solana/accounts';
import {
  Address,
  getAddressDecoder,
  getAddressEncoder,
} from '@solana/addresses';
import {
  Codec,
  Decoder,
  Encoder,
  combineCodec,
  mapEncoder,
} from '@solana/codecs-core';
import {
  getArrayDecoder,
  getArrayEncoder,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
} from '@solana/codecs-data-structures';
import {
  getI64Decoder,
  getI64Encoder,
  getU64Decoder,
  getU64Encoder,
  getU8Decoder,
  getU8Encoder,
} from '@solana/codecs-numbers';
import {
  Option,
  OptionOrNullable,
  getOptionDecoder,
  getOptionEncoder,
} from '@solana/options';

export type ListState<TAddress extends string = string> = Account<
  ListStateAccountData,
  TAddress
>;

export type MaybeListState<TAddress extends string = string> = MaybeAccount<
  ListStateAccountData,
  TAddress
>;

export type ListStateAccountData = {
  discriminator: Array<number>;
  version: number;
  bump: Array<number>;
  owner: Address;
  assetId: Address;
  amount: bigint;
  currency: Option<Address>;
  expiry: bigint;
  privateTaker: Option<Address>;
  makerBroker: Option<Address>;
  /** owner is the rent payer when this is PublicKey::default */
  rentPayer: Address;
  reserved: Uint8Array;
  reserved1: Uint8Array;
};

export type ListStateAccountDataArgs = {
  version: number;
  bump: Array<number>;
  owner: Address;
  assetId: Address;
  amount: number | bigint;
  currency: OptionOrNullable<Address>;
  expiry: number | bigint;
  privateTaker: OptionOrNullable<Address>;
  makerBroker: OptionOrNullable<Address>;
  /** owner is the rent payer when this is PublicKey::default */
  rentPayer: Address;
  reserved: Uint8Array;
  reserved1: Uint8Array;
};

export function getListStateAccountDataEncoder() {
  return mapEncoder(
    getStructEncoder<{
      discriminator: Array<number>;
      version: number;
      bump: Array<number>;
      owner: Address;
      assetId: Address;
      amount: number | bigint;
      currency: OptionOrNullable<Address>;
      expiry: number | bigint;
      privateTaker: OptionOrNullable<Address>;
      makerBroker: OptionOrNullable<Address>;
      /** owner is the rent payer when this is PublicKey::default */
      rentPayer: Address;
      reserved: Uint8Array;
      reserved1: Uint8Array;
    }>([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['version', getU8Encoder()],
      ['bump', getArrayEncoder(getU8Encoder(), { size: 1 })],
      ['owner', getAddressEncoder()],
      ['assetId', getAddressEncoder()],
      ['amount', getU64Encoder()],
      ['currency', getOptionEncoder(getAddressEncoder())],
      ['expiry', getI64Encoder()],
      ['privateTaker', getOptionEncoder(getAddressEncoder())],
      ['makerBroker', getOptionEncoder(getAddressEncoder())],
      ['rentPayer', getAddressEncoder()],
      ['reserved', getBytesEncoder({ size: 32 })],
      ['reserved1', getBytesEncoder({ size: 64 })],
    ]),
    (value) => ({
      ...value,
      discriminator: [78, 242, 89, 138, 161, 221, 176, 75],
    })
  ) satisfies Encoder<ListStateAccountDataArgs>;
}

export function getListStateAccountDataDecoder() {
  return getStructDecoder<ListStateAccountData>([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['version', getU8Decoder()],
    ['bump', getArrayDecoder(getU8Decoder(), { size: 1 })],
    ['owner', getAddressDecoder()],
    ['assetId', getAddressDecoder()],
    ['amount', getU64Decoder()],
    ['currency', getOptionDecoder(getAddressDecoder())],
    ['expiry', getI64Decoder()],
    ['privateTaker', getOptionDecoder(getAddressDecoder())],
    ['makerBroker', getOptionDecoder(getAddressDecoder())],
    ['rentPayer', getAddressDecoder()],
    ['reserved', getBytesDecoder({ size: 32 })],
    ['reserved1', getBytesDecoder({ size: 64 })],
  ]) satisfies Decoder<ListStateAccountData>;
}

export function getListStateAccountDataCodec(): Codec<
  ListStateAccountDataArgs,
  ListStateAccountData
> {
  return combineCodec(
    getListStateAccountDataEncoder(),
    getListStateAccountDataDecoder()
  );
}

export function decodeListState<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress>
): ListState<TAddress>;
export function decodeListState<TAddress extends string = string>(
  encodedAccount: MaybeEncodedAccount<TAddress>
): MaybeListState<TAddress>;
export function decodeListState<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
): ListState<TAddress> | MaybeListState<TAddress> {
  return decodeAccount(
    encodedAccount as MaybeEncodedAccount<TAddress>,
    getListStateAccountDataDecoder()
  );
}

export async function fetchListState<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<ListState<TAddress>> {
  const maybeAccount = await fetchMaybeListState(rpc, address, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeListState<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<MaybeListState<TAddress>> {
  const maybeAccount = await fetchEncodedAccount(rpc, address, config);
  return decodeListState(maybeAccount);
}

export async function fetchAllListState(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<ListState[]> {
  const maybeAccounts = await fetchAllMaybeListState(rpc, addresses, config);
  assertAccountsExist(maybeAccounts);
  return maybeAccounts;
}

export async function fetchAllMaybeListState(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<MaybeListState[]> {
  const maybeAccounts = await fetchEncodedAccounts(rpc, addresses, config);
  return maybeAccounts.map((maybeAccount) => decodeListState(maybeAccount));
}