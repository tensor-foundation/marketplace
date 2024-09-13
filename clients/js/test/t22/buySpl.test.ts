import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import { findAtaPda } from '@tensor-foundation/mpl-token-metadata';
import {
  assertTokenNftOwnedBy,
  createAta,
  createDefaultTransaction,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  getBuyT22SplInstructionAsync,
  TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER,
  TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH,
} from '../../src/index.js';
import {
  assertTcompNoop,
  BASIS_POINTS,
  BROKER_FEE_PCT,
  COMPUTE_500K_IX,
  expectCustomError,
  HUNDRED_PCT,
  MAKER_BROKER_FEE_PCT,
  TAKER_FEE_BPS,
  TestAction,
} from '../_common.js';
import { setupT22Test } from './_common.js';

test('it can buy an NFT w/ a SPL token', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
    splMint,
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const nftUpdateAuthorityCurrencyAta = await createAta({
    client,
    payer,
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: payer,
    buyer: buyer.address,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorAtas: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
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
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
  });
});

test('it can buy with a cosigner', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
    splMint,
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
    useCosigner: true,
  });
  const { payer, buyer, nftOwner, nftUpdateAuthority, cosigner } = signers;
  const { mint, extraAccountMetas } = nft;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: payer,
    buyer: buyer.address,
    cosigner,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorAtas: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
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
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
  });
});

test('it cannot buy an NFT with a lower amount', async (t) => {
  const {
    client,
    signers,
    nft,
    price: listingPrice,
    splMint,
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, buyer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer: payer,
    buyer: buyer.address,
    maxAmount: listingPrice - 1n,
    creators: [nftUpdateAuthority.address],
    creatorAtas: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  const promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
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
    splMint,
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
    useCosigner: true,
  });
  const { payer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  let buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    // Missing cosigner!
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorAtas: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  let promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER);

  const fakeCosigner = await generateKeyPairSigner();

  // When a buyer buys the NFT.
  buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    cosigner: fakeCosigner, // Invalid cosigner
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorAtas: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  promise = pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
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
    splMint,
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorAtas: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  const sig = await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(buyIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  assertTcompNoop(t, client, sig);
});

test('SPL fees are paid correctly', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
    splMint,
    feeVault,
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, nftOwner, nftUpdateAuthority } = signers;
  const { mint, extraAccountMetas, sellerFeeBasisPoints } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [feeVaultCurrencyAta] = await findAtaPda({
    owner: feeVault,
    mint: splMint!,
  });

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorAtas: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
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

  // The buyer has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
  });

  const feeVaultBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(feeVaultCurrencyAta).send()).value
      .uiAmount!
  );

  const creatorBalance = BigInt(
    (
      await client.rpc
        .getTokenAccountBalance(nftUpdateAuthorityCurrencyAta)
        .send()
    ).value.uiAmount!
  );

  // Fee vault gets entire protocol fee because no maker or taker brokers are set.
  t.assert(feeVaultBalance === (listingPrice * TAKER_FEE_BPS) / BASIS_POINTS);

  // Royalties are paid to the creator ATA.
  t.assert(
    creatorBalance ===
      BigInt(listingPrice * sellerFeeBasisPoints) / BASIS_POINTS
  );
});

test('maker and taker brokers receive correct split', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
    splMint,
    feeVault,
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
    useMakerBroker: true,
  });
  const { payer, nftOwner, nftUpdateAuthority, makerBroker, takerBroker } =
    signers;
  const { mint, extraAccountMetas } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  const [feeVaultCurrencyAta] = await findAtaPda({
    owner: feeVault,
    mint: splMint!,
  });
  const [makerBrokerCurrencyAta] = await findAtaPda({
    owner: makerBroker.address,
    mint: splMint,
  });
  const [takerBrokerCurrencyAta] = await findAtaPda({
    owner: takerBroker.address,
    mint: splMint,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    makerBroker: makerBroker.address,
    takerBroker: takerBroker.address,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorAtas: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
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

  // The buyer has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
  });

  const feeVaultBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(feeVaultCurrencyAta).send()).value
      .uiAmount!
  );

  const makerBrokerBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(makerBrokerCurrencyAta).send())
      .value.uiAmount!
  );

  const takerBrokerBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(takerBrokerCurrencyAta).send())
      .value.uiAmount!
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
  t.assert(feeVaultBalance === protocolFee);

  t.assert(makerBrokerBalance === makerBrokerFee);

  // Taker broker receives whatever is left of the protocol fee.
  t.assert(takerBrokerBalance === takerBrokerFee);
});

test('taker broker receives correct split even if maker broker is not set', async (t) => {
  const {
    client,
    signers,
    nft,
    state: listing,
    price: listingPrice,
    splMint,
    feeVault,
  } = await setupT22Test({
    t,
    action: TestAction.List,
    useSplToken: true,
  });
  const { payer, nftOwner, nftUpdateAuthority, takerBroker } = signers;
  const { mint, extraAccountMetas } = nft;
  const buyer = payer;

  if (!splMint) {
    throw new Error('splMint is undefined');
  }

  const [nftUpdateAuthorityCurrencyAta] = await findAtaPda({
    mint: splMint,
    owner: nftUpdateAuthority.address,
  });

  const [feeVaultCurrencyAta] = await findAtaPda({
    owner: feeVault,
    mint: splMint!,
  });
  const [takerBrokerCurrencyAta] = await findAtaPda({
    owner: takerBroker.address,
    mint: splMint,
  });

  // When a buyer buys the NFT.
  const buyIx = await getBuyT22SplInstructionAsync({
    mint,
    currency: splMint,
    owner: nftOwner.address,
    payer,
    buyer: buyer.address,
    takerBroker: takerBroker.address,
    maxAmount: listingPrice,
    creators: [nftUpdateAuthority.address],
    creatorAtas: [nftUpdateAuthorityCurrencyAta],
    transferHookAccounts: extraAccountMetas.map((a) => a.address),
  });

  await pipe(
    await createDefaultTransaction(client, buyer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
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

  // The buyer has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: buyer.address,
    tokenProgramAddress: TOKEN22_PROGRAM_ID,
  });

  const feeVaultBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(feeVaultCurrencyAta).send()).value
      .uiAmount!
  );

  const takerBrokerBalance = BigInt(
    (await client.rpc.getTokenAccountBalance(takerBrokerCurrencyAta).send())
      .value.uiAmount!
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

  // Fee vault receives it's split of the protocol fee and also the maker broker fee since it's not set.
  t.assert(feeVaultBalance === protocolFee + makerBrokerFee);

  // Taker broker still receives its share.
  t.assert(takerBrokerBalance === takerBrokerFee);
});
