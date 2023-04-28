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
  FEE_PCT,
  fetchAndCheckSingleIxTx,
  getLamports,
  INTEGER_OVERFLOW_ERR,
  tcompSdk,
  testBid,
  testCancelCloseBid,
  testTakeBid,
} from "./shared";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { waitMS } from "@tensor-hq/tensor-common";
import { makeNTraders } from "./account";
import { BidTarget, TAKER_BROKER_PCT } from "../src";
import {
  testDepositIntoMargin,
  testMakeMargin,
  testWithdrawFromMargin,
} from "./tswap";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tcomp bids", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  before(async () => {
    lookupTableAccount = (await beforeAllHook()) ?? undefined;
  });

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
          targetId: assetId,
          currency,
          owner: traderB,
        });

        //edit
        currency = Keypair.generate().publicKey;

        await testBid({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          targetId: assetId,
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
            targetId: assetId,
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
          targetId: assetId,
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
          targetId: assetId,
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
          targetId: assetId,
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
          targetId: assetId,
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
        targetId: assetId,
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
          targetId: assetId,
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
          targetId: assetId,
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
          targetId: assetId,
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
        targetId: assetId,
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
          targetId: assetId,
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
          targetId: assetId,
        });
      }
    }
  });

  it("bids + takes (expired listing)", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({
        nrCreators: 4,
        numMints: 2,
        canopyDepth,
        setupTswap: true,
      });

    for (const { leaf, index, metadata, assetId } of leaves) {
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        targetId: assetId,
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
          targetId: assetId,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("OfferExpired"));
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        targetId: assetId,
        owner: traderB,
        expireInSec: new BN(1000),
        prevBidAmount: LAMPORTS_PER_SOL,
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
        targetId: assetId,
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
        targetId: assetId,
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
          targetId: assetId,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("TakerNotAllowed"));
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        targetId: assetId,
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
        targetId: assetId,
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
    const takerBroker = Keypair.generate().publicKey;

    for (const { leaf, index, metadata, assetId } of leaves) {
      let amount = LAMPORTS_PER_SOL;
      let currency = Keypair.generate().publicKey;

      // --------------------------------------- Bid

      {
        const { sig } = await testBid({
          amount: new BN(amount),
          targetId: assetId,
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
          takerBroker,
          targetId: assetId,
        });
        const ix = await fetchAndCheckSingleIxTx(sig!, "takeBidMetaHash");
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

  // --------------------------------------- margin

  it("margin buy: works", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({
        nrCreators: 4,
        numMints: 2,
        canopyDepth,
        setupTswap: true,
      });

    for (const { leaf, index, metadata, assetId } of leaves) {
      const { marginPda, marginNr, marginRent } = await testMakeMargin({
        owner: traderB,
      });
      await testDepositIntoMargin({
        owner: traderB,
        marginNr,
        marginPda,
        amount: LAMPORTS_PER_SOL,
      });
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        targetId: assetId,
        owner: traderB,
        privateTaker: null,
        margin: marginPda,
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
        margin: marginPda,
        targetId: assetId,
      });
    }
  });

  it("margin buy: edit", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({
        nrCreators: 4,
        numMints: 2,
        canopyDepth,
        setupTswap: true,
      });

    for (const { leaf, index, metadata, assetId } of leaves) {
      const { marginPda, marginNr, marginRent } = await testMakeMargin({
        owner: traderB,
      });
      await testDepositIntoMargin({
        owner: traderB,
        marginNr,
        marginPda,
        amount: LAMPORTS_PER_SOL,
      });
      // do a non-marginated bid
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        targetId: assetId,
        owner: traderB,
        privateTaker: null,
      });
      // do a marginated bid
      const bidderLamports1 = await getLamports(traderB.publicKey);
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        targetId: assetId,
        owner: traderB,
        privateTaker: null,
        margin: marginPda,
      });
      const bidderLamports2 = await getLamports(traderB.publicKey);
      //the amount that got initially deposited is returned to the bidder, since the order is now marginated
      expect(bidderLamports2! - bidderLamports1!).to.eq(LAMPORTS_PER_SOL);

      // non-marginated again
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        targetId: assetId,
        owner: traderB,
        privateTaker: null,
      });
      const bidderLamports3 = await getLamports(traderB.publicKey);
      //editing a bid to be non-marginated once again deposits lamports
      expect(bidderLamports3! - bidderLamports2!).to.eq(-LAMPORTS_PER_SOL);

      await testTakeBid({
        index,
        minAmount: new BN(LAMPORTS_PER_SOL),
        memTree,
        merkleTree,
        metadata,
        seller: traderA, //A can now sell
        owner: traderB.publicKey,
        canopyDepth,
        targetId: assetId,
      });
    }
  });

  it("margin buy: insufficient balance", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({
        nrCreators: 4,
        numMints: 2,
        canopyDepth,
        setupTswap: true,
      });

    for (const { leaf, index, metadata, assetId } of leaves) {
      const { marginPda, marginNr, marginRent } = await testMakeMargin({
        owner: traderB,
      });
      await testDepositIntoMargin({
        owner: traderB,
        marginNr,
        marginPda,
        amount: LAMPORTS_PER_SOL,
      });
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        targetId: assetId,
        owner: traderB,
        privateTaker: null,
        margin: marginPda,
      });
      //intentionally withdraw
      await testWithdrawFromMargin({
        owner: traderB,
        marginNr,
        marginPda,
        amount: 0.3 * LAMPORTS_PER_SOL,
        expectedLamports: 0.7 * LAMPORTS_PER_SOL,
      });
      await expect(
        testTakeBid({
          index,
          minAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          seller: traderA, //A can now sell
          owner: traderB.publicKey,
          canopyDepth,
          margin: marginPda,
          targetId: assetId,
        })
      ).to.be.rejectedWith(INTEGER_OVERFLOW_ERR);
    }
  });

  // --------------------------------------- VOC bids

  it("bids + edits + accepts bid (VOC)", async () => {
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
          target: BidTarget.Voc,
          targetId: metadata.collection!.key,
          owner: traderB,
        });
        //fails if try to change the target
        await expect(
          testBid({
            amount: new BN(LAMPORTS_PER_SOL / 2),
            target: BidTarget.AssetId, //wrong target
            targetId: metadata.collection!.key,
            owner: traderB,
            prevBidAmount: LAMPORTS_PER_SOL,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("CannotModifyTarget"));
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          target: BidTarget.Voc,
          targetId: metadata.collection!.key,
          owner: traderB,
          prevBidAmount: LAMPORTS_PER_SOL,
        });
        // -------------------- bas cases
        await expect(
          testTakeBid({
            target: BidTarget.AssetId, //wrong target
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
            targetId: metadata.collection!.key,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongIxForBidTarget"));
        await expect(
          testTakeBid({
            target: BidTarget.Fvc, //wrong target
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
            targetId: metadata.collection!.key,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongIxForBidTarget"));
        //can't do a bad case for Name since it's only used for picking branch js side and VOC branch will be picked correctly
        //can't do o bad case for targetId since it's used for seeds and it'll do a "bid not initialized" error
        // -------------------- final purchase
        await testTakeBid({
          target: BidTarget.Voc,
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
          targetId: metadata.collection!.key,
        });
      }
    }
  });
});
