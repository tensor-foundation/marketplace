import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import { findAtaPda } from '@tensor-foundation/mpl-token-metadata';
import { TokenStandard } from '@tensor-foundation/resolvers';
import {
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  getBuyLegacyInstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH,
} from '../../src/index.js';
import {
  assertTokenNftOwnedBy,
  COMPUTE_300K_IX,
  COMPUTE_500K_IX,
  TestAction,
} from '../_common.js';
import { setupLegacyTest } from './_common.js';

test('it can buy an NFT', async (t) => {
  const { client, signers, mint, listing, listingPrice } =
    await setupLegacyTest({
      t,
      action: TestAction.List,
    });
  const { buyer, nftOwner, nftUpdateAuthority } = signers;

  // When a buyer buys the NFT.
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice!,
    creators: [nftUpdateAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing!)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findAtaPda({ mint, owner: listing! }))[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  await assertTokenNftOwnedBy({ t, client, mint, owner: buyer.address });
});

test('it can buy a Programmable NFT', async (t) => {
  const { client, signers, mint, listing, listingPrice } =
    await setupLegacyTest({
      t,
      action: TestAction.List,
      pNft: true,
    });
  const { buyer, nftOwner, nftUpdateAuthority } = signers;

  // When a buyer buys the NFT.
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice!,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    creators: [nftUpdateAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing!)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findAtaPda({ mint, owner: listing! }))[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  await assertTokenNftOwnedBy({ t, client, mint, owner: buyer.address });
});

test('it cannot buy a Programmable NFT with a lower amount', async (t) => {
  const { client, signers, mint, listingPrice } = await setupLegacyTest({
    t,
    action: TestAction.List,
    pNft: true,
  });
  const { nftOwner, nftUpdateAuthority } = signers;

  // When a buyer tries to buy the NFT with a lower amount.
  const buyer = await generateKeyPairSignerWithSol(client);
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice! - 1n,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    creators: [nftUpdateAuthority.address],
  });

  // Then we expect an error.
  try {
    await pipe(
      await createDefaultTransaction(client, buyer),
      (tx) => appendTransactionMessageInstruction(COMPUTE_300K_IX, tx),
      (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('Expected price mismatch error.');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH,
        },
      },
    });
  }
});

test('it can buy an NFT with a cosigner', async (t) => {
  const { client, signers, mint, listing, listingPrice } =
    await setupLegacyTest({
      t,
      action: TestAction.List,
      useCosigner: true,
    });
  const { nftOwner, nftUpdateAuthority, cosigner } = signers;

  // When a buyer buys the NFT.
  const buyer = await generateKeyPairSignerWithSol(client);
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice!,
    cosigner,
    creators: [nftUpdateAuthority.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing!)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findAtaPda({ mint, owner: listing! }))[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  await assertTokenNftOwnedBy({ t, client, mint, owner: buyer.address });
});

test('it cannot buy a Programmable NFT with a missing cosigner', async (t) => {
  const { client, signers, mint, listingPrice } = await setupLegacyTest({
    t,
    action: TestAction.List,
    useCosigner: true,
  });
  const { nftOwner, nftUpdateAuthority } = signers;

  // When a buyer tries to buy the NFT without passing in a cosigner.
  const buyer = await generateKeyPairSignerWithSol(client);
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice!,
    // Missing cosigner!
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    creators: [nftUpdateAuthority.address],
  });

  // Then we expect an error.
  try {
    await pipe(
      await createDefaultTransaction(client, buyer),
      (tx) => appendTransactionMessageInstruction(COMPUTE_300K_IX, tx),
      (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('Expected bad cosigner error.');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
        },
      },
    });
  }
});
