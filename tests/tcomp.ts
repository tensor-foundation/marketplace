import * as anchor from "@project-serum/anchor";
import { AnchorProvider, BN } from "@project-serum/anchor";
import { tcompSDK } from "../src";
import { resolve } from "path";
import {
  AddressLookupTableAccount,
  ConfirmOptions,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Signer,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  ConcurrentMerkleTreeAccount,
  createVerifyLeafIx,
  getConcurrentMerkleTreeAccountSize,
  MerkleTree,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ValidDepthSizePair,
} from "@solana/spl-account-compression";
import {
  computeCompressedNFTHash,
  createCreateTreeInstruction,
  createMintV1Instruction,
  getLeafAssetId,
  MetadataArgs,
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  TokenProgramVersion,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  buildTx,
  buildTxV0,
  isNullLike,
  TOKEN_METADATA_PROGRAM_ID,
} from "@tensor-hq/tensor-common";
import { backOff } from "exponential-backoff";
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
  createSetCollectionSizeInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { createAccount, createMint, mintTo } from "@solana/spl-token";

//(!) provider used across all tests
process.env.ANCHOR_WALLET = resolve(__dirname, "test-keypair.json");
export const TEST_PROVIDER = anchor.AnchorProvider.local();
const TEST_KEYPAIR = Keypair.fromSecretKey(
  Buffer.from(
    JSON.parse(
      require("fs").readFileSync(process.env.ANCHOR_WALLET, {
        encoding: "utf-8",
      })
    )
  )
);

type BuildAndSendTxArgs = {
  provider?: AnchorProvider;
  ixs: TransactionInstruction[];
  extraSigners?: Signer[];
  opts?: ConfirmOptions;
  // Prints out transaction (w/ logs) to stdout
  debug?: boolean;
  // Optional, if present signify that a V0 tx should be sent
  lookupTableAccounts?: [AddressLookupTableAccount] | undefined;
  blockhash?: string;
};

export const buildAndSendTx = async ({
  provider = TEST_PROVIDER,
  ixs,
  extraSigners,
  opts,
  debug,
  lookupTableAccounts,
  blockhash,
}: BuildAndSendTxArgs) => {
  let tx: Transaction | VersionedTransaction;

  if (isNullLike(lookupTableAccounts)) {
    //build legacy
    ({ tx } = await backOff(
      () =>
        buildTx({
          connections: [provider.connection],
          instructions: ixs,
          additionalSigners: extraSigners,
          feePayer: provider.publicKey,
        }),
      {
        // Retry blockhash errors (happens during tests sometimes).
        retry: (e: any) => {
          return e.message.includes("blockhash");
        },
      }
    ));
    //sometimes have to pass manually, eg when updating LUT
    if (!!blockhash) {
      tx.recentBlockhash = blockhash;
    }
    await provider.wallet.signTransaction(tx);
  } else {
    //build v0
    ({ tx } = await backOff(
      () =>
        buildTxV0({
          connections: [provider.connection],
          instructions: ixs,
          //have to add TEST_KEYPAIR here instead of wallet.signTx() since partialSign not impl on v0 txs
          additionalSigners: [TEST_KEYPAIR, ...(extraSigners ?? [])],
          feePayer: provider.publicKey,
          addressLookupTableAccs: lookupTableAccounts,
        }),
      {
        // Retry blockhash errors (happens during tests sometimes).
        retry: (e: any) => {
          return e.message.includes("blockhash");
        },
      }
    ));
  }

  try {
    if (debug) opts = { ...opts, commitment: "confirmed" };
    const sig = await provider.connection.sendRawTransaction(
      tx.serialize(),
      opts
    );
    await provider.connection.confirmTransaction(sig, "confirmed");
    if (debug) {
      console.log(
        await provider.connection.getTransaction(sig, {
          commitment: "confirmed",
        })
      );
    }
    return sig;
  } catch (e) {
    //this is needed to see program error logs
    console.error("❌ FAILED TO SEND TX, FULL ERROR: ❌");
    console.error(e);
    throw e;
  }
};

export const tcompSdk = new tcompSDK({ provider: TEST_PROVIDER });

async function setupTreeWithCompressedNFT(
  connection: Connection,
  payerKeypair: Keypair,
  compressedNFT: MetadataArgs,
  depthSizePair: ValidDepthSizePair = {
    maxDepth: 14,
    maxBufferSize: 64,
  }
): Promise<{
  merkleTree: PublicKey;
}> {
  const payer = payerKeypair.publicKey;

  const merkleTreeKeypair = Keypair.generate();
  const merkleTree = merkleTreeKeypair.publicKey;
  const space = getConcurrentMerkleTreeAccountSize(
    depthSizePair.maxDepth,
    depthSizePair.maxBufferSize
  );
  const allocTreeIx = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: merkleTree,
    lamports: await connection.getMinimumBalanceForRentExemption(space),
    space: space,
    programId: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  });
  const [treeAuthority, _bump] = await PublicKey.findProgramAddress(
    [merkleTree.toBuffer()],
    BUBBLEGUM_PROGRAM_ID
  );
  const createTreeIx = createCreateTreeInstruction(
    {
      merkleTree,
      treeAuthority,
      treeCreator: payer,
      payer,
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

  const mintIx = createMintV1Instruction(
    {
      merkleTree,
      treeAuthority,
      treeDelegate: payer,
      payer,
      leafDelegate: payer,
      leafOwner: payer,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      logWrapper: SPL_NOOP_PROGRAM_ID,
    },
    {
      message: compressedNFT,
    }
  );

  const tx = new Transaction().add(allocTreeIx).add(createTreeIx).add(mintIx);
  tx.feePayer = payer;
  await sendAndConfirmTransaction(
    connection,
    tx,
    [merkleTreeKeypair, payerKeypair],
    {
      commitment: "confirmed",
      skipPreflight: true,
    }
  );

  console.log("✅ tree created + minted", merkleTree);

  return {
    merkleTree,
  };
}

export const initCollection = async (conn: Connection, payer: Keypair) => {
  const collectionMint = await createMint(
    conn,
    payer,
    payer.publicKey,
    payer.publicKey,
    0
  );
  const collectionTokenAccount = await createAccount(
    conn,
    payer,
    collectionMint,
    payer.publicKey
  );
  await mintTo(conn, payer, collectionMint, collectionTokenAccount, payer, 1);
  const [collectionMetadataAccount, _b] = await PublicKey.findProgramAddress(
    [
      Buffer.from("metadata", "utf8"),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      collectionMint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  const collectionMeatadataIX = createCreateMetadataAccountV3Instruction(
    {
      metadata: collectionMetadataAccount,
      mint: collectionMint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: "Nick's collection",
          symbol: "NICK",
          uri: "nicksfancyuri",
          sellerFeeBasisPoints: 100,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: false,
        collectionDetails: null,
      },
    }
  );
  const [collectionMasterEditionAccount, _b2] =
    await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata", "utf8"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.toBuffer(),
        Buffer.from("edition", "utf8"),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
  const collectionMasterEditionIX = createCreateMasterEditionV3Instruction(
    {
      edition: collectionMasterEditionAccount,
      mint: collectionMint,
      mintAuthority: payer.publicKey,
      payer: payer.publicKey,
      updateAuthority: payer.publicKey,
      metadata: collectionMetadataAccount,
    },
    {
      createMasterEditionArgs: {
        maxSupply: 0,
      },
    }
  );

  const sizeCollectionIX = createSetCollectionSizeInstruction(
    {
      collectionMetadata: collectionMetadataAccount,
      collectionAuthority: payer.publicKey,
      collectionMint: collectionMint,
    },
    {
      setCollectionSizeArgs: { size: 50 },
    }
  );

  let tx = new Transaction()
    .add(collectionMeatadataIX)
    .add(collectionMasterEditionIX)
    .add(sizeCollectionIX);
  try {
    const sig = await sendAndConfirmTransaction(conn, tx, [payer], {
      commitment: "confirmed",
      skipPreflight: true,
    });
    console.log(
      "Successfull created NFT collection with collection address: " +
        collectionMint.toBase58(),
      sig
    );
    return {
      collectionMint,
      collectionMetadataAccount,
      collectionMasterEditionAccount,
    };
  } catch (e) {
    console.error("Failed to init collection: ", e);
    throw e;
  }
};

describe("tcomp", () => {
  it("creates a tree", async () => {
    const coll = await initCollection(TEST_PROVIDER.connection, TEST_KEYPAIR);

    const compressedNFT: MetadataArgs = {
      name: "Test Compressed NFT",
      symbol: "TST",
      uri: "https://v6nul6vaqrzhjm7qkcpbtbqcxmhwuzvcw2coxx2wali6sbxu634a.arweave.net/r5tF-qCEcnSz8FCeGYYCuw9qZqK2hOvfVgLR6Qb09vg",
      // creators: [
      //   {
      //     address: new PublicKey("dNCnRxNgCUxktTtvgx9YHnkGK1kyqRxTCjF9CvRVs94"),
      //     share: 100,
      //     verified: false,
      //   },
      // ],
      creators: [],
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
    } = await tcompSdk.executeBuy({
      newLeafOwner: Keypair.generate().publicKey,
      leafOwner: TEST_KEYPAIR.publicKey,
      merkleTree,
      nonce: new BN(0),
      index: 0,
      metadata: compressedNFT,
      root: [...proof.root],
      proof: proof.proof.map((p) => new PublicKey(p)),
    });

    const sig = await buildAndSendTx({ ixs });
    console.log("yay sig is", sig);
  });
});
