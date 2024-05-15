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

export type BidStateSeeds = {
  owner: Address;

  bidId: Address;
};

export async function findBidStatePda(
  seeds: BidStateSeeds,
  config: { programAddress?: Address | undefined } = {}
): Promise<ProgramDerivedAddress> {
  const {
    programAddress = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>,
  } = config;
  return await getProgramDerivedAddress({
    programAddress,
    seeds: [
      getStringEncoder({ size: 'variable' }).encode('bid_state'),
      getAddressEncoder().encode(seeds.owner),
      getAddressEncoder().encode(seeds.bidId),
    ],
  });
}