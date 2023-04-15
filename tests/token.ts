import {
  keypairIdentity,
  Metaplex,
  toBigNumber,
} from "@metaplex-foundation/js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount as _getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Signer,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import { buildAndSendTx, TEST_KEYPAIR, TEST_PROVIDER } from "./shared";
import {
  Payload,
  PROGRAM_ID as AUTH_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-auth-rules";
import {
  createCreateInstruction,
  CreateInstructionAccounts,
  CreateInstructionArgs,
  createMintInstruction,
  MintInstructionAccounts,
  MintInstructionArgs,
  PROGRAM_ID,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import { AnchorProvider } from "@project-serum/anchor";
import { findTokenRecordPda } from "@tensor-hq/tensor-common";

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
    provider: TEST_PROVIDER,
    ixs: tx.instructions,
    extraSigners: [from],
  });
};

const _createFundedWallet = async (
  provider: AnchorProvider,
  sol: number = 1000
): Promise<Keypair> => {
  const keypair = Keypair.generate();
  //airdrops are funky, best to move from provider wallet
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: provider.publicKey,
      toPubkey: keypair.publicKey,
      lamports: sol * LAMPORTS_PER_SOL,
    })
  );
  await buildAndSendTx({ provider, ixs: tx.instructions });
  return keypair;
};

const _createATA = async (
  provider: AnchorProvider,
  mint: PublicKey,
  owner: Keypair
) => {
  const ata = await getAssociatedTokenAddress(mint, owner.publicKey);
  const createAtaIx = createAssociatedTokenAccountInstruction(
    owner.publicKey,
    ata,
    owner.publicKey,
    mint,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  await buildAndSendTx({ provider, ixs: [createAtaIx], extraSigners: [owner] });
  return { mint, owner, ata };
};

export type CreatorInput = {
  address: PublicKey;
  share: number;
  authority?: Signer;
};

export const createAndMintPNft = async ({
  owner,
  mint,
  royaltyBps,
  creators,
  collection,
  collectionVerified = true,
  ruleSet = null,
  provider = TEST_PROVIDER,
}: {
  owner: Keypair;
  mint: Keypair;
  royaltyBps?: number;
  creators?: CreatorInput[];
  collection?: Keypair;
  collectionVerified?: boolean;
  ruleSet?: PublicKey | null;
  provider?: AnchorProvider;
}) => {
  // --------------------------------------- create

  // metadata account
  const [metadata] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), PROGRAM_ID.toBuffer(), mint.publicKey.toBuffer()],
    PROGRAM_ID
  );

  // master edition account
  const [masterEdition] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      PROGRAM_ID.toBuffer(),
      mint.publicKey.toBuffer(),
      Buffer.from("edition"),
    ],
    PROGRAM_ID
  );

  const accounts: CreateInstructionAccounts = {
    metadata,
    masterEdition,
    mint: mint.publicKey,
    authority: owner.publicKey,
    payer: owner.publicKey,
    splTokenProgram: TOKEN_PROGRAM_ID,
    sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    updateAuthority: owner.publicKey,
  };

  const args: CreateInstructionArgs = {
    createArgs: {
      __kind: "V1",
      assetData: {
        name: "Whatever",
        symbol: "TSR",
        uri: "https://www.tensor.trade",
        sellerFeeBasisPoints: royaltyBps ?? 0,
        creators:
          creators?.map((c) => {
            return {
              address: c.address,
              share: c.share,
              verified: !!c.authority,
            };
          }) ?? null,
        primarySaleHappened: true,
        isMutable: true,
        tokenStandard: TokenStandard.ProgrammableNonFungible,
        collection: collection
          ? { verified: collectionVerified, key: collection.publicKey }
          : null,
        uses: null,
        collectionDetails: null,
        ruleSet,
      },
      decimals: 0,
      printSupply: { __kind: "Zero" },
    },
  };

  const createIx = createCreateInstruction(accounts, args);

  // this test always initializes the mint, we we need to set the
  // account to be writable and a signer
  for (let i = 0; i < createIx.keys.length; i++) {
    if (createIx.keys[i].pubkey.toBase58() === mint.publicKey.toBase58()) {
      createIx.keys[i].isSigner = true;
      createIx.keys[i].isWritable = true;
    }
  }

  // --------------------------------------- mint

  // mint instrution will initialize a ATA account
  const [tokenPda] = PublicKey.findProgramAddressSync(
    [
      owner.publicKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mint.publicKey.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const [tokenRecord] = findTokenRecordPda(mint.publicKey, tokenPda);

  const mintAcccounts: MintInstructionAccounts = {
    token: tokenPda,
    tokenOwner: owner.publicKey,
    metadata,
    masterEdition,
    tokenRecord,
    mint: mint.publicKey,
    payer: owner.publicKey,
    authority: owner.publicKey,
    sysvarInstructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    splAtaProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    splTokenProgram: TOKEN_PROGRAM_ID,
    authorizationRules: ruleSet ?? undefined,
    authorizationRulesProgram: AUTH_PROGRAM_ID,
  };

  const payload: Payload = {
    map: new Map(),
  };

  const mintArgs: MintInstructionArgs = {
    mintArgs: {
      __kind: "V1",
      amount: 1,
      authorizationData: {
        payload: payload as any,
      },
    },
  };

  const mintIx = createMintInstruction(mintAcccounts, mintArgs);

  // --------------------------------------- send

  await buildAndSendTx({
    provider,
    ixs: [createIx, mintIx],
    extraSigners: [owner, mint],
  });

  return {
    tokenAddress: tokenPda,
    metadataAddress: metadata,
    masterEditionAddress: masterEdition,
  };
};

const _createAndFundATA = async ({
  provider,
  owner,
  mint,
  royaltyBps,
  creators,
  collection,
  collectionVerified,
  programmable = false,
  ruleSetAddr,
}: {
  provider: AnchorProvider;
  owner?: Keypair;
  mint?: Keypair;
  royaltyBps?: number;
  creators?: CreatorInput[];
  collection?: Keypair;
  collectionVerified?: boolean;
  programmable?: boolean;
  ruleSetAddr?: PublicKey;
}): Promise<{
  mint: PublicKey;
  ata: PublicKey;
  owner: Keypair;
  metadata: PublicKey;
  masterEdition: PublicKey;
}> => {
  const usedOwner = owner ?? (await _createFundedWallet(provider));
  const usedMint = mint ?? Keypair.generate();

  const mplex = new Metaplex(provider.connection).use(
    keypairIdentity(usedOwner)
  );

  //create a verified collection
  if (collection) {
    await mplex.nfts().create({
      useNewMint: collection,
      tokenOwner: usedOwner.publicKey,
      uri: "https://www.tensor.trade",
      name: "Whatever",
      sellerFeeBasisPoints: royaltyBps ?? 0,
      isCollection: true,
      collectionIsSized: true,
    });

    // console.log(
    //   "coll",
    //   await mplex.nfts().findByMint({ mintAddress: collection.publicKey })
    // );
  }

  let metadataAddress, tokenAddress, masterEditionAddress;
  if (programmable) {
    //create programmable nft
    ({ metadataAddress, tokenAddress, masterEditionAddress } =
      await createAndMintPNft({
        mint: usedMint,
        owner: usedOwner,
        royaltyBps,
        creators,
        collection,
        collectionVerified,
        ruleSet: ruleSetAddr,
      }));
  } else {
    //create normal nft
    ({ metadataAddress, tokenAddress, masterEditionAddress } = await mplex
      .nfts()
      .create({
        useNewMint: usedMint,
        tokenOwner: usedOwner.publicKey,
        uri: "https://www.tensor.trade",
        name: "Whatever",
        sellerFeeBasisPoints: royaltyBps ?? 0,
        creators,
        maxSupply: toBigNumber(1),
        collection: collection?.publicKey,
      }));

    if (collection && collectionVerified) {
      await mplex.nfts().verifyCollection({
        mintAddress: usedMint.publicKey,
        collectionMintAddress: collection.publicKey,
      });
    }
  }

  // console.log(
  //   "nft",
  //   await mplex.nfts().findByMint({ mintAddress: usedMint.publicKey })
  // );

  return {
    mint: usedMint.publicKey,
    ata: tokenAddress,
    owner: usedOwner,
    metadata: metadataAddress,
    masterEdition: masterEditionAddress,
  };
};

export const createFundedWallet = (sol?: number) =>
  _createFundedWallet(TEST_PROVIDER, sol);

export const createATA = (mint: PublicKey, owner: Keypair) =>
  _createATA(TEST_PROVIDER, mint, owner);

export const createAndFundATA = (
  owner?: Keypair,
  mint?: Keypair,
  royaltyBps?: number,
  creators?: CreatorInput[],
  collection?: Keypair,
  collectionVerified?: boolean,
  programmable?: boolean,
  ruleSetAddr?: PublicKey,
  provider?: AnchorProvider
) =>
  _createAndFundATA({
    provider: provider ?? TEST_PROVIDER,
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
  _getAccount(TEST_PROVIDER.connection, acct);

// Creates a mint + 2 ATAs. The `owner` will have the mint initially.
export const makeMintTwoAta = async (
  owner: Keypair,
  other: Keypair,
  royaltyBps?: number,
  creators?: CreatorInput[],
  collection?: Keypair,
  collectionVerified?: boolean,
  programmable?: boolean,
  ruleSetAddr?: PublicKey
) => {
  const { mint, ata, metadata, masterEdition } = await createAndFundATA(
    owner,
    undefined,
    royaltyBps,
    creators,
    collection,
    collectionVerified,
    programmable,
    ruleSetAddr
  );

  const { ata: otherAta } = await createATA(mint, other);

  return { mint, metadata, ata, otherAta, masterEdition };
};

export const makeNTraders = async (n: number, sol?: number) => {
  return await Promise.all(
    Array(n)
      .fill(null)
      .map(async () => await createFundedWallet(sol))
  );
};
