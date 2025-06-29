import { getSetComputeUnitLimitInstruction } from '@solana-program/compute-budget';
import {
  Address,
  airdropFactory,
  appendTransactionMessageInstruction,
  assertAccountExists,
  fetchEncodedAccount,
  KeyPairSigner,
  lamports,
  pipe,
} from '@solana/web3.js';
import {
  Nft,
  TokenStandard,
  createDefaultNft,
  fetchMetadata,
  mintNft,
  printSupply,
} from '@tensor-foundation/mpl-token-metadata';
import {
  Client,
  ONE_SOL,
  TOKEN_PROGRAM_ID,
  createDefaultSolanaClient,
  createDefaultTransaction,
  createKeyPairSigner,
  signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import {
  Target,
  fetchBidStateFromSeeds,
  findBidStatePda,
  findListStatePda,
  getBidInstructionAsync,
  getListLegacyInstructionAsync,
} from '../../src';
import {
  BASIS_POINTS,
  DEFAULT_BID_PRICE,
  DEFAULT_LISTING_PRICE,
  SetupTestParams,
  TestAction,
  TestSigners,
  assertTokenNftOwnedBy,
  getTestSigners,
} from '../_common';

const OWNER_BYTES = [
  75, 111, 93, 80, 59, 171, 168, 79, 238, 255, 9, 233, 236, 194, 196, 73, 76, 2,
  51, 180, 184, 6, 77, 52, 36, 243, 28, 125, 104, 104, 114, 246, 166, 110, 5,
  17, 12, 8, 199, 21, 64, 143, 53, 202, 39, 71, 93, 114, 119, 171, 152, 44, 155,
  146, 43, 217, 148, 215, 83, 14, 162, 91, 65, 177,
];

export const computeIx = getSetComputeUnitLimitInstruction({
  units: 800_000,
});

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

export interface LegacyTest {
  client: Client;
  signers: TestSigners;
  listing: Address | undefined;
  bid: Address | undefined;
  price: bigint;
  listingPrice: bigint | undefined;
  bidPrice: bigint | undefined;
  mint: Address;
}

export async function setupLegacyTest(
  params: SetupTestParams & { pNft?: boolean }
): Promise<LegacyTest> {
  const {
    t,
    pNft,
    action,
    listingPrice = DEFAULT_LISTING_PRICE,
    bidPrice = DEFAULT_BID_PRICE,
    useCosigner = false,
  } = params;

  const client = createDefaultSolanaClient();
  const signers = await getTestSigners(client);

  const { payer, buyer, nftOwner, nftUpdateAuthority, cosigner } = signers;

  const standard = pNft
    ? TokenStandard.ProgrammableNonFungible
    : TokenStandard.NonFungible;

  // Mint an NFT.
  const { mint, metadata } = await createDefaultNft({
    client,
    payer,
    authority: nftUpdateAuthority,
    owner: nftOwner.address,
    standard,
  });

  let bid;
  let listing;

  switch (action) {
    case TestAction.List: {
      // List the NFT.
      const listLegacyIx = await getListLegacyInstructionAsync({
        owner: nftOwner,
        mint,
        amount: listingPrice,
        cosigner: useCosigner ? cosigner : undefined,
        tokenStandard: standard,
      });

      await pipe(
        await createDefaultTransaction(client, nftOwner),
        (tx) => appendTransactionMessageInstruction(computeIx, tx),
        (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
        (tx) => signAndSendTransaction(client, tx)
      );

      // Listing was created.
      [listing] = await findListStatePda({
        mint,
      });
      assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

      // NFT is now escrowed in the listing.
      await assertTokenNftOwnedBy({ t, client, mint, owner: listing });
      break;
    }
    case TestAction.Bid: {
      // Bid on the NFT.
      const bidIx = await getBidInstructionAsync({
        owner: buyer,
        amount: bidPrice,
        target: Target.AssetId,
        targetId: mint,
        cosigner: useCosigner ? cosigner : undefined,
      });

      [bid] = await findBidStatePda({
        owner: buyer.address,
        bidId: mint,
      });

      await pipe(
        await createDefaultTransaction(client, signers.buyer),
        (tx) => appendTransactionMessageInstruction(computeIx, tx),
        (tx) => appendTransactionMessageInstruction(bidIx, tx),
        (tx) => signAndSendTransaction(client, tx)
      );

      const bidState = await fetchBidStateFromSeeds(client.rpc, {
        owner: buyer.address,
        bidId: mint,
      });
      t.like(bidState, {
        data: {
          owner: buyer.address,
          amount: 1n,
          target: Target.AssetId,
          targetId: mint,
          cosigner: null,
        },
      });
      break;
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }

  const md = (await fetchMetadata(client.rpc, metadata)).data;
  const { sellerFeeBasisPoints } = md;

  // Calculate the max or min price from the price +/- royalties.
  const price = listingPrice
    ? listingPrice! +
      (listingPrice! * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS
    : bidPrice! - (bidPrice! * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;

  return {
    client,
    signers,
    mint,
    bid: bid ?? undefined,
    price,
    bidPrice: bidPrice ?? undefined,
    listingPrice: listingPrice ?? undefined,
    listing: listing ?? undefined,
  };
}

export async function setupFungibleAssetTest(
  params: SetupTestParams
): Promise<LegacyTest> {
  const {
    t,
    action,
    listingPrice = DEFAULT_LISTING_PRICE,
    bidPrice = Number(DEFAULT_BID_PRICE),
    useCosigner = false,
  } = params;

  const client = createDefaultSolanaClient();
  const signers = await getTestSigners(client);

  const { payer, buyer, nftOwner, nftUpdateAuthority, cosigner } = signers;

  const standard = TokenStandard.FungibleAsset;

  const { mint, metadata, masterEdition } = await mintFungibleAsset({
    client,
    payer,
    nftOwner: nftOwner.address,
    nftUpdateAuthority,
  });

  let listing;
  let bid;

  switch (action) {
    case TestAction.List: {
      // List the NFT.
      const listLegacyIx = await getListLegacyInstructionAsync({
        owner: nftOwner,
        mint,
        amount: listingPrice,
        cosigner: useCosigner ? cosigner : undefined,
        tokenStandard: standard,
        edition: masterEdition,
      });

      await pipe(
        await createDefaultTransaction(client, nftOwner),
        (tx) => appendTransactionMessageInstruction(computeIx, tx),
        (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
        (tx) => signAndSendTransaction(client, tx)
      );

      // Listing was created.
      [listing] = await findListStatePda({
        mint,
      });
      assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

      // NFT is now escrowed in the listing.
      await assertTokenNftOwnedBy({ t, client, mint, owner: listing });
      break;
    }
    case TestAction.Bid: {
      // Bid on the NFT.
      const bidIx = await getBidInstructionAsync({
        owner: buyer,
        amount: bidPrice,
        target: Target.AssetId,
        targetId: mint,
        cosigner: useCosigner ? cosigner : undefined,
      });

      [bid] = await findBidStatePda({
        owner: buyer.address,
        bidId: mint,
      });

      await pipe(
        await createDefaultTransaction(client, signers.buyer),
        (tx) => appendTransactionMessageInstruction(computeIx, tx),
        (tx) => appendTransactionMessageInstruction(bidIx, tx),
        (tx) => signAndSendTransaction(client, tx)
      );

      const bidState = await fetchBidStateFromSeeds(client.rpc, {
        owner: buyer.address,
        bidId: mint,
      });
      t.like(bidState, {
        data: {
          owner: buyer.address,
          amount: 1n,
          target: Target.AssetId,
          targetId: mint,
          cosigner: null,
        },
      });
      break;
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }

  const md = (await fetchMetadata(client.rpc, metadata)).data;
  const { sellerFeeBasisPoints } = md;

  // Calculate the max or min price from the price +/- royalties.
  const price = listingPrice
    ? listingPrice! +
      (listingPrice! * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS
    : BigInt(bidPrice!) -
      (BigInt(bidPrice!) * BigInt(sellerFeeBasisPoints)) / BASIS_POINTS;

  return {
    client,
    signers,
    mint,
    bid: bid ?? undefined,
    price: price,
    bidPrice: price,
    listingPrice: price,
    listing: listing ?? undefined,
  };
}

export async function mintFungibleAsset({
  client,
  payer,
  nftOwner,
  nftUpdateAuthority,
  decimals = 0,
}: {
  client: Client;
  payer: KeyPairSigner;
  nftOwner: Address;
  nftUpdateAuthority: KeyPairSigner;
  decimals?: number;
}): Promise<Nft> {
  const standard = TokenStandard.FungibleAsset;

  // Mint an NFT.
  const data = {
    name: 'Example NFT',
    symbol: 'EXNFT',
    uri: 'https://example.com/nft',
    sellerFeeBasisPoints: 500,
    creators: [
      {
        address: nftUpdateAuthority.address,
        verified: true,
        share: 100,
      },
    ],
    printSupply: printSupply('Zero'),
    tokenStandard: standard,
    collection: undefined,
    ruleSet: undefined,
    decimals,
  };

  const accounts = {
    authority: nftUpdateAuthority,
    owner: nftOwner,
    payer,
    tokenProgram: TOKEN_PROGRAM_ID,
  };

  return await mintNft(client, accounts, data);
}
