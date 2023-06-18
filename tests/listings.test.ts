import { BN } from "@project-serum/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import {
  ALREADY_IN_USE_ERR,
  beforeAllHook,
  beforeHook,
  buildAndSendTx,
  CONC_MERKLE_TREE_ERROR,
  delegateCNft,
  FEE_PCT,
  fetchAndCheckSingleIxTx,
  HAS_ONE_ERR,
  tcompSdk,
  testBuy,
  testDelist,
  testEdit,
  testList,
} from "./shared";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { waitMS } from "@tensor-hq/tensor-common";
import { makeNTraders } from "./account";
import { MakeEvent, TakeEvent, TAKER_BROKER_PCT, Target } from "../src";
import { cpiEdit } from "./cpi_test";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tcomp listings", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  before(async () => {
    lookupTableAccount = (await beforeAllHook()) ?? undefined;
  });

  it("lists + edits + buys (no canopy)", async () => {
    for (const nrCreators of [0, 1, 4]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators,
          numMints: 2,
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        const { listState } = await testList({
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
        await testEdit({
          amount: new BN(LAMPORTS_PER_SOL * 2),
          owner: traderA,
          listState,
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
        await testEdit({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          owner: traderA,
          listState,
        });
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

  it("lists + buys (optional royalties)", async () => {
    // TODO: for now enforced
    for (const optionalRoyaltyPct of [0, 100]) {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 4,
          numMints: 2,
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
        if (!optionalRoyaltyPct) {
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
              optionalRoyaltyPct,
            })
          ).to.be.rejectedWith(
            tcompSdk.getErrorCodeHex("OptionalRoyaltiesNotYetEnabled")
          );
        } else {
          await testBuy({
            index,
            maxAmount: new BN(LAMPORTS_PER_SOL),
            memTree,
            merkleTree,
            metadata,
            buyer: traderB,
            owner: traderA.publicKey,
            lookupTableAccount,
            optionalRoyaltyPct,
          });
        }
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
      ).to.be.rejectedWith(CONC_MERKLE_TREE_ERROR);
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
      ).to.be.rejectedWith(CONC_MERKLE_TREE_ERROR);
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
      ).to.be.rejectedWith(CONC_MERKLE_TREE_ERROR);
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
        await beforeHook({ nrCreators, numMints: 2, canopyDepth });

      for (const { index, metadata } of leaves) {
        const { listState } = await testList({
          amount: new BN(LAMPORTS_PER_SOL),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          canopyDepth,
          // lookupTableAccount, //<-- intentionally not passing
        });
        await testEdit({
          amount: new BN(LAMPORTS_PER_SOL * 2),
          owner: traderA,
          listState,
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
        await beforeHook({ nrCreators, numMints: 2, canopyDepth });
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
          delegate, ///<-- trader C signs
          canopyDepth,
          payer, //<-- separate payer
          delegateSigns: true,
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

    for (const { index, metadata } of leaves) {
      const { listState } = await testList({
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
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("ListingExpired"));
      await testEdit({
        amount: new BN(LAMPORTS_PER_SOL),
        owner: traderA,
        expireInSec: new BN(100),
        listState,
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
      });
    }
  });

  it("lists + buys (private taker)", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({ nrCreators: 4, numMints: 2, canopyDepth });
    const [traderC] = await makeNTraders(1);

    for (const { leaf, index, metadata, assetId } of leaves) {
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

    for (const { index, metadata } of leaves) {
      const { listState } = await testList({
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
      await testEdit({
        amount: new BN(LAMPORTS_PER_SOL),
        owner: traderA,
        listState,
        privateTaker: null,
      });
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

  it("parses listing txs ok", async () => {
    let canopyDepth = 10;
    const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
      await beforeHook({ nrCreators: 4, numMints: 2, canopyDepth });
    const [traderC] = await makeNTraders(1);

    const takerBroker = Keypair.generate().publicKey;

    for (const { index, metadata, assetId } of leaves) {
      let amount = LAMPORTS_PER_SOL;

      // --------------------------------------- List

      const { sig, listState } = await testList({
        amount: new BN(amount),
        index,
        memTree,
        merkleTree,
        metadata,
        owner: traderA,
        canopyDepth,
        privateTaker: traderB.publicKey,
      });

      {
        const ix = await fetchAndCheckSingleIxTx(sig!, "list");
        const event = tcompSdk.getEvent(ix) as unknown as MakeEvent;
        expect(event.type).eq("maker");
        expect(event.maker.toString()).eq(traderA.publicKey.toString());
        expect(event.bidId).to.be.null;
        expect(event.target).to.eq(Target.AssetId);
        expect(event.targetId.toString()).eq(assetId.toString());
        expect(event.field).to.be.null;
        expect(event.fieldId).to.be.null;
        expect(event.amount.toString()).eq(amount.toString());
        expect(event.quantity).eq(1);
        expect(event.currency).to.be.null;
        expect(event.privateTaker?.toString()).eq(traderB.publicKey.toString());
        expect(event.assetId?.toString()).to.eq(assetId.toString());
      }

      // --------------------------------------- Edit (direct)

      //new settings
      amount = amount * 2;

      {
        const { sig } = await testEdit({
          amount: new BN(amount),
          owner: traderA,
          privateTaker: traderC.publicKey,
          listState,
        });
        const ix = await fetchAndCheckSingleIxTx(sig, "edit");
        const event = tcompSdk.getEvent(ix) as unknown as MakeEvent;
        expect(event.type).eq("maker");
        expect(event.maker.toString()).eq(traderA.publicKey.toString());
        expect(event.bidId).to.be.null;
        expect(event.target).to.eq(Target.AssetId);
        expect(event.targetId.toString()).eq(assetId.toString());
        expect(event.field).to.be.null;
        expect(event.fieldId).to.be.null;
        expect(event.amount.toString()).eq(amount.toString());
        expect(event.quantity).eq(1);
        expect(event.currency).to.be.null;
        expect(event.privateTaker?.toString()).eq(traderC.publicKey.toString());
        expect(event.assetId?.toString()).to.eq(assetId.toString());
      }

      // --------------------------------------- Edit (via cpi)

      //new settings
      amount = amount * 2;

      {
        const {
          tx: { ixs },
        } = await cpiEdit({
          amount: new BN(amount),
          merkleTree,
          nonce: new BN(index),
          owner: traderA.publicKey,
        });
        const sig = await buildAndSendTx({ ixs, extraSigners: [traderA] });
        const ix = await fetchAndCheckSingleIxTx(sig, "edit");
        const event = tcompSdk.getEvent(ix) as unknown as MakeEvent;
        expect(event.type).eq("maker");
        expect(event.maker.toString()).eq(traderA.publicKey.toString());
        expect(event.bidId).to.be.null;
        expect(event.target).to.eq(Target.AssetId);
        expect(event.targetId.toString()).eq(assetId.toString());
        expect(event.field).to.be.null;
        expect(event.fieldId).to.be.null;
        expect(event.amount.toString()).eq(amount.toString());
        expect(event.quantity).eq(1);
        expect(event.currency).to.be.null;
        expect(event.privateTaker?.toString() ?? null).to.be.null;
        expect(event.assetId?.toString()).to.eq(assetId.toString());
      }

      // --------------------------------------- Buy

      {
        const { sig } = await testBuy({
          index,
          maxAmount: new BN(amount),
          memTree,
          merkleTree,
          metadata,
          buyer: traderC,
          owner: traderA.publicKey,
          canopyDepth,
          optionalRoyaltyPct: 100,
          takerBroker,
        });
        const ix = await fetchAndCheckSingleIxTx(sig!, "buy");
        const event = tcompSdk.getEvent(ix) as unknown as TakeEvent;
        expect(event.type).eq("taker");
        expect(event.taker.toString()).eq(traderC.publicKey.toString());
        expect(event.bidId).to.be.null;
        expect(event.target).to.eq(Target.AssetId);
        expect(event.targetId.toString()).eq(assetId.toString());
        expect(event.field).to.be.null;
        expect(event.fieldId).to.be.null;
        expect(event.amount.toString()).eq(amount.toString());
        if (TAKER_BROKER_PCT > 0) {
          expect(event.takerBrokerFee?.toNumber()).eq(
            Math.trunc((amount * FEE_PCT * TAKER_BROKER_PCT) / 100)
          );
        }
        expect(event.tcompFee?.toNumber()).eq(
          Math.trunc(amount * FEE_PCT * (1 - TAKER_BROKER_PCT / 100))
        );
        expect(event.creatorFee?.toNumber()).eq(
          Math.trunc((amount * metadata.sellerFeeBasisPoints) / 10000)
        );
        expect(event.quantity).eq(0);
        expect(event.currency).to.be.null;
        expect(event.assetId?.toString()).to.eq(assetId.toString());
      }
    }
  });
});
