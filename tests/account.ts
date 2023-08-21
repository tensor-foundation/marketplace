import {
  createCreateMasterEditionV3Instruction,
  createCreateMetadataAccountV3Instruction,
  createSetCollectionSizeInstruction,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createAccount,
  createMint,
  getAccount as _getAccount,
  mintTo,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  test_utils,
  TOKEN_METADATA_PROGRAM_ID,
} from "@tensor-hq/tensor-common";
import {
  buildAndSendTx,
  TEST_CONN_PAYER,
  TEST_KEYPAIR,
  TEST_PROVIDER,
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
  return test_utils.makeNTraders({
    ...TEST_CONN_PAYER,
    n,
    sol,
  });
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
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      collectionMint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
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
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.toBuffer(),
        Buffer.from("edition", "utf8"),
      ],
      TOKEN_METADATA_PROGRAM_ID
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
