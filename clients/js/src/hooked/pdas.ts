import {
  Address,
  ProgramDerivedAddress,
  address,
  getAddressEncoder,
  getProgramDerivedAddress,
  getU8Encoder,
  getUtf8Encoder,
} from '@solana/web3.js';

export type TreeAuthoritySeeds = {
  /** The address of the merkle tree */
  merkleTree: Address;
};

export async function findTreeAuthorityPda(
  seeds: TreeAuthoritySeeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY' as Address<'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY'>,
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [getAddressEncoder().encode(seeds.merkleTree)],
  });
}

// --- FEE VAULT PDA

export type FeeVaultSeeds = {
  /** The address of the state account to derive the shard from: e.g. pool, bid, order etc. */
  address: Address;
};

export async function findFeeVaultPda(
  seeds: FeeVaultSeeds
): Promise<ProgramDerivedAddress> {
  // Last byte of state account address is the fee vault shard number.
  const bytes = getAddressEncoder().encode(seeds.address);
  const lastByte = bytes[bytes.length - 1];

  return await getProgramDerivedAddress({
    programAddress: address('TFEEgwDP6nn1s8mMX2tTNPPz8j2VomkphLUmyxKm17A'),
    seeds: [
      getUtf8Encoder().encode('fee_vault'),
      getU8Encoder().encode(lastByte),
    ],
  });
}
