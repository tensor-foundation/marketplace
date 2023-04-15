import { PublicKey } from "@solana/web3.js";
import { TCOMP_ADDR } from "./constants";
import BN from "bn.js";
import { BUBBLEGUM_PROGRAM_ID } from "./sdk";

export const findBidStatePda = ({
  program,
  assetId,
  owner,
}: {
  program?: PublicKey;
  assetId: PublicKey;
  owner: PublicKey;
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("bid_state"), owner.toBytes(), assetId.toBytes()],
    program ?? TCOMP_ADDR
  );
};
export const findListStatePda = ({
  program,
  assetId,
}: {
  program?: PublicKey;
  assetId: PublicKey;
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("list_state"), assetId.toBytes()],
    program ?? TCOMP_ADDR
  );
};

export const findAssetId = ({
  merkleTree,
  //TODO index or nonce?
  nonce,
}: {
  merkleTree: PublicKey;
  nonce: BN;
}) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("asset", "utf8"),
      merkleTree.toBytes(),
      Uint8Array.from(nonce.toArray("le", 8)),
    ],
    BUBBLEGUM_PROGRAM_ID
  );
};

export const findTreeAuthorityPda = ({
  merkleTree,
}: {
  merkleTree: PublicKey;
}) => {
  return PublicKey.findProgramAddressSync(
    [merkleTree.toBytes()],
    BUBBLEGUM_PROGRAM_ID
  );
};
