import { appendTransactionInstruction, pipe } from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import {
  createDefaultNft,
  createDefaultpNft,
} from '@tensor-foundation/toolkit-token-metadata';
import test from 'ava';
import {
  ListState,
  TokenStandard,
  fetchListStateFromSeeds,
  getListLegacyInstructionAsync,
} from '../../src/index.js';

<<<<<<< HEAD
test.only('it can list a legacy NFT', async (t) => {
=======
test('it can list a legacy NFT', async (t) => {
>>>>>>> main
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft(client, owner, owner, owner);

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
  });

  // When we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then we should be able to fetch the listing.
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
});

test('it can list a legacy Programmable NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an pNFT.
  const { mint } = await createDefaultpNft(client, owner, owner, owner);

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
  });

  // When we list the pNFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then we should be able to fetch the listing.
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
});
