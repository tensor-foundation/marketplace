import {
  AddressLookupTableProgram,
  Commitment,
  Connection,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import { buildAndSendTx, TEST_PROVIDER } from "../tests/shared";
import { AnchorProvider, Wallet } from "@project-serum/anchor";
import { findTreeAuthorityPda } from "../src";
import { waitMS } from "@tensor-hq/tensor-common";

const payer = Keypair.fromSecretKey(
  Uint8Array.from(require("/Users/ilmoi/.config/solana/id.json"))
);

const conn = new Connection("https://api.mainnet-beta.solana.com");

// --------------------------------------- replicating these coz when doing mainnnet blockhash issues come up

export const updateLUT = async ({
  provider = TEST_PROVIDER,
  committment = "finalized",
  lookupTableAddress,
  addresses,
}: {
  provider?: AnchorProvider;
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

// --------------------------------------- end

(async () => {
  console.log("lfg");
  const wallet = new Wallet(payer);
  const provider = new AnchorProvider(conn, wallet, {});
  const lookupTableAddress = new PublicKey(
    "E1TJWxyJNkRDYBYk1B92r1uUyfui7WZesv3u2YKG6ZE"
  );

  // --------------------------------------- migos
  const merkleTree = new PublicKey(
    "GNsnin9c2nDGp78E69tGXyMScWfysnu2PuxQxXy1jh3R"
  );
  const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
  //uuid = 0b3644da-55d9-4fc0-a531-bd8bd49501ab
  const whitelist = new PublicKey(
    "CVB1bV8dd5gEktXrP6cEvfVjuNnieQADGomWvdv8Yh1n"
  );

  await updateLUT({
    provider,
    lookupTableAddress,
    addresses: [merkleTree, treeAuthority, whitelist],
  });
})();

//created E1TJWxyJNkRDYBYk1B92r1uUyfui7WZesv3u2YKG6ZE using Csua
