import {
  appendTransactionMessageInstruction,
  assertAccountDecoded,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultNft,
  findAtaPda,
} from '@tensor-foundation/mpl-token-metadata';
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
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidLegacyInstructionAsync,
} from '../../src/index.js';
import { createWhitelistV2, expectCustomError } from '../_common.js';

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
    owner: seller,
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
    owner: seller,
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
    owner: seller,
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

  const BAD_COSIGNER_ERROR_CODE = 6132;

  // Then a custom error gets thrown
  await expectCustomError(t, promiseNoCosigner, BAD_COSIGNER_ERROR_CODE);

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
  await expectCustomError(t, promiseIncorrectCosigner, BAD_COSIGNER_ERROR_CODE);
});
