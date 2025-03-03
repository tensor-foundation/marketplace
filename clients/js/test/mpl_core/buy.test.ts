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
  createAndMintTo,
  createDefaultSolanaClient,
  createDefaultTransaction,
  expectCustomError,
  generateKeyPairSignerWithSol,
  LAMPORTS_PER_SOL,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findFeeVaultPda,
  findListStatePda,
  getBuyCoreInstruction,
  getBuyCoreInstructionAsync,
  getListCoreInstruction,
  getListCoreInstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED,
  TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED,
} from '../../src';
import {
  BASIS_POINTS,
  BROKER_FEE_PCT,
  MAKER_BROKER_FEE_PCT,
  sleep,
  TAKER_BROKER_FEE_PCT,
  TAKER_FEE_BPS,
} from '../_common';
import { computeIx } from '../legacy/_common';

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
  const asset = await createDefaultAsset({
    client,
    payer,
    authority: updateAuthority,
    owner: owner.address,
    royalties: {
      creators: [{ address: updateAuthority.address, percentage: 100 }],
      basisPoints: 500,
    },
  });

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

test('it cannot buy a listing that specified a different currency', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);

  const [{ mint: currency }] = await createAndMintTo({
    client,
    mintAuthority,
    payer: buyer,
    recipient: buyer.address,
    decimals: 0,
    initialSupply: 1_000_000_000n,
  });

  const asset = await createDefaultAsset({
    client,
    payer: mintAuthority,
    authority: mintAuthority,
    owner: lister.address,
    royalties: {
      creators: [{ address: mintAuthority.address, percentage: 100 }],
      basisPoints: 500,
    },
  });

  const listIx = await getListCoreInstructionAsync({
    asset: asset.address,
    owner: lister,
    payer: mintAuthority,
    amount: LAMPORTS_PER_SOL / 2n,
    currency,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const buyIx = await getBuyCoreInstructionAsync({
    asset: asset.address,
    payer: buyer,
    owner: lister.address,
    buyer: buyer.address,
    maxAmount: LAMPORTS_PER_SOL / 2n,
    creators: [mintAuthority.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH);
});

test('it has to specify the correct maker broker', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const makerBroker = await generateKeyPairSignerWithSol(client);
  const notMakerBroker = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const basisPoints = 500;
  const price = LAMPORTS_PER_SOL / 2n;

  const asset = await createDefaultAsset({
    client,
    payer: mintAuthority,
    authority: mintAuthority,
    owner: lister.address,
    royalties: {
      creators: [{ address: mintAuthority.address, percentage: 100 }],
      basisPoints,
    },
  });

  const listIx = await getListCoreInstructionAsync({
    asset: asset.address,
    payer: lister,
    owner: lister,
    amount: price,
    // (!)
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const maxAmount = price + (price * BigInt(basisPoints)) / BASIS_POINTS;

  // If the buyer tries to buy the NFT without a maker broker...
  const buyIx = await getBuyCoreInstructionAsync({
    asset: asset.address,
    payer: buyer,
    owner: lister.address,
    buyer: buyer.address,
    maxAmount,
    creators: [mintAuthority.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a broker mismatch error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with a different maker broker...
  const buyIx2 = await getBuyCoreInstructionAsync({
    asset: asset.address,
    payer: buyer,
    owner: lister.address,
    buyer: buyer.address,
    maxAmount,
    makerBroker: notMakerBroker.address,
    creators: [mintAuthority.address],
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a broker mismatch error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with the correct maker broker...
  const buyIx3 = await getBuyCoreInstructionAsync({
    asset: asset.address,
    payer: buyer,
    owner: lister.address,
    buyer: buyer.address,
    maxAmount,
    makerBroker: makerBroker.address,
    creators: [mintAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then the transaction should succeed and the list state should be closed.
  const [listState] = await findListStatePda({ mint: asset.address });
  t.false((await fetchEncodedAccount(client.rpc, listState)).exists);
});

test('it has to specify the correct cosigner', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const cosigner = await generateKeyPairSignerWithSol(client);
  const notCosigner = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const basisPoints = 500;
  const price = LAMPORTS_PER_SOL / 2n;

  const asset = await createDefaultAsset({
    client,
    payer: mintAuthority,
    authority: mintAuthority,
    owner: lister.address,
    royalties: {
      creators: [{ address: mintAuthority.address, percentage: 100 }],
      basisPoints,
    },
  });
  const listIx = await getListCoreInstructionAsync({
    asset: asset.address,
    payer: lister,
    owner: lister,
    amount: price,
    cosigner,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const maxAmount = price + (price * BigInt(basisPoints)) / BASIS_POINTS;

  // If the buyer tries to buy the NFT without a cosigner...
  const buyIx = await getBuyCoreInstructionAsync({
    asset: asset.address,
    payer: buyer,
    owner: lister.address,
    buyer: buyer.address,
    maxAmount,
    creators: [mintAuthority.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a cosigner mismatch error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // If the buyer tries to buy the NFT with a different cosigner...
  const buyIx2 = await getBuyCoreInstructionAsync({
    asset: asset.address,
    payer: buyer,
    owner: lister.address,
    buyer: buyer.address,
    maxAmount: LAMPORTS_PER_SOL / 2n,
    cosigner: notCosigner,
    creators: [mintAuthority.address],
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a cosigner mismatch error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // If the buyer tries to buy the NFT with the correct cosigner...
  const buyIx3 = await getBuyCoreInstructionAsync({
    asset: asset.address,
    payer: buyer,
    owner: lister.address,
    buyer: buyer.address,
    maxAmount,
    cosigner,
    creators: [mintAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx3, tx),
    (tx) => signAndSendTransaction(client, tx, { skipPreflight: true })
  );

  // ...then the transaction should succeed and the list state should be closed.
  const [listState] = await findListStatePda({ mint: asset.address });
  t.false((await fetchEncodedAccount(client.rpc, listState)).exists);
});

test('it has to respect the correct private taker', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const privateTaker = await generateKeyPairSignerWithSol(client);
  const notPrivateTaker = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const basisPoints = 500;
  const price = LAMPORTS_PER_SOL / 2n;

  const asset = await createDefaultAsset({
    client,
    payer: mintAuthority,
    authority: mintAuthority,
    owner: lister.address,
    royalties: {
      creators: [{ address: mintAuthority.address, percentage: 100 }],
      basisPoints,
    },
  });

  const listIx = await getListCoreInstructionAsync({
    asset: asset.address,
    payer: lister,
    owner: lister,
    amount: price,
    privateTaker: privateTaker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const maxAmount = price + (price * BigInt(basisPoints)) / BASIS_POINTS;

  // If a different buyer tries to buy the NFT...
  const buyIx2 = await getBuyCoreInstructionAsync({
    asset: asset.address,
    owner: lister.address,
    payer: notPrivateTaker,
    buyer: notPrivateTaker.address,
    maxAmount,
    creators: [mintAuthority.address],
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, notPrivateTaker),
    (tx) => appendTransactionMessageInstruction(buyIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a taker not allowed error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED);

  // If the specified private taker buys the NFT...
  const buyIx3 = await getBuyCoreInstructionAsync({
    asset: asset.address,
    owner: lister.address,
    payer: privateTaker,
    buyer: privateTaker.address,
    maxAmount,
    creators: [mintAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, privateTaker),
    (tx) => appendTransactionMessageInstruction(buyIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then the transaction should succeed and the list state should be closed.
  const [listState] = await findListStatePda({ mint: asset.address });
  t.false((await fetchEncodedAccount(client.rpc, listState)).exists);
});

test('it cannot buy an expired listing', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const asset = await createDefaultAsset({
    client,
    payer: mintAuthority,
    authority: mintAuthority,
    owner: lister.address,
    royalties: {
      creators: [{ address: mintAuthority.address, percentage: 100 }],
      basisPoints: 500,
    },
  });

  const listIx = await getListCoreInstructionAsync({
    asset: asset.address,
    payer: lister,
    owner: lister,
    amount: LAMPORTS_PER_SOL / 2n,
    expireInSec: 1,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Sleep for 5 seconds to let the listing expire.
  await sleep(5000);

  // If the buyer tries to buy the expired listing...
  const buyIx = await getBuyCoreInstructionAsync({
    asset: asset.address,
    owner: lister.address,
    payer: buyer,
    maxAmount: LAMPORTS_PER_SOL / 2n,
    creators: [mintAuthority.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a listing expired error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED);
});

test('it pays royalties and fees correctly', async (t) => {
  const ROYALTIES_BASIS_POINTS = 500n;
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const creatorKeypair1 = await generateKeyPairSignerWithSol(client);
  const creatorKeypair2 = await generateKeyPairSignerWithSol(client);
  const makerBroker = await generateKeyPairSigner();
  const takerBroker = await generateKeyPairSigner();
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const listingPrice = LAMPORTS_PER_SOL / 2n;
  const basisPoints = 500;

  const asset = await createDefaultAsset({
    client,
    payer: mintAuthority,
    authority: mintAuthority,
    owner: lister.address,
    royalties: {
      creators: [
        { address: creatorKeypair1.address, percentage: 70 },
        { address: creatorKeypair2.address, percentage: 30 },
      ],
      basisPoints,
    },
  });

  // Create a listing with maker broker specified
  const listIx = await getListCoreInstructionAsync({
    asset: asset.address,
    payer: lister,
    owner: lister,
    amount: listingPrice,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const creator1BalanceBefore = await client.rpc
    .getBalance(creatorKeypair1.address)
    .send();
  const creator2BalanceBefore = await client.rpc
    .getBalance(creatorKeypair2.address)
    .send();
  const makerBrokerBalanceBefore = await client.rpc
    .getBalance(makerBroker.address)
    .send();
  const takerBrokerBalanceBefore = await client.rpc
    .getBalance(takerBroker.address)
    .send();
  const listerBalanceBefore = await client.rpc
    .getBalance(lister.address)
    .send();

  const listStateRent = await client.rpc
    .getBalance((await findListStatePda({ mint: asset.address }))[0])
    .send();

  const maxAmount =
    listingPrice + (listingPrice * BigInt(basisPoints)) / BASIS_POINTS;

  // When the buyer buys the listing...
  const buyIx = await getBuyCoreInstructionAsync({
    asset: asset.address,
    owner: lister.address,
    payer: buyer,
    maxAmount,
    creators: [creatorKeypair1.address, creatorKeypair2.address],
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the lister received the correct amount...
  const listerBalanceAfter = await client.rpc.getBalance(lister.address).send();
  t.assert(
    BigInt(listerBalanceAfter.value) ===
      listerBalanceBefore.value +
        listingPrice + // listing price
        listStateRent.value // rent back from the original listing state account
  );

  // ...and the creators should have received the correct amount...
  const creator1BalanceAfter = await client.rpc
    .getBalance(creatorKeypair1.address)
    .send();
  const creator2BalanceAfter = await client.rpc
    .getBalance(creatorKeypair2.address)
    .send();
  t.assert(
    BigInt(creator1BalanceAfter.value) ===
      creator1BalanceBefore.value +
        (((listingPrice * ROYALTIES_BASIS_POINTS) / BASIS_POINTS) * 70n) / 100n // 70% of 5%
  );
  t.assert(
    BigInt(creator2BalanceAfter.value) ===
      creator2BalanceBefore.value +
        (((listingPrice * ROYALTIES_BASIS_POINTS) / BASIS_POINTS) * 30n) / 100n // 30% of 5%
  );

  // ...and the brokers should have received the correct amount
  const makerBrokerBalanceAfter = await client.rpc
    .getBalance(makerBroker.address)
    .send();
  const takerBrokerBalanceAfter = await client.rpc
    .getBalance(takerBroker.address)
    .send();
  t.assert(
    BigInt(makerBrokerBalanceAfter.value) ===
      makerBrokerBalanceBefore.value +
        (((((listingPrice * TAKER_FEE_BPS) / BASIS_POINTS) * BROKER_FEE_PCT) /
          100n) *
          MAKER_BROKER_FEE_PCT) /
          100n // 80% (maker split) of 50% (broker pct) of 2% (taker fee)
  );
  t.assert(
    BigInt(takerBrokerBalanceAfter.value) ===
      takerBrokerBalanceBefore.value +
        (((((listingPrice * TAKER_FEE_BPS) / BASIS_POINTS) * BROKER_FEE_PCT) /
          100n) *
          TAKER_BROKER_FEE_PCT) /
          100n // 20% (maker split) of 50% (broker pct) of 2% (taker fee)
  );
});
