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

// make a bid on a single NFT specified by its mint address
async function makeSingleNftBid(mint: string, amountLamports: number) {
    const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
        Buffer.from(keypairBytes),
        false,
    );
    const bidAsyncInput: BidAsyncInput = {
        owner: keypairSigner,
        target: Target.AssetId,
        targetId: address(mint),
        amount: amountLamports,
        // get maker broker fees of the price back to your own wallet
        // when the bid gets accepted!
        makerBroker: keypairSigner.address
    }
    // retrieve bid instruction
    const bidIx = await getBidInstructionAsync(bidAsyncInput);
    await simulateTxWithIxs(rpc, [bidIx], keypairSigner);
}
makeSingleNftBid(
    "NFT_ADDRESS_YOU_WANT_TO_MAKE_A_BID_FOR",
    1 * 1_000_000_000, // 1 sol
);
