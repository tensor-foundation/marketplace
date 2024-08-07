import {
  appendTransactionMessageInstruction,
  assertAccountExists,
  fetchEncodedAccount,
  pipe,
} from '@solana/web3.js';
import { findAtaPda } from '@tensor-foundation/mpl-token-metadata';
import {
  Client,
  createDefaultSolanaClient,
  createDefaultTransaction,
  createT22NftWithRoyalties,
  signAndSendTransaction,
  T22NftReturn,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import { ExecutionContext } from 'ava';
import { Address } from 'cluster';
import {
  fetchBidStateFromSeeds,
  findBidStatePda,
  findListStatePda,
  getBidInstructionAsync,
  getListT22InstructionAsync,
  Target,
} from '../../src';
import {
  assertTokenNftOwnedBy,
  COMPUTE_300K_IX,
  getAndFundFeeVault,
  getTestSigners,
  SetupTestParams,
  TestAction,
  TestSigners,
} from '../_common';

export interface T22Test {
  client: Client;
  signers: TestSigners;
  nft: T22NftReturn & { sellerFeeBasisPoints: bigint };
  listing: Address | undefined;
  listingPrice: bigint | undefined;
  bid: Address | undefined;
  bidAmount: number | undefined;
  feeVault: Address;
}

const DEFAULT_LISTING_PRICE = 100_000_000n;
const DEFAULT_BID_AMOUNT = 1;
const DEFAULT_SFBP = 500n;

export async function setupT22Test(params: SetupTestParams): Promise<T22Test> {
  const {
    t,
    action,
    listingPrice = DEFAULT_LISTING_PRICE,
    bidAmount = DEFAULT_BID_AMOUNT,
    useCosigner = false,
    useMakerBroker = false,
  } = params;

  const client = createDefaultSolanaClient();
  const signers = await getTestSigners(client);

  const { payer, buyer, nftOwner, nftUpdateAuthority, cosigner, makerBroker } =
    signers;

  const sellerFeeBasisPoints = DEFAULT_SFBP;

  // Mint NFT
  const nft = await createT22NftWithRoyalties({
    client,
    payer,
    owner: nftOwner.address,
    mintAuthority: nftUpdateAuthority,
    freezeAuthority: null,
    decimals: 0,
    data: {
      name: 'Test Token',
      symbol: 'TT',
      uri: 'https://example.com',
    },
    royalties: {
      key: '_ro_' + nftUpdateAuthority.address,
      value: sellerFeeBasisPoints.toString(),
    },
  });

  const { mint, extraAccountMetas } = nft;

  let bid;
  let listing;

  switch (action) {
    case TestAction.List: {
      // List the NFT.
      const listLegacyIx = await getListT22InstructionAsync({
        owner: nftOwner,
        mint,
        amount: listingPrice,
        cosigner: useCosigner ? cosigner : undefined,
        makerBroker: useMakerBroker ? makerBroker.address : undefined,
        transferHookAccounts: extraAccountMetas.map((a) => a.address),
      });

      await pipe(
        await createDefaultTransaction(client, nftOwner),
        (tx) => appendTransactionMessageInstruction(COMPUTE_300K_IX, tx),
        (tx) => appendTransactionMessageInstruction(listLegacyIx, tx),
        (tx) => signAndSendTransaction(client, tx)
      );

      // Listing was created.
      [listing] = await findListStatePda({
        mint,
      });
      assertAccountExists(await fetchEncodedAccount(client.rpc, listing));

      // NFT is now escrowed in the listing.
      await assertTokenNftOwnedBy({
        t,
        client,
        mint,
        owner: listing,
        tokenProgram: TOKEN22_PROGRAM_ID,
      });
      break;
    }
    case TestAction.Bid: {
      // Bid on the NFT.
      const bidIx = await getBidInstructionAsync({
        owner: buyer,
        amount: bidAmount,
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
        (tx) => appendTransactionMessageInstruction(COMPUTE_300K_IX, tx),
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

  const state = listing ?? bid;

  // Derives fee vault from state account and airdrops keep-alive rent to it.
  const feeVault = await getAndFundFeeVault(client, state!);

  return {
    client,
    signers,
    nft: { ...nft, sellerFeeBasisPoints },
    bid: bid ?? undefined,
    bidAmount,
    listing: listing ?? undefined,
    listingPrice,
    feeVault,
  };
}

// Asserts that the T22 listing token acccount is closed.
export async function assertT22ListingTokenClosed(
  t: ExecutionContext,
  test: T22Test
) {
  const { client, listing, nft } = test;
  const { mint } = nft;

  t.false(
    (
      await fetchEncodedAccount(
        client.rpc,
        (
          await findAtaPda({
            mint,
            owner: listing!,
            tokenProgramId: TOKEN22_PROGRAM_ID,
          })
        )[0]
      )
    ).exists
  );
}
