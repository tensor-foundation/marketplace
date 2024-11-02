import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import { findAtaPda } from '@tensor-foundation/mpl-token-metadata';
import {
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  createT22NftWithRoyalties,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
  createDefaultSolanaClient,
  createAndMintTo,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  getBuyT22InstructionAsync,
  getListT22InstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED,
  TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH,
  TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED,
} from '../../src/index.js';
import {
  assertTcompNoop,
  assertTokenNftOwnedBy,
  BASIS_POINTS,
  BROKER_FEE_PCT,
  expectCustomError,
  HUNDRED_PCT,
  MAKER_BROKER_FEE_PCT,
  sleep,
  TAKER_FEE_BPS,
  TestAction,
} from '../_common.js';
import { setupT22Test } from './_common.js';

test('it can buy an NFT', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
  } = await setupT22Test({
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
            tokenProgram: TOKEN22_PROGRAM_ID,
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
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
  } = await setupT22Test({
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
            tokenProgram: TOKEN22_PROGRAM_ID,
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
  const {
    client,
    signers,
    nft,
    price: listingPrice,
  } = await setupT22Test({
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
  const {
    client,
    signers,
    nft,
    price: listingPrice,
  } = await setupT22Test({
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
  const {
    client,
    signers,
    nft,
    price: listingPrice,
  } = await setupT22Test({
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

test('fees are paid correctly', async (t) => {
  const {
    client,
    signers,
    nft,
    state: maybeListing,
    price: listingPrice,
    feeVault,
  } = await setupT22Test({
    t,
    action: TestAction.List,
  });
  const listing = maybeListing!;

  const { buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas, sellerFeeBasisPoints } = nft;

  const startingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  const startingUpdateAuthorityBalance = (
    await client.rpc.getBalance(nftUpdateAuthority.address).send()
  ).value;

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
            tokenProgram: TOKEN22_PROGRAM_ID,
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

  // Fee vault gets entire protocol fee because no maker or taker brokers are set.
  t.assert(
    endingFeeVaultBalance >=
      startingFeeVaultBalance + (listingPrice! * TAKER_FEE_BPS) / BASIS_POINTS
  );

  // Check that the royalties were paid correctly
  const endingUpdateAuthorityBalance = (
    await client.rpc.getBalance(nftUpdateAuthority.address).send()
  ).value;
  t.assert(
    endingUpdateAuthorityBalance ===
      startingUpdateAuthorityBalance +
        (listingPrice! * sellerFeeBasisPoints) / BASIS_POINTS
  );
});

test('maker and taker brokers receive correct split', async (t) => {
  const {
    client,
    signers,
    nft,
    state: maybeListing,
    price: listingPrice,
    feeVault,
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useMakerBroker: true,
  });
  const listing = maybeListing!;

  const { buyer, nftOwner, nftUpdateAuthority, makerBroker, takerBroker } =
    signers;
  const { mint, extraAccountMetas, sellerFeeBasisPoints } = nft;

  const startingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  const startingUpdateAuthorityBalance = (
    await client.rpc.getBalance(nftUpdateAuthority.address).send()
  ).value;

  const startingMakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(makerBroker.address).send()).value
  );

  const startingTakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(takerBroker.address).send()).value
  );

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22InstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice!,
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
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
            tokenProgram: TOKEN22_PROGRAM_ID,
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

  // Taker fee is calculated from the listing price and the TAKER_FEE_BPS.
  const takerFee = (listingPrice! * TAKER_FEE_BPS) / BASIS_POINTS;
  // Taker fee is split between the brokers and the protocol based on the BROKER_FEE_PCT.
  const brokerFee = (takerFee! * BROKER_FEE_PCT) / HUNDRED_PCT;
  const protocolFee = takerFee - brokerFee;
  // Maker broker receives MAKER_BROKER_PCT of the protocol fee.
  const makerBrokerFee = (brokerFee! * MAKER_BROKER_FEE_PCT) / HUNDRED_PCT;
  // Taker broker receives whatever is left of the broker fee.
  const takerBrokerFee = brokerFee! - makerBrokerFee;

  // Fee vault receives whatever brokers don't receive, currently half of the taker fee.
  t.assert(endingFeeVaultBalance >= startingFeeVaultBalance + protocolFee);

  // Royalties were paid correctly.
  const endingUpdateAuthorityBalance = (
    await client.rpc.getBalance(nftUpdateAuthority.address).send()
  ).value;
  t.assert(
    endingUpdateAuthorityBalance ===
      startingUpdateAuthorityBalance +
        (listingPrice! * sellerFeeBasisPoints) / BASIS_POINTS
  );

  const endingMakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(makerBroker.address).send()).value
  );

  const endingTakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(takerBroker.address).send()).value
  );

  t.assert(
    endingMakerBrokerBalance === startingMakerBrokerBalance + makerBrokerFee
  );

  // Taker broker receives whatever is left of the protocol fee.
  t.assert(
    endingTakerBrokerBalance === startingTakerBrokerBalance + takerBrokerFee
  );
});

test('taker broker receives correct split even if maker broker is not set', async (t) => {
  const {
    client,
    signers,
    nft,
    state: maybeListing,
    price: listingPrice,
    feeVault,
  } = await setupT22Test({
    t,
    action: TestAction.List,
    // not setting maker broker
  });
  const listing = maybeListing!;

  const { buyer, nftOwner, nftUpdateAuthority, takerBroker } = signers;
  const { mint, extraAccountMetas, sellerFeeBasisPoints } = nft;

  const startingFeeVaultBalance = BigInt(
    (await client.rpc.getBalance(feeVault).send()).value
  );

  const startingUpdateAuthorityBalance = (
    await client.rpc.getBalance(nftUpdateAuthority.address).send()
  ).value;

  const startingTakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(takerBroker.address).send()).value
  );

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22InstructionAsync({
    owner: nftOwner.address,
    payer: buyer,
    mint,
    maxAmount: listingPrice!,
    // not passing in maker broker
    takerBroker: takerBroker.address, // still passing in taker broker
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
            tokenProgram: TOKEN22_PROGRAM_ID,
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

  // Taker fee is calculated from the listing price and the TAKER_FEE_BPS.
  const takerFee = (listingPrice! * TAKER_FEE_BPS) / BASIS_POINTS;
  // Taker fee is split between the brokers and the protocol based on the BROKER_FEE_PCT.
  const brokerFee = (takerFee! * BROKER_FEE_PCT) / HUNDRED_PCT;
  const protocolFee = takerFee - brokerFee;
  // Maker broker receives MAKER_BROKER_PCT of the protocol fee.
  const makerBrokerFee = (brokerFee! * MAKER_BROKER_FEE_PCT) / HUNDRED_PCT;
  // Taker broker receives whatever is left of the broker fee.
  const takerBrokerFee = brokerFee! - makerBrokerFee;

  // Fee vault receives it's split of the protocol fee and also the maker broker fee since it's not set.'
  t.assert(
    endingFeeVaultBalance >=
      startingFeeVaultBalance + protocolFee + makerBrokerFee
  );

  // Royalties were paid correctly.
  const endingUpdateAuthorityBalance = (
    await client.rpc.getBalance(nftUpdateAuthority.address).send()
  ).value;
  t.assert(
    endingUpdateAuthorityBalance ===
      startingUpdateAuthorityBalance +
        (listingPrice! * sellerFeeBasisPoints) / BASIS_POINTS
  );

  const endingTakerBrokerBalance = BigInt(
    (await client.rpc.getBalance(takerBroker.address).send()).value
  );

  // Taker broker should still receive its share.
  t.assert(
    endingTakerBrokerBalance === startingTakerBrokerBalance + takerBrokerFee
  );
});

test('it cannot buy a listing that specified a different currency', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);
  const sellerFeeBasisPoints = 1000n;

  const [{ mint: currency }] = await createAndMintTo({
    client,
    mintAuthority,
    payer: buyer,
    recipient: buyer.address,
    decimals: 0,
    initialSupply: 1_000_000_000n,
  });

  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
    client,
    payer: lister,
    owner: lister.address,
    mintAuthority: mintAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + creator.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });

  const listIx = await getListT22InstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    currency,
    amount: 100n,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const buyIx = await getBuyT22InstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: 100n,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
    creators: [creator.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH);
});

test('it has to specify the correct maker broker', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const makerBroker = await generateKeyPairSignerWithSol(client);
  const notMakerBroker = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);
  const sellerFeeBasisPoints = 1000n;


  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
    client,
    payer: lister,
    owner: lister.address,
    mintAuthority: mintAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + creator.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });

  const listIx = await getListT22InstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    amount: 100n,
    // (!)
    makerBroker: makerBroker.address,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If the buyer tries to buy the NFT without a maker broker...
  const buyIx = await getBuyT22InstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: 100n,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
    creators: [creator.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a broker mismatch error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with a different maker broker...
  const buyIx2 = await getBuyT22InstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: 100n,
    makerBroker: notMakerBroker.address,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
    creators: [creator.address],
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a broker mismatch error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH);

  // If the buyer tries to buy the NFT with the correct maker broker...
  const buyIx3 = await getBuyT22InstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: 100n,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
    makerBroker: makerBroker.address,
    creators: [creator.address],
  });

  const tx3 = await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx3, tx),
    (tx) => signAndSendTransaction(client, tx, { skipPreflight: true })
  );

  const test = await client.rpc.getTransaction(tx3).send();
  t.log(test);

  // ...then the transaction should succeed.
  t.is(typeof tx3, 'string');
});

test('it has to respect the correct private taker', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const privateTaker = await generateKeyPairSignerWithSol(client);
  const notPrivateTaker = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);
  const sellerFeeBasisPoints = 1000n;

  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
    client,
    payer: lister,
    owner: lister.address,
    mintAuthority: mintAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + creator.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });

  const listIx = await getListT22InstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    amount: 100n,
    privateTaker: privateTaker.address,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // If a different buyer tries to buy the NFT...
  const buyIx2 = await getBuyT22InstructionAsync({
    owner: lister.address,
    payer: notPrivateTaker,
    mint,
    maxAmount: 100n,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
    creators: [creator.address],
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, notPrivateTaker),
    (tx) => appendTransactionMessageInstruction(buyIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a taker not allowed error.
  await expectCustomError(t, tx2, TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED);

  // If the specified private taker buys the NFT...
  const buyIx3 = await getBuyT22InstructionAsync({
    owner: lister.address,
    payer: privateTaker,
    mint,
    maxAmount: 100n,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
    creators: [creator.address],
  });

  const tx3 = await pipe(
    await createDefaultTransaction(client, privateTaker),
    (tx) => appendTransactionMessageInstruction(buyIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then the transaction should succeed.
  t.is(typeof tx3, 'string');
});

test('it cannot buy an expired listing', async (t) => {
  const client = createDefaultSolanaClient();
  const lister = await generateKeyPairSignerWithSol(client);
  const buyer = await generateKeyPairSignerWithSol(client);
  const mintAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);
  const sellerFeeBasisPoints = 1000n;

  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
    client,
    payer: lister,
    owner: lister.address,
    mintAuthority: mintAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + creator.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });

  const listIx = await getListT22InstructionAsync({
    payer: lister,
    owner: lister,
    mint,
    amount: 100n,
    expireInSec: 1,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, lister),
    (tx) => appendTransactionMessageInstruction(listIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Sleep for 5 seconds to let the listing expire.
  await sleep(5000);

  // If the buyer tries to buy the expired listing...
  const buyIx = await getBuyT22InstructionAsync({
    owner: lister.address,
    payer: buyer,
    mint,
    maxAmount: 100n,
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
    creators: [creator.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...then we expect a listing expired error.
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED);
});