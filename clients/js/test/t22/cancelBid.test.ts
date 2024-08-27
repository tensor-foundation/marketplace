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
import { getCancelBidInstructionAsync } from '../../src/index.js';
import { assertTokenNftOwnedBy, TestAction } from '../_common.js';
import { setupT22Test } from './_common.js';

test('it can cancel a listed bid', async (t) => {
  const {
    client,
    signers,
    nft,
    state: bidState,
  } = await setupT22Test({
    t,
    action: TestAction.Bid,
  });

  const { buyer, nftOwner } = signers;
  const { mint } = nft;

  // When the buyer cancels the bid.
  const cancelBidIx = await getCancelBidInstructionAsync({
    owner: buyer,
    bidId: mint,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(cancelBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);

  // And the owner still has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: nftOwner.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });
});
