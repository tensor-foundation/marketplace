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
  ListState,
  TensorMarketplaceProgramErrorCode,
  fetchListStateFromSeeds,
  findListStatePda,
  getCloseExpiredListingLegacyInstructionAsync,
  getListLegacyInstructionAsync,
} from '../../src/index.js';

test('it can close an expired listing', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft(client, owner, owner, owner);

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    expireInSec: 1,
  });

  // And we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint,
  });
  t.like(listing, <ListState>{
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: mint,
    },
  });

  // And we wait for the listing to expire.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // When we close an expired listing.
  const closeExpiredListingIx =
    await getCloseExpiredListingLegacyInstructionAsync({
      owner: owner.address,
      mint,
    });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(closeExpiredListingIx, tx),
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
  const { mint } = await createDefaultNft(client, owner, owner, owner);

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    expireInSec: 100,
  });

  // And we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint,
  });
  t.like(listing, <ListState>{
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: mint,
    },
  });

  // When we try to close an active listing.
  const closeExpiredListingIx =
    await getCloseExpiredListingLegacyInstructionAsync({
      owner: owner.address,
      mint,
    });

  // Then we expect an error.
  try {
    await pipe(
      await createDefaultTransaction(client, owner),
      (tx) => appendTransactionInstruction(closeExpiredListingIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('I cannot close an active listing');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TensorMarketplaceProgramErrorCode.LISTING_NOT_YET_EXPIRED,
        },
      },
    });
  }
});