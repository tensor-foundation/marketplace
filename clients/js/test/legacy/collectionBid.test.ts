import {
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import { Mode } from '@tensor-foundation/whitelist';
import test from 'ava';
import {
  Target,
  fetchBidStateFromSeeds,
  getBidInstructionAsync,
} from '../../src/index.js';
import { createWhitelistV2 } from '../_common.js';

test('it can bid on a legacy collection', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const creatorKeypair = await generateKeyPairSignerWithSol(client);

  // Create whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.FVC, value: creatorKeypair.address }],
  });

  const bidId = (await generateKeyPairSigner()).address;

  const bidIx = await getBidInstructionAsync({
    owner,
    amount: 1,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId: bidId,
  });

  // When we create a bid on the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then we should be able to fetch the bid state.
  const bid = await fetchBidStateFromSeeds(client.rpc, {
    owner: owner.address,
    bidId,
  });
  t.like(bid, {
    data: {
      owner: owner.address,
      amount: 1n,
      target: Target.Whitelist,
      targetId: whitelist,
      cosigner: null,
    },
  });
});
