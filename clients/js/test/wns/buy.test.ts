import {
  appendTransactionMessageInstruction,
  assertAccountDecoded,
  assertAccountExists,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import { findAtaPda } from '@tensor-foundation/mpl-token-metadata';
import {
  createAndMintTo,
  createDefaultSolanaClient,
  createDefaultTransaction,
  createWnsNftInGroup,
  generateKeyPairSignerWithSol,
  LAMPORTS_PER_SOL,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findListStatePda,
  getBuyWnsInstructionAsync,
  getListWnsInstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED,
  TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED,
} from '../../src/index.js';
import {
  assertTcompNoop,
  assertTokenNftOwnedBy,
  BASIS_POINTS,
  BROKER_FEE_PCT,
  COMPUTE_500K_IX,
  expectCustomError,
  getTestSetup,
  HUNDRED_PCT,
  MAKER_BROKER_FEE_PCT,
  sleep,
  TAKER_FEE_BPS,
  TestAction,
} from '../_common.js';
import { setupWnsTest } from './_common.js';

test('it can buy an NFT', async (t) => {
  const { client, payer, nftUpdateAuthority, nftOwner, buyer } =
    await getTestSetup();

  // Mint NFT
  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer,
    owner: nftOwner.address,
    authority: nftUpdateAuthority,
  });

  // And we list the NFT with a cosigner.
  const listIx = await getListWnsInstructionAsync({
    owner: nftOwner,
    mint,
    collection: group,
    distribution,
    amount: 1n,
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    collection: group,
    distribution,
    maxAmount: 2n,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (
          await findAtaPda({
            mint,
            owner: listing,
            tokenProgram: TOKEN22_PROGRAM_ID,
          })
        )[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  const buyerToken = await fetchJsonParsedAccount(
    client.rpc,
    (
      await findAtaPda({
        mint,
        owner: buyer.address,
        tokenProgram: TOKEN22_PROGRAM_ID,
      })
    )[0]
  );
  assertAccountDecoded(buyerToken);

  t.like(buyerToken, {
    data: {
      tokenAmount: { amount: '1' },
    },
  });
});

test('it can buy an NFT with a cosigner', async (t) => {
  const { client, payer, nftUpdateAuthority, nftOwner, buyer, cosigner } =
    await getTestSetup();

  // Mint NFT
  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer,
    owner: nftOwner.address,
    authority: nftUpdateAuthority,
  });

  // And we list the NFT with a cosigner.
  const listIx = await getListWnsInstructionAsync({
    owner: nftOwner,
    mint,
    collection: group,
    distribution,
    amount: 1,
    cosigner,
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    collection: group,
    distribution,
    mint,
    maxAmount: 2,
    cosigner,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (
          await findAtaPda({
            mint,
            owner: listing,
            tokenProgram: TOKEN22_PROGRAM_ID,
          })
        )[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  const buyerToken = await fetchJsonParsedAccount(
    client.rpc,
    (
      await findAtaPda({
        mint,
        owner: buyer.address,
        tokenProgram: TOKEN22_PROGRAM_ID,
      })
    )[0]
  );
  assertAccountDecoded(buyerToken);

  t.like(buyerToken, {
    data: {
      tokenAmount: { amount: '1' },
    },
  });
});

test('it cannot buy an NFT with a lower amount', async (t) => {
  const { client, signers, nft, listingPrice } = await setupWnsTest({
    t,
    action: TestAction.List,
  });
  const { buyer, nftOwner } = signers;
  const { mint, distribution, group } = nft;

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    collection: group,
    distribution,
    maxAmount: listingPrice! - 1n, // <-- lower amount
  });

  const promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH);
});

test('it cannot buy an NFT with a missing or incorrect cosigner', async (t) => {
  const { client, signers, nft, listingPrice } = await setupWnsTest({
    t,
    action: TestAction.List,
    useCosigner: true,
  });
  const { buyer, nftOwner } = signers;
  const { mint, group, distribution } = nft;

  const fakeCosigner = await generateKeyPairSigner();

  let buyIx = await getBuyWnsInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    collection: group,
    distribution,
    maxAmount: listingPrice! - 1n,
    // Missing cosigner!
  });

  let promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // When a buyer buys the NFT.
  buyIx = await getBuyWnsInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    collection: group,
    distribution,
    maxAmount: listingPrice! - 1n,
    cosigner: fakeCosigner,
  });

  promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);
});

test('buying emits a self-CPI logging event', async (t) => {
  const {
    client,
    signers,
    nft,
    price: maxPrice,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
  });
  const { buyer, nftOwner } = signers;
  const { mint, group, distribution } = nft;

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    collection: group,
    distribution,
    maxAmount: maxPrice,
  });

  const sig = await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  assertTcompNoop(t, client, sig);
});

test('fees are paid correctly', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: maxPrice,
    listingPrice,
    feeVault,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
  });

  const { buyer, nftOwner } = signers;
  const { mint, group, distribution, sellerFeeBasisPoints } = nft;

  const startingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  const startingDistributionBalance = (
    await client.rpc.getBalance(distribution).send()
  ).value;

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    collection: group,
    distribution,
    maxAmount: maxPrice,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (
          await findAtaPda({
            mint,
            owner: listing,
            tokenProgram: TOKEN22_PROGRAM_ID,
          })
        )[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
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
      startingFeeVaultBalance + (listingPrice! * TAKER_FEE_BPS) / BASIS_POINTS
  );

  // Check that the royalties were paid correctly.
  // WNS royalties go to the distribution account and not directly to the creator.
  const endingDistributionBalance = (
    await client.rpc.getBalance(distribution).send()
  ).value;
  t.assert(
    endingDistributionBalance ===
      startingDistributionBalance +
        (listingPrice! * sellerFeeBasisPoints) / BASIS_POINTS
  );
});

test('maker and taker brokers receive correct split', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: maxPrice,
    listingPrice,
    feeVault,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
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

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    collection: group,
    distribution,
    maxAmount: maxPrice,
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (
          await findAtaPda({
            mint,
            owner: listing,
            tokenProgram: TOKEN22_PROGRAM_ID,
          })
        )[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
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
  const takerFee = (listingPrice! * TAKER_FEE_BPS) / BASIS_POINTS;
  // Taker fee is split between the brokers and the protocol based on the BROKER_FEE_PCT.
  const brokerFee = (takerFee! * BROKER_FEE_PCT) / HUNDRED_PCT;
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
        (listingPrice! * sellerFeeBasisPoints) / BASIS_POINTS
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
    state: listing,
    price: maxPrice,
    listingPrice,
    feeVault,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
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

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    distribution,
    maxAmount: maxPrice,
    collection: group,
    // not passing in maker broker
    takerBroker: takerBroker.address, // still passing in taker broker
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (
          await findAtaPda({
            mint,
            owner: listing,
            tokenProgram: TOKEN22_PROGRAM_ID,
          })
        )[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
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
  const takerFee = (listingPrice! * TAKER_FEE_BPS) / BASIS_POINTS;
  // Taker fee is split between the brokers and the protocol based on the BROKER_FEE_PCT.
  const brokerFee = (takerFee! * BROKER_FEE_PCT) / HUNDRED_PCT;
  const protocolFee = takerFee - brokerFee;
  // Maker broker receives MAKER_BROKER_PCT of the protocol fee.
  const makerBrokerFee = (brokerFee! * MAKER_BROKER_FEE_PCT) / HUNDRED_PCT;
  // Taker broker receives whatever is left of the broker fee.
  const takerBrokerFee = brokerFee! - makerBrokerFee;

  // Fee vault receives it's split of the protocol fee and also the maker broker fee since it's not set.
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
        (listingPrice! * sellerFeeBasisPoints) / BASIS_POINTS
  );

  const endingTakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(takerBroker.address).send()).value
  );

  // Taker broker should still receive its share.
  t.assert(
    endingTakerBrokerBalance === startingTakerBrokerBalance + takerBrokerFee
  );
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

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: lister,
    owner: lister.address,
    authority: mintAuthority,
    paymentMint: currency,
  });

  const listIx = await getListWnsInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    currency,
    amount: LAMPORTS_PER_SOL / 2n,
    collection: group,
    distribution,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const buyIx = await getBuyWnsInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    distribution,
    collection: group,
    maxAmount: LAMPORTS_PER_SOL / 2n,
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

  const price = LAMPORTS_PER_SOL / 2n;
  const basisPoints = 500;

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: lister,
    owner: lister.address,
    authority: mintAuthority,
  });

  const listIx = await getListWnsInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    amount: price,
    // (!)
    makerBroker: makerBroker.address,
    collection: group,
    distribution,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const maxAmount = price + (price * BigInt(basisPoints)) / BASIS_POINTS;

  // If the buyer tries to buy the NFT without a maker broker...
  const buyIx = await getBuyWnsInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    distribution,
    collection: group,
    maxAmount,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a broker mismatch error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with a different maker broker...
  const buyIx2 = await getBuyWnsInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    distribution,
    collection: group,
    maxAmount,
    makerBroker: notMakerBroker.address,
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a broker mismatch error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with the correct maker broker...
  const buyIx3 = await getBuyWnsInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    distribution,
    collection: group,
    maxAmount,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx3, tx),
    (tx) => signAndSendTransaction(client, tx, { skipPreflight: true })
  );

  // ...then the transaction should succeed and the listing should be closed.
  const [listing] = await findListStatePda({ mint });
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);
});

test('it has to respect the correct private taker', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const privateTaker = await generateKeyPairSignerWithSol(client);
  const notPrivateTaker = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const price = LAMPORTS_PER_SOL / 2n;
  const basisPoints = 500;

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: lister,
    owner: lister.address,
    authority: mintAuthority,
  });

  const listIx = await getListWnsInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    amount: price,
    privateTaker: privateTaker.address,
    collection: group,
    distribution,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const maxAmount = price + (price * BigInt(basisPoints)) / BASIS_POINTS;

  // If a different buyer tries to buy the NFT...
  const buyIx2 = await getBuyWnsInstructionAsync({
    owner: lister.address,
    payer: notPrivateTaker,
    mint,
    distribution,
    collection: group,
    maxAmount,
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, notPrivateTaker),
    (tx) => appendTransactionMessageInstruction(buyIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a taker not allowed error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED);

  // If the specified private taker buys the NFT...
  const buyIx3 = await getBuyWnsInstructionAsync({
    owner: lister.address,
    payer: privateTaker,
    mint,
    distribution,
    collection: group,
    maxAmount,
  });

  await pipe(
    await createDefaultTransaction(client, privateTaker),
    (tx) => appendTransactionMessageInstruction(buyIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then the transaction should succeed and the list state should be closed.
  const [listing] = await findListStatePda({ mint });
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);
});

test('it cannot buy an expired listing', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: lister,
    owner: lister.address,
    authority: mintAuthority,
  });

  const listIx = await getListWnsInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    amount: LAMPORTS_PER_SOL / 2n,
    expireInSec: 1,
    collection: group,
    distribution,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Sleep for 5 seconds to let the listing expire.
  await sleep(5000);

  // If the buyer tries to buy the expired listing...
  const buyIx = await getBuyWnsInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    distribution,
    collection: group,
    maxAmount: LAMPORTS_PER_SOL / 2n,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a listing expired error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED);
});
