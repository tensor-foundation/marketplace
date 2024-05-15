import {
  appendTransactionInstruction,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import { createDefaultNft } from '@tensor-foundation/toolkit-token-metadata';
import test from 'ava';
import {
  Target,
  findBidStatePda,
  getBidInstructionAsync,
  getCancelBidInstructionAsync,
} from '../../src/index.js';

test('it can cancel a bid on a legacy NFT', async (t) => {
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

  // And we create a bid on the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const cancelBidIx = await getCancelBidInstructionAsync({
    owner,
    bidId: mint,
  });

  // When we cancel the bid.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(cancelBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findBidStatePda({ owner: owner.address, bidId: mint }))[0]
      )
    ).exists
  );
});