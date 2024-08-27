import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import { findAtaPda } from '@tensor-foundation/mpl-token-metadata';
import {
  assertTokenNftOwnedBy,
  createDefaultTransaction,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import { getDelistWnsInstructionAsync } from '../../src/index.js';
import { TestAction } from '../_common.js';
import { setupWnsTest } from './_common.js';

test('it can delist a listed WNS asset', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
  } = await setupWnsTest({
    t,
    action: TestAction.List,
  });
  const { nftOwner } = signers;
  const { mint, distribution } = nft;

  // When a buyer buys the NFT.
  const ix = await getDelistWnsInstructionAsync({
    owner: nftOwner,
    mint,
    distribution,
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(ix, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing!)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (
          await findAtaPda({
            mint,
            owner: listing!,
            tokenProgramId: TOKEN22_PROGRAM_ID,
          })
        )[0]
      )
    ).exists
  );

  // And the owner has the NFT back.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: nftOwner.address,
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
  });
});
