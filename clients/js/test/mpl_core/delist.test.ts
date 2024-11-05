import {
  appendTransactionMessageInstruction,
  assertAccountExists,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  AssetV1,
  createDefaultAsset,
  fetchAssetV1,
} from '@tensor-foundation/mpl-core';
import {
  ANCHOR_ERROR__CONSTRAINT_HAS_ONE,
  createDefaultSolanaClient,
  createDefaultTransaction,
  expectCustomError,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findAssetListStatePda,
  getDelistCoreInstructionAsync,
  getListCoreInstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST,
} from '../../src';

test('it can delist a listed core asset', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSigner();
  const owner = await generateKeyPairSigner();
  const creator = await generateKeyPairSigner();

  const price = 100_000_000n;

  // Create a MPL core asset.
  const asset = await createDefaultAsset({
    client,
    authority: updateAuthority,
    owner: owner.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints: 500,
    },
    payer,
  });

  // Owner is the current owner.
  t.like(await fetchAssetV1(client.rpc, asset.address), <AssetV1>(<unknown>{
    address: asset.address,
    data: {
      owner: owner.address,
    },
  }));

  const [listState] = await findAssetListStatePda({ asset: asset.address });

  // List asset.
  const listCoreIx = await getListCoreInstructionAsync({
    asset: asset.address,
    owner,
    payer,
    amount: price,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should exist.
  assertAccountExists(await fetchEncodedAccount(client.rpc, listState));

  // Delist asset.
  const delistCoreIx = await getDelistCoreInstructionAsync({
    asset: asset.address,
    owner,
    rentDestination: payer.address,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(delistCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should be closed.
  t.false((await fetchEncodedAccount(client.rpc, listState)).exists);

  // And the owner has the NFT back.
  const assetAccount = await fetchAssetV1(client.rpc, asset.address);
  t.like(assetAccount, <AssetV1>(<unknown>{
    address: asset.address,
    data: {
      owner: owner.address,
    },
  }));
});

test('the wrong owner cannot delist', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const wrongOwner = await generateKeyPairSignerWithSol(client);

  const asset = await createDefaultAsset({
    client,
    authority: owner,
    owner: owner.address,
    royalties: {
      creators: [{ address: owner.address, percentage: 100 }],
      basisPoints: 500,
    },
    payer: owner,
  });

  const listCoreIx = await getListCoreInstructionAsync({
    asset: asset.address,
    owner,
    payer: owner,
    amount: 1,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listState] = await findAssetListStatePda({ asset: asset.address });

  const delistCoreIx = await getDelistCoreInstructionAsync({
    owner: wrongOwner,
    listState,
    asset: asset.address,
  });

  const tx = pipe(
    await createDefaultTransaction(client, wrongOwner),
    (tx) => appendTransactionMessageInstruction(delistCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, ANCHOR_ERROR__CONSTRAINT_HAS_ONE);
});
test('the account rent destination cannot differ from the list state rent payer', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const wrongRentDestination = await generateKeyPairSignerWithSol(client);

  const asset = await createDefaultAsset({
    client,
    authority: owner,
    owner: owner.address,
    royalties: {
      creators: [{ address: owner.address, percentage: 100 }],
      basisPoints: 500,
    },
    payer: owner,
  });

  const listCoreIx = await getListCoreInstructionAsync({
    asset: asset.address,
    owner,
    payer: owner,
    amount: 1,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listState] = await findAssetListStatePda({ asset: asset.address });

  const delistCoreIx = await getDelistCoreInstructionAsync({
    owner,
    listState,
    asset: asset.address,
    rentDestination: wrongRentDestination.address,
  });

  const tx = pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(delistCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST);
});
