import { BN } from "@coral-xyz/anchor";
import {
  AddressLookupTableAccount,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import chai, { expect } from "chai";
import chaiAsPromised from "chai-as-promised";
import { findTCompPda } from "../src";
import { transferLamports } from "./account";
import {
  beforeAllHook,
  buildAndSendTx,
  getLamports,
  swapSdk,
  tcompSdk,
  TEST_COSIGNER,
  TEST_KEYPAIR,
  TEST_PROVIDER,
  TSWAP_CONFIG,
} from "./shared";

// Enables rejectedWith.
chai.use(chaiAsPromised);

describe("tcomp admin", () => {
  let lookupTableAccount: AddressLookupTableAccount | undefined;
  before(async () => {
    lookupTableAccount = (await beforeAllHook()) ?? undefined;
  });

  it("withdraw fees", async () => {
    const tcomp = findTCompPda({})[0];
    const dest = Keypair.generate();
    {
      const {
        tx: { ixs },
      } = await swapSdk.initUpdateTSwap({
        owner: TEST_PROVIDER.publicKey,
        newOwner: TEST_PROVIDER.publicKey,
        config: TSWAP_CONFIG,
        cosigner: TEST_COSIGNER.publicKey,
      });

      await buildAndSendTx({
        ixs,
        extraSigners: [TEST_COSIGNER],
      });
    }

    {
      await transferLamports(tcomp, LAMPORTS_PER_SOL, TEST_KEYPAIR);
      const {
        tx: { ixs },
      } = await tcompSdk.withdrawFees({
        lamports: new BN(LAMPORTS_PER_SOL),
        destination: dest.publicKey,
        owner: TEST_PROVIDER.publicKey,
        cosigner: TEST_COSIGNER.publicKey,
      });
      await buildAndSendTx({
        ixs,
        extraSigners: [TEST_COSIGNER],
      });
    }

    expect(await getLamports(dest.publicKey)).eq(LAMPORTS_PER_SOL);
  });
});
