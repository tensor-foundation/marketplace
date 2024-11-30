import {
  createAndMintTo,
  createDefaultSolanaClient,
  createDefaultTransaction,
  createT22NftWithRoyalties,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
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
  getListT22InstructionAsync,
} from '../../src';
import { DEFAULT_SFBP } from '../_common';

test('it can list a T22 NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSigner();
  const owner = await generateKeyPairSignerWithSol(client);
  const sellerFeeBasisPoints = DEFAULT_SFBP;

  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
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
      value: sellerFeeBasisPoints.toString(),
    },
  });

  // List asset.
  const listT22Ix = await getListT22InstructionAsync({
    mint,
    owner,
    payer,
    amount: 100n,
    transferHookAccounts: extraAccountMetas.map((meta) => meta.address),
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should exist.
  const maybeListState = await fetchMaybeListStateFromSeeds(client.rpc, {
    mint,
  });
  t.assert(maybeListState.exists);
});

test('it can list a T22 with an SPL token as currency', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSigner();
  const owner = await generateKeyPairSignerWithSol(client);
  const sellerFeeBasisPoints = DEFAULT_SFBP;

  const [{ mint: currency }] = await createAndMintTo({
    client,
    mintAuthority: authority,
    payer,
    recipient: owner.address,
    decimals: 0,
    initialSupply: 1000000n,
  });

  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
    client,
    payer: owner,
    owner: owner.address,
    mintAuthority: authority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + authority.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });
  // If we list the T22 NFT...
  const listT22Ix = await getListT22InstructionAsync({
    mint,
    owner,
    payer,
    amount: 100n,
    currency,
    transferHookAccounts: extraAccountMetas.map((meta) => meta.address),
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... the list state should exist with the correct currency
  const listing = await fetchListStateFromSeeds(client.rpc, { mint });
  t.like(listing, {
    data: {
      currency: some(currency),
    },
  });
});
