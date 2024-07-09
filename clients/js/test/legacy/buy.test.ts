import { getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';
import {
  appendTransactionMessageInstruction,
  assertAccountDecoded,
  assertAccountExists,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultNft,
  createDefaultpNft,
  findAtaPda,
} from '@tensor-foundation/mpl-token-metadata';
import { TokenStandard } from '@tensor-foundation/resolvers';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH,
  findListStatePda,
  getBuyLegacyInstructionAsync,
  getListLegacyInstructionAsync,
} from '../../src/index.js';

test('it can buy an NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);

  // We create an NFT.
  const { mint } = await createDefaultNft(client, owner, owner, owner);

  // And we list the NFT.
  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // When a buyer buys the NFT.
  const buyer = await generateKeyPairSignerWithSol(client);
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: owner.address,
    payer: buyer,
    mint,
    maxAmount: 2,
    creators: [owner.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findAtaPda({ mint, owner: listing }))[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  const buyerToken = await fetchJsonParsedAccount(
    client.rpc,
    (await findAtaPda({ mint, owner: buyer.address }))[0]
  );
  assertAccountDecoded(buyerToken);

  t.like(buyerToken, {
    data: {
      tokenAmount: { amount: '1' },
    },
  });
});

test('it can buy a Programmable NFT', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultpNft(client, owner, owner, owner);

  // And we list the NFT.
  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
  });

  const computeIx = getSetComputeUnitLimitInstruction({
    units: 300_000,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // When a buyer buys the NFT.
  const buyer = await generateKeyPairSignerWithSol(client);
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: owner.address,
    payer: buyer,
    mint,
    maxAmount: 1,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    creators: [owner.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findAtaPda({ mint, owner: listing }))[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  const buyerToken = await fetchJsonParsedAccount(
    client.rpc,
    (await findAtaPda({ mint, owner: buyer.address }))[0]
  );
  assertAccountDecoded(buyerToken);

  t.like(buyerToken, {
    data: {
      tokenAmount: { amount: '1' },
    },
  });
});

test('it cannot buy a Programmable NFT with a lower amount', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultpNft(client, owner, owner, owner);

  const computeIx = getSetComputeUnitLimitInstruction({
    units: 300_000,
  });

  // And we list the NFT.
  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 10,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // When a buyer tries to buy the NFT with a lower amount.
  const buyer = await generateKeyPairSignerWithSol(client);
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: owner.address,
    payer: buyer,
    mint,
    maxAmount: 5,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    creators: [owner.address],
  });

  // Then we expect an error.
  try {
    await pipe(
      await createDefaultTransaction(client, buyer),
      (tx) => appendTransactionMessageInstruction(computeIx, tx),
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
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);

  // We create an NFT.
  const { mint } = await createDefaultNft(client, owner, owner, owner);

  // And we list the NFT with a cosigner.
  const cosigner = await generateKeyPairSigner();
  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 1,
    cosigner,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // When a buyer buys the NFT.
  const buyer = await generateKeyPairSignerWithSol(client);
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: owner.address,
    payer: buyer,
    mint,
    maxAmount: 2,
    cosigner,
    creators: [owner.address],
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the listing account should have been closed.
  t.false((await fetchEncodedAccount(client.rpc, listing)).exists);

  // And the listing token account should have been closed.
  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (await findAtaPda({ mint, owner: listing }))[0]
      )
    ).exists
  );

  // And the buyer has the NFT.
  const buyerToken = await fetchJsonParsedAccount(
    client.rpc,
    (await findAtaPda({ mint, owner: buyer.address }))[0]
  );
  assertAccountDecoded(buyerToken);

  t.like(buyerToken, {
    data: {
      tokenAmount: { amount: '1' },
    },
  });
});

test('it cannot buy a Programmable NFT with a missing cosigner', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const cosigner = await generateKeyPairSigner();

  // We create an NFT.
  const { mint } = await createDefaultpNft(client, owner, owner, owner);

  // And we list the NFT with a cosigner.
  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 10,
    cosigner,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
  });

  const computeIx = getSetComputeUnitLimitInstruction({
    units: 300_000,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  // When a buyer tries to buy the NFT without passing in a cosigner.
  const buyer = await generateKeyPairSignerWithSol(client);
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: owner.address,
    payer: buyer,
    mint,
    maxAmount: 10,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    creators: [owner.address],
  });

  // Then we expect an error.
  try {
    await pipe(
      await createDefaultTransaction(client, buyer),
      (tx) => appendTransactionMessageInstruction(computeIx, tx),
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
