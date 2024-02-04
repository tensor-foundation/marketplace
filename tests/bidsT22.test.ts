import { BN } from "@coral-xyz/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";
import {
  nameToBuffer,
  test_utils,
  TokenStandard,
  waitMS,
} from "@tensor-hq/tensor-common";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Field, MakeEvent, TakeEvent, MAKER_BROKER_PCT, Target } from "../src";
import {
  createAssociatedTokenAccountT22,
  createMintAndTokenT22,
  initCollection,
  makeMintTwoAta,
  makeNTraders,
} from "./account";
import {
  ACC_NOT_INIT_ERR,
  beforeAllHook,
  beforeHook,
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
  wlSdk,
  withLamports,
  testTakeBidT22,
} from "./shared";
import {
  makeFvcWhitelist,
  makeVocWhitelist,
  testDepositIntoMargin,
  testMakeMargin,
  testWithdrawFromMargin,
} from "./tswap";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("[Token 2022] tcomp bids", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  let ruleSetAddr: PublicKey;
  before(async () => {
    const res = await beforeAllHook();
    lookupTableAccount = res.lookupTableAccount ?? undefined;
    ruleSetAddr = res.ruleSetAddr;
  });

  it("[T22] bids + edits + accepts bid for T22 NFT", async () => {
    for (const cosigned of [false, true]) {
      const [traderA, traderB] = await makeNTraders({
        n: 2,
      });

      const cosigner = cosigned ? Keypair.generate() : undefined;
      const { mint, token: ata } = await createMintAndTokenT22(
        traderA.publicKey
      );
      await createAssociatedTokenAccountT22(traderB.publicKey, mint);

      const { mint: badMint, token: badAta } = await createMintAndTokenT22(
        traderA.publicKey
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
          testTakeBidT22({
            ...common,
            minAmount: new BN(LAMPORTS_PER_SOL),
          })
        ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("BadCosigner"));
      }

      // Bid too low.
      await expect(
        testTakeBidT22({
          ...common,
          minAmount: new BN(LAMPORTS_PER_SOL),
          cosigner,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("PriceMismatch"));

      // Mismatch NFT.
      await expect(
        testTakeBidT22({
          ...common,
          nftMint: badMint,
          nftSellerAcc: badAta,
          minAmount: new BN(LAMPORTS_PER_SOL / 2),
          cosigner,
        })
      ).to.be.rejectedWith(tcompSdk.getErrorCodeHex("WrongTargetId"));

      // Final sale.
      await testTakeBidT22({
        ...common,
        minAmount: new BN(LAMPORTS_PER_SOL / 2),
        cosigner,
      });
    }
  });
});
