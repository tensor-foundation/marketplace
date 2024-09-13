import {
  appendTransactionMessageInstruction,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  createWnsNftInGroup,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidWnsInstructionAsync,
  Target,
} from '../../src/index.js';
import {
  APPROVE_ACCOUNT_RENT_LAMPORTS,
  assertTokenNftOwnedBy,
  ATA_RENT_LAMPORTS,
  BASIS_POINTS,
  COMPUTE_500K_IX,
  createWhitelistV2,
  expectCustomError,
  TAKER_FEE_BPS,
  upsertMintProof,
} from '../_common.js';
import {
  intoAddress,
  Mode,
  TENSOR_WHITELIST_ERROR__BAD_MINT_PROOF,
} from '@tensor-foundation/whitelist';
import { generateTreeOfSize } from '../_merkle.js';

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
  const { mint, distribution } = await createWnsNftInGroup({
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
  // Mint NFT
  const { mint, distribution } = await createWnsNftInGroup({
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
