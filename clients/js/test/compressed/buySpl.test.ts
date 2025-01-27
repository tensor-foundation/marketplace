import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN_PROGRAM_ID,
  createAndMintTo,
  LAMPORTS_PER_SOL,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  address,
  appendTransactionMessageInstruction,
  assertAccountExists,
  fetchEncodedAccount,
  getU16Encoder,
  pipe,
} from '@solana/web3.js';
import { findAssociatedTokenPda } from '@solana-program/token';
import {
  findFeeVaultPda,
  findListStatePda,
  getBuySplCompressedInstructionAsync,
  getListCompressedInstruction,
} from '../../src';
import {
  computeCreatorHash,
  computeDataHash,
  computeMetadataArgsHash,
  Creator,
  findTreeAuthorityPda,
  setupSingleVerifiedCNFT,
} from '@tensor-foundation/mpl-bubblegum';
import { COMPUTE_500K_IX } from '../_common';

test('it can buy a listed compressed nft using a SPL token as currency', async (t) => {
  const client = createDefaultSolanaClient();
  // Original asset owner.
  const owner = await generateKeyPairSignerWithSol(client);
  // Asset buyer.
  const buyer = await generateKeyPairSignerWithSol(client);
  const makerBroker = await generateKeyPairSignerWithSol(client);
  const takerBroker = await generateKeyPairSignerWithSol(client);

  const creatorKeypair = await generateKeyPairSignerWithSol(
    client,
    2n * LAMPORTS_PER_SOL
  );
  const creator = {
    address: creatorKeypair.address,
    verified: false,
    share: 100,
  } as Creator;

  const index = 0;

  const { merkleTree, root, proof, assetId, meta } =
    await setupSingleVerifiedCNFT({
      client,
      cNftOwner: owner.address,
      leafIndex: index,
      creatorKeypair,
      creator,
    });

  const [listState] = await findListStatePda({ mint: assetId });

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
    payer: buyer,
    recipient: buyer.address,
    decimals: 0,
    initialSupply: 1_000_000_000n,
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

  const [feeVault] = await findFeeVaultPda({ address: listState });

  const [creatorCurrencyTa] = await findAssociatedTokenPda({
    owner: creator.address,
    mint: currency.mint,
    tokenProgram: TOKEN_PROGRAM_ID,
  });

  const [treeAuthority] = await findTreeAuthorityPda({ merkleTree });

  const dataHash = computeDataHash(
    meta,
    new Uint8Array(getU16Encoder().encode(meta.sellerFeeBasisPoints))
  );
  const creatorHash = computeCreatorHash(meta.creators);

  // List asset.
  const listIx = getListCompressedInstruction({
    owner: owner,
    merkleTree: address(merkleTree),
    treeAuthority,
    listState: listState,
    index,
    root: root,
    dataHash: dataHash,
    creatorHash: creatorHash,
    amount: price,
    proof,
    currency: currency.mint,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should exist.
  assertAccountExists(await fetchEncodedAccount(client.rpc, listState));
  const metaHash = computeMetadataArgsHash(meta);
  const buyIx = await getBuySplCompressedInstructionAsync({
    listState,
    feeVault,
    merkleTree,
    treeAuthority,
    payer: buyer,
    buyer: buyer.address,
    rentDestination: owner.address,
    owner: owner.address,
    maxAmount: maxPrice,
    currency: currency.mint,
    root,
    index,
    creatorShares: new Uint8Array(
      meta.creators.map((creator) => creator.share)
    ),
    creatorVerified: meta.creators.map((creator) => creator.verified),
    metaHash,
    sellerFeeBasisPoints: meta.sellerFeeBasisPoints,
    creators: meta.creators.map((creator) => creator.address),
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should be closed.
  t.false((await fetchEncodedAccount(client.rpc, listState)).exists);

  // Creator should have received royalties in currency TA
  const creatorTaBalance = (
    await client.rpc.getTokenAccountBalance(creatorCurrencyTa).send()
  ).value.uiAmount;
  t.is(creatorTaBalance, Number(royalties));
});

test('it can buy a listed compressed nft using a T22 token as currency', async (t) => {
  const client = createDefaultSolanaClient();
  // Original asset owner.
  const owner = await generateKeyPairSignerWithSol(client);
  // Asset buyer.
  const buyer = await generateKeyPairSignerWithSol(client);

  const creatorKeypair = await generateKeyPairSignerWithSol(
    client,
    2n * LAMPORTS_PER_SOL
  );
  const creator = {
    address: creatorKeypair.address,
    verified: false,
    share: 100,
  } as Creator;

  const index = 0;

  const { merkleTree, root, proof, assetId, meta } =
    await setupSingleVerifiedCNFT({
      client,
      cNftOwner: owner.address,
      leafIndex: index,
      creatorKeypair,
      creator,
    });

  const [listState] = await findListStatePda({ mint: assetId });

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
    payer: buyer,
    tokenProgram: TOKEN22_PROGRAM_ID,
    recipient: buyer.address,
    decimals: 0,
    initialSupply,
  });
  // Buyer receives the SPL token.
  const [buyerAta] = await findAssociatedTokenPda({
    owner: buyer.address,
    mint: currency.mint,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });
  const buyerAtaBalance = (
    await client.rpc.getTokenAccountBalance(buyerAta).send()
  ).value.uiAmount;
  t.is(buyerAtaBalance, Number(initialSupply));

  const [feeVault] = await findFeeVaultPda({ address: listState });

  const [creatorCurrencyTa] = await findAssociatedTokenPda({
    owner: creator.address,
    mint: currency.mint,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const [treeAuthority] = await findTreeAuthorityPda({ merkleTree });

  const dataHash = computeDataHash(
    meta,
    new Uint8Array(getU16Encoder().encode(meta.sellerFeeBasisPoints))
  );
  const creatorHash = computeCreatorHash(meta.creators);

  // List asset.
  const listIx = getListCompressedInstruction({
    owner: owner,
    merkleTree: address(merkleTree),
    treeAuthority,
    listState: listState,
    index,
    root: root,
    dataHash: dataHash,
    creatorHash: creatorHash,
    amount: price,
    proof,
    currency: currency.mint,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should exist.
  assertAccountExists(await fetchEncodedAccount(client.rpc, listState));
  const metaHash = computeMetadataArgsHash(meta);
  const buyIx = await getBuySplCompressedInstructionAsync({
    listState,
    feeVault,
    merkleTree,
    treeAuthority,
    payer: buyer,
    buyer: buyer.address,
    rentDestination: owner.address,
    owner: owner.address,
    maxAmount: maxPrice,
    currency: currency.mint,
    root,
    index,
    creatorShares: new Uint8Array(
      meta.creators.map((creator) => creator.share)
    ),
    creatorVerified: meta.creators.map((creator) => creator.verified),
    metaHash,
    sellerFeeBasisPoints: meta.sellerFeeBasisPoints,
    currencyTokenProgram: TOKEN22_PROGRAM_ID,
    creators: meta.creators.map((creator) => creator.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // List state should be closed.
  t.false((await fetchEncodedAccount(client.rpc, listState)).exists);

  // Creator should have received royalties in currency TA
  const creatorTaBalance = (
    await client.rpc.getTokenAccountBalance(creatorCurrencyTa).send()
  ).value.uiAmount;
  t.is(creatorTaBalance, Number(royalties));
});
