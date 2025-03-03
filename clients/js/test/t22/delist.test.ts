import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import { findAtaPda } from '@tensor-foundation/mpl-token-metadata';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  createT22NftWithRoyalties,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
  ANCHOR_ERROR__CONSTRAINT_HAS_ONE,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findListStatePda,
  getDelistT22InstructionAsync,
  getListT22InstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST,
} from '../../src/index.js';
import {
  assertTokenNftOwnedBy,
  DEFAULT_SFBP,
  expectCustomError,
  TestAction,
} from '../_common.js';
import { setupT22Test } from './_common.js';

test('it can delist a listed T22 asset', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
  } = await setupT22Test({
    t,
    action: TestAction.List,
  });
  const { nftOwner } = signers;
  const { mint, extraAccountMetas } = nft;

  // When a buyer buys the NFT.
  const ix = await getDelistT22InstructionAsync({
    owner: nftOwner,
    mint,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
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
    mint: nft.mint,
    owner,
    payer: owner,
    amount: 1,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listState] = await findListStatePda({ mint: nft.mint });

  const delistT22Ix = await getDelistT22InstructionAsync({
    owner: wrongOwner,
    mint: nft.mint,
    listState,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  const tx = pipe(
    await createDefaultTransaction(client, wrongOwner),
    (tx) => appendTransactionMessageInstruction(delistT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, ANCHOR_ERROR__CONSTRAINT_HAS_ONE);
});
test('the account rent destination cannot differ from the list state rent payer', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const wrongRentDestination = await generateKeyPairSignerWithSol(client);

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
    mint: nft.mint,
    owner,
    payer: owner,
    amount: 1,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listState] = await findListStatePda({ mint: nft.mint });

  const delistT22Ix = await getDelistT22InstructionAsync({
    owner,
    mint: nft.mint,
    listState,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
    rentDestination: wrongRentDestination.address,
  });

  const tx = pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(delistT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST);
});
