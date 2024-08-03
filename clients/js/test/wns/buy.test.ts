import {
  appendTransactionMessageInstruction,
  assertAccountDecoded,
  assertAccountExists,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
  pipe,
} from '@solana/web3.js';
import { findAtaPda } from '@tensor-foundation/mpl-token-metadata';
import {
  createDefaultTransaction,
  createWnsNftInGroup,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findListStatePda,
  getBuyWnsInstructionAsync,
  getListWnsInstructionAsync,
} from '../../src/index.js';
import { getTestSetup } from '../_common.js';

test('it can buy an NFT', async (t) => {
  const { client, payer, nftUpdateAuthority, nftOwner, buyer } =
    await getTestSetup();

  // Mint NFT
  const { mint, extraAccountMetas, distribution } = await createWnsNftInGroup({
    client,
    payer,
    owner: nftOwner.address,
    authority: nftUpdateAuthority,
  });

  // And we list the NFT.
  const listIx = await getListWnsInstructionAsync({
    distribution,
    owner: nftOwner,
    mint,
    amount: 1,
    tokenProgram: TOKEN22_PROGRAM_ID,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    distribution,
    maxAmount: 2,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (
          await findAtaPda({
            mint,
            owner: listing,
            tokenProgramId: TOKEN22_PROGRAM_ID,
          })
        )[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  const buyerToken = await fetchJsonParsedAccount(
    client.rpc,
    (
      await findAtaPda({
        mint,
        owner: buyer.address,
        tokenProgramId: TOKEN22_PROGRAM_ID,
      })
    )[0]
  );
  assertAccountDecoded(buyerToken);

  t.like(buyerToken, {
    data: {
      tokenAmount: { amount: '1' },
    },
  });
});

test('it can buy an NFT with a cosigner', async (t) => {
  const { client, payer, nftUpdateAuthority, nftOwner, buyer, cosigner } =
    await getTestSetup();

  // Mint NFT
  const { mint, extraAccountMetas, distribution } = await createWnsNftInGroup({
    client,
    payer,
    owner: nftOwner.address,
    authority: nftUpdateAuthority,
  });

  // And we list the NFT with a cosigner.
  const listIx = await getListWnsInstructionAsync({
    owner: nftOwner,
    mint,
    distribution,
    amount: 1,
    cosigner,
    tokenProgram: TOKEN22_PROGRAM_ID,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, nftOwner),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // When a buyer buys the NFT.
  const buyIx = await getBuyWnsInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    distribution,
    mint,
    maxAmount: 2,
    cosigner,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (
          await findAtaPda({
            mint,
            owner: listing,
            tokenProgramId: TOKEN22_PROGRAM_ID,
          })
        )[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  const buyerToken = await fetchJsonParsedAccount(
    client.rpc,
    (
      await findAtaPda({
        mint,
        owner: buyer.address,
        tokenProgramId: TOKEN22_PROGRAM_ID,
      })
    )[0]
  );
  assertAccountDecoded(buyerToken);

  t.like(buyerToken, {
    data: {
      tokenAmount: { amount: '1' },
    },
  });
});
