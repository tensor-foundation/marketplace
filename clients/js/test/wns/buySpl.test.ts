import {
  appendTransactionMessageInstruction,
  assertAccountExists,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import { findAtaPda } from '@tensor-foundation/mpl-token-metadata';
import {
  assertTokenNftOwnedBy,
  createAndMintTo,
  createAta,
  createDefaultSolanaClient,
  createDefaultTransaction,
  createWnsNftInGroup,
  generateKeyPairSignerWithSol,
  NftData,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findListStatePda,
  getBuyWnsSplInstructionAsync,
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
  BASIS_POINTS,
  BROKER_FEE_PCT,
  COMPUTE_300K_IX,
  COMPUTE_500K_IX,
  DEFAULT_LISTING_PRICE,
  DEFAULT_SFBP,
  expectCustomError,
  getTestSigners,
  HUNDRED_PCT,
  MAKER_BROKER_FEE_PCT,
  sleep,
  TAKER_BROKER_FEE_PCT,
  TAKER_FEE_BPS,
  TestAction,
} from '../_common.js';
import { setupWnsTest } from './_common.js';
import { computeIx } from '../legacy/_common.js';
import { findAssociatedTokenPda } from '@solana-program/token';

test('it can buy an NFT w/ a SPL token', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
    splMint,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, nftOwner } = signers;
  const { mint, group, distribution } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsSplInstructionAsync({
    mint,
    collection: group,
    currency: splMint,
    owner: nftOwner.address,
    payer: buyer,
    buyer: buyer.address,
    distribution,
    maxAmount: listingPrice,
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
});

test('it can buy with a cosigner', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
    splMint,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
    useSplToken: true,
    useCosigner: true,
  });
  const { payer, nftOwner, cosigner } = signers;
  const { mint, group, distribution } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: buyer,
    buyer: buyer.address,
    distribution,
    collection: group,
    cosigner,
    maxAmount: listingPrice,
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
});

test('it cannot buy an NFT with a lower amount', async (t) => {
  const {
    client,
    signers,
    nft,
    price: listingPrice,
    splMint,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, nftOwner } = signers;
  const { mint, group, distribution } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: buyer,
    buyer: buyer.address,
    collection: group,
    distribution,
    maxAmount: listingPrice - 1n,
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
  const {
    client,
    signers,
    nft,
    price: listingPrice,
    splMint,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
    useSplToken: true,
    useCosigner: true,
  });
  const { payer, nftOwner } = signers;
  const { mint, group, distribution } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  // When a buyer buys the NFT.
  let buyIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: buyer,
    buyer: buyer.address,
    collection: group,
    distribution,
    // Missing cosigner!
    maxAmount: listingPrice,
  });

  let promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  const fakeCosigner = await generateKeyPairSigner();

  // When a buyer buys the NFT.
  buyIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: buyer,
    buyer: buyer.address,
    collection: group,
    distribution,
    cosigner: fakeCosigner, // Invalid cosigner
    maxAmount: listingPrice,
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
    price: listingPrice,
    splMint,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, nftOwner } = signers;
  const { mint, group, distribution } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: buyer,
    buyer: buyer.address,
    collection: group,
    distribution,
    maxAmount: listingPrice,
  });

  const sig = await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  assertTcompNoop(t, client, sig);
});

test('SPL fees are paid correctly', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
    splMint,
    feeVault,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, nftOwner } = signers;
  const { mint, group, distribution, sellerFeeBasisPoints } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }
  const [feeVaultCurrencyAta] = await findAtaPda({
    owner: feeVault,
    mint: splMint!,
  });
  const [distributionCurrencyAta] = await findAtaPda({
    owner: distribution,
    mint: splMint,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: buyer,
    buyer: buyer.address,
    distribution,
    collection: group,
    maxAmount: listingPrice,
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

  // The buyer has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const feeVaultBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(feeVaultCurrencyAta).send()).value
      .uiAmount!
  );

  const distributionBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(distributionCurrencyAta).send())
      .value.uiAmount!
  );

  // Fee vault gets entire protocol fee because no maker or taker brokers are set.
  t.assert(feeVaultBalance === (listingPrice * TAKER_FEE_BPS) / BASIS_POINTS);

  // Distribution account gets the royalty payment.
  t.assert(
    distributionBalance + (listingPrice * sellerFeeBasisPoints) / BASIS_POINTS
  );
});

test('maker and taker brokers receive correct split', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
    splMint,
    feeVault,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
    useSplToken: true,
    useMakerBroker: true,
  });
  const { payer, nftOwner, makerBroker, takerBroker } = signers;
  const { mint, group, distribution, sellerFeeBasisPoints } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [feeVaultCurrencyAta] = await findAtaPda({
    owner: feeVault,
    mint: splMint!,
  });
  const [distributionCurrencyAta] = await findAtaPda({
    owner: distribution,
    mint: splMint,
  });
  const [makerBrokerCurrencyAta] = await findAtaPda({
    owner: makerBroker.address,
    mint: splMint,
  });
  const [takerBrokerCurrencyAta] = await findAtaPda({
    owner: takerBroker.address,
    mint: splMint,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: buyer,
    buyer: buyer.address,
    distribution,
    collection: group,
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
    maxAmount: listingPrice,
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

  // The buyer has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const feeVaultBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(feeVaultCurrencyAta).send()).value
      .uiAmount!
  );

  const distributionBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(distributionCurrencyAta).send())
      .value.uiAmount!
  );

  const makerBrokerBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(makerBrokerCurrencyAta).send())
      .value.uiAmount!
  );

  const takerBrokerBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(takerBrokerCurrencyAta).send())
      .value.uiAmount!
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
  t.assert(feeVaultBalance === protocolFee);

  // Distribution account gets the royalty payment.
  t.assert(
    distributionBalance + (listingPrice * sellerFeeBasisPoints) / BASIS_POINTS
  );

  t.assert(makerBrokerBalance === makerBrokerFee);

  // Taker broker receives whatever is left of the protocol fee.
  t.assert(takerBrokerBalance === takerBrokerFee);
});

test('taker broker receives correct split even if maker broker is not set', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
    splMint,
    feeVault,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, nftOwner, takerBroker } = signers;
  const { mint, group, distribution, sellerFeeBasisPoints } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [feeVaultCurrencyAta] = await findAtaPda({
    owner: feeVault,
    mint: splMint!,
  });
  const [distributionCurrencyAta] = await findAtaPda({
    owner: distribution,
    mint: splMint,
  });
  const [takerBrokerCurrencyAta] = await findAtaPda({
    owner: takerBroker.address,
    mint: splMint,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: buyer,
    buyer: buyer.address,
    distribution,
    collection: group,
    takerBroker: takerBroker.address,
    maxAmount: listingPrice,
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

  // The buyer has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const feeVaultBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(feeVaultCurrencyAta).send()).value
      .uiAmount!
  );

  const distributionBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(distributionCurrencyAta).send())
      .value.uiAmount!
  );

  const takerBrokerBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(takerBrokerCurrencyAta).send())
      .value.uiAmount!
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
  t.assert(feeVaultBalance === protocolFee + makerBrokerFee);

  // Distribution account gets the royalty payment.
  t.assert(
    distributionBalance + (listingPrice * sellerFeeBasisPoints) / BASIS_POINTS
  );

  // Taker broker still receives its share.
  t.assert(takerBrokerBalance === takerBrokerFee);
});

test('it can buy an NFT w/ a SPL token w/ multiple creators', async (t) => {
  t.timeout(15_000);
  const client = createDefaultSolanaClient();
  const { buyer, nftOwner, nftUpdateAuthority } = await getTestSigners(client);

  const mintAuthority = await generateKeyPairSigner();

  // Create SPL token and fund the buyer with it.
  const [{ mint: currency }] = await createAndMintTo({
    client,
    payer: buyer,
    mintAuthority,
    recipient: buyer.address,
    decimals: 0,
    initialSupply: 1_000_000_000n,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  const numCreators = 5;
  const creators = [];

  // Create some creators with equal shares.
  for (let i = 0; i < numCreators; i++) {
    const share = Math.floor(100 / numCreators);

    creators.push({
      address: (await generateKeyPairSignerWithSol(client)).address,
      share,
    });
  }

  // Round out the share to 100 by giving the first creator the remainder.
  if (creators.reduce((acc, c) => acc + c.share, 0) !== 100) {
    creators[0].share += 100 - creators.reduce((acc, c) => acc + c.share, 0);
  }

  const data: NftData = {
    name: 'Test NFT',
    symbol: 'TST',
    uri: 'https://example.com',
    royaltyBasisPoints: Number(DEFAULT_SFBP),
    creators,
  };

  // Mint NFT
  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: buyer,
    owner: nftOwner.address,
    authority: nftUpdateAuthority,
    paymentMint: currency,
    data,
  });

  // List the NFT.
  const listIx = await getListWnsInstructionAsync({
    owner: nftOwner,
    mint,
    amount: DEFAULT_LISTING_PRICE,
    distribution,
    collection: group,
    currency: currency,
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(COMPUTE_300K_IX, tx),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Listing was created.
  const [listing] = await findListStatePda({
    mint,
  });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // NFT is now escrowed in the listing.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: listing,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const creatorsAtas = [];
  for (const creator of creators) {
    creatorsAtas.push(
      await createAta({
        client,
        payer: buyer,
        mint: currency,
        owner: creator.address,
      })
    );
  }

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency,
    owner: nftOwner.address,
    payer: buyer,
    buyer: buyer.address,
    distribution,
    collection: group,
    maxAmount: DEFAULT_LISTING_PRICE,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the buyer has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const [distributionCurrencyAta] = await findAtaPda({
    owner: distribution,
    mint: currency,
  });

  const distributionBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(distributionCurrencyAta).send())
      .value.uiAmount!
  );

  // Distribution account gets the royalty payment.
  t.assert(
    distributionBalance + (DEFAULT_LISTING_PRICE * DEFAULT_SFBP) / BASIS_POINTS
  );
});

test('it cannot buy a SOL listing with a different SPL token', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const listingAmount = 100_000_000n;

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
  });

  const listWnsIx = await getListWnsInstructionAsync({
    owner: lister,
    mint,
    amount: listingAmount,
    distribution,
    collection: group,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listWnsIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Try buying with our own SPL token...
  const buyWnsSplIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency,
    owner: lister.address,
    payer: buyer,
    buyer: buyer.address,
    maxAmount: listingAmount,
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    distribution,
    collection: group,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyWnsSplIx, tx),
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
  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: lister,
    owner: lister.address,
    authority: mintAuthority,
    paymentMint: currency,
  });

  // List the NFT.
  const listWnsIx = await getListWnsInstructionAsync({
    owner: lister,
    mint,
    distribution,
    collection: group,
    currency,
    amount: price,
    // (!)
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listWnsIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer tries to buy the NFT without a maker broker...
  const buyWnsSplIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency,
    owner: lister.address,
    payer: buyer,
    buyer: buyer.address,
    maxAmount: price,
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    distribution,
    collection: group,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyWnsSplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... should fail with a broker mismatch error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with a different maker broker...
  const buyWnsSplIx2 = await getBuyWnsSplInstructionAsync({
    mint,
    currency,
    owner: lister.address,
    payer: buyer,
    buyer: buyer.address,
    maxAmount: price,
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    // (!)
    makerBroker: notMakerBroker.address,
    distribution,
    collection: group,
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyWnsSplIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a broker mismatch error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with the correct maker broker...
  const buyWnsSplIx3 = await getBuyWnsSplInstructionAsync({
    mint,
    currency,
    owner: lister.address,
    payer: buyer,
    buyer: buyer.address,
    maxAmount: price,
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    makerBroker: makerBroker.address,
    distribution,
    collection: group,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyWnsSplIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should succeed and the list state should be closed.
  const [listing] = await findListStatePda({ mint });
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);
});

test('it has to specify the correct private taker', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const privateTaker = await generateKeyPairSignerWithSol(client);
  const notPrivateTaker = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const price = 100_000_000n;

  const [{ mint: currency }] = await createAndMintTo({
    client,
    mintAuthority,
    payer: privateTaker,
    recipient: privateTaker.address,
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

  // Also initialize the TA for notPrivateTaker.
  await createAta({
    client,
    payer: notPrivateTaker,
    mint: currency,
    owner: notPrivateTaker.address,
  });

  const listWnsIx = await getListWnsInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    distribution,
    collection: group,
    currency,
    amount: price,
    // (!)
    privateTaker: privateTaker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listWnsIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer who is not the private taker tries to buy the NFT...
  const buyWnsSplIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency,
    buyer: notPrivateTaker.address,
    payer: notPrivateTaker,
    owner: lister.address,
    maxAmount: price,
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    distribution,
    collection: group,
  });

  const tx = pipe(
    await createDefaultTransaction(client, notPrivateTaker),
    (tx) => appendTransactionMessageInstruction(buyWnsSplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a taker not allowed error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED);

  // If the buyer who is the private taker tries to buy the NFT...
  const buyWnsSplIx2 = await getBuyWnsSplInstructionAsync({
    mint,
    currency,
    buyer: privateTaker.address,
    payer: privateTaker,
    owner: lister.address,
    maxAmount: price,
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    distribution,
    collection: group,
  });

  await pipe(
    await createDefaultTransaction(client, privateTaker),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyWnsSplIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should succeed and the list state should be closed.
  const [listing] = await findListStatePda({ mint });
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);
});

test('it cannot buy an expired listing', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);

  const price = 100_000_000n;

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

  const listWnsIx = await getListWnsInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    distribution,
    collection: group,
    currency,
    amount: price,
    // (!)
    expireInSec: 1,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listWnsIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Wait for 5 seconds to ensure the listing has expired.
  await sleep(5000);

  // Try to buy the NFT...
  const buyWnsSplIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    distribution,
    collection: group,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyWnsSplIx, tx),
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

  const price = 100_000_000n;

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
    authority: creator1,
    paymentMint: currency,
    data: {
      creators: [
        { address: creator1.address, share: 70 },
        { address: creator2.address, share: 30 },
      ],
      royaltyBasisPoints: Number(ROYALTIES_BASIS_POINTS),
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
  });

  const listWnsIx = await getListWnsInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    distribution,
    collection: group,
    currency,
    amount: price,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listWnsIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const distributionAta = await createAta({
    client,
    payer: creator1,
    mint: currency,
    owner: distribution,
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
  const distributionBalanceBefore = await client.rpc
    .getTokenAccountBalance(distributionAta)
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

  const buyWnsSplIx = await getBuyWnsSplInstructionAsync({
    mint,
    currency,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
    distribution,
    collection: group,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyWnsSplIx, tx),
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
  //(!) WNS royalties go to the distribution account and not directly to the creator.
  const distributionBalanceAfter = await client.rpc
    .getTokenAccountBalance(distributionAta)
    .send();
  t.assert(
    BigInt(distributionBalanceAfter.value.amount) ===
      BigInt(distributionBalanceBefore.value.amount) +
        (price * ROYALTIES_BASIS_POINTS) / BASIS_POINTS //  5%
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

  const {
    mint: mintT22,
    group: groupT22,
    distribution: distributionT22,
  } = await createWnsNftInGroup({
    client,
    payer: lister,
    owner: lister.address,
    authority: mintAuthority,
    paymentMint: currencyT22,
  });

  const {
    mint: mintLegacy,
    group: groupLegacy,
    distribution: distributionLegacy,
  } = await createWnsNftInGroup({
    client,
    payer: lister,
    owner: lister.address,
    authority: mintAuthority,
    paymentMint: currencyLegacy,
  });

  const listWnsIxT22 = await getListWnsInstructionAsync({
    payer: lister,
    owner: lister,
    mint: mintT22,
    distribution: distributionT22,
    collection: groupT22,
    currency: currencyT22,
    amount: price,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listWnsIxT22, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listWnsIxLegacy = await getListWnsInstructionAsync({
    payer: lister,
    owner: lister,
    mint: mintLegacy,
    distribution: distributionLegacy,
    collection: groupLegacy,
    currency: currencyLegacy,
    amount: price,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listWnsIxLegacy, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const buyWnsSplIxT22 = await getBuyWnsSplInstructionAsync({
    mint: mintT22,
    currency: currencyT22,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    distribution: distributionT22,
    collection: groupT22,
    // (!)
    currencyTokenProgram: TOKEN22_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyWnsSplIxT22, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listStateT22 = await findListStatePda({ mint: mintT22 });
  t.false((await fetchEncodedAccount(client.rpc, listStateT22[0])).exists);

  const buyWnsSplIxLegacy = await getBuyWnsSplInstructionAsync({
    mint: mintLegacy,
    currency: currencyLegacy,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    distribution: distributionLegacy,
    collection: groupLegacy,
    // (!)
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyWnsSplIxLegacy, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listStateLegacy = await findListStatePda({ mint: mintLegacy });
  t.false((await fetchEncodedAccount(client.rpc, listStateLegacy[0])).exists);
});
