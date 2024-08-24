import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultTransaction,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import { getTakeBidWnsInstructionAsync } from '../../src/index.js';
import {
  assertTokenNftOwnedBy,
  BASIS_POINTS,
  BROKER_FEE_PCT,
  COMPUTE_500K_IX,
  HUNDRED_PCT,
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

  const { buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, distribution } = nft;

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: buyer.address, // Bid owner--the buyer
    seller: nftOwner, // NFT holder--the seller
    mint,
    distribution,
    minAmount: bidPrice,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
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

  const { buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, distribution, sellerFeeBasisPoints } = nft;

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
    minAmount: bidPrice,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
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

  const { buyer, nftOwner, nftUpdateAuthority, makerBroker, takerBroker } =
    signers;
  const { mint, distribution, sellerFeeBasisPoints } = nft;

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
    minAmount: bidPrice,
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
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

  const { buyer, nftOwner, nftUpdateAuthority, takerBroker } = signers;
  const { mint, distribution, sellerFeeBasisPoints } = nft;

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
    minAmount: bidPrice,
    // makerBroker not passed in because not set
    takerBroker: takerBroker.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
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
