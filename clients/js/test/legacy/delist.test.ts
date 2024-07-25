import { getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';
import {
  appendTransactionMessageInstruction,
  assertAccountExists,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import { createDefaultNft } from '@tensor-foundation/mpl-token-metadata';
import { TokenStandard } from '@tensor-foundation/resolvers';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findListStatePda,
  getDelistLegacyInstructionAsync,
  getListLegacyInstructionAsync,
} from '../../src/index.js';

test('it can delist a legacy NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner,
  });

  // And we list the NFT.
  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // When we delist the NFT.
  const delistLegacyIx = await getDelistLegacyInstructionAsync({
    owner,
    mint,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(delistLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  const account = await fetchEncodedAccount(client.rpc, listing);
  t.false(account.exists);
});

test('it can delist a legacy Programmable NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an pNFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner,
    standard: TokenStandard.ProgrammableNonFungible,
  });

  const computeIx = getSetComputeUnitLimitInstruction({
    units: 300_000,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
  });

  // And we list the pNFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // When we delist the NFT.
  const delistLegacyIx = await getDelistLegacyInstructionAsync({
    owner,
    mint,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(delistLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  const account = await fetchEncodedAccount(client.rpc, listing);
  t.false(account.exists);
});
