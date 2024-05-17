import {
  appendTransactionInstruction,
  assertAccountDecoded,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import {
  createDefaultNft,
  findAtaPda,
} from '@tensor-foundation/toolkit-token-metadata';
import test from 'ava';
import {
  Target,
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidLegacyInstructionAsync,
} from '../../src/index.js';

test('it can take a bid on a legacy NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft(client, seller, seller, seller);

  const bidIx = await getBidInstructionAsync({
    owner,
    amount: 10,
    target: Target.AssetId,
    targetId: mint,
  });

  // And the owner creates a bid on the NFT.
  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: owner.address,
    seller,
    mint,
    minAmount: 5,
    creators: [seller.address],
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findBidStatePda({ owner: owner.address, bidId: mint }))[0]
      )
    ).exists
  );

  // And the owner has the NFT.
  const ownerToken = await fetchJsonParsedAccount(
    client.rpc,
    (await findAtaPda({ mint, owner: owner.address }))[0]
  );
  assertAccountDecoded(ownerToken);

  t.like(ownerToken, {
    data: {
      tokenAmount: { amount: '1' },
    },
  });
});
