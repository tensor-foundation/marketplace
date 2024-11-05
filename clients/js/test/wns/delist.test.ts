import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import { findAtaPda } from '@tensor-foundation/mpl-token-metadata';
import {
  ANCHOR_ERROR__CONSTRAINT_HAS_ONE,
  assertTokenNftOwnedBy,
  createDefaultSolanaClient,
  createDefaultTransaction,
  createWnsNftInGroup,
  expectCustomError,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findListStatePda,
  getDelistWnsInstructionAsync,
  getListWnsInstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST,
} from '../../src/index.js';
import { TestAction } from '../_common.js';
import { setupWnsTest } from './_common.js';

test('it can delist a listed WNS asset', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
  });
  const { nftOwner } = signers;
  const { mint, group, distribution } = nft;

  // When a buyer buys the NFT.
  const ix = await getDelistWnsInstructionAsync({
    owner: nftOwner,
    mint,
    distribution,
    collection: group,
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing!)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (
          await findAtaPda({
            mint,
            owner: listing!,
            tokenProgram: TOKEN22_PROGRAM_ID,
          })
        )[0]
      )
    ).exists
  );

  // And the owner has the NFT back.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: nftOwner.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });
});

test('the wrong owner cannot delist', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const wrongOwner = await generateKeyPairSignerWithSol(client);

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: owner,
    owner: owner.address,
    authority: owner,
  });

  const listWnsIx = await getListWnsInstructionAsync({
    mint,
    owner,
    payer: owner,
    amount: 1,
    collection: group,
    distribution,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listWnsIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listState] = await findListStatePda({ mint });

  const delistWnsIx = await getDelistWnsInstructionAsync({
    owner: wrongOwner,
    mint,
    listState,
    collection: group,
    distribution,
  });

  const tx = pipe(
    await createDefaultTransaction(client, wrongOwner),
    (tx) => appendTransactionMessageInstruction(delistWnsIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, ANCHOR_ERROR__CONSTRAINT_HAS_ONE);
});
test('the account rent destination cannot differ from the list state rent payer', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const wrongRentDestination = await generateKeyPairSignerWithSol(client);

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: owner,
    owner: owner.address,
    authority: owner,
  });

  const listWnsIx = await getListWnsInstructionAsync({
    mint,
    owner,
    payer: owner,
    amount: 1,
    collection: group,
    distribution,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listWnsIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listState] = await findListStatePda({ mint });

  const delistWnsIx = await getDelistWnsInstructionAsync({
    owner,
    mint,
    listState,
    collection: group,
    distribution,
    rentDestination: wrongRentDestination.address,
  });

  const tx = pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(delistWnsIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST);
});
