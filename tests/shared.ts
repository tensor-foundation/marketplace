// Common helper functions b/w tensor_whitelist & tensorswap.
import * as anchor from "@project-serum/anchor";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import {
  SingleConnectionBroadcaster,
  SolanaProvider,
  TransactionEnvelope,
} from "@saberhq/solana-contrib";
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
import { backOff } from "exponential-backoff";
import { resolve } from "path";
import { isNullLike, TCompSDK } from "../src";
import { getLamports as _getLamports } from "../src/shared";
import {
  buildTx,
  buildTxV0,
  TOKEN_METADATA_PROGRAM_ID,
  waitMS,
} from "@tensor-hq/tensor-common";
import {
  createCreateTreeInstruction,
  createMintV1Instruction,
  MetadataArgs,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  getConcurrentMerkleTreeAccountSize,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ValidDepthSizePair,
} from "@solana/spl-account-compression";
import { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum/dist/src/generated";
import { createAccount, createMint, mintTo } from "@solana/spl-token";
import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
  createSetCollectionSizeInstruction,
} from "@metaplex-foundation/mpl-token-metadata";

// Exporting these here vs in each .test.ts file prevents weird undefined issues.
export { hexCode, stringifyPKsAndBNs } from "../src";

export { waitMS } from "@tensor-hq/tensor-common";

export const ACCT_NOT_EXISTS_ERR = "Account does not exist";
// Vipers IntegerOverflow error.
export const INTEGER_OVERFLOW_ERR = "0x44f";

export const getLamports = (acct: PublicKey) =>
  _getLamports(TEST_PROVIDER.connection, acct);

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

// This passes the accounts' lamports before the provided `callback` function is called.
// Useful for doing before/after lamports diffing.
//
// Example:
// ```
// // Create tx...
// await withLamports(
//   { prevLamports: traderA.publicKey, prevEscrowLamports: solEscrowPda },
//   async ({ prevLamports, prevEscrowLamports }) => {
//     // Actually send tx
//     await buildAndSendTx({...});
//     const currlamports = await getLamports(traderA.publicKey);
//     // Compare currlamports w/ prevLamports
//   })
// );
// ```
export const withLamports = async <
  Accounts extends Record<string, PublicKey>,
  R
>(
  accts: Accounts,
  callback: (results: {
    [k in keyof Accounts]: number | undefined;
  }) => Promise<R>
): Promise<R> => {
  const results = Object.fromEntries(
    await Promise.all(
      Object.entries(accts).map(async ([k, key]) => [
        k,
        await getLamports(key as PublicKey),
      ])
    )
  );
  return await callback(results);
};

// Taken from https://stackoverflow.com/a/65025697/4463793
type MapCartesian<T extends any[][]> = {
  [P in keyof T]: T[P] extends Array<infer U> ? U : never;
};
// Lets you form the cartesian/cross product of a bunch of parameters, useful for tests with a ladder.
//
// Example:
// ```
// await Promise.all(
//   cartesian([traderA, traderB], [nftPoolConfig, tradePoolConfig]).map(
//     async ([owner, config]) => {
//        // Do stuff
//     }
//   )
// );
// ```
export const cartesian = <T extends any[][]>(...arr: T): MapCartesian<T>[] =>
  arr.reduce(
    (a, b) => a.flatMap((c) => b.map((d) => [...c, d])),
    [[]]
  ) as MapCartesian<T>[];

//(!) provider used across all tests
process.env.ANCHOR_WALLET = resolve(__dirname, "test-keypair.json");
export const TEST_PROVIDER = anchor.AnchorProvider.local();
export const TEST_KEYPAIR = Keypair.fromSecretKey(
  Buffer.from(
    JSON.parse(
      require("fs").readFileSync(process.env.ANCHOR_WALLET, {
        encoding: "utf-8",
      })
    )
  )
);

export const tcompSdk = new TCompSDK({ provider: TEST_PROVIDER });

//useful for debugging
export const simulateTxTable = async (ixs: TransactionInstruction[]) => {
  const broadcaster = new SingleConnectionBroadcaster(TEST_PROVIDER.connection);
  const wallet = new Wallet(Keypair.generate());
  const provider = new SolanaProvider(
    TEST_PROVIDER.connection,
    broadcaster,
    wallet
  );
  const tx = new TransactionEnvelope(provider, ixs);
  console.log(await tx.simulateTable());
};

export const calcMinRent = async (address: PublicKey) => {
  const acc = await TEST_PROVIDER.connection.getAccountInfo(address);
  if (acc) {
    console.log(
      "min rent is",
      await TEST_PROVIDER.connection.getMinimumBalanceForRentExemption(
        acc.data.length
      )
    );
  } else {
    console.log("acc not found");
  }
};

// TODO: prettify
export async function setupTreeWithCompressedNFT(
  conn: Connection,
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
    lamports: await conn.getMinimumBalanceForRentExemption(space),
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
  await sendAndConfirmTransaction(conn, tx, [merkleTreeKeypair, payerKeypair], {
    commitment: "confirmed",
    skipPreflight: true,
  });

  console.log("✅ tree created + minted", merkleTree);

  return {
    merkleTree,
  };
}

// TODO: prettify
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
