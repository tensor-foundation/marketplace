import { PublicKey } from "@solana/web3.js";
import { TCOMP_ADDR } from "./constants";

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
    [Buffer.from("bid_state"), assetId.toBytes()],
    program ?? TCOMP_ADDR
  );
};
