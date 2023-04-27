import { BN } from "@project-serum/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { beforeAllHook, beforeHook, testBid, testTakeBid } from "./shared";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tcomp bids", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  before(async () => {
    lookupTableAccount = (await beforeAllHook()) ?? undefined;
  });

  //can't fit in 4 creators without canopy :(
  it.only("bids + edits + accepts bid (with canopy)", async () => {
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
          amount: new BN(LAMPORTS_PER_SOL * 2),
          assetId,
          currency,
          owner: traderB,
          prevBidAmount: LAMPORTS_PER_SOL,
          privateTaker: traderA.publicKey,
        });
        await testTakeBid({
          currency,
          index,
          lookupTableAccount,
          memTree,
          merkleTree,
          metadata,
          minAmount: new BN(LAMPORTS_PER_SOL * 2),
          owner: traderB.publicKey,
          seller: traderA,
          canopyDepth,
        });
      }
    }
  });
});
