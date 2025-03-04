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
  createDefaultAsset,
  createDefaultAssetWithCollection,
  fetchCollectionPlugin,
  PluginType,
  Royalties,
} from '@tensor-foundation/mpl-core';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  LAMPORTS_PER_SOL,
  signAndSendTransaction,
  TENSOR_ERROR__CREATOR_MISMATCH,
  TENSOR_ERROR__INSUFFICIENT_BALANCE,
  TENSOR_ERROR__INVALID_CORE_ASSET,
  TSWAP_SINGLETON,
} from '@tensor-foundation/test-helpers';
import {
  findMintProofV2Pda,
  getInitUpdateMintProofV2InstructionAsync,
  intoAddress,
  Mode,
  TENSOR_WHITELIST_ERROR__BAD_MINT_PROOF,
  TENSOR_WHITELIST_ERROR__FAILED_MERKLE_PROOF_VERIFICATION,
} from '@tensor-foundation/whitelist';
import test from 'ava';
import {
  Field,
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidCoreInstructionAsync,
  Target,
  TENSOR_MARKETPLACE_ERROR__BID_EXPIRED,
  TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID,
} from '../../src/index.js';
import {
  BASIS_POINTS,
  createWhitelistV2,
  expectCustomError,
  expectGenericError,
  initTswap,
  sleep,
} from '../_common.js';
import { generateTreeOfSize } from '../_merkle.js';

test('mint has to match the whitelist - VOC', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const basisPoints = 500;
  const price = LAMPORTS_PER_SOL / 2n;

  const [asset, collection] = await createDefaultAssetWithCollection({
    client,
    collectionAuthority: updateAuthority,
    owner: seller.address,
    payer: seller,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints,
    },
  });

  const [assetDifferentCollection] = await createDefaultAssetWithCollection({
    client,
    collectionAuthority: updateAuthority,
    owner: seller.address,
    payer: seller,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints,
    },
  });

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority,
    conditions: [{ mode: Mode.VOC, value: collection.address }],
  });

  // Create a collection bid
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

  const minAmount = price - (price * BigInt(basisPoints)) / BASIS_POINTS;

  // When the seller takes the bid with a mint of a different collection...
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: assetDifferentCollection.address,
    minAmount,
    bidState,
    creators: [creator.address],
    collection: collection.address,
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ...it should fail with the correct error
  await expectCustomError(t, tx, TENSOR_ERROR__INVALID_CORE_ASSET);

  // When the seller takes the bid with the correct mint...
  const takeBidIx2 = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: asset.address,
    minAmount,
    bidState,
    creators: [creator.address],
    collection: collection.address,
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('mint has to match the whitelist - rootHash', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);

  const mintInTree = await createDefaultAsset({
    client,
    payer: seller,
    owner: seller.address,
    authority: creator,
  });

  const mintNotInTree = await createDefaultAsset({
    client,
    payer: seller,
    owner: seller.address,
    authority: creator,
  });

  const {
    root,
    proofs: [p],
  } = await generateTreeOfSize(1, [mintInTree.address]);
  const proof = p;
  const conditions = [{ mode: Mode.MerkleTree, value: intoAddress(root) }];

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creator,
    conditions,
  });

  // Create a collection bid
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
  });

  await pipe(
    await createDefaultTransaction(client, bidder),
    (tx) => appendTransactionMessageInstruction(bidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Upsert mint proof for the mint in the tree...
  const [mintProofPdaInTree] = await findMintProofV2Pda({
    mint: mintInTree.address,
    whitelist,
  });

  const createMintProofIxInTree =
    await getInitUpdateMintProofV2InstructionAsync({
      payer: seller,
      mint: mintInTree.address,
      mintProof: mintProofPdaInTree,
      whitelist,
      proof: proof.proof,
    });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(createMintProofIxInTree, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // When the seller takes the bid with the mint not in the tree...
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: mintNotInTree.address,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail with the correct error
  await expectCustomError(
    t,
    tx,
    TENSOR_WHITELIST_ERROR__FAILED_MERKLE_PROOF_VERIFICATION
  );

  // This also fails when passing a real mintProof account (from a different mint)
  const takeBidIx2 = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: mintNotInTree.address,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
    mintProof: mintProofPdaInTree,
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  await expectCustomError(t, tx2, TENSOR_WHITELIST_ERROR__BAD_MINT_PROOF);

  // When the seller takes the bid with the mint in the tree (and thus whitelist)...
  const takeBidIxInTree = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: mintInTree.address,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [creator.address],
    mintProof: mintProofPdaInTree,
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIxInTree, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('it has to specify creators', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const creator = await generateKeyPairSignerWithSol(client);
  const notCreator = await generateKeyPairSignerWithSol(client);
  const updateAuthority = await generateKeyPairSignerWithSol(client);

  const basisPoints = 500;
  const price = LAMPORTS_PER_SOL / 2n;

  const [asset, collection] = await createDefaultAssetWithCollection({
    client,
    collectionAuthority: updateAuthority,
    owner: seller.address,
    payer: seller,
    royalties: {
      creators: [{ address: creator.address, percentage: 100 }],
      basisPoints,
    },
  });

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creator,
    conditions: [{ mode: Mode.VOC, value: collection.address }],
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

  const minAmount = price - (price * BigInt(basisPoints)) / BASIS_POINTS;

  // When the seller takes the bid without specifying creators...
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: asset.address,
    minAmount,
    bidState,
    creators: [],
    collection: collection.address,
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
  const takeBidIx2 = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: asset.address,
    minAmount,
    bidState,
    creators: [notCreator.address],
    collection: collection.address,
  });

  const tx2 = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail
  await expectCustomError(t, tx2, TENSOR_ERROR__CREATOR_MISMATCH);

  // When the seller takes the bid with the correct creator...
  const takeBidIx3 = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: asset.address,
    minAmount,
    bidState,
    creators: [creator.address],
    collection: collection.address,
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx3, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('it has to match the name field if set', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);

  const correctName = 'TestAsset';
  const incorrectName = 'test';
  const price = LAMPORTS_PER_SOL / 2n;
  const basisPoints = 500;

  const [correctMint, collection] = await createDefaultAssetWithCollection({
    client,
    payer: seller,
    owner: seller.address,
    name: correctName,
    collectionAuthority: authority,
  });

  const incorrectMint = await createDefaultAsset({
    client,
    payer: seller,
    authority: authority,
    owner: seller.address,
    name: incorrectName,
    // (!)
    collection: collection.address,
    royalties: {
      creators: [{ address: authority.address, percentage: 100 }],
      basisPoints,
    },
  });

  // Create Whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: authority,
    conditions: [{ mode: Mode.VOC, value: collection.address }],
  });

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

  const minAmount = price - (price * BigInt(basisPoints)) / BASIS_POINTS;

  // When the seller takes the bid with the incorrect mint...
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: incorrectMint.address,
    minAmount,
    bidState,
    creators: [authority.address],
    collection: collection.address,
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should fail
  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID);

  // When the seller takes the bid with the correct mint...
  const takeBidIx2 = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: correctMint.address,
    minAmount,
    bidState,
    creators: [authority.address],
    collection: collection.address,
  });

  await pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx2, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  // ...it should succeed
  t.false((await fetchEncodedAccount(client.rpc, bidState)).exists);
});

test('it cannot take an expired bid', async (t) => {
  const client = createDefaultSolanaClient();
  const bidder = await generateKeyPairSignerWithSol(client);
  const seller = await generateKeyPairSignerWithSol(client);
  const authority = await generateKeyPairSignerWithSol(client);

  const [mint, collection] = await createDefaultAssetWithCollection({
    client,
    payer: seller,
    owner: seller.address,
    collectionAuthority: authority,
  });

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: authority,
    conditions: [{ mode: Mode.VOC, value: collection.address }],
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
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: mint.address,
    minAmount: LAMPORTS_PER_SOL / 2n,
    bidState,
    creators: [authority.address],
    collection: collection.address,
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

  const [asset, collection] = await createDefaultAssetWithCollection({
    client,
    payer: seller,
    collectionAuthority: authority,
    owner: seller.address,
  });

  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: authority,
    conditions: [{ mode: Mode.VOC, value: collection.address }],
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

  const plugin = await fetchCollectionPlugin(
    client,
    collection.address,
    PluginType.Royalties
  );
  const royalties = plugin?.fields[0] as Royalties;
  const basisPoints = royalties?.basisPoints;

  const minAmount = price - (price * BigInt(basisPoints)) / BASIS_POINTS;

  // When the seller tries to take the bid...
  const takeBidIx = await getTakeBidCoreInstructionAsync({
    owner: bidder.address,
    seller,
    whitelist,
    asset: asset.address,
    minAmount,
    bidState,
    //(!)
    sharedEscrow: marginAccount,
    creators: [authority.address],
    collection: collection.address,
  });

  const tx = pipe(
    await createDefaultTransaction(client, seller),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );
  await expectCustomError(t, tx, TENSOR_ERROR__INSUFFICIENT_BALANCE);
});
