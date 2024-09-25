import { BN } from "@coral-xyz/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey
} from "@solana/web3.js";
import {
  nameToBuffer,
  test_utils,
  TokenStandard,
  waitMS
} from "@tensor-hq/tensor-common";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Field, MakeEvent, MAKER_BROKER_PCT, TakeEvent, Target } from "../src";
import { initCollection, makeMintTwoAta, makeNTraders } from "./account";
import {
  ACC_NOT_INIT_ERR,
  beforeAllHook,
  beforeHook,
  BROKER_FEE_PCT,
  CONC_MERKLE_TREE_ERROR,
  decompressCNft,
  DEFAULT_DEPTH_SIZE,
  delegateCNft,
  FEE_PCT,
  fetchAndCheckSingleIxTx,
  getLamports,
  INTEGER_OVERFLOW_ERR,
  makeCNftMeta,
  makeProofWhitelist,
  mintCNft,
  tcompSdk,
  TEST_CONN_PAYER,
  testBid,
  testCancelCloseBid,
  testInitUpdateMintProof,
  testTakeBid,
  testTakeBidLegacy,
  verifyCNftCreator,
  withLamports,
  wlSdk
} from "./shared";
import {
  makeFvcWhitelist,
  makeVocWhitelist,
  testDepositIntoMargin,
  testMakeMargin,
  testWithdrawFromMargin
} from "./tswap";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tcomp bids", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  let ruleSetAddr: PublicKey;
  before(async () => {
    const res = await beforeAllHook();
    lookupTableAccount = res.lookupTableAccount ?? undefined;
    ruleSetAddr = res.ruleSetAddr;
  });

  describe("compressed nfts", () => {
    it("bids + edits + accepts bid (with canopy)", async () => {
      let takerBroker = Keypair.generate().publicKey;
      const canopyDepth = 10;
      for (const nrCreators of [0, 1, 4]) {
        const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
          await beforeHook({
            nrCreators,
            numMints: 2,
            canopyDepth
          });

        for (const { leaf, index, metadata, assetId } of leaves) {
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL),
            targetId: assetId,
            owner: traderB
          });
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL / 2),
            targetId: assetId,
            owner: traderB,
            prevBidAmount: LAMPORTS_PER_SOL
          });

          const common = {
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: assetId,
            takerBroker
          };

          //try to take at the wrong price
          await expect(
            testTakeBid({
              ...common,
              minAmount: new BN(LAMPORTS_PER_SOL)
            })
          ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));
          await testTakeBid({
            ...common,
            minAmount: new BN(LAMPORTS_PER_SOL / 2)
          });
        }
      }
    });

    // TODO: Add cosigner tests.
    it.skip("bids + edits + accepts bid (with cosigner)", async () => {
      let takerBroker = Keypair.generate().publicKey;
      const canopyDepth = 10;
      for (const nrCreators of [0, 1, 4]) {
        const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
          await beforeHook({
            nrCreators,
            numMints: 2,
            canopyDepth
          });

        const cosigner = Keypair.generate();

        for (const { leaf, index, metadata, assetId } of leaves) {
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL),
            targetId: assetId,
            owner: traderB,
            cosigner
          });
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL / 2),
            targetId: assetId,
            owner: traderB,
            prevBidAmount: LAMPORTS_PER_SOL,
            cosigner
          });

          const common = {
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: assetId,
            takerBroker
          };

          //try to take at the wrong price
          await expect(
            testTakeBid({
              ...common,
              minAmount: new BN(LAMPORTS_PER_SOL)
            })
          ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("BadCosigner"));

          await testTakeBid({
            ...common,
            cosigner,
            minAmount: new BN(LAMPORTS_PER_SOL / 2)
          });
        }
      }
    });

    it("bids + takes (optional royalties)", async () => {
      let takerBroker = Keypair.generate().publicKey;
      // TODO: for now enforced
      for (const optionalRoyaltyPct of [0, 100]) {
        const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
          await beforeHook({
            nrCreators: 1,
            numMints: 2
          });

        for (const { leaf, index, metadata, assetId } of leaves) {
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL),
            targetId: assetId,
            owner: traderB
          });
          if (!optionalRoyaltyPct) {
            await expect(
              testTakeBid({
                index,
                lookupTableAccount,
                memTree,
                merkleTree,
                metadata,
                minAmount: new BN(LAMPORTS_PER_SOL),
                owner: traderB.publicKey,
                seller: traderA,
                optionalRoyaltyPct,
                bidId: assetId
              })
            ).to.be.rejectedWith(
              tcompSdk.getErrorCodeHex("OptionalRoyaltiesNotYetEnabled")
            );
          } else {
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
              takerBroker
            });
          }
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
            canopyDepth
          });

        for (const { leaf, index, metadata, assetId } of leaves) {
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL),
            targetId: assetId,
            owner: traderB,
            prevBidAmount: 0,
            expireInSec: new BN(closeWithCosigner ? 0 : 10000)
          });
          if (closeWithCosigner) {
            //wait for bid to expire
            await waitMS(3000);
          }
          await testCancelCloseBid({
            amount: new BN(LAMPORTS_PER_SOL),
            bidId: assetId,
            forceClose: closeWithCosigner,
            owner: traderB
          });
        }
      }
    });

    it("bids + cancels/closes (with rent payer)", async () => {
      const canopyDepth = 10;
      for (const closeWithCosigner of [true, false]) {
        const { leaves, traderB, rentPayer, secondaryRentPayer } =
          await beforeHook({
            nrCreators: 4,
            numMints: 2,
            canopyDepth
          });

        for (const { leaf, index, metadata, assetId } of leaves) {
          await withLamports(
            { prevRentPayer: rentPayer.publicKey },
            async ({ prevRentPayer }) => {
              await testBid({
                amount: new BN(LAMPORTS_PER_SOL),
                targetId: assetId,
                owner: traderB,
                rentPayer,
                prevBidAmount: 0,
                expireInSec: new BN(closeWithCosigner ? 0 : 10000)
              });
              // asserts secondary rent payer is not assigned
              await testBid({
                amount: new BN(LAMPORTS_PER_SOL),
                targetId: assetId,
                owner: traderB,
                rentPayer: secondaryRentPayer,
                prevBidAmount: LAMPORTS_PER_SOL,
                expireInSec: new BN(closeWithCosigner ? 0 : 10000)
              });
              if (closeWithCosigner) {
                //wait for bid to expire
                await waitMS(3000);
              }
              await expect(
                testCancelCloseBid({
                  amount: new BN(LAMPORTS_PER_SOL),
                  bidId: assetId,
                  forceClose: closeWithCosigner,
                  owner: traderB,
                  rentDest: secondaryRentPayer
                })
              ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("BadRentDest"));
              await testCancelCloseBid({
                amount: new BN(LAMPORTS_PER_SOL),
                bidId: assetId,
                forceClose: closeWithCosigner,
                owner: traderB,
                rentDest: rentPayer
              });

              // rent payer is refunded
              const currRentPayer = await getLamports(rentPayer.publicKey);
              expect(currRentPayer! - prevRentPayer!).eq(0);
            }
          );
        }
      }
    });

    it("tries to take with false creators", async () => {
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 2,
          numMints: 2
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          targetId: assetId,
          owner: traderB
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
                share: c.share
              }))
            },
            seller: traderA,
            owner: traderB.publicKey,
            lookupTableAccount,
            bidId: assetId
          })
        ).to.be.rejectedWith(CONC_MERKLE_TREE_ERROR);
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
                share: i === 0 ? 85 : 5 //wrong
              }))
            },
            seller: traderA,
            owner: traderB.publicKey,
            lookupTableAccount,
            bidId: assetId
          })
        ).to.be.rejectedWith(CONC_MERKLE_TREE_ERROR);
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
                share: c.share
              }))
            },
            seller: traderA,
            owner: traderB.publicKey,
            lookupTableAccount,
            bidId: assetId
          })
        ).to.be.rejectedWith(CONC_MERKLE_TREE_ERROR);
        await testTakeBid({
          index,
          minAmount: new BN(LAMPORTS_PER_SOL),
          memTree,
          merkleTree,
          metadata,
          seller: traderA,
          owner: traderB.publicKey,
          lookupTableAccount,
          bidId: assetId
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
            canopyDepth
          });
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
            newDelegate: delegate.publicKey
          });
          //list using delegate
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL),
            targetId: assetId,
            owner: traderB
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
            delegateSigns: true
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
          canopyDepth
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          targetId: assetId,
          owner: traderB,
          expireInSec: new BN(1)
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
            bidId: assetId
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("BidExpired"));
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          targetId: assetId,
          owner: traderB,
          expireInSec: new BN(1000),
          prevBidAmount: LAMPORTS_PER_SOL
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
          bidId: assetId
        });
      }
    });

    it("edits the taker", async () => {
      let canopyDepth = 10;
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 4,
          numMints: 2,
          canopyDepth
        });
      const [traderC] = await makeNTraders({ n: 1 });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          targetId: assetId,
          owner: traderB,
          privateTaker: traderC.publicKey //C whitelisted
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
            bidId: assetId
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("TakerNotAllowed"));
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          targetId: assetId,
          owner: traderB,
          privateTaker: null,
          prevBidAmount: LAMPORTS_PER_SOL
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
          bidId: assetId
        });
      }
    });

    it("parses bid txs ok", async () => {
      let canopyDepth = 10;
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 4,
          numMints: 2,
          canopyDepth
        });
      const takerBroker = Keypair.generate().publicKey;

      for (const { leaf, index, metadata, assetId } of leaves) {
        let amount = LAMPORTS_PER_SOL;

        // --------------------------------------- Bid

        {
          const { sig } = await testBid({
            amount: new BN(amount),
            targetId: assetId,
            owner: traderB,
            privateTaker: traderA.publicKey
          });
          const ix = await fetchAndCheckSingleIxTx(sig!, "bid");
          const event = tcompSdk.getEvent(ix) as unknown as MakeEvent;
          expect(event.type).eq("maker");
          expect(event.maker.toString()).eq(traderB.publicKey.toString());
          expect(event.bidId?.toString()).to.eq(assetId.toString());
          expect(event.target).to.eq(Target.AssetId);
          expect(event.targetId.toString()).eq(assetId.toString());
          expect(event.field).to.be.null;
          expect(event.fieldId).to.be.null;
          expect(event.amount.toString()).eq(amount.toString());
          expect(event.quantity).eq(1);
          expect(event.currency).to.be.null;
          expect(event.privateTaker?.toString()).eq(
            traderA.publicKey.toString()
          );
          expect(event.assetId?.toString()).eq(assetId.toString());
        }

        //--------------------------------------- Take Bid

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
            optionalRoyaltyPct: 100,
            takerBroker,
            bidId: assetId
          });
          const ix = await fetchAndCheckSingleIxTx(sig!, "takeBidMetaHash");
          const event = tcompSdk.getEvent(ix) as unknown as TakeEvent;
          expect(event.type).eq("taker");
          expect(event.taker.toString()).eq(traderA.publicKey.toString());
          expect(event.bidId?.toString()).to.eq(assetId.toString());
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
          expect(event.currency).to.be.null;
          expect(event.assetId?.toString()).to.eq(assetId.toString());
        }
      }
    });

    it("parses VOC + name + quantity bid txs ok", async () => {
      let canopyDepth = 12;
      const { merkleTree, traderA, leaves, traderB, memTree, collectionMint } =
        await beforeHook({
          nrCreators: 4,
          numMints: 1,
          canopyDepth
        });
      const takerBroker = Keypair.generate().publicKey;
      const { whitelist } = await makeVocWhitelist(collectionMint);

      for (const { leaf, index, metadata, assetId } of leaves) {
        let amount = LAMPORTS_PER_SOL;

        // --------------------------------------- Bid

        // Can't place bid with field and no fieldId, or vice versa.
        {
          const commonArgs = {
            amount: new BN(amount),
            target: Target.Whitelist,
            targetId: whitelist,
            owner: traderB,
            privateTaker: traderA.publicKey,
            quantity: 2
          };
          await expect(
            testBid({
              ...commonArgs,
              field: Field.Name,
              fieldId: null
            })
          ).rejectedWith(tcompSdk.getErrorCodeHex("BadBidField"));

          await expect(
            testBid({
              ...commonArgs,
              field: null,
              fieldId: new PublicKey(nameToBuffer(metadata.name))
            })
          ).rejectedWith(tcompSdk.getErrorCodeHex("BadBidField"));
        }

        {
          const { sig } = await testBid({
            amount: new BN(amount),
            target: Target.Whitelist,
            targetId: whitelist,
            owner: traderB,
            field: Field.Name,
            fieldId: new PublicKey(nameToBuffer(metadata.name)),
            privateTaker: traderA.publicKey,
            quantity: 2
          });
          const ix = await fetchAndCheckSingleIxTx(sig!, "bid");
          const event = tcompSdk.getEvent(ix) as unknown as MakeEvent;
          expect(event.type).eq("maker");
          expect(event.maker.toString()).eq(traderB.publicKey.toString());
          expect(event.bidId?.toString()).to.eq(whitelist.toString());
          expect(event.target).to.eq(Target.Whitelist);
          expect(event.targetId.toString()).eq(whitelist.toString());
          expect(event.field).to.eq(Field.Name);
          expect(event.fieldId?.toString()).to.eq(
            new PublicKey(nameToBuffer(metadata.name))?.toString()
          );
          expect(event.amount.toString()).eq(amount.toString());
          expect(event.quantity).eq(2);
          expect(event.currency).to.be.null;
          expect(event.privateTaker?.toString()).eq(
            traderA.publicKey.toString()
          );
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
            optionalRoyaltyPct: 100,
            takerBroker,
            bidId: whitelist,
            target: Target.Whitelist,
            field: Field.Name,
            whitelist
          });
          const ix = await fetchAndCheckSingleIxTx(sig!, "takeBidFullMeta");
          const event = tcompSdk.getEvent(ix) as unknown as TakeEvent;
          expect(event.type).eq("taker");
          expect(event.taker.toString()).eq(traderA.publicKey.toString());
          expect(event.bidId?.toString()).to.eq(whitelist.toString());
          expect(event.target).to.eq(Target.Whitelist);
          expect(event.targetId.toString()).eq(whitelist.toString());
          expect(event.field).to.eq(Field.Name);
          expect(event.fieldId?.toString()).to.eq(
            new PublicKey(nameToBuffer(metadata.name))?.toString()
          );
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

          expect(event.quantity).eq(1);
          expect(event.currency).to.be.null;
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
          setupTswap: true
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        const { marginPda, marginNr, marginRent } = await testMakeMargin({
          owner: traderB
        });
        await testDepositIntoMargin({
          owner: traderB,
          marginNr,
          marginPda,
          amount: LAMPORTS_PER_SOL
        });
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          targetId: assetId,
          owner: traderB,
          privateTaker: null,
          margin: marginPda
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
          bidId: assetId
        });
      }
    });

    it("margin buy: works (VOC bid)", async () => {
      //this is the smallest canopy that fits
      let canopyDepth = 8;
      const {
        merkleTree,
        traderA,
        leaves,
        traderB,
        memTree,
        treeOwner,
        collectionMint
      } = await beforeHook({
        nrCreators: 4,
        numMints: 2,
        canopyDepth,
        setupTswap: true
      });
      const { whitelist } = await makeVocWhitelist(collectionMint);

      for (const { leaf, index, metadata, assetId } of leaves) {
        const { marginPda, marginNr, marginRent } = await testMakeMargin({
          owner: traderB
        });
        await testDepositIntoMargin({
          owner: traderB,
          marginNr,
          marginPda,
          amount: LAMPORTS_PER_SOL
        });
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: Target.Whitelist,
          targetId: whitelist,
          bidId: whitelist,
          owner: traderB,
          privateTaker: null,
          margin: marginPda
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
          bidId: whitelist,
          target: Target.Whitelist,
          lookupTableAccount,
          whitelist
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
          setupTswap: true
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        const { marginPda, marginNr, marginRent } = await testMakeMargin({
          owner: traderB
        });
        await testDepositIntoMargin({
          owner: traderB,
          marginNr,
          marginPda,
          amount: LAMPORTS_PER_SOL
        });
        // do a non-marginated bid
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          targetId: assetId,
          owner: traderB,
          privateTaker: null
        });
        // do a marginated bid
        const bidderLamports1 = await getLamports(traderB.publicKey);
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          targetId: assetId,
          owner: traderB,
          privateTaker: null,
          margin: marginPda
        });
        const bidderLamports2 = await getLamports(traderB.publicKey);
        //the amount that got initially deposited is returned to the bidder, since the order is now marginated
        expect(bidderLamports2! - bidderLamports1!).to.eq(LAMPORTS_PER_SOL);

        // non-marginated again
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          targetId: assetId,
          owner: traderB,
          privateTaker: null
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
          bidId: assetId
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
          setupTswap: true
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        const { marginPda, marginNr, marginRent } = await testMakeMargin({
          owner: traderB
        });
        await testDepositIntoMargin({
          owner: traderB,
          marginNr,
          marginPda,
          amount: LAMPORTS_PER_SOL
        });
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          targetId: assetId,
          owner: traderB,
          privateTaker: null,
          margin: marginPda
        });
        //intentionally withdraw
        await testWithdrawFromMargin({
          owner: traderB,
          marginNr,
          marginPda,
          amount: 0.3 * LAMPORTS_PER_SOL,
          expectedLamports: 0.7 * LAMPORTS_PER_SOL
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
            bidId: assetId
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
            canopyDepth
          });

        for (const { leaf, index, metadata, assetId } of leaves) {
          await expect(
            testBid({
              amount: new BN(LAMPORTS_PER_SOL),
              target: Target.AssetId,
              targetId: assetId,
              owner: traderB,
              bidId: Keypair.generate().publicKey
            })
          ).to.be.rejectedWith(
            tcompSdk.getErrorCodeHex("TargetIdMustEqualBidId")
          );
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL),
            target: Target.AssetId,
            targetId: assetId,
            owner: traderB,
            bidId: assetId
          });
        }
      }
    });

    // --------------------------------------- VOC bids

    it("VOC: bids + edits + accepts bid", async () => {
      const takerBroker = Keypair.generate().publicKey;

      const canopyDepth = 10;
      for (const nrCreators of [0, 1, 4]) {
        const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
          await beforeHook({
            nrCreators,
            numMints: 2,
            canopyDepth
          });

        for (const { leaf, index, metadata, assetId } of leaves) {
          const { whitelist } = await makeVocWhitelist(
            metadata.collection!.key
          );
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL),
            target: Target.Whitelist,
            targetId: whitelist,
            owner: traderB
          });
          //fails if try to change the target
          await expect(
            testBid({
              amount: new BN(LAMPORTS_PER_SOL / 2),
              target: Target.AssetId, //wrong target
              targetId: whitelist,
              owner: traderB,
              prevBidAmount: LAMPORTS_PER_SOL
            })
          ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("CannotModifyTarget"));
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL / 2),
            target: Target.Whitelist,
            targetId: whitelist,
            owner: traderB,
            prevBidAmount: LAMPORTS_PER_SOL
          });
          // -------------------- failure cases
          await expect(
            testTakeBid({
              target: Target.AssetId, //wrong target
              index,
              lookupTableAccount,
              memTree,
              merkleTree,
              metadata,
              minAmount: new BN(LAMPORTS_PER_SOL / 2),
              owner: traderB.publicKey,
              seller: traderA,
              canopyDepth,
              bidId: whitelist,
              whitelist
            })
          ).to.be.rejectedWith(wlSdk.getErrorCodeHex("FailedVocVerification"));
          // -------------------- final purchase
          await testTakeBid({
            target: Target.Whitelist,
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL / 2),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: whitelist,
            whitelist,
            takerBroker // pass in a taker broker so the fee is split and our calculations are correct
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
          collectionMint
        } = await beforeHook({
          nrCreators,
          numMints: 2,
          canopyDepth,
          collectionless: true
        });
        const { whitelist } = await makeVocWhitelist(collectionMint);

        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: Target.Whitelist,
          targetId: whitelist,
          owner: traderB
        });

        for (const { leaf, index, metadata, assetId } of leaves) {
          await expect(
            testTakeBid({
              target: Target.Whitelist,
              index,
              lookupTableAccount,
              memTree,
              merkleTree,
              metadata,
              minAmount: new BN(LAMPORTS_PER_SOL),
              owner: traderB.publicKey,
              seller: traderA,
              canopyDepth,
              bidId: whitelist,
              whitelist
            })
          ).to.be.rejectedWith(wlSdk.getErrorCodeHex("FailedVocVerification"));
        }
      }
    });

    it("VOC: fails to take a collection bid with a unverified collection mint", async () => {
      const canopyDepth = 10;
      for (const nrCreators of [0, 1, 4]) {
        const {
          merkleTree,
          traderA,
          leaves,
          traderB,
          memTree,
          treeOwner,
          collectionMint
        } = await beforeHook({
          nrCreators,
          numMints: 2,
          canopyDepth,
          //this will add the collection to metadata but it wont be verified and we wont use mint_to_collection ix
          unverifiedCollection: true
        });
        const { whitelist } = await makeVocWhitelist(collectionMint);

        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: Target.Whitelist,
          targetId: whitelist,
          owner: traderB
        });

        for (const { leaf, index, metadata, assetId } of leaves) {
          await expect(
            testTakeBid({
              target: Target.Whitelist,
              index,
              lookupTableAccount,
              memTree,
              merkleTree,
              metadata,
              minAmount: new BN(LAMPORTS_PER_SOL),
              owner: traderB.publicKey,
              seller: traderA,
              canopyDepth,
              bidId: whitelist,
              whitelist
            })
          ).to.be.rejectedWith(wlSdk.getErrorCodeHex("FailedVocVerification"));
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
            canopyDepth
          });

        const fakeCollection = Keypair.generate().publicKey;
        const { whitelist } = await makeVocWhitelist(fakeCollection);

        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: Target.Whitelist,
          targetId: whitelist,
          owner: traderB
        });

        for (const { leaf, index, metadata, assetId } of leaves) {
          await expect(
            testTakeBid({
              target: Target.Whitelist,
              index,
              lookupTableAccount,
              memTree,
              merkleTree,
              metadata,
              minAmount: new BN(LAMPORTS_PER_SOL),
              owner: traderB.publicKey,
              seller: traderA,
              canopyDepth,
              bidId: whitelist,
              whitelist
            })
          ).to.be.rejectedWith(wlSdk.getErrorCodeHex("FailedVocVerification"));
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
            canopyDepth
          });

        const { whitelist } = await makeVocWhitelist(
          leaves[0].metadata.collection!.key
        );

        const bidId1 = Keypair.generate().publicKey;
        const bidId2 = Keypair.generate().publicKey;
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: Target.Whitelist,
          targetId: whitelist,
          owner: traderB,
          bidId: bidId1
        });
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: Target.Whitelist,
          targetId: whitelist,
          owner: traderB,
          bidId: bidId2
        });

        for (const { leaf, index, metadata, assetId } of leaves) {
          await testTakeBid({
            target: Target.Whitelist,
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
            whitelist
          });
        }
      }
    });

    // --------------------------------------- FVC bids

    it("FVC: bids + edits + accepts bid", async () => {
      const canopyDepth = 10;
      const verifiedCreator = Keypair.generate();
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 0, //keep this at 0 or need to rewrite how skippedCreators work
          numMints: 1, //keep at 1 or need to take into account prev creator earnings, which I CBA
          canopyDepth,
          verifiedCreator
        });

      const { whitelist } = await makeFvcWhitelist(verifiedCreator.publicKey);

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: Target.Whitelist,
          targetId: whitelist,
          owner: traderB
        });
        //fails if try to change the target
        await expect(
          testBid({
            amount: new BN(LAMPORTS_PER_SOL / 2),
            target: Target.AssetId, //wrong target
            targetId: whitelist,
            owner: traderB,
            prevBidAmount: LAMPORTS_PER_SOL
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("CannotModifyTarget"));
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          target: Target.Whitelist,
          targetId: whitelist,
          owner: traderB,
          prevBidAmount: LAMPORTS_PER_SOL
        });
        // -------------------- failure cases
        //can't do a bad case for assetId since it's only used for picking branch js side and VOC branch will be picked correctly
        // -------------------- final purchase
        await testTakeBid({
          target: Target.Whitelist,
          index,
          lookupTableAccount,
          memTree,
          merkleTree,
          metadata,
          minAmount: new BN(LAMPORTS_PER_SOL / 2),
          owner: traderB.publicKey,
          seller: traderA,
          canopyDepth,
          bidId: whitelist,
          whitelist
        });
      }
    });

    it("FVC: fails to accept bid on a creatorless mint", async () => {
      const canopyDepth = 10;
      const fakeCreator = Keypair.generate();
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 0,
          numMints: 2,
          canopyDepth
          //intentionally not passing verifiedCreator
        });
      const { whitelist } = await makeFvcWhitelist(fakeCreator.publicKey);

      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        target: Target.Whitelist,
        targetId: whitelist,
        owner: traderB
      });

      for (const { leaf, index, metadata, assetId } of leaves) {
        await expect(
          testTakeBid({
            target: Target.Whitelist,
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: whitelist,
            whitelist
          })
        ).to.be.rejectedWith(wlSdk.getErrorCodeHex("FailedFvcVerification"));
      }
    });

    it("FVC: fails to accept bid on a mint with a non verified creator", async () => {
      const canopyDepth = 10;
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 1,
          numMints: 2,
          canopyDepth
        });

      for (const { leaf, index, metadata, assetId } of leaves) {
        const { whitelist } = await makeFvcWhitelist(
          metadata.creators[0].address
        );
        const bidId = Keypair.generate().publicKey;
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: Target.Whitelist,
          targetId: whitelist,
          owner: traderB,
          bidId
        });
        await expect(
          testTakeBid({
            target: Target.Whitelist,
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
            whitelist
          })
        ).to.be.rejectedWith(wlSdk.getErrorCodeHex("FailedFvcVerification"));
      }
    });

    it("FVC: fails to accept bid on a mint with a different verified creator", async () => {
      const verifiedCreator = Keypair.generate();
      const canopyDepth = 10;
      let { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 0,
          numMints: 1,
          canopyDepth,
          verifiedCreator
        });

      //create one more mint with a diff creator
      const secondVerifiedCreator = Keypair.generate();
      const { collectionMint } = await initCollection({ owner: treeOwner });
      let metadata = await makeCNftMeta({
        collectionMint,
        nrCreators: 0
      });
      let leaf;
      let assetId;
      metadata.creators.push({
        address: secondVerifiedCreator.publicKey,
        verified: false,
        share: 100
      });
      await mintCNft({
        merkleTree,
        metadata,
        treeOwner,
        receiver: traderA.publicKey
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
        verifiedCreator: secondVerifiedCreator
      }));
      leaves.push({
        index: leaves.length,
        metadata,
        assetId,
        leaf
      });

      const { whitelist } = await makeFvcWhitelist(verifiedCreator.publicKey);

      const bidId = Keypair.generate().publicKey;
      //bid on first mint
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        target: Target.Whitelist,
        targetId: whitelist,
        owner: traderB,
        bidId
      });
      //try to sell second
      await expect(
        testTakeBid({
          target: Target.Whitelist,
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
          whitelist
        })
      ).to.be.rejectedWith(wlSdk.getErrorCodeHex("FailedFvcVerification"));
      //sell first
      await testTakeBid({
        target: Target.Whitelist,
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
        whitelist
      });
    });

    // --------------------------------------- VOC + Name bids

    it("VOC + Name: bids + edits + accepts bid", async () => {
      const canopyDepth = 10;
      for (const nrCreators of [0, 1, 4]) {
        const {
          merkleTree,
          traderA,
          leaves,
          traderB,
          memTree,
          treeOwner,
          collectionMint
        } = await beforeHook({
          nrCreators,
          numMints: 2,
          canopyDepth
        });

        const { whitelist } = await makeVocWhitelist(collectionMint);

        for (const { leaf, index, metadata, assetId } of leaves) {
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL),
            target: Target.Whitelist,
            targetId: whitelist,
            field: Field.Name,
            fieldId: new PublicKey(nameToBuffer(metadata.name)),
            owner: traderB
          });
          //fails if try to change the target
          await expect(
            testBid({
              amount: new BN(LAMPORTS_PER_SOL),
              target: Target.Whitelist,
              targetId: whitelist,
              field: Field.Name,
              fieldId: new PublicKey(nameToBuffer("failooooor")), //<-- boo
              owner: traderB,
              prevBidAmount: LAMPORTS_PER_SOL
            })
          ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("CannotModifyTarget"));
          await testBid({
            amount: new BN(LAMPORTS_PER_SOL / 2),
            target: Target.Whitelist,
            targetId: whitelist,
            field: Field.Name,
            fieldId: new PublicKey(nameToBuffer(metadata.name)),
            owner: traderB,
            prevBidAmount: LAMPORTS_PER_SOL
          });
          // -------------------- failure cases
          await expect(
            testTakeBid({
              target: Target.AssetId, //wrong target
              index,
              lookupTableAccount,
              memTree,
              merkleTree,
              metadata,
              minAmount: new BN(LAMPORTS_PER_SOL / 2),
              owner: traderB.publicKey,
              seller: traderA,
              canopyDepth,
              bidId: whitelist,
              whitelist
            })
          ).to.be.rejectedWith(wlSdk.getErrorCodeHex("FailedVocVerification"));
          // -------------------- final purchase
          await testTakeBid({
            target: Target.Whitelist,
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL / 2),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: whitelist,
            whitelist
          });
        }
      }
    });

    it("VOC + Name: rejects an NFT with wrong name", async () => {
      const canopyDepth = 10;
      for (const nrCreators of [0, 1, 4]) {
        const {
          merkleTree,
          traderA,
          leaves,
          traderB,
          memTree,
          treeOwner,
          collectionMint
        } = await beforeHook({
          nrCreators,
          numMints: 2,
          canopyDepth
        });

        const { whitelist } = await makeVocWhitelist(collectionMint);

        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: Target.Whitelist,
          targetId: whitelist,
          field: Field.Name,
          fieldId: new PublicKey(nameToBuffer(leaves.at(-1)!.metadata.name)),
          owner: traderB
        });

        for (const { leaf, index, metadata, assetId } of leaves) {
          if (index === leaves.length - 1) {
            await testTakeBid({
              target: Target.Whitelist,
              index,
              lookupTableAccount,
              memTree,
              merkleTree,
              metadata,
              minAmount: new BN(LAMPORTS_PER_SOL),
              owner: traderB.publicKey,
              seller: traderA,
              canopyDepth,
              bidId: whitelist,
              whitelist
            });
            continue;
          }
          await expect(
            testTakeBid({
              target: Target.Whitelist,
              index,
              lookupTableAccount,
              memTree,
              merkleTree,
              metadata,
              minAmount: new BN(LAMPORTS_PER_SOL),
              owner: traderB.publicKey,
              seller: traderA,
              canopyDepth,
              bidId: whitelist,
              whitelist
            })
          ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongBidFieldId"));
        }
      }
    });

    // --------------------------------------- FVC + Name bids

    it("FVC + Name: bids + edits + accepts bid", async () => {
      const canopyDepth = 10;
      const verifiedCreator = Keypair.generate();
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 0,
          numMints: 1,
          canopyDepth,
          verifiedCreator
        });

      const { whitelist } = await makeFvcWhitelist(verifiedCreator.publicKey);

      for (const { leaf, index, metadata, assetId } of leaves) {
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: Target.Whitelist,
          targetId: whitelist,
          field: Field.Name,
          fieldId: new PublicKey(nameToBuffer(metadata.name)),
          owner: traderB
        });
        //fails if try to change the target
        await expect(
          testBid({
            amount: new BN(LAMPORTS_PER_SOL),
            target: Target.Whitelist,
            targetId: whitelist,
            field: Field.Name,
            fieldId: new PublicKey(nameToBuffer("failooooor")), //<-- boo
            owner: traderB,
            prevBidAmount: LAMPORTS_PER_SOL
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("CannotModifyTarget"));
        await testBid({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          target: Target.Whitelist,
          targetId: whitelist,
          field: Field.Name,
          fieldId: new PublicKey(nameToBuffer(metadata.name)),
          owner: traderB,
          prevBidAmount: LAMPORTS_PER_SOL
        });
        // -------------------- failure cases
        //can't do a bad case for assetId since/voc it's only used for picking branch js side and FVC branch will be picked correctly
        // -------------------- final purchase
        await testTakeBid({
          target: Target.Whitelist,
          field: Field.Name,
          index,
          lookupTableAccount,
          memTree,
          merkleTree,
          metadata,
          minAmount: new BN(LAMPORTS_PER_SOL / 2),
          owner: traderB.publicKey,
          seller: traderA,
          canopyDepth,
          bidId: whitelist,
          whitelist
        });
      }
    });

    it("FVC + Name: rejects an NFT with wrong name", async () => {
      const canopyDepth = 12;
      const verifiedCreator = Keypair.generate();
      const { merkleTree, traderA, leaves, traderB, memTree, treeOwner } =
        await beforeHook({
          nrCreators: 0,
          numMints: 2,
          canopyDepth,
          verifiedCreator
        });
      const { whitelist } = await makeFvcWhitelist(verifiedCreator.publicKey);

      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        target: Target.Whitelist,
        targetId: whitelist,
        field: Field.Name,
        fieldId: new PublicKey(nameToBuffer(leaves.at(-1)!.metadata.name)),
        owner: traderB
      });

      for (const { leaf, index, metadata, assetId } of leaves) {
        if (index === leaves.length - 1) {
          await testTakeBid({
            target: Target.Whitelist,
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: whitelist,
            field: Field.Name,
            whitelist
          });
          continue;
        }
        await expect(
          testTakeBid({
            target: Target.Whitelist,
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: whitelist,
            field: Field.Name,
            whitelist
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongBidFieldId"));
      }
    });

    // --------------------------------------- quantity

    it("VOC: bids + accepts bid (multiple quantity)", async () => {
      const canopyDepth = 10;
      for (const nrCreators of [0, 1, 4]) {
        const {
          merkleTree,
          traderA,
          leaves,
          traderB,
          memTree,
          treeOwner,
          collectionMint
        } = await beforeHook({
          nrCreators,
          numMints: 4,
          canopyDepth
        });
        const { whitelist } = await makeVocWhitelist(collectionMint);

        await testBid({
          amount: new BN(LAMPORTS_PER_SOL),
          target: Target.Whitelist,
          targetId: whitelist,
          owner: traderB,
          quantity: 3
        });

        for (const { leaf, index, metadata, assetId } of leaves) {
          if (index === leaves.length - 1) {
            await expect(
              testTakeBid({
                target: Target.Whitelist,
                index,
                lookupTableAccount,
                memTree,
                merkleTree,
                metadata,
                minAmount: new BN(LAMPORTS_PER_SOL),
                owner: traderB.publicKey,
                seller: traderA,
                canopyDepth,
                bidId: whitelist,
                whitelist
              })
            ).to.be.rejectedWith(ACC_NOT_INIT_ERR);
            continue;
          }
          await testTakeBid({
            target: Target.Whitelist,
            index,
            lookupTableAccount,
            memTree,
            merkleTree,
            metadata,
            minAmount: new BN(LAMPORTS_PER_SOL),
            owner: traderB.publicKey,
            seller: traderA,
            canopyDepth,
            bidId: whitelist,
            whitelist
          });
          //can't edit down
          if (index === 1) {
            await expect(
              testBid({
                amount: new BN(LAMPORTS_PER_SOL),
                target: Target.Whitelist,
                targetId: whitelist,
                owner: traderB,
                quantity: 1
              })
            ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("BadQuantity"));
          }
        }
      }
    });

    it("VOC: bids + closes & returns money (multiple quantity)", async () => {
      const canopyDepth = 10;
      const {
        merkleTree,
        traderA,
        leaves,
        traderB,
        memTree,
        treeOwner,
        collectionMint
      } = await beforeHook({
        nrCreators: 4,
        numMints: 3,
        canopyDepth
      });
      const { whitelist } = await makeVocWhitelist(collectionMint);

      const bidId = Keypair.generate().publicKey;
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        target: Target.Whitelist,
        targetId: whitelist,
        owner: traderB,
        quantity: 2,
        bidId
      });
      await testCancelCloseBid({
        amount: new BN(LAMPORTS_PER_SOL),
        owner: traderB,
        bidId
      });
    });
  });

  describe("legacy nfts", () => {
    for (const useRentPayer of [true, false]) {
      describe("With rent payer: " + useRentPayer, () => {
        it("bids + edits + accepts bid for DECOMPRESSED non-pnft", async () => {
          const canopyDepth = 10;
          const nrCreators = 4;
          const {
            merkleTree,
            traderA,
            leaves,
            traderB,
            memTree,
            rentPayer: _rentPayer,
            secondaryRentPayer
          } = await beforeHook({
            nrCreators,
            numMints: 2,
            canopyDepth
          });

          const rentPayer = useRentPayer ? _rentPayer : undefined;

          for (const { index, metadata, assetId } of leaves) {
            await withLamports(
              { ...(rentPayer ? { prevRentPayer: rentPayer?.publicKey } : {}) },
              async ({ prevRentPayer }) => {
                await testBid({
                  amount: new BN(LAMPORTS_PER_SOL),
                  targetId: assetId,
                  owner: traderB,
                  rentPayer
                });
                await testBid({
                  amount: new BN(LAMPORTS_PER_SOL / 2),
                  targetId: assetId,
                  owner: traderB,
                  prevBidAmount: LAMPORTS_PER_SOL
                });

                const { mint, ata } = await decompressCNft({
                  memTree,
                  merkleTree,
                  index,
                  owner: traderA,
                  metadataArgs: metadata,
                  canopyDepth
                });
                expect(mint.toBase58()).eq(assetId.toBase58());

                const common = {
                  bidId: assetId,
                  nftMint: mint,
                  nftSellerAcc: ata,
                  owner: traderB.publicKey,
                  seller: traderA,
                  lookupTableAccount,
                  creators: metadata.creators,
                  royaltyBps: metadata.sellerFeeBasisPoints
                };
                //try to take at the wrong price
                await expect(
                  testTakeBidLegacy({
                    ...common,
                    minAmount: new BN(LAMPORTS_PER_SOL),
                    rentDest: rentPayer?.publicKey
                  })
                ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));
                //try to take with the wrong rent payer
                await expect(
                  testTakeBidLegacy({
                    ...common,
                    minAmount: new BN(LAMPORTS_PER_SOL / 2),
                    rentDest: secondaryRentPayer.publicKey
                  })
                ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("BadRentDest"));
                await testTakeBidLegacy({
                  ...common,
                  minAmount: new BN(LAMPORTS_PER_SOL / 2),
                  rentDest: rentPayer?.publicKey
                });

                if (rentPayer) {
                  // rent payer is refunded
                  const currRentPayer = await getLamports(rentPayer.publicKey);
                  expect(currRentPayer! - prevRentPayer!).eq(0);
                }
              }
            );
          }
        });

        it("bids + edits + accepts bid for pNFT", async () => {
          // TODO: Add cosigner tests.
          for (const cosigned of [false]) {
            const [traderA, traderB] = await makeNTraders({
              n: 2
            });

            const cosigner = cosigned ? Keypair.generate() : undefined;

            const creators = [
              {
                address: Keypair.generate().publicKey,
                share: 100,
                verified: false
              }
            ];
            const royaltyBps = 100;
            const { mint, ata } = await makeMintTwoAta({
              owner: traderA,
              other: traderB,
              programmable: true,
              creators,
              royaltyBps,
              ruleSetAddr
            });
            const badMint = Keypair.generate();
            const { ata: badAta } = await test_utils.createNft({
              ...TEST_CONN_PAYER,
              owner: traderA,
              mint: badMint,
              tokenStandard: TokenStandard.ProgrammableNonFungible,
              creators,
              royaltyBps
            });

            await testBid({
              amount: new BN(LAMPORTS_PER_SOL),
              targetId: mint,
              owner: traderB,
              cosigner
            });
            await testBid({
              amount: new BN(LAMPORTS_PER_SOL / 2),
              targetId: mint,
              owner: traderB,
              prevBidAmount: LAMPORTS_PER_SOL,
              cosigner
            });

            const common = {
              bidId: mint,
              nftMint: mint,
              nftSellerAcc: ata,
              owner: traderB.publicKey,
              seller: traderA,
              lookupTableAccount,
              creators,
              royaltyBps,
              programmable: true
            };

            if (cosigned) {
              await expect(
                testTakeBidLegacy({
                  ...common,
                  minAmount: new BN(LAMPORTS_PER_SOL)
                })
              ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("BadCosigner"));
            }

            // Bid too low.
            await expect(
              testTakeBidLegacy({
                ...common,
                minAmount: new BN(LAMPORTS_PER_SOL),
                cosigner
              })
            ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));

            // Mismatch NFT.
            await expect(
              testTakeBidLegacy({
                ...common,
                nftMint: badMint.publicKey,
                nftSellerAcc: badAta,
                minAmount: new BN(LAMPORTS_PER_SOL / 2),
                cosigner
              })
            ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongTargetId"));

            // Final sale.
            await testTakeBidLegacy({
              ...common,
              minAmount: new BN(LAMPORTS_PER_SOL / 2),
              cosigner
            });
          }
        });
      });
    }
  });

  // TODO: Add cosigner tests.
  it.skip("bids + accepts bid for pNFT (using hashlist verification)", async () => {
    for (const useFakeWhitelist of [true, false]) {
      const [traderA, traderB] = await makeNTraders({
        n: 2
      });

      //just so we're testing extra accs
      const cosigner = Keypair.generate();

      const creators = Array(5)
        .fill(null)
        .map(() => ({
          address: Keypair.generate().publicKey,
          share: 20,
          verified: false
        }));
      const royaltyBps = 100;
      const { mint, ata } = await makeMintTwoAta({
        owner: traderA,
        other: traderB,
        programmable: true,
        creators,
        royaltyBps
      });

      //real whitelist + proof
      const {
        proofs: [wlNft],
        whitelist
      } = await makeProofWhitelist([mint]);
      await testInitUpdateMintProof({
        user: traderA,
        mint,
        whitelist,
        proof: wlNft.proof,
        expectedProofLen: wlNft.proof.length
      });

      //fake whitelist
      const {
        proofs: [fakeProof],
        whitelist: fakeWhitelist
      } = await makeProofWhitelist([PublicKey.default]);

      await testBid({
        amount: new BN(LAMPORTS_PER_SOL / 2),
        target: Target.Whitelist,
        targetId: useFakeWhitelist ? fakeWhitelist : whitelist,
        owner: traderB,
        cosigner,
        bidId: mint
      });

      const common = {
        bidId: mint,
        nftMint: mint,
        nftSellerAcc: ata,
        owner: traderB.publicKey,
        seller: traderA,
        lookupTableAccount,
        creators,
        royaltyBps,
        programmable: true
      };

      if (useFakeWhitelist) {
        await expect(
          testTakeBidLegacy({
            ...common,
            minAmount: new BN(LAMPORTS_PER_SOL / 2),
            cosigner,
            whitelist: fakeWhitelist
          })
        ).rejectedWith(tcompSdk.getErrorCodeHex("BadMintProof"));
      } else {
        await expect(
          testTakeBidLegacy({
            ...common,
            minAmount: new BN(LAMPORTS_PER_SOL / 2),
            cosigner,
            whitelist: fakeWhitelist
          })
        ).rejectedWith(tcompSdk.getErrorCodeHex("WrongTargetId"));
        await testTakeBidLegacy({
          ...common,
          minAmount: new BN(LAMPORTS_PER_SOL / 2),
          cosigner,
          whitelist
        });
      }
    }
  });

  it("VOC: bids + accepts bid for pnft", async () => {
    const [traderA, traderB] = await makeNTraders({
      n: 2
    });
    const royaltyBps = 100;
    const kp = Keypair.generate();
    const creators = [
      {
        address: kp.publicKey,
        share: 100,
        verified: false
      }
    ];
    const collection = Keypair.generate();
    const unverifiedMint = Keypair.generate();
    const { ata: unverifiedAta } = await test_utils.createNft({
      ...TEST_CONN_PAYER,
      owner: traderA,
      mint: unverifiedMint,
      tokenStandard: TokenStandard.ProgrammableNonFungible,
      collection,
      collectionVerified: false,
      creators,
      royaltyBps
    });
    const { mint, ata } = await makeMintTwoAta({
      owner: traderA,
      other: traderB,
      programmable: true,
      collection,
      collectionVerified: true,
      creators,
      royaltyBps
    });

    const { whitelist } = await makeVocWhitelist(collection.publicKey);
    await testBid({
      amount: new BN(LAMPORTS_PER_SOL / 2),
      target: Target.Whitelist,
      targetId: whitelist,
      owner: traderB
    });

    const common = {
      bidId: whitelist,
      whitelist,
      owner: traderB.publicKey,
      seller: traderA,
      lookupTableAccount,
      creators,
      royaltyBps,
      programmable: true,
      minAmount: new BN(LAMPORTS_PER_SOL / 2)
    };
    console.log(wlSdk.getErrorCodeHex("FailedVocVerification"));
    await expect(
      testTakeBidLegacy({
        nftMint: unverifiedMint.publicKey,
        nftSellerAcc: unverifiedAta,
        ...common
      })
    ).rejectedWith(wlSdk.getErrorCodeHex("FailedVocVerification")); // BadMintProof 0x1781

    // -------------------- valid purchase
    await testTakeBidLegacy({
      nftMint: mint,
      nftSellerAcc: ata,
      ...common
    });
  });
});
