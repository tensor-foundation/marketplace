import { Keypair, PublicKey } from "@solana/web3.js";
import { TensorWhitelistSDK } from "@tensor-hq/tensorswap-ts";
import { BN } from "bn.js";
import { expect } from "chai";
import {
  buildAndSendTx,
  getLamports,
  swapSdk,
  TEST_PROVIDER,
  wlSdk
} from "./shared";

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
    extraSigners: [owner],
  });
  const marginRent = await swapSdk.getMarginAccountRent();
  const lamports = await getLamports(marginPda);
  expect(lamports).to.eq(Math.round(marginRent + expectedLamports));
};

//keeping this outside the fn so that it's constant for all tests
const tlistOwner = Keypair.generate();

export const testInitWLAuthority = async () => {
  const {
    tx: { ixs },
    authPda,
  } = await wlSdk.initUpdateAuthority({
    cosigner: TEST_PROVIDER.publicKey,
    owner: tlistOwner.publicKey,
    newCosigner: TEST_PROVIDER.publicKey,
    newOwner: tlistOwner.publicKey,
  });

  const wlAuth = PublicKey.findProgramAddressSync([], new PublicKey("TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW"));

  await buildAndSendTx({ ixs, extraSigners: [tlistOwner] });

  let authAcc = await wlSdk.fetchAuthority(authPda);
  expect(authAcc.cosigner.toBase58()).to.eq(TEST_PROVIDER.publicKey.toBase58());

  return { authPda, tlistOwner };
};

export const makeVocWhitelist = async (voc: PublicKey) => {
  const uuid = wlSdk.genWhitelistUUID();
  const name = "hello_world";
  const {
    tx: { ixs },
    whitelistPda,
  } = await wlSdk.initUpdateWhitelist({
    cosigner: TEST_PROVIDER.publicKey,
    uuid: TensorWhitelistSDK.uuidToBuffer(uuid),
    name: TensorWhitelistSDK.nameToBuffer(name),
    voc,
  });
  await buildAndSendTx({ ixs });

  return { voc, whitelist: whitelistPda };
};

export const makeFvcWhitelist = async (fvc: PublicKey) => {
  const uuid = wlSdk.genWhitelistUUID();
  const name = "hello_world";
  const {
    tx: { ixs },
    whitelistPda,
  } = await wlSdk.initUpdateWhitelist({
    cosigner: TEST_PROVIDER.publicKey,
    uuid: TensorWhitelistSDK.uuidToBuffer(uuid),
    name: TensorWhitelistSDK.nameToBuffer(name),
    fvc,
  });
  await buildAndSendTx({ ixs });

  return { fvc, whitelist: whitelistPda };
};
