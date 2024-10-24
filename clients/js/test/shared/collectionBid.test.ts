import {
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  createAndMintTo,
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  LAMPORTS_PER_SOL,
  signAndSendTransaction,
  TSWAP_SINGLETON,
} from '@tensor-foundation/test-helpers';
import { Mode } from '@tensor-foundation/whitelist';
import test from 'ava';
import {
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__CURRENCY_NOT_YET_ENABLED,
  Target,
  fetchBidStateFromSeeds,
  getBidInstructionAsync,
} from '../../src/index.js';
import { createWhitelistV2, expectCustomError, initTswap } from '../_common.js';
import { createDefaultNft } from '@tensor-foundation/mpl-token-metadata';
import {
  findMarginAccountPda,
  getDepositMarginAccountInstructionAsync,
  getInitMarginAccountInstructionAsync,
} from '@tensor-foundation/escrow';

test('it can bid on a legacy collection', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const creatorKeypair = await generateKeyPairSignerWithSol(client);

  // Create whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.FVC, value: creatorKeypair.address }],
  });

  const bidId = (await generateKeyPairSigner()).address;

  const bidIx = await getBidInstructionAsync({
    owner,
    amount: 1,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId: bidId,
  });

  // When we create a bid on the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then we should be able to fetch the bid state.
  const bid = await fetchBidStateFromSeeds(client.rpc, {
    owner: owner.address,
    bidId,
  });
  t.like(bid, {
    data: {
      owner: owner.address,
      amount: 1n,
      target: Target.Whitelist,
      targetId: whitelist,
      cosigner: null,
    },
  });
});

test('it cannot make a collection bid with a non-sol currency', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);

  // create whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: owner,
    conditions: [{ mode: Mode.FVC, value: owner.address }],
  });

  // Create SPL token
  const [token] = await createAndMintTo({
    client,
    decimals: 0,
    payer: owner,
    mintAuthority: owner,
    initialSupply: 100n,
  });

  // Assert mint exists
  const mintInfo = await client.rpc.getTokenSupply(token.mint).send();
  // who thought of having a StringifiedBigInt ?!?!
  t.is(mintInfo.value.amount as string, '100');

  const bidIx = await getBidInstructionAsync({
    owner,
    amount: 1,
    target: Target.Whitelist,
    targetId: whitelist,
    currency: token.mint,
  });

  const tx = pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(
    t,
    tx,
    TENSOR_MARKETPLACE_ERROR__CURRENCY_NOT_YET_ENABLED
  );
});

test('it can create a collection bid attached to shared escrow, owner doesnt need to transfer sol', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const mintOwner = await generateKeyPairSignerWithSol(client);
  await initTswap(client);

  // Create NFT
  const { mint } = await createDefaultNft({
    client,
    payer: mintOwner,
    authority: mintOwner,
    owner: mintOwner,
  });

  const [marginAccount] = await findMarginAccountPda({
    tswap: TSWAP_SINGLETON,
    owner: owner.address,
    marginNr: 0,
  });
  // Initialize the escrow account
  const createMarginAccountIx = await getInitMarginAccountInstructionAsync({
    marginAccount,
    owner,
  });
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(createMarginAccountIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Deposit some sol into the escrow account
  const depositIx = await getDepositMarginAccountInstructionAsync({
    marginAccount,
    owner,
    lamports: LAMPORTS_PER_SOL / 2n,
  });
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(depositIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const beforeBalance = await client.rpc.getBalance(owner.address).send();

  // Initialize the bid
  const bidIx = await getBidInstructionAsync({
    owner,
    amount: LAMPORTS_PER_SOL / 2n,
    target: Target.AssetId,
    targetId: mint,
    sharedEscrow: marginAccount,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Fetch the bid state to assert that it exists
  // and to retrieve account rent
  const bid = await fetchBidStateFromSeeds(client.rpc, {
    owner: owner.address,
    bidId: mint,
  });
  const rent = bid.lamports;
  // Just to make sure, we check that its balance is less than 0.01 SOL
  t.true(rent < LAMPORTS_PER_SOL / 100n);

  const afterBalance = await client.rpc.getBalance(owner.address).send();
  // The owner didn't have to transfer sol except tx cost + account rent
  t.is(BigInt(afterBalance.value), beforeBalance.value - 5000n - rent);
});

test('it can create multiple collection bids on the same collection', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);

  // Create Whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: owner,
    conditions: [{ mode: Mode.FVC, value: owner.address }],
  });

  // Create Bid numero uno...
  const bidId1 = (await generateKeyPairSigner()).address;
  const createBid1Ix = await getBidInstructionAsync({
    owner,
    amount: 1n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId: bidId1,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(createBid1Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  //... and numero dos
  const bidId2 = (await generateKeyPairSigner()).address;
  const createBid2Ix = await getBidInstructionAsync({
    owner,
    amount: 2n,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId: bidId2,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(createBid2Ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then both exist
  const bid1 = await fetchBidStateFromSeeds(client.rpc, {
    owner: owner.address,
    bidId: bidId1,
  });
  const bid2 = await fetchBidStateFromSeeds(client.rpc, {
    owner: owner.address,
    bidId: bidId2,
  });
  t.is(bid1.data.amount, 1n);
  t.is(bid2.data.amount, 2n);
});

test.skip('it cannot make a collection bid with cosigner set to the original signer', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: owner,
    conditions: [{ mode: Mode.FVC, value: owner.address }],
  });

  const bidIx = await getBidInstructionAsync({
    owner,
    amount: 1,
    target: Target.Whitelist,
    targetId: whitelist,
    cosigner: owner,
  });

  const tx = pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);
});
