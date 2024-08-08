import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultTransaction,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findBidStatePda,
  getTakeBidWnsInstructionAsync,
} from '../../src/index.js';
import {
  assertTokenNftOwnedBy,
  COMPUTE_500K_IX,
  TestAction,
} from '../_common.js';
import { setupWnsTest } from './_common.js';

test('it can take a bid on a WNS NFT', async (t) => {
  const {
    client,
    signers,
    nft,
    price: bidPrice,
    state: bidState,
  } = await setupWnsTest({
    t,
    action: TestAction.Bid,
  });

  const { buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas, distribution } = nft;

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: buyer.address, // Bid owner--the buyer
    seller: nftOwner, // NFT holder--the seller
    mint,
    distribution,
    minAmount: bidPrice,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
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
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });
});
