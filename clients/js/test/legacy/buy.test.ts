import { getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';
import {
  appendTransactionInstruction,
  assertAccountDecoded,
  assertAccountExists,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
  generateKeyPairSigner,
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
  createDefaultpNft,
  findAtaPda,
} from '@tensor-foundation/toolkit-token-metadata';
import test from 'ava';
import {
  TensorMarketplaceProgramErrorCode,
  TokenStandard,
  findListStatePda,
  getBuyLegacyInstructionAsync,
  getListLegacyInstructionAsync,
} from '../../src/index.js';

test('it can buy a legacy NFT', async (t) => {
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
    (tx) => appendTransactionInstruction(listLegacyIx, tx),
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
    (tx) => appendTransactionInstruction(buyLegacyIx, tx),
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

test('it can buy a legacy Programmable NFT', async (t) => {
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

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(listLegacyIx, tx),
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

  const computeIx = getSetComputeUnitLimitInstruction({
    units: 300_000,
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionInstruction(computeIx, tx),
    (tx) => appendTransactionInstruction(buyLegacyIx, tx),
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

test('it cannot buy a legacy pNFT with a lower amount', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultpNft(client, owner, owner, owner);

  // And we list the NFT.
  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 10,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(listLegacyIx, tx),
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

  const computeIx = getSetComputeUnitLimitInstruction({
    units: 300_000,
  });

  // Then we expect an error.
  try {
    await pipe(
      await createDefaultTransaction(client, buyer),
      (tx) => appendTransactionInstruction(computeIx, tx),
      (tx) => appendTransactionInstruction(buyLegacyIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('Expected price mismatch error.');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TensorMarketplaceProgramErrorCode.PRICE_MISMATCH,
        },
      },
    });
  }
});

test('it can buy a legacy NFT with a cosigner', async (t) => {
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
    (tx) => appendTransactionInstruction(listLegacyIx, tx),
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
    (tx) => appendTransactionInstruction(buyLegacyIx, tx),
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

test('it cannot buy a legacy pNFT with a missing cosigner', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  // We create an NFT.
  const { mint } = await createDefaultpNft(client, owner, owner, owner);

  // And we list the NFT with a cosigner.
  const cosigner = await generateKeyPairSigner();
  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: 10,
    cosigner,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionInstruction(listLegacyIx, tx),
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
    maxAmount: 10,
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    creators: [owner.address],
  });

  const computeIx = getSetComputeUnitLimitInstruction({
    units: 300_000,
  });

  // Then we expect an error.
  try {
    await pipe(
      await createDefaultTransaction(client, buyer),
      (tx) => appendTransactionInstruction(computeIx, tx),
      (tx) => appendTransactionInstruction(buyLegacyIx, tx),
      (tx) => signAndSendTransaction(client, tx)
    );
    t.fail('Expected bad cosigner error.');
  } catch (error) {
    t.like(error, {
      cause: {
        context: {
          code: TensorMarketplaceProgramErrorCode.BAD_COSIGNER,
        },
      },
    });
  }
});
