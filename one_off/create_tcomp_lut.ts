import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import {
  AUTH_PROG_ID,
  createLUT,
  TENSORSWAP_ADDR,
  TMETA_PROG_ID,
} from "@tensor-hq/tensor-common";
import { BUBBLEGUM_PROGRAM_ID, findTCompPda, TCOMP_ADDR } from "../src";

const payer = Keypair.fromSecretKey(
  // TODO: replace with shared KP
  Uint8Array.from(require("/Users/ilmoi/.config/solana/id.json"))
);

const conn = new Connection("https://api.mainnet-beta.solana.com");

(async () => {
  const [tcomp] = findTCompPda({});
  await createLUT({
    kp: payer,
    conn,
    addresses: [
      //compression
      SPL_NOOP_PROGRAM_ID,
      SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      //solana
      SystemProgram.programId,
      TOKEN_PROGRAM_ID, //for future token payments
      ASSOCIATED_TOKEN_PROGRAM_ID,
      SYSVAR_RENT_PUBKEY,
      SYSVAR_INSTRUCTIONS_PUBKEY,
      //mplex
      BUBBLEGUM_PROGRAM_ID,
      AUTH_PROG_ID,
      TMETA_PROG_ID,
      //tensor
      tcomp,
      TCOMP_ADDR,
      TENSORSWAP_ADDR, //margin
    ],
  });
})();

//created E1TJWxyJNkRDYBYk1B92r1uUyfui7WZesv3u2YKG6ZE using Csua
