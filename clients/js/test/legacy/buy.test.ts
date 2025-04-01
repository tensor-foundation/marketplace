import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultNft,
  fetchMetadata,
  findAtaPda,
} from '@tensor-foundation/mpl-token-metadata';
import { TokenStandard } from '@tensor-foundation/resolvers';
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
  findListStatePda,
  getBuyLegacyInstructionAsync,
  getListLegacyInstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED,
  TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED,
} from '../../src/index.js';
import {
  assertTokenNftOwnedBy,
  BASIS_POINTS,
  BROKER_FEE_PCT,
  COMPUTE_300K_IX,
  COMPUTE_500K_IX,
  MAKER_BROKER_FEE_PCT,
  sleep,
  TAKER_BROKER_FEE_PCT,
  TAKER_FEE_BPS,
  TestAction,
} from '../_common.js';
import {
  computeIx,
  setupFungibleAssetTest,
  setupLegacyTest,
} from './_common.js';

test('it can buy an NFT', async (t) => {
  const {
    client,
    signers,
    mint,
    listing,
    price: maxPrice,
  } = await setupLegacyTest({
    t,
    action: TestAction.List,
  });
  const { buyer, nftOwner, nftUpdateAuthority } = signers;

  // When a buyer buys the NFT.
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: maxPrice,
    creators: [nftUpdateAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing!)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findAtaPda({ mint, owner: listing! }))[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  await assertTokenNftOwnedBy({ t, client, mint, owner: buyer.address });
});

test('it can buy a Programmable NFT', async (t) => {
  const {
    client,
    signers,
    mint,
    listing,
    price: maxPrice,
  } = await setupLegacyTest({
    t,
    action: TestAction.List,
    pNft: true,
  });
  const { buyer, nftOwner, nftUpdateAuthority } = signers;

  // When a buyer buys the NFT.
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: maxPrice,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    creators: [nftUpdateAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing!)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findAtaPda({ mint, owner: listing! }))[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  await assertTokenNftOwnedBy({ t, client, mint, owner: buyer.address });
});

test('it cannot buy a Programmable NFT with a lower amount', async (t) => {
  const { client, signers, mint, listingPrice } = await setupLegacyTest({
    t,
    action: TestAction.List,
    pNft: true,
  });
  const { nftOwner, nftUpdateAuthority } = signers;

  // When a buyer tries to buy the NFT with a lower amount.
  const buyer = await generateKeyPairSignerWithSol(client);
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice! - 1n,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    creators: [nftUpdateAuthority.address],
  });

  // Then we expect an error.
  try {
    await pipe(
      await createDefaultTransaction(client, buyer),
      (tx) => appendTransactionMessageInstruction(COMPUTE_300K_IX, tx),
      (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('Expected price mismatch error.');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH,
        },
      },
    });
  }
});

test('it can list and buy a Fungible Asset w/ supply of 1', async (t) => {
  // Fungible Assets technically allow supply > 1, but require decimals of 0.
  // However, we are allowing Fungible Assets used as NFTs such as SNS NFTs which have a supply of 1.
  const {
    client,
    signers,
    mint,
    price: maxPrice,
    listing,
  } = await setupFungibleAssetTest({
    t,
    action: TestAction.List,
  });
  const { buyer, nftOwner, nftUpdateAuthority } = signers;

  // When a buyer buys the NFT.
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: maxPrice,
    creators: [nftUpdateAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing!)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findAtaPda({ mint, owner: listing! }))[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  await assertTokenNftOwnedBy({ t, client, mint, owner: buyer.address });
});

test('it can buy an NFT with a cosigner', async (t) => {
  const {
    client,
    signers,
    mint,
    listing,
    price: maxPrice,
  } = await setupLegacyTest({
    t,
    action: TestAction.List,
    useCosigner: true,
  });
  const { nftOwner, nftUpdateAuthority, cosigner } = signers;

  // When a buyer buys the NFT.
  const buyer = await generateKeyPairSignerWithSol(client);
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: maxPrice,
    cosigner,
    creators: [nftUpdateAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing!)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findAtaPda({ mint, owner: listing! }))[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  await assertTokenNftOwnedBy({ t, client, mint, owner: buyer.address });
});

test('it cannot buy a Programmable NFT with a missing cosigner', async (t) => {
  const {
    client,
    signers,
    mint,
    price: maxPrice,
  } = await setupLegacyTest({
    t,
    action: TestAction.List,
    useCosigner: true,
  });
  const { nftOwner, nftUpdateAuthority } = signers;

  // When a buyer tries to buy the NFT without passing in a cosigner.
  const buyer = await generateKeyPairSignerWithSol(client);
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: maxPrice,
    // Missing cosigner!
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    creators: [nftUpdateAuthority.address],
  });

  // Then we expect an error.
  try {
    await pipe(
      await createDefaultTransaction(client, buyer),
      (tx) => appendTransactionMessageInstruction(COMPUTE_300K_IX, tx),
      (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('Expected bad cosigner error.');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
        },
      },
    });
  }
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

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: mintAuthority,
    owner: lister.address,
  });

  const listIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    currency,
    amount: LAMPORTS_PER_SOL / 2n,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const buyIx = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
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
  const buyer = await generateKeyPairSignerWithSol(client, LAMPORTS_PER_SOL);
  const makerBroker = await generateKeyPairSignerWithSol(
    client,
    LAMPORTS_PER_SOL
  );
  const notMakerBroker = await generateKeyPairSignerWithSol(
    client,
    LAMPORTS_PER_SOL
  );
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: mintAuthority,
    owner: lister.address,
  });

  const listIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    amount: LAMPORTS_PER_SOL / 2n,
    // (!)
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer tries to buy the NFT without a maker broker...
  const buyIx = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: LAMPORTS_PER_SOL / 2n,
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
  const buyIx2 = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: LAMPORTS_PER_SOL / 2n,
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
  const buyIx3 = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: LAMPORTS_PER_SOL / 2n,
    makerBroker: makerBroker.address,
    creators: [mintAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx3, tx),
    (tx) => signAndSendTransaction(client, tx, { skipPreflight: true })
  );

  // ...then the transaction should succeed and the listState is closed
  const listState = await findListStatePda({ mint });
  t.false((await fetchEncodedAccount(client.rpc, listState[0])).exists);
});

test('it has to specify the correct cosigner', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const cosigner = await generateKeyPairSignerWithSol(client);
  const notCosigner = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: mintAuthority,
    owner: lister.address,
  });

  const listIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    amount: LAMPORTS_PER_SOL / 2n,
    cosigner,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer tries to buy the NFT without a cosigner...
  const buyIx = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: LAMPORTS_PER_SOL / 2n,
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
  const buyIx2 = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
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
  const buyIx3 = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: LAMPORTS_PER_SOL / 2n,
    cosigner,
    creators: [mintAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then the transaction should succeed and the listState is closed
  const listState = await findListStatePda({ mint });
  t.false((await fetchEncodedAccount(client.rpc, listState[0])).exists);
});

test('it has to respect the correct private taker', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const privateTaker = await generateKeyPairSignerWithSol(client);
  const notPrivateTaker = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: mintAuthority,
    owner: lister.address,
  });

  const listIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    amount: LAMPORTS_PER_SOL / 2n,
    privateTaker: privateTaker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If a different buyer tries to buy the NFT...
  const buyIx2 = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: notPrivateTaker,
    mint,
    maxAmount: LAMPORTS_PER_SOL / 2n,
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
  const buyIx3 = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: privateTaker,
    mint,
    maxAmount: LAMPORTS_PER_SOL / 2n,
    creators: [mintAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, privateTaker),
    (tx) => appendTransactionMessageInstruction(buyIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then the transaction should succeed and the listState is closed
  const listState = await findListStatePda({ mint });
  t.false((await fetchEncodedAccount(client.rpc, listState[0])).exists);
});

test('it cannot buy an expired listing', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: mintAuthority,
    owner: lister.address,
  });

  const listIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
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
  const buyIx = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
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
  const listingPrice = LAMPORTS_PER_SOL / 2n;

  // Mint pNFT
  const { mint, metadata } = await createDefaultNft({
    client,
    payer: lister,
    authority: creatorKeypair1,
    owner: lister.address,
    standard: TokenStandard.ProgrammableNonFungible,
    creators: [
      { address: creatorKeypair1.address, verified: true, share: 70 },
      { address: creatorKeypair2.address, verified: false, share: 30 },
    ],
  });

  // Create a listing with maker broker specified
  const listIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    amount: listingPrice,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
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
    .getBalance((await findListStatePda({ mint }))[0])
    .send();

  const md = (await fetchMetadata(client.rpc, metadata)).data;
  const { sellerFeeBasisPoints } = md;

  const maxAmount =
    listingPrice + (listingPrice * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;

  // When the buyer buys the listing...
  const buyIx = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
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

  const tokenAta = (await findAtaPda({ mint, owner: buyer.address }))[0];
  const tokenAtaRent = await client.rpc.getBalance(tokenAta).send();

  // Then the lister received the correct amount...
  const listerBalanceAfter = await client.rpc.getBalance(lister.address).send();
  t.assert(
    BigInt(listerBalanceAfter.value) ===
      listerBalanceBefore.value +
        listingPrice + // listing price
        listStateRent.value + // rent back from the original listing state account
        tokenAtaRent.value // rent back from the listing token account
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

test('it enforces pNFT royalties', async (t) => {
  const ROYALTIES_BASIS_POINTS = 500n;
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);
  const listingPrice = LAMPORTS_PER_SOL / 2n;

  const { mint, metadata } = await createDefaultNft({
    client,
    payer: lister,
    authority: creator,
    owner: lister.address,
    standard: TokenStandard.ProgrammableNonFungible,
    creators: [{ address: creator.address, verified: true, share: 100 }],
  });

  const listIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    amount: listingPrice,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const creatorBalanceBefore = await client.rpc
    .getBalance(creator.address)
    .send();

  const md = (await fetchMetadata(client.rpc, metadata)).data;
  const { sellerFeeBasisPoints } = md;
  const maxAmount =
    listingPrice + (listingPrice * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;

  // Even if the buyer specifies 0% royalties...
  const buyIx = await getBuyLegacyInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount,
    optionalRoyaltyPct: 0,
    creators: [creator.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...royalties should be paid
  const creatorBalanceAfter = await client.rpc
    .getBalance(creator.address)
    .send();
  t.assert(
    BigInt(creatorBalanceAfter.value) ===
      creatorBalanceBefore.value +
        (((listingPrice * ROYALTIES_BASIS_POINTS) / BASIS_POINTS) * 100n) / 100n // 100% of 5%
  );
});

test('it respects the optionalRoyaltyPct arg', async (t) => {
  const ROYALTIES_BASIS_POINTS = 500;
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);
  const listingPrice = LAMPORTS_PER_SOL / 20n;

  const optionalRoyaltyPcts = [0, 10, 50, 100];
  for (const optionalRoyaltyPct of optionalRoyaltyPcts) {
    const { mint, metadata } = await createDefaultNft({
      client,
      payer: lister,
      authority: creator,
      owner: lister.address,
      standard: TokenStandard.NonFungible,
      creators: [{ address: creator.address, verified: true, share: 100 }],
    });

    const listIx = await getListLegacyInstructionAsync({
      payer: lister,
      owner: lister,
      mint,
      amount: listingPrice,
    });

    await pipe(
      await createDefaultTransaction(client, lister),
      (tx) => appendTransactionMessageInstruction(listIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );

    const creatorBalanceBefore = await client.rpc
      .getBalance(creator.address)
      .send();

    const md = (await fetchMetadata(client.rpc, metadata)).data;
    const { sellerFeeBasisPoints } = md;
    const maxAmount =
      listingPrice +
      (listingPrice * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;

    const buyIx = await getBuyLegacyInstructionAsync({
      owner: lister.address,
      payer: buyer,
      mint,
      maxAmount,
      optionalRoyaltyPct,
      creators: [creator.address],
    });

    await pipe(
      await createDefaultTransaction(client, buyer),
      (tx) => appendTransactionMessageInstruction(buyIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );

    const creatorBalanceAfter = await client.rpc
      .getBalance(creator.address)
      .send();

    t.assert(
      BigInt(creatorBalanceAfter.value) ===
        creatorBalanceBefore.value +
          (((listingPrice * BigInt(ROYALTIES_BASIS_POINTS)) /
            BigInt(BASIS_POINTS)) *
            BigInt(optionalRoyaltyPct)) /
            100n // optionalRoyaltyPct% of 5%
    );
  }
});
