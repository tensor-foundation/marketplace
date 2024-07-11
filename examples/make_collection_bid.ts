import { simulateTxWithIxs } from "@tensor-foundation/common-helpers";
import { rpc, keypairBytes } from "./common";
import { 
    address, 
    KeyPairSigner, 
    createKeyPairSignerFromBytes, 
} from "@solana/web3.js";
import {
    Target,
    BidAsyncInput,
    getBidInstructionAsync,
} from "@tensor-foundation/marketplace";

// make a collection bid for a collection specified by its whitelist address
// quantity defaults to 1 if not specified otherwise
async function makeCollectionBid(whitelist: string, amountLamports: number, quantity?: number) {
    const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
        Buffer.from(keypairBytes),
        false,
    );
    const bidAsyncInput: BidAsyncInput = {
        owner: keypairSigner,
        target: Target.Whitelist,
        targetId: address(whitelist),
        amount: amountLamports,
        quantity: quantity,
        // get maker broker fees of the price back to your own wallet
        // when the bid gets accepted!
        makerBroker: keypairSigner.address,
    }
    // retrieve bid instruction
    const bidIx = await getBidInstructionAsync(bidAsyncInput);
    await simulateTxWithIxs(rpc, [bidIx], keypairSigner);
}
makeCollectionBid(
    "WHITELIST_OF_COLLECTION_YOU_WANT_TO_MAKE_A_COLLECTION_BID_FOR",
    1 * 1_000_000_000, // 1 sol
    5 // 5 bids @ 1 sol
);
