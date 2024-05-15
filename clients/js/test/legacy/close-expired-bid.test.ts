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
  TensorMarketplaceProgramErrorCode,
  findBidStatePda,
  getBidInstructionAsync,
  getCloseExpiredBidInstructionAsync,
} from '../../src/index.js';

test('it can close an expired a bid on a legacy NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft(client, owner, owner, owner);

  const bidIx = await getBidInstructionAsync({
    owner,
    amount: 1,
    target: Target.AssetId,
    targetId: mint,
    expireInSec: 1,
  });

  // And we create a bid on the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // And we wait for the listing to expire.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const closeExpiredBidIx = await getCloseExpiredBidInstructionAsync({
    owner: owner.address,
    bidId: mint,
  });

  // When we cancel the bid with a "generic" payer.
  const payer = await generateKeyPairSignerWithSol(client);
  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionInstruction(closeExpiredBidIx, tx),
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

test('it cannot close an active bid on a legacy NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft(client, owner, owner, owner);

  const bidIx = await getBidInstructionAsync({
    owner,
    amount: 1,
    target: Target.AssetId,
    targetId: mint,
    expireInSec: 10,
  });

  // And we create a bid on the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When we try to close an active bid.
  const closeExpiredBidIx = await getCloseExpiredBidInstructionAsync({
    owner: owner.address,
    bidId: mint,
  });

  // Then we expect an error.
  try {
    await pipe(
      await createDefaultTransaction(client, owner),
      (tx) => appendTransactionInstruction(closeExpiredBidIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('I cannot close an active bid');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TensorMarketplaceProgramErrorCode.BID_NOT_YET_EXPIRED,
        },
      },
    });
  }
});