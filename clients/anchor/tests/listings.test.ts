import { BN } from "@coral-xyz/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { isNullLike, waitMS } from "@tensor-hq/tensor-common";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { MakeEvent, MAKER_BROKER_PCT, TakeEvent, Target } from "../src";
import { makeNTraders } from "./account";
import { cpiEdit } from "./cpi_test";
import {
  ALREADY_IN_USE_ERR,
  beforeAllHook,
  beforeHook,
  BROKER_FEE_PCT,
  buildAndSendTx,
  CONC_MERKLE_TREE_ERROR,
  delegateCNft,
  FEE_PCT,
  fetchAndCheckSingleIxTx,
  HAS_ONE_ERR,
  tcompSdk,
  TEST_USDC,
  testBuy,
  testDelist,
  testEdit,
  testList,
} from "./shared";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tcomp listings", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  before(async () => {
    const res = await beforeAllHook();
    lookupTableAccount = res.lookupTableAccount ?? undefined;
  });

  for (const currency of [null, new PublicKey(TEST_USDC)]) {
    /// limit the number of creators to 0 or 1 when there is a currency
    /// as buy_spl requires more tx space
    const capSplCreators = (nrCreators: number[]): number[] => {
      if (isNullLike(currency)) {
        return nrCreators;
      }
      return nrCreators.filter((num) => num < 2); // buy_spl doesn't have enough room for >=2
    };

    describe(`Testing ${isNullLike(currency) ? "SOL" : "USDC"}`, () => {
      it("lists + edits + buys (no canopy)", async () => {
        for (const { nrCreators, canopyDepth } of [
          {
            nrCreators: 0,
            canopyDepth: 0, // 14 proof length
          },
          {
            nrCreators: 1,
            canopyDepth: 2, // 12 proof length
          },
          {
            nrCreators: 2,
            canopyDepth: 4, // 10 proof length
          },
          {
            nrCreators: 4,
            canopyDepth: 8, // 6 proof length
          },
        ]) {
          const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
            await beforeHook({
              nrCreators,
              canopyDepth,
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
              currency,
              canopyDepth,
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
                currency,
                canopyDepth,
              })
            ).to.be.rejectedWith(ALREADY_IN_USE_ERR);
            await testEdit({
              amount: new BN(LAMPORTS_PER_SOL * 2),
              owner: traderA,
              listState,
              currency,
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
                currency,
                canopyDepth,
              })
            ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));
            await testEdit({
              amount: new BN(LAMPORTS_PER_SOL / 2),
              owner: traderA,
              listState,
              currency,
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
              currency,
              canopyDepth,
            });
          }
        }
      });

      it("lists + buys (optional royalties)", async () => {
        // TODO: for now enforced
        for (const optionalRoyaltyPct of [0, 100]) {
          const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
            await beforeHook({
              nrCreators: currency ? 1 : 4,
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
              currency,
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
                  currency,
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
                currency,
              });
            }
          }
        }
      });

      it("tries to buy with false creators", async () => {
        const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
          await beforeHook({
            nrCreators: currency ? 1 : 4,
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
            currency,
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
              currency,
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
              currency,
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
              currency,
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
            currency,
          });
        }
      });

      it("lists + buys (separate payer)", async () => {
        for (const nrCreators of capSplCreators([4])) {
          const { merkleTree, traderA, leaves, traderB, memTree, rentPayer } =
            await beforeHook({
              nrCreators,
              numMints: 2,
              depthSizePair: { maxDepth: 5, maxBufferSize: 8 },
            });

          const [payer] = await makeNTraders({ n: 1 });

          for (const { leaf, index, metadata, assetId } of leaves) {
            await testList({
              amount: new BN(LAMPORTS_PER_SOL),
              index,
              memTree,
              merkleTree,
              metadata,
              owner: traderA,
              lookupTableAccount,
              rentPayer,
              currency,
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
              rentPayer,
              rentDest: rentPayer.publicKey,
              currency,
            });
          }
        }
      });

      it("lists + edits + buys (with canopy)", async () => {
        let canopyDepth = 10;
        for (const nrCreators of capSplCreators([0, 1, 4])) {
          const {
            merkleTree,
            traderA,
            leaves,
            traderB,
            memTree,
            rentPayer,
            secondaryRentPayer,
          } = await beforeHook({ nrCreators, numMints: 2, canopyDepth });

          for (const { index, metadata } of leaves) {
            const { listState } = await testList({
              amount: new BN(LAMPORTS_PER_SOL),
              index,
              memTree,
              merkleTree,
              metadata,
              owner: traderA,
              rentPayer,
              canopyDepth,
              currency,
              // lookupTableAccount, //<-- intentionally not passing
            });
            await testEdit({
              amount: new BN(LAMPORTS_PER_SOL * 2),
              owner: traderA,
              listState,
              currency,
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
                rentPayer,
                rentDest: rentPayer.publicKey,
                currency,
                // lookupTableAccount, //<-- intentionally not passing
              })
            ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));
            //try to buy with the wrong rent payer
            await expect(
              testBuy({
                index,
                maxAmount: new BN(LAMPORTS_PER_SOL * 2),
                memTree,
                merkleTree,
                metadata,
                buyer: traderB,
                owner: traderA.publicKey,
                rentDest: secondaryRentPayer.publicKey,
                canopyDepth,
                currency,
                // lookupTableAccount, //<-- intentionally not passing
              })
            ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("BadRentDest"));
            await testBuy({
              index,
              maxAmount: new BN(LAMPORTS_PER_SOL * 2),
              memTree,
              merkleTree,
              metadata,
              buyer: traderB,
              owner: traderA.publicKey,
              rentPayer,
              rentDest: rentPayer.publicKey,
              canopyDepth,
              currency,
              // lookupTableAccount, //<-- intentionally not passing
            });
          }
        }
      });

      it("lists + buys (with delegate)", async () => {
        let canopyDepth = currency ? 11 : 10;
        for (const nrCreators of capSplCreators([0, 1, 4])) {
          const { merkleTree, traderA, leaves, traderB, memTree, rentPayer } =
            await beforeHook({ nrCreators, numMints: 2, canopyDepth });
          const [delegate, payer] = await makeNTraders({ n: 2 });

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
              rentPayer, //<-- separate rent payer
              delegateSigns: true,
              currency,
            });
            await testBuy({
              index,
              maxAmount: new BN(LAMPORTS_PER_SOL),
              memTree,
              merkleTree,
              metadata,
              buyer: traderB,
              payer, //<-- separate payer
              rentPayer,
              rentDest: rentPayer.publicKey,
              owner: traderA.publicKey,
              canopyDepth,
              currency,
            });
          }
        }
      });

      it("lists + delists (with canopy)", async () => {
        let canopyDepth = 10;
        for (const nrCreators of capSplCreators([0, 1, 4])) {
          const {
            merkleTree,
            traderA,
            leaves,
            traderB,
            memTree,
            rentPayer,
            secondaryRentPayer,
          } = await beforeHook({ nrCreators, numMints: 2, canopyDepth });

          for (const { leaf, index, metadata, assetId } of leaves) {
            await testList({
              amount: new BN(LAMPORTS_PER_SOL),
              index,
              memTree,
              merkleTree,
              metadata,
              owner: traderA,
              rentPayer,
              canopyDepth,
              currency,
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
                rentDest: rentPayer,
              })
            ).to.be.rejectedWith(HAS_ONE_ERR);
            //fails with wrong rent payer
            await expect(
              testDelist({
                index,
                memTree,
                merkleTree,
                metadata,
                owner: traderA,
                rentDest: secondaryRentPayer,
              })
            ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("BadRentDest"));
            await testDelist({
              index,
              memTree,
              merkleTree,
              metadata,
              owner: traderA,
              rentDest: rentPayer,
            });
          }
        }
      });

      it("lists + delists (expired listing)", async () => {
        let canopyDepth = 10;
        for (const nrCreators of capSplCreators([0, 1, 4])) {
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
              expireInSec: new BN(3),
              currency,
            });
            await expect(
              testDelist({
                index,
                memTree,
                merkleTree,
                metadata,
                owner: traderA,
                forceExpired: true,
              })
            ).to.be.rejectedWith(
              tcompSdk.getErrorCodeHex("ListingNotYetExpired")
            );
            await waitMS(4000);
            await testDelist({
              index,
              memTree,
              merkleTree,
              metadata,
              owner: traderA,
              forceExpired: true,
            });
          }
        }
      });

      it("lists + edits + buys (expired listing)", async () => {
        let canopyDepth = 10;
        const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
          await beforeHook({
            nrCreators: currency ? 1 : 4,
            numMints: 2,
            canopyDepth,
          });

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
            currency,
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
              currency,
            })
          ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("ListingExpired"));
          await testEdit({
            amount: new BN(LAMPORTS_PER_SOL),
            owner: traderA,
            expireInSec: new BN(100),
            listState,
            currency,
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
            currency,
          });
        }
      });

      it("lists + buys (private taker)", async () => {
        let canopyDepth = 10;
        const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
          await beforeHook({
            nrCreators: currency ? 1 : 4,
            numMints: 2,
            canopyDepth,
          });
        const [traderC] = await makeNTraders({ n: 1 });

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
            currency,
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
              currency,
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
            currency,
          });
        }
      });

      it("edits the taker", async () => {
        let canopyDepth = 10;
        const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
          await beforeHook({
            nrCreators: currency ? 1 : 4,
            numMints: 2,
            canopyDepth,
          });
        const [traderC] = await makeNTraders({ n: 1 });

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
            currency,
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
              currency,
            })
          ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("TakerNotAllowed"));
          await testEdit({
            amount: new BN(LAMPORTS_PER_SOL),
            owner: traderA,
            listState,
            privateTaker: null,
            currency,
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
            currency,
          });
        }
      });

      it("parses listing txs ok", async () => {
        let canopyDepth = 10;
        const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
          await beforeHook({
            nrCreators: currency ? 1 : 4,
            numMints: 2,
            canopyDepth,
          });
        const [traderC] = await makeNTraders({ n: 1 });

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
            currency,
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
            expect(event.currency?.toString()).to.eq(currency?.toString());
            expect(event.privateTaker?.toString()).eq(
              traderB.publicKey.toString()
            );
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
              currency,
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
            expect(event.currency?.toString()).to.eq(currency?.toString());
            expect(event.privateTaker?.toString()).eq(
              traderC.publicKey.toString()
            );
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
              currency,
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
            expect(event.currency?.toString()).to.eq(currency?.toString());
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
              currency,
            });
            const ix = await fetchAndCheckSingleIxTx(
              sig!,
              currency ? "buySpl" : "buy"
            );
            const event = tcompSdk.getEvent(ix) as unknown as TakeEvent;
            expect(event.type).eq("taker");
            expect(event.taker.toString()).eq(traderC.publicKey.toString());
            expect(event.bidId).to.be.null;
            expect(event.target).to.eq(Target.AssetId);
            expect(event.targetId.toString()).eq(assetId.toString());
            expect(event.field).to.be.null;
            expect(event.fieldId).to.be.null;
            expect(event.amount.toString()).eq(amount.toString());

            // Protocol fee is the remainder after broker fees are deducted.
            expect(event.tcompFee?.toNumber()).eq(
              Math.trunc(amount * FEE_PCT * (1 - BROKER_FEE_PCT / 100))
            );

            const brokerFee = Math.trunc(
              (amount * FEE_PCT * BROKER_FEE_PCT) / 100
            );

            // Maker broker percent decides the split between maker and taker brokers.
            expect(event.makerBrokerFee?.toNumber()).eq(
              (brokerFee * MAKER_BROKER_PCT) / 100
            );

            // Taker Broker is the remainder of the broker fee.
            expect(event.takerBrokerFee?.toNumber()).eq(
              brokerFee - event.makerBrokerFee?.toNumber()
            );

            // Creator fee is sellerFeeBasisPoints of the price.
            expect(event.creatorFee?.toNumber()).eq(
              Math.trunc((amount * metadata.sellerFeeBasisPoints) / 10000)
            );

            expect(event.quantity).eq(0);
            expect(event.currency?.toString()).to.eq(currency?.toString());
            expect(event.assetId?.toString()).to.eq(assetId.toString());
          }
        }
      });
    });
  }
});
