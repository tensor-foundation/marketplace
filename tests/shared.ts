import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  Commitment,
  ConfirmOptions,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Signer,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  createCreateTreeInstruction,
  createDelegateInstruction,
  createMintV1Instruction,
  createVerifyCreatorInstruction,
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
import {
  BidTarget,
  BUBBLEGUM_PROGRAM_ID,
  castBidTargetAnchor,
  computeCompressedNFTHashPATCHED,
  computeCreatorHashPATCHED,
  CURRENT_TCOMP_VERSION,
  DEFAULT_COMPUTE_UNITS,
  DEFAULT_MICRO_LAMPORTS,
  FEE_BPS,
  findListStatePda,
  findTCompPda,
  findTreeAuthorityPda,
  getDisc,
  getTotalComputeIxs,
  isNullLike,
  TAKER_BROKER_PCT,
  TCOMP_ADDR,
  TCOMP_DISC_MAP,
  TCompIxName,
  TCompSDK,
} from "../src";
import * as anchor from "@project-serum/anchor";
import { AnchorProvider, BN, Wallet } from "@project-serum/anchor";
import {
  computeDataHash,
  metadataArgsBeet,
} from "../deps/metaplex-mpl/bubblegum/js/src";
import { keccak_256 } from "js-sha3";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import {
  AUTH_PROG_ID,
  buildTx,
  buildTxV0,
  MINUTES,
  TENSORSWAP_ADDR,
  TMETA_PROG_ID,
  waitMS,
} from "@tensor-hq/tensor-common";
import {
  getAccount,
  initCollection,
  makeNTraders,
  transferLamports,
} from "./account";
import {
  STANDARD_FEE_BPS,
  TensorSwapSDK,
  TSwapConfigAnchor,
} from "@tensor-hq/tensorswap-sdk";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  SingleConnectionBroadcaster,
  SolanaProvider,
  TransactionEnvelope,
} from "@saberhq/solana-contrib";
import { backOff } from "exponential-backoff";
import { resolve } from "path";
import { getLamports as _getLamports } from "../src/shared";

// Enables rejectedWith.
chai.use(chaiAsPromised);

// Exporting these here vs in each .test.ts file prevents weird undefined issues.
export { hexCode, stringifyPKsAndBNs } from "../src";
export { waitMS } from "@tensor-hq/tensor-common";

export const ACCT_NOT_EXISTS_ERR = "Account does not exist";
// Vipers IntegerOverflow error.
export const INTEGER_OVERFLOW_ERR = "0x44f";
export const HAS_ONE_ERR = "0x7d1";
export const ALREADY_IN_USE_ERR = "0x0";
export const ACC_NOT_INIT_ERR = "0xbc4";

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

function makeRandomStr(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

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
      tx.serialize({ verifySignatures: false }),
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
export const TEST_COSIGNER = Keypair.generate();
export const TSWAP_CONFIG: TSwapConfigAnchor = {
  feeBps: STANDARD_FEE_BPS,
};

export const swapSdk = new TensorSwapSDK({ provider: TEST_PROVIDER });
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

export const DEFAULT_DEPTH_SIZE: ValidDepthSizePair = {
  maxDepth: 14,
  maxBufferSize: 64,
};

export const FEE_PCT = FEE_BPS / 1e4;
export const calcFees = (amount: number) => {
  const totalFee = Math.trunc(amount * FEE_PCT);
  const brokerFee = Math.trunc((totalFee * TAKER_BROKER_PCT) / 100);
  const tcompFee = totalFee - brokerFee;

  return { totalFee, brokerFee, tcompFee };
};

export const updateLUT = async ({
  provider = TEST_PROVIDER,
  committment = "finalized",
  lookupTableAddress,
  addresses,
}: {
  provider?: anchor.AnchorProvider;
  committment?: Commitment;
  lookupTableAddress: PublicKey;
  addresses: PublicKey[];
}) => {
  const conn = provider.connection;

  //needed else we keep refetching the blockhash
  const blockhash = (await conn.getLatestBlockhash(committment)).blockhash;
  console.log("blockhash", blockhash);

  //add NEW addresses ONLY
  const extendInstruction = AddressLookupTableProgram.extendLookupTable({
    payer: provider.publicKey,
    authority: provider.publicKey,
    lookupTable: lookupTableAddress,
    addresses,
  });

  let done = false;
  while (!done) {
    try {
      await buildAndSendTx({
        provider,
        ixs: [extendInstruction],
        blockhash,
      });
      done = true;
    } catch (e) {
      console.log("failed, try again in 5");
      await waitMS(5000);
    }
  }

  //fetch (this will actually show wrong the first time, need to rerun
  const lookupTableAccount = (
    await conn.getAddressLookupTable(lookupTableAddress)
  ).value;

  console.log("updated LUT", lookupTableAccount);
};

export const createLUT = async (
  provider = TEST_PROVIDER,
  slotCommitment: Commitment = "finalized"
) => {
  const conn = provider.connection;

  //use finalized, otherwise get "is not a recent slot err"
  const slot = await conn.getSlot(slotCommitment);

  //create
  const [lookupTableInst, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: provider.publicKey,
      payer: provider.publicKey,
      recentSlot: slot,
    });

  //see if already created
  let lookupTableAccount = (
    await conn.getAddressLookupTable(lookupTableAddress)
  ).value;
  if (!!lookupTableAccount) {
    console.log("LUT exists", lookupTableAddress.toBase58());
    return lookupTableAccount;
  }

  console.log("LUT missing");

  const [tcomp] = findTCompPda({});

  //add addresses
  const extendInstruction = AddressLookupTableProgram.extendLookupTable({
    payer: provider.publicKey,
    authority: provider.publicKey,
    lookupTable: lookupTableAddress,
    addresses: [
      SPL_NOOP_PROGRAM_ID,
      SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      SystemProgram.programId,
      BUBBLEGUM_PROGRAM_ID,
      tcomp,
      //for spl payments
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
      //margin
      TENSORSWAP_ADDR,
      //future proofing
      SYSVAR_RENT_PUBKEY,
      AUTH_PROG_ID,
      TMETA_PROG_ID,
      SYSVAR_INSTRUCTIONS_PUBKEY,
    ],
  });

  let done = false;
  while (!done) {
    try {
      await buildAndSendTx({
        provider,
        ixs: [lookupTableInst, extendInstruction],
      });
      done = true;
    } catch (e) {
      console.log("failed, try again in 5");
      await waitMS(5000);
    }
  }

  console.log("new LUT created", lookupTableAddress.toBase58());

  //fetch
  lookupTableAccount = (await conn.getAddressLookupTable(lookupTableAddress))
    .value;

  return lookupTableAccount;
};

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

  const [treeAuthority] = findTreeAuthorityPda({ merkleTree });

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

export const delegateCNft = async ({
  memTree,
  index,
  owner,
  newDelegate,
  merkleTree,
  metadata,
  canopyDepth = 0,
  depthSizePair = DEFAULT_DEPTH_SIZE,
}: {
  memTree: MerkleTree;
  index: number;
  owner: Keypair;
  newDelegate: PublicKey;
  merkleTree: PublicKey;
  metadata: MetadataArgs;
  canopyDepth?: number;
  depthSizePair?: ValidDepthSizePair;
}) => {
  const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
  const proof = memTree.getProof(index, false, depthSizePair.maxDepth, false);
  const dataHash = computeDataHash(metadata);
  const creatorHash = computeCreatorHashPATCHED(metadata.creators);
  const delegateIx = createDelegateInstruction(
    {
      merkleTree,
      treeAuthority,
      leafOwner: owner.publicKey,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      newLeafDelegate: newDelegate,
      previousLeafDelegate: owner.publicKey,
      anchorRemainingAccounts: proof.proof
        .slice(0, proof.proof.length - canopyDepth)
        .map((b) => ({
          pubkey: new PublicKey(b),
          isWritable: false,
          isSigner: false,
        })),
    },
    {
      root: [...proof.root],
      dataHash: [...dataHash],
      creatorHash: [...creatorHash],
      index,
      nonce: new BN(index),
    }
  );

  const sig = await buildAndSendTx({
    ixs: [delegateIx],
    extraSigners: [owner],
  });

  console.log("✅ delegated", sig);

  //verify the new delegate
  await verifyCNft({
    index,
    merkleTree,
    metadata,
    owner: owner.publicKey,
    delegate: newDelegate,
    proof: proof.proof,
  });
};

// Version from metaplex but without seller fee basis points
export function computeMetadataArgsHash(metadata: MetadataArgs): Buffer {
  const [serializedMetadata] = metadataArgsBeet.serialize(metadata);
  return Buffer.from(keccak_256.digest(serializedMetadata));
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

export const verifyCNftCreator = async ({
  conn = TEST_PROVIDER.connection,
  index,
  owner,
  delegate,
  merkleTree,
  memTree,
  metadata,
  proof,
  verifiedCreator,
}: {
  conn?: Connection;
  index: number;
  owner: PublicKey;
  delegate?: PublicKey;
  merkleTree: PublicKey;
  metadata: MetadataArgs;
  proof: Buffer[];
  verifiedCreator: Keypair;
  memTree: MerkleTree;
}) => {
  const accountInfo = await conn.getAccountInfo(merkleTree, {
    commitment: "confirmed",
  });
  const account = ConcurrentMerkleTreeAccount.fromBuffer(accountInfo!.data!);

  const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
  const verifyCreatorIx = await createVerifyCreatorInstruction(
    {
      merkleTree,
      treeAuthority,
      leafOwner: owner,
      leafDelegate: owner,
      payer: TEST_KEYPAIR.publicKey,
      creator: verifiedCreator.publicKey,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      anchorRemainingAccounts: proof.map((p) => ({
        pubkey: new PublicKey(p),
        isWritable: false,
        isSigner: false,
      })),
    },
    {
      root: [...account.getCurrentRoot()],
      creatorHash: [...computeCreatorHashPATCHED(metadata.creators)],
      dataHash: [...computeDataHash(metadata)],
      index,
      message: metadata,
      nonce: new BN(index),
    }
  );

  const sig = await buildAndSendTx({
    ixs: [verifyCreatorIx],
    extraSigners: [TEST_KEYPAIR, verifiedCreator],
  });
  console.log("✅ creator verified:", sig);

  metadata.creators.forEach((c) => {
    if (c.address.equals(verifiedCreator.publicKey)) {
      c.verified = true;
    }
  });

  //update mem tree
  const { leaf, assetId } = await makeLeaf({
    index,
    owner,
    delegate,
    merkleTree,
    metadata,
  });
  memTree.updateLeaf(index, leaf);

  return { metadata, leaf, assetId };
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
  randomizeName = false,
}: {
  nrCreators?: number;
  sellerFeeBasisPoints?: number;
  collectionMint?: PublicKey;
  randomizeName?: boolean;
}): MetadataArgs => {
  if (nrCreators < 0 || nrCreators > 4) {
    throw new Error(
      "must be between 0 and 4 creators (yes 4 for compressed nfts)"
    );
  }

  return {
    name: randomizeName ? makeRandomStr(32) : "Compressed NFT",
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
  setupTswap = false,
  randomizeName,
  verifiedCreator,
  collectionless = false,
}: {
  numMints: number;
  nrCreators?: number;
  depthSizePair?: ValidDepthSizePair;
  canopyDepth?: number;
  setupTswap?: boolean;
  randomizeName?: boolean;
  verifiedCreator?: Keypair;
  collectionless?: boolean;
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
      collectionMint: collectionless ? undefined : collectionMint,
      nrCreators,
      randomizeName,
    });

    //attach optioonal verified creators
    if (verifiedCreator) {
      //nullify existing shares
      metadata.creators = metadata.creators.map((c) => ({ ...c, share: 0 }));
      //insert new creator at the start
      metadata.creators.push({
        address: verifiedCreator.publicKey,
        verified: false,
        //doesn't matter, we're not testing share
        share: 100,
      });
      //keep the last 4
      if (metadata.creators.length > 4) {
        metadata.creators = metadata.creators.slice(
          metadata.creators.length - 4,
          metadata.creators.length
        );
      }
    }

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

  leaves = await Promise.all(
    leaves.map(async (l) => {
      let { index, assetId, leaf, metadata } = l;
      let proof = memTree.getProof(index, false, depthSizePair.maxDepth, false);

      if (verifiedCreator) {
        ({ metadata, leaf, assetId } = await verifyCNftCreator({
          index,
          merkleTree,
          memTree,
          metadata,
          owner: traderA.publicKey,
          proof: proof.proof.slice(0, proof.proof.length - canopyDepth),
          verifiedCreator,
        }));
        //get new proof after verification
        proof = memTree.getProof(index, false, depthSizePair.maxDepth, false);
      }

      await verifyCNft({
        index,
        merkleTree,
        metadata,
        owner: traderA.publicKey,
        proof: proof.proof.slice(0, proof.proof.length - canopyDepth),
      });

      return { index, assetId, leaf, metadata };
    })
  );

  if (setupTswap) {
    // Tswap
    const {
      tx: { ixs },
      tswapPda,
    } = await swapSdk.initUpdateTSwap({
      owner: TEST_PROVIDER.publicKey,
      newOwner: TEST_PROVIDER.publicKey,
      config: TSWAP_CONFIG,
      cosigner: TEST_COSIGNER.publicKey,
    });

    await buildAndSendTx({ ixs, extraSigners: [TEST_COSIGNER] });

    const swapAcc = await swapSdk.fetchTSwap(tswapPda);
    expect(swapAcc.version).eq(1);
    expect(swapAcc.owner.toBase58()).eq(TEST_PROVIDER.publicKey.toBase58());
    expect(swapAcc.cosigner.toBase58()).eq(TEST_COSIGNER.publicKey.toBase58());
    expect(swapAcc.feeVault.toBase58()).eq(tswapPda.toBase58());
    expect((swapAcc.config as TSwapConfigAnchor).feeBps).eq(STANDARD_FEE_BPS);
  }

  console.log("✅ setup done");

  return {
    merkleTree,
    memTree,
    leaves,
    treeOwner,
    traderA,
    traderB,
    collectionMint,
  };
};

export const testList = async ({
  memTree,
  index,
  owner,
  delegate,
  merkleTree,
  metadata,
  amount,
  currency,
  expireInSec,
  privateTaker,
  canopyDepth = 0,
  lookupTableAccount,
  payer = owner,
}: {
  memTree: MerkleTree;
  index: number;
  owner: Keypair;
  delegate?: Keypair;
  merkleTree: PublicKey;
  metadata: MetadataArgs;
  amount: BN;
  currency?: PublicKey;
  expireInSec?: BN;
  privateTaker?: PublicKey;
  canopyDepth?: number;
  lookupTableAccount?: AddressLookupTableAccount;
  payer?: Keypair;
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
    listState,
  } = await tcompSdk.list({
    proof: proof.proof,
    owner: owner.publicKey,
    payer: payer.publicKey,
    merkleTree,
    metadata,
    root: [...proof.root],
    index,
    amount,
    currency,
    expireInSec,
    delegate: delegate?.publicKey,
    privateTaker,
    canopyDepth,
  });

  let sig;

  await withLamports(
    {
      prevPayerLamports: payer.publicKey,
      prevOwnerLamports: owner.publicKey,
    },
    async ({ prevPayerLamports, prevOwnerLamports }) => {
      sig = await buildAndSendTx({
        ixs,
        //if leaf delegate passed in, then skip the owner
        extraSigners: [delegate ?? owner, payer],
        lookupTableAccounts: lookupTableAccount
          ? [lookupTableAccount]
          : undefined,
      });
      console.log("✅ listed", sig);
      // await parseTcompEvent({ conn: TEST_PROVIDER.connection, sig });

      //if payer != buyer, make sure buyer didnt lose lamports
      if (payer.publicKey.toString() !== owner.publicKey.toString()) {
        const currOwnerLamports = await getLamports(owner.publicKey);
        expect(currOwnerLamports! - prevOwnerLamports!).eq(0);
      }

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
        expect(listStateAcc.currency!.toString()).to.eq(currency.toString());
      }
      if (!isNullLike(expireInSec)) {
        expect(listStateAcc.expiry.toNumber()).to.approximately(
          +new Date() / 1000 + (expireInSec.toNumber() ?? 0),
          MINUTES
        );
      }
      if (!isNullLike(privateTaker)) {
        expect(listStateAcc.privateTaker!.toString()).to.eq(
          privateTaker.toString()
        );
      }
      expect(listStateAcc.version).to.eq(CURRENT_TCOMP_VERSION);
      expect(listStateAcc.bump[0]).to.eq(bump);
    }
  );

  //update mem tree
  const { leaf } = await makeLeaf({
    index,
    merkleTree,
    metadata,
    owner: listState,
    delegate: listState,
  });
  memTree.updateLeaf(index, leaf);

  return { sig };
};

export const testEdit = async ({
  index,
  owner,
  merkleTree,
  amount,
  currency,
  expireInSec,
  privateTaker,
}: {
  index: number;
  owner: Keypair;
  merkleTree: PublicKey;
  amount: BN;
  currency?: PublicKey;
  expireInSec?: BN;
  privateTaker?: PublicKey | null;
}) => {
  const {
    tx: { ixs },
    listState,
    assetId,
  } = await tcompSdk.edit({
    owner: owner.publicKey,
    merkleTree,
    nonce: new BN(index),
    amount,
    currency,
    expireInSec,
    privateTaker,
  });

  const sig = await buildAndSendTx({
    ixs,
    extraSigners: [owner],
  });
  console.log("✅ edited", sig);

  const listStateAcc = await tcompSdk.fetchListState(listState);
  expect(listStateAcc.amount.toNumber()).to.eq(amount.toNumber());
  if (!isNullLike(currency)) {
    expect(listStateAcc.currency!.toString()).to.eq(currency.toString());
  }
  if (!isNullLike(expireInSec)) {
    expect(listStateAcc.expiry.toNumber()).to.approximately(
      +new Date() / 1000 + (expireInSec.toNumber() ?? 0),
      MINUTES
    );
  }
  if (!isNullLike(privateTaker)) {
    expect(listStateAcc.privateTaker!.toString()).to.eq(
      privateTaker.toString()
    );
  }

  return { sig };
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
    owner: owner.publicKey,
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
  takerBroker,
  optionalRoyaltyPct = 100,
  programmable = false,
  lookupTableAccount,
  canopyDepth = 0,
  payer = buyer,
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
  payer?: Keypair;
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
    payer: payer.publicKey,
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

  let sig: string | undefined;

  await withLamports(
    {
      prevFeeAccLamports: tcomp,
      prevSellerLamports: owner,
      prevPayerLamports: payer.publicKey,
      prevBuyerLamports: buyer.publicKey,
      ...(takerBroker ? { prevTakerBroker: takerBroker } : {}),
    },
    async ({
      prevFeeAccLamports,
      prevSellerLamports,
      prevPayerLamports,
      prevBuyerLamports,
      prevTakerBroker,
    }) => {
      sig = await buildAndSendTx({
        ixs,
        extraSigners: [buyer, payer],
        lookupTableAccounts: lookupTableAccount
          ? [lookupTableAccount]
          : undefined,
      });
      console.log("✅ bought", sig);
      // await parseTcompEvent({ conn: TEST_PROVIDER.connection, sig });

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

      //payer has paid
      const currPayerLamports = await getLamports(payer.publicKey);
      //skip check for programmable, since you create additional PDAs that cost lamports (not worth tracking)
      if (!programmable) {
        expect(currPayerLamports! - prevPayerLamports!).eq(
          -1 * (amount + tcompFee + brokerFee + creatorsFee)
        );
      }

      //if payer != buyer, make sure buyer didnt lose lamports
      if (payer.publicKey.toString() !== buyer.publicKey.toString()) {
        const currBuyerLamports = await getLamports(buyer.publicKey);
        expect(currBuyerLamports! - prevBuyerLamports!).eq(0);
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

  return { sig };
};

export const fetchAndCheckSingleIxTx = async (
  sig: string,
  ixName: TCompIxName
) => {
  const tx = (await TEST_PROVIDER.connection.getTransaction(sig, {
    commitment: "confirmed",
  }))!;
  expect(tx).not.null;
  const ixs = tcompSdk.parseIxs(tx);
  expect(ixs).length(1);
  const ix = ixs[0];
  expect(ix.ix.name).eq(ixName);

  // check discriminator (skipped if we CPIed)
  const tcompIx = tx.transaction.message.instructions.find(
    (ix) =>
      ix.programIdIndex ===
      tx.transaction.message.accountKeys.findIndex(
        (a) => a.toString() === TCOMP_ADDR.toString()
      )
  );
  if (tcompIx) {
    expect(getDisc(tcompIx.data)).eq(TCOMP_DISC_MAP[ixName].disc);
  }

  return ix;
};

export const testBid = async ({
  target = BidTarget.AssetId,
  targetId,
  bidId,
  owner,
  amount,
  prevBidAmount,
  currency,
  expireInSec,
  privateTaker,
  margin,
}: {
  target?: BidTarget;
  targetId: PublicKey;
  bidId?: PublicKey;
  owner: Keypair;
  amount: BN;
  prevBidAmount?: number;
  currency?: PublicKey;
  expireInSec?: BN;
  privateTaker?: PublicKey | null;
  margin?: PublicKey;
}) => {
  const {
    tx: { ixs },
    bidState,
  } = await tcompSdk.bid({
    target,
    targetId,
    bidId,
    owner: owner.publicKey,
    amount,
    currency,
    expireInSec,
    privateTaker,
    margin,
  });

  let sig;

  await withLamports(
    {
      prevBidderLamports: owner.publicKey,
      prevBidStateLamports: bidState,
      ...(margin ? { prevMarginLamports: margin } : {}),
    },
    async ({
      prevBidderLamports,
      prevBidStateLamports,
      prevMarginLamports,
    }) => {
      sig = await buildAndSendTx({
        ixs,
        extraSigners: [owner],
      });
      console.log("✅ placed bid", sig);

      const bidStateAcc = await tcompSdk.fetchBidState(bidState);
      expect(bidStateAcc.version).to.eq(CURRENT_TCOMP_VERSION);
      expect(castBidTargetAnchor(bidStateAcc.target)).to.eq(target);
      expect(bidStateAcc.targetId.toString()).to.eq(targetId.toString());
      expect(bidStateAcc.owner.toString()).to.eq(owner.publicKey.toString());
      expect(bidStateAcc.amount.toNumber()).to.eq(amount.toNumber());
      if (!isNullLike(currency)) {
        expect(bidStateAcc.currency!.toString()).to.eq(currency.toString());
      }
      if (!isNullLike(expireInSec)) {
        expect(bidStateAcc.expiry.toNumber()).to.approximately(
          +new Date() / 1000 + (expireInSec.toNumber() ?? 0),
          MINUTES
        );
      }
      if (!isNullLike(privateTaker)) {
        expect(bidStateAcc.privateTaker!.toString()).to.eq(
          privateTaker.toString()
        );
      }
      if (!isNullLike(margin)) {
        expect(bidStateAcc.margin!.toString()).to.eq(margin.toString());
      }

      const currBidderLamports = await getLamports(owner.publicKey);
      const currBidStateLamports = await getLamports(bidState);

      if (margin) {
        //check bid acc final
        expect(currBidStateLamports).to.eq(await tcompSdk.getBidStateRent());
        //can't check diff, since need more state to calc toUpload
      } else {
        const bidRent = await tcompSdk.getBidStateRent();
        const bidDiff = amount.toNumber() - (prevBidAmount ?? 0);

        //check owner diff
        expect(currBidderLamports! - prevBidderLamports!).to.eq(
          -(bidDiff + (isNullLike(prevBidStateLamports) ? bidRent : 0))
        );
        //check bid acc diff
        expect(currBidStateLamports! - (prevBidStateLamports ?? 0)).to.eq(
          bidDiff + (isNullLike(prevBidStateLamports) ? bidRent : 0)
        );
        //check bid acc final
        expect(currBidStateLamports).to.eq(bidRent + amount.toNumber());
      }
    }
  );

  return { sig };
};

export const testCancelCloseBid = async ({
  owner,
  bidId,
  amount,
  margin,
  forceClose = false,
}: {
  owner: Keypair;
  bidId: PublicKey;
  amount: BN;
  margin?: PublicKey | null;
  forceClose?: boolean;
}) => {
  let ixs: TransactionInstruction[];
  let bidState: PublicKey;

  if (forceClose) {
    ({
      tx: { ixs },
      bidState,
    } = await tcompSdk.closeExpiredBid({
      owner: owner.publicKey,
      bidId,
    }));
  } else {
    ({
      tx: { ixs },
      bidState,
    } = await tcompSdk.cancelBid({
      owner: owner.publicKey,
      bidId,
    }));
  }

  return await withLamports(
    {
      prevBidderLamports: owner.publicKey,
      prevBidStateLamports: bidState,
      ...(margin ? { prevMarginLamports: margin } : {}),
    },
    async ({
      prevBidderLamports,
      prevBidStateLamports,
      prevMarginLamports,
    }) => {
      const sig = await buildAndSendTx({
        ixs,
        extraSigners: forceClose ? [] : [owner],
      });
      console.log("✅ closed bid", sig);

      const currBidderLamports = await getLamports(owner.publicKey);
      const currBidStateLamports = (await getLamports(bidState)) ?? 0;

      //bid state closed
      expect(getAccount(bidState)).rejectedWith(ACCT_NOT_EXISTS_ERR);

      if (margin) {
        //no change in margin acc
        const currMarginLamports = await getLamports(margin);
        expect(currMarginLamports).to.eq(prevMarginLamports);
        //rent back
        expect(currBidderLamports! - prevBidderLamports!).to.eq(
          await tcompSdk.getBidStateRent()
        );
      } else {
        const bidRent = await tcompSdk.getBidStateRent();
        const toGetBack = amount.toNumber();
        //check owner diff
        expect(currBidderLamports! - prevBidderLamports!).to.eq(
          toGetBack + bidRent
        );
        //check bid acc diff
        expect((currBidStateLamports ?? 0) - prevBidStateLamports!).to.eq(
          -(toGetBack + bidRent)
        );
      }
    }
  );
};

export const testTakeBid = async ({
  target = BidTarget.AssetId,
  bidId,
  memTree,
  index,
  owner,
  seller,
  delegate = seller,
  merkleTree,
  metadata,
  minAmount,
  currency,
  takerBroker,
  optionalRoyaltyPct = 100,
  programmable = false,
  lookupTableAccount,
  canopyDepth = 0,
  margin,
}: {
  target?: BidTarget;
  bidId: PublicKey;
  memTree: MerkleTree;
  index: number;
  owner: PublicKey;
  seller: Keypair;
  delegate?: Keypair;
  merkleTree: PublicKey;
  metadata: MetadataArgs;
  minAmount: BN;
  currency?: PublicKey;
  takerBroker?: PublicKey;
  optionalRoyaltyPct?: number;
  programmable?: boolean;
  lookupTableAccount?: AddressLookupTableAccount;
  canopyDepth?: number;
  margin?: PublicKey;
}) => {
  let proof = memTree.getProof(
    index,
    false,
    DEFAULT_DEPTH_SIZE.maxDepth,
    false
  );
  const [tcomp] = findTCompPda({});

  const {
    tx: { ixs: takeIxs },
    bidState,
  } = await tcompSdk.takeBid({
    target,
    bidId,
    proof: proof.proof,
    seller: seller.publicKey,
    delegate: delegate?.publicKey,
    owner,
    merkleTree,
    metadata,
    root: [...proof.root],
    index,
    margin,
    minAmount: new BN(minAmount),
    optionalRoyaltyPct,
    takerBroker,
    canopyDepth,
    currency,
  });

  let sig;

  await withLamports(
    {
      prevBidderLamports: owner,
      prevBidStateLamports: bidState,
      ...(margin ? { prevMarginLamports: margin } : {}),
      ...(takerBroker ? { prevTakerBroker: takerBroker } : {}),
      prevFeeAccLamports: tcomp,
      prevSellerLamports: seller.publicKey,
    },
    async ({
      prevBidderLamports,
      prevBidStateLamports,
      prevMarginLamports,
      prevTakerBroker,
      prevFeeAccLamports,
      prevSellerLamports,
    }) => {
      sig = await buildAndSendTx({
        ixs: takeIxs,
        extraSigners: [delegate ?? seller],
        lookupTableAccounts: lookupTableAccount
          ? [lookupTableAccount]
          : undefined,
      });
      console.log("✅ bid accepted", sig);

      //nft moved to bidder
      await verifyCNft({
        index,
        merkleTree,
        metadata,
        owner: owner,
        delegate: owner,
        proof: proof.proof,
      });

      //bid state closed
      expect(getAccount(bidState)).rejectedWith(ACCT_NOT_EXISTS_ERR);

      const amount = minAmount.toNumber();
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

      // seller paid
      const currSellerLamports = await getLamports(seller.publicKey);
      //skip check for programmable, since you create additional PDAs that cost lamports (not worth tracking)
      if (!programmable) {
        expect(currSellerLamports! - prevSellerLamports!).eq(
          amount - tcompFee - brokerFee - creatorsFee
        );
      }

      // owner gets back rent
      const currBidderLamports = await getLamports(owner);
      expect(currBidderLamports! - prevBidderLamports!).equal(
        await tcompSdk.getBidStateRent()
      );

      // Sol escrow should have the NFT cost deducted
      if (!isNullLike(margin)) {
        const currMarginLamports = await getLamports(margin);
        expect(currMarginLamports! - prevMarginLamports!).eq(-1 * amount);
      } else {
        const currBidStateLamports = await getLamports(bidState);
        expect((currBidStateLamports ?? 0) - prevBidStateLamports!).eq(
          -1 * (amount + (await tcompSdk.getBidStateRent()))
        );
      }
    }
  );

  //update mem tree
  const { leaf } = await makeLeaf({
    index,
    merkleTree,
    metadata,
    owner,
    delegate: owner,
  });
  memTree.updateLeaf(index, leaf);

  return { sig };
};
