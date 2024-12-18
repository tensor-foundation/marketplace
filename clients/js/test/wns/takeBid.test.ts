import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  createWnsNftInGroup,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidWnsInstructionAsync,
  Target,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED,
  TENSOR_MARKETPLACE_ERROR__WRONG_TARGET_ID,
} from '../../src/index.js';
import {
  assertTokenNftOwnedBy,
  BASIS_POINTS,
  BROKER_FEE_PCT,
  COMPUTE_500K_IX,
  expectCustomError,
  HUNDRED_PCT,
  LAMPORTS_PER_SOL,
  MAKER_BROKER_FEE_PCT,
  TAKER_FEE_BPS,
  TestAction,
} from '../_common.js';
import { setupWnsTest } from './_common.js';

test('it can take a bid on a WNS NFT', async (t) => {
  const {
    client,
    signers,
    nft,
    price: bidPrice,
    state: bidState,
  } = await setupWnsTest({
    t,
    action: TestAction.Bid,
  });

  const { buyer, nftOwner } = signers;
  const { mint, group, distribution } = nft;

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: buyer.address, // Bid owner--the buyer
    seller: nftOwner, // NFT holder--the seller
    mint,
    distribution,
    collection: group,
    minAmount: bidPrice,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);

  // And the owner has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });
});

test('fees are paid correctly', async (t) => {
  const {
    client,
    signers,
    nft,
    price: bidPrice,
    state: bidState,
    feeVault,
  } = await setupWnsTest({
    t,
    action: TestAction.Bid,
  });

  const { buyer, nftOwner } = signers;
  const { mint, group, distribution, sellerFeeBasisPoints } = nft;

  const startingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  const startingDistributionBalance = (
    await client.rpc.getBalance(distribution).send()
  ).value;

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: buyer.address, // Bid owner--the buyer
    seller: nftOwner, // NFT holder--the seller
    mint,
    distribution,
    collection: group,
    minAmount: bidPrice,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);

  // And the owner has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const endingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  // Fee vault gets entire protocol fee because no maker or taker brokers are set.
  t.assert(
    endingFeeVaultBalance >=
      startingFeeVaultBalance + (bidPrice * TAKER_FEE_BPS) / BASIS_POINTS
  );

  // Check that the royalties were paid correctly.
  // WNS royalties go to the distribution account and not directly to the creator.
  const endingDistributionBalance = (
    await client.rpc.getBalance(distribution).send()
  ).value;
  t.assert(
    endingDistributionBalance ===
      startingDistributionBalance +
        (bidPrice * sellerFeeBasisPoints) / BASIS_POINTS
  );
});

test('royalties are enforced when min_amount is zero', async (t) => {
  const {
    client,
    signers,
    nft,
    price: bidPrice,
    state: bidState,
    feeVault,
  } = await setupWnsTest({
    t,
    action: TestAction.Bid,
  });

  const { buyer, nftOwner } = signers;
  const { mint, group, distribution, sellerFeeBasisPoints } = nft;

  const startingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  const startingDistributionBalance = (
    await client.rpc.getBalance(distribution).send()
  ).value;

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: buyer.address, // Bid owner--the buyer
    seller: nftOwner, // NFT holder--the seller
    mint,
    distribution,
    collection: group,
    minAmount: 0,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);

  // And the owner has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const endingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  // Fee vault gets entire protocol fee because no maker or taker brokers are set.
  t.assert(
    endingFeeVaultBalance >=
      startingFeeVaultBalance + (bidPrice * TAKER_FEE_BPS) / BASIS_POINTS
  );

  // Check that the royalties were paid correctly.
  // WNS royalties go to the distribution account and not directly to the creator.
  const endingDistributionBalance = (
    await client.rpc.getBalance(distribution).send()
  ).value;
  t.assert(
    endingDistributionBalance ===
      startingDistributionBalance +
        (bidPrice * sellerFeeBasisPoints) / BASIS_POINTS
  );
});

test('maker and taker brokers receive correct split', async (t) => {
  const {
    client,
    signers,
    nft,
    price: bidPrice,
    state: bidState,
    feeVault,
  } = await setupWnsTest({
    t,
    action: TestAction.Bid,
    useMakerBroker: true,
  });

  const { buyer, nftOwner, makerBroker, takerBroker } = signers;
  const { mint, group, distribution, sellerFeeBasisPoints } = nft;

  const startingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  const startingDistributionBalance = (
    await client.rpc.getBalance(distribution).send()
  ).value;

  const startingMakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(makerBroker.address).send()).value
  );

  const startingTakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(takerBroker.address).send()).value
  );

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: buyer.address, // Bid owner--the buyer
    seller: nftOwner, // NFT holder--the seller
    mint,
    distribution,
    collection: group,
    minAmount: bidPrice,
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);

  // And the owner has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const endingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  // Taker fee is calculated from the listing price and the TAKER_FEE_BPS.
  const takerFee = (bidPrice * TAKER_FEE_BPS) / BASIS_POINTS;
  // Taker fee is split between the brokers and the protocol based on the BROKER_FEE_PCT.
  const brokerFee = (takerFee * BROKER_FEE_PCT) / HUNDRED_PCT;
  const protocolFee = takerFee - brokerFee;
  // Maker broker receives MAKER_BROKER_PCT of the protocol fee.
  const makerBrokerFee = (brokerFee! * MAKER_BROKER_FEE_PCT) / HUNDRED_PCT;
  // Taker broker receives whatever is left of the broker fee.
  const takerBrokerFee = brokerFee! - makerBrokerFee;

  // Fee vault receives whatever brokers don't receive, currently half of the taker fee.
  t.assert(endingFeeVaultBalance >= startingFeeVaultBalance + protocolFee);

  // Check that the royalties were paid correctly.
  // WNS royalties go to the distribution account and not directly to the creator.
  const endingDistributionBalance = (
    await client.rpc.getBalance(distribution).send()
  ).value;
  t.assert(
    endingDistributionBalance ===
      startingDistributionBalance +
        (bidPrice * sellerFeeBasisPoints) / BASIS_POINTS
  );

  const endingMakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(makerBroker.address).send()).value
  );

  const endingTakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(takerBroker.address).send()).value
  );

  t.assert(
    endingMakerBrokerBalance === startingMakerBrokerBalance + makerBrokerFee
  );

  // Taker broker receives whatever is left of the protocol fee.
  t.assert(
    endingTakerBrokerBalance === startingTakerBrokerBalance + takerBrokerFee
  );
});

test('taker broker receives correct split even if maker broker is not set', async (t) => {
  const {
    client,
    signers,
    nft,
    price: bidPrice,
    state: bidState,
    feeVault,
  } = await setupWnsTest({
    t,
    action: TestAction.Bid,
    // not setting maker broker
  });

  const { buyer, nftOwner, takerBroker } = signers;
  const { mint, group, distribution, sellerFeeBasisPoints } = nft;

  const startingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  const startingDistributionBalance = (
    await client.rpc.getBalance(distribution).send()
  ).value;

  const startingTakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(takerBroker.address).send()).value
  );

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: buyer.address, // Bid owner--the buyer
    seller: nftOwner, // NFT holder--the seller
    mint,
    distribution,
    collection: group,
    minAmount: bidPrice,
    // makerBroker not passed in because not set
    takerBroker: takerBroker.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);

  // And the owner has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const endingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  // Taker fee is calculated from the listing price and the TAKER_FEE_BPS.
  const takerFee = (bidPrice * TAKER_FEE_BPS) / BASIS_POINTS;
  // Taker fee is split between the brokers and the protocol based on the BROKER_FEE_PCT.
  const brokerFee = (takerFee! * BROKER_FEE_PCT) / HUNDRED_PCT;
  const protocolFee = takerFee - brokerFee;
  // Maker broker receives MAKER_BROKER_PCT of the protocol fee.
  const makerBrokerFee = (brokerFee! * MAKER_BROKER_FEE_PCT) / HUNDRED_PCT;
  // Taker broker receives whatever is left of the broker fee.
  const takerBrokerFee = brokerFee! - makerBrokerFee;

  // Fee vault receives it's split of the protocol fee and also the maker broker fee since it's not set.'
  t.assert(
    endingFeeVaultBalance >=
      startingFeeVaultBalance + protocolFee + makerBrokerFee
  );

  // Check that the royalties were paid correctly.
  // WNS royalties go to the distribution account and not directly to the creator.
  const endingDistributionBalance = (
    await client.rpc.getBalance(distribution).send()
  ).value;
  t.assert(
    endingDistributionBalance ===
      startingDistributionBalance +
        (bidPrice * sellerFeeBasisPoints) / BASIS_POINTS
  );

  const endingTakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(takerBroker.address).send()).value
  );

  // Taker broker should still receive its share.
  t.assert(
    endingTakerBrokerBalance === startingTakerBrokerBalance + takerBrokerFee
  );
});

test('it has to specify the correct makerBroker', async (t) => {
  const client = createDefaultSolanaClient();
  const seller = await generateKeyPairSignerWithSol(client);
  const bidder = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const makerBroker = await generateKeyPairSignerWithSol(client);

  // Mint NFT
  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: seller,
    owner: seller.address,
    authority: updateAuthority,
  });

  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.AssetId,
    targetId: mint,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId: mint,
  });

  // If makerBroker is not specified, it should fail.
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    seller,
    owner: bidder.address,
    mint,
    distribution,
    collection: group,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If makerBroker is specified incorrectly, it should fail.
  const wrongMakerBroker = await generateKeyPairSignerWithSol(client);

  const takeBidIx2 = await getTakeBidWnsInstructionAsync({
    seller,
    owner: bidder.address,
    mint,
    distribution,
    collection: group,
    minAmount: LAMPORTS_PER_SOL / 2n,
    makerBroker: wrongMakerBroker.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });
  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If makerBroker is specified correctly, it should succeed.
  const takeBidIx3 = await getTakeBidWnsInstructionAsync({
    seller,
    owner: bidder.address,
    mint,
    distribution,
    collection: group,
    minAmount: LAMPORTS_PER_SOL / 2n,
    makerBroker: makerBroker.address,
    bidState,
    tokenProgram: TOKEN22_PROGRAM_ID,
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

  const {
    mint: mintOwnedByPrivateTaker,
    distribution,
    group,
  } = await createWnsNftInGroup({
    client,
    payer: privateTaker,
    owner: privateTaker.address,
    authority: mintAuthority,
  });

  const {
    mint: mintOwnedByNotPrivateTaker,
    distribution: distribution2,
    group: group2,
  } = await createWnsNftInGroup({
    client,
    payer: notPrivateTaker,
    owner: notPrivateTaker.address,
    authority: mintAuthority,
  });

  // Bid on the NFT but specify another privateTaker
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId: mintOwnedByNotPrivateTaker,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 4n,
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
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    seller: notPrivateTaker,
    owner: bidder.address,
    mint: mintOwnedByNotPrivateTaker,
    minAmount: LAMPORTS_PER_SOL / 4n,
    bidState,
    tokenProgram: TOKEN22_PROGRAM_ID,
    distribution,
    collection: group,
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
    amount: LAMPORTS_PER_SOL / 4n,
    target: Target.AssetId,
    targetId: mintOwnedByPrivateTaker,
    privateTaker: privateTaker.address,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const takeBidIx2 = await getTakeBidWnsInstructionAsync({
    owner: bidder.address,
    seller: privateTaker,
    mint: mintOwnedByPrivateTaker,
    minAmount: LAMPORTS_PER_SOL / 4n,
    bidState: bidState2,
    tokenProgram: TOKEN22_PROGRAM_ID,
    distribution: distribution2,
    collection: group2,
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
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const cosigner = await generateKeyPairSignerWithSol(client);
  const notCosigner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: seller,
    owner: seller.address,
    authority: mintAuthority,
  });

  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId: mint,
  });

  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
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
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: bidder.address,
    seller,
    mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    tokenProgram: TOKEN22_PROGRAM_ID,
    distribution,
    collection: group,
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // When the cosigner is set to the wrong address, it should fail too.
  const takeBidIx2 = await getTakeBidWnsInstructionAsync({
    owner: bidder.address,
    seller,
    mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    cosigner: notCosigner,
    bidState,
    tokenProgram: TOKEN22_PROGRAM_ID,
    distribution,
    collection: group,
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // When the cosigner is signing, it should succeed.
  const takeBidIx3 = await getTakeBidWnsInstructionAsync({
    owner: bidder.address,
    seller,
    mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    cosigner,
    bidState,
    tokenProgram: TOKEN22_PROGRAM_ID,
    distribution,
    collection: group,
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
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: seller,
    owner: seller.address,
    authority: mintAuthority,
  });

  const {
    mint: mint2,
    group: group2,
    distribution: distribution2,
  } = await createWnsNftInGroup({
    client,
    payer: seller,
    owner: seller.address,
    authority: mintAuthority,
  });

  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId: mint,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.AssetId,
    targetId: mint,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the targetId is incorrect, it should fail.
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: bidder.address,
    seller,
    mint: mint2,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    tokenProgram: TOKEN22_PROGRAM_ID,
    distribution: distribution2,
    collection: group2,
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__WRONG_TARGET_ID);

  // When the targetId is correct, it should succeed.
  const takeBidIx2 = await getTakeBidWnsInstructionAsync({
    owner: bidder.address,
    seller,
    mint,
    minAmount: 5,
    bidState,
    tokenProgram: TOKEN22_PROGRAM_ID,
    distribution,
    collection: group,
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});
