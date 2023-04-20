import { BN } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  beforeAllHook,
  beforeHook,
  testBuy,
  testDelist,
  testList,
} from "./shared";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { tcompSdk, updateLUT } from "./utils";
import { findTreeAuthorityPda } from "../src";
import { waitMS } from "@tensor-hq/tensor-common";
import { makeNTraders } from "./account";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tcomp", () => {
  let lookupTableAccount;
  before(async () => {
    lookupTableAccount = await beforeAllHook();
  });

  //each creator costs 35 bytes in total
  it("lists + edits + buys (no canopy)", async () => {
    for (const nrCreators of [4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators,
          numMints: 3,
          depthSizePair: { maxDepth: 5, maxBufferSize: 8 },
        });

      //for this test only, since we're not using the canopy, add tree and authority to the LUT
      const [treeAuthority] = findTreeAuthorityPda({ merkleTree });

      await updateLUT({
        lookupTableAddress: lookupTableAccount.key,
        addresses: [merkleTree, treeAuthority],
      });

      for (const { leaf, index, metadata, assetId } of leaves) {
        //list 1st time
        await testList({
          amount: new BN(LAMPORTS_PER_SOL),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          lookupTableAccount,
        });
        //relist at a different price (higher)
        await testList({
          amount: new BN(LAMPORTS_PER_SOL * 2),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          lookupTableAccount,
        });
        //try to buy at the wrong price
        await expect(
          testBuy({
            index,
            maxAmount: new BN(LAMPORTS_PER_SOL),
            memTree,
            merkleTree,
            metadata,
            buyer: traderB,
            owner: traderA.publicKey,
            lookupTableAccount,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));
        //relist at a different price (lower)
        await testList({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          lookupTableAccount,
        });
        //buy at the correct price
        await testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL / 2),
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

  it("lists + edits + buys (with canopy)", async () => {
    let canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({ nrCreators, numMints: 3, canopyDepth });

      for (const { leaf, index, metadata, assetId } of leaves) {
        //list 1st time
        await testList({
          amount: new BN(LAMPORTS_PER_SOL),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          canopyDepth,
          // lookupTableAccount, //<-- intentionally not passing
        });
        //relist at a different price (higher)
        await testList({
          amount: new BN(LAMPORTS_PER_SOL * 2),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          canopyDepth,
          // lookupTableAccount, //<-- intentionally not passing
        });
        //try to buy at the wrong price
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
            // lookupTableAccount, //<-- intentionally not passing
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));
        //relist at a different price (lower)
        await testList({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          lookupTableAccount,
          canopyDepth,
          // lookupTableAccount, //<-- intentionally not passing
        });
        //buy at the correct price
        await testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL / 2),
          memTree,
          merkleTree,
          metadata,
          buyer: traderB,
          owner: traderA.publicKey,
          canopyDepth,
          // lookupTableAccount, //<-- intentionally not passing
        });
      }
    }
  });

  it("lists + delists (with canopy)", async () => {
    let canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({ nrCreators, numMints: 2, canopyDepth });

      for (const { leaf, index, metadata, assetId } of leaves) {
        //list 1st time
        await testList({
          amount: new BN(LAMPORTS_PER_SOL),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          canopyDepth,
          // lookupTableAccount, //<-- intentionally not passing
        });
        //fails with wrong trader
        await expect(
          testDelist({
            index,
            memTree,
            merkleTree,
            metadata,
            owner: traderB,
          })
        ).to.be.rejectedWith("0x7d1");
        //succeeds with correct trader
        await testDelist({
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
        });
      }
    }
  });

  it("lists + edits + buys (expired listing)", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({ nrCreators: 4, numMints: 2, canopyDepth });

    for (const { leaf, index, metadata, assetId } of leaves) {
      //lists 1st time
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
      //waits
      await waitMS(3000);
      //time expires, fails to buy
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
      //relists with more expiry
      await testList({
        amount: new BN(LAMPORTS_PER_SOL),
        index,
        memTree,
        merkleTree,
        metadata,
        owner: traderA,
        canopyDepth,
        expireInSec: new BN(100),
      });
      //succeeds this time
      await testBuy({
        index,
        maxAmount: new BN(LAMPORTS_PER_SOL),
        memTree,
        merkleTree,
        metadata,
        buyer: traderB,
        owner: traderA.publicKey,
        canopyDepth,
      });
    }
  });

  it("lists + buys (private taker)", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({ nrCreators: 4, numMints: 2, canopyDepth });
    const [traderC] = await makeNTraders(1);

    for (const { leaf, index, metadata, assetId } of leaves) {
      //lists 1st time
      await testList({
        amount: new BN(LAMPORTS_PER_SOL),
        index,
        memTree,
        merkleTree,
        metadata,
        owner: traderA,
        canopyDepth,
        privateTaker: traderB.publicKey,
      });
      //fails to buy with wrong taker
      await expect(
        testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          buyer: traderC,
          owner: traderA.publicKey,
          canopyDepth,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("TakerNotAllowed"));
      //succeeds with correct taker
      await testBuy({
        index,
        maxAmount: new BN(LAMPORTS_PER_SOL),
        memTree,
        merkleTree,
        metadata,
        buyer: traderB,
        owner: traderA.publicKey,
        canopyDepth,
      });
    }
  });

  it("edits the taker", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({ nrCreators: 4, numMints: 2, canopyDepth });
    const [traderC] = await makeNTraders(1);

    for (const { leaf, index, metadata, assetId } of leaves) {
      //lists 1st time
      await testList({
        amount: new BN(LAMPORTS_PER_SOL),
        index,
        memTree,
        merkleTree,
        metadata,
        owner: traderA,
        canopyDepth,
        privateTaker: traderB.publicKey,
      });
      //fails to buy with wrong taker
      await expect(
        testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          buyer: traderC,
          owner: traderA.publicKey,
          canopyDepth,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("TakerNotAllowed"));
      //edits the listing to remove private taker
      await testList({
        amount: new BN(LAMPORTS_PER_SOL),
        index,
        memTree,
        merkleTree,
        metadata,
        owner: traderA,
        canopyDepth,
        privateTaker: null,
      });
      //succeeds with correct taker
      await testBuy({
        index,
        maxAmount: new BN(LAMPORTS_PER_SOL),
        memTree,
        merkleTree,
        metadata,
        buyer: traderC, //<-- importantly C not B
        owner: traderA.publicKey,
        canopyDepth,
      });
    }
  });
});
