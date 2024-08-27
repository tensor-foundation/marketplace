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
import test from 'ava';
import {
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidCoreInstructionAsync,
  Target,
} from '../../src';

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
