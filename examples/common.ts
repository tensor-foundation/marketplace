import { address, getAddressEncoder } from "@solana/addresses";
import { createSolanaRpc } from "@solana/rpc";

// First 32 bytes == private key
// Last 32 bytes == public key
// If you want to actually sign + send tx, you need to prepend your private key bytes instead of 32 zero-bytes.
// For simulations, having only the publickey part is sufficient! You can leave the first 32 bytes as zero-bytes since nothing needs to get signed.
export const keypairBytes = new Uint8Array([
  ...new Uint8Array(32).map(() => 0),
  ...getAddressEncoder().encode(
    address("4zdNGgAtFsW1cQgHqkiWyRsxaAgxrSRRynnuunxzjxue"),
  ),
]);
export const helius_url =
  "https://mainnet.helius-rpc.com/?api-key=<YOUR_HELIUS_RPC_API_KEY>";
export const rpc = createSolanaRpc(helius_url);
export const SYSTEM_PROGRAM = "11111111111111111111111111111111";
