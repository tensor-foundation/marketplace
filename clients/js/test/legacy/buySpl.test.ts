import { getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';
import {
  appendTransactionMessageInstruction,
  assertAccountDecoded,
  assertAccountExists,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import { TokenStandard } from '@tensor-foundation/resolvers';
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
  createDefaultpNft,
  findAtaPda,
} from '@tensor-foundation/mpl-token-metadata';
import test from 'ava';
import { findAssociatedTokenPda } from '@solana-program/token';
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

  const [updateAuthorityCurrencyTa] = await findAssociatedTokenPda({
    owner: updateAuthority.address,
    mint: currency.mint,
    tokenProgram: TOKEN_PROGRAM_ID,
  });
  const [buyerCurrencyTa] = await findAssociatedTokenPda({
    owner: buyer.address,
    mint: currency.mint,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  // Create t
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
    maxAmount: 1,
    currency: currency.mint,
    // creators: [updateAuthority.address],
    // creatorsTa: [updateAuthorityCurrencyTa],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyLegacySplIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // // List state should be closed.
  // t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // // Buyer is the new owner.
  // t.like(await fetchJsonParsedAccount(client.rpc, buyerAta), <TokenAccount>(<unknown>{
  //   tokenAmount: { amount: '1' },
  // }));

  // // Update authority should have received royalties as the creator on the royalty plugin.
  // const updateAuthorityBalance = (
  //   await client.rpc.getTokenAccountBalance(updateAuthorityCurrencyAta).send()
  // ).value.uiAmount;
  // t.is(updateAuthorityBalance, Number(royalties));
});
