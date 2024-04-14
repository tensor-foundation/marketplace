// Parsed account from a raw tx.
import { PublicKey } from "@solana/web3.js";

export type ParsedAccount = {
  // See "getAccountByName" for name suffixes (these are the capitalized, space-separate names).
  name?: string | undefined;
  pubkey: PublicKey;
  isSigner: boolean;
  isWritable: boolean;
};
