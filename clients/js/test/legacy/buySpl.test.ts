import { findAssociatedTokenPda } from '@solana-program/token';
import {
  appendTransactionMessageInstruction,
  assertAccountDecoded,
  assertAccountExists,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultNft,
  Creator,
  findAtaPda,
} from '@tensor-foundation/mpl-token-metadata';
import {
  createAndMintTo,
  createAta,
  createDefaultSolanaClient,
  createDefaultTransaction,
  expectCustomError,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findFeeVaultPda,
  findListStatePda,
  getBuyLegacySplInstructionAsync,
  getListLegacyInstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED,
  TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED,
} from '../../src';
import { computeIx } from './_common';
import {
  BASIS_POINTS,
  BROKER_FEE_PCT,
  MAKER_BROKER_FEE_PCT,
  sleep,
  TAKER_BROKER_FEE_PCT,
  TAKER_FEE_BPS,
} from '../_common';
import { TokenStandard } from '@tensor-foundation/resolvers';

test('it can buy an NFT paying using a SPL token', async (t) => {
  t.timeout(10_000);
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
  const [{ mint: currency }] = await createAndMintTo({
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
    mint: currency,
    tokenProgram: TOKEN_PROGRAM_ID,
  });
  const buyerAtaBalance = (
    await client.rpc.getTokenAccountBalance(buyerAta).send()
  ).value.uiAmount;
  t.is(buyerAtaBalance, Number(initialSupply));

  // Create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer,
    authority: updateAuthority,
    owner: owner.address,
  });

  // List the NFT.
  const listLegacyIx = await getListLegacyInstructionAsync({
    payer,
    owner,
    mint,
    currency: currency,
    amount: price,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should exist.
  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  const [listState] = await findListStatePda({ mint });
  const [feeVault] = await findFeeVaultPda({ address: listState });

  const [buyerCurrencyTa] = await findAssociatedTokenPda({
    owner: buyer.address,
    mint: currency,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  const updateAuthorityCurrencyTa = await createAta({
    client,
    payer,
    mint: currency,
    owner: updateAuthority.address,
  });

  const feeVaultCurrencyTa = await createAta({
    client,
    payer,
    mint: currency,
    owner: feeVault,
  });
  const ownerCurrencyTa = await createAta({
    client,
    payer,
    mint: currency,
    owner: owner.address,
  });

  const buyLegacySplIx = await getBuyLegacySplInstructionAsync({
    owner: owner.address,
    payer: buyer,
    feeVaultCurrencyTa,
    ownerCurrencyTa,
    payerCurrencyTa: buyerCurrencyTa,
    listState,
    rentDestination: payer.address,
    mint,
    maxAmount: maxPrice,
    optionalRoyaltyPct: 100, // Have to specify royalties as these are not pNFTs.
    currency: currency,
    creators: [updateAuthority.address],
    creatorsCurrencyTa: [updateAuthorityCurrencyTa],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should be closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // Buyer has the token.
  const buyerToken = await fetchJsonParsedAccount(
    client.rpc,
    (await findAtaPda({ mint, owner: buyer.address }))[0]
  );
  assertAccountDecoded(buyerToken);

  // Update authority should have received royalties as the creator on the royalty plugin.
  const updateAuthorityBalance = (
    await client.rpc.getTokenAccountBalance(updateAuthorityCurrencyTa).send()
  ).value.uiAmount;
  t.is(updateAuthorityBalance, Number(royalties));
});

test('it can buy an NFT paying using a SPL token w/ four creators', async (t) => {
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

  const numCreators = 4;
  const creators: Creator[] = [];

  for (let i = 0; i < numCreators; i++) {
    const share = Math.floor(100 / numCreators);

    creators.push({
      address: (await generateKeyPairSignerWithSol(client)).address,
      share,
      verified: false,
    });
  }

  if (creators.reduce((acc, c) => acc + c.share, 0) !== 100) {
    creators[0].share += 100 - creators.reduce((acc, c) => acc + c.share, 0);
  }

  const price = 100_000_000n;
  const maxPrice = 125_000_000n;
  const initialSupply = 1_000_000_000n;

  // Create a SPL token and fund the buyer with it.
  const [{ mint: currency }] = await createAndMintTo({
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
    mint: currency,
    tokenProgram: TOKEN_PROGRAM_ID,
  });
  const buyerAtaBalance = (
    await client.rpc.getTokenAccountBalance(buyerAta).send()
  ).value.uiAmount;
  t.is(buyerAtaBalance, Number(initialSupply));

  // Create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer,
    authority: updateAuthority,
    owner: owner.address,
    creators,
  });

  // List the NFT.
  const listLegacyIx = await getListLegacyInstructionAsync({
    payer,
    owner,
    mint,
    currency: currency,
    amount: price,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should exist.
  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  const [listState] = await findListStatePda({ mint });
  const [feeVault] = await findFeeVaultPda({ address: listState });

  const [buyerCurrencyTa] = await findAssociatedTokenPda({
    owner: buyer.address,
    mint: currency,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  const creatorsAtas = [];
  for (const creator of creators) {
    creatorsAtas.push(
      await createAta({ client, payer, mint: currency, owner: creator.address })
    );
  }

  const feeVaultCurrencyTa = await createAta({
    client,
    payer,
    mint: currency,
    owner: feeVault,
  });
  const ownerCurrencyTa = await createAta({
    client,
    payer,
    mint: currency,
    owner: owner.address,
  });

  const buyLegacySplIx = await getBuyLegacySplInstructionAsync({
    owner: owner.address,
    payer: buyer,
    feeVaultCurrencyTa,
    ownerCurrencyTa,
    payerCurrencyTa: buyerCurrencyTa,
    listState,
    rentDestination: payer.address,
    mint,
    maxAmount: maxPrice,
    optionalRoyaltyPct: 100, // Have to specify royalties as these are not pNFTs.
    currency: currency,
    creators: creators.map((c) => c.address),
    creatorsCurrencyTa: creatorsAtas,
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should be closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // Buyer has the token.
  const buyerToken = await fetchJsonParsedAccount(
    client.rpc,
    (await findAtaPda({ mint, owner: buyer.address }))[0]
  );
  assertAccountDecoded(buyerToken);
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

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: mintAuthority,
    owner: lister.address,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner: lister,
    mint,
    amount: listingAmount,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Try buying with our own SPL token...
  const buyLegacySplIx = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: listingAmount,
    currency: currency,
    creators: [mintAuthority.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
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
  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: creator,
    owner: lister.address,
    creators: [{ address: creator.address, share: 100, verified: true }],
  });

  // List the NFT.
  const listLegacyIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    currency,
    amount: price,
    // (!)
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listState] = await findListStatePda({ mint });
  // If the buyer tries to buy the NFT without a maker broker...
  const buyLegacySplIx = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: buyer,
    listState,
    mint,
    maxAmount: price,
    optionalRoyaltyPct: 100,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... should fail with a broker mismatch error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with a different maker broker...
  const buyLegacySplIx2 = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: buyer,
    listState,
    rentDestination: lister.address,
    mint,
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
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a broker mismatch error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with the correct maker broker...
  const buyLegacySplIx3 = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: buyer,
    listState,
    mint,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    makerBroker: makerBroker.address,
  });

  const tx3 = await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should succeed.
  t.is(typeof tx3, 'string');
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

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: creator,
    owner: lister.address,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    currency,
    amount: price,
    // (!)
    cosigner,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer tries to buy the NFT without a cosigner...
  const buyLegacySplIx = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a bad cosigner error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // If the buyer tries to buy the NFT with an incorrect cosigner...
  const buyLegacySplIx2 = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    cosigner: notCosigner,
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a bad cosigner error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // If the buyer tries to buy the NFT with the correct cosigner...
  const buyLegacySplIx3 = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    cosigner,
  });

  const tx3 = await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should succeed.
  t.is(typeof tx3, 'string');
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

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: creator,
    owner: lister.address,
  });

  // Also initialize the TA for notPrivateTaker.
  await createAta({
    client,
    payer: notPrivateTaker,
    mint: currency,
    owner: notPrivateTaker.address,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    currency,
    amount: price,
    // (!)
    privateTaker: privateTaker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer who is not the private taker tries to buy the NFT...
  const buyLegacySplIx = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: notPrivateTaker,
    mint,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  const tx = pipe(
    await createDefaultTransaction(client, notPrivateTaker),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should fail with a taker not allowed error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED);

  // If the buyer who is the private taker tries to buy the NFT...
  const buyLegacySplIx2 = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: privateTaker,
    mint,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  const tx2 = await pipe(
    await createDefaultTransaction(client, privateTaker),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... it should succeed.
  t.is(typeof tx2, 'string');
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

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: creator,
    owner: lister.address,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    currency,
    amount: price,
    // (!)
    expireInSec: 1,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Wait for 5 seconds to ensure the listing has expired.
  await sleep(5000);

  // Try to buy the NFT...
  const buyLegacySplIx = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: price,
    currency,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
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

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: creator1,
    owner: lister.address,
    creators,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    currency,
    amount: price,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
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

  const buyLegacySplIx = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: price,
    currency,
    creators: creators.map((c) => c.address),
    // need to specify this to check if full royalty amounts are paid out
    optionalRoyaltyPct: 100,
    currencyTokenProgram: TOKEN_PROGRAM_ID,
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
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

test('pNFT royalties are enforced', async (t) => {
  const ROYALTIES_BASIS_POINTS = 500n;
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

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: creator,
    owner: lister.address,
    standard: TokenStandard.ProgrammableNonFungible,
    creators: [{ address: creator.address, share: 100, verified: true }],
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    currency,
    amount: price,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const creatorAta = await createAta({
    client,
    payer: creator,
    mint: currency,
    owner: creator.address,
  });
  const creatorBalanceBefore = await client.rpc
    .getTokenAccountBalance(creatorAta)
    .send();

  // Even if the buyer specifies 0% royalties, the royalties should still be enforced
  const buyLegacySplIx = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: price,
    currency,
    optionalRoyaltyPct: 0,
    creators: [creator.address],
    currencyTokenProgram: TOKEN_PROGRAM_ID,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const creatorBalanceAfter = await client.rpc
    .getTokenAccountBalance(creatorAta)
    .send();

  t.assert(
    BigInt(creatorBalanceAfter.value.amount) ===
      BigInt(creatorBalanceBefore.value.amount) +
        (price * ROYALTIES_BASIS_POINTS) / BASIS_POINTS
  );
});

test('optional royalties are respected', async (t) => {
  const ROYALTIES_BASIS_POINTS = 500n;
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

  const royaltyPctsToTest = [0, 10, 25, 50, 100];

  const creatorAta = await createAta({
    client,
    payer: creator,
    mint: currency,
    owner: creator.address,
  });

  for (const royaltyPct of royaltyPctsToTest) {
    const { mint } = await createDefaultNft({
      client,
      payer: lister,
      authority: creator,
      owner: lister.address,
      standard: TokenStandard.NonFungible,
      creators: [{ address: creator.address, share: 100, verified: true }],
    });

    const listLegacyIx = await getListLegacyInstructionAsync({
      payer: lister,
      owner: lister,
      mint,
      currency,
      amount: price,
    });

    await pipe(
      await createDefaultTransaction(client, lister),
      (tx) => appendTransactionMessageInstruction(computeIx, tx),
      (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );

    const creatorBalanceBefore = await client.rpc
      .getTokenAccountBalance(creatorAta)
      .send();

    const buyLegacySplIx = await getBuyLegacySplInstructionAsync({
      owner: lister.address,
      payer: buyer,
      mint,
      maxAmount: price,
      currency,
      optionalRoyaltyPct: royaltyPct,
      creators: [creator.address],
      currencyTokenProgram: TOKEN_PROGRAM_ID,
    });

    await pipe(
      await createDefaultTransaction(client, buyer),
      (tx) => appendTransactionMessageInstruction(computeIx, tx),
      (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );

    const creatorBalanceAfter = await client.rpc
      .getTokenAccountBalance(creatorAta)
      .send();

    t.assert(
      BigInt(creatorBalanceAfter.value.amount) ===
        BigInt(creatorBalanceBefore.value.amount) +
          (((price * ROYALTIES_BASIS_POINTS) / BASIS_POINTS) *
            BigInt(royaltyPct)) /
            100n
    );
  }
});

test('it works cross-program (NFT - legacy, SPL - T22)', async (t) => {
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
    tokenProgram: TOKEN22_PROGRAM_ID,
    decimals: 0,
    initialSupply: 1_000_000_000n,
  });

  const { mint } = await createDefaultNft({
    client,
    payer: lister,
    authority: creator,
    owner: lister.address,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    currency,
    amount: price,
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const buyLegacySplIx = await getBuyLegacySplInstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: price,
    currency,
    creators: [creator.address],
    // (!)
    currencyTokenProgram: TOKEN22_PROGRAM_ID,
  });

  const tx = await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  t.is(typeof tx, 'string');
});
