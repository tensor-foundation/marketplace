import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import {
  AssetV1,
  createDefaultAsset,
  fetchAssetV1,
} from '@tensor-foundation/mpl-core';
import test from 'ava';
import {
  appendTransactionMessageInstruction,
  assertAccountExists,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  findFeeVaultPda,
  findListStatePda,
  getBuyCoreInstruction,
  getListCoreInstruction,
} from '../../src';

test('it can buy a listed core asset with SOL', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSigner();
  const owner = await generateKeyPairSigner();
  const buyer = await generateKeyPairSignerWithSol(client);

  const price = 100_000_000n;
  const royalties = 5_000_000n;
  const maxPrice = 125_000_000n;

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

  const [listState] = await findListStatePda({ mint: asset.address });
  const [feeVault] = await findFeeVaultPda({ address: listState });

  // List asset.
  const listCoreIx = getListCoreInstruction({
    asset: asset.address,
    listState,
    owner,
    payer,
    amount: price,
  });
  t.pass();

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should exist.
  assertAccountExists(await fetchEncodedAccount(client.rpc, listState));

  // Buy listed asset.
  const buyCoreIx = getBuyCoreInstruction({
    asset: asset.address,
    listState,
    feeVault,
    payer: buyer,
    rentDestination: payer.address,
    owner: owner.address,
    buyer: buyer.address,
    maxAmount: maxPrice,
    creators: [updateAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx, { skipPreflight: true })
  );

  // List state should be closed.
  t.false((await fetchEncodedAccount(client.rpc, listState)).exists);

  // Buyer is the new owner.
  t.like(await fetchAssetV1(client.rpc, asset.address), <AssetV1>(<unknown>{
    address: asset.address,
    data: {
      owner: buyer.address,
    },
  }));

  // Update authority should have received royalties as the creator on the royalty plugin.
  const updateAuthorityBalance = (
    await client.rpc.getBalance(updateAuthority.address).send()
  ).value;
  t.is(BigInt(updateAuthorityBalance), royalties);
});
