import { appendTransactionMessageInstruction, pipe } from '@solana/web3.js';
import { createDefaultNft } from '@tensor-foundation/mpl-token-metadata';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  Target,
  fetchBidStateFromSeeds,
  getBidInstructionAsync,
} from '../../src/index.js';

test('it can bid on an NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner,
  });

  const bidIx = await getBidInstructionAsync({
    owner,
    amount: 1,
    target: Target.AssetId,
    targetId: mint,
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
    bidId: mint,
  });
  t.like(bid, {
    data: {
      owner: owner.address,
      amount: 1n,
      target: Target.AssetId,
      targetId: mint,
      cosigner: null,
    },
  });
});
