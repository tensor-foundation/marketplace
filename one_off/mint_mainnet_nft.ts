import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createCreateTreeInstruction,
  createMintToCollectionV1Instruction,
  createMintV1Instruction,
  MetadataArgs,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  buildAndSendTx,
  DEFAULT_DEPTH_SIZE,
  getMasterEdition,
  getMetadata,
  TEST_PROVIDER,
} from "../tests/shared";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { BUBBLEGUM_PROGRAM_ID, findTreeAuthorityPda } from "../src";
import {
  getConcurrentMerkleTreeAccountSize,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ValidDepthSizePair,
} from "@solana/spl-account-compression";
import { TOKEN_METADATA_PROGRAM_ID, waitMS } from "@tensor-hq/tensor-common";
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
  createSetCollectionSizeInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { createAccount, createMint, mintTo } from "@solana/spl-token";

const payer = Keypair.fromSecretKey(
  Uint8Array.from(require("/Users/ilmoi/.config/solana/play.json"))
);

const conn = new Connection("https://api.mainnet-beta.solana.com");

// --------------------------------------- replicating these coz when doing mainnnet blockhash issues come up

export const initCollection = async ({
  conn = TEST_PROVIDER.connection,
  owner,
}: {
  conn?: Connection;
  owner: Keypair;
}) => {
  const collectionMint = await createMint(
    conn,
    owner,
    owner.publicKey,
    owner.publicKey,
    0
  );

  console.log(1);
  await waitMS(10000);

  const collectionTokenAccount = await createAccount(
    conn,
    owner,
    collectionMint,
    owner.publicKey
  );

  console.log(2);
  await waitMS(3000);

  await mintTo(conn, owner, collectionMint, collectionTokenAccount, owner, 1);

  console.log(3);
  await waitMS(3000);

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
      mintAuthority: owner.publicKey,
      payer: owner.publicKey,
      updateAuthority: owner.publicKey,
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
      mintAuthority: owner.publicKey,
      payer: owner.publicKey,
      updateAuthority: owner.publicKey,
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
      collectionAuthority: owner.publicKey,
      collectionMint: collectionMint,
    },
    {
      setCollectionSizeArgs: { size: 50 },
    }
  );

  console.log(4);
  await waitMS(3000);

  const wallet = new Wallet(owner);
  const provider = new AnchorProvider(conn, wallet, {});

  const blockhash = await conn.getRecentBlockhash("finalized");

  let keepTrying = true;
  while (keepTrying) {
    try {
      await buildAndSendTx({
        ixs: [
          collectionMeatadataIX,
          collectionMasterEditionIX,
          sizeCollectionIX,
        ],
        extraSigners: [owner],
        provider,
        blockhash: blockhash.blockhash,
      });
      keepTrying = false;
    } catch (e) {
      console.log("e", e);
      await waitMS(1000);
    }
  }

  return {
    collectionMint,
    collectionMetadataAccount,
    collectionMasterEditionAccount,
  };
};

const makeTree = async ({
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

  const wallet = new Wallet(treeOwner);
  const provider = new AnchorProvider(conn, wallet, {});

  const blockhash = await conn.getRecentBlockhash("finalized");

  let keepTrying = true;
  while (keepTrying) {
    try {
      const tx = new Transaction().add(allocTreeIx, createTreeIx);
      tx.recentBlockhash = blockhash.blockhash;
      tx.feePayer = treeOwner.publicKey;

      const sig = await sendAndConfirmTransaction(
        conn,
        tx,
        [merkleTreeKeypair, treeOwner],
        {
          commitment: "confirmed",
          skipPreflight: true,
        }
      );
      console.log("sig", sig);

      // TODO: idfk why the below 2 throw a bad signer error
      // const sig = await provider.connection.sendRawTransaction(
      //   tx.serialize({ verifySignatures: false })
      // );
      // await buildAndSendTx({
      //   ixs: [allocTreeIx, createTreeIx],
      //   extraSigners: [merkleTreeKeypair, treeOwner],
      //   provider,
      //   blockhash: blockhash.blockhash,
      // });
      keepTrying = false;
    } catch (e) {
      console.log("e", e);
      await waitMS(1000);
    }
  }

  return {
    merkleTree,
  };
};

const mintCNft = async ({
  treeOwner,
  receiver,
  metadata,
  merkleTree,
  unverifiedCollection = false,
  provider = TEST_PROVIDER,
}: {
  treeOwner: Keypair;
  receiver: PublicKey;
  metadata: MetadataArgs;
  merkleTree: PublicKey;
  unverifiedCollection?: boolean;
  provider?: AnchorProvider;
}) => {
  const owner = treeOwner.publicKey;

  const [treeAuthority] = findTreeAuthorityPda({ merkleTree });

  const [bgumSigner, __] = await PublicKey.findProgramAddress(
    [Buffer.from("collection_cpi", "utf8")],
    BUBBLEGUM_PROGRAM_ID
  );

  const mintIx =
    !!metadata.collection && !unverifiedCollection
      ? createMintToCollectionV1Instruction(
          {
            merkleTree,
            treeAuthority,
            treeDelegate: owner,
            payer: owner,
            leafDelegate: receiver,
            leafOwner: receiver,
            compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            logWrapper: SPL_NOOP_PROGRAM_ID,
            bubblegumSigner: bgumSigner,
            collectionAuthority: treeOwner.publicKey,
            collectionAuthorityRecordPda: BUBBLEGUM_PROGRAM_ID,
            collectionMetadata: await getMetadata(metadata.collection.key),
            collectionMint: metadata.collection.key,
            editionAccount: await getMasterEdition(metadata.collection.key),
            tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          },
          {
            metadataArgs: {
              ...metadata,
              //we have to pass it in as FALSE, it'll be set to TRUE during the ix
              collection: { key: metadata.collection.key, verified: false },
            },
          }
        )
      : createMintV1Instruction(
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

  const blockhash = await provider.connection.getRecentBlockhash("finalized");
  let sig;
  let keepTrying = true;
  while (keepTrying) {
    try {
      sig = await buildAndSendTx({
        ixs: [mintIx],
        extraSigners: [treeOwner],
        provider,
        blockhash: blockhash.blockhash,
      });
      keepTrying = false;
    } catch (e) {
      console.log("e", e);
      await waitMS(1000);
    }
  }

  console.log("✅ minted", sig);
};

// --------------------------------------- end

(async () => {
  console.log("lfg");
  const { collectionMint } = await initCollection({ owner: payer, conn });

  // const collectionMint = new PublicKey(
  //   "52Pn1iYKTyVFLqTraDJYsU6j9wHGxAZjKAZHL7k4VaYW"
  // );

  console.log("new collection", collectionMint.toString());

  const metadata: MetadataArgs = {
    name: "Luna Grins DRiP Purple",
    symbol: "",
    uri: "https://arweave.net/5b9yQQSeZkIx4sSVACaMv4S0KVvgePEy2FYB1b7uouU",
    sellerFeeBasisPoints: 0,
    primarySaleHappened: false,
    isMutable: true,
    editionNonce: 0,
    tokenStandard: 0,
    collection: {
      key: collectionMint,
      verified: false, //will be set to true
    },
    uses: null,
    tokenProgramVersion: 0,
    creators: [
      {
        address: payer.publicKey,
        share: 100,
        verified: true,
      },
    ],
  };

  const { merkleTree } = await makeTree({
    conn,
    treeOwner: payer,
    depthSizePair: DEFAULT_DEPTH_SIZE,
    canopyDepth: 10,
  });

  // const merkleTree = new PublicKey(
  //   "F8T1fWBpUYpXacHFgdi6gZ5zxcpNmW1Uf85ibiLBMgno"
  // );

  console.log("tree created", merkleTree.toString());

  const wallet = new Wallet(payer);
  const provider = new AnchorProvider(conn, wallet, {});
  await mintCNft({
    merkleTree,
    metadata,
    treeOwner: payer,
    receiver: payer.publicKey,
    provider,
  });

  //5ZHx6tRQjAv2oMH7XP8eVKVP91DMZFxDsfyvTNgD9XsRV7aDNWvLHXwbPzZYKq9zJNwc3s1jsk3rJoshmfnuLhjC
  console.log("minted!");
})();
