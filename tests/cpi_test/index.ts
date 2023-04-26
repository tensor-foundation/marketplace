import { findListStatePda, TCOMP_ADDR } from "../../src";
import { BN, Program } from "@project-serum/anchor";
import { getLeafAssetId } from "@metaplex-foundation/mpl-bubblegum";
import { PublicKey } from "@solana/web3.js";
import { TEST_PROVIDER } from "../utils";
import { CpiTest, IDL } from "./idl/cpi_test";

export const cpiEdit = async ({
  merkleTree,
  owner,
  nonce,
  amount,
  expireInSec = null,
  currency = null,
  privateTaker = null,
}: {
  merkleTree: PublicKey;
  owner: PublicKey;
  nonce: BN;
  amount: BN;
  expireInSec?: BN | null;
  currency?: PublicKey | null;
  privateTaker?: PublicKey | null;
}) => {
  const program = new Program<CpiTest>(
    IDL,
    new PublicKey("5zABSn1WYLHYenFtTFcM5AHdJjnHkx6S85rkWkFzLExq"),
    TEST_PROVIDER
  );

  const assetId = await getLeafAssetId(merkleTree, nonce);
  const [listState] = findListStatePda({ assetId });

  const builder = program.methods
    .cpi(nonce, amount, expireInSec, currency, privateTaker)
    .accounts({
      merkleTree,
      owner,
      listState,
      tcompProgram: TCOMP_ADDR,
    });

  return {
    builder,
    tx: {
      ixs: [await builder.instruction()],
      extraSigners: [],
    },
    assetId,
    listState,
  };
};
