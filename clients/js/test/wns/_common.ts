import {
  appendTransactionMessageInstruction,
  assertAccountExists,
  fetchEncodedAccount,
  IAccountMeta,
  pipe,
} from '@solana/web3.js';
import {
  Client,
  createDefaultSolanaClient,
  createDefaultTransaction,
  createWnsNftInGroup,
  signAndSendTransaction,
  TOKEN22_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
import { Address } from 'cluster';
import {
  fetchBidStateFromSeeds,
  findBidStatePda,
  findListStatePda,
  getBidInstructionAsync,
  getListWnsInstructionAsync,
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

export interface WnsTest {
  client: Client;
  signers: TestSigners;
  nft: WnsNft;
  state: Address;
  price: bigint;
  feeVault: Address;
}

export interface WnsNft {
  mint: Address;
  extraAccountMetas: IAccountMeta[];
  distribution: Address;
  sellerFeeBasisPoints: bigint;
}

const DEFAULT_LISTING_PRICE = 100_000_000n;
const DEFAULT_BID_PRICE = 100_000_000n;
const DEFAULT_SFBP = 500n;

export async function setupWnsTest(params: SetupTestParams): Promise<WnsTest> {
  const {
    t,
    action,
    listingPrice = DEFAULT_LISTING_PRICE,
    bidPrice = DEFAULT_BID_PRICE,
    useCosigner = false,
    useMakerBroker = false,
  } = params;

  const client = createDefaultSolanaClient();
  const signers = await getTestSigners(client);

  const { payer, buyer, nftOwner, nftUpdateAuthority, cosigner, makerBroker } =
    signers;

  const sellerFeeBasisPoints = DEFAULT_SFBP;

  // Mint NFT
  const { mint, extraAccountMetas, distribution } = await createWnsNftInGroup({
    client,
    payer,
    owner: nftOwner.address,
    authority: nftUpdateAuthority,
  });

  let bid;
  let listing;

  switch (action) {
    case TestAction.List: {
      // List the NFT.
      const listIx = await getListWnsInstructionAsync({
        owner: nftOwner,
        mint,
        amount: listingPrice,
        cosigner: useCosigner ? cosigner : undefined,
        makerBroker: useMakerBroker ? makerBroker.address : undefined,
        transferHookAccounts: extraAccountMetas.map((a) => a.address),
        distribution,
      });

      await pipe(
        await createDefaultTransaction(client, nftOwner),
        (tx) => appendTransactionMessageInstruction(COMPUTE_300K_IX, tx),
        (tx) => appendTransactionMessageInstruction(listIx, tx),
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
          amount: bidPrice,
          target: Target.AssetId,
          targetId: mint,
          cosigner: useCosigner ? cosigner : null,
        },
      });
      console.log('Created bid state:', bid);
      break;
    }
    default:
      throw new Error(`Unknown action: ${action}`);
  }

  const state = listing ? listing! : bid!;
  const price = listingPrice ?? bidPrice;

  // Derives fee vault from state account and airdrops keep-alive rent to it.
  const feeVault = await getAndFundFeeVault(client, state!);

  return {
    client,
    signers,
    nft: { mint, extraAccountMetas, distribution, sellerFeeBasisPoints },
    state,
    price,
    feeVault,
  };
}
