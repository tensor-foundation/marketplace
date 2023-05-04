import { Keypair, PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import { TensorWhitelistSDK } from "@tensor-hq/tensorswap-ts";
import { buildAndSendTx, swapSdk, TEST_PROVIDER } from "./shared";
import { getLamports } from "./shared";
import { BN } from "bn.js";

export const testMakeMargin = async ({ owner }: { owner: Keypair }) => {
  const name = "hello_world";
  const nameBuffer = TensorWhitelistSDK.nameToBuffer(name);
  const {
    tx: { ixs },
    marginPda,
    marginBump,
    marginNr,
  } = await swapSdk.initMarginAcc({
    owner: owner.publicKey,
    name: nameBuffer,
  });
  await buildAndSendTx({
    ixs,
    provider: TEST_PROVIDER,
    extraSigners: [owner],
  });
  //state
  const marginAcc = await swapSdk.fetchMarginAccount(marginPda);
  expect(marginAcc.owner.toBase58()).to.eq(owner.publicKey.toBase58());
  expect(marginAcc.name).to.deep.eq(nameBuffer);
  expect(marginAcc.nr).to.eq(marginNr);
  expect(marginAcc.bump).to.deep.eq([marginBump]);
  //rent
  const lamports = await getLamports(marginPda);
  const rent = await swapSdk.getMarginAccountRent();
  expect(lamports).to.eq(rent);

  return { marginPda, marginBump, marginNr, marginRent: rent, marginAcc, ixs };
};

export const testDepositIntoMargin = async ({
  owner,
  marginNr,
  marginPda,
  amount,
  expectedLamports = amount,
}: {
  owner: Keypair;
  marginNr: number;
  marginPda: PublicKey;
  amount: number;
  expectedLamports?: number;
}) => {
  const {
    tx: { ixs },
  } = await swapSdk.depositMarginAcc({
    owner: owner.publicKey,
    marginNr: marginNr,
    amount: new BN(Math.round(amount)),
  });
  await buildAndSendTx({
    ixs,
    provider: TEST_PROVIDER,
    extraSigners: [owner],
  });
  const marginRent = await swapSdk.getMarginAccountRent();
  const lamports = await getLamports(marginPda);
  expect(lamports).to.eq(Math.round(marginRent + expectedLamports));
};

export const testWithdrawFromMargin = async ({
  owner,
  marginNr,
  marginPda,
  amount,
  expectedLamports = 0,
}: {
  owner: Keypair;
  marginNr: number;
  marginPda: PublicKey;
  amount: number;
  expectedLamports?: number;
}) => {
  const {
    tx: { ixs },
  } = await swapSdk.withdrawMarginAcc({
    owner: owner.publicKey,
    marginNr: marginNr,
    amount: new BN(Math.round(amount)),
  });
  await buildAndSendTx({
    ixs,
    provider: TEST_PROVIDER,
    extraSigners: [owner],
  });
  const marginRent = await swapSdk.getMarginAccountRent();
  const lamports = await getLamports(marginPda);
  expect(lamports).to.eq(Math.round(marginRent + expectedLamports));
};
