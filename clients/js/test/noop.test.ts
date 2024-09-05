import { getCreateAccountInstruction } from '@solana-program/system';
import {
  address,
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  generateKeyPairSigner,
  IInstruction,
  pipe,
} from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import { Field, getTcompNoopInstruction, MakeEventArgs, Target } from '../src';
import {
  ANCHOR_ERROR__ACCOUNT_DISCRIMINATOR_MISMATCH,
  ANCHOR_ERROR__CONSTRAINT_OWNER,
  expectCustomError,
} from './_common';

test('only Bid and List state accounts can call noop', async (t) => {
  const client = createDefaultSolanaClient();

  const programAddress = address('TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp');

  // General test payer.
  const payer = await generateKeyPairSignerWithSol(client);

  // dummy values
  const eventArgs: MakeEventArgs = {
    maker: (await generateKeyPairSigner()).address,
    bidId: (await generateKeyPairSigner()).address,
    field: Field.Name,
    target: Target.AssetId,
    targetId: (await generateKeyPairSigner()).address,
    fieldId: (await generateKeyPairSigner()).address,
    amount: 1000,
    quantity: 1,
    currency: (await generateKeyPairSigner()).address,
    expiry: 0,
    privateTaker: (await generateKeyPairSigner()).address,
    assetId: (await generateKeyPairSigner()).address,
  };

  // Random keypair should fail--not a program-owned account.
  const randomKeypair = await generateKeyPairSignerWithSol(client);

  let tcompNoopIx = getTcompNoopInstruction({
    tcompSigner: randomKeypair,
    event: { __kind: 'Maker', fields: [eventArgs] },
  });

  let promise = pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(tcompNoopIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Account owner constraint should fail.
  await expectCustomError(t, promise, ANCHOR_ERROR__CONSTRAINT_OWNER);

  // A program account that is not a Bid or List state account should fail.
  // We create an IDL buffer account which is a non-PDA program-owned account which we can sign for.
  const buffer = await generateKeyPairSigner();
  const bufferAuthority = await generateKeyPairSignerWithSol(client);

  // min size needed for buffer account w/ no idl
  const space = 44n;

  // Create the account.
  const createAccountIx = getCreateAccountInstruction({
    payer: bufferAuthority,
    newAccount: buffer,
    space,
    lamports: await client.rpc.getMinimumBalanceForRentExemption(space).send(),
    programAddress,
  });

  // Create the buffer program-owned account.
  const createBufferIx: IInstruction = {
    accounts: [
      {
        address: buffer.address,
        role: 1,
      },
      {
        address: bufferAuthority.address,
        role: 2,
      },
    ],
    data: Buffer.from([64, 244, 188, 120, 167, 233, 105, 10, 1]),
    programAddress,
  };

  await pipe(
    await createDefaultTransaction(client, bufferAuthority),
    (tx) =>
      appendTransactionMessageInstructions(
        [createAccountIx, createBufferIx],
        tx
      ),
    (tx) => signAndSendTransaction(client, tx)
  );

  // Buffer account should be owned by the program.
  const bufferAccount = (await client.rpc.getAccountInfo(buffer.address).send())
    .value;
  t.assert(bufferAccount?.owner === programAddress);

  // Create the noop instruction, using the buffer account as the signer.
  tcompNoopIx = getTcompNoopInstruction({
    tcompSigner: buffer,
    event: { __kind: 'Maker', fields: [eventArgs] },
  });

  promise = pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(tcompNoopIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  // It passes the signer and program account checks, but is the wrong discriminator.
  await expectCustomError(
    t,
    promise,
    ANCHOR_ERROR__ACCOUNT_DISCRIMINATOR_MISMATCH
  );
});
