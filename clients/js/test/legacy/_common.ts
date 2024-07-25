import {
  Address,
  generateKeyPairSigner,
  address,
  airdropFactory,
  appendTransactionMessageInstruction,
  lamports,
  pipe,
  KeyPairSigner,
} from '@solana/web3.js';
import {
  Client,
  createDefaultTransaction,
  createKeyPairSigner,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import {
  Condition,
  Mode,
  findWhitelistV2Pda,
  getCreateWhitelistV2Instruction,
} from '@tensor-foundation/whitelist';
import { v4 } from 'uuid';

const OWNER_BYTES = [
  75, 111, 93, 80, 59, 171, 168, 79, 238, 255, 9, 233, 236, 194, 196, 73, 76, 2,
  51, 180, 184, 6, 77, 52, 36, 243, 28, 125, 104, 104, 114, 246, 166, 110, 5,
  17, 12, 8, 199, 21, 64, 143, 53, 202, 39, 71, 93, 114, 119, 171, 152, 44, 155,
  146, 43, 217, 148, 215, 83, 14, 162, 91, 65, 177,
];

export const getOwner = async () =>
  await createKeyPairSigner(Uint8Array.from(OWNER_BYTES));

export const getAndFundOwner = async (client: Client) => {
  const owner = await createKeyPairSigner(Uint8Array.from(OWNER_BYTES));
  await airdropFactory(client)({
    recipientAddress: owner.address,
    lamports: lamports(ONE_SOL),
    commitment: 'confirmed',
  });

  return owner;
};

export const DEFAULT_PUBKEY: Address = address(
  '11111111111111111111111111111111'
);
export const LAMPORTS_PER_SOL = 1_000_000_000n;
export const DEFAULT_DELTA = 100_000n;
export const ONE_WEEK = 60 * 60 * 24 * 7;
export const ONE_YEAR = 31557600;

export const ZERO_ACCOUNT_RENT_LAMPORTS = 890880n;
export const ONE_SOL = 1_000_000_000n;

export const POOL_SIZE = 452n;

export const TAKER_FEE_BPS = 150n;
export const BROKER_FEE_PCT = 50n;
export const BASIS_POINTS = 10_000n;
export const TLOCK_PREMIUM_FEE_BPS = 2500n;

export interface CreateWhitelistParams {
  client: Client;
  payer?: KeyPairSigner;
  updateAuthority: KeyPairSigner;
  namespace?: KeyPairSigner;
  freezeAuthority?: Address;
  conditions?: Condition[];
}

export interface CreateWhitelistReturns {
  whitelist: Address;
  uuid: Uint8Array;
  conditions: Condition[];
}
export const generateUuid = () => uuidToUint8Array(v4());

export const uuidToUint8Array = (uuid: string) => {
  const encoder = new TextEncoder();
  // replace any '-' to handle uuids
  return encoder.encode(uuid.replaceAll('-', ''));
};

export async function createWhitelistV2({
  client,
  updateAuthority,
  payer = updateAuthority,
  namespace,
  freezeAuthority = DEFAULT_PUBKEY,
  conditions = [{ mode: Mode.FVC, value: updateAuthority.address }],
}: CreateWhitelistParams): Promise<CreateWhitelistReturns> {
  const uuid = generateUuid();
  namespace = namespace || (await generateKeyPairSigner());

  const [whitelist] = await findWhitelistV2Pda({
    namespace: namespace.address,
    uuid,
  });

  const createWhitelistIx = getCreateWhitelistV2Instruction({
    payer,
    updateAuthority,
    namespace,
    whitelist,
    freezeAuthority,
    conditions,
    uuid,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(createWhitelistIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  return { whitelist, uuid, conditions };
}
