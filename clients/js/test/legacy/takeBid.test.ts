import {
  appendTransactionMessageInstruction,
  assertAccountDecoded,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultNft,
  fetchMetadata,
  findAtaPda,
} from '@tensor-foundation/mpl-token-metadata';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  expectCustomError,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED,
  TENSOR_MARKETPLACE_ERROR__WRONG_TARGET_ID,
  Target,
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidLegacyInstructionAsync,
} from '../../src/index.js';
import { BASIS_POINTS, DEFAULT_BID_PRICE } from '../_common.js';

test('it can take a bid on a legacy NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const buyer = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint, metadata } = await createDefaultNft({
    client,
    payer: seller,
    authority: seller,
    owner: seller.address,
  });

  const bidIx = await getBidInstructionAsync({
    owner: buyer,
    amount: DEFAULT_BID_PRICE,
    target: Target.AssetId,
    targetId: mint,
  });

  const md = (await fetchMetadata(client.rpc, metadata)).data;
  const { sellerFeeBasisPoints } = md;

  const minPrice =
    DEFAULT_BID_PRICE -
    (DEFAULT_BID_PRICE * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;

  // And the owner creates a bid on the NFT.
  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: buyer.address,
    seller,
    mint,
    minAmount: minPrice,
    creators: [seller.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findBidStatePda({ owner: buyer.address, bidId: mint }))[0]
      )
    ).exists
  );

  // And the owner has the NFT.
  const ownerToken = await fetchJsonParsedAccount(
    client.rpc,
    (await findAtaPda({ mint, owner: buyer.address }))[0]
  );
  assertAccountDecoded(ownerToken);

  t.like(ownerToken, {
    data: {
      tokenAmount: { amount: '1' },
    },
  });
});

test('it has to specify the correct makerBroker', async (t) => {
  const client = createDefaultSolanaClient();
  const seller = await generateKeyPairSignerWithSol(client);
  const bidder = await generateKeyPairSignerWithSol(client);
  const makerBroker = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority: seller,
    owner: seller.address,
  });

  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: 10,
    target: Target.AssetId,
    targetId: mint,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If makerBroker is not specified, it should fail.
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    mint,
    minAmount: 5,
    creators: [seller.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If makerBroker is specified incorrectly, it should fail.
  const wrongMakerBroker = await generateKeyPairSignerWithSol(client);

  const takeBidIx2 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    mint,
    minAmount: 10,
    creators: [seller.address],
    makerBroker: wrongMakerBroker.address,
  });
  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If makerBroker is specified correctly, it should succeed.
  const takeBidIx3 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    mint,
    minAmount: 10,
    creators: [seller.address],
    makerBroker: makerBroker.address,
  });
  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  const bidState = await findBidStatePda({
    owner: bidder.address,
    bidId: mint,
  });
  t.false((await fetchEncodedAccount(client.rpc, bidState[0])).exists);
});

test('it has to specify the correct privateTaker', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const privateTaker = await generateKeyPairSignerWithSol(client);
  const notPrivateTaker = await generateKeyPairSignerWithSol(client);

  const { mint: mintOwnedByNotPrivateTaker } = await createDefaultNft({
    client,
    payer: notPrivateTaker,
    authority: mintAuthority,
    owner: notPrivateTaker.address,
  });

  const { mint: mintOwnedByPrivateTaker } = await createDefaultNft({
    client,
    payer: privateTaker,
    authority: mintAuthority,
    owner: privateTaker.address,
  });

  // Bid on the NFT but specify another privateTaker
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId: mintOwnedByNotPrivateTaker,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: 10,
    target: Target.AssetId,
    targetId: mintOwnedByNotPrivateTaker,
    privateTaker: privateTaker.address,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When NotPrivateTaker tries to take the bid with privateTaker set to PrivateTaker, it fails.
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller: notPrivateTaker,
    mint: mintOwnedByNotPrivateTaker,
    minAmount: 10,
    bidState,
    creators: [mintAuthority.address],
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
    bidId: mintOwnedByPrivateTaker,
  });
  const bidIx2 = await getBidInstructionAsync({
    owner: bidder,
    amount: 10,
    target: Target.AssetId,
    targetId: mintOwnedByPrivateTaker,
    privateTaker: privateTaker.address,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const takeBidIx2 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller: privateTaker,
    mint: mintOwnedByPrivateTaker,
    minAmount: 5,
    creators: [mintAuthority.address],
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
  const cosigner = await generateKeyPairSignerWithSol(client);
  const notCosigner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority: seller,
    owner: seller.address,
  });

  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: 10,
    target: Target.AssetId,
    targetId: mint,
    cosigner,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the cosigner is not set, it should fail.
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    mint,
    minAmount: 5,
    creators: [seller.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // When the cosigner is set to the wrong address, it should fail too.
  const takeBidIx2 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    mint,
    minAmount: 5,
    cosigner: notCosigner,
    creators: [seller.address],
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // When the cosigner is signing, it should succeed.
  const takeBidIx3 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    mint,
    minAmount: 5,
    cosigner,
    creators: [seller.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const bidState = await findBidStatePda({
    owner: bidder.address,
    bidId: mint,
  });
  t.false((await fetchEncodedAccount(client.rpc, bidState[0])).exists);
});

test('it has to match the specified targetId', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority: seller,
    owner: seller.address,
  });

  const { mint: mint2 } = await createDefaultNft({
    client,
    payer: seller,
    authority: seller,
    owner: seller.address,
  });

  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId: mint,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: 10,
    target: Target.AssetId,
    targetId: mint,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the targetId is incorrect, it should fail.
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    mint: mint2,
    minAmount: 5,
    bidState,
    creators: [seller.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__WRONG_TARGET_ID);

  // When the targetId is correct, it should succeed.
  const takeBidIx2 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    mint,
    minAmount: 5,
    bidState,
    creators: [seller.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});
