import { BN } from "@project-serum/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  beforeAllHook,
  beforeHook,
  buildAndSendTx,
  delegateCNft,
  FEE_PCT,
  fetchAndCheckSingleIxTx,
  tcompSdk,
  testBid,
  testBuy,
  testCancelCloseBid,
  testEdit,
  testList,
  testTakeBid,
} from "./shared";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { waitMS } from "@tensor-hq/tensor-common";
import { makeNTraders } from "./account";
import { cpiEdit } from "./cpi_test";
import { TAKER_BROKER_PCT } from "../src";

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
          setupTswap: true,
          canopyDepth,
        });

      let currency = Keypair.generate().publicKey;

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          assetId,
          currency,
          owner: traderB,
        });

        //edit
        currency = Keypair.generate().publicKey;

        await testBid({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          assetId,
          currency,
          owner: traderB,
          prevBidAmount: LAMPORTS_PER_SOL,
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

  it("bids + takes (optional royalties)", async () => {
    for (const optionalRoyaltyPct of [0, 50, 100]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 1,
          numMints: 2,
          setupTswap: true,
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          assetId,
          owner: traderB,
        });
        await testTakeBid({
          index,
          lookupTableAccount,
          memTree,
          merkleTree,
          metadata,
          minAmount: new BN(LAMPORTS_PER_SOL),
          owner: traderB.publicKey,
          seller: traderA,
          optionalRoyaltyPct,
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
          setupTswap: true,
          canopyDepth,
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          assetId,
          owner: traderB,
          prevBidAmount: 0,
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

  it("tries to take with false creators", async () => {
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({
        nrCreators: 2,
        numMints: 2,
        setupTswap: true,
      });

    for (const { leaf, index, metadata, assetId } of leaves) {
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        assetId,
        owner: traderB,
      });
      //fake addresses
      await expect(
        testTakeBid({
          index,
          minAmount: new BN(LAMPORTS_PER_SOL),
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
          seller: traderA,
          owner: traderB.publicKey,
          lookupTableAccount,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("FailedLeafVerification"));
      //fake shares
      await expect(
        testTakeBid({
          index,
          minAmount: new BN(LAMPORTS_PER_SOL),
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
          seller: traderA,
          owner: traderB.publicKey,
          lookupTableAccount,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("FailedLeafVerification"));
      //fake verified
      await expect(
        testTakeBid({
          index,
          minAmount: new BN(LAMPORTS_PER_SOL),
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
          seller: traderA,
          owner: traderB.publicKey,
          lookupTableAccount,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("FailedLeafVerification"));
      await testTakeBid({
        index,
        minAmount: new BN(LAMPORTS_PER_SOL),
        memTree,
        merkleTree,
        metadata,
        seller: traderA,
        owner: traderB.publicKey,
        lookupTableAccount,
      });
    }
  });

  it("bids + takes (with delegate)", async () => {
    let canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators,
          numMints: 2,
          canopyDepth,
          setupTswap: true,
        });
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
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          assetId,
          owner: traderB,
        });
        await testTakeBid({
          index,
          minAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          seller: traderA,
          owner: traderB.publicKey,
          canopyDepth,
          delegate,
        });
      }
    }
  });

  it("bids + takes (expired listing)", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({ nrCreators: 4, numMints: 2, canopyDepth });

    for (const { leaf, index, metadata, assetId } of leaves) {
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        assetId,
        owner: traderB,
        expireInSec: new BN(1),
      });
      await waitMS(3000);
      //time expires, fails to buy
      await expect(
        testTakeBid({
          index,
          minAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          seller: traderA,
          owner: traderB.publicKey,
          canopyDepth,
          lookupTableAccount,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("OfferExpired"));
      await testBid({
        assetId,
        amount: new BN(LAMPORTS_PER_SOL),
        owner: traderA,
        expireInSec: new BN(100),
      });
      await testTakeBid({
        index,
        minAmount: new BN(LAMPORTS_PER_SOL),
        memTree,
        merkleTree,
        metadata,
        seller: traderA,
        owner: traderB.publicKey,
        canopyDepth,
        lookupTableAccount,
      });
    }
  });

  it("edits the taker", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({
        nrCreators: 4,
        numMints: 2,
        canopyDepth,
        setupTswap: true,
      });
    const [traderC] = await makeNTraders(1);

    for (const { leaf, index, metadata, assetId } of leaves) {
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        assetId,
        owner: traderB,
        privateTaker: traderC.publicKey, //C whitelisted
      });
      //fails to buy with wrong taker
      await expect(
        testTakeBid({
          index,
          minAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          seller: traderA, //A can't sell
          owner: traderB.publicKey,
          canopyDepth,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("TakerNotAllowed"));
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        assetId,
        owner: traderB,
        privateTaker: null,
        prevBidAmount: LAMPORTS_PER_SOL,
      });
      await testTakeBid({
        index,
        minAmount: new BN(LAMPORTS_PER_SOL),
        memTree,
        merkleTree,
        metadata,
        seller: traderA, //A can now sell
        owner: traderB.publicKey,
        canopyDepth,
      });
    }
  });

  it("parses bid txs ok", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({
        nrCreators: 4,
        numMints: 2,
        canopyDepth,
        setupTswap: true,
      });
    const [traderC] = await makeNTraders(1);

    for (const { leaf, index, metadata, assetId } of leaves) {
      let amount = LAMPORTS_PER_SOL;
      let currency = Keypair.generate().publicKey;

      // --------------------------------------- Bid

      {
        const { sig } = await testBid({
          amount: new BN(amount),
          assetId,
          owner: traderB,
          privateTaker: traderA.publicKey,
          currency,
        });
        const ix = await fetchAndCheckSingleIxTx(sig!, "bid");
        const amounts = tcompSdk.getIxAmounts(ix);
        expect(amounts?.amount.toNumber()).eq(amount);
        expect(amounts?.currency?.toString()).eq(currency.toString());
      }

      // --------------------------------------- Take Bid

      {
        const { sig } = await testTakeBid({
          index,
          minAmount: new BN(amount),
          memTree,
          merkleTree,
          metadata,
          seller: traderA,
          owner: traderB.publicKey,
          canopyDepth,
          currency,
          optionalRoyaltyPct: 100,
        });
        const ix = await fetchAndCheckSingleIxTx(sig!, "takeBid");
        const amounts = tcompSdk.getIxAmounts(ix);
        expect(amounts?.amount.toNumber()).eq(amount);
        expect(amounts?.currency?.toString()).eq(currency.toString());
        if (TAKER_BROKER_PCT > 0) {
          expect(amounts?.brokerFee?.toNumber()).eq(
            Math.trunc((amount * FEE_PCT * TAKER_BROKER_PCT) / 100)
          );
        }
        expect(amounts?.tcompFee?.toNumber()).eq(
          Math.trunc(amount * FEE_PCT * (1 - TAKER_BROKER_PCT / 100))
        );
        expect(amounts?.creatorFee?.toNumber()).eq(
          Math.trunc((amount * metadata.sellerFeeBasisPoints) / 10000)
        );
      }
    }
  });
});
