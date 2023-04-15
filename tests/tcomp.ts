import { BN } from "@project-serum/anchor";
import {
  Keypair,
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
} from "@metaplex-foundation/mpl-bubblegum";
import {
  buildAndSendTx,
  initCollection,
  setupTreeWithCompressedNFT,
  tcompSdk,
  TEST_KEYPAIR,
  TEST_PROVIDER,
} from "./shared";

describe("tcomp", () => {
  it("lists + buys", async () => {
    const coll = await initCollection(TEST_PROVIDER.connection, TEST_KEYPAIR);

    // TODO be sure to have tests with both 0 and 5 creators
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
      tokenStandard: null,
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

    //verify nft existence
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
    const proof = t.getProof(0, false, 14, true);

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
      nonce: new BN(0),
      amount: new BN(123),
    });

    // const {
    //   tx: { ixs },
    // } = await tcompSdk.buy({
    //   proof: proof.proof.map((p) => new PublicKey(p)),
    //   leafOwner: TEST_KEYPAIR.publicKey,
    //   newLeafOwner: Keypair.generate().publicKey,
    //   merkleTree,
    //   metadata: compressedNFT,
    //   root: [...proof.root],
    //   index: 0,
    //   nonce: new BN(0),
    // });

    const sig = await buildAndSendTx({ ixs });
    console.log("yay sig is", sig);
  });
});
