/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Account,
  Address,
  Codec,
  Decoder,
  EncodedAccount,
  Encoder,
  FetchAccountConfig,
  FetchAccountsConfig,
  MaybeAccount,
  MaybeEncodedAccount,
  ReadonlyUint8Array,
  assertAccountExists,
  assertAccountsExist,
  combineCodec,
  decodeAccount,
  fetchEncodedAccount,
  fetchEncodedAccounts,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  transformEncoder,
} from '@solana/web3.js';
import { BidTaSeeds, findBidTaPda } from '../pdas';

export type BidTa = { discriminator: ReadonlyUint8Array };

export type BidTaArgs = {};

export function getBidTaEncoder(): Encoder<BidTaArgs> {
  return transformEncoder(
    getStructEncoder([['discriminator', fixEncoderSize(getBytesEncoder(), 8)]]),
    (value) => ({
      ...value,
      discriminator: new Uint8Array([186, 230, 110, 26, 235, 24, 211, 156]),
    })
  );
}

export function getBidTaDecoder(): Decoder<BidTa> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
  ]);
}

export function getBidTaCodec(): Codec<BidTaArgs, BidTa> {
  return combineCodec(getBidTaEncoder(), getBidTaDecoder());
}

export function decodeBidTa<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress>
): Account<BidTa, TAddress>;
export function decodeBidTa<TAddress extends string = string>(
  encodedAccount: MaybeEncodedAccount<TAddress>
): MaybeAccount<BidTa, TAddress>;
export function decodeBidTa<TAddress extends string = string>(
  encodedAccount: EncodedAccount<TAddress> | MaybeEncodedAccount<TAddress>
): Account<BidTa, TAddress> | MaybeAccount<BidTa, TAddress> {
  return decodeAccount(
    encodedAccount as MaybeEncodedAccount<TAddress>,
    getBidTaDecoder()
  );
}

export async function fetchBidTa<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<Account<BidTa, TAddress>> {
  const maybeAccount = await fetchMaybeBidTa(rpc, address, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeBidTa<TAddress extends string = string>(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  address: Address<TAddress>,
  config?: FetchAccountConfig
): Promise<MaybeAccount<BidTa, TAddress>> {
  const maybeAccount = await fetchEncodedAccount(rpc, address, config);
  return decodeBidTa(maybeAccount);
}

export async function fetchAllBidTa(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<Account<BidTa>[]> {
  const maybeAccounts = await fetchAllMaybeBidTa(rpc, addresses, config);
  assertAccountsExist(maybeAccounts);
  return maybeAccounts;
}

export async function fetchAllMaybeBidTa(
  rpc: Parameters<typeof fetchEncodedAccounts>[0],
  addresses: Array<Address>,
  config?: FetchAccountsConfig
): Promise<MaybeAccount<BidTa>[]> {
  const maybeAccounts = await fetchEncodedAccounts(rpc, addresses, config);
  return maybeAccounts.map((maybeAccount) => decodeBidTa(maybeAccount));
}

export function getBidTaSize(): number {
  return 8;
}

export async function fetchBidTaFromSeeds(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  seeds: BidTaSeeds,
  config: FetchAccountConfig & { programAddress?: Address } = {}
): Promise<Account<BidTa>> {
  const maybeAccount = await fetchMaybeBidTaFromSeeds(rpc, seeds, config);
  assertAccountExists(maybeAccount);
  return maybeAccount;
}

export async function fetchMaybeBidTaFromSeeds(
  rpc: Parameters<typeof fetchEncodedAccount>[0],
  seeds: BidTaSeeds,
  config: FetchAccountConfig & { programAddress?: Address } = {}
): Promise<MaybeAccount<BidTa>> {
  const { programAddress, ...fetchConfig } = config;
  const [address] = await findBidTaPda(seeds, { programAddress });
  return await fetchMaybeBidTa(rpc, address, fetchConfig);
}