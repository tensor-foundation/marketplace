import { BN } from "@coral-xyz/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { makeNTraders } from "./account";
import { beforeAllHook, tcompSdk, testBid, testTakeBidWns } from "./shared";
import { wnsMint, wnsTokenAccount } from "./wns";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("[WNS Token 2022] tcomp bids", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  let ruleSetAddr: PublicKey;
  before(async () => {
    const res = await beforeAllHook();
    lookupTableAccount = res.lookupTableAccount ?? undefined;
    ruleSetAddr = res.ruleSetAddr;
  });

  it("[WNS] bids + edits + accepts bid for WNS NFT", async () => {
    // TODO: Add cosigner tests.
    for (const cosigned of [false]) {
      const [traderA, traderB] = await makeNTraders({
        n: 2,
      });

      const cosigner = cosigned ? Keypair.generate() : undefined;

      const {
        mint,
        token: ata,
        collection: collectionMint,
      } = await wnsMint(traderA.publicKey, undefined, 0);

      await wnsTokenAccount(traderB.publicKey, mint);

      const { mint: badMint, token: badAta } = await wnsMint(
        traderA.publicKey,
        undefined,
        0
      );

      await testBid({
        amount: new BN(LAMPORTS_PER_SOL),
        targetId: mint,
        owner: traderB,
        cosigner,
      });
      await testBid({
        amount: new BN(LAMPORTS_PER_SOL / 2),
        targetId: mint,
        owner: traderB,
        prevBidAmount: LAMPORTS_PER_SOL,
        cosigner,
      });

      const common = {
        bidId: mint,
        nftMint: mint,
        nftSellerAcc: ata,
        owner: traderB.publicKey,
        seller: traderA,
        lookupTableAccount,
      };

      if (cosigned) {
        await expect(
          testTakeBidWns({
            ...common,
            minAmount: new BN(LAMPORTS_PER_SOL),
            collectionMint,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("BadCosigner"));
      }

      // Bid too low.
      await expect(
        testTakeBidWns({
          ...common,
          minAmount: new BN(LAMPORTS_PER_SOL),
          cosigner,
          collectionMint,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));

      // Mismatch NFT.
      await expect(
        testTakeBidWns({
          ...common,
          nftMint: badMint,
          nftSellerAcc: badAta,
          minAmount: new BN(LAMPORTS_PER_SOL / 2),
          cosigner,
          collectionMint,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongTargetId"));

      // Final sale.
      await testTakeBidWns({
        ...common,
        minAmount: new BN(LAMPORTS_PER_SOL / 2),
        cosigner,
        collectionMint,
      });
    }
  });
});
