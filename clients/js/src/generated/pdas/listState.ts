/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import {
  Address,
  ProgramDerivedAddress,
  getAddressEncoder,
  getProgramDerivedAddress,
} from '@solana/addresses';
import { getStringEncoder } from '@solana/codecs';

export type ListStateSeeds = {
  mint: Address;
};

export async function findListStatePda(
  seeds: ListStateSeeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>,
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getStringEncoder({ size: 'variable' }).encode('list_state'),
      getAddressEncoder().encode(seeds.mint),
    ],
  });
}
