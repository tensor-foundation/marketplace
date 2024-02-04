import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import Mexp from "math-expression-evaluator";

export const DEFAULT_COMPUTE_UNITS = 200_000;
export const DEFAULT_XFER_COMPUTE_UNITS = 400_000; // cNFT xfers eg in sell now w/ margin more expensive
export const DEFAULT_MICRO_LAMPORTS = 5_000;
export const DEFAULT_RULESET_ADDN_COMPUTE_UNITS = 400_000;

export type AccountSuffix =
  | "Bid State"
  | "List State"
  | "Owner"
  | "Buyer"
  | "Seller"
  | "Delegate"
  | "Payer"
  | "Margin Account"
  | "Taker Broker"
  | "Maker Broker"
  | "Whitelist";

export const evalMathExpr = (str: string) => {
  const mexp = new Mexp();
  return mexp.eval(str, [], {});
};

//todo: move to common
export const findAta = (mint: PublicKey, owner: PublicKey): PublicKey => {
  return findAtaWithProgramId(mint, owner, TOKEN_PROGRAM_ID);
};

export const findAtaWithProgramId = (
  mint: PublicKey,
  owner: PublicKey,
  programId: PublicKey
): PublicKey => {
  return getAssociatedTokenAddressSync(mint, owner, true, programId);
};
