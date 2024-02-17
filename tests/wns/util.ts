import {
  Connection,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  CreateCollectionArgs,
  CreateNftArgs,
  Creator,
  PurchaseNftArgs,
  TransferNftArgs,
} from "./utils/interfaces";
import {
  buildCreateCollectionIx,
  getProvider,
  CONNECTION_URL,
  buildAddDistributionIx,
  buildMintNftIx,
  buildAddGroupIx,
  buildAddRoyaltiesIx,
  buildApproveIx,
  buildAtaCreateIx,
  buildTransferIx,
  buildClaimDistributionIx,
  buildCpiTransferIx,
  getATAAddressSync,
} from "./utils";
import { Provider } from "@coral-xyz/anchor";
import { buildAndSendTx, TEST_CONN_PAYER, TEST_PROVIDER } from "../shared";

export const createCollectionWithRoyalties = async (
  provider: Provider,
  authority: Keypair,
  payer: Keypair,
  args: { name: string; symbol: string; uri: string; maxSize: number }
) => {
  const collectionMint = new Keypair();
  const collectionPubkey = collectionMint.publicKey;

  const authorityPubkey = authority.publicKey;

  const collectionArgs: CreateCollectionArgs = {
    name: args.name,
    symbol: args.symbol,
    uri: args.uri,
    maxSize: args.maxSize,
    mint: collectionPubkey.toString(),
  };

  const { ix: createCollectionIx, group } = await buildCreateCollectionIx(
    provider,
    collectionArgs,
    authorityPubkey.toString()
  );
  const addDistributionIx = await buildAddDistributionIx(
    provider,
    collectionPubkey.toString(),
    authorityPubkey.toString()
  );

  /*
  let blockhash = await provider.connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);
  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
    instructions: [createCollectionIx, addDistributionIx],
  }).compileToV0Message();
  const txn = new VersionedTransaction(messageV0);

  txn.sign([authority, collectionMint, payer]);
  const sig = await provider.connection.sendTransaction(txn);
  */

  const signature = await buildAndSendTx({
    ixs: [createCollectionIx, addDistributionIx],
    extraSigners: [authority, collectionMint, payer],
  });

  return {
    signature,
    group,
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
  const groupAuthPubkey = groupAuthority.publicKey;

  // Doesn't have to be the same, usually will be
  const nftAuthority = authority;
  const nftAuthPubkey = nftAuthority.publicKey;

  const mintDetails: CreateNftArgs = {
    name: args.name,
    symbol: args.symbol,
    uri: args.uri,
    mint: mintPubkey.toString(),
  };

  const mintIx = await buildMintNftIx(
    provider,
    mintDetails,
    minter.toString(),
    nftAuthPubkey.toString()
  );
  const addToGroupIx = await buildAddGroupIx(
    provider,
    groupAuthPubkey.toString(),
    mintPubkey.toString(),
    collectionPubkey.toString()
  );
  const addRoyaltiesToMintIx = await buildAddRoyaltiesIx(
    provider,
    nftAuthPubkey.toString(),
    mintPubkey.toString(),
    args.royaltyBasisPoints,
    args.creators
  );
  /*
  let blockhash = await provider.connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);
  const messageV0 = new TransactionMessage({
    payerKey: payer.publicKey,
    recentBlockhash: blockhash,
    instructions: [mintIx, addToGroupIx, addRoyaltiesToMintIx],
  }).compileToV0Message();
  const txn = new VersionedTransaction(messageV0);

  txn.sign([minter, groupAuthority, nftAuthority, mint, payer]);
  const sig = await provider.connection.sendTransaction(txn);
  */
  const signature = await buildAndSendTx({
    ixs: [mintIx, addToGroupIx, addRoyaltiesToMintIx],
    extraSigners: [groupAuthority, nftAuthority, mint],
  });

  return {
    signature,
    mint: mintPubkey,
    token: getATAAddressSync({ mint: mintPubkey, owner: minter }),
  };
};

export const wnsMint = async (owner: PublicKey, royaltyBasisPoints?: number) => {
  // for now the authority is the payer
  const authority = TEST_CONN_PAYER.payer;
  const { collection } = await createCollectionWithRoyalties(
    TEST_PROVIDER,
    authority,
    authority,
    {
      name: "WNS Collection",
      symbol: "WNS C",
      maxSize: 10,
      uri: "https://wns.collection",
    }
  );

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
  const createAtaIx = await buildAtaCreateIx(
    TEST_CONN_PAYER.payer.publicKey.toString(),
    mint.toString(),
    owner.toString()
  );

  await buildAndSendTx({
    ixs: [createAtaIx],
    extraSigners: [TEST_CONN_PAYER.payer],
  });

  return {
    token: getATAAddressSync({ mint, owner }),
  };
};

/*
export const purchaseNft = async (args: PurchaseNftArgs) => {
  const provider = getProvider(CONNECTION_URL);
  const paymentAmount = args.paymentLamports;

  // Only supporting SOL to start
  // const paymentMint = args.paymentMint;
  const paymentMint = "11111111111111111111111111111111";

  const nftMint = args.nftMint;
  const collection = args.collection;
  // Assume keypair from ENV, should change to better way to determine signer
  const sender = USER_ACCOUNT.publicKey.toString();

  const destination = args.buyer;

  const approveIx = await buildApproveIx(
    provider,
    sender,
    nftMint,
    collection,
    paymentAmount,
    paymentMint
  );
  const createAtaIx = await buildAtaCreateIx(sender, nftMint, destination);
  const transferIx = await buildCpiTransferIx(
    provider,
    nftMint,
    sender,
    destination
  );

  let blockhash = await provider.connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);
  const messageV0 = new TransactionMessage({
    payerKey: new PublicKey(sender),
    recentBlockhash: blockhash,
    instructions: [approveIx, createAtaIx, transferIx],
  }).compileToV0Message();
  const txn = new VersionedTransaction(messageV0);

  txn.sign([USER_ACCOUNT]);
  const sig = await provider.connection.sendTransaction(txn);

  return {
    txn: sig,
  };
};

export const transferNft = async (args: TransferNftArgs) => {
  const provider = getProvider(CONNECTION_URL);

  const nftMint = args.nftMint;
  // Assume keypair from ENV, should change to better way to determine signer
  const sender = USER_ACCOUNT.publicKey.toString();

  const destination = args.to;

  const createAtaIx = await buildAtaCreateIx(sender, nftMint, destination);
  const transferIx = await buildTransferIx(nftMint, sender, destination);

  let blockhash = await provider.connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);
  const messageV0 = new TransactionMessage({
    payerKey: new PublicKey(sender),
    recentBlockhash: blockhash,
    instructions: [createAtaIx, transferIx],
  }).compileToV0Message();
  const txn = new VersionedTransaction(messageV0);

  txn.sign([USER_ACCOUNT]);
  const sig = await provider.connection.sendTransaction(txn);

  return {
    txn: sig,
  };
};

export const claimDistribution = async (args: {
  collection: string;
  mintToClaim: string;
}) => {
  const provider = getProvider(CONNECTION_URL);
  // In test, for now making Creator into auth account
  const creatorPubkey = AUTHORITY_ACCOUNT.publicKey;

  const claimIx = await buildClaimDistributionIx(
    provider,
    args.collection,
    creatorPubkey.toString(),
    args.mintToClaim
  );

  let blockhash = await provider.connection
    .getLatestBlockhash()
    .then((res) => res.blockhash);
  const messageV0 = new TransactionMessage({
    payerKey: creatorPubkey,
    recentBlockhash: blockhash,
    instructions: [claimIx],
  }).compileToV0Message();
  const txn = new VersionedTransaction(messageV0);

  txn.sign([AUTHORITY_ACCOUNT]);
  const sig = await provider.connection.sendTransaction(txn);

  return {
    txn: sig,
  };
};
*/
