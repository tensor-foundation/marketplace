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
import { TAKER_BROKER_PCT } from "../src";
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
        await testEdit({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          index,
          merkleTree,
          owner: traderA,
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
    for (const optionalRoyaltyPct of [0, 50, 100]) {
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

  it.only("lists + buys (separate payer)", async () => {
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
          delegate: delegate, ///<-- trader C signs
          canopyDepth,
          payer, //<-- separate payer
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
      await testEdit({
        amount: new BN(LAMPORTS_PER_SOL),
        index,
        merkleTree,
        owner: traderA,
        expireInSec: new BN(100),
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
      await testEdit({
        amount: new BN(LAMPORTS_PER_SOL),
        index,
        merkleTree,
        owner: traderA,
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

    for (const { leaf, index, metadata, assetId } of leaves) {
      let amount = LAMPORTS_PER_SOL;
      let currency = Keypair.generate().publicKey;

      // --------------------------------------- List

      {
        const { sig } = await testList({
          amount: new BN(amount),
          index,
          memTree,
          merkleTree,
          metadata,
          owner: traderA,
          canopyDepth,
          privateTaker: traderB.publicKey,
          currency,
        });
        const ix = await fetchAndCheckSingleIxTx(sig, "list");
        const amounts = tcompSdk.getIxAmounts(ix);
        expect(amounts?.amount.toNumber()).eq(amount);
        expect(amounts?.currency?.toString()).eq(currency.toString());
      }

      // --------------------------------------- Edit (direct)

      //new settings
      amount = amount * 2;
      currency = Keypair.generate().publicKey;

      {
        const { sig } = await testEdit({
          amount: new BN(amount),
          index,
          merkleTree,
          owner: traderA,
          privateTaker: traderC.publicKey,
          currency,
        });
        const ix = await fetchAndCheckSingleIxTx(sig, "edit");
        expect(ix.ix.data);
        const amounts = tcompSdk.getIxAmounts(ix);
        expect(amounts?.amount.toNumber()).eq(amount);
        expect(amounts?.currency?.toString()).eq(currency.toString());
      }

      // --------------------------------------- Edit (via cpi)

      //new settings
      amount = amount * 2;
      currency = Keypair.generate().publicKey;

      {
        const {
          tx: { ixs },
        } = await cpiEdit({
          amount: new BN(amount),
          merkleTree,
          nonce: new BN(index),
          owner: traderA.publicKey,
          currency,
        });
        const sig = await buildAndSendTx({ ixs, extraSigners: [traderA] });
        const ix = await fetchAndCheckSingleIxTx(sig, "edit");
        const amounts = tcompSdk.getIxAmounts(ix);
        expect(amounts?.amount.toNumber()).eq(amount);
        expect(amounts?.currency?.toString()).eq(currency.toString());
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
          currency,
          optionalRoyaltyPct: 100,
          takerBroker,
        });
        const ix = await fetchAndCheckSingleIxTx(sig!, "buy");
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
