import { Provider } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  AddDistributionArgs,
  AddGroupArgs,
  AddRoyaltiesArgs,
  CreateGroupArgs,
  CreateNftArgs,
  Creator,
  getAddDistributionIx,
  getAddNftToGroupIx,
  getAddRoyaltiesIx,
  getAtaCreateIx,
  getCreateGroupIx,
  getGroupAccountPda,
  getMintNftIx,
} from ".";
import { TEST_CONN_PAYER, TEST_PROVIDER, buildAndSendTx } from "../shared";
import {
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";

export const createCollectionWithRoyalties = async (
  provider: Provider,
  authority: Keypair,
  payer: Keypair,
  args: { name: string; symbol: string; uri: string; maxSize: number }
) => {
  const collectionMint = new Keypair();
  const collectionPubkey = collectionMint.publicKey;
  const authorityPubkey = authority.publicKey;

  const groupArgs: CreateGroupArgs = {
    groupMint: collectionPubkey.toString(),
    name: args.name,
    symbol: args.symbol,
    uri: args.uri,
    maxSize: args.maxSize,
    receiver: authorityPubkey.toString(),
    payer: authorityPubkey.toString(),
    authority: authorityPubkey.toString(),
  };
  const createGroupIx = await getCreateGroupIx(provider, groupArgs);

  const distributionArgs: AddDistributionArgs = {
    groupMint: collectionPubkey.toString(),
    paymentMint: PublicKey.default.toString(),
    payer: authorityPubkey.toString(),
    authority: authorityPubkey.toString(),
  };
  const addDistributionIx = await getAddDistributionIx(
    provider,
    distributionArgs
  );

  const signature = await buildAndSendTx({
    ixs: [createGroupIx, addDistributionIx],
    extraSigners: [authority, collectionMint, payer],
  });

  return {
    signature,
    group: getGroupAccountPda(collectionMint.publicKey.toString()),
    collection: collectionMint.publicKey,
  };
};

export const mintNft = async (
  provider: Provider,
  minter: PublicKey,
  authority: Keypair,
  payer: Keypair,
  args: {
    name: string;
    symbol: string;
    uri: string;
    collection: string;
    royaltyBasisPoints: number;
    creators: Creator[];
  }
) => {
  const mint = new Keypair();
  const mintPubkey = mint.publicKey;
  const collectionPubkey = new PublicKey(args.collection);
  const groupAuthority = authority;

  // Doesn't have to be the same, usually will be
  const nftAuthority = authority;
  const nftAuthPubkey = nftAuthority.publicKey;

  const mintDetails: CreateNftArgs = {
    name: args.name,
    symbol: args.symbol,
    uri: args.uri,
    mint: mintPubkey.toString(),
    receiver: minter.toString(),
    payer: payer.publicKey.toString(),
    authority: nftAuthPubkey.toString(),
  };
  const mintIx = await getMintNftIx(provider, mintDetails);

  const groupDetails: AddGroupArgs = {
    mint: mintPubkey.toString(),
    group: getGroupAccountPda(collectionPubkey.toString()).toString(),
    payer: nftAuthority.publicKey.toString(),
    authority: nftAuthPubkey.toString(),
  };
  const addToGroupIx = await getAddNftToGroupIx(provider, groupDetails);

  const royaltyDetails: AddRoyaltiesArgs = {
    mint: mintPubkey.toString(),
    royaltyBasisPoints: args.royaltyBasisPoints,
    creators: args.creators,
    payer: nftAuthority.publicKey.toString(),
    authority: nftAuthPubkey.toString(),
  };
  const addRoyaltiesToMintIx = await getAddRoyaltiesIx(
    provider,
    royaltyDetails
  );

  const signature = await buildAndSendTx({
    ixs: [mintIx, addToGroupIx, addRoyaltiesToMintIx],
    extraSigners: [groupAuthority, nftAuthority, mint],
  });

  return {
    signature,
    mint: mintPubkey,
    token: getAssociatedTokenAddressSync(
      mintPubkey,
      minter,
      false,
      TOKEN_2022_PROGRAM_ID
    ),
  };
};

export const wnsMint = async (
  owner: PublicKey,
  collection?: PublicKey,
  royaltyBasisPoints?: number
) => {
  // for now the authority is the payer
  const authority = TEST_CONN_PAYER.payer;

  if (!collection) {
    const { collection: newCollection } = await createCollectionWithRoyalties(
      TEST_PROVIDER,
      authority,
      authority,
      {
        name: "WNS Collection",
        symbol: "WNS C",
        uri: "https://wns.collection",
        maxSize: 10,
      }
    );
    collection = newCollection;
  }

  const { mint, token } = await mintNft(
    TEST_PROVIDER,
    owner, // minter
    authority,
    authority,
    {
      collection: collection.toString(),
      creators: [
        {
          address: authority.publicKey.toString(),
          share: 100,
        },
      ],
      name: "WNS Mint",
      symbol: "WNS M",
      royaltyBasisPoints: royaltyBasisPoints ?? 10000,
      uri: "https://wns.mint",
    }
  );

  return { mint, token, collection };
};

export const wnsTokenAccount = async (owner: PublicKey, mint: PublicKey) => {
  const createAtaIx = await getAtaCreateIx({
    mint: mint.toString(),
    authority: owner.toString(),
    payer: TEST_CONN_PAYER.payer.publicKey.toString(),
  });

  await buildAndSendTx({
    ixs: [createAtaIx],
    extraSigners: [TEST_CONN_PAYER.payer],
  });

  return {
    token: getAssociatedTokenAddressSync(
      mint,
      owner,
      false,
      TOKEN_2022_PROGRAM_ID
    ),
  };
};
