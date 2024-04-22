import {
  Address,
  ProgramDerivedAddress,
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
