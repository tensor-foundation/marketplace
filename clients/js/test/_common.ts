import { getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';
import { findAssociatedTokenPda } from '@solana-program/token';
import {
  Address,
  address,
  airdropFactory,
  appendTransactionMessageInstruction,
  Base64EncodedDataResponse,
  generateKeyPairSigner,
  isSolanaError,
  KeyPairSigner,
  lamports,
  pipe,
  Signature,
  SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
  TransactionSigner,
} from '@solana/web3.js';
import {
  Client,
  createDefaultSolanaClient,
  createDefaultTransaction,
  generateKeyPairSignerWithSol,
  ONE_SOL,
  signAndSendTransaction,
  TOKEN_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import {
  Condition,
  findMintProofV2Pda,
  findWhitelistV2Pda,
  getCreateWhitelistV2Instruction,
  getInitUpdateMintProofV2InstructionAsync,
  Mode,
} from '@tensor-foundation/whitelist';
import { ExecutionContext } from 'ava';
import bs58 from 'bs58';
import { v4 } from 'uuid';
import { findFeeVaultPda } from '../src';

export const COMPUTE_300K_IX = (() => {
  return getSetComputeUnitLimitInstruction({
    units: 300_000,
  });
})();

export const COMPUTE_500K_IX = (() => {
  return getSetComputeUnitLimitInstruction({
    units: 500_000,
  });
})();

export const TCOMP_FEE = address('q4s8z5dRAt2fKC2tLthBPatakZRXPMx1LfacckSXd4f');

export const ANCHOR_ERROR__CONSTRAINT_OWNER = 2004;
export const ANCHOR_ERROR__CONSTRAINT_SEEDS = 2006;
export const ANCHOR_ERROR__ACCOUNT_DISCRIMINATOR_NOT_FOUND = 3001;
export const ANCHOR_ERROR__ACCOUNT_DISCRIMINATOR_MISMATCH = 3002;

export const DEFAULT_PUBKEY: Address = address(
  '11111111111111111111111111111111'
);
export const LAMPORTS_PER_SOL = 1_000_000_000n;
export const DEFAULT_DELTA = 100_000n;
export const ONE_WEEK = 60 * 60 * 24 * 7;
export const ONE_YEAR = 31557600;

export const ZERO_ACCOUNT_RENT_LAMPORTS = 890880n;
export const ATA_RENT_LAMPORTS = 2108880n;
export const APPROVE_ACCOUNT_RENT_LAMPORTS = 1002240n;

export const POOL_SIZE = 452n;

export const DEFAULT_LISTING_PRICE = 100_000_000n;
export const DEFAULT_BID_PRICE = 100_000_000n;
export const DEFAULT_SFBP = 500n;

export const TAKER_FEE_BPS = 200n;
export const BROKER_FEE_PCT = 50n;
export const BROKER_FEE_BPS = 5000n;
export const HUNDRED_PCT = 100n;
export const MAKER_BROKER_FEE_PCT = 80n;
export const BASIS_POINTS = 10_000n;
export const TLOCK_PREMIUM_FEE_BPS = 2500n;

export const generateUuid = () => uuidToUint8Array(v4());

export const uuidToUint8Array = (uuid: string) => {
  const encoder = new TextEncoder();
  // replace any '-' to handle uuids
  return encoder.encode(uuid.replaceAll('-', ''));
};

export interface TestSigners {
  nftOwner: KeyPairSigner;
  nftUpdateAuthority: KeyPairSigner;
  payer: KeyPairSigner;
  buyer: KeyPairSigner;
  cosigner: KeyPairSigner;
  makerBroker: KeyPairSigner;
  takerBroker: KeyPairSigner;
}

export enum TestAction {
  List,
  Bid,
}

export interface SetupTestParams {
  t: ExecutionContext;
  action: TestAction;
  listingPrice?: bigint;
  bidPrice?: number;
  bidQuantity?: number;
  useSharedEscrow?: boolean;
  useCosigner?: boolean;
  useMakerBroker?: boolean;
  useSplToken?: boolean;
}

export async function getTestSigners(client: Client) {
  // Generic payer.
  const payer = await generateKeyPairSignerWithSol(client, 5n * ONE_SOL);

  // Cosigner.
  const cosigner = await generateKeyPairSigner();

  // NFT Update Authority
  const nftUpdateAuthority = await generateKeyPairSignerWithSol(client);

  // NFT owner and seller.
  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Buyer of the NFT.
  const buyer = await generateKeyPairSignerWithSol(client);

  const makerBroker = await generateKeyPairSignerWithSol(client);
  const takerBroker = await generateKeyPairSignerWithSol(client);

  return {
    client,
    nftOwner,
    nftUpdateAuthority,
    payer,
    buyer,
    cosigner,
    makerBroker,
    takerBroker,
  };
}

export const expectCustomError = async (
  t: ExecutionContext,
  promise: Promise<unknown>,
  code: number
) => {
  const error = await t.throwsAsync<Error & { data: { logs: string[] } }>(
    promise
  );

  if (isSolanaError(error.cause, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM)) {
    t.assert(
      error.cause.context.code === code,
      `expected error code ${code}, received ${error.cause.context.code}`
    );
  } else {
    t.fail("expected a custom error, but didn't get one");
  }
};

export async function getTestSetup() {
  const client = createDefaultSolanaClient();

  // Generic payer.
  const payer = await generateKeyPairSignerWithSol(client, 5n * ONE_SOL);

  // Cosigner.
  const cosigner = await generateKeyPairSigner();

  // NFT Update Authority
  const nftUpdateAuthority = await generateKeyPairSignerWithSol(client);

  // NFT owner and seller.
  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Buyer of the NFT.
  const buyer = await generateKeyPairSignerWithSol(client);

  const makerBroker = await generateKeyPairSignerWithSol(client);
  const takerBroker = await generateKeyPairSignerWithSol(client);

  return {
    client,
    nftOwner,
    nftUpdateAuthority,
    payer,
    buyer,
    cosigner,
    makerBroker,
    takerBroker,
  };
}

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

// Derives fee vault from mint and airdrops keep-alive rent to it.
export const getAndFundFeeVault = async (client: Client, state: Address) => {
  const [feeVault] = await findFeeVaultPda({ address: state });

  // Fund fee vault with min rent lamports.
  await airdropFactory(client)({
    recipientAddress: feeVault,
    lamports: lamports(890880n),
    commitment: 'confirmed',
  });

  return feeVault;
};

export interface TokenNftOwnedByParams {
  t: ExecutionContext;
  client: Client;
  mint: Address;
  owner: Address;
  tokenProgram?: Address;
}

const TOKEN_OWNER_START_INDEX = 32;
const TOKEN_OWNER_END_INDEX = 64;
const TOKEN_AMOUNT_START_INDEX = 64;

export function getTokenAmount(data: Base64EncodedDataResponse): BigInt {
  const buffer = Buffer.from(String(data), 'base64');
  return buffer.readBigUInt64LE(TOKEN_AMOUNT_START_INDEX);
}

export function getTokenOwner(data: Base64EncodedDataResponse): Address {
  const buffer = Buffer.from(String(data), 'base64');
  const base58string = bs58.encode(
    buffer.slice(TOKEN_OWNER_START_INDEX, TOKEN_OWNER_END_INDEX)
  );
  return address(base58string);
}

// Asserts that a token-based NFT is owned by a specific address by deriving
// the ATA for the owner and checking the amount and owner of the token.
export async function assertTokenNftOwnedBy(params: TokenNftOwnedByParams) {
  const { t, client, mint, owner, tokenProgram = TOKEN_PROGRAM_ID } = params;

  const [ownerAta] = await findAssociatedTokenPda({
    mint,
    owner,
    tokenProgram,
  });
  const ownerAtaAccount = (
    await client.rpc.getAccountInfo(ownerAta, { encoding: 'base64' }).send()
  ).value;

  const data = ownerAtaAccount!.data;

  const amount = getTokenAmount(data);
  const tokenOwner = getTokenOwner(data);

  t.assert(amount === 1n);
  t.assert(tokenOwner === owner);
}

export const assertTcompNoop = async (
  t: ExecutionContext,
  client: Client,
  sig: Signature
) => {
  const tx = await client.rpc
    .getTransaction(sig, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    })
    .send();

  t.assert(
    tx?.meta?.logMessages?.some((msg) => msg.includes('Instruction: TcompNoop'))
  );
};

export interface SetupSplTokenTestParams {
  t: ExecutionContext;
  client: Client;
  mintAuthority?: TransactionSigner;
  payer?: TransactionSigner;
  recipient?: Address;
  decimals?: number;
  initialSupply?: number;
}

export interface InitUpdateMintProofV2Params {
  client: Client;
  payer: KeyPairSigner;
  mint: Address;
  whitelist: Address;
  proof: Uint8Array[];
}

export interface InitUpdateMintProofV2Returns {
  mintProof: Address;
}

export async function upsertMintProof({
  client,
  payer,
  mint,
  whitelist,
  proof,
}: InitUpdateMintProofV2Params): Promise<InitUpdateMintProofV2Returns> {
  const [mintProof] = await findMintProofV2Pda({ mint, whitelist });

  const createMintProofIx = await getInitUpdateMintProofV2InstructionAsync({
    payer,
    mint,
    mintProof,
    whitelist,
    proof,
  });

  await pipe(
    await createDefaultTransaction(client, payer),
    (tx) => appendTransactionMessageInstruction(createMintProofIx, tx),
    (tx) => signAndSendTransaction(client, tx)
  );

  return { mintProof };
}
