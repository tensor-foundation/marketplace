import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  generateKeyPairSigner,
  getAddressDecoder,
  pipe,
  SOLANA_ERROR__INSTRUCTION_ERROR__NOT_ENOUGH_ACCOUNT_KEYS,
} from '@solana/web3.js';
import {
  findMarginAccountPda,
  getDepositMarginAccountInstructionAsync,
  getInitMarginAccountInstructionAsync,
} from '@tensor-foundation/escrow';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  createT22NftWithRoyalties,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TENSOR_ERROR__INSUFFICIENT_BALANCE,
  TOKEN22_PROGRAM_ID,
  TSWAP_SINGLETON,
} from '@tensor-foundation/test-helpers';
import {
  intoAddress,
  Mode,
  TENSOR_WHITELIST_ERROR__BAD_MINT_PROOF,
} from '@tensor-foundation/whitelist';
import test from 'ava';
import {
  Field,
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidT22InstructionAsync,
  Target,
  TENSOR_MARKETPLACE_ERROR__BID_EXPIRED,
  TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID,
} from '../../src/index.js';
import {
  assertTokenNftOwnedBy,
  ATA_RENT_LAMPORTS,
  BASIS_POINTS,
  COMPUTE_500K_IX,
  createWhitelistV2,
  expectCustomError,
  expectGenericError,
  initTswap,
  LAMPORTS_PER_SOL,
  sleep,
  TAKER_FEE_BPS,
  upsertMintProof,
} from '../_common.js';
import { generateTreeOfSize } from '../_merkle.js';

test('it can take a bid on a T22 collection', async (t) => {
  const client = createDefaultSolanaClient();

  const payer = await generateKeyPairSignerWithSol(client);
  const nftUpdateAuthority = await generateKeyPairSignerWithSol(client);
  const bidOwner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creatorKeypair = await generateKeyPairSignerWithSol(client);

  const sellerFeeBasisPoints = 1000n;
  const price = 500_000_000n;
  const minPrice =
    price - (price * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;

  // Mint NFT
  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
    client,
    payer,
    owner: seller.address,
    mintAuthority: nftUpdateAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + nftUpdateAuthority.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });

  // Setup a merkle tree with our mint as a leaf
  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  // Create whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.MerkleTree, value: intoAddress(root) }],
  });

  // Create the mint proof for the whitelist.
  const { mintProof } = await upsertMintProof({
    client,
    payer,
    mint,
    whitelist,
    proof: p.proof,
  });

  // Create collection bid
  const bidId = (await generateKeyPairSigner()).address;
  const bidIx = await getBidInstructionAsync({
    rentPayer: payer,
    owner: bidOwner,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidOwner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [bidState] = await findBidStatePda({
    owner: bidOwner.address,
    bidId,
  });

  const preSellerBalance = (await client.rpc.getBalance(seller.address).send())
    .value;

  // When the seller takes the bid.
  const takeBidIx = await getTakeBidT22InstructionAsync({
    rentDestination: payer.address,
    owner: bidOwner.address, // Bid owner--the buyer
    seller, // NFT holder--the seller
    mint,
    mintProof,
    whitelist,
    bidState,
    minAmount: minPrice,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
    transferHookAccounts: extraAccountMetas.map((meta) => meta.address),
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Then the bid state should not exist.
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);

  // And the bid owner has the NFT.
  await assertTokenNftOwnedBy({
    t,
    client,
    mint,
    owner: bidOwner.address,
    tokenProgram: TOKEN22_PROGRAM_ID,
  });

  // And the seller received the price minus fees: taker fee, royalties and ATA rent.
  const postSellerBalance = (await client.rpc.getBalance(seller.address).send())
    .value;

  t.assert(
    postSellerBalance ===
      preSellerBalance +
        price -
        (price * TAKER_FEE_BPS) / BASIS_POINTS -
        (price * sellerFeeBasisPoints) / BASIS_POINTS -
        ATA_RENT_LAMPORTS
  );
});

test('seller cannot sell invalid mint into collection bid', async (t) => {
  const client = createDefaultSolanaClient();

  const payer = await generateKeyPairSignerWithSol(client);
  const nftUpdateAuthority = await generateKeyPairSignerWithSol(client);
  const bidOwner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creatorKeypair = await generateKeyPairSignerWithSol(client);

  const sellerFeeBasisPoints = 1000n;

  const price = 500_000_000n;

  // Mint NFT
  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
    client,
    payer,
    owner: seller.address,
    mintAuthority: nftUpdateAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + nftUpdateAuthority.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });

  // Mint other NFT
  const { mint: otherMint } = await createT22NftWithRoyalties({
    client,
    payer,
    owner: seller.address,
    mintAuthority: nftUpdateAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + nftUpdateAuthority.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });

  // Setup a merkle tree with our mint as a leaf
  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  // Create whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.MerkleTree, value: intoAddress(root) }],
  });

  // Create the mint proof for the whitelist.
  const { mintProof } = await upsertMintProof({
    client,
    payer,
    mint,
    whitelist,
    proof: p.proof,
  });

  // Setup a second merkle tree with our other mint as a leaf
  const {
    root: otherRoot,
    proofs: [otherP],
  } = await generateTreeOfSize(10, [otherMint]);

  // Create other whitelist
  const { whitelist: otherWhitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.MerkleTree, value: intoAddress(otherRoot) }],
  });

  // Create the mint proof for the whitelist.
  const { mintProof: otherMintProof } = await upsertMintProof({
    client,
    payer,
    mint: otherMint,
    whitelist: otherWhitelist,
    proof: otherP.proof,
  });

  // Create collection bid
  const bidId = (await generateKeyPairSigner()).address;
  const bidIx = await getBidInstructionAsync({
    rentPayer: payer,
    owner: bidOwner,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidOwner),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  const [bidState] = await findBidStatePda({
    owner: bidOwner.address,
    bidId,
  });

  const minAmount =
    price - (price * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;

  // NFT mint does not match the mint proof.
  let takeBidIx = await getTakeBidT22InstructionAsync({
    rentDestination: payer.address,
    owner: bidOwner.address, // Bid owner--the buyer
    seller, // NFT holder--the seller
    mint: otherMint, // wrong mint
    mintProof,
    whitelist,
    bidState,
    minAmount,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
    transferHookAccounts: extraAccountMetas.map((meta) => meta.address),
  });

  let promise = pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_WHITELIST_ERROR__BAD_MINT_PROOF);

  // Mint matches mint proof, but whitelist does not match.
  takeBidIx = await getTakeBidT22InstructionAsync({
    rentDestination: payer.address,
    owner: bidOwner.address, // Bid owner--the buyer
    seller, // NFT holder--the seller
    mint: otherMint, // correct mint for mint proof, but wrong whitelist
    mintProof: otherMintProof,
    whitelist,
    bidState,
    minAmount,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
    transferHookAccounts: extraAccountMetas.map((meta) => meta.address),
  });

  promise = pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_WHITELIST_ERROR__BAD_MINT_PROOF);
});

test('it has to specify creators', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);
  const notCreator = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);

  const sellerFeeBasisPoints = 1000n;
  const price = LAMPORTS_PER_SOL / 2n;
  const minAmount =
    price - (price * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;

  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
    client,
    payer: seller,
    owner: seller.address,
    mintAuthority: authority,
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

  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creator,
    conditions: [{ mode: Mode.MerkleTree, value: intoAddress(root) }],
  });

  const { mintProof } = await upsertMintProof({
    client,
    payer: seller,
    mint,
    whitelist,
    proof: p.proof,
  });

  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });

  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid without specifying creators...
  const takeBidIx = await getTakeBidT22InstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    mintProof,
    minAmount,
    bidState,
    creators: [],
    tokenProgram: TOKEN22_PROGRAM_ID,
    transferHookAccounts: extraAccountMetas.map((meta) => meta.address),
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail with a generic error
  await expectGenericError(
    t,
    tx,
    SOLANA_ERROR__INSTRUCTION_ERROR__NOT_ENOUGH_ACCOUNT_KEYS
  );

  // When the seller takes the bid with an incorrect creator...
  const takeBidIx2 = await getTakeBidT22InstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    mintProof,
    minAmount,
    bidState,
    creators: [notCreator.address],
    tokenProgram: TOKEN22_PROGRAM_ID,
    transferHookAccounts: extraAccountMetas.map((meta) => meta.address),
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail with a generic error again
  await expectGenericError(
    t,
    tx2,
    SOLANA_ERROR__INSTRUCTION_ERROR__NOT_ENOUGH_ACCOUNT_KEYS
  );

  // When the seller takes the bid with the correct creator...
  const takeBidIx3 = await getTakeBidT22InstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    mintProof,
    minAmount,
    bidState,
    creators: [creator.address],
    tokenProgram: TOKEN22_PROGRAM_ID,
    transferHookAccounts: extraAccountMetas.map((meta) => meta.address),
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('it has to match the name field if set', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);
  const sellerFeeBasisPoints = 1000n;
  const correctName = 'TestAsset';
  const incorrectName = 'test';

  const amount = LAMPORTS_PER_SOL / 2n;
  const minAmount =
    amount - (amount * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;

  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
    client,
    payer: seller,
    owner: seller.address,
    mintAuthority: authority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: correctName,
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + authority.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });

  const { mint: mint2, extraAccountMetas: extraAccountMetas2 } =
    await createT22NftWithRoyalties({
      client,
      payer: seller,
      owner: seller.address,
      mintAuthority: authority,
      freezeAuthority: null,
      decimals: 0,
      data: {
        name: incorrectName,
        symbol: 'TT',
        uri: 'https://example.com',
      },
      royalties: {
        key: '_ro_' + authority.address,
        value: sellerFeeBasisPoints.toString(),
      },
    });

  const {
    root,
    proofs: [p, otherP],
  } = await generateTreeOfSize(10, [mint, mint2]);

  // Create Whitelist including both mints
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: authority,
    conditions: [{ mode: Mode.MerkleTree, value: intoAddress(root) }],
  });

  // Upsert Mint Proof for both mints
  const { mintProof } = await upsertMintProof({
    client,
    payer: seller,
    mint,
    whitelist,
    proof: p.proof,
  });

  const { mintProof: mintProof2 } = await upsertMintProof({
    client,
    payer: seller,
    mint: mint2,
    whitelist,
    proof: otherP.proof,
  });

  // Create Bid
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount,
    target: Target.Whitelist,
    targetId: whitelist,
    // (!)
    field: Field.Name,
    fieldId: getAddressDecoder().decode(
      new TextEncoder()
        .encode(correctName)
        .slice(0, 32)
        .reduce((arr, byte, i) => {
          arr[i] = byte;
          return arr;
        }, new Uint8Array(32))
    ),
    bidId,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid with the incorrect named mint...
  const takeBidIx = await getTakeBidT22InstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mint2,
    mintProof: mintProof2,
    minAmount,
    bidState,
    creators: [authority.address],
    tokenProgram: TOKEN22_PROGRAM_ID,
    transferHookAccounts: extraAccountMetas2.map((meta) => meta.address),
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID);

  // When the seller takes the bid with the correct mint...
  const takeBidIx2 = await getTakeBidT22InstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    mintProof,
    minAmount,
    bidState,
    creators: [authority.address],
    tokenProgram: TOKEN22_PROGRAM_ID,
    transferHookAccounts: extraAccountMetas.map((meta) => meta.address),
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed and the bid should be closed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('it cannot take an expired bid', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);
  const sellerFeeBasisPoints = 1000n;
  const amount = LAMPORTS_PER_SOL / 2n;
  const minAmount =
    amount - (amount * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;

  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
    client,
    payer: seller,
    owner: seller.address,
    mintAuthority: authority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + authority.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });

  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: authority,
    conditions: [{ mode: Mode.MerkleTree, value: intoAddress(root) }],
  });

  const { mintProof } = await upsertMintProof({
    client,
    payer: seller,
    mint,
    whitelist,
    proof: p.proof,
  });

  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });

  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
    expireInSec: 1n,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Sleep for 5 seconds to let the bid expire
  await sleep(5000);

  // When the seller tries to take the bid...
  const takeBidIx = await getTakeBidT22InstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    mintProof,
    minAmount,
    bidState,
    creators: [authority.address],
    tokenProgram: TOKEN22_PROGRAM_ID,
    transferHookAccounts: extraAccountMetas.map((meta) => meta.address),
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__BID_EXPIRED);
});

test('it cannot take a bid when the escrow balance is insufficient', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);
  const price = LAMPORTS_PER_SOL / 4n;
  const sellerFeeBasisPoints = 1000n;
  const minAmount =
    price - (price * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;
  await initTswap(client);

  const { mint, extraAccountMetas } = await createT22NftWithRoyalties({
    client,
    payer: seller,
    owner: seller.address,
    mintAuthority: authority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + authority.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });

  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(10, [mint]);

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: authority,
    conditions: [{ mode: Mode.MerkleTree, value: intoAddress(root) }],
  });

  const { mintProof } = await upsertMintProof({
    client,
    payer: seller,
    mint,
    whitelist,
    proof: p.proof,
  });

  // Create Escrow
  const marginAccount = (
    await findMarginAccountPda({
      owner: bidder.address,
      tswap: TSWAP_SINGLETON,
      marginNr: 0,
    })
  )[0];
  const escrowIx = await getInitMarginAccountInstructionAsync({
    owner: bidder,
    marginAccount,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(escrowIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Deposit SOL to escrow
  const depositIx = await getDepositMarginAccountInstructionAsync({
    owner: bidder,
    marginAccount,
    // (!) bidder deposits 1 lamports less than the bid amount
    lamports: price - 1n,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(depositIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Create Bid
  const bidId = (await generateKeyPairSigner()).address;
  const [bidState] = await findBidStatePda({
    owner: bidder.address,
    bidId,
  });
  const bidIx = await getBidInstructionAsync({
    owner: bidder,
    amount: price,
    target: Target.Whitelist,
    targetId: whitelist,
    bidId,
    //(!)
    sharedEscrow: marginAccount,
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller tries to take the bid...
  const takeBidIx = await getTakeBidT22InstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    mintProof,
    minAmount,
    bidState,
    //(!)
    sharedEscrow: marginAccount,
    creators: [authority.address],
    tokenProgram: TOKEN22_PROGRAM_ID,
    transferHookAccounts: extraAccountMetas.map((meta) => meta.address),
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  await expectCustomError(t, tx, TENSOR_ERROR__INSUFFICIENT_BALANCE);
});
