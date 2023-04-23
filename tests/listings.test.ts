import { BN } from "@project-serum/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  beforeAllHook,
  beforeHook,
  delegateCNft,
  testBuy,
  testDelist,
  testEdit,
  testList,
} from "./shared";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { ALREADY_IN_USE_ERR, HAS_ONE_ERR, tcompSdk } from "./utils";
import { waitMS } from "@tensor-hq/tensor-common";
import { makeNTraders } from "./account";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tcomp", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  before(async () => {
    lookupTableAccount = (await beforeAllHook()) ?? undefined;
  });

  it("lists + edits + buys (no canopy)", async () => {
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators,
          numMints: 3,
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        //list
        await testList({
          amount: new BN(LAMPORTS_PER_SOL),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          lookupTableAccount,
        });
        //can't list again
        await expect(
          testList({
            amount: new BN(LAMPORTS_PER_SOL),
            index,
            memTree,
            merkleTree,
            metadata,
            owner: traderA,
            lookupTableAccount,
          })
        ).to.be.rejectedWith(ALREADY_IN_USE_ERR);
        //edit the price (up)
        await testEdit({
          amount: new BN(LAMPORTS_PER_SOL * 2),
          index,
          merkleTree,
          owner: traderA,
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
        //edit the price again (down)
        await testEdit({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          index,
          merkleTree,
          owner: traderA,
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

  it("tries to buy with false creators", async () => {
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({
        nrCreators: 4,
        numMints: 2,
      });

    for (const { leaf, index, metadata, assetId } of leaves) {
      //list
      await testList({
        amount: new BN(LAMPORTS_PER_SOL),
        index,
        memTree,
        merkleTree,
        metadata,
        owner: traderA,
        lookupTableAccount,
      });
      //fake addresses
      await expect(
        testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata: {
            ...metadata,
            creators: metadata.creators.map((c) => ({
              address: Keypair.generate().publicKey, //wrong
              verified: false,
              share: c.share,
            })),
          },
          buyer: traderB,
          owner: traderA.publicKey,
          lookupTableAccount,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("FailedLeafVerification"));
      //fake shares
      await expect(
        testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata: {
            ...metadata,
            creators: metadata.creators.map((c, i) => ({
              address: c.address,
              verified: false,
              share: i === 0 ? 85 : 5, //wrong
            })),
          },
          buyer: traderB,
          owner: traderA.publicKey,
          lookupTableAccount,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("FailedLeafVerification"));
      //fake verified
      await expect(
        testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata: {
            ...metadata,
            creators: metadata.creators.map((c) => ({
              address: c.address,
              verified: true, //wrong
              share: c.share,
            })),
          },
          buyer: traderB,
          owner: traderA.publicKey,
          lookupTableAccount,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("FailedLeafVerification"));
      //finally buy
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
  });

  it("lists + buys (separate payer)", async () => {
    for (const nrCreators of [4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators,
          numMints: 2,
          depthSizePair: { maxDepth: 5, maxBufferSize: 8 },
        });

      const [payer] = await makeNTraders(1);

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testList({
          amount: new BN(LAMPORTS_PER_SOL),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          lookupTableAccount,
          payer,
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
          payer,
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
        //list
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
        //edit the price (up)
        await testEdit({
          amount: new BN(LAMPORTS_PER_SOL * 2),
          index,
          merkleTree,
          owner: traderA,
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
        //buy at the correct price
        await testBuy({
          index,
          maxAmount: new BN(LAMPORTS_PER_SOL * 2),
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

  it("lists + buys (with delegate)", async () => {
    let canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({ nrCreators, numMints: 3, canopyDepth });
      const [delegate, payer] = await makeNTraders(2);

      for (const { leaf, index, metadata, assetId } of leaves) {
        //delegate the NFT to traderC
        await delegateCNft({
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          canopyDepth,
          newDelegate: delegate.publicKey,
        });
        //list using delegate
        await testList({
          amount: new BN(LAMPORTS_PER_SOL),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          delegate: delegate, ///<-- trader C signs
          canopyDepth,
          payer, //<-- separate payer
        });
        //buy
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
        ).to.be.rejectedWith(HAS_ONE_ERR);
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
      await testEdit({
        amount: new BN(LAMPORTS_PER_SOL),
        index,
        merkleTree,
        owner: traderA,
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
      //lists
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
      await testEdit({
        amount: new BN(LAMPORTS_PER_SOL),
        index,
        merkleTree,
        owner: traderA,
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
