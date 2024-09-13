import {
  Address,
  appendTransactionMessageInstruction,
  assertAccountExists,
  fetchEncodedAccount,
  generateKeyPairSigner,
  pipe,
} from '@solana/web3.js';
import {
  Client,
  createAndMintTo,
  createDefaultSolanaClient,
  createDefaultTransaction,
  createT22NftWithRoyalties,
  signAndSendTransaction,
  T22NftReturn,
  TOKEN22_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@tensor-foundation/test-helpers';
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
  DEFAULT_BID_PRICE,
  DEFAULT_LISTING_PRICE,
  DEFAULT_SFBP,
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
  state: Address;
  price: bigint;
  feeVault: Address;
  splMint?: Address;
}

export async function setupT22Test(params: SetupTestParams): Promise<T22Test> {
  const {
    t,
    action,
    listingPrice = DEFAULT_LISTING_PRICE,
    bidPrice = DEFAULT_BID_PRICE,
    useCosigner = false,
    useMakerBroker = false,
    useSplToken = false,
  } = params;

  const client = createDefaultSolanaClient();
  const signers = await getTestSigners(client);

  const { payer, buyer, nftOwner, nftUpdateAuthority, cosigner, makerBroker } =
    signers;

  const sellerFeeBasisPoints = DEFAULT_SFBP;

  let splMint;

  if (useSplToken) {
    const mintAuthority = await generateKeyPairSigner();

    // Create SPL token and fund the buyer with it.
    [{ mint: splMint }] = await createAndMintTo({
      client,
      payer,
      mintAuthority,
      recipient: payer.address,
      decimals: 0,
      initialSupply: 1_000_000_000n,
      tokenProgram: TOKEN_PROGRAM_ID,
    });
  }

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
        currency: splMint,
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
        amount: bidPrice,
        target: Target.AssetId,
        targetId: mint,
        makerBroker: useMakerBroker ? makerBroker.address : undefined,
        currency: splMint,
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
    nft: { ...nft, sellerFeeBasisPoints },
    state,
    price,
    feeVault,
    splMint,
  };
}

// // Asserts that the T22 listing token acccount is closed.
// export async function assertT22ListingTokenClosed(
//   t: ExecutionContext,
//   test: T22Test
// ) {
//   const { client, listing, nft } = test;
//   const { mint } = nft;

//   t.false(
//     (
//       await fetchEncodedAccount(
//         client.rpc,
//         (
//           await findAtaPda({
//             mint,
//             owner: listing!,
//             tokenProgramId: TOKEN22_PROGRAM_ID,
//           })
//         )[0]
//       )
//     ).exists
//   );
// }
