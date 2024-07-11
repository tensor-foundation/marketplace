import { simulateTxWithIxs, fetchMetadata } from "@tensor-foundation/common-helpers";
import { rpc, keypairBytes } from "./common";
import { 
    address, 
    KeyPairSigner, 
    createKeyPairSignerFromBytes, 
    unwrapOption 
} from "@solana/web3.js";
import {
    TakeBidLegacyAsyncInput,
    fetchBidState,
    getTakeBidLegacyInstructionAsync,
} from "@tensor-foundation/marketplace";
import { findMetadataPda } from "@tensor-foundation/resolvers";

// sells mint into bid, specified by its bidState account address
async function takeLegacyCollectionBid(mint: string, bidStateAccount: string) {
    const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
        Buffer.from(keypairBytes),
        false,
    );

    // fetch bidState for needed fields
    const bidState = await fetchBidState(rpc, address(bidStateAccount)).then(resp => resp.data);
    const { owner, amount: minAmount, targetId, makerBroker, margin } = bidState;

    // fetch metadata for additional relevant fields
    const [ metadataPda ] = await findMetadataPda({mint: address(mint)});
    const { tokenStandard, data: { creators:creatorsRaw }, programmableConfig } = await fetchMetadata(rpc, metadataPda);

    const creators = creatorsRaw.map(creator => creator.address);
    const ruleSet = programmableConfig?.ruleSet ?? undefined;

    const takeBidLegacyAsyncInput: TakeBidLegacyAsyncInput = {
        seller: keypairSigner,
        owner: owner,
        mint: address(mint),
        bidState: address(bidStateAccount),
        whitelist: targetId,
        minAmount: minAmount,
        makerBroker: unwrapOption(makerBroker) ?? undefined,
        // get taker broker fees of the price back to your own wallet!
        takerBroker: keypairSigner.address,
        sharedEscrow: unwrapOption(margin) ?? undefined,
        rulesAccPresent: !!ruleSet,
        authorizationRules: ruleSet,
        tokenStandard: tokenStandard,
        creators: creators,
    }
    // retrieve sell instruction
    const sellIx = await getTakeBidLegacyInstructionAsync(takeBidLegacyAsyncInput);
    await simulateTxWithIxs(rpc, [sellIx], keypairSigner);
}
takeLegacyCollectionBid(
    "NFT_ADDRESS_YOU_WANT_TO_SELL",
    "ADDRESS_OF_THE_BID_YOU_WANT_TO_SELL_INTO",
);
