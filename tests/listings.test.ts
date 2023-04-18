import { BN } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { beforeAllHook, beforeHook, testBuy, testList } from "./shared";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { tcompSdk, updateLUT } from "./utils";
import { findTreeAuthorityPda } from "../src";
import { waitMS } from "@tensor-hq/tensor-common";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tcomp", () => {
  let lookupTableAccount;
  before(async () => {
    lookupTableAccount = await beforeAllHook();
  });

  // TODO: why does it always fail with the same size (1680)? is there nothing we can do?
  it("lists + buys (no canopy - max fits 0 creators)", async () => {
    for (const nrCreators of [0]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({ nrCreators, numMints: 3 });

      //for this test only, since we're not using the canopy, add tree and authority to the LUT
      const [treeAuthority] = findTreeAuthorityPda({ merkleTree });

      await updateLUT({
        lookupTableAddress: lookupTableAccount.key,
        addresses: [merkleTree, treeAuthority],
      });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testList({
          amount: new BN(LAMPORTS_PER_SOL),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          lookupTableAccount,
        });
        await testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          buyer: traderB,
          owner: traderA.publicKey,
          lookupTableAccount,
        });
      }
    }
  });

  it("lists + buys (with canopy)", async () => {
    let canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({ nrCreators, numMints: 3, canopyDepth });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testList({
          amount: new BN(LAMPORTS_PER_SOL),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          canopyDepth,
          //intentionally not passing in LUT - canopy should take care of size
        });
        await testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          buyer: traderB,
          owner: traderA.publicKey,
          canopyDepth,
          //intentionally not passing in LUT - canopy should take care of size
        });
      }
    }
  });

  it("lists + buys (expired listing)", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({ nrCreators: 4, numMints: 2, canopyDepth });

    for (const { leaf, index, metadata, assetId } of leaves) {
      await testList({
        amount: new BN(LAMPORTS_PER_SOL),
        index,
        memTree,
        merkleTree,
        metadata,
        owner: traderA,
        canopyDepth,
        expireInSec: new BN(1),
      });

      await waitMS(3000);

      await expect(
        testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          buyer: traderB,
          owner: traderA.publicKey,
          canopyDepth,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("OfferExpired"));
    }
  });
});
