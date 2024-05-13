import {
  Address,
  ProgramDerivedAddress,
  address,
  getAddressEncoder,
  getProgramDerivedAddress,
} from '@solana/addresses';
import { getUtf8Encoder } from '@solana/codecs';

export type AssociatedTokenAccountSeeds = {
  /** The address of the owner account */
  owner: Address;
  /** The address of the mint account */
  mint: Address;
  /** The address of the token program */
  tokenProgram: Address;
};

export async function findAssociatedTokenAccountPda(
  seeds: AssociatedTokenAccountSeeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' as Address<'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'>,
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getAddressEncoder().encode(seeds.owner),
      getAddressEncoder().encode(seeds.tokenProgram),
      getAddressEncoder().encode(seeds.mint),
    ],
  });
}

export type MetadataSeeds = {
  /** The address of the mint account */
  mint: Address;
};

export async function findMetadataPda(
  seeds: MetadataSeeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>,
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getUtf8Encoder().encode('metadata'),
      getAddressEncoder().encode(programAddress),
      getAddressEncoder().encode(seeds.mint),
    ],
  });
}

export type MasterEditionSeeds = {
  /** The address of the mint account */
  mint: Address;
};

export async function findMasterEditionPda(
  seeds: MasterEditionSeeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>,
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getUtf8Encoder().encode('metadata'),
      getAddressEncoder().encode(programAddress),
      getAddressEncoder().encode(seeds.mint),
      getUtf8Encoder().encode('edition'),
    ],
  });
}

export type TokenRecordSeeds = {
  /** The address of the mint account */
  mint: Address;
  /** The address of the token account */
  token: Address;
};

export async function findTokenRecordPda(
  seeds: TokenRecordSeeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s' as Address<'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'>,
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getUtf8Encoder().encode('metadata'),
      getAddressEncoder().encode(programAddress),
      getAddressEncoder().encode(seeds.mint),
      getUtf8Encoder().encode('token_record'),
      getAddressEncoder().encode(seeds.token),
    ],
  });
}

export type WnsApproveSeeds = {
  /** The address of the mint account */
  mint: Address;
};

export async function findWnsApprovePda(
  seeds: WnsApproveSeeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM' as Address<'wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM'>,
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getUtf8Encoder().encode('approve-account'),
      getAddressEncoder().encode(seeds.mint),
    ],
  });
}

export type WnsDistributionSeeds = {
  /** The address of the collection account */
  collection: Address;

  /** The address of the payment mint account */
  paymentMint?: Address | null;
};

export async function findWnsDistributionPda(
  seeds: WnsDistributionSeeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay' as Address<'diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay'>,
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getAddressEncoder().encode(seeds.collection),
      getAddressEncoder().encode(
        seeds.paymentMint ?? address('11111111111111111111111111111111')
      ),
    ],
  });
}

export type ExtraAccountMetasSeeds = {
  /** The address of the mint account */
  mint: Address;
};

export async function findExtraAccountMetasPda(
  seeds: ExtraAccountMetasSeeds,
  config: { programAddress: Address }
): Promise<ProgramDerivedAddress> {
  return await getProgramDerivedAddress({
    programAddress: config.programAddress,
    seeds: [
      getUtf8Encoder().encode('extra-account-metas'),
      getAddressEncoder().encode(seeds.mint),
    ],
  });
}

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
