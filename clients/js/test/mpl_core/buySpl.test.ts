import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN_PROGRAM_ID,
  createAta,
  createAndMintTo,
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
  getListCoreInstruction,
} from '../../src';

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
  const asset = await createDefaultAsset(
    client,
    payer,
    updateAuthority.address,
    owner.address,
    true // withRoyalties
  );

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
    creatorsAtas: [updateAuthorityCurrencyAta],
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
