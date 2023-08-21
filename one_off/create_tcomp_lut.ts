import {
  AddressLookupTableProgram,
  Commitment,
  Connection,
  Keypair,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { buildAndSendTx, TEST_PROVIDER } from "../tests/shared";
import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import { BUBBLEGUM_PROGRAM_ID, findTCompPda, TCOMP_ADDR } from "../src";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  AUTH_PROG_ID,
  TENSORSWAP_ADDR,
  TMETA_PROG_ID,
  waitMS,
} from "@tensor-hq/tensor-common";

const payer = Keypair.fromSecretKey(
  Uint8Array.from(require("/Users/ilmoi/.config/solana/id.json"))
);

const conn = new Connection("https://api.mainnet-beta.solana.com");

// --------------------------------------- replicating these coz when doing mainnnet blockhash issues come up

export const createLUT = async (
  provider = TEST_PROVIDER,
  slotCommitment: Commitment = "finalized"
) => {
  const conn = provider.connection;

  //use finalized, otherwise get "is not a recent slot err"
  const slot = await conn.getSlot(slotCommitment);

  //needed else we keep refetching the blockhash
  const blockhash = (await conn.getLatestBlockhash(slotCommitment)).blockhash;
  console.log("blockhash", blockhash);

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

  let done = false;
  while (!done) {
    try {
      await buildAndSendTx({
        provider,
        ixs: [lookupTableInst, extendInstruction],
        blockhash,
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

// --------------------------------------- end

(async () => {
  console.log("lfg");
  const wallet = new Wallet(payer);
  const provider = new AnchorProvider(conn, wallet, {});
  await createLUT(provider);
})();

//created E1TJWxyJNkRDYBYk1B92r1uUyfui7WZesv3u2YKG6ZE using Csua
