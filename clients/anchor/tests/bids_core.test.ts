import { BN } from "@coral-xyz/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import { nameToBuffer } from "@tensor-hq/tensor-common";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Field, MakeEvent, MAKER_BROKER_PCT, TakeEvent, Target } from "../src";
import { makeNTraders } from "./account";
import {
  createAssetWithCollection,
  createUmi,
  getOwner,
} from "./metaplex_core";
import {
  beforeAllHook,
  BROKER_FEE_PCT,
  FEE_PCT,
  fetchAndCheckSingleIxTx,
  tcompSdk,
  testBid,
  testTakeBidCore,
} from "./shared";
import { makeVocWhitelist } from "./tswap";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("[mpl-core] tcomp bids", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  let ruleSetAddr: PublicKey;
  before(async () => {
    const res = await beforeAllHook();
    lookupTableAccount = res.lookupTableAccount ?? undefined;
    ruleSetAddr = res.ruleSetAddr;
  });

  it("[core] bids + edits + accepts bid for Core NFT", async () => {
    const umi = await createUmi();
    // TODO: Add cosigner tests.
    for (const cosigned of [false]) {
      const [traderA, traderB] = await makeNTraders({
        n: 2,
      });

      const cosigner = cosigned ? Keypair.generate() : undefined;
      const royaltyBps = 500;

      const { asset, collection } = await createAssetWithCollection(
        umi,
        traderA.publicKey,
        undefined,
        royaltyBps,
        5 // <-- number of creators
      );

      const { asset: badAsset, collection: badCollection } =
        await createAssetWithCollection(umi, traderA.publicKey, undefined, 0);

      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        targetId: asset,
        owner: traderB,
        cosigner,
      });
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL / 2),
        targetId: asset,
        owner: traderB,
        prevBidAmount: LAMPORTS_PER_SOL,
        cosigner,
      });

      const common = {
        bidId: asset,
        asset: asset,
        collection,
        owner: traderB.publicKey,
        seller: traderA,
        lookupTableAccount,
      };

      if (cosigned) {
        await expect(
          testTakeBidCore({
            ...common,
            minAmount: new BN(LAMPORTS_PER_SOL),
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("BadCosigner"));
      }

      // Bid too low.
      await expect(
        testTakeBidCore({
          ...common,
          minAmount: new BN(LAMPORTS_PER_SOL),
          cosigner,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));

      // Mismatch NFT.
      await expect(
        testTakeBidCore({
          ...common,
          asset: badAsset,
          minAmount: new BN(LAMPORTS_PER_SOL / 2),
          cosigner,
          collection: badCollection,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongTargetId"));

      // Final sale.
      await testTakeBidCore({
        ...common,
        minAmount: new BN(LAMPORTS_PER_SOL / 2),
        cosigner,
        collection,
        royaltyBps,
      });

      // check ownership
      expect(await getOwner(umi, asset)).to.deep.equal(traderB.publicKey);
    }
  });

  it("[core] parses VOC + name + quantity bid txs ok", async () => {
    const umi = await createUmi();
    const [traderA, traderB] = await makeNTraders({ n: 2 });

    const royaltyBps = 500;
    const { asset, collection, name } = await createAssetWithCollection(
      umi,
      traderA.publicKey,
      undefined,
      royaltyBps
    );

    const takerBroker = Keypair.generate().publicKey;
    const { whitelist } = await makeVocWhitelist(collection);

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
        quantity: 2,
      };
      await expect(
        testBid({
          ...commonArgs,
          field: Field.Name,
          fieldId: null,
        })
      ).rejectedWith(tcompSdk.getErrorCodeHex("BadBidField"));

      await expect(
        testBid({
          ...commonArgs,
          field: null,
          fieldId: new PublicKey(nameToBuffer(name)),
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
        fieldId: new PublicKey(nameToBuffer(name)),
        privateTaker: traderA.publicKey,
        quantity: 2,
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
        new PublicKey(nameToBuffer(name))?.toString()
      );
      expect(event.amount.toString()).eq(amount.toString());
      expect(event.quantity).eq(2);
      expect(event.currency).to.be.null;
      expect(event.privateTaker?.toString()).eq(traderA.publicKey.toString());
    }

    // --------------------------------------- Take Bid

    {
      const { sig } = await testTakeBidCore({
        asset,
        collection,
        minAmount: new BN(amount),
        seller: traderA,
        owner: traderB.publicKey,
        takerBroker,
        bidId: whitelist,
        whitelist,
        royaltyBps,
      });
      const ix = await fetchAndCheckSingleIxTx(sig!, "takeBidCore");
      const event = tcompSdk.getEvent(ix) as unknown as TakeEvent;
      expect(event.type).eq("taker");
      expect(event.taker.toString()).eq(traderA.publicKey.toString());
      expect(event.bidId?.toString()).to.eq(whitelist.toString());
      expect(event.target).to.eq(Target.Whitelist);
      expect(event.targetId.toString()).eq(whitelist.toString());
      expect(event.field).to.eq(Field.Name);
      expect(event.fieldId?.toString()).to.eq(
        new PublicKey(nameToBuffer(name))?.toString()
      );
      expect(event.amount.toString()).eq(amount.toString());

      // Protocol fee is the remainder after broker fees are deducted.
      expect(event.tcompFee?.toNumber()).eq(
        Math.trunc(amount * FEE_PCT * (1 - BROKER_FEE_PCT / 100))
      );

      const brokerFee = Math.trunc((amount * FEE_PCT * BROKER_FEE_PCT) / 100);

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
        Math.trunc((amount * royaltyBps) / 10000)
      );

      expect(event.quantity).eq(1);
      expect(event.currency).to.be.null;
    }
  });
});
