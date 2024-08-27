import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import { createDefaultAsset } from '@tensor-foundation/mpl-core';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findBidStatePda,
  getBidInstructionAsync,
  getCancelBidInstructionAsync,
  Target,
} from '../../src';

test('it can cancel an existing bid', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSigner();
  const seller = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);

  // Create a MPL core asset owned by the seller.
  const asset = await createDefaultAsset(
    client,
    payer,
    updateAuthority.address,
    seller.address,
    true // withRoyalties
  );

  // Create a bid by the buyer.
  const bidIx = await getBidInstructionAsync({
    owner: buyer,
    amount: 10,
    target: Target.AssetId,
    targetId: asset.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [bidState] = await findBidStatePda({
    owner: buyer.address,
    bidId: asset.address,
  });

  // Then the bid state should exist.
  t.true(
    (
      await fetchEncodedAccount(
        client.rpc,
        (
          await findBidStatePda({ owner: buyer.address, bidId: asset.address })
        )[0]
      )
    ).exists
  );

  // When the buyer cancels the bid.
  const cancelIx = await getCancelBidInstructionAsync({
    owner: buyer,
    bidId: asset.address,
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(cancelIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});
