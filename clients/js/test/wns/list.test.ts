import {
  createAndMintTo,
  createDefaultSolanaClient,
  createDefaultTransaction,
  createWnsNftInGroup,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  appendTransactionMessageInstruction,
  pipe,
  some,
} from '@solana/web3.js';
import {
  fetchListStateFromSeeds,
  fetchMaybeListStateFromSeeds,
  getListWnsInstructionAsync,
} from '../../src';
import { DEFAULT_SFBP } from '../_common';

test('it can list a WNS NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const owner = await generateKeyPairSignerWithSol(client);
  const sellerFeeBasisPoints = DEFAULT_SFBP;

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: owner,
    owner: owner.address,
    authority: updateAuthority,
    data: {
      name: 'Test NFT',
      symbol: 'TNFT',
      uri: 'https://tensor.foundation/',
      royaltyBasisPoints: Number(sellerFeeBasisPoints),
      creators: [{ address: updateAuthority.address, share: 100 }],
    },
  });

  // List asset.
  const listWnsIx = await getListWnsInstructionAsync({
    mint,
    owner,
    amount: 100n,
    collection: group,
    distribution,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listWnsIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should exist.
  const maybeListState = await fetchMaybeListStateFromSeeds(client.rpc, {
    mint,
  });
  t.assert(maybeListState.exists);
});

test('it can list a WNS NFT with an SPL token as currency', async (t) => {
  const client = createDefaultSolanaClient();
  const authority = await generateKeyPairSignerWithSol(client);
  const owner = await generateKeyPairSignerWithSol(client);
  const sellerFeeBasisPoints = DEFAULT_SFBP;

  const [{ mint: currency }] = await createAndMintTo({
    client,
    mintAuthority: authority,
    payer: owner,
    recipient: owner.address,
    decimals: 0,
    initialSupply: 1000000n,
  });

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: owner,
    owner: owner.address,
    authority,
    data: {
      name: 'Test NFT',
      symbol: 'TNFT',
      uri: 'https://tensor.foundation/',
      royaltyBasisPoints: Number(sellerFeeBasisPoints),
      creators: [{ address: authority.address, share: 100 }],
    },
    paymentMint: currency,
  });

  // If we list the WNS NFT...
  const listWnsIx = await getListWnsInstructionAsync({
    owner,
    mint,
    amount: 100n,
    distribution,
    collection: group,
    currency: currency,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listWnsIx, tx),
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
