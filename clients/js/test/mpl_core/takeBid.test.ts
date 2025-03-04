import { getTransferSolInstruction } from '@solana-program/system';
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
  LAMPORTS_PER_SOL,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidCoreInstructionAsync,
  Target,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED,
  TENSOR_MARKETPLACE_ERROR__WRONG_TARGET_ID,
} from '../../src';
import {
  BASIS_POINTS,
  expectCustomError,
  getAndFundFeeVault,
} from '../_common';

test('it can take a bid for a single asset', async (t) => {
  const client = createDefaultSolanaClient();
  const payer = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSigner();
  const seller = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSigner();

  const price = 10n;
  const basisPoints = 500;

  // Create a MPL core asset owned by the seller.
  const asset = await createDefaultAsset({
    client,
    authority: updateAuthority,
    owner: seller.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints,
    },
    payer,
  });

  // Create a bid by the buyer.
  const bidIx = await getBidInstructionAsync({
    owner: buyer,
    amount: price,
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

  const minAmount = price - (price * BigInt(basisPoints)) / BASIS_POINTS;

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    seller,
    owner: buyer.address,
    asset: asset.address,
    bidState,
    minAmount,
    creators: [creator.address],
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
  const creator = await generateKeyPairSigner();

  // Create a MPL core asset owned by the seller.
  const asset = await createDefaultAsset({
    client,
    authority: updateAuthority,
    owner: seller.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints: 500,
    },
    payer,
  });

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
    creators: [creator.address],
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

test('it has to specify the correct makerBroker', async (t) => {
  const client = createDefaultSolanaClient();
  const seller = await generateKeyPairSignerWithSol(client);
  const bidder = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSigner();
  const makerBroker = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSigner();

  const price = LAMPORTS_PER_SOL / 2n;
  const basisPoints = 500;

  const asset = await createDefaultAsset({
    client,
    authority: updateAuthority,
    owner: seller.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints,
    },
    payer: seller,
  });

  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: price,
    target: Target.AssetId,
    targetId: asset.address,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId: asset.address,
  });

  const minAmount = price - (price * BigInt(basisPoints)) / BASIS_POINTS;

  // If makerBroker is not specified, it should fail.
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    seller,
    owner: bidder.address,
    asset: asset.address,
    bidState,
    minAmount,
    creators: [creator.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If makerBroker is specified incorrectly, it should fail.
  const wrongMakerBroker = await generateKeyPairSignerWithSol(client);

  const takeBidIx2 = await getTakeBidCoreInstructionAsync({
    seller,
    owner: bidder.address,
    asset: asset.address,
    bidState,
    minAmount,
    creators: [updateAuthority.address],
    makerBroker: wrongMakerBroker.address,
  });
  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If makerBroker is specified correctly, it should succeed.
  const takeBidIx3 = await getTakeBidCoreInstructionAsync({
    seller,
    owner: bidder.address,
    asset: asset.address,
    bidState,
    minAmount,
    creators: [creator.address],
    makerBroker: makerBroker.address,
  });
  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('it has to specify the correct privateTaker', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const privateTaker = await generateKeyPairSignerWithSol(client);
  const notPrivateTaker = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSigner();

  const price = LAMPORTS_PER_SOL / 4n;
  const basisPoints = 500;

  const assetOwnedByNotPrivateTaker = await createDefaultAsset({
    client,
    authority: mintAuthority,
    owner: notPrivateTaker.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints,
    },
    payer: notPrivateTaker,
  });

  const assetOwnedByPrivateTaker = await createDefaultAsset({
    client,
    authority: mintAuthority,
    owner: privateTaker.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints,
    },
    payer: privateTaker,
  });

  // Bid on the NFT but specify another privateTaker
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId: assetOwnedByNotPrivateTaker.address,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: price,
    target: Target.AssetId,
    targetId: assetOwnedByNotPrivateTaker.address,
    privateTaker: privateTaker.address,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const minAmount = price - (price * BigInt(basisPoints)) / BASIS_POINTS;

  // When NotPrivateTaker tries to take the bid with privateTaker set to PrivateTaker, it fails.
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller: notPrivateTaker,
    asset: assetOwnedByNotPrivateTaker.address,
    minAmount,
    bidState,
    creators: [creator.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, notPrivateTaker),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED);

  // But when the privateTaker is set and equals the actual seller, it succeeds.
  const [bidState2] = await findBidStatePda({
    owner: bidder.address,
    bidId: assetOwnedByPrivateTaker.address,
  });
  const bidIx2 = await getBidInstructionAsync({
    owner: bidder,
    amount: price,
    target: Target.AssetId,
    targetId: assetOwnedByPrivateTaker.address,
    privateTaker: privateTaker.address,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const takeBidIx2 = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller: privateTaker,
    asset: assetOwnedByPrivateTaker.address,
    minAmount,
    creators: [creator.address],
    bidState: bidState2,
  });

  await pipe(
    await createDefaultTransaction(client, privateTaker),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.false((await fetchEncodedAccount(client.rpc, bidState2)).exists);
});

test('it has to specify the correct cosigner', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSigner();
  const cosigner = await generateKeyPairSignerWithSol(client);
  const notCosigner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSigner();

  const price = LAMPORTS_PER_SOL / 2n;
  const basisPoints = 500;

  const asset = await createDefaultAsset({
    client,
    authority: mintAuthority,
    owner: seller.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints,
    },
    payer: seller,
  });

  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId: asset.address,
  });

  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: price,
    target: Target.AssetId,
    targetId: asset.address,
    cosigner,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const minAmount = price - (price * BigInt(basisPoints)) / BASIS_POINTS;

  // When the cosigner is not set, it should fail.
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    asset: asset.address,
    minAmount,
    creators: [creator.address],
    bidState,
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // When the cosigner is set to the wrong address, it should fail too.
  const takeBidIx2 = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    asset: asset.address,
    minAmount,
    cosigner: notCosigner,
    creators: [creator.address],
    bidState,
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // When the cosigner is signing, it should succeed.
  const takeBidIx3 = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    asset: asset.address,
    minAmount,
    cosigner,
    creators: [creator.address],
    bidState,
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('it has to match the specified targetId', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSigner();
  const seller = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSigner();

  const asset = await createDefaultAsset({
    client,
    authority: mintAuthority,
    owner: seller.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints: 500,
    },
    payer: seller,
  });

  const asset2 = await createDefaultAsset({
    client,
    authority: mintAuthority,
    owner: seller.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints: 500,
    },
    payer: seller,
  });

  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId: asset.address,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.AssetId,
    targetId: asset.address,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the targetId is incorrect, it should fail.
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    asset: asset2.address,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__WRONG_TARGET_ID);

  // When the targetId is correct, it should succeed.
  const takeBidIx2 = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    asset: asset.address,
    minAmount: 5,
    bidState,
    creators: [creator.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});
