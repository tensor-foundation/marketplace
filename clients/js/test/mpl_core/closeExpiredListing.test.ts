import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  expectCustomError,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST,
  TENSOR_MARKETPLACE_ERROR__LISTING_NOT_YET_EXPIRED,
  fetchListStateFromSeeds,
  findListStatePda,
  getCloseExpiredListingCoreInstructionAsync,
  getListCoreInstructionAsync,
} from '../../src/index.js';
import { sleep } from '../_common.js';
import { createDefaultAsset } from '@tensor-foundation/mpl-core';

test('it can close an expired listing', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const asset = await createDefaultAsset({
    client,
    payer: owner,
    authority: owner,
    owner: owner.address,
    royalties: {
      creators: [{ address: owner.address, percentage: 100 }],
      basisPoints: 500,
    },
  });

  const listCoreIx = await getListCoreInstructionAsync({
    owner,
    asset: asset.address,
    payer: owner,
    amount: 1,
    expireInSec: 1,
  });

  // And we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint: asset.address,
  });

  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: asset.address,
    },
  });

  // And we wait for the listing to expire.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // When we close an expired listing.
  const closeExpiredListingIx =
    await getCloseExpiredListingCoreInstructionAsync({
      owner: owner.address,
      asset: asset.address,
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
        (await findListStatePda({ mint: asset.address }))[0]
      )
    ).exists
  );
});

test('it cannot close an active listing', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);

  // We create an NFT.
  const asset = await createDefaultAsset({
    client,
    payer: owner,
    authority: owner,
    owner: owner.address,
    royalties: {
      creators: [{ address: owner.address, percentage: 100 }],
      basisPoints: 500,
    },
  });

  const listCoreIx = await getListCoreInstructionAsync({
    owner,
    asset: asset.address,
    payer: owner,
    amount: 1,
    expireInSec: 100,
  });

  // And we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint: asset.address,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: asset.address,
    },
  });

  // When we try to close an active listing.
  const closeExpiredListingIx =
    await getCloseExpiredListingCoreInstructionAsync({
      owner: owner.address,
      asset: asset.address,
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
  const asset = await createDefaultAsset({
    client,
    payer: owner,
    authority: owner,
    owner: owner.address,
    royalties: {
      creators: [{ address: owner.address, percentage: 100 }],
      basisPoints: 500,
    },
  });

  const listCoreIx = await getListCoreInstructionAsync({
    owner,
    asset: asset.address,
    payer: owner,
    amount: 1,
    expireInSec: 1,
  });

  // And we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint: asset.address,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: asset.address,
    },
  });

  // And we wait for the listing to expire.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // When we close an expired listing with a different payer.
  const payer = await generateKeyPairSignerWithSol(client);
  const closeExpiredListingIx =
    await getCloseExpiredListingCoreInstructionAsync({
      owner: owner.address,
      asset: asset.address,
    });

  const ownerFundsBefore = await client.rpc.getBalance(owner.address).send();
  const listStateAccountRent = await client.rpc
    .getBalance(listing.address)
    .send();

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
        (await findListStatePda({ mint: asset.address }))[0]
      )
    ).exists
  );

  // And the owner received the rent.
  const ownerFundsAfter = await client.rpc.getBalance(owner.address).send();
  t.true(
    ownerFundsAfter.value ===
      ownerFundsBefore.value + listStateAccountRent.value
  );
});

test('the rent destination cannot differ from the payer of the listing', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const closer = await generateKeyPairSignerWithSol(client);
  const listPayer = await generateKeyPairSignerWithSol(client);
  const notListPayer = await generateKeyPairSignerWithSol(client);

  const asset = await createDefaultAsset({
    client,
    payer: owner,
    authority: owner,
    owner: owner.address,
    royalties: {
      creators: [{ address: owner.address, percentage: 100 }],
      basisPoints: 500,
    },
  });

  const listCoreIx = await getListCoreInstructionAsync({
    owner,
    asset: asset.address,
    amount: 1,
    expireInSec: 1,
    // (!)
    payer: listPayer,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await sleep(5000);

  const closeExpiredListingIx =
    await getCloseExpiredListingCoreInstructionAsync({
      asset: asset.address,
      owner: owner.address,
      // (!)
      rentDestination: notListPayer.address,
    });

  const tx = pipe(
    await createDefaultTransaction(client, closer),
    (tx) => appendTransactionMessageInstruction(closeExpiredListingIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST);
});
