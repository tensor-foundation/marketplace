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
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findAssetListStatePda,
  getDelistCoreInstructionAsync,
  getListCoreInstructionAsync,
} from '../../src';

test('it can delist a listed core asset', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSigner();
  const owner = await generateKeyPairSigner();

  const price = 100_000_000n;

  // Create a MPL core asset.
  const asset = await createDefaultAsset(
    client,
    payer,
    updateAuthority.address,
    owner.address,
    true // withRoyalties
  );

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
