import {
  appendTransactionMessageInstruction,
  assertAccountExists,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import { createDefaultNft } from '@tensor-foundation/mpl-token-metadata';
import { TokenStandard } from '@tensor-foundation/resolvers';
import {
  ANCHOR_ERROR__CONSTRAINT_HAS_ONE,
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
  TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST,
} from '../../src/index.js';
import { expectCustomError } from '../_common.js';
import { computeIx } from './_common.js';

test('it can delist a legacy NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner: owner.address,
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
    owner: owner.address,
    standard: TokenStandard.ProgrammableNonFungible,
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

test('the wrong owner cannot delist', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const wrongOwner = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner: owner.address,
  });

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

  const [listState] = await findListStatePda({ mint });

  const delistLegacyIx = await getDelistLegacyInstructionAsync({
    owner: wrongOwner,
    listState,
    mint,
  });

  const tx = pipe(
    await createDefaultTransaction(client, wrongOwner),
    (tx) => appendTransactionMessageInstruction(delistLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, ANCHOR_ERROR__CONSTRAINT_HAS_ONE);
});
test('the account rent destination cannot differ from the list state rent payer', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const wrongRentDestination = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner: owner.address,
  });

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

  const [listState] = await findListStatePda({ mint });

  const delistLegacyIx = await getDelistLegacyInstructionAsync({
    owner,
    listState,
    mint,
    rentDestination: wrongRentDestination.address,
  });

  const tx = pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(delistLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST);
});
