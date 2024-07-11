import { getBase58Encoder, createSolanaRpc } from "@solana/web3.js";

// Your private key as a base58 string as input
export const keypairBytes = new Uint8Array(getBase58Encoder().encode("YOUR_PRIV_KEY_AS_BASE58_STRING"));
// or alternatively directly as an array of 64 bytes like this:
// export const keypairBytes = new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
export const helius_url = "https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_RPC_KEY";
export const rpc = createSolanaRpc(helius_url);