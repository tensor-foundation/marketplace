import {
  airdropFactory,
  appendTransactionMessageInstruction,
  assertAccountDecoded,
  assertAccountExists,
  fetchEncodedAccount,
  fetchJsonParsedAccount,
  lamports,
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
  getBalance,
  ONE_SOL,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findFeeVaultPda,
  findListStatePda,
  getBuyLegacyInstructionAsync,
  getListLegacyInstructionAsync,
} from '../../src/index.js';

const TOTAL_FEE_BP = 200n; // 2% of the price.
const HUNDRED_BP = 10_000n;
const BROKER_FEE_BP = 5000n; // 50% of the total fee.
const MAKER_FEE_BP = 8000n; // 80% of the broker fee.

test('it can buy an NFT paying out fees correctly', async (t) => {
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const makerBroker = await generateKeyPairSignerWithSol(client);
  const takerBroker = await generateKeyPairSignerWithSol(client, 5n * ONE_SOL);

  const price = 100_000_000n;
  const totalFee = (price * TOTAL_FEE_BP) / HUNDRED_BP;
  const protocolFee = (totalFee * (HUNDRED_BP - BROKER_FEE_BP)) / HUNDRED_BP;
  const brokerFee = (totalFee * BROKER_FEE_BP) / HUNDRED_BP;
  const makerFee = (brokerFee * MAKER_FEE_BP) / HUNDRED_BP;
  const takerFee = brokerFee - makerFee; // remainder of the broker fee.
  const txFee = 5_000n;
  const tokenAccountRent = 2_039_280n;

  // We create an NFT.
  const { mint } = await createDefaultNft({
    client,
    payer: owner,
    authority: owner,
    owner,
  });

  // And we list the NFT.
  const listLegacyIx = await getListLegacyInstructionAsync({
    owner,
    mint,
    amount: price,
    makerBroker: makerBroker.address,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [listing] = await findListStatePda({ mint });
  assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

  const [feeVault] = await findFeeVaultPda({ address: listing });

  // Fund fee vault with min rent lamports.
  await airdropFactory(client)({
    recipientAddress: feeVault,
    lamports: lamports(890880n),
    commitment: 'confirmed',
  });

  // Balances before buy.

  const buyerBefore = BigInt(await getBalance(client, buyer.address));
  const makerBrokerBefore = BigInt(
    await getBalance(client, makerBroker.address)
  );
  const takerBrokerBefore = BigInt(
    await getBalance(client, takerBroker.address)
  );
  const feeVaultBefore = BigInt(await getBalance(client, feeVault));

  // When a buyer buys the NFT.
  const buyLegacyIx = await getBuyLegacyInstructionAsync({
    owner: owner.address,
    payer: buyer,
    mint,
    maxAmount: price,
    creators: [owner.address],
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
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

  // And the balances should have been updated correctly.
  const buyerAfter = BigInt(await getBalance(client, buyer.address));
  const makerBrokerAfter = BigInt(
    await getBalance(client, makerBroker.address)
  );
  const takerBrokerAfter = BigInt(
    await getBalance(client, takerBroker.address)
  );
  const feeVaultAfter = BigInt(await getBalance(client, feeVault));

  t.is(buyerAfter, buyerBefore - price - txFee - tokenAccountRent - totalFee);
  t.is(makerBrokerAfter, makerBrokerBefore + makerFee);
  t.is(takerBrokerAfter, takerBrokerBefore + takerFee);
  t.is(feeVaultAfter, feeVaultBefore + protocolFee);
  t.is(brokerFee, makerFee + takerFee);
});
