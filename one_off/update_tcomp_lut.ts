import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { updateLUT } from "@tensor-hq/tensor-common";
import { findTreeAuthorityPda } from "../src";

const payer = Keypair.fromSecretKey(
  // TODO: replace with shared KP
  Uint8Array.from(require("/Users/ilmoi/.config/solana/id.json"))
);

const conn = new Connection("https://api.mainnet-beta.solana.com");

(async () => {
  const lookupTableAddress = new PublicKey(
    "E1TJWxyJNkRDYBYk1B92r1uUyfui7WZesv3u2YKG6ZE"
  );
  const lookupTableAccount = (
    await conn.getAddressLookupTable(lookupTableAddress)
  ).value;
  console.log("current LUT", lookupTableAccount);

  return;

  // --------------------------------------- migos
  const merkleTree = new PublicKey(
    "4FZcSBJkhPeNAkXecmKnnqHy93ABWzi3Q5u9eXkUfxVE"
  );
  const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
  const whitelist = new PublicKey(
    "hpjcd2qA2T1D1dtrNjD1RuDL2Ej3iSLWq6xo5fMiiwT"
  );

  const creators = [
    new PublicKey("EevH3LPRexR2431NSF6bCpBbPdQ2ViHbM1p84zujiEUs"),
    new PublicKey("D3pBAQAtRhWZyM9a5sakjEgpq2NUiZ8eYzHFvYmE5QL4"),
  ];

  await updateLUT({
    kp: payer,
    conn,
    lookupTableAddress,
    addresses: [merkleTree, treeAuthority, whitelist, ...creators],
  });
})();

//created E1TJWxyJNkRDYBYk1B92r1uUyfui7WZesv3u2YKG6ZE using Csua
