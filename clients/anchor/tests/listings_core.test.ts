import { BN } from "@coral-xyz/anchor";
import { AddressLookupTableAccount, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { isNullLike, waitMS } from "@tensor-hq/tensor-common";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { makeNTraders } from "./account";
import { createAssetWithCollection, createUmi } from "./metaplex_core";
import {
  ALREADY_IN_USE_ERR,
  beforeAllHook,
  tcompSdk,
  testBuyCore,
  testDelistCore,
  testEdit,
  testListCore
} from "./shared";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("[mpl-core] tcomp listings", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  before(async () => {
    const res = await beforeAllHook();
    lookupTableAccount = res.lookupTableAccount ?? undefined;
  });

  // SPL not currently supported
  for (const currency of [null]) {
    /// limit the number of creators to 0 or 1 when there is a currency
    /// as buy_spl requires more tx space
    const capSplCreators = (nrCreators: number[]): number[] => {
      if (isNullLike(currency)) {
        return nrCreators;
      }
      return nrCreators.filter((num) => num < 2); // buy_spl doesn't have enough room for >=2
    };

    describe(`Testing ${isNullLike(currency) ? "SOL" : "USDC"}`, () => {
      it("[core] lists + edits + buys", async () => {
        const umi = await createUmi();
        const [owner, buyer] = await makeNTraders({ n: 2 });

        const royaltyBps = 500;
        const { asset, collection } = await createAssetWithCollection(
          umi,
          owner.publicKey,
          undefined,
          royaltyBps
        );

        let initialAmount = new BN(LAMPORTS_PER_SOL);
        let amount = initialAmount.mul(new BN(2));
        let maxAmount = amount.mul(new BN(12)).div(new BN(10));

        const { listState } = await testListCore({
          amount: initialAmount,
          asset,
          collection,
          owner,
          lookupTableAccount,
          currency
        });

        //can't list again
        await expect(
          testListCore({
            amount: initialAmount,
            asset,
            collection,
            owner,
            lookupTableAccount,
            currency
          })
        ).to.be.rejectedWith(ALREADY_IN_USE_ERR);

        await testEdit({
          amount,
          owner,
          listState,
          currency
        });

        //try to buy at the wrong price
        await expect(
          testBuyCore({
            asset,
            collection,
            listingPrice: initialAmount,
            maxAmount: initialAmount,
            buyer,
            owner: owner.publicKey,
            lookupTableAccount,
            currency,
            royaltyBps
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));

        await testEdit({
          amount,
          owner,
          listState,
          currency
        });

        await testBuyCore({
          asset,
          collection,
          listingPrice: amount,
          maxAmount,
          buyer,
          owner: owner.publicKey,
          lookupTableAccount,
          currency,
          royaltyBps
        });
      });

      it("[core] lists + buys (separate payer)", async () => {
        const umi = await createUmi();
        const [owner, buyer] = await makeNTraders({ n: 2 });

        const royaltyBps = 500;
        const { asset, collection } = await createAssetWithCollection(
          umi,
          owner.publicKey,
          undefined,
          royaltyBps
        );
        const [rentPayer] = await makeNTraders({ n: 1 });

        let amount = new BN(LAMPORTS_PER_SOL);
        let maxAmount = amount.mul(new BN(12)).div(new BN(10));

        await testListCore({
          amount,
          asset,
          collection,
          owner,
          lookupTableAccount,
          currency
        });

        await testBuyCore({
          listingPrice: amount,
          maxAmount,
          asset,
          collection,
          buyer,
          owner: owner.publicKey,
          lookupTableAccount,
          payer: rentPayer,
          currency,
          royaltyBps
        });
      });

      it("[core] lists + delists (expired listing)", async () => {
        const umi = await createUmi();
        const [owner, buyer] = await makeNTraders({ n: 2 });

        const royaltyBps = 500;
        const { asset, collection } = await createAssetWithCollection(
          umi,
          owner.publicKey,
          undefined,
          royaltyBps
        );

        let amount = new BN(LAMPORTS_PER_SOL);
        let maxAmount = amount.mul(new BN(12)).div(new BN(10));

        await testListCore({
          amount,
          asset,
          collection,
          owner,
          expireInSec: new BN(3),
          currency
        });
        await expect(
          testDelistCore({
            asset,
            collection,
            owner,
            forceExpired: true
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("ListingNotYetExpired"));
        await waitMS(5000);
        await testDelistCore({
          asset,
          collection,
          owner,
          forceExpired: true
        });
      });

      it("[core] lists + edits + buys (expired listing)", async () => {
        const umi = await createUmi();
        const [owner, buyer] = await makeNTraders({ n: 2 });

        const royaltyBps = 500;
        const { asset, collection } = await createAssetWithCollection(
          umi,
          owner.publicKey,
          undefined,
          royaltyBps
        );

        let amount = new BN(LAMPORTS_PER_SOL);
        let maxAmount = amount.mul(new BN(12)).div(new BN(10));

        const { listState } = await testListCore({
          amount: new BN(LAMPORTS_PER_SOL),
          asset,
          collection,
          owner,
          expireInSec: new BN(1),
          currency
        });

        await waitMS(3000);
        //time expires, fails to buy
        await expect(
          testBuyCore({
            listingPrice: amount,
            maxAmount,
            asset,
            collection,
            buyer,
            owner: owner.publicKey,
            currency,
            royaltyBps
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("ListingExpired"));

        await testEdit({
          amount: new BN(LAMPORTS_PER_SOL),
          owner,
          expireInSec: new BN(100),
          listState,
          currency
        });

        await testBuyCore({
          listingPrice: amount,
          maxAmount,
          asset,
          collection,
          buyer,
          owner: owner.publicKey,
          currency,
          royaltyBps
        });
      });

      it("[core] lists + buys (private taker)", async () => {
        const umi = await createUmi();
        const [owner, buyer] = await makeNTraders({ n: 2 });

        const royaltyBps = 500;
        const { asset, collection } = await createAssetWithCollection(
          umi,
          owner.publicKey,
          undefined,
          royaltyBps
        );

        const [traderC] = await makeNTraders({ n: 1 });

        let listingPrice = new BN(LAMPORTS_PER_SOL);
        let maxPrice = listingPrice.mul(new BN(12)).div(new BN(10));

        await testListCore({
          amount: listingPrice,
          asset,
          collection,
          owner,
          privateTaker: buyer.publicKey,
          currency
        });

        //fails to buy with wrong taker
        await expect(
          testBuyCore({
            listingPrice,
            maxAmount: maxPrice,
            asset,
            collection,
            buyer: traderC,
            owner: owner.publicKey,
            currency,
            royaltyBps
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("TakerNotAllowed"));

        await testBuyCore({
          listingPrice,
          maxAmount: maxPrice,
          asset,
          collection,
          buyer,
          owner: owner.publicKey,
          currency,
          royaltyBps
        });
      });
    });
  }
});
