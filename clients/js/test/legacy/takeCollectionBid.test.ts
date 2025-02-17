import {
  appendTransactionMessageInstruction,
  assertAccountDecoded,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
  generateKeyPairSigner,
  getAddressDecoder,
  pipe,
  SOLANA_ERROR__INSTRUCTION_ERROR__NOT_ENOUGH_ACCOUNT_KEYS,
} from '@solana/web3.js';
import {
  findMarginAccountPda,
  getDepositMarginAccountInstructionAsync,
  getInitMarginAccountInstructionAsync,
} from '@tensor-foundation/escrow';
import {
  createDefaultNft,
  createDefaultNftInCollection,
  findAtaPda,
  printSupply,
  TokenStandard,
} from '@tensor-foundation/mpl-token-metadata';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  LAMPORTS_PER_SOL,
  signAndSendTransaction,
  TENSOR_ERROR__CREATOR_MISMATCH,
  TENSOR_ERROR__INSUFFICIENT_BALANCE,
  TSWAP_SINGLETON,
} from '@tensor-foundation/test-helpers';
import {
  findMintProofV2Pda,
  getInitUpdateMintProofV2InstructionAsync,
  getUpdateWhitelistV2Instruction,
  intoAddress,
  Mode,
  operation,
  TENSOR_WHITELIST_ERROR__BAD_MINT_PROOF,
  TENSOR_WHITELIST_ERROR__FAILED_FVC_VERIFICATION,
  TENSOR_WHITELIST_ERROR__FAILED_MERKLE_PROOF_VERIFICATION,
  TENSOR_WHITELIST_ERROR__FAILED_VOC_VERIFICATION,
} from '@tensor-foundation/whitelist';
import test from 'ava';
import {
  fetchBidStateFromSeeds,
  fetchMaybeBidStateFromSeeds,
  Field,
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidLegacyInstructionAsync,
  Target,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__BID_EXPIRED,
  TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID,
} from '../../src/index.js';
import {
  BASIS_POINTS,
  BROKER_FEE_PCT,
  createWhitelistV2,
  expectCustomError,
  expectGenericError,
  initTswap,
  MAKER_BROKER_FEE_PCT,
  sleep,
  TAKER_BROKER_FEE_PCT,
  TAKER_FEE_BPS,
} from '../_common.js';
import { generateTreeOfSize } from '../_merkle.js';
import { computeIx } from './_common.js';

test('it can take a bid on a legacy collection', async (t) => {
  const client = createDefaultSolanaClient();
  const bidOwner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creatorKeypair = await generateKeyPairSignerWithSol(client);

  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority: creatorKeypair,
    owner: seller.address,
  });

  // Create whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.FVC, value: creatorKeypair.address }],
  });

  const price = 500_000_000n;

  // Create collection bid
  const bidId = (await generateKeyPairSigner()).address;
  const bidIx = await getBidInstructionAsync({
    owner: bidOwner,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId: bidId,
  });
  await pipe(
    await createDefaultTransaction(client, bidOwner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [bidState] = await findBidStatePda({
    owner: bidOwner.address,
    bidId,
  });
  const preSellerBalance = (await client.rpc.getBalance(seller.address).send())
    .value;

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidOwner.address,
    seller,
    whitelist,
    mint,
    minAmount: price,
    bidState,
    creators: [creatorKeypair.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findBidStatePda({ owner: bidOwner.address, bidId }))[0]
      )
    ).exists
  );

  // And the owner has the NFT.
  const ownerToken = await fetchJsonParsedAccount(
    client.rpc,
    (await findAtaPda({ mint, owner: bidOwner.address }))[0]
  );
  assertAccountDecoded(ownerToken);

  t.like(ownerToken, {
    data: {
      tokenAmount: { amount: '1' },
    },
  });

  // And the seller received the price minus fees (taker fees, tx fees, account rent)
  const postSellerBalance = (await client.rpc.getBalance(seller.address).send())
    .value;
  // tx fees + account rent buffer === 3.5m lamports
  t.assert(
    postSellerBalance >=
      preSellerBalance + BigInt(Number(price) * 0.98) - 3_500_000n
  );
});

test('it cannot take a bid on a legacy collection w/ incorrect mint', async (t) => {
  const client = createDefaultSolanaClient();
  const bidOwner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creatorKeypair = await generateKeyPairSignerWithSol(client);
  const notCreator = await generateKeyPairSignerWithSol(client);

  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority: notCreator,
    owner: seller.address,
  });

  // Create whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.FVC, value: creatorKeypair.address }],
  });

  const price = 500_000_000n;

  // Create collection bid
  const bidId = (await generateKeyPairSigner()).address;
  const bidIx = await getBidInstructionAsync({
    owner: bidOwner,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId: bidId,
  });
  await pipe(
    await createDefaultTransaction(client, bidOwner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [bidState] = await findBidStatePda({
    owner: bidOwner.address,
    bidId,
  });

  // When the seller tries to take the bid
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidOwner.address,
    seller,
    whitelist,
    mint,
    minAmount: price,
    bidState,
    creators: [creatorKeypair.address],
  });

  const promiseIncorrectWhitelist = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const FAILED_FVC_VERIFICATION_ERROR_CODE = 6007;

  // Then a custom error gets thrown
  await expectCustomError(
    t,
    promiseIncorrectWhitelist,
    FAILED_FVC_VERIFICATION_ERROR_CODE
  );
});

test('it cannot take a bid on a legacy collection w/o correct cosigner', async (t) => {
  const client = createDefaultSolanaClient();
  const bidOwner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const cosigner = await generateKeyPairSignerWithSol(client);
  const notCosigner = await generateKeyPairSignerWithSol(client);
  const creatorKeypair = await generateKeyPairSignerWithSol(client);

  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority: creatorKeypair,
    owner: seller.address,
  });

  // Create whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.FVC, value: creatorKeypair.address }],
  });

  const price = 500_000_000n;

  // Create collection bid w/ cosigner
  const bidId = (await generateKeyPairSigner()).address;
  const bidIx = await getBidInstructionAsync({
    owner: bidOwner,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId: bidId,
    cosigner: cosigner,
  });
  await pipe(
    await createDefaultTransaction(client, bidOwner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [bidState] = await findBidStatePda({
    owner: bidOwner.address,
    bidId,
  });

  // When the seller tries to take the bid without specifying the cosigner
  const takeBidIxWithoutCosigner = await getTakeBidLegacyInstructionAsync({
    owner: bidOwner.address,
    seller,
    whitelist,
    mint,
    minAmount: price,
    bidState,
    creators: [creatorKeypair.address],
  });

  const promiseNoCosigner = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIxWithoutCosigner, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then a custom error gets thrown
  await expectCustomError(
    t,
    promiseNoCosigner,
    TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER
  );

  // When the seller tries to take the bid with specifying an incorrect cosigner
  const takeBidIxIncorrectCosigner = await getTakeBidLegacyInstructionAsync({
    owner: bidOwner.address,
    seller,
    whitelist,
    mint,
    minAmount: price,
    bidState,
    cosigner: notCosigner,
    creators: [creatorKeypair.address],
  });

  const promiseIncorrectCosigner = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIxIncorrectCosigner, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then a custom error gets thrown
  await expectCustomError(
    t,
    promiseIncorrectCosigner,
    TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER
  );
});

test('it automatically closes the bid state account if filledQuantity === quantity', async (t) => {
  const client = createDefaultSolanaClient();
  const bidOwner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creatorKeypair = await generateKeyPairSignerWithSol(client);

  // Mint NFT 1
  const { mint: mint1 } = await createDefaultNft({
    client,
    payer: seller,
    authority: creatorKeypair,
    owner: seller.address,
  });

  // Mint NFT 2
  const { mint: mint2 } = await createDefaultNft({
    client,
    payer: seller,
    authority: creatorKeypair,
    owner: seller.address,
  });

  // Create whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.FVC, value: creatorKeypair.address }],
  });

  // Create collection bid
  const bidId = (await generateKeyPairSigner()).address;
  const bidIx = await getBidInstructionAsync({
    owner: bidOwner,
    amount: 1n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
    quantity: 2,
  });
  await pipe(
    await createDefaultTransaction(client, bidOwner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state account should exist
  const bidState = await fetchBidStateFromSeeds(client.rpc, {
    owner: bidOwner.address,
    bidId,
  });
  t.is(bidState.data.filledQuantity, 0);

  // When the seller takes the bid once ....
  const takeBidIx1 = await getTakeBidLegacyInstructionAsync({
    owner: bidOwner.address,
    seller,
    whitelist,
    mint: mint1,
    minAmount: 1n,
    bidState: bidState.address,
    creators: [creatorKeypair.address],
  });
  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx1, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // The bid state still exists and its filledQuantity is updated
  const bidState2 = await fetchBidStateFromSeeds(client.rpc, {
    owner: bidOwner.address,
    bidId,
  });
  t.is(bidState2.data.filledQuantity, 1);

  // When the seller takes the bid again ....
  const takeBidIx2 = await getTakeBidLegacyInstructionAsync({
    owner: bidOwner.address,
    seller,
    whitelist,
    mint: mint2,
    minAmount: 1n,
    bidState: bidState2.address,
    creators: [creatorKeypair.address],
  });
  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // The bid state no longer exists
  const bidState3 = await fetchMaybeBidStateFromSeeds(client.rpc, {
    owner: bidOwner.address,
    bidId,
  });
  t.false(bidState3.exists);
});

test('it pays fees and royalties correctly', async (t) => {
  const ROYALTIES_BASIS_POINTS = 500n;
  const client = createDefaultSolanaClient();
  const bidOwner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creatorKeypair1 = await generateKeyPairSignerWithSol(client);
  const creatorKeypair2 = await generateKeyPairSignerWithSol(client);
  const makerBroker = await generateKeyPairSigner();
  const takerBroker = await generateKeyPairSigner();

  // Mint pNFT
  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority: creatorKeypair1,
    owner: seller.address,
    standard: TokenStandard.ProgrammableNonFungible,
    creators: [
      { address: creatorKeypair1.address, verified: true, share: 70 },
      { address: creatorKeypair2.address, verified: false, share: 30 },
    ],
  });

  // Create whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair1,
    conditions: [{ mode: Mode.FVC, value: creatorKeypair1.address }],
  });

  // Create collection bid with maker broker specified
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidOwner.address,
    bidId,
  });
  const bidAmount = LAMPORTS_PER_SOL / 2n;
  const bidIx = await getBidInstructionAsync({
    owner: bidOwner,
    amount: bidAmount,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, bidOwner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const creator1BalanceBefore = await client.rpc
    .getBalance(creatorKeypair1.address)
    .send();
  const creator2BalanceBefore = await client.rpc
    .getBalance(creatorKeypair2.address)
    .send();
  const makerBrokerBalanceBefore = await client.rpc
    .getBalance(makerBroker.address)
    .send();
  const takerBrokerBalanceBefore = await client.rpc
    .getBalance(takerBroker.address)
    .send();
  const sellerBalanceBefore = await client.rpc
    .getBalance(seller.address)
    .send();

  // When the seller takes the bid...
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidOwner.address,
    seller,
    whitelist,
    mint,
    minAmount: bidAmount,
    bidState: bidState,
    creators: [creatorKeypair1.address, creatorKeypair2.address],
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
  });

  const tx = await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  const txCost = (
    await client.rpc
      .getTransaction(tx, { maxSupportedTransactionVersion: 0 })
      .send()
  )?.meta?.fee;
  const tokenAta = (await findAtaPda({ mint, owner: bidOwner.address }))[0];
  const tokenAtaRent = await client.rpc.getBalance(tokenAta).send();

  // Then the seller received the correct amount...
  const sellerBalanceAfter = await client.rpc.getBalance(seller.address).send();
  t.assert(
    BigInt(sellerBalanceAfter.value) ===
      sellerBalanceBefore.value +
        bidAmount -
        (bidAmount * TAKER_FEE_BPS) / BASIS_POINTS - // 2% taker fees
        (bidAmount * BigInt(ROYALTIES_BASIS_POINTS)) / BASIS_POINTS - //  5% royalties
        txCost! - // tx costs
        tokenAtaRent.value // mint ata rent
  );

  // ...and the creators should have received the correct amount...
  const creator1BalanceAfter = await client.rpc
    .getBalance(creatorKeypair1.address)
    .send();
  const creator2BalanceAfter = await client.rpc
    .getBalance(creatorKeypair2.address)
    .send();
  t.assert(
    BigInt(creator1BalanceAfter.value) ===
      creator1BalanceBefore.value +
        (((bidAmount * ROYALTIES_BASIS_POINTS) / BASIS_POINTS) * 70n) / 100n // 70% of 5%
  );
  t.assert(
    BigInt(creator2BalanceAfter.value) ===
      creator2BalanceBefore.value +
        (((bidAmount * ROYALTIES_BASIS_POINTS) / BASIS_POINTS) * 30n) / 100n // 30% of 5%
  );

  // ...and the brokers should have received the correct amount
  const makerBrokerBalanceAfter = await client.rpc
    .getBalance(makerBroker.address)
    .send();
  const takerBrokerBalanceAfter = await client.rpc
    .getBalance(takerBroker.address)
    .send();
  t.assert(
    BigInt(makerBrokerBalanceAfter.value) ===
      makerBrokerBalanceBefore.value +
        (((((bidAmount * TAKER_FEE_BPS) / BASIS_POINTS) * BROKER_FEE_PCT) /
          100n) *
          MAKER_BROKER_FEE_PCT) /
          100n // 80% (maker split) of 50% (broker pct) of 2% (taker fee)
  );
  t.assert(
    BigInt(takerBrokerBalanceAfter.value) ===
      takerBrokerBalanceBefore.value +
        (((((bidAmount * TAKER_FEE_BPS) / BASIS_POINTS) * BROKER_FEE_PCT) /
          100n) *
          TAKER_BROKER_FEE_PCT) /
          100n // 20% (maker split) of 50% (broker pct) of 2% (taker fee)
  );
});

test('it uses escrow funds when the bid is taken', async (t) => {
  const client = createDefaultSolanaClient();
  const bidOwner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creatorKeypair = await generateKeyPairSignerWithSol(client);
  const bidAmount = LAMPORTS_PER_SOL / 2n;
  await initTswap(client);

  // Create escrow
  const marginAccount = (
    await findMarginAccountPda({
      owner: bidOwner.address,
      tswap: TSWAP_SINGLETON,
      marginNr: 0,
    })
  )[0];
  const escrowIx = await getInitMarginAccountInstructionAsync({
    owner: bidOwner,
    marginAccount,
  });

  await pipe(
    await createDefaultTransaction(client, bidOwner),
    (tx) => appendTransactionMessageInstruction(escrowIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Deposit SOL to escrow
  const depositIx = await getDepositMarginAccountInstructionAsync({
    owner: bidOwner,
    marginAccount,
    lamports: bidAmount,
  });

  await pipe(
    await createDefaultTransaction(client, bidOwner),
    (tx) => appendTransactionMessageInstruction(depositIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Create Whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.FVC, value: creatorKeypair.address }],
  });

  // Create NFT
  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority: creatorKeypair,
    owner: seller.address,
  });

  // Create Collection Bid attached to escrow
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidOwner.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidOwner,
    amount: bidAmount,
    target: Target.Whitelist,
    targetId: whitelist,
    sharedEscrow: marginAccount,
    quantity: 2, // we set quantity to 2 to not have to deal with getting account rent back because the account auto-closes
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidOwner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const bidOwnerBalanceBefore = await client.rpc
    .getBalance(bidOwner.address)
    .send();
  const sharedEscrowBalanceBefore = await client.rpc
    .getBalance(marginAccount)
    .send();

  // When the seller takes the bid...
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidOwner.address,
    seller,
    whitelist,
    mint,
    minAmount: bidAmount,
    sharedEscrow: marginAccount,
    bidState,
    creators: [creatorKeypair.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const bidOwnerBalanceAfter = await client.rpc
    .getBalance(bidOwner.address)
    .send();
  const sharedEscrowBalanceAfter = await client.rpc
    .getBalance(marginAccount)
    .send();

  // Then the bid owner has had no change in balance...
  t.assert(bidOwnerBalanceAfter.value === bidOwnerBalanceBefore.value);
  // ...and the shared escrow has paid out the bid amount
  t.assert(
    sharedEscrowBalanceAfter.value ===
      sharedEscrowBalanceBefore.value - bidAmount
  );
});

test('mint has to match the whitelist - VOC', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const { collection: collectionMint, item: mint } =
    await createDefaultNftInCollection({
      client,
      payer: seller,
      owner: seller.address,
      authority: updateAuthority,
      creators: [{ address: creator.address, verified: false, share: 100 }],
    });

  const { item: wrongMint } = await createDefaultNftInCollection({
    client,
    payer: seller,
    owner: seller.address,
    authority: updateAuthority,
    creators: [{ address: creator.address, verified: false, share: 100 }],
  });

  const { mint: mintUnverified } = await createDefaultNft({
    client,
    payer: seller,
    owner: seller.address,
    authority: updateAuthority,
    collectionMint: collectionMint.mint,
  });

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority,
    conditions: [{ mode: Mode.VOC, value: collectionMint.mint }],
  });

  // Create a collection bid
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid with a mint of a different collection...
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: wrongMint.mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...it should fail with the correct error
  await expectCustomError(
    t,
    tx,
    TENSOR_WHITELIST_ERROR__FAILED_VOC_VERIFICATION
  );

  // When the seller takes the bid with the unverified mint pointing to the correct collection mint...
  const takeBidIx2 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mintUnverified,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ... it fails with the correct error
  await expectCustomError(
    t,
    tx2,
    TENSOR_WHITELIST_ERROR__FAILED_VOC_VERIFICATION
  );

  // When the seller takes the bid with the correct mint...
  const takeBidIx3 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mint.mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid state should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('mint has to match the whitelist - FVC', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const { mint: mintInCollection } = await createDefaultNft({
    client,
    payer: seller,
    owner: seller.address,
    authority: creator,
    creators: [{ address: creator.address, verified: true, share: 100 }],
  });

  const { mint: mintNotInCollection } = await createDefaultNft({
    client,
    payer: seller,
    owner: seller.address,
    authority: creator,
    // verified set to false (!)
    creators: [{ address: creator.address, verified: false, share: 100 }],
  });

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creator,
    conditions: [{ mode: Mode.FVC, value: creator.address }],
  });

  // Create a collection bid
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid with the mint with first creator unverified...
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mintNotInCollection,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail with the correct error
  await expectCustomError(
    t,
    tx,
    TENSOR_WHITELIST_ERROR__FAILED_FVC_VERIFICATION
  );

  // When the seller takes the bid with the mint with first creator verified...
  const takeBidIx2 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mintInCollection,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid state should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('mint has to match the whitelist - rootHash', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const mintInTree = await createDefaultNft({
    client,
    payer: seller,
    owner: seller.address,
    authority: creator,
  });

  const mintNotInTree = await createDefaultNft({
    client,
    payer: seller,
    owner: seller.address,
    authority: creator,
  });

  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(1, [mintInTree.mint]);
  const proof = p;
  const conditions = [{ mode: Mode.MerkleTree, value: intoAddress(root) }];

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creator,
    conditions,
  });

  // Create a collection bid
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Upsert mint proof for the mint in the tree...
  const [mintProofPdaInTree] = await findMintProofV2Pda({
    mint: mintInTree.mint,
    whitelist,
  });

  const createMintProofIxInTree =
    await getInitUpdateMintProofV2InstructionAsync({
      payer: seller,
      mint: mintInTree.mint,
      mintProof: mintProofPdaInTree,
      whitelist,
      proof: proof.proof,
    });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(createMintProofIxInTree, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid with the mint not in the tree...
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mintNotInTree.mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail with the correct error
  await expectCustomError(
    t,
    tx,
    TENSOR_WHITELIST_ERROR__FAILED_MERKLE_PROOF_VERIFICATION
  );

  // This also fails when passing a real mintProof account (from a different mint)
  const takeBidIx2 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mintNotInTree.mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
    mintProof: mintProofPdaInTree,
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  await expectCustomError(t, tx2, TENSOR_WHITELIST_ERROR__BAD_MINT_PROOF);

  // When the seller takes the bid with the mint in the tree (and thus whitelist)...
  const takeBidIxInTree = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mintInTree.mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
    mintProof: mintProofPdaInTree,
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIxInTree, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid state should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('it has to specify creators', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);
  const notCreator = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    owner: seller.address,
    authority: creator,
  });

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creator,
    conditions: [{ mode: Mode.FVC, value: creator.address }],
  });

  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });

  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid without specifying creators...
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail with a generic error
  await expectGenericError(
    t,
    tx,
    SOLANA_ERROR__INSTRUCTION_ERROR__NOT_ENOUGH_ACCOUNT_KEYS
  );

  // When the seller takes the bid with an incorrect creator...
  const takeBidIx2 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [notCreator.address],
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail
  await expectCustomError(t, tx2, TENSOR_ERROR__CREATOR_MISMATCH);

  // When the seller takes the bid with the correct creator...
  const takeBidIx3 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid state should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('it has to match the name field if set', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);

  const correctName = 'Test';
  const incorrectName = 'test';

  const data = {
    name: correctName,
    symbol: 'EXNFT',
    uri: 'https://example.com/nft',
    sellerFeeBasisPoints: 500,
    creators: [
      {
        address: authority.address,
        verified: true,
        share: 100,
      },
    ],
    printSupply: printSupply('Zero'),
    tokenStandard: TokenStandard.NonFungible,
    collection: undefined,
    ruleSet: undefined,
  };

  const incorrectData = {
    ...data,
    name: incorrectName,
  };
  const { mint: correctMint } = await createDefaultNft({
    client,
    payer: seller,
    authority: authority,
    owner: seller.address,
    data,
  });

  const { mint: incorrectMint } = await createDefaultNft({
    client,
    payer: seller,
    authority: authority,
    owner: seller.address,
    data: incorrectData,
  });

  // Create Whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: authority,
    conditions: [{ mode: Mode.FVC, value: authority.address }],
  });

  // Create Bid
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    // (!)
    field: Field.Name,
    fieldId: getAddressDecoder().decode(
      new TextEncoder()
        .encode(correctName)
        .slice(0, 32)
        .reduce((arr, byte, i) => {
          arr[i] = byte;
          return arr;
        }, new Uint8Array(32))
    ),
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid with the incorrect mint...
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: incorrectMint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [authority.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID);

  // When the seller takes the bid with the correct mint...
  const takeBidIx2 = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: correctMint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [authority.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid state should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('it cannot take an expired bid', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority,
    owner: seller.address,
  });

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: authority,
    conditions: [{ mode: Mode.FVC, value: authority.address }],
  });

  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });

  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
    expireInSec: 1n,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Sleep for 5 seconds to let the bid expire
  await sleep(5000);

  // When the seller tries to take the bid...
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [authority.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BID_EXPIRED);
});

test('it cannot take a bid when the escrow balance is insufficient', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);
  const price = LAMPORTS_PER_SOL / 4n;
  await initTswap(client);

  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority,
    owner: seller.address,
  });

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: authority,
    conditions: [{ mode: Mode.FVC, value: authority.address }],
  });

  // Create Escrow
  const marginAccount = (
    await findMarginAccountPda({
      owner: bidder.address,
      tswap: TSWAP_SINGLETON,
      marginNr: 0,
    })
  )[0];
  const escrowIx = await getInitMarginAccountInstructionAsync({
    owner: bidder,
    marginAccount,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(escrowIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Deposit SOL to escrow
  const depositIx = await getDepositMarginAccountInstructionAsync({
    owner: bidder,
    marginAccount,
    // (!) bidder deposits 1 lamports less than the bid amount
    lamports: price - 1n,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(depositIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Create Bid
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
    //(!)
    sharedEscrow: marginAccount,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller tries to take the bid...
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    minAmount: price,
    bidState,
    //(!)
    sharedEscrow: marginAccount,
    creators: [authority.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail
  await expectCustomError(t, tx, TENSOR_ERROR__INSUFFICIENT_BALANCE);
});

test('it enforces pNFT royalties', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);

  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority,
    owner: seller.address,
    standard: TokenStandard.ProgrammableNonFungible,
  });

  // Create Whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: authority,
    conditions: [{ mode: Mode.FVC, value: authority.address }],
  });

  // Create Bid
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const creatorRoyaltyReceiverBalanceBefore = (
    await client.rpc.getBalance(authority.address).send()
  ).value;

  // Even when the seller tries to take the bid with optionalRoyalties set to 0...
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [authority.address],
    optionalRoyaltyPct: 0,
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...the tx passes, but royalties have been paid
  const creatorRoyaltyReceiverBalanceAfter = (
    await client.rpc.getBalance(authority.address).send()
  ).value;
  const royaltyPaid =
    creatorRoyaltyReceiverBalanceAfter - creatorRoyaltyReceiverBalanceBefore;
  t.is(royaltyPaid, ((LAMPORTS_PER_SOL / 2n) * 500n) / BASIS_POINTS);
});

test('it correctly handles optional royalties', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);

  const price = LAMPORTS_PER_SOL / 10n;

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: authority,
    conditions: [{ mode: Mode.FVC, value: authority.address }],
  });

  // Create Bid
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });

  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    quantity: 5,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const correctTestRoyalties = [0, 33, 70, 100];
  for (const royaltyPct of correctTestRoyalties) {
    const { mint } = await createDefaultNft({
      client,
      payer: seller,
      authority,
      owner: seller.address,
      standard: TokenStandard.NonFungible,
    });

    const creatorRoyaltyReceiverBalanceBefore = (
      await client.rpc.getBalance(authority.address).send()
    ).value;
    const takeBidIx = await getTakeBidLegacyInstructionAsync({
      owner: bidder.address,
      seller,
      whitelist,
      mint,
      minAmount: price,
      bidState,
      creators: [authority.address],
      optionalRoyaltyPct: royaltyPct,
    });

    await pipe(
      await createDefaultTransaction(client, seller),
      (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );

    // ...the tx passes and royalties have been paid correctly
    const creatorRoyaltyReceiverBalanceAfter = (
      await client.rpc.getBalance(authority.address).send()
    ).value;
    const royaltyPaid =
      creatorRoyaltyReceiverBalanceAfter - creatorRoyaltyReceiverBalanceBefore;
    // optional royalties == 5% of price * royaltyPct / 100
    t.is(
      royaltyPaid,
      (price * 500n * BigInt(royaltyPct)) / BASIS_POINTS / 100n
    );
  }
});

test('unitialized mintProof with other valid condition', async (t) => {
  // We create a whitelist with both a VOC and a MerkleTree condition.
  // The NFT is verified in the VOC collection, but we will pass in an uninitialized but correctly derived mintProof
  // This should still succeed as the VOC condition is satisfied.
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const { collection: collectionMint, item: mint } =
    await createDefaultNftInCollection({
      client,
      payer: seller,
      owner: seller.address,
      authority: updateAuthority,
      creators: [{ address: creator.address, verified: false, share: 100 }],
    });

  const {
    root,
    proofs: [_],
  } = await generateTreeOfSize(1, [mint.mint]);

  const conditions = [
    { mode: Mode.VOC, value: collectionMint.mint },
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creator,
    conditions,
  });

  // Create a collection bid
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [mintProofPda] = await findMintProofV2Pda({
    mint: mint.mint,
    whitelist,
  });

  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mint.mint,
    mintProof: mintProofPda, // Correct derivation but uninitialized
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid state should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('initialized but wrong mintProof with other valid condition', async (t) => {
  // We create a whitelist with both a VOC and a MerkleTree condition.
  // The NFT is verified in the VOC collection, but we will pass in an initialized but old/invalid mintProof
  // The mintProof will fail but the VOC condition will still be satisfied
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const { collection: collectionMint, item: mint } =
    await createDefaultNftInCollection({
      client,
      payer: seller,
      owner: seller.address,
      authority: updateAuthority,
      creators: [{ address: creator.address, verified: false, share: 100 }],
    });

  // Create the Merkle Tree with just the mint.
  const {
    root,
    proofs: [proof],
  } = await generateTreeOfSize(1, [mint.mint]);

  // Create the whitelist with both a VOC and a MerkleTree condition.
  const conditions = [
    { mode: Mode.VOC, value: collectionMint.mint },
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creator,
    conditions,
  });

  // Create the mintProof for the mint.
  const [mintProofPda] = await findMintProofV2Pda({
    mint: mint.mint,
    whitelist,
  });

  const createMintProofIxInTree =
    await getInitUpdateMintProofV2InstructionAsync({
      payer: seller,
      mint: mint.mint,
      mintProof: mintProofPda,
      whitelist,
      proof: proof.proof,
    });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(createMintProofIxInTree, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Update the merkle tree to have a new root
  const {
    root: newRoot,
    proofs: [_],
  } = await generateTreeOfSize(10, [mint.mint]);

  // New conditions with updated merkle tree so the old mint proof is invalid.
  const newConditions = [
    { mode: Mode.VOC, value: collectionMint.mint },
    { mode: Mode.MerkleTree, value: intoAddress(newRoot) },
  ];

  // Update the whitelist to have the new root
  const updateWhitelistIx = getUpdateWhitelistV2Instruction({
    whitelist,
    conditions: newConditions,
    payer: seller,
    updateAuthority: creator,
    freezeAuthority: operation('Noop'),
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(updateWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Create a collection bid with the whitelist
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mint.mint,
    mintProof: mintProofPda, // Correct derivation, initialized, but old/invalid
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  // Old mint proof shouldn't stop the bid from being taken because the VOC condition is satisfied.
  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid state should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('no mint proof passed in with other valid condition', async (t) => {
  // We create a whitelist with both a VOC and a MerkleTree condition.
  // The NFT is verified in the VOC collection and we pass in None for the mintProof.
  // The merkle validation will fail but the VOC condition will still be satisfied
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const { collection: collectionMint, item: mint } =
    await createDefaultNftInCollection({
      client,
      payer: seller,
      owner: seller.address,
      authority: updateAuthority,
      creators: [{ address: creator.address, verified: false, share: 100 }],
    });

  // Create the Merkle Tree with just the mint.
  const {
    root,
    proofs: [_],
  } = await generateTreeOfSize(1, [mint.mint]);

  // Create the whitelist with both a VOC and a MerkleTree condition.
  const conditions = [
    { mode: Mode.VOC, value: collectionMint.mint },
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creator,
    conditions,
  });

  // Create a collection bid with the whitelist
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mint.mint,
    // no mint proof
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  // Old mint proof shouldn't stop the bid from being taken because the VOC condition is satisfied.
  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid state should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('initialized and valid mintProof with other invalid condition', async (t) => {
  // We create a whitelist with both a VOC and a MerkleTree condition.
  // The NFT is verified in the Merkle tree but not in the VOC collection
  // The merkle validation will succeed and this will pass.
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const dummyVOCCollectionMint = (await generateKeyPairSigner()).address;

  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority: creator,
    owner: seller.address,
  });

  // Create the Merkle Tree with just the mint.
  const {
    root,
    proofs: [proof],
  } = await generateTreeOfSize(1, [mint]);

  // Create the whitelist with both a VOC and a MerkleTree condition.
  const conditions = [
    { mode: Mode.VOC, value: dummyVOCCollectionMint },
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creator,
    conditions,
  });

  // Upsert mint proof for the mint in the tree...
  const [mintProofPdaInTree] = await findMintProofV2Pda({
    mint,
    whitelist,
  });

  const createMintProofIxInTree =
    await getInitUpdateMintProofV2InstructionAsync({
      payer: seller,
      mint,
      mintProof: mintProofPdaInTree,
      whitelist,
      proof: proof.proof,
    });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(createMintProofIxInTree, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Create a collection bid with the whitelist
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    mintProof: mintProofPdaInTree,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid state should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('initialized and valid mintProof with other valid condition', async (t) => {
  // We create a whitelist with both a VOC and a MerkleTree condition.
  // The NFT is verified in the Merkle tree and the VOC collection
  // The merkle validation will succeed and this will pass as either condition is satisfied.
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  // We create an NFT.
  const { collection: collectionMint, item: mint } =
    await createDefaultNftInCollection({
      client,
      payer: seller,
      owner: seller.address,
      authority: creator,
      creators: [{ address: creator.address, verified: false, share: 100 }],
    });

  // Create the Merkle Tree with just the mint.
  const {
    root,
    proofs: [proof],
  } = await generateTreeOfSize(1, [mint.mint]);

  // Create the whitelist with both a VOC and a MerkleTree condition.
  const conditions = [
    { mode: Mode.VOC, value: collectionMint.mint },
    { mode: Mode.MerkleTree, value: intoAddress(root) },
  ];

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creator,
    conditions,
  });

  // Upsert mint proof for the mint in the tree...
  const [mintProofPdaInTree] = await findMintProofV2Pda({
    mint: mint.mint,
    whitelist,
  });

  const createMintProofIxInTree =
    await getInitUpdateMintProofV2InstructionAsync({
      payer: seller,
      mint: mint.mint,
      mintProof: mintProofPdaInTree,
      whitelist,
      proof: proof.proof,
    });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(createMintProofIxInTree, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Create a collection bid with the whitelist
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mint.mint,
    mintProof: mintProofPdaInTree,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid state should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});
