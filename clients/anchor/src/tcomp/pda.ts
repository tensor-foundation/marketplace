import { PublicKey } from "@solana/web3.js";
import { BUBBLEGUM_PROGRAM_ID } from "@tensor-hq/tensor-common";
import { TCOMP_ADDR } from "./constants";

const FEES_PROGRAM_ID = new PublicKey("TFEEgwDP6nn1s8mMX2tTNPPz8j2VomkphLUmyxKm17A");

export const findTCompPda = ({ program }: { program?: PublicKey }) => {
  return PublicKey.findProgramAddressSync([], program ?? TCOMP_ADDR);
};

export const findFeeVaultPda = ({
  program = FEES_PROGRAM_ID,
  stateAccount,
}: {
  program?: PublicKey;
  stateAccount: PublicKey;
}) => {
  const shard = stateAccount.toBytes().slice(31);
  return PublicKey.findProgramAddressSync([Buffer.from("fee_vault"), shard], program)[0];
};

export const findBidStatePda = ({
  program,
  bidId,
  owner,
}: {
  program?: PublicKey;
  // If you want stackable bids use a random pubkey, if you want replaceable bids use targetId
  bidId: PublicKey;
  owner: PublicKey;
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("bid_state"), owner.toBytes(), bidId.toBytes()],
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

export const findNftEscrowPda = ({
  program,
  nftMint,
}: {
  program?: PublicKey;
  nftMint: PublicKey;
}) => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("nft_escrow"), nftMint.toBytes()],
    program ?? TCOMP_ADDR
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

export const findMintAuthorityPda = ({ mint }: { mint: PublicKey }) => {
  return PublicKey.findProgramAddressSync(
    [mint.toBytes()],
    BUBBLEGUM_PROGRAM_ID
  );
};
