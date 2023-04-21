import * as anchor from "@project-serum/anchor";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import {
  SingleConnectionBroadcaster,
  SolanaProvider,
  TransactionEnvelope,
} from "@saberhq/solana-contrib";
import {
  AddressLookupTableAccount,
  AddressLookupTableProgram,
  Commitment,
  ConfirmOptions,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from "@solana/web3.js";
import { backOff } from "exponential-backoff";
import { resolve } from "path";
import {
  BUBBLEGUM_PROGRAM_ID,
  FEE_BPS,
  findTCompPda,
  isNullLike,
  TAKER_BROKER_PCT,
  TCompSDK,
} from "../src";
import { getLamports as _getLamports } from "../src/shared";
import {
  AUTH_PROG_ID,
  buildTx,
  buildTxV0,
  TMETA_PROG_ID,
  waitMS,
} from "@tensor-hq/tensor-common";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
  ValidDepthSizePair,
} from "@solana/spl-account-compression";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { TENSORSWAP_ADDR } from "@tensor-hq/tensorswap-sdk";

// Exporting these here vs in each .test.ts file prevents weird undefined issues.
export { hexCode, stringifyPKsAndBNs } from "../src";

export { waitMS } from "@tensor-hq/tensor-common";

export const ACCT_NOT_EXISTS_ERR = "Account does not exist";
// Vipers IntegerOverflow error.
export const INTEGER_OVERFLOW_ERR = "0x44f";
export const HAS_ONE_ERR = "0x7d1";
export const ALRADY_IN_USE_ERR = "0x0";

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
  provider?;
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
