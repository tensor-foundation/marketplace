import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  generateKeyPairSigner,
  getAddressDecoder,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  createWnsNftInGroup,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TENSOR_ERROR__INSUFFICIENT_BALANCE,
  TOKEN22_PROGRAM_ID,
  TSWAP_SINGLETON,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  Field,
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidWnsInstructionAsync,
  Target,
  TENSOR_MARKETPLACE_ERROR__BID_EXPIRED,
  TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID,
} from '../../src/index.js';
import {
  APPROVE_ACCOUNT_RENT_LAMPORTS,
  assertTokenNftOwnedBy,
  ATA_RENT_LAMPORTS,
  BASIS_POINTS,
  COMPUTE_500K_IX,
  createWhitelistV2,
  DEFAULT_SFBP,
  expectCustomError,
  initTswap,
  LAMPORTS_PER_SOL,
  sleep,
  TAKER_FEE_BPS,
  upsertMintProof,
} from '../_common.js';
import {
  intoAddress,
  Mode,
  TENSOR_WHITELIST_ERROR__BAD_MINT_PROOF,
} from '@tensor-foundation/whitelist';
import { generateTreeOfSize } from '../_merkle.js';
import {
  findMarginAccountPda,
  getDepositMarginAccountInstructionAsync,
  getInitMarginAccountInstructionAsync,
} from '@tensor-foundation/escrow';

test('it can take a bid on a WNS collection', async (t) => {
  const client = createDefaultSolanaClient();

  const payer = await generateKeyPairSignerWithSol(client);
  const nftUpdateAuthority = await generateKeyPairSignerWithSol(client);
  const bidOwner = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creatorKeypair = await generateKeyPairSignerWithSol(client);

  const sellerFeeBasisPoints = 100n;
  const price = 500_000_000n;

  // Mint NFT
  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer,
    owner: seller.address,
    authority: nftUpdateAuthority,
    data: {
      name: 'Test NFT',
      symbol: 'TNFT',
      uri: 'https://tensor.foundation/',
      royaltyBasisPoints: Number(sellerFeeBasisPoints),
      creators: [{ address: nftUpdateAuthority.address, share: 100 }],
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
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    rentDestination: payer.address,
    owner: bidOwner.address, // Bid owner--the buyer
    seller, // NFT holder--the seller
    mint,
    mintProof,
    whitelist,
    bidState,
    distribution,
    collection: group,
    minAmount: price,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
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
        ATA_RENT_LAMPORTS -
        APPROVE_ACCOUNT_RENT_LAMPORTS
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
  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer,
    owner: seller.address,
    authority: nftUpdateAuthority,
    data: {
      name: 'Test NFT',
      symbol: 'TNFT',
      uri: 'https://tensor.foundation/',
      royaltyBasisPoints: Number(sellerFeeBasisPoints),
      creators: [{ address: nftUpdateAuthority.address, share: 100 }],
    },
  });

  // Mint other NFT
  const { mint: otherMint } = await createWnsNftInGroup({
    client,
    payer,
    owner: seller.address,
    authority: nftUpdateAuthority,
    data: {
      name: 'Test NFT',
      symbol: 'TNFT',
      uri: 'https://tensor.foundation/',
      royaltyBasisPoints: Number(sellerFeeBasisPoints),
      creators: [{ address: nftUpdateAuthority.address, share: 100 }],
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

  // NFT mint does not match the mint proof.
  let takeBidIx = await getTakeBidWnsInstructionAsync({
    rentDestination: payer.address,
    owner: bidOwner.address, // Bid owner--the buyer
    seller, // NFT holder--the seller
    mint: otherMint,
    distribution,
    mintProof,
    collection: group,
    whitelist,
    bidState,
    minAmount: price,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
  });

  let promise = pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_WHITELIST_ERROR__BAD_MINT_PROOF);

  // Mint matches mint proof, but whitelist does not match.
  takeBidIx = await getTakeBidWnsInstructionAsync({
    rentDestination: payer.address,
    owner: bidOwner.address, // Bid owner--the buyer
    seller, // NFT holder--the seller
    mint: otherMint, // correct mint for mint proof, but wrong whitelist
    mintProof: otherMintProof,
    whitelist,
    bidState,
    distribution,
    collection: group,
    minAmount: price,
    tokenProgram: TOKEN22_PROGRAM_ID,
    creators: [nftUpdateAuthority.address],
  });

  promise = pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(COMPUTE_500K_IX, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, promise, TENSOR_WHITELIST_ERROR__BAD_MINT_PROOF);
});

test('it has to match the name field if set', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);
  const correctName = 'TestAsset';
  const incorrectName = 'test';

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: seller,
    owner: seller.address,
    authority: authority,
    data: {
      name: correctName,
      symbol: 'TNFT',
      uri: 'https://tensor.foundation/',
      royaltyBasisPoints: Number(DEFAULT_SFBP),
      creators: [{ address: authority.address, share: 100 }],
    },
  });

  const {
    mint: mint2,
    group: group2,
    distribution: distribution2,
  } = await createWnsNftInGroup({
    client,
    payer: seller,
    owner: seller.address,
    authority: authority,
    data: {
      name: incorrectName,
      symbol: 'TNFT',
      uri: 'https://tensor.foundation/',
      royaltyBasisPoints: Number(DEFAULT_SFBP),
      creators: [{ address: authority.address, share: 100 }],
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
    amount: LAMPORTS_PER_SOL / 2n,
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
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint: mint2,
    mintProof: mintProof2,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    tokenProgram: TOKEN22_PROGRAM_ID,
    distribution: distribution2,
    collection: group2,
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID);

  // When the seller takes the bid with the correct mint...
  const takeBidIx2 = await getTakeBidWnsInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    mintProof,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    tokenProgram: TOKEN22_PROGRAM_ID,
    distribution,
    collection: group,
  });

  const tx2 = await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed
  t.is(typeof tx2, 'string');
});

test('it cannot take an expired bid', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: seller,
    owner: seller.address,
    authority: authority,
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
    amount: LAMPORTS_PER_SOL / 2n,
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
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    mintProof,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    tokenProgram: TOKEN22_PROGRAM_ID,
    distribution,
    collection: group,
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
  await initTswap(client);

  const { mint, group, distribution } = await createWnsNftInGroup({
    client,
    payer: seller,
    owner: seller.address,
    authority: authority,
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
  const takeBidIx = await getTakeBidWnsInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    mint,
    mintProof,
    minAmount: price,
    bidState,
    //(!)
    sharedEscrow: marginAccount,
    tokenProgram: TOKEN22_PROGRAM_ID,
    distribution,
    collection: group,
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  await expectCustomError(t, tx, TENSOR_ERROR__INSUFFICIENT_BALANCE);
});
