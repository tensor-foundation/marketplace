import {
  appendTransactionMessageInstruction,
  assertAccountDecoded,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
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
import test from 'ava';
import {
  Target,
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidLegacyInstructionAsync,
} from '../../src/index.js';

test('it can take a bid on a legacy NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const buyer = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: seller,
    authority: seller,
    owner: seller,
  });

  const bidIx = await getBidInstructionAsync({
    owner: buyer,
    amount: 10,
    target: Target.AssetId,
    targetId: mint,
  });

  // And the owner creates a bid on the NFT.
  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidLegacyInstructionAsync({
    owner: buyer.address,
    seller,
    mint,
    minAmount: 5,
    creators: [seller.address],
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
        (await findBidStatePda({ owner: buyer.address, bidId: mint }))[0]
      )
    ).exists
  );

  // And the owner has the NFT.
  const ownerToken = await fetchJsonParsedAccount(
    client.rpc,
    (await findAtaPda({ mint, owner: buyer.address }))[0]
  );
  assertAccountDecoded(ownerToken);

  t.like(ownerToken, {
    data: {
      tokenAmount: { amount: '1' },
    },
  });
});
