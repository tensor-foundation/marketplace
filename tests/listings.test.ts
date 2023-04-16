import { BN } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { beforeHook, testBuy, testList } from "./shared";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tcomp", () => {
  // TODO probably need a test for very long tree with / without canopy

  it("lists + buys", async () => {
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({ nrCreators, numMints: 3 });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testList({
          amount: new BN(LAMPORTS_PER_SOL),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
        });
        await testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          buyer: traderB,
          owner: traderA.publicKey,
        });
      }
    }
  });

  it.only("lists + buys (with canopy)", async () => {
    // TODO 0 1 4
    for (const nrCreators of [0]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({ nrCreators, numMints: 3, canopyDepth: 1 });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testList({
          amount: new BN(LAMPORTS_PER_SOL),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
        });
        await testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          buyer: traderB,
          owner: traderA.publicKey,
        });
      }
    }
  });
});
