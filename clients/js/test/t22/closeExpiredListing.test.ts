import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  createT22NftWithRoyalties,
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
  getCloseExpiredListingT22InstructionAsync,
  getListT22InstructionAsync,
} from '../../src/index.js';
import { DEFAULT_SFBP, sleep } from '../_common.js';

test('it can close an expired listing', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSigner();

  // We create an NFT.
  const nft = await createT22NftWithRoyalties({
    client,
    payer: owner,
    owner: owner.address,
    mintAuthority: updateAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + updateAuthority.address,
      value: DEFAULT_SFBP.toString(),
    },
  });
  const listT22Ix = await getListT22InstructionAsync({
    owner,
    mint: nft.mint,
    amount: 1,
    expireInSec: 1,
    transferHookAccounts: nft.extraAccountMetas.map((meta) => meta.address),
  });

  // And we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint: nft.mint,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: nft.mint,
    },
  });

  // And we wait for the listing to expire.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // When we close an expired listing.
  const closeExpiredListingIx = await getCloseExpiredListingT22InstructionAsync(
    {
      payer: owner,
      mint: nft.mint,
      transferHookAccounts: nft.extraAccountMetas.map((meta) => meta.address),
    }
  );

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
        (await findListStatePda({ mint: nft.mint }))[0]
      )
    ).exists
  );
});

test('it cannot close an active listing', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const nft = await createT22NftWithRoyalties({
    client,
    payer: owner,
    owner: owner.address,
    mintAuthority: owner,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + owner.address,
      value: DEFAULT_SFBP.toString(),
    },
  });

  const listT22Ix = await getListT22InstructionAsync({
    owner,
    mint: nft.mint,
    amount: 1,
    expireInSec: 100,
    transferHookAccounts: nft.extraAccountMetas.map((meta) => meta.address),
  });

  // And we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint: nft.mint,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: nft.mint,
    },
  });

  // When we try to close an active listing.
  const closeExpiredListingIx = await getCloseExpiredListingT22InstructionAsync(
    {
      payer: owner,
      mint: nft.mint,
      transferHookAccounts: nft.extraAccountMetas.map((meta) => meta.address),
    }
  );
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
  const nft = await createT22NftWithRoyalties({
    client,
    payer: owner,
    owner: owner.address,
    mintAuthority: owner,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + owner.address,
      value: DEFAULT_SFBP.toString(),
    },
  });

  const listT22Ix = await getListT22InstructionAsync({
    owner,
    mint: nft.mint,
    amount: 1,
    expireInSec: 1,
    transferHookAccounts: nft.extraAccountMetas.map((meta) => meta.address),
  });

  // And we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint: nft.mint,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: nft.mint,
    },
  });

  // And we wait for the listing to expire.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const ownerFundsBefore = await client.rpc.getBalance(owner.address).send();
  const listStateAccountRent = await client.rpc
    .getBalance(listing.address)
    .send();

  // When we close an expired listing with a different payer.
  const payer = await generateKeyPairSignerWithSol(client);
  const closeExpiredListingIx = await getCloseExpiredListingT22InstructionAsync(
    {
      owner: owner.address,
      payer,
      mint: nft.mint,
      transferHookAccounts: nft.extraAccountMetas.map((meta) => meta.address),
    }
  );

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
        (await findListStatePda({ mint: nft.mint }))[0]
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

  const nft = await createT22NftWithRoyalties({
    client,
    payer: owner,
    owner: owner.address,
    mintAuthority: owner,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + owner.address,
      value: DEFAULT_SFBP.toString(),
    },
  });

  const listT22Ix = await getListT22InstructionAsync({
    owner,
    mint: nft.mint,
    amount: 1,
    expireInSec: 1,
    transferHookAccounts: nft.extraAccountMetas.map((meta) => meta.address),
    // (!)
    payer: listPayer,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await sleep(5000);

  const closeExpiredListingIx = await getCloseExpiredListingT22InstructionAsync(
    {
      payer: closer,
      mint: nft.mint,
      owner: owner.address,
      transferHookAccounts: nft.extraAccountMetas.map((meta) => meta.address),
      // (!)
      rentDestination: notListPayer.address,
    }
  );

  const tx = pipe(
    await createDefaultTransaction(client, closer),
    (tx) => appendTransactionMessageInstruction(closeExpiredListingIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST);
});
