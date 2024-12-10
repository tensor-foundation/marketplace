import {
  appendTransactionMessageInstruction,
  generateKeyPairSigner,
  getAddressDecoder,
  none,
  pipe,
  some,
} from '@solana/web3.js';
import {
  Collection,
  Creator,
  MetadataArgs,
  makeLeaf,
  makeTree,
  mintCNft,
  sparseMerkleTreeFromLeaves,
  verifyCNft,
  verifyCNftCreator,
} from '@tensor-foundation/mpl-bubblegum';
import {
  LAMPORTS_PER_SOL,
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import { Mode } from '@tensor-foundation/whitelist';
import test from 'ava';
import {
  Field,
  TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID,
  Target,
  fetchMaybeBidState,
  findBidStatePda,
  getBidInstructionAsync,
  getTakeBidCompressedFullMetaInstructionAsync,
} from '../../src/index.js';
import { createWhitelistV2, expectCustomError } from '../_common.js';
import { computeIx } from '../legacy/_common.js';

test('FVC + Name: it rejects an NFT with wrong name', async (t) => {
  t.timeout(20000);
  const client = createDefaultSolanaClient();
  const owner = await generateKeyPairSignerWithSol(
    client,
    2n * LAMPORTS_PER_SOL
  );
  const bidder = await generateKeyPairSignerWithSol(
    client,
    2n * LAMPORTS_PER_SOL
  );
  const creatorKeypair = await generateKeyPairSignerWithSol(
    client,
    2n * LAMPORTS_PER_SOL
  );
  const treeOwner = await generateKeyPairSignerWithSol(
    client,
    2n * LAMPORTS_PER_SOL
  );
  const unverifiedCollection = (await generateKeyPairSigner()).address;

  const correctName = 'Name';
  const incorrectName = 'name';

  const DEFAULT_DEPTH_SIZE = {
    maxDepth: 3,
    maxBufferSize: 8,
  };

  const creator = {
    address: creatorKeypair.address,
    verified: false,
    share: 100,
  } as Creator;

  const merkleTree = await makeTree({
    client,
    treeOwner: treeOwner,
    canopyDepth: 0,
    depthSizePair: DEFAULT_DEPTH_SIZE,
  });

  const cnftMetadataArgs: MetadataArgs = {
    name: 'WILLGETREPLACED',
    symbol: 'DUMMY',
    uri: 'dummyUri',
    sellerFeeBasisPoints: 0,
    primarySaleHappened: false,
    isMutable: true,
    collection: some({
      key: unverifiedCollection,
      verified: false,
    } as Collection),
    editionNonce: none(),
    tokenStandard: some(0),
    uses: none(),
    creators: [creator],
    tokenProgramVersion: 0,
  };

  const correctMetadataUnverifiedCreator = {
    ...cnftMetadataArgs,
    name: correctName,
  };

  const incorrectMetadataUnverifiedCreator = {
    ...cnftMetadataArgs,
    name: incorrectName,
  };

  const correctMetadataVerifiedCreator = {
    ...correctMetadataUnverifiedCreator,
    creators: [{ ...creator, verified: true }],
  };

  const incorrectMetadataVerifiedCreator = {
    ...incorrectMetadataUnverifiedCreator,
    creators: [{ ...creator, verified: true }],
  };

  // mint an cNFT with the incorrect name
  await mintCNft({
    client,
    merkleTree,
    metadata: incorrectMetadataUnverifiedCreator,
    treeOwner: treeOwner,
    receiver: owner.address,
    unverifiedCollection: true,
  });

  const { leaf: leafUnverified } = await makeLeaf({
    merkleTree,
    index: 0,
    metadata: incorrectMetadataUnverifiedCreator,
    owner: owner.address,
  });
  let memTree = sparseMerkleTreeFromLeaves(
    [leafUnverified],
    DEFAULT_DEPTH_SIZE.maxDepth
  );
  const proofUnverifiedLeaf = memTree.getProof(
    0,
    true,
    DEFAULT_DEPTH_SIZE.maxDepth,
    false
  ).proof;

  await verifyCNftCreator({
    client,
    index: 0,
    merkleTree,
    metadata: incorrectMetadataUnverifiedCreator,
    owner: owner.address,
    payer: owner,
    proof: proofUnverifiedLeaf.map((address) =>
      getAddressDecoder().decode(address)
    ),
    verifiedCreator: creatorKeypair,
  });

  const { leaf: leafVerified } = await makeLeaf({
    merkleTree,
    index: 0,
    metadata: incorrectMetadataVerifiedCreator,
    owner: owner.address,
  });

  // Recalc proof
  memTree = sparseMerkleTreeFromLeaves(
    [leafVerified],
    DEFAULT_DEPTH_SIZE.maxDepth
  );
  const proofVerifiedLeaf = memTree.getProof(
    0,
    true,
    DEFAULT_DEPTH_SIZE.maxDepth,
    false
  ).proof;

  const { leaf: verifiedLeafIncorrectName } = await verifyCNft({
    client,
    index: 0,
    merkleTree,
    metadata: incorrectMetadataVerifiedCreator,
    owner: owner.address,
    payer: owner,
    proof: proofVerifiedLeaf.map((address) =>
      getAddressDecoder().decode(address)
    ),
  });

  await mintCNft({
    client,
    merkleTree,
    metadata: correctMetadataUnverifiedCreator,
    treeOwner: treeOwner,
    receiver: owner.address,
    unverifiedCollection: true,
  });

  const { leaf: leafCorrectNameUnverified } = await makeLeaf({
    merkleTree,
    index: 1,
    metadata: correctMetadataUnverifiedCreator,
    owner: owner.address,
  });

  memTree = sparseMerkleTreeFromLeaves(
    [leafVerified, leafCorrectNameUnverified],
    DEFAULT_DEPTH_SIZE.maxDepth
  );
  const proofCorrectNameUnverifiedLeaf = memTree.getProof(
    1,
    true,
    DEFAULT_DEPTH_SIZE.maxDepth,
    false
  ).proof;

  await verifyCNftCreator({
    client,
    index: 1,
    merkleTree,
    metadata: correctMetadataUnverifiedCreator,
    owner: owner.address,
    payer: owner,
    proof: proofCorrectNameUnverifiedLeaf.map((address) =>
      getAddressDecoder().decode(address)
    ),
    verifiedCreator: creatorKeypair,
  });

  memTree = sparseMerkleTreeFromLeaves(
    [leafVerified, leafCorrectNameUnverified],
    DEFAULT_DEPTH_SIZE.maxDepth
  );
  const proofCorrectNameVerifiedLeaf = memTree.getProof(
    1,
    true,
    DEFAULT_DEPTH_SIZE.maxDepth,
    false
  ).proof;

  const { leaf: verifiedLeafCorrectName } = await verifyCNft({
    client,
    index: 1,
    merkleTree,
    metadata: correctMetadataVerifiedCreator,
    owner: owner.address,
    payer: owner,
    proof: proofCorrectNameVerifiedLeaf.map((address) =>
      getAddressDecoder().decode(address)
    ),
  });

  memTree = sparseMerkleTreeFromLeaves(
    [verifiedLeafIncorrectName, verifiedLeafCorrectName],
    DEFAULT_DEPTH_SIZE.maxDepth
  );
  const root = memTree.root;

  // Get final proofs
  const proofForIncorrectLeaf = memTree.getProof(
    0,
    true,
    DEFAULT_DEPTH_SIZE.maxDepth,
    false
  ).proof;
  const proofForCorrectLeaf = memTree.getProof(
    1,
    true,
    DEFAULT_DEPTH_SIZE.maxDepth,
    false
  ).proof;

  // Create a whitelist
  const { whitelist } = await createWhitelistV2({
    client,
    updateAuthority: creatorKeypair,
    conditions: [{ mode: Mode.FVC, value: creator.address }],
  });

  // Create a bid with the correct name as fieldId
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

  // Try taking the bid with the incorrect named NFT
  const takeBidIx = await getTakeBidCompressedFullMetaInstructionAsync({
    seller: owner,
    index: 0,
    proof: proofForIncorrectLeaf.map((proof) => {
      return getAddressDecoder().decode(new Uint8Array(proof));
    }),
    merkleTree,
    bidState,
    owner: bidder.address,
    whitelist,
    root,
    ...incorrectMetadataVerifiedCreator,
    tokenStandard: some(0),
    uses: none(),
    tokenProgramVersion: 0,
    creatorShares: new Uint8Array([100]),
    creatorVerified: [true],
    creators: [[creator.address, creator.share]],
    minAmount: 0,
  });

  const tx = pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(computeIx, tx),
    (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  await expectCustomError(t, tx, TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID);

  // But taking the bid with the correct named NFT should work
  const takeBidIxCorrect = await getTakeBidCompressedFullMetaInstructionAsync({
    seller: owner,
    index: 1,
    proof: proofForCorrectLeaf.map((proof) => {
      return getAddressDecoder().decode(new Uint8Array(proof));
    }),
    merkleTree,
    bidState,
    owner: bidder.address,
    whitelist,
    root,
    ...correctMetadataVerifiedCreator,
    tokenStandard: some(0),
    uses: none(),
    tokenProgramVersion: 0,
    creatorShares: new Uint8Array([100]),
    creatorVerified: [true],
    creators: [[creator.address, creator.share]],
    minAmount: 0,
  });

  await pipe(
    await createDefaultTransaction(client, owner),
    (tx) => appendTransactionMessageInstruction(takeBidIxCorrect, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // ... and the bid state should be closed
  const maybeBidState = await fetchMaybeBidState(client.rpc, bidState);
  t.is(maybeBidState.exists, false);
});
