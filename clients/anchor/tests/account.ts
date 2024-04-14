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
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  getMintLen,
  createInitializeMetadataPointerInstruction,
  createInitializeMint2Instruction,
  getAccountLen,
  createInitializeImmutableOwnerInstruction,
  createInitializeAccount3Instruction,
  mintToChecked,
  setAuthority,
  AuthorityType,
  createAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  getNftTokenAcc,
  test_utils,
  TMETA_PROGRAM_ID,
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
  getAccountWithProgramId(acct, TOKEN_PROGRAM_ID);

export const getAccountWithProgramId = (
  acct: PublicKey,
  programId: PublicKey
) => _getAccount(TEST_PROVIDER.connection, acct, "confirmed", programId);

export const getMint = (acct: PublicKey) =>
  getMintWithProgramId(acct, TOKEN_PROGRAM_ID);

export const getMintWithProgramId = (acct: PublicKey, programId: PublicKey) =>
  _getMint(TEST_PROVIDER.connection, acct, "confirmed", programId);

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
      TMETA_PROGRAM_ID.toBuffer(),
      collectionMint.toBuffer(),
    ],
    TMETA_PROGRAM_ID
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
        TMETA_PROGRAM_ID.toBuffer(),
        collectionMint.toBuffer(),
        Buffer.from("edition", "utf8"),
      ],
      TMETA_PROGRAM_ID
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

export const createMintAndTokenT22 = async (
  holder: PublicKey
): Promise<{
  mint: PublicKey;
  token: PublicKey;
}> => {
  // creates a Token 2022 mint + metadata pointer

  const extensions = [ExtensionType.MetadataPointer];
  const mintLen = getMintLen(extensions);

  let lamports = await TEST_CONN_PAYER.conn.getMinimumBalanceForRentExemption(
    mintLen
  );
  const mint = Keypair.generate();

  const createMint = new Transaction()
    .add(
      SystemProgram.createAccount({
        fromPubkey: TEST_CONN_PAYER.payer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      })
    )
    .add(
      createInitializeMetadataPointerInstruction(
        mint.publicKey,
        TEST_CONN_PAYER.payer.publicKey,
        mint.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    )
    .add(
      createInitializeMint2Instruction(
        mint.publicKey,
        0,
        TEST_CONN_PAYER.payer.publicKey,
        null,
        TOKEN_2022_PROGRAM_ID
      )
    );

  await sendAndConfirmTransaction(
    TEST_CONN_PAYER.conn,
    createMint,
    [TEST_CONN_PAYER.payer, mint],
    undefined
  );

  // create token

  const accountLen = getAccountLen([ExtensionType.ImmutableOwner]);
  lamports = await TEST_CONN_PAYER.conn.getMinimumBalanceForRentExemption(
    accountLen
  );

  const token = Keypair.generate();

  const createToken = new Transaction()
    .add(
      SystemProgram.createAccount({
        fromPubkey: TEST_CONN_PAYER.payer.publicKey,
        newAccountPubkey: token.publicKey,
        space: accountLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      })
    )
    .add(
      createInitializeImmutableOwnerInstruction(
        token.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    )
    .add(
      createInitializeAccount3Instruction(
        token.publicKey,
        mint.publicKey,
        holder,
        TOKEN_2022_PROGRAM_ID
      )
    );

  await sendAndConfirmTransaction(
    TEST_CONN_PAYER.conn,
    createToken,
    [TEST_CONN_PAYER.payer, token],
    undefined
  );

  // mint token

  await mintToChecked(
    TEST_CONN_PAYER.conn,
    TEST_CONN_PAYER.payer,
    mint.publicKey,
    token.publicKey,
    TEST_CONN_PAYER.payer,
    1,
    0,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  // removes the authority from the mint

  await setAuthority(
    TEST_CONN_PAYER.conn,
    TEST_CONN_PAYER.payer,
    mint.publicKey,
    TEST_CONN_PAYER.payer,
    AuthorityType.MintTokens,
    null,
    undefined,
    undefined,
    TOKEN_2022_PROGRAM_ID
  );

  return { mint: mint.publicKey, token: token.publicKey };
};

export const createAssociatedTokenAccountT22 = async (
  holder: PublicKey,
  mint: PublicKey
): Promise<{
  token: PublicKey;
}> => {
  return {
    token: await createAssociatedTokenAccount(
      TEST_CONN_PAYER.conn,
      TEST_CONN_PAYER.payer,
      mint,
      holder,
      undefined,
      TOKEN_2022_PROGRAM_ID
    ),
  };
};
