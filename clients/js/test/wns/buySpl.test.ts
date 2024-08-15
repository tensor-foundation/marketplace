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
  TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH,
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
  TAKER_FEE_BPS,
  TestAction,
} from '../_common.js';
import { setupWnsTest } from './_common.js';

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
  const { mint, distribution } = nft;
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
            tokenProgramId: TOKEN22_PROGRAM_ID,
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
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
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
  const { mint, distribution } = nft;
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
            tokenProgramId: TOKEN22_PROGRAM_ID,
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
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
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
  const { mint, distribution } = nft;
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
  const { mint, distribution } = nft;
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
  const { mint, distribution } = nft;
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
  const { mint, distribution, sellerFeeBasisPoints } = nft;
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
            tokenProgramId: TOKEN22_PROGRAM_ID,
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
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
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
  const { mint, distribution, sellerFeeBasisPoints } = nft;
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
            tokenProgramId: TOKEN22_PROGRAM_ID,
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
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
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
  const { mint, distribution, sellerFeeBasisPoints } = nft;
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
            tokenProgramId: TOKEN22_PROGRAM_ID,
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
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
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
  const { mint, distribution } = await createWnsNftInGroup({
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

  t.pass();

  // NFT is now escrowed in the listing.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: listing,
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
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
    maxAmount: DEFAULT_LISTING_PRICE,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx, { skipPreflight: true })
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the buyer has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
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
