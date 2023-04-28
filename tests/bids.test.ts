import { BN } from "@project-serum/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  ACC_NOT_INIT_ERR,
  beforeAllHook,
  beforeHook,
  DEFAULT_DEPTH_SIZE,
  delegateCNft,
  FEE_PCT,
  fetchAndCheckSingleIxTx,
  getLamports,
  INTEGER_OVERFLOW_ERR,
  makeCNftMeta,
  makeLeaf,
  mintCNft,
  tcompSdk,
  testBid,
  testCancelCloseBid,
  testTakeBid,
  verifyCNftCreator,
} from "./shared";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { waitMS } from "@tensor-hq/tensor-common";
import { initCollection, makeNTraders } from "./account";
import { BidTarget, nameToBuffer, TAKER_BROKER_PCT } from "../src";
import {
  testDepositIntoMargin,
  testMakeMargin,
  testWithdrawFromMargin,
} from "./tswap";
import { MerkleTree } from "@solana/spl-account-compression";
import { Key } from "@metaplex-foundation/mpl-token-metadata";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe.only("tcomp bids", () => {
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
            bidId: assetId,
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
          bidId: assetId,
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
          bidId: assetId,
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
          bidId: assetId,
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
          bidId: assetId,
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
          bidId: assetId,
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
          bidId: assetId,
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
        bidId: assetId,
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
          bidId: assetId,
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
          bidId: assetId,
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
        bidId: assetId,
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
          bidId: assetId,
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
        bidId: assetId,
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
          bidId: assetId,
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
        bidId: assetId,
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
        bidId: assetId,
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
          bidId: assetId,
        })
      ).to.be.rejectedWith(INTEGER_OVERFLOW_ERR);
    }
  });

  it("Single bids: Can't place a bid with bid_id != assetId", async () => {
    const canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators,
          numMints: 2,
          setupTswap: true,
          canopyDepth,
          randomizeName: true,
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await expect(
          testBid({
            amount: new BN(LAMPORTS_PER_SOL),
            target: BidTarget.AssetId,
            targetId: assetId,
            owner: traderB,
            bidId: Keypair.generate().publicKey,
          })
        ).to.be.rejectedWith(
          tcompSdk.getErrorCodeHex("TargetIdMustEqualBidId")
        );
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: BidTarget.AssetId,
          targetId: assetId,
          owner: traderB,
          bidId: assetId,
        });
      }
    }
  });

  // --------------------------------------- VOC bids

  it("VOC: bids + edits + accepts bid", async () => {
    const canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators,
          numMints: 2,
          setupTswap: true,
          canopyDepth,
          randomizeName: true,
        });

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
        await expect(
          testBid({
            amount: new BN(LAMPORTS_PER_SOL / 2),
            target: BidTarget.Voc, //correct target
            targetId: Keypair.generate().publicKey, //but wrong targetId
            owner: traderB,
            prevBidAmount: LAMPORTS_PER_SOL,
            bidId: metadata.collection!.key, //make sure correctly address
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("CannotModifyTarget"));
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          target: BidTarget.Voc,
          targetId: metadata.collection!.key,
          owner: traderB,
          prevBidAmount: LAMPORTS_PER_SOL,
        });
        // -------------------- failure cases
        await expect(
          testTakeBid({
            target: BidTarget.AssetId, //wrong target
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL / 2),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: metadata.collection!.key,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongIxForBidTarget"));
        await expect(
          testTakeBid({
            target: BidTarget.Fvc, //wrong target
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL / 2),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: metadata.collection!.key,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongIxForBidTarget"));
        //can't do a bad case for Name since it's only used for picking branch js side and VOC branch will be picked correctly
        // -------------------- final purchase
        await testTakeBid({
          target: BidTarget.Voc,
          index,
          lookupTableAccount,
          memTree,
          merkleTree,
          metadata,
          minAmount: new BN(LAMPORTS_PER_SOL / 2),
          owner: traderB.publicKey,
          seller: traderA,
          canopyDepth,
          bidId: metadata.collection!.key,
        });
      }
    }
  });

  it("VOC: fails to take a collection bid with a collectionless mint", async () => {
    const canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const {
        merkleTree,
        traderA,
        leaves,
        traderB,
        memTree,
        treeOwner,
        collectionMint,
      } = await beforeHook({
        nrCreators,
        numMints: 2,
        setupTswap: true,
        canopyDepth,
        randomizeName: true,
        collectionless: true,
      });

      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        target: BidTarget.Voc,
        targetId: collectionMint,
        owner: traderB,
      });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await expect(
          testTakeBid({
            target: BidTarget.Voc,
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: collectionMint,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("MissingCollection"));
      }
    }
  });

  it("VOC: fails to take a collection bid for wrong collection", async () => {
    const canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree } =
        await beforeHook({
          nrCreators,
          numMints: 2,
          setupTswap: true,
          canopyDepth,
          randomizeName: true,
        });

      const fakeCollection = Keypair.generate().publicKey;

      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        target: BidTarget.Voc,
        targetId: fakeCollection,
        owner: traderB,
      });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await expect(
          testTakeBid({
            target: BidTarget.Voc,
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: fakeCollection,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongTargetId"));
      }
    }
  });

  it("VOC: can place multiple bids with different ids", async () => {
    const canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators,
          numMints: 2,
          setupTswap: true,
          canopyDepth,
          randomizeName: true,
        });

      const bidId1 = Keypair.generate().publicKey;
      const bidId2 = Keypair.generate().publicKey;
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        target: BidTarget.Voc,
        targetId: leaves[0].metadata.collection!.key,
        owner: traderB,
        bidId: bidId1,
      });
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        target: BidTarget.Voc,
        targetId: leaves[0].metadata.collection!.key,
        owner: traderB,
        bidId: bidId2,
      });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testTakeBid({
          target: BidTarget.Voc,
          index,
          lookupTableAccount,
          memTree,
          merkleTree,
          metadata,
          minAmount: new BN(LAMPORTS_PER_SOL),
          owner: traderB.publicKey,
          seller: traderA,
          canopyDepth,
          bidId: index === 0 ? bidId1 : bidId2,
        });
      }
    }
  });

  // --------------------------------------- FVC bids

  it("FVC: bids + edits + accepts bid", async () => {
    const canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const verifiedCreator = Keypair.generate();
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators,
          numMints: 2,
          setupTswap: true,
          canopyDepth,
          randomizeName: true,
          verifiedCreator,
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: BidTarget.Fvc,
          targetId: verifiedCreator.publicKey,
          owner: traderB,
        });
        //fails if try to change the target
        await expect(
          testBid({
            amount: new BN(LAMPORTS_PER_SOL / 2),
            target: BidTarget.AssetId, //wrong target
            targetId: verifiedCreator.publicKey,
            owner: traderB,
            prevBidAmount: LAMPORTS_PER_SOL,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("CannotModifyTarget"));
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          target: BidTarget.Fvc,
          targetId: verifiedCreator.publicKey,
          owner: traderB,
          prevBidAmount: LAMPORTS_PER_SOL,
        });
        // -------------------- failure cases
        await expect(
          testTakeBid({
            target: BidTarget.Name, //wrong target
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL / 2),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: verifiedCreator.publicKey,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongIxForBidTarget"));
        await expect(
          testTakeBid({
            target: BidTarget.Voc, //wrong target
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL / 2),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: verifiedCreator.publicKey,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongIxForBidTarget"));
        //can't do a bad case for assetId since it's only used for picking branch js side and VOC branch will be picked correctly
        // -------------------- final purchase
        await testTakeBid({
          target: BidTarget.Fvc,
          index,
          lookupTableAccount,
          memTree,
          merkleTree,
          metadata,
          minAmount: new BN(LAMPORTS_PER_SOL / 2),
          owner: traderB.publicKey,
          seller: traderA,
          canopyDepth,
          bidId: verifiedCreator.publicKey,
        });
      }
    }
  });

  it("FVC: fails to accept bid on a creatorless mint", async () => {
    const canopyDepth = 10;
    const fakeCreator = Keypair.generate();
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({
        nrCreators: 0,
        numMints: 2,
        setupTswap: true,
        canopyDepth,
        randomizeName: true,
        //intentionally not passing verifiedCreator
      });

    await testBid({
      amount: new BN(LAMPORTS_PER_SOL),
      target: BidTarget.Fvc,
      targetId: fakeCreator.publicKey,
      owner: traderB,
    });

    for (const { leaf, index, metadata, assetId } of leaves) {
      await expect(
        testTakeBid({
          target: BidTarget.Fvc,
          index,
          lookupTableAccount,
          memTree,
          merkleTree,
          metadata,
          minAmount: new BN(LAMPORTS_PER_SOL),
          owner: traderB.publicKey,
          seller: traderA,
          canopyDepth,
          bidId: fakeCreator.publicKey,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("MissingFvc"));
    }
  });

  it("FVC: fails to accept bid on a mint with a non verified creator", async () => {
    const canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({
        nrCreators: 1,
        numMints: 2,
        setupTswap: true,
        canopyDepth,
        randomizeName: true,
      });

    for (const { leaf, index, metadata, assetId } of leaves) {
      const bidId = Keypair.generate().publicKey;
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        target: BidTarget.Fvc,
        targetId: metadata.creators[0].address,
        owner: traderB,
        bidId,
      });
      await expect(
        testTakeBid({
          target: BidTarget.Fvc,
          index,
          lookupTableAccount,
          memTree,
          merkleTree,
          metadata,
          minAmount: new BN(LAMPORTS_PER_SOL),
          owner: traderB.publicKey,
          seller: traderA,
          canopyDepth,
          bidId,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("MissingFvc"));
    }
  });

  it("FVC: fails to accept bid on a mint with a different verified creator", async () => {
    const verifiedCreator = Keypair.generate();
    const canopyDepth = 10;
    let { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({
        nrCreators: 0,
        numMints: 1,
        setupTswap: true,
        canopyDepth,
        randomizeName: true,
        verifiedCreator,
      });

    //create one more mint with a diff creator
    const secondVerifiedCreator = Keypair.generate();
    const { collectionMint } = await initCollection({ owner: treeOwner });
    let metadata = await makeCNftMeta({
      collectionMint,
      nrCreators: 0,
      randomizeName: true,
    });
    let leaf;
    let assetId;
    metadata.creators.push({
      address: secondVerifiedCreator.publicKey,
      verified: false,
      share: 100,
    });
    await mintCNft({
      merkleTree,
      metadata,
      treeOwner,
      receiver: traderA.publicKey,
    });
    let proof = memTree.getProof(
      leaves.length,
      false,
      DEFAULT_DEPTH_SIZE.maxDepth,
      false
    );
    ({ metadata, assetId, leaf } = await verifyCNftCreator({
      index: leaves.length,
      merkleTree,
      memTree,
      metadata,
      owner: traderA.publicKey,
      proof: proof.proof.slice(0, proof.proof.length - canopyDepth),
      verifiedCreator: secondVerifiedCreator,
    }));
    leaves.push({
      index: leaves.length,
      metadata,
      assetId,
      leaf,
    });

    const bidId = Keypair.generate().publicKey;
    //bid on first mint
    await testBid({
      amount: new BN(LAMPORTS_PER_SOL),
      target: BidTarget.Fvc,
      targetId: verifiedCreator.publicKey,
      owner: traderB,
      bidId,
    });
    //try to sell second
    await expect(
      testTakeBid({
        target: BidTarget.Fvc,
        index: leaves[1].index, //<-- second
        lookupTableAccount,
        memTree,
        merkleTree,
        metadata: leaves[1].metadata,
        minAmount: new BN(LAMPORTS_PER_SOL),
        owner: traderB.publicKey,
        seller: traderA,
        canopyDepth,
        bidId,
      })
    ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongTargetId"));
    //sell first
    await testTakeBid({
      target: BidTarget.Fvc,
      index: leaves[0].index, //<-- first
      lookupTableAccount,
      memTree,
      merkleTree,
      metadata: leaves[0].metadata,
      minAmount: new BN(LAMPORTS_PER_SOL),
      owner: traderB.publicKey,
      seller: traderA,
      canopyDepth,
      bidId,
    });
  });

  // --------------------------------------- Name bids

  it("Name: bids + edits + accepts bid", async () => {
    const canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators,
          numMints: 2,
          setupTswap: true,
          canopyDepth,
          randomizeName: true,
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: BidTarget.Name,
          targetId: new PublicKey(nameToBuffer(metadata.name)),
          owner: traderB,
        });
        //fails if try to change the target
        await expect(
          testBid({
            amount: new BN(LAMPORTS_PER_SOL / 2),
            target: BidTarget.AssetId, //wrong target
            targetId: new PublicKey(nameToBuffer(metadata.name)),
            owner: traderB,
            prevBidAmount: LAMPORTS_PER_SOL,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("CannotModifyTarget"));
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          target: BidTarget.Name,
          targetId: new PublicKey(nameToBuffer(metadata.name)),
          owner: traderB,
          prevBidAmount: LAMPORTS_PER_SOL,
        });
        // -------------------- failure cases
        await expect(
          testTakeBid({
            target: BidTarget.AssetId, //wrong target
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL / 2),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: new PublicKey(nameToBuffer(metadata.name)),
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongIxForBidTarget"));
        await expect(
          testTakeBid({
            target: BidTarget.Fvc, //wrong target
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL / 2),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: new PublicKey(nameToBuffer(metadata.name)),
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongIxForBidTarget"));
        //can't do a bad case for VOC since it's only used for picking branch js side and VOC branch will be picked correctly
        // -------------------- final purchase
        await testTakeBid({
          target: BidTarget.Name,
          index,
          lookupTableAccount,
          memTree,
          merkleTree,
          metadata,
          minAmount: new BN(LAMPORTS_PER_SOL / 2),
          owner: traderB.publicKey,
          seller: traderA,
          canopyDepth,
          bidId: new PublicKey(nameToBuffer(metadata.name)),
        });
      }
    }
  });

  it("Name: fails to take a collection bid with a mint with wrong name", async () => {
    const canopyDepth = 10;
    for (const nrCreators of [0, 1, 4]) {
      const {
        merkleTree,
        traderA,
        leaves,
        traderB,
        memTree,
        treeOwner,
        collectionMint,
      } = await beforeHook({
        nrCreators,
        numMints: 3,
        setupTswap: true,
        canopyDepth,
        randomizeName: true,
        collectionless: true,
      });

      const bidId = Keypair.generate().publicKey;
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        target: BidTarget.Name,
        targetId: new PublicKey(nameToBuffer(leaves.at(-1)!.metadata.name)),
        bidId,
        owner: traderB,
      });

      for (const { leaf, index, metadata, assetId } of leaves) {
        //last one should succeed
        if (index === leaves.length - 1) {
          await testTakeBid({
            target: BidTarget.Name,
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId,
          });
          continue;
        }
        //but not the other ones
        await expect(
          testTakeBid({
            target: BidTarget.Name,
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongTargetId"));
      }
    }
  });
});
