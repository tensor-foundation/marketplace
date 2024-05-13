import { findListStatePda, TCOMP_ADDR } from "../../src";
import { BN, Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { TEST_PROVIDER } from "../shared";
import { CpiTest, IDL } from "./idl/cpi_test";
import { getLeafAssetId } from "@tensor-hq/tensor-common";

export const cpiEdit = async ({
  merkleTree,
  owner,
  nonce,
  amount,
  expireInSec = null,
  currency = null,
  privateTaker = null,
  makerTaker = null,
}: {
  merkleTree: PublicKey;
  owner: PublicKey;
  nonce: BN;
  amount: BN;
  expireInSec?: BN | null;
  currency?: PublicKey | null;
  privateTaker?: PublicKey | null;
  makerTaker?: PublicKey | null;
}) => {
  const program = new Program<CpiTest>(
    IDL,
    new PublicKey("5zABSn1WYLHYenFtTFcM5AHdJjnHkx6S85rkWkFzLExq"),
    TEST_PROVIDER
  );

  const assetId = getLeafAssetId(merkleTree, nonce);
  const [listState] = findListStatePda({ assetId });

  const builder = program.methods
    .cpi(amount, expireInSec, currency, privateTaker, makerTaker)
    .accounts({
      owner,
      listState,
      marketplaceProgram: TCOMP_ADDR,
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
