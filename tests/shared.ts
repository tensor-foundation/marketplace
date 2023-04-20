import {
  AddressLookupTableAccount,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  createCreateTreeInstruction,
  createMintV1Instruction,
  getLeafAssetId,
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  ConcurrentMerkleTreeAccount,
  createVerifyLeafIx,
  getConcurrentMerkleTreeAccountSize,
  MerkleTree,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ValidDepthSizePair,
} from "@solana/spl-account-compression";
import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum/dist/src/generated";
import {
  ACCT_NOT_EXISTS_ERR,
  buildAndSendTx,
  calcFees,
  createLUT,
  DEFAULT_DEPTH_SIZE,
  FEE_PCT,
  getLamports,
  tcompSdk,
  TEST_KEYPAIR,
  TEST_PROVIDER,
  withLamports,
} from "./utils";
import {
  CURRENT_TCOMP_VERSION,
  DEFAULT_COMPUTE_UNITS,
  DEFAULT_MICRO_LAMPORTS,
  findListStatePda,
  findTCompPda,
  findTreeAuthorityPda,
  getTotalComputeIxs,
  TAKER_BROKER_PCT,
} from "../src";
import { BN } from "@project-serum/anchor";
import {
  computeDataHash,
  Creator,
} from "../deps/metaplex-mpl/bubblegum/js/src";
import { keccak_256 } from "js-sha3";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { isNullLike, MINUTES } from "@tensor-hq/tensor-common";
import {
  getAccount,
  initCollection,
  makeNTraders,
  transferLamports,
} from "./account";

// Enables rejectedWith.
chai.use(chaiAsPromised);

export const makeTree = async ({
  conn = TEST_PROVIDER.connection,
  treeOwner,
  depthSizePair = DEFAULT_DEPTH_SIZE,
  canopyDepth = 0,
}: {
  conn?: Connection;
  treeOwner: Keypair;
  depthSizePair?: ValidDepthSizePair;
  canopyDepth?: number;
}) => {
  const owner = treeOwner.publicKey;

  const merkleTreeKeypair = Keypair.generate();
  const merkleTree = merkleTreeKeypair.publicKey;
  const space = getConcurrentMerkleTreeAccountSize(
    depthSizePair.maxDepth,
    depthSizePair.maxBufferSize,
    canopyDepth
  );
  const allocTreeIx = SystemProgram.createAccount({
    fromPubkey: owner,
    newAccountPubkey: merkleTree,
    lamports: await conn.getMinimumBalanceForRentExemption(space),
    space: space,
    programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  });
  const [treeAuthority, _bump] = findTreeAuthorityPda({ merkleTree });
  const createTreeIx = createCreateTreeInstruction(
    {
      merkleTree,
      treeAuthority,
      treeCreator: owner,
      payer: owner,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
    },
    {
      maxBufferSize: depthSizePair.maxBufferSize,
      maxDepth: depthSizePair.maxDepth,
      public: false,
    },
    BUBBLEGUM_PROGRAM_ID
  );

  await buildAndSendTx({
    ixs: [allocTreeIx, createTreeIx],
    extraSigners: [merkleTreeKeypair, treeOwner],
  });

  return {
    merkleTree,
  };
};

export const mintCNft = async ({
  treeOwner,
  receiver,
  metadata,
  merkleTree,
}: {
  treeOwner: Keypair;
  receiver: PublicKey;
  metadata: MetadataArgs;
  merkleTree: PublicKey;
}) => {
  const owner = treeOwner.publicKey;

  const [treeAuthority] = await findTreeAuthorityPda({ merkleTree });

  const mintIx = createMintV1Instruction(
    {
      merkleTree,
      treeAuthority,
      treeDelegate: owner,
      payer: owner,
      leafDelegate: receiver,
      leafOwner: receiver,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      logWrapper: SPL_NOOP_PROGRAM_ID,
    },
    {
      message: metadata,
    }
  );

  const sig = await buildAndSendTx({
    ixs: [mintIx],
    extraSigners: [treeOwner],
  });

  console.log("✅ minted", sig);
};

// TODO: temp patch over metaplex's code
export function computeCreatorHashPATCHED(creators: Creator[]) {
  const bufferOfCreatorData = Buffer.concat(
    creators.map((creator) => {
      return Buffer.concat([
        creator.address.toBuffer(),
        Buffer.from([creator.verified ? 1 : 0]),
        Buffer.from([creator.share]),
      ]);
    })
  );
  return Buffer.from(keccak_256.digest(bufferOfCreatorData));
}

// TODO: temp patch over metaplex's code
export function computeCompressedNFTHashPATCHED(
  assetId: PublicKey,
  owner: PublicKey,
  delegate: PublicKey,
  treeNonce: BN,
  metadata: MetadataArgs
): Buffer {
  const message = Buffer.concat([
    Buffer.from([0x1]), // All NFTs are version 1 right now
    assetId.toBuffer(),
    owner.toBuffer(),
    delegate.toBuffer(),
    treeNonce.toBuffer("le", 8),
    computeDataHash(metadata),
    computeCreatorHashPATCHED(metadata.creators),
  ]);

  return Buffer.from(keccak_256.digest(message));
}

export const verifyCNft = async ({
  conn = TEST_PROVIDER.connection,
  index,
  owner,
  delegate,
  merkleTree,
  metadata,
  proof,
}: {
  conn?: Connection;
  index: number;
  owner: PublicKey;
  delegate?: PublicKey;
  merkleTree: PublicKey;
  metadata: MetadataArgs;
  proof: Buffer[];
}) => {
  const accountInfo = await conn.getAccountInfo(merkleTree, {
    commitment: "confirmed",
  });
  const account = ConcurrentMerkleTreeAccount.fromBuffer(accountInfo!.data!);
  const { leaf, assetId } = await makeLeaf({
    index,
    owner,
    delegate,
    merkleTree,
    metadata,
  });
  const verifyLeafIx = createVerifyLeafIx(merkleTree, {
    root: account.getCurrentRoot(),
    leaf,
    leafIndex: index,
    proof,
  });

  const computeIxs = getTotalComputeIxs(
    DEFAULT_COMPUTE_UNITS,
    DEFAULT_MICRO_LAMPORTS
  );

  const sig = await buildAndSendTx({
    ixs: [...computeIxs, verifyLeafIx],
    extraSigners: [TEST_KEYPAIR],
  });
  console.log("✅ CNFT verified:", sig);

  return { leaf, assetId };
};

export const makeLeaf = async ({
  index,
  owner,
  delegate,
  merkleTree,
  metadata,
}: {
  index: number;
  owner: PublicKey;
  delegate?: PublicKey;
  merkleTree: PublicKey;
  metadata: MetadataArgs;
}) => {
  const nonce = new BN(index);
  const assetId = await getLeafAssetId(merkleTree, nonce);
  const leaf = computeCompressedNFTHashPATCHED(
    assetId,
    owner,
    delegate ?? owner,
    nonce,
    metadata
  );
  return {
    leaf,
    assetId,
  };
};

export const makeCNftMeta = ({
  nrCreators = 4,
  sellerFeeBasisPoints = 1000,
  collectionMint,
}: {
  nrCreators?: number;
  sellerFeeBasisPoints?: number;
  collectionMint?: PublicKey;
}): MetadataArgs => {
  if (nrCreators < 0 || nrCreators > 4) {
    throw new Error(
      "must be between 0 and 4 creators (yes 4 for compressed nfts)"
    );
  }

  return {
    name: "Compress me hard",
    symbol: "COMP",
    uri: "https://v6nul6vaqrzhjm7qkcpbtbqcxmhwuzvcw2coxx2wali6sbxu634a.arweave.net/r5tF-qCEcnSz8FCeGYYCuw9qZqK2hOvfVgLR6Qb09vg",
    creators: Array(nrCreators)
      .fill(null)
      .map((_) => ({
        address: Keypair.generate().publicKey,
        verified: false,
        share: 100 / nrCreators,
      })),
    editionNonce: 0,
    tokenProgramVersion: TokenProgramVersion.Original,
    tokenStandard: TokenStandard.NonFungible,
    uses: null,
    collection: collectionMint
      ? { key: collectionMint, verified: false }
      : null,
    primarySaleHappened: true,
    sellerFeeBasisPoints,
    isMutable: false,
  };
};

export const beforeAllHook = async () => {
  //tcomp has to be funded or get rent error
  const [tcomp] = findTCompPda({});
  await transferLamports(tcomp, LAMPORTS_PER_SOL);
  const lookupTableAccount = await createLUT();

  return lookupTableAccount;
};

export const beforeHook = async ({
  numMints,
  nrCreators = 4,
  depthSizePair = DEFAULT_DEPTH_SIZE,
  canopyDepth = 0,
}: {
  numMints: number;
  nrCreators?: number;
  depthSizePair?: ValidDepthSizePair;
  canopyDepth?: number;
}) => {
  const [treeOwner, traderA, traderB] = await makeNTraders(3);

  //setup collection and tree
  const { collectionMint } = await initCollection({ owner: treeOwner });
  const { merkleTree } = await makeTree({
    treeOwner,
    depthSizePair,
    canopyDepth,
  });

  //has to be sequential to ensure index is correct
  let leaves: {
    index: number;
    assetId: PublicKey;
    metadata: MetadataArgs;
    leaf: Buffer;
  }[] = [];
  for (let index = 0; index < numMints; index++) {
    const metadata = await makeCNftMeta({
      collectionMint,
      nrCreators,
    });
    await mintCNft({
      merkleTree,
      metadata,
      treeOwner,
      receiver: traderA.publicKey,
    });
    const { leaf, assetId } = await makeLeaf({
      index,
      merkleTree,
      metadata,
      owner: traderA.publicKey,
    });
    leaves.push({
      index,
      metadata,
      assetId,
      leaf,
    });
  }

  // simulate an in-mem tree
  const memTree = MerkleTree.sparseMerkleTreeFromLeaves(
    leaves.map((l) => l.leaf),
    depthSizePair.maxDepth
  );

  await Promise.all(
    leaves.map(async (l) => {
      const { index, assetId, leaf, metadata } = l;
      const proof = memTree.getProof(
        l.index,
        false,
        depthSizePair.maxDepth,
        false
      ).proof;

      // const root = memTree.getProof(
      //   l.index,
      //   false,
      //   depthSizePair.maxDepth,
      //   true
      // ).root;
      // console.log("root", Array.from(root));
      // console.log(
      //   "leaf",
      //   assetId.toString(),
      //   traderA.publicKey.toString(),
      //   traderA.publicKey?.toString(),
      //   index,
      //   JSON.stringify(metadata)
      // );
      // console.log("data hash", Array.from(computeDataHash(metadata)));
      // console.log(
      //   "creator hash",
      //   Array.from(computeCreatorHashPATCHED(metadata.creators))
      // );
      // console.log(
      //   "hashed leaf",
      //   Array.from(
      //     computeCompressedNFTHash(
      //       assetId,
      //       traderA.publicKey,
      //       traderA.publicKey,
      //       new BN(index),
      //       metadata
      //     )
      //   )
      // );
      // console.log("proof", JSON.stringify(proof.map((p) => new PublicKey(p))));
      // console.log("tree", merkleTree.toString());

      await verifyCNft({
        index: l.index,
        merkleTree,
        metadata: l.metadata,
        owner: traderA.publicKey,
        proof: proof.slice(0, proof.length - canopyDepth),
      });
    })
  );

  console.log("✅ setup done");

  return {
    merkleTree,
    memTree,
    leaves,
    treeOwner,
    traderA,
    traderB,
  };
};

export const testList = async ({
  memTree,
  index,
  owner,
  // TODO write a test when delegaete is set
  leafDelegate,
  merkleTree,
  metadata,
  amount,
  currency,
  expireInSec,
  privateTaker,
  canopyDepth = 0,
  lookupTableAccount,
}: {
  memTree: MerkleTree;
  index: number;
  owner: Keypair;
  leafDelegate?: PublicKey;
  merkleTree: PublicKey;
  metadata: MetadataArgs;
  amount: BN;
  currency?: PublicKey;
  expireInSec?: BN;
  privateTaker?: PublicKey;
  canopyDepth?: number;
  lookupTableAccount?: AddressLookupTableAccount;
}) => {
  const proof = memTree.getProof(
    index,
    false,
    DEFAULT_DEPTH_SIZE.maxDepth,
    false
  );

  const {
    tx: { ixs },
    assetId,
  } = await tcompSdk.list({
    proof: proof.proof,
    leafOwner: owner.publicKey,
    payer: owner.publicKey,
    merkleTree,
    metadata,
    root: [...proof.root],
    index,
    amount,
    currency,
    expireInSec,
    leafDelegate,
    privateTaker,
    canopyDepth,
  });

  const sig = await buildAndSendTx({
    ixs,
    extraSigners: [owner],
    lookupTableAccounts: lookupTableAccount ? [lookupTableAccount] : undefined,
  });
  console.log("✅ listed", sig);

  //nft moved to escrow
  const [listState, bump] = findListStatePda({ assetId });
  await verifyCNft({
    index,
    merkleTree,
    metadata,
    owner: listState,
    delegate: listState,
    proof: proof.proof,
  });

  const listStateAcc = await tcompSdk.fetchListState(listState);
  expect(listStateAcc.assetId.toString()).to.eq(assetId.toString());
  expect(listStateAcc.owner.toString()).to.eq(owner.publicKey.toString());
  expect(listStateAcc.amount.toNumber()).to.eq(amount.toNumber());
  if (!isNullLike(currency)) {
    expect(listStateAcc.currency.toString()).to.eq(currency.toString());
  }
  if (!isNullLike(expireInSec)) {
    expect(listStateAcc.expiry.toNumber()).to.approximately(
      +new Date() / 1000 + (expireInSec.toNumber() ?? 0),
      MINUTES
    );
  }
  if (!isNullLike(privateTaker)) {
    expect(listStateAcc.privateTaker.toString()).to.eq(privateTaker.toString());
  }
  expect(listStateAcc.version).to.eq(CURRENT_TCOMP_VERSION);
  expect(listStateAcc.bump[0]).to.eq(bump);

  //update mem tree
  const { leaf } = await makeLeaf({
    index,
    merkleTree,
    metadata,
    owner: listState,
    delegate: listState,
  });
  memTree.updateLeaf(index, leaf);
};

export const testDelist = async ({
  memTree,
  index,
  owner,
  merkleTree,
  metadata,
  canopyDepth = 0,
  lookupTableAccount,
}: {
  memTree: MerkleTree;
  index: number;
  owner: Keypair;
  merkleTree: PublicKey;
  metadata: MetadataArgs;
  canopyDepth?: number;
  lookupTableAccount?: AddressLookupTableAccount;
}) => {
  const proof = memTree.getProof(
    index,
    false,
    DEFAULT_DEPTH_SIZE.maxDepth,
    false
  );

  const {
    tx: { ixs },
    assetId,
  } = await tcompSdk.delist({
    proof: proof.proof,
    leafOwner: owner.publicKey,
    payer: owner.publicKey,
    merkleTree,
    metadata,
    root: [...proof.root],
    index,
    canopyDepth,
  });

  const sig = await buildAndSendTx({
    ixs,
    extraSigners: [owner],
    lookupTableAccounts: lookupTableAccount ? [lookupTableAccount] : undefined,
  });
  console.log("✅ delisted", sig);

  //nft moved back to wner
  await verifyCNft({
    index,
    merkleTree,
    metadata,
    owner: owner.publicKey,
    delegate: owner.publicKey,
    proof: proof.proof,
  });

  //listing closed
  const [listState, bump] = findListStatePda({ assetId });
  await expect(tcompSdk.fetchListState(listState)).to.be.rejectedWith(
    ACCT_NOT_EXISTS_ERR
  );

  //update mem tree
  const { leaf } = await makeLeaf({
    index,
    merkleTree,
    metadata,
    owner: owner.publicKey,
    delegate: owner.publicKey,
  });
  memTree.updateLeaf(index, leaf);
};

export const testBuy = async ({
  memTree,
  index,
  owner,
  buyer,
  merkleTree,
  metadata,
  maxAmount,
  currency,
  // TODO maybe write a test for taker broker
  takerBroker,
  optionalRoyaltyPct,
  programmable = false,
  lookupTableAccount,
  canopyDepth = 0,
}: {
  memTree: MerkleTree;
  index: number;
  owner: PublicKey;
  buyer: Keypair;
  merkleTree: PublicKey;
  metadata: MetadataArgs;
  maxAmount: BN;
  currency?: PublicKey;
  takerBroker?: PublicKey;
  optionalRoyaltyPct?: number;
  programmable?: boolean;
  lookupTableAccount?: AddressLookupTableAccount;
  canopyDepth?: number;
}) => {
  let proof = memTree.getProof(
    index,
    false,
    DEFAULT_DEPTH_SIZE.maxDepth,
    false
  );
  const [tcomp] = findTCompPda({});

  const {
    tx: { ixs },
    listState,
  } = await tcompSdk.buy({
    proof: proof.proof,
    buyer: buyer.publicKey,
    merkleTree,
    metadata,
    root: [...proof.root],
    index,
    owner,
    maxAmount,
    currency,
    takerBroker,
    optionalRoyaltyPct,
    canopyDepth,
  });

  await withLamports(
    {
      prevFeeAccLamports: tcomp,
      prevSellerLamports: owner,
      prevBuyerLamports: buyer.publicKey,
      ...(takerBroker ? { prevTakerBroker: takerBroker } : {}),
    },
    async ({
      prevFeeAccLamports,
      prevSellerLamports,
      prevBuyerLamports,
      prevTakerBroker,
    }) => {
      const sig = await buildAndSendTx({
        ixs,
        extraSigners: [buyer],
        lookupTableAccounts: lookupTableAccount
          ? [lookupTableAccount]
          : undefined,
      });
      console.log("✅ bought", sig);

      //nft moved to buyer
      await verifyCNft({
        index,
        merkleTree,
        metadata,
        owner: buyer.publicKey,
        delegate: buyer.publicKey,
        proof: proof.proof,
      });

      //list state closed
      expect(getAccount(listState)).rejectedWith(ACCT_NOT_EXISTS_ERR);

      const amount = maxAmount.toNumber();
      const creators = metadata.creators;
      const royaltyBps = metadata.sellerFeeBasisPoints;

      //fees paid
      const feeAccLamports = await getLamports(tcomp);
      const { tcompFee, brokerFee } = calcFees(amount);
      expect(feeAccLamports! - (prevFeeAccLamports ?? 0)).eq(tcompFee);
      if (!isNullLike(takerBroker) && TAKER_BROKER_PCT > 0) {
        const brokerLamports = await getLamports(takerBroker);
        expect(brokerLamports! - (prevTakerBroker ?? 0)).eq(brokerFee);
      }

      //creators paid
      let creatorsFee = 0;
      // Trade pools (when being bought from) charge no royalties.
      if (!!creators?.length && !!royaltyBps) {
        //skip creators when royalties not enough to cover rent
        let skippedCreators = 0;
        for (const c of creators) {
          if (c.share <= 1) {
            skippedCreators++;
          }
        }
        const temp = Math.trunc(
          (programmable
            ? royaltyBps / 1e4
            : !isNullLike(optionalRoyaltyPct)
            ? ((royaltyBps / 1e4) * optionalRoyaltyPct) / 100
            : 0) *
            amount *
            (1 - skippedCreators / 100)
        );
        for (const c of creators) {
          const cBal = await getLamports(c.address);
          //only run the test if share > 1, else it's skipped && cBal exists (it wont if 0 royalties were paid)
          if (c.share > 1 && !isNullLike(cBal)) {
            const expected = Math.trunc((temp * c.share) / 100);
            expect(cBal).eq(expected);
            creatorsFee += expected;
          }
        }
      }

      //buyer paid
      const currBuyerLamports = await getLamports(buyer.publicKey);
      //skip check for programmable, since you create additional PDAs that cost lamports (not worth tracking)
      if (!programmable) {
        expect(currBuyerLamports! - prevBuyerLamports!).eq(
          -1 * (amount + tcompFee + brokerFee + creatorsFee)
        );
      }

      //seller gained
      const currSellerLamports = await getLamports(owner);
      expect(currSellerLamports! - prevSellerLamports!).eq(
        amount + (await tcompSdk.getListStateRent())
      );
    }
  );

  //update mem tree
  const { leaf } = await makeLeaf({
    index,
    merkleTree,
    metadata,
    owner: buyer.publicKey,
    delegate: buyer.publicKey,
  });
  memTree.updateLeaf(index, leaf);
};
