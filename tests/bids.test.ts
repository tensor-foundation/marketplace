import { BN } from "@project-serum/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  beforeAllHook,
  beforeHook,
  tcompSdk,
  testBid,
  testCancelCloseBid,
  testTakeBid,
} from "./shared";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { waitMS } from "@tensor-hq/tensor-common";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tcomp bids", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  before(async () => {
    lookupTableAccount = (await beforeAllHook()) ?? undefined;
  });

  //can't fit in 4 creators without canopy :(
  it("bids + edits + accepts bid (with canopy)", async () => {
    const canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators,
          numMints: 2,
          tswap: true,
          canopyDepth,
        });

      const currency = Keypair.generate().publicKey;

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          assetId,
          currency,
          owner: traderB,
          prevBidAmount: 0,
          privateTaker: traderA.publicKey,
        });
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          assetId,
          currency,
          owner: traderB,
          prevBidAmount: LAMPORTS_PER_SOL,
          privateTaker: traderA.publicKey,
        });
        //try to take at the wrong price
        await expect(
          testTakeBid({
            currency,
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));
        await testTakeBid({
          currency,
          index,
          lookupTableAccount,
          memTree,
          merkleTree,
          metadata,
          minAmount: new BN(LAMPORTS_PER_SOL / 2),
          owner: traderB.publicKey,
          seller: traderA,
          canopyDepth,
        });
      }
    }
  });

  it("bids + cancels/closes", async () => {
    const canopyDepth = 10;
    for (const closeWithCosigner of [true, false]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 4,
          numMints: 2,
          tswap: true,
          canopyDepth,
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          assetId,
          owner: traderB,
          prevBidAmount: 0,
          privateTaker: traderA.publicKey,
          expireInSec: new BN(closeWithCosigner ? 0 : 10000),
        });
        if (closeWithCosigner) {
          //wait for bid to expire
          await waitMS(1000);
        }
        await testCancelCloseBid({
          amount: new BN(LAMPORTS_PER_SOL),
          assetId,
          closeWithCosigner,
          owner: traderB,
        });
      }
    }
  });
});
