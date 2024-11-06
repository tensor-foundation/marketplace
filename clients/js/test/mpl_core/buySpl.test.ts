import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN_PROGRAM_ID,
  createAta,
  createAndMintTo,
  expectCustomError,
  TOKEN22_PROGRAM_ID,
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
import { findAssociatedTokenPda } from '@solana-program/token';
import {
  findFeeVaultPda,
  findListStatePda,
  getBuyCoreSplInstruction,
  getBuyCoreSplInstructionAsync,
  getListCoreInstruction,
  getListCoreInstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED,
  TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED,
} from '../../src';
import { computeIx } from '../legacy/_common';
import {
  BASIS_POINTS,
  BROKER_FEE_PCT,
  MAKER_BROKER_FEE_PCT,
  sleep,
  TAKER_BROKER_FEE_PCT,
  TAKER_FEE_BPS,
} from '../_common';

test('it can buy a listed core asset using a SPL token', async (t) => {
  const client = createDefaultSolanaClient();

  // General test payer.
  const payer = await generateKeyPairSignerWithSol(client);

  // Asset update authority.
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  // Original asset owner.
  const owner = await generateKeyPairSigner();
  // Asset buyer.
  const buyer = await generateKeyPairSignerWithSol(client);

  // SPL token mint authority.
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const price = 100_000_000n;
  const royalties = 5_000_000n;
  const maxPrice = 125_000_000n;
  const initialSupply = 1_000_000_000n;

  // Create a SPL token and fund the buyer with it.
  const [currency] = await createAndMintTo({
    client,
    mintAuthority,
    payer,
    recipient: buyer.address,
    decimals: 0,
    initialSupply,
  });

  // Buyer receives the SPL token.
  const [buyerAta] = await findAssociatedTokenPda({
    owner: buyer.address,
    mint: currency.mint,
    tokenProgram: TOKEN_PROGRAM_ID,
  });
  const buyerAtaBalance = (
    await client.rpc.getTokenAccountBalance(buyerAta).send()
  ).value.uiAmount;
  t.is(buyerAtaBalance, Number(initialSupply));

  // Create a MPL core asset that has 5% royalties.
  const asset = await createDefaultAsset({
    client,
    authority: updateAuthority,
    owner: owner.address,
    royalties: {
      creators: [{ address: updateAuthority.address, percentage: 100 }],
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

  const [listState] = await findListStatePda({ mint: asset.address });
  const [feeVault] = await findFeeVaultPda({ address: listState });

  const [updateAuthorityCurrencyAta] = await findAssociatedTokenPda({
    owner: updateAuthority.address,
    mint: currency.mint,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  const [buyerCurrencyAta] = await findAssociatedTokenPda({
    owner: buyer.address,
    mint: currency.mint,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  const feeVaultCurrencyTa = await createAta({
    client,
    payer,
    mint: currency.mint,
    owner: feeVault,
  });
  const ownerCurrencyTa = await createAta({
    client,
    payer,
    mint: currency.mint,
    owner: owner.address,
  });

  // List asset.
  const listCoreIx = getListCoreInstruction({
    payer,
    owner,
    listState,
    asset: asset.address,
    currency: currency.mint,
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
  const buyCoreSplIx = getBuyCoreSplInstruction({
    asset: asset.address,
    listState,
    feeVault,
    feeVaultCurrencyTa,
    payer: buyer,
    buyer: buyer.address,
    payerCurrencyTa: buyerCurrencyAta,
    rentDestination: payer.address,
    owner: owner.address,
    ownerCurrencyTa,
    maxAmount: maxPrice,
    currency: currency.mint,
    creators: [updateAuthority.address],
    creatorsCurrencyTa: [updateAuthorityCurrencyAta],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
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
    await client.rpc.getTokenAccountBalance(updateAuthorityCurrencyAta).send()
  ).value.uiAmount;
  t.is(updateAuthorityBalance, Number(royalties));
});

test('it cannot buy a SOL listing with a different SPL token', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);
  const listingAmount = 100_000_000n;

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
    authority: mintAuthority,
    owner: lister.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints: 500,
    },
    payer: lister,
  });

  const listCoreIx = await getListCoreInstructionAsync({
    payer: lister,
    owner: lister,
    asset: asset.address,
    amount: listingAmount,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Try buying with our own SPL token...
  const buyCoreSplIx = await getBuyCoreSplInstructionAsync({
    asset: asset.address,
    payer: buyer,
    buyer: buyer.address,
    owner: lister.address,
    maxAmount: listingAmount,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... should fail with a currency mismatch error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH);
});

test('it has to specify the correct maker broker', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const makerBroker = await generateKeyPairSignerWithSol(client);
  const notMakerBroker = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const price = 100_000_000n;
  const initialSupply = 1_000_000_000n;

  // Create a SPL token and fund the buyer with it.
  const [{ mint: currency }] = await createAndMintTo({
    client,
    mintAuthority,
    payer: buyer,
    recipient: buyer.address,
    decimals: 0,
    initialSupply,
  });

  // Buyer receives the SPL token.
  const [buyerAta] = await findAssociatedTokenPda({
    owner: buyer.address,
    mint: currency,
    tokenProgram: TOKEN_PROGRAM_ID,
  });
  const buyerAtaBalance = (
    await client.rpc.getTokenAccountBalance(buyerAta).send()
  ).value.uiAmount;
  t.is(buyerAtaBalance, Number(initialSupply));

  // Create an NFT.
  const asset = await createDefaultAsset({
    client,
    authority: mintAuthority,
    owner: lister.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints: 500,
    },
    payer: lister,
  });

  // List the NFT.
  const listCoreIx = await getListCoreInstructionAsync({
    payer: lister,
    owner: lister,
    asset: asset.address,
    currency,
    amount: price,
    // (!)
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer tries to buy the NFT without a maker broker...
  const buyCoreSplIx = await getBuyCoreSplInstructionAsync({
    asset: asset.address,
    payer: buyer,
    buyer: buyer.address,
    owner: lister.address,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... should fail with a broker mismatch error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with a different maker broker...
  const buyCoreSplIx2 = await getBuyCoreSplInstructionAsync({
    asset: asset.address,
    payer: buyer,
    buyer: buyer.address,
    owner: lister.address,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    // (!)
    makerBroker: notMakerBroker.address,
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a broker mismatch error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with the correct maker broker...
  const buyCoreSplIx3 = await getBuyCoreSplInstructionAsync({
    asset: asset.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should succeed and the list state should be closed.
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
  const creator = await generateKeyPairSignerWithSol(client);
  const price = 100_000_000n;

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
    authority: mintAuthority,
    owner: lister.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints: 500,
    },
    payer: lister,
  });

  const listCoreIx = await getListCoreInstructionAsync({
    payer: lister,
    owner: lister,
    asset: asset.address,
    currency,
    amount: price,
    // (!)
    cosigner,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer tries to buy the NFT without a cosigner...
  const buyCoreSplIx = await getBuyCoreSplInstructionAsync({
    asset: asset.address,
    payer: buyer,
    buyer: buyer.address,
    owner: lister.address,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a bad cosigner error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // If the buyer tries to buy the NFT with an incorrect cosigner...
  const buyCoreSplIx2 = await getBuyCoreSplInstructionAsync({
    asset: asset.address,
    payer: buyer,
    buyer: buyer.address,
    owner: lister.address,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    cosigner: notCosigner,
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a bad cosigner error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // If the buyer tries to buy the NFT with the correct cosigner...
  const buyCoreSplIx3 = await getBuyCoreSplInstructionAsync({
    asset: asset.address,
    payer: buyer,
    buyer: buyer.address,
    owner: lister.address,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    cosigner,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should succeed and the list state should be closed.
  const [listState] = await findListStatePda({ mint: asset.address });
  t.false((await fetchEncodedAccount(client.rpc, listState)).exists);
});

test('it has to specify the correct private taker', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const privateTaker = await generateKeyPairSignerWithSol(client);
  const notPrivateTaker = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);
  const price = 100_000_000n;

  const [{ mint: currency }] = await createAndMintTo({
    client,
    mintAuthority,
    payer: privateTaker,
    recipient: privateTaker.address,
    decimals: 0,
    initialSupply: 1_000_000_000n,
  });

  const asset = await createDefaultAsset({
    client,
    authority: mintAuthority,
    owner: lister.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints: 500,
    },
    payer: lister,
  });

  // Also initialize the TA for notPrivateTaker.
  await createAta({
    client,
    payer: notPrivateTaker,
    mint: currency,
    owner: notPrivateTaker.address,
  });

  const listCoreIx = await getListCoreInstructionAsync({
    payer: lister,
    owner: lister,
    asset: asset.address,
    currency,
    amount: price,
    // (!)
    privateTaker: privateTaker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer who is not the private taker tries to buy the NFT...
  const buyCoreSplIx = await getBuyCoreSplInstructionAsync({
    asset: asset.address,
    buyer: notPrivateTaker.address,
    payer: notPrivateTaker,
    owner: lister.address,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  const tx = pipe(
    await createDefaultTransaction(client, notPrivateTaker),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a taker not allowed error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED);

  // If the buyer who is the private taker tries to buy the NFT...
  const buyCoreSplIx2 = await getBuyCoreSplInstructionAsync({
    asset: asset.address,
    buyer: privateTaker.address,
    payer: privateTaker,
    owner: lister.address,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, privateTaker),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should succeed and the list state should be closed.
  const [listState] = await findListStatePda({ mint: asset.address });
  t.false((await fetchEncodedAccount(client.rpc, listState)).exists);
});

test('it cannot buy an expired listing', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const price = 100_000_000n;

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
    authority: mintAuthority,
    owner: lister.address,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints: 500,
    },
    payer: lister,
  });

  const listCoreIx = await getListCoreInstructionAsync({
    payer: lister,
    owner: lister,
    asset: asset.address,
    currency,
    amount: price,
    // (!)
    expireInSec: 1,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Wait for 5 seconds to ensure the listing has expired.
  await sleep(5000);

  // Try to buy the NFT...
  const buyCoreSplIx = await getBuyCoreSplInstructionAsync({
    asset: asset.address,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with an expired listing error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED);
});

test('it pays SPL fees and royalties correctly', async (t) => {
  const ROYALTIES_BASIS_POINTS = 500n;
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const creator1 = await generateKeyPairSignerWithSol(client);
  const creator2 = await generateKeyPairSignerWithSol(client);
  const makerBroker = await generateKeyPairSignerWithSol(client);
  const takerBroker = await generateKeyPairSignerWithSol(client);

  const creators = [
    { address: creator1.address, share: 60, verified: true },
    { address: creator2.address, share: 40, verified: false },
  ];

  const price = 100_000_000n;

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
    authority: creator1,
    owner: lister.address,
    royalties: {
      creators: creators.map((c) => ({
        address: c.address,
        percentage: c.share,
      })),
      basisPoints: Number(ROYALTIES_BASIS_POINTS),
    },
    payer: lister,
  });

  const listCoreIx = await getListCoreInstructionAsync({
    payer: lister,
    owner: lister,
    asset: asset.address,
    currency,
    amount: price,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listCoreIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const creator1Ata = await createAta({
    client,
    payer: creator1,
    mint: currency,
    owner: creator1.address,
  });
  const creator2Ata = await createAta({
    client,
    payer: creator2,
    mint: currency,
    owner: creator2.address,
  });
  const makerBrokerAta = await createAta({
    client,
    payer: makerBroker,
    mint: currency,
    owner: makerBroker.address,
  });
  const takerBrokerAta = await createAta({
    client,
    payer: takerBroker,
    mint: currency,
    owner: takerBroker.address,
  });
  const listerAta = await createAta({
    client,
    payer: lister,
    mint: currency,
    owner: lister.address,
  });
  const creator1BalanceBefore = await client.rpc
    .getTokenAccountBalance(creator1Ata)
    .send();
  const creator2BalanceBefore = await client.rpc
    .getTokenAccountBalance(creator2Ata)
    .send();
  const makerBrokerBalanceBefore = await client.rpc
    .getTokenAccountBalance(makerBrokerAta)
    .send();
  const takerBrokerBalanceBefore = await client.rpc
    .getTokenAccountBalance(takerBrokerAta)
    .send();
  const listerBalanceBefore = await client.rpc
    .getTokenAccountBalance(listerAta)
    .send();

  const buyCoreSplIx = await getBuyCoreSplInstructionAsync({
    asset: asset.address,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    currency,
    creators: creators.map((c) => c.address),
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the lister received the correct amount...
  const listerBalanceAfter = await client.rpc
    .getTokenAccountBalance(listerAta)
    .send();
  t.assert(
    BigInt(listerBalanceAfter.value.amount) ===
      BigInt(listerBalanceBefore.value.amount) + price
  );

  // ...and the creators should have received the correct amount...
  const creator1BalanceAfter = await client.rpc
    .getTokenAccountBalance(creator1Ata)
    .send();
  const creator2BalanceAfter = await client.rpc
    .getTokenAccountBalance(creator2Ata)
    .send();
  t.assert(
    BigInt(creator1BalanceAfter.value.amount) ===
      BigInt(creator1BalanceBefore.value.amount) +
        (((price * ROYALTIES_BASIS_POINTS) / BASIS_POINTS) * 60n) / 100n // 60% of 5%
  );
  t.assert(
    BigInt(creator2BalanceAfter.value.amount) ===
      BigInt(creator2BalanceBefore.value.amount) +
        (((price * ROYALTIES_BASIS_POINTS) / BASIS_POINTS) * 40n) / 100n // 40% of 5%
  );

  // ...and the brokers should have received the correct amount
  const makerBrokerBalanceAfter = await client.rpc
    .getTokenAccountBalance(makerBrokerAta)
    .send();
  const takerBrokerBalanceAfter = await client.rpc
    .getTokenAccountBalance(takerBrokerAta)
    .send();
  t.assert(
    BigInt(makerBrokerBalanceAfter.value.amount) ===
      BigInt(makerBrokerBalanceBefore.value.amount) +
        (((((price * TAKER_FEE_BPS) / BASIS_POINTS) * BROKER_FEE_PCT) / 100n) *
          MAKER_BROKER_FEE_PCT) /
          100n // 80% (maker split) of 50% (broker pct) of 2% (taker fee)
  );
  t.assert(
    BigInt(takerBrokerBalanceAfter.value.amount) ===
      BigInt(takerBrokerBalanceBefore.value.amount) +
        (((((price * TAKER_FEE_BPS) / BASIS_POINTS) * BROKER_FEE_PCT) / 100n) *
          TAKER_BROKER_FEE_PCT) /
          100n // 20% (maker split) of 50% (broker pct) of 2% (taker fee)
  );
});

test('it works with both T22 and Legacy SPLs', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const price = 100_000_000n;

  const [{ mint: currencyT22 }] = await createAndMintTo({
    client,
    mintAuthority,
    payer: buyer,
    recipient: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
    decimals: 0,
    initialSupply: 1_000_000_000n,
  });

  const [{ mint: currencyLegacy }] = await createAndMintTo({
    client,
    mintAuthority,
    payer: buyer,
    recipient: buyer.address,
    decimals: 0,
    initialSupply: 1_000_000_000n,
  });

  const assetListedForT22 = await createDefaultAsset({
    client,
    payer: lister,
    authority: creator,
    owner: lister.address,
  });

  const assetListedForLegacy = await createDefaultAsset({
    client,
    payer: lister,
    authority: creator,
    owner: lister.address,
  });

  const listCoreIxT22 = await getListCoreInstructionAsync({
    payer: lister,
    owner: lister,
    asset: assetListedForT22.address,
    currency: currencyT22,
    amount: price,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listCoreIxT22, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listCoreIxLegacy = await getListCoreInstructionAsync({
    payer: lister,
    owner: lister,
    asset: assetListedForLegacy.address,
    currency: currencyLegacy,
    amount: price,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listCoreIxLegacy, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const buyCoreSplIxT22 = await getBuyCoreSplInstructionAsync({
    asset: assetListedForT22.address,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    currency: currencyT22,
    creators: [creator.address],
    // (!)
    currencyTokenProgram: TOKEN22_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIxT22, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listStateT22 = await findListStatePda({
    mint: assetListedForT22.address,
  });
  t.false((await fetchEncodedAccount(client.rpc, listStateT22[0])).exists);

  const buyCoreSplIxLegacy = await getBuyCoreSplInstructionAsync({
    asset: assetListedForLegacy.address,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    currency: currencyLegacy,
    creators: [creator.address],
    // (!)
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyCoreSplIxLegacy, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listStateLegacy = await findListStatePda({
    mint: assetListedForLegacy.address,
  });
  t.false((await fetchEncodedAccount(client.rpc, listStateLegacy[0])).exists);
});
