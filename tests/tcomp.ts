import { BN } from "@project-serum/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import {
  ConcurrentMerkleTreeAccount,
  createVerifyLeafIx,
  MerkleTree,
} from "@solana/spl-account-compression";
import {
  computeCompressedNFTHash,
  getLeafAssetId,
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  buildAndSendTx,
  initCollection,
  setupTreeWithCompressedNFT,
  tcompSdk,
  TEST_KEYPAIR,
  TEST_PROVIDER,
} from "./shared";
import { findListStatePda } from "../src";
import { transferLamports } from "./token";
import { LAMPORTS } from "../deps/metaplex-mpl/auction-house/cli/src/helpers/upload/arweave-bundle";

describe("tcomp", () => {
  it("lists + buys", async () => {
    const coll = await initCollection(TEST_PROVIDER.connection, TEST_KEYPAIR);

    // TODO: be sure to have tests with both 0 and 5 creators
    const creators = Array(1)
      .fill(null)
      .map((_) => ({
        address: Keypair.generate().publicKey,
        share: 100,
        verified: false,
      }));

    const compressedNFT: MetadataArgs = {
      name: "Test Compressed NFT",
      symbol: "TST",
      uri: "https://v6nul6vaqrzhjm7qkcpbtbqcxmhwuzvcw2coxx2wali6sbxu634a.arweave.net/r5tF-qCEcnSz8FCeGYYCuw9qZqK2hOvfVgLR6Qb09vg",
      creators,
      editionNonce: 0,
      tokenProgramVersion: TokenProgramVersion.Original,
      tokenStandard: TokenStandard.NonFungible,
      uses: null,
      collection: { key: coll.collectionMint, verified: false },
      primarySaleHappened: false,
      sellerFeeBasisPoints: 0,
      isMutable: false,
    };

    const { merkleTree } = await setupTreeWithCompressedNFT(
      TEST_PROVIDER.connection,
      TEST_KEYPAIR,
      compressedNFT
    );

    // Verify leaf exists
    const accountInfo = await TEST_PROVIDER.connection.getAccountInfo(
      merkleTree,
      { commitment: "confirmed" }
    );
    const account = ConcurrentMerkleTreeAccount.fromBuffer(accountInfo!.data!);
    const leafIndex = new BN(0);
    const assetId = await getLeafAssetId(merkleTree, leafIndex);

    const leaf = computeCompressedNFTHash(
      assetId,
      TEST_PROVIDER.publicKey,
      TEST_PROVIDER.publicKey,
      leafIndex,
      compressedNFT
    );

    const verifyLeafIx = createVerifyLeafIx(merkleTree, {
      root: account.getCurrentRoot(),
      leaf,
      leafIndex: leafIndex.toNumber(),
      proof: [],
    });
    const tx = new Transaction().add(verifyLeafIx);
    const txId = await sendAndConfirmTransaction(
      TEST_PROVIDER.connection,
      tx,
      [TEST_KEYPAIR],
      {
        commitment: "confirmed",
        skipPreflight: true,
      }
    );
    console.log("Verified NFT existence:", txId);

    const t = new MerkleTree([leaf]);
    let proof = t.getProof(0, false, 14, true);

    const {
      tx: { ixs },
    } = await tcompSdk.list({
      proof: proof.proof.map((p) => new PublicKey(p)),
      leafOwner: TEST_KEYPAIR.publicKey,
      payer: TEST_KEYPAIR.publicKey,
      merkleTree,
      metadata: compressedNFT,
      root: [...proof.root],
      index: 0,
      amount: new BN(123),
    });
    const sig = await buildAndSendTx({ ixs });
    console.log("yay listed", sig);

    const [listState] = findListStatePda({ assetId });

    const leaf2 = computeCompressedNFTHash(
      assetId,
      listState,
      listState,
      leafIndex,
      compressedNFT
    );

    t.updateLeaf(leafIndex.toNumber(), leaf2);
    proof = t.getProof(0, false, 14, true);
    console.log("updated tree");

    const n = Keypair.generate();

    const {
      tx: { ixs: ixs2 },
      tcomp,
    } = await tcompSdk.buy({
      proof: proof.proof.map((p) => new PublicKey(p)),
      newLeafOwner: n.publicKey,
      merkleTree,
      metadata: compressedNFT,
      root: [...proof.root],
      index: 0,
      owner: TEST_KEYPAIR.publicKey,
      listState,
      maxAmount: new BN(123),
      payer: TEST_KEYPAIR.publicKey,
    });

    await transferLamports(tcomp, LAMPORTS_PER_SOL);
    console.log("funded");

    const sig2 = await buildAndSendTx({ ixs: ixs2, extraSigners: [n] });
    console.log("yay bought", sig2);
  });
});
