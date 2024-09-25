import {
  appendTransactionMessageInstruction,
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
import { getTransferSolInstruction } from '@solana-program/system';
import test from 'ava';
import {
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidCoreInstructionAsync,
  Target,
} from '../../src';
import { getAndFundFeeVault } from '../_common';

test('it can take a bid for a single asset', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSigner();
  const seller = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);

  // Create a MPL core asset owned by the seller.
  const asset = await createDefaultAsset(
    client,
    payer,
    updateAuthority.address,
    seller.address,
    true // withRoyalties
  );

  // Create a bid by the buyer.
  const bidIx = await getBidInstructionAsync({
    owner: buyer,
    amount: 10,
    target: Target.AssetId,
    targetId: asset.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [bidState] = await findBidStatePda({
    owner: buyer.address,
    bidId: asset.address,
  });

  await getAndFundFeeVault(client, bidState);

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    seller,
    owner: buyer.address,
    asset: asset.address,
    bidState,
    minAmount: 0,
    creators: [updateAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);

  // And the buyer has the NFT.
  const assetAccount = await fetchAssetV1(client.rpc, asset.address);
  t.like(assetAccount, <AssetV1>(<unknown>{
    address: asset.address,
    data: {
      owner: buyer.address,
    },
  }));
});

test('it can close an exhausted bid even with remaining balance', async (t) => {
  // A bid with `quantity_left` of 0 should be closed even if it has some excess balance.
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSigner();
  const seller = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);

  // Create a MPL core asset owned by the seller.
  const asset = await createDefaultAsset(
    client,
    payer,
    updateAuthority.address,
    seller.address,
    true // withRoyalties
  );

  // Create a bid by the buyer.
  const bidIx = await getBidInstructionAsync({
    owner: buyer,
    amount: 10_000_000,
    target: Target.AssetId,
    targetId: asset.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [bidState] = await findBidStatePda({
    owner: buyer.address,
    bidId: asset.address,
  });

  await getAndFundFeeVault(client, bidState);

  // Transfer extra lamports to the bid state.
  const transferIx = getTransferSolInstruction({
    source: payer,
    destination: bidState,
    amount: 1_000_000,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(transferIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    seller,
    owner: buyer.address,
    asset: asset.address,
    bidState,
    minAmount: 9_000_000,
    creators: [updateAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) =>
      signAndSendTransaction(client, tx, {
        skipPreflight: true,
      })
  );

  // Then the bid state should not exist.
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);

  // And the buyer has the NFT.
  const assetAccount = await fetchAssetV1(client.rpc, asset.address);
  t.like(assetAccount, <AssetV1>(<unknown>{
    address: asset.address,
    data: {
      owner: buyer.address,
    },
  }));
});
