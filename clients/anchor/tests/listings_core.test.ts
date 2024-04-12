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
import { MakeEvent, TakeEvent, MAKER_BROKER_PCT, Target } from "../src";
import { makeNTraders } from "./account";
import { cpiEdit } from "./cpi_test";
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
  testBuyCore,
  testDelist,
  testDelistCore,
  testEdit,
  testList,
  testListCore,
  TEST_USDC,
} from "./shared";
import { createAssetWithCollection, createUmi } from "./metaplex_core";

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

        const royaltyBps = 10000;
        const { asset, collection } = await createAssetWithCollection(
          umi,
          owner.publicKey,
          undefined,
          royaltyBps
        );

        const { listState } = await testListCore({
          amount: new BN(LAMPORTS_PER_SOL),
          asset,
          collection,
          owner,
          lookupTableAccount,
          currency,
        });

        //can't list again
        await expect(
          testListCore({
            amount: new BN(LAMPORTS_PER_SOL),
            asset,
            collection,
            owner,
            lookupTableAccount,
            currency,
          })
        ).to.be.rejectedWith(ALREADY_IN_USE_ERR);

        await testEdit({
          amount: new BN(LAMPORTS_PER_SOL * 2),
          owner,
          listState,
          currency,
        });

        //try to buy at the wrong price
        await expect(
          testBuyCore({
            asset,
            collection,
            maxAmount: new BN(LAMPORTS_PER_SOL),
            buyer,
            owner: owner.publicKey,
            lookupTableAccount,
            currency,
            royaltyBps,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));

        await testEdit({
          amount: new BN(LAMPORTS_PER_SOL / 2),
          owner,
          listState,
          currency,
        });

        await testBuyCore({
          asset,
          collection,
          maxAmount: new BN(LAMPORTS_PER_SOL / 2),
          buyer,
          owner: owner.publicKey,
          lookupTableAccount,
          currency,
          royaltyBps,
        });
      });

      it("[core] lists + buys (separate payer)", async () => {
        const umi = await createUmi();
        const [owner, buyer] = await makeNTraders({ n: 2 });

        const royaltyBps = 10000;
        const { asset, collection } = await createAssetWithCollection(
          umi,
          owner.publicKey,
          undefined,
          royaltyBps
        );
        const [rentPayer] = await makeNTraders({ n: 1 });

        await testListCore({
          amount: new BN(LAMPORTS_PER_SOL),
          asset,
          collection,
          owner,
          lookupTableAccount,
          currency,
        });

        await testBuyCore({
          maxAmount: new BN(LAMPORTS_PER_SOL),
          asset,
          collection,
          buyer,
          owner: owner.publicKey,
          lookupTableAccount,
          payer: rentPayer,
          currency,
          royaltyBps,
        });
      });

      it("[core] lists + delists (expired listing)", async () => {
        const umi = await createUmi();
        const [owner, buyer] = await makeNTraders({ n: 2 });

        const royaltyBps = 10000;
        const { asset, collection } = await createAssetWithCollection(
          umi,
          owner.publicKey,
          undefined,
          royaltyBps
        );

        await testListCore({
          amount: new BN(LAMPORTS_PER_SOL),
          asset,
          collection,
          owner,
          expireInSec: new BN(3),
          currency,
        });
        await expect(
          testDelistCore({
            asset,
            collection,
            owner,
            forceExpired: true,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("ListingNotYetExpired"));
        await waitMS(5000);
        await testDelistCore({
          asset,
          collection,
          owner,
          forceExpired: true,
        });
      });

      it("[core] lists + edits + buys (expired listing)", async () => {
        const umi = await createUmi();
        const [owner, buyer] = await makeNTraders({ n: 2 });

        const royaltyBps = 10000;
        const { asset, collection } = await createAssetWithCollection(
          umi,
          owner.publicKey,
          undefined,
          royaltyBps
        );

        const { listState } = await testListCore({
          amount: new BN(LAMPORTS_PER_SOL),
          asset,
          collection,
          owner,
          expireInSec: new BN(1),
          currency,
        });

        await waitMS(3000);
        //time expires, fails to buy
        await expect(
          testBuyCore({
            maxAmount: new BN(LAMPORTS_PER_SOL),
            asset,
            collection,
            buyer,
            owner: owner.publicKey,
            currency,
            royaltyBps,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("ListingExpired"));

        await testEdit({
          amount: new BN(LAMPORTS_PER_SOL),
          owner,
          expireInSec: new BN(100),
          listState,
          currency,
        });

        await testBuyCore({
          maxAmount: new BN(LAMPORTS_PER_SOL),
          asset,
          collection,
          buyer,
          owner: owner.publicKey,
          currency,
          royaltyBps,
        });
      });

      it("[core] lists + buys (private taker)", async () => {
        const umi = await createUmi();
        const [owner, buyer] = await makeNTraders({ n: 2 });

        const royaltyBps = 10000;
        const { asset, collection } = await createAssetWithCollection(
          umi,
          owner.publicKey,
          undefined,
          royaltyBps
        );

        const [traderC] = await makeNTraders({ n: 1 });

        await testListCore({
          amount: new BN(LAMPORTS_PER_SOL),
          asset,
          collection,
          owner,
          privateTaker: buyer.publicKey,
          currency,
        });

        //fails to buy with wrong taker
        await expect(
          testBuyCore({
            maxAmount: new BN(LAMPORTS_PER_SOL),
            asset,
            collection,
            buyer: traderC,
            owner: owner.publicKey,
            currency,
            royaltyBps,
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("TakerNotAllowed"));

        await testBuyCore({
          maxAmount: new BN(LAMPORTS_PER_SOL),
          asset,
          collection,
          buyer,
          owner: owner.publicKey,
          currency,
          royaltyBps,
        });
      });
    });
  }
});
