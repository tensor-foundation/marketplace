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
  BROKER_FEE_PCT,
  expectCustomError,
  HUNDRED_PCT,
  MAKER_BROKER_FEE_PCT,
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
