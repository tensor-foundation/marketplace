import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import { createDefaultNft } from '@tensor-foundation/mpl-token-metadata';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  TENSOR_MARKETPLACE_ERROR__LISTING_NOT_YET_EXPIRED,
  fetchListStateFromSeeds,
  findListStatePda,
  getCloseExpiredListingLegacyInstructionAsync,
  getListLegacyInstructionAsync,
} from '../../src/index.js';

test('it can close an expired listing', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    expireInSec: 1,
  });

  // And we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: mint,
    },
  });

  // And we wait for the listing to expire.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // When we close an expired listing.
  const closeExpiredListingIx =
    await getCloseExpiredListingLegacyInstructionAsync({
      payer: owner,
      mint,
    });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(closeExpiredListingIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findListStatePda({ mint }))[0]
      )
    ).exists
  );
});

test('it cannot close an active listing', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    expireInSec: 100,
  });

  // And we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: mint,
    },
  });

  // When we try to close an active listing.
  const closeExpiredListingIx =
    await getCloseExpiredListingLegacyInstructionAsync({
      payer: owner,
      mint,
    });

  // Then we expect an error.
  try {
    await pipe(
      await createDefaultTransaction(client, owner),
      (tx) => appendTransactionMessageInstruction(closeExpiredListingIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('I cannot close an active listing');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TENSOR_MARKETPLACE_ERROR__LISTING_NOT_YET_EXPIRED,
        },
      },
    });
  }
});

test('it can close an expired listing with another payer', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    expireInSec: 1,
  });

  // And we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: mint,
    },
  });

  // And we wait for the listing to expire.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // When we close an expired listing with a different payer.
  const payer = await generateKeyPairSignerWithSol(client);
  const closeExpiredListingIx =
    await getCloseExpiredListingLegacyInstructionAsync({
      owner: owner.address,
      payer,
      mint,
    });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(closeExpiredListingIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findListStatePda({ mint }))[0]
      )
    ).exists
  );
});
