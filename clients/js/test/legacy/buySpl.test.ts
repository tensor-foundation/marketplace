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
  createAta,
  createDefaultSolanaClient,
  createDefaultTransaction,
  createTestMint,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import {
  createDefaultNft,
  Creator,
  findAtaPda,
} from '@tensor-foundation/mpl-token-metadata';
import test from 'ava';
import { findAssociatedTokenPda } from '@solana-program/token';
import { getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';
import {
  findFeeVaultPda,
  findListStatePda,
  getBuyLegacySplInstructionAsync,
  getListLegacyInstructionAsync,
} from '../../src';
test('it can buy an NFT paying using a SPL token', async (t) => {
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
  const currency = await createTestMint({
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

  // Create an NFT.
  const { mint } = await createDefaultNft(
    client,
    payer,
    updateAuthority,
    owner
  );

  // List the NFT.
  const listLegacyIx = await getListLegacyInstructionAsync({
    payer,
    owner,
    mint,
    currency: currency.mint,
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
    mint: currency.mint,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  const updateAuthorityCurrencyTa = await createAta(
    client,
    payer,
    currency.mint,
    updateAuthority.address
  );

  const feeVaultCurrencyTa = await createAta(
    client,
    payer,
    currency.mint,
    feeVault
  );
  const ownerCurrencyTa = await createAta(
    client,
    payer,
    currency.mint,
    owner.address
  );

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
    currency: currency.mint,
    creators: [updateAuthority.address],
    creatorsTa: [updateAuthorityCurrencyTa],
  });

  const computeIx = getSetComputeUnitLimitInstruction({
    units: 400_000,
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
  const currency = await createTestMint({
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

  // Create an NFT.
  const { mint } = await createDefaultNft(
    client,
    payer,
    updateAuthority,
    owner,
    creators
  );

  // List the NFT.
  const listLegacyIx = await getListLegacyInstructionAsync({
    payer,
    owner,
    mint,
    currency: currency.mint,
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
    mint: currency.mint,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  const creatorsAtas = [];
  for (const creator of creators) {
    creatorsAtas.push(
      await createAta(client, payer, currency.mint, creator.address)
    );
  }

  const feeVaultCurrencyTa = await createAta(
    client,
    payer,
    currency.mint,
    feeVault
  );
  const ownerCurrencyTa = await createAta(
    client,
    payer,
    currency.mint,
    owner.address
  );

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
    currency: currency.mint,
    creators: creators.map((c) => c.address),
    creatorsTa: creatorsAtas,
  });

  const computeIx = getSetComputeUnitLimitInstruction({
    units: 400_000,
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
