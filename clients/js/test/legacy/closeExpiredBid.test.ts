import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import { createDefaultNft } from '@tensor-foundation/mpl-token-metadata';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import { Mode } from '@tensor-foundation/whitelist';
import test from 'ava';
import {
  TENSOR_MARKETPLACE_ERROR__BID_NOT_YET_EXPIRED,
  Target,
  findBidStatePda,
  getBidInstructionAsync,
  getCloseExpiredBidInstructionAsync,
} from '../../src/index.js';
import { createWhitelistV2 } from '../_common.js';

test('it can close an expired a bid on a legacy NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner,
  });
  const price = 100_000_000n;
  const bidIx = await getBidInstructionAsync({
    owner,
    amount: price,
    target: Target.AssetId,
    targetId: mint,
    expireInSec: 1,
  });

  // And we create a bid on the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // And we wait for the listing to expire.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const preCloseOwnerFunds = (await client.rpc.getBalance(owner.address).send())
    .value;

  const closeExpiredBidIx = await getCloseExpiredBidInstructionAsync({
    owner: owner.address,
    bidId: mint,
  });

  // When we cancel the bid with a "generic" payer.
  const payer = await generateKeyPairSignerWithSol(client);
  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(closeExpiredBidIx, tx),
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

  // And the owner got his sol back (+ account rent)
  const postCloseOwnerFunds = (
    await client.rpc.getBalance(owner.address).send()
  ).value;
  t.assert(postCloseOwnerFunds >= preCloseOwnerFunds + price);
});

test('it cannot close an active bid on a legacy NFT', async (t) => {
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
    expireInSec: 10,
  });

  // And we create a bid on the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
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
      (tx) => appendTransactionMessageInstruction(closeExpiredBidIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('I cannot close an active bid');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TENSOR_MARKETPLACE_ERROR__BID_NOT_YET_EXPIRED,
        },
      },
    });
  }
});

test('it can close an expired a bid on a legacy collection', async (t) => {
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
  const price = 300_000_000n;
  const bidIx = await getBidInstructionAsync({
    owner,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
    expireInSec: 1,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // And we wait for the listing to expire.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const preCloseOwnerFunds = (await client.rpc.getBalance(owner.address).send())
    .value;

  const closeExpiredBidIx = await getCloseExpiredBidInstructionAsync({
    owner: owner.address,
    bidId,
  });

  // When we cancel the bid with a "generic" payer.
  const payer = await generateKeyPairSignerWithSol(client);
  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(closeExpiredBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findBidStatePda({ owner: owner.address, bidId: bidId }))[0]
      )
    ).exists
  );

  // And the owner got his sol back (+ account rent)
  const postCloseOwnerFunds = (
    await client.rpc.getBalance(owner.address).send()
  ).value;
  t.assert(postCloseOwnerFunds >= preCloseOwnerFunds + price);
});
