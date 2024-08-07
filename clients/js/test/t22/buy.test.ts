import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import { findAtaPda } from '@tensor-foundation/mpl-token-metadata';
import {
  createDefaultTransaction,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  getBuyT22InstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH,
} from '../../src/index.js';
import {
  assertTcompNoop,
  assertTokenNftOwnedBy,
  BASIS_POINTS,
  expectCustomError,
  TAKER_FEE_BPS,
  TestAction,
} from '../_common.js';
import { setupT22Test } from './_common.js';

test('it can buy an NFT', async (t) => {
  const { client, signers, nft, listing, listingPrice } = await setupT22Test({
    t,
    action: TestAction.List,
  });
  const { buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22InstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice!,
    creators: [nftUpdateAuthority.address],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
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

  // And the buyer has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });
});

test('it can buy an NFT with a cosigner', async (t) => {
  const { client, signers, nft, listing, listingPrice } = await setupT22Test({
    t,
    action: TestAction.List,
    useCosigner: true,
  });
  const { buyer, nftOwner, nftUpdateAuthority, cosigner } = signers;
  const { mint, extraAccountMetas } = nft;

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22InstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice!,
    cosigner,
    creators: [nftUpdateAuthority.address],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
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

  // And the buyer has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });
});

test('it cannot buy an NFT with a lower amount', async (t) => {
  const { client, signers, nft, listingPrice } = await setupT22Test({
    t,
    action: TestAction.List,
    useCosigner: true,
  });
  const { buyer, nftOwner, nftUpdateAuthority, cosigner } = signers;
  const { mint, extraAccountMetas } = nft;

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22InstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice! - 1n,
    cosigner,
    creators: [nftUpdateAuthority.address],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  const promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH);
});

test('it cannot buy an NFT with a missing or incorrect cosigner', async (t) => {
  const { client, signers, nft, listingPrice } = await setupT22Test({
    t,
    action: TestAction.List,
    useCosigner: true,
  });
  const { buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;

  const fakeCosigner = await generateKeyPairSigner();

  let buyIx = await getBuyT22InstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice! - 1n,
    // Missing cosigner!
    creators: [nftUpdateAuthority.address],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  let promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  // When a buyer buys the NFT.
  buyIx = await getBuyT22InstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice! - 1n,
    cosigner: fakeCosigner,
    creators: [nftUpdateAuthority.address],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);
});

test('buying emits a self-CPI logging event', async (t) => {
  const { client, signers, nft, listingPrice } = await setupT22Test({
    t,
    action: TestAction.List,
  });
  const { buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22InstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice!,
    creators: [nftUpdateAuthority.address],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  const sig = await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  assertTcompNoop(t, client, sig);
});

test.only('fees are paid correctly', async (t) => {
  const {
    client,
    signers,
    nft,
    listing: maybeListing,
    listingPrice,
    feeVault,
  } = await setupT22Test({
    t,
    action: TestAction.List,
  });
  const listing = maybeListing!;

  const { buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;

  const startingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22InstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice!,
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
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  const endingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  t.assert(
    endingFeeVaultBalance ===
      startingFeeVaultBalance + (listingPrice! * TAKER_FEE_BPS) / BASIS_POINTS
  );
});
