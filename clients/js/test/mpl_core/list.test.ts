import {
  createAndMintTo,
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import { createDefaultAsset } from '@tensor-foundation/mpl-core';
import test from 'ava';
import {
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  pipe,
  some,
} from '@solana/web3.js';
import {
  fetchListStateFromSeeds,
  fetchMaybeListStateFromSeeds,
  getListCoreInstructionAsync,
} from '../../src';

test('it can list a core asset', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSigner();
  const owner = await generateKeyPairSignerWithSol(client);

  const asset = await createDefaultAsset({
    client,
    payer,
    authority: updateAuthority,
    owner: owner.address,
    royalties: {
      creators: [{ address: updateAuthority.address, percentage: 100 }],
      basisPoints: 500,
    },
  });

  // List asset.
  const listCoreIx = await getListCoreInstructionAsync({
    asset: asset.address,
    owner,
    payer,
    amount: 100n,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should exist.
  const maybeListState = await fetchMaybeListStateFromSeeds(client.rpc, {
    mint: asset.address,
  });
  t.assert(maybeListState.exists);
});

test('it can list a core asset with an SPL token as currency', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSigner();
  const owner = await generateKeyPairSignerWithSol(client);

  const [{ mint: currency }] = await createAndMintTo({
    client,
    mintAuthority: authority,
    payer,
    recipient: owner.address,
    decimals: 0,
    initialSupply: 1000000n,
  });

  const asset = await createDefaultAsset({
    client,
    payer,
    authority,
    owner: owner.address,
    royalties: {
      creators: [{ address: authority.address, percentage: 100 }],
      basisPoints: 500,
    },
  });

  // If we list the asset...
  const listCoreIx = await getListCoreInstructionAsync({
    asset: asset.address,
    owner,
    payer,
    amount: 100n,
    currency,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... the list state should exist with the correct currency
  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint: asset.address,
  });
  t.like(listing, {
    data: {
      currency: some(currency),
    },
  });
});
