import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
  createSetCollectionSizeInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createAccount,
  createAssociatedTokenAccountIdempotent,
  createMint,
  getAccount as _getAccount,
  getMint as _getMint,
  mintTo,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  getNftTokenAcc,
  test_utils,
  TMETA_PROG_ID,
} from "@tensor-hq/tensor-common";
import { findAta } from "../src";
import {
  buildAndSendTx,
  TEST_CONN_PAYER,
  TEST_KEYPAIR,
  TEST_PROVIDER,
  TEST_USDC,
  TEST_USDC_AUTHORITY,
} from "./shared";

export const transferLamports = async (
  to: PublicKey,
  amount: number,
  from?: Keypair
) => {
  from = from ?? TEST_KEYPAIR;
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to,
      lamports: amount,
    })
  );
  await buildAndSendTx({
    ixs: tx.instructions,
    extraSigners: [from],
  });
};

export const createFundedWallet = (sol?: number) =>
  test_utils.createFundedWallet({
    ...TEST_CONN_PAYER,
    sol,
  });

export const createAta = ({
  mint,
  owner,
}: {
  mint: PublicKey;
  owner: Keypair;
}) =>
  test_utils.createAta({
    ...TEST_CONN_PAYER,
    mint,
    owner,
  });

export const createAndFundAta = (
  owner?: Keypair,
  mint?: Keypair,
  royaltyBps?: number,
  creators?: test_utils.CreatorInput[],
  collection?: Keypair,
  collectionVerified?: boolean,
  programmable?: boolean,
  ruleSetAddr?: PublicKey
) =>
  test_utils.createAndFundAta({
    ...TEST_CONN_PAYER,
    owner,
    mint,
    royaltyBps,
    creators,
    collection,
    collectionVerified,
    programmable,
    ruleSetAddr,
  });

export const getAccount = (acct: PublicKey) =>
  _getAccount(TEST_PROVIDER.connection, acct, "confirmed");
export const getMint = (acct: PublicKey) =>
  _getMint(TEST_PROVIDER.connection, acct, "confirmed");

export const getTokenBalance = async (acct: PublicKey) => {
  try {
    return Number((await getAccount(acct)).amount);
  } catch (err) {
    if (err instanceof TokenAccountNotFoundError) {
      return undefined;
    }
    throw err;
  }
};

export const getBalance = (acct: PublicKey) =>
  TEST_PROVIDER.connection.getBalance(acct, "confirmed");

// Creates a mint + 2 ATAs. The `owner` will have the mint initially.
export const makeMintTwoAta = async ({
  owner,
  other,
  royaltyBps,
  creators,
  collection,
  collectionVerified,
  programmable,
  ruleSetAddr,
}: {
  owner: Keypair;
  other: Keypair;
  royaltyBps?: number;
  creators?: test_utils.CreatorInput[];
  collection?: Keypair;
  collectionVerified?: boolean;
  programmable?: boolean;
  ruleSetAddr?: PublicKey;
}) => {
  return await test_utils.makeMintTwoAta({
    ...TEST_CONN_PAYER,
    owner,
    other,
    royaltyBps,
    creators,
    collection,
    collectionVerified,
    programmable,
    ruleSetAddr,
  });
};

export const makeNTraders = async ({ n, sol }: { n: number; sol?: number }) => {
  return await Promise.all([
    ...(
      await test_utils.makeNTraders({
        ...TEST_CONN_PAYER,
        n,
        sol,
      })
    ).map(async (trader) => {
      await createAssociatedTokenAccountIdempotent(
        TEST_CONN_PAYER.conn,
        TEST_CONN_PAYER.payer,
        TEST_USDC,
        trader.publicKey
      );
      await mintTo(
        TEST_CONN_PAYER.conn,
        TEST_CONN_PAYER.payer,
        TEST_USDC,
        findAta(TEST_USDC, trader.publicKey),
        TEST_USDC_AUTHORITY,
        LAMPORTS_PER_SOL * 1_000_000
      );
      return trader;
    }),
  ]);
};

export const initCollection = async ({
  conn = TEST_PROVIDER.connection,
  owner,
}: {
  conn?: Connection;
  owner: Keypair;
}) => {
  const collectionMint = await createMint(
    conn,
    owner,
    owner.publicKey,
    owner.publicKey,
    0
  );
  const collectionTokenAccount = await createAccount(
    conn,
    owner,
    collectionMint,
    owner.publicKey
  );
  await mintTo(conn, owner, collectionMint, collectionTokenAccount, owner, 1);
  const [collectionMetadataAccount, _b] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata", "utf8"),
      TMETA_PROG_ID.toBuffer(),
      collectionMint.toBuffer(),
    ],
    TMETA_PROG_ID
  );
  const collectionMeatadataIX = createCreateMetadataAccountV3Instruction(
    {
      metadata: collectionMetadataAccount,
      mint: collectionMint,
      mintAuthority: owner.publicKey,
      payer: owner.publicKey,
      updateAuthority: owner.publicKey,
    },
    {
      createMetadataAccountArgsV3: {
        data: {
          name: "Nick's collection",
          symbol: "NICK",
          uri: "nicksfancyuri",
          sellerFeeBasisPoints: 100,
          creators: null,
          collection: null,
          uses: null,
        },
        isMutable: false,
        collectionDetails: null,
      },
    }
  );
  const [collectionMasterEditionAccount, _b2] =
    PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata", "utf8"),
        TMETA_PROG_ID.toBuffer(),
        collectionMint.toBuffer(),
        Buffer.from("edition", "utf8"),
      ],
      TMETA_PROG_ID
    );
  const collectionMasterEditionIX = createCreateMasterEditionV3Instruction(
    {
      edition: collectionMasterEditionAccount,
      mint: collectionMint,
      mintAuthority: owner.publicKey,
      payer: owner.publicKey,
      updateAuthority: owner.publicKey,
      metadata: collectionMetadataAccount,
    },
    {
      createMasterEditionArgs: {
        maxSupply: 0,
      },
    }
  );

  const sizeCollectionIX = createSetCollectionSizeInstruction(
    {
      collectionMetadata: collectionMetadataAccount,
      collectionAuthority: owner.publicKey,
      collectionMint: collectionMint,
    },
    {
      setCollectionSizeArgs: { size: 50 },
    }
  );

  await buildAndSendTx({
    ixs: [collectionMeatadataIX, collectionMasterEditionIX, sizeCollectionIX],
    extraSigners: [owner],
  });

  return {
    collectionMint,
    collectionMetadataAccount,
    collectionMasterEditionAccount,
  };
};
