import {
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import { Mode } from '@tensor-foundation/whitelist';
import test from 'ava';
import {
  Target,
  fetchMaybeBidStateFromSeeds,
  findBidStatePda,
  getBidInstructionAsync,
  getCancelBidInstructionAsync,
} from '../../src/index.js';
import { createWhitelistV2, expectCustomError } from '../_common.js';

test('it can close a bid on a legacy collection', async (t) => {
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
  const price = 400_000_000n;
  const bidIx = await getBidInstructionAsync({
    owner,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId: bidId,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  const preOwnerFunds = (await client.rpc.getBalance(owner.address).send())
    .value;

  // When we close the bid
  const closeIx = await getCancelBidInstructionAsync({
    owner,
    bidId,
  });
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(closeIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // The BidState doesn't exist anymore
  const maybeBidState = await fetchMaybeBidStateFromSeeds(client.rpc, {
    owner: owner.address,
    bidId,
  });
  t.assert(maybeBidState.exists === false);

  // And the owner got his funds back
  const postOwnerFunds = (await client.rpc.getBalance(owner.address).send())
    .value;
  // 10k lamports buffer for tx costs
  t.assert(postOwnerFunds >= preOwnerFunds + price - 10_000n);
});

test('it cannot close a non-expired bid on a legacy collection w/o the owner', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const notOwner = await generateKeyPairSignerWithSol(client);
  const creatorKeypair = await generateKeyPairSignerWithSol(client);

  // Create whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.FVC, value: creatorKeypair.address }],
  });

  const bidId = (await generateKeyPairSigner()).address;
  const price = 400_000_000n;
  const bidIx = await getBidInstructionAsync({
    owner,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId: bidId,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [bidState] = await findBidStatePda({
    owner: owner.address,
    bidId,
  });

  // When we try to close the bid w/o the correct owner
  const closeIx = await getCancelBidInstructionAsync({
    owner: notOwner,
    bidId,
    bidState: bidState,
  });
  const promiseIncorrectOwner = pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(closeIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  const CONSTRAINT_SEEDS_ERROR_CODE = 2006;

  // Then a custom error gets thrown
  await expectCustomError(
    t,
    promiseIncorrectOwner,
    CONSTRAINT_SEEDS_ERROR_CODE
  );
});
