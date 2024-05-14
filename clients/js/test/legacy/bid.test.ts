import { appendTransactionInstruction, pipe } from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import { createDefaultNft } from '@tensor-foundation/toolkit-token-metadata';
import test from 'ava';
import {
  BidState,
  Target,
  fetchBidStateFromSeeds,
  getBidInstructionAsync,
} from '../../src/index.js';

test('it can bid on a legacy NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft(client, owner, owner, owner);

  const bidIx = await getBidInstructionAsync({
    owner,
    amount: 1,
    target: Target.AssetId,
    targetId: mint,
  });

  // When we create a bid on the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then we should be able to fetch the bid state.
  const bid = await fetchBidStateFromSeeds(client.rpc, {
    owner: owner.address,
    bidId: mint,
  });
  t.like(bid, <BidState>{
    data: {
      owner: owner.address,
      amount: 1n,
      target: Target.AssetId,
      targetId: mint,
      cosigner: null,
    },
  });
});
