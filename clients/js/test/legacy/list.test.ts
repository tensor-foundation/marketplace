import { fetchMint, getMintToInstruction } from '@solana-program/token';
import {
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  pipe,
  some,
} from '@solana/web3.js';
import { createDefaultNft } from '@tensor-foundation/mpl-token-metadata';
import { TokenStandard } from '@tensor-foundation/resolvers';
import {
  createAndMintTo,
  createDefaultSolanaClient,
  createDefaultTransaction,
  expectCustomError,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  fetchListStateFromSeeds,
  getListLegacyInstructionAsync,
  TENSOR_MARKETPLACE_ERROR__INVALID_MINT,
} from '../../src/index.js';
import { getTestSigners } from '../_common.js';
import { computeIx, mintFungibleAsset } from './_common.js';

test('it can list an NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner: owner.address,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
  });

  // When we list the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then we should be able to fetch the listing.
  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: mint,
      cosigner: null,
    },
  });
});

test('it can list a Programmable NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an pNFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner: owner.address,
    standard: TokenStandard.ProgrammableNonFungible,
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
  });

  // When we list the pNFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then we should be able to fetch the listing.
  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: mint,
      cosigner: null,
    },
  });
});

test('it can list an NFT with a cosigner', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner: owner.address,
  });

  const cosigner = await generateKeyPairSigner();
  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    cosigner,
  });

  // When we list the NFT with a cosigner.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then we should be able to fetch the listing.
  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: mint,
      cosigner: cosigner.address,
    },
  });
});

test('it can list a Programmable NFT with a cosigner', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an pNFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner: owner.address,
    standard: TokenStandard.ProgrammableNonFungible,
  });

  const cosigner = await generateKeyPairSigner();
  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    cosigner,
  });

  // When we list the pNFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then we should be able to fetch the listing.
  const listing = await fetchListStateFromSeeds(client.rpc, {
    mint,
  });
  t.like(listing, {
    data: {
      owner: owner.address,
      amount: 1n,
      assetId: mint,
      cosigner: cosigner.address,
    },
  });
});

test('it can list with an SPL token as currency', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSigner();
  const initialSupply = 1000000n;

  const [{ mint: currency }] = await createAndMintTo({
    client,
    mintAuthority,
    payer: owner,
    recipient: owner.address,
    decimals: 0,
    initialSupply,
  });

  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: mintAuthority,
    owner: owner.address,
  });

  // If we list the NFT...
  const listLegacyIx = await getListLegacyInstructionAsync({
    payer: owner,
    owner,
    mint,
    currency: currency,
    amount: 100n,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... the list state should exist with the correct currency
  const listing = await fetchListStateFromSeeds(client.rpc, { mint });
  t.like(listing, {
    data: {
      currency: some(currency),
    },
  });
});

test('listing Fungible Assets with decimals > 0 fail', async (t) => {
  const client = createDefaultSolanaClient();
  const signers = await getTestSigners(client);

  const { payer, buyer, nftOwner, nftUpdateAuthority } = signers;

  const standard = TokenStandard.FungibleAsset;

  const { mint, masterEdition } = await mintFungibleAsset({
    client,
    payer,
    nftOwner: nftOwner.address,
    nftUpdateAuthority,
    decimals: 6, // this will cause it to fail
  });

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner: nftOwner,
    mint,
    amount: 1,
    tokenStandard: standard,
    edition: masterEdition,
  });

  const promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_MARKETPLACE_ERROR__INVALID_MINT);
});

test.only('Fungible Assets with supply > 0 fail', async (t) => {
  const client = createDefaultSolanaClient();
  const signers = await getTestSigners(client);

  const { payer, buyer, nftOwner, nftUpdateAuthority } = signers;

  const standard = TokenStandard.FungibleAsset;

  const {
    mint,
    masterEdition: edition,
    token,
  } = await mintFungibleAsset({
    client,
    payer,
    nftOwner: nftOwner.address,
    nftUpdateAuthority,
  });

  let mintAccount = await fetchMint(client.rpc, mint);
  let mintAmount = mintAccount.data.supply;

  t.assert(mintAmount == 1n);

  // Mint more supply
  const mintToIx = getMintToInstruction({
    mint,
    token,
    mintAuthority: nftUpdateAuthority.address,
    amount: 1n,
  });

  await pipe(
    await createDefaultTransaction(client, nftUpdateAuthority),
    (tx) => appendTransactionMessageInstruction(mintToIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  mintAccount = await fetchMint(client.rpc, mint);
  mintAmount = mintAccount.data.supply;

  t.assert(mintAmount == 2n);

  const listLegacyIx = await getListLegacyInstructionAsync({
    owner: nftOwner,
    mint,
    amount: 1,
    tokenStandard: standard,
    edition,
  });

  const promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_MARKETPLACE_ERROR__INVALID_MINT);
});
