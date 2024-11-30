import {
  appendTransactionMessageInstruction,
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
  createT22NftWithRoyalties,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  getBuyT22SplInstructionAsync,
  getListT22InstructionAsync,
  TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED,
  TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED,
  findListStatePda,
} from '../../src/index.js';
import {
  assertTcompNoop,
  BASIS_POINTS,
  BROKER_FEE_PCT,
  COMPUTE_500K_IX,
  DEFAULT_SFBP,
  expectCustomError,
  HUNDRED_PCT,
  MAKER_BROKER_FEE_PCT,
  sleep,
  TAKER_BROKER_FEE_PCT,
  TAKER_FEE_BPS,
  TestAction,
} from '../_common.js';
import { setupT22Test } from './_common.js';
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
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const nftUpdateAuthorityCurrencyAta = await createAta({
    client,
    payer,
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: payer,
    buyer: buyer.address,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorsCurrencyTa: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
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
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
    useCosigner: true,
  });
  const { payer, buyer, nftOwner, nftUpdateAuthority, cosigner } = signers;
  const { mint, extraAccountMetas } = nft;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: payer,
    buyer: buyer.address,
    cosigner,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorsCurrencyTa: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
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
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: payer,
    buyer: buyer.address,
    maxAmount: listingPrice - 1n,
    creators: [nftUpdateAuthority.address],
    creatorsCurrencyTa: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
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
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
    useCosigner: true,
  });
  const { payer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  let buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    // Missing cosigner!
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorsCurrencyTa: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
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
  buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    cosigner: fakeCosigner, // Invalid cosigner
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorsCurrencyTa: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
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
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorsCurrencyTa: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
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
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas, sellerFeeBasisPoints } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [feeVaultCurrencyAta] = await findAtaPda({
    owner: feeVault,
    mint: splMint!,
  });

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorsCurrencyTa: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
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

  const creatorBalance = BigInt(
    (
      await client.rpc
        .getTokenAccountBalance(nftUpdateAuthorityCurrencyAta)
        .send()
    ).value.uiAmount!
  );

  // Fee vault gets entire protocol fee because no maker or taker brokers are set.
  t.assert(feeVaultBalance === (listingPrice * TAKER_FEE_BPS) / BASIS_POINTS);

  // Royalties are paid to the creator ATA.
  t.assert(
    creatorBalance ===
      BigInt(listingPrice * sellerFeeBasisPoints) / BASIS_POINTS
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
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
    useMakerBroker: true,
  });
  const { payer, nftOwner, nftUpdateAuthority, makerBroker, takerBroker } =
    signers;
  const { mint, extraAccountMetas } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  const [feeVaultCurrencyAta] = await findAtaPda({
    owner: feeVault,
    mint: splMint!,
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
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorsCurrencyTa: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
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
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, nftOwner, nftUpdateAuthority, takerBroker } = signers;
  const { mint, extraAccountMetas } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  const [feeVaultCurrencyAta] = await findAtaPda({
    owner: feeVault,
    mint: splMint!,
  });
  const [takerBrokerCurrencyAta] = await findAtaPda({
    owner: takerBroker.address,
    mint: splMint,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    takerBroker: takerBroker.address,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorsCurrencyTa: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
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

  // Taker broker still receives its share.
  t.assert(takerBrokerBalance === takerBrokerFee);
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

  const nft = await createT22NftWithRoyalties({
    client,
    payer: lister,
    owner: lister.address,
    mintAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + creator.address,
      value: DEFAULT_SFBP.toString(),
    },
  });

  const listT22Ix = await getListT22InstructionAsync({
    owner: lister,
    mint: nft.mint,
    amount: listingAmount,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Try buying with our own SPL token...
  const buyT22SplIx = await getBuyT22SplInstructionAsync({
    mint: nft.mint,
    currency,
    owner: lister.address,
    payer: buyer,
    buyer: buyer.address,
    maxAmount: listingAmount,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyT22SplIx, tx),
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
  const nft = await createT22NftWithRoyalties({
    client,
    payer: lister,
    owner: lister.address,
    mintAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + creator.address,
      value: DEFAULT_SFBP.toString(),
    },
  });

  // List the NFT.
  const listT22Ix = await getListT22InstructionAsync({
    owner: lister,
    mint: nft.mint,
    currency,
    amount: price,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
    // (!)
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer tries to buy the NFT without a maker broker...
  const buyT22SplIx = await getBuyT22SplInstructionAsync({
    mint: nft.mint,
    currency,
    owner: lister.address,
    payer: buyer,
    buyer: buyer.address,
    maxAmount: price,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyT22SplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... should fail with a broker mismatch error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with a different maker broker...
  const buyT22SplIx2 = await getBuyT22SplInstructionAsync({
    mint: nft.mint,
    currency,
    owner: lister.address,
    payer: buyer,
    buyer: buyer.address,
    maxAmount: price,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    // (!)
    makerBroker: notMakerBroker.address,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyT22SplIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a broker mismatch error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with the correct maker broker...
  const buyT22SplIx3 = await getBuyT22SplInstructionAsync({
    mint: nft.mint,
    currency,
    owner: lister.address,
    payer: buyer,
    buyer: buyer.address,
    maxAmount: price,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    makerBroker: makerBroker.address,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyT22SplIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should succeed and the listing should be closed.
  const [listState] = await findListStatePda({ mint: nft.mint });
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

  const nft = await createT22NftWithRoyalties({
    client,
    payer: lister,
    owner: lister.address,
    mintAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + creator.address,
      value: DEFAULT_SFBP.toString(),
    },
  });

  // Also initialize the TA for notPrivateTaker.
  await createAta({
    client,
    payer: notPrivateTaker,
    mint: currency,
    owner: notPrivateTaker.address,
  });

  const listT22Ix = await getListT22InstructionAsync({
    payer: lister,
    owner: lister,
    mint: nft.mint,
    currency,
    amount: price,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
    // (!)
    privateTaker: privateTaker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer who is not the private taker tries to buy the NFT...
  const buyT22SplIx = await getBuyT22SplInstructionAsync({
    mint: nft.mint,
    currency,
    buyer: notPrivateTaker.address,
    payer: notPrivateTaker,
    owner: lister.address,
    maxAmount: price,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  const tx = pipe(
    await createDefaultTransaction(client, notPrivateTaker),
    (tx) => appendTransactionMessageInstruction(buyT22SplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a taker not allowed error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED);

  // If the buyer who is the private taker tries to buy the NFT...
  const buyT22SplIx2 = await getBuyT22SplInstructionAsync({
    mint: nft.mint,
    currency,
    buyer: privateTaker.address,
    payer: privateTaker,
    owner: lister.address,
    maxAmount: price,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, privateTaker),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyT22SplIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should succeed and the listing should be closed.
  const [listState] = await findListStatePda({ mint: nft.mint });
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

  const nft = await createT22NftWithRoyalties({
    client,
    payer: lister,
    owner: lister.address,
    mintAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + creator.address,
      value: DEFAULT_SFBP.toString(),
    },
  });

  const listT22Ix = await getListT22InstructionAsync({
    payer: lister,
    owner: lister,
    mint: nft.mint,
    currency,
    amount: price,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
    // (!)
    expireInSec: 1,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Wait for 5 seconds to ensure the listing has expired.
  await sleep(5000);

  // Try to buy the NFT...
  const buyT22SplIx = await getBuyT22SplInstructionAsync({
    mint: nft.mint,
    currency,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyT22SplIx, tx),
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
  const creator = await generateKeyPairSignerWithSol(client);
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

  const nft = await createT22NftWithRoyalties({
    client,
    payer: lister,
    owner: lister.address,
    mintAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + creator.address,
      value: DEFAULT_SFBP.toString(),
    },
  });

  const listT22Ix = await getListT22InstructionAsync({
    payer: lister,
    owner: lister,
    mint: nft.mint,
    currency,
    amount: price,
    makerBroker: makerBroker.address,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listT22Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const creatorAta = await createAta({
    client,
    payer: creator,
    mint: currency,
    owner: creator.address,
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
  const creatorBalanceBefore = await client.rpc
    .getTokenAccountBalance(creatorAta)
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

  const buyT22SplIx = await getBuyT22SplInstructionAsync({
    mint: nft.mint,
    currency,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
    transferHookAccounts: nft.extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyT22SplIx, tx),
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
  const creatorBalanceAfter = await client.rpc
    .getTokenAccountBalance(creatorAta)
    .send();
  t.assert(
    BigInt(creatorBalanceAfter.value.amount) ===
      BigInt(creatorBalanceBefore.value.amount) +
        (price * ROYALTIES_BASIS_POINTS) / BASIS_POINTS // 5%
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

  const nftListedForT22 = await createT22NftWithRoyalties({
    client,
    payer: lister,
    owner: lister.address,
    mintAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + creator.address,
      value: DEFAULT_SFBP.toString(),
    },
  });

  const nftListedForLegacy = await createT22NftWithRoyalties({
    client,
    payer: lister,
    owner: lister.address,
    mintAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + creator.address,
      value: DEFAULT_SFBP.toString(),
    },
  });

  const listT22IxT22 = await getListT22InstructionAsync({
    payer: lister,
    owner: lister,
    mint: nftListedForT22.mint,
    currency: currencyT22,
    amount: price,
    transferHookAccounts: nftListedForT22.extraAccountMetas.map(
      (a) => a.address
    ),
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listT22IxT22, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listT22IxLegacy = await getListT22InstructionAsync({
    payer: lister,
    owner: lister,
    mint: nftListedForLegacy.mint,
    currency: currencyLegacy,
    amount: price,
    transferHookAccounts: nftListedForLegacy.extraAccountMetas.map(
      (a) => a.address
    ),
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listT22IxLegacy, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const buyT22SplIxT22 = await getBuyT22SplInstructionAsync({
    mint: nftListedForT22.mint,
    currency: currencyT22,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    creators: [creator.address],
    transferHookAccounts: nftListedForT22.extraAccountMetas.map(
      (a) => a.address
    ),
    // (!)
    currencyTokenProgram: TOKEN22_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyT22SplIxT22, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listStateT22 = await findListStatePda({ mint: nftListedForT22.mint });
  t.false((await fetchEncodedAccount(client.rpc, listStateT22[0])).exists);

  const buyT22SplIxLegacy = await getBuyT22SplInstructionAsync({
    mint: nftListedForLegacy.mint,
    currency: currencyLegacy,
    buyer: buyer.address,
    payer: buyer,
    owner: lister.address,
    maxAmount: price,
    creators: [creator.address],
    transferHookAccounts: nftListedForLegacy.extraAccountMetas.map(
      (a) => a.address
    ),
    // (!)
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyT22SplIxLegacy, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const listStateLegacy = await findListStatePda({
    mint: nftListedForLegacy.mint,
  });
  t.false((await fetchEncodedAccount(client.rpc, listStateLegacy[0])).exists);
});
