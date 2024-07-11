import { fetchMetadata, simulateTxWithIxs } from "@tensor-foundation/common-helpers";
import { rpc, keypairBytes } from "./common";
import { address, KeyPairSigner, createKeyPairSignerFromBytes, assertAccountExists, isSome, unwrapOption, parseBase64RpcAccount, Address } from "@solana/web3.js";
import {
    BuyLegacyAsyncInput,
    fetchMaybeListState,
    findListStatePda,
    getBuyLegacyInstructionAsync,
} from "@tensor-foundation/marketplace";
import { findMetadataPda } from "@tensor-foundation/resolvers";

// buys NFT (needs to be a valid listing on tensor!) given the whitelist address of the collection it's listed for
async function buyLegacy(mint: string, whitelist: string) {
    const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
        Buffer.from(keypairBytes),
        false,
    );
    // retrieve listState address from mint
    const [listStateAddress] = await findListStatePda({ mint: address(mint) });

    // fetch listState, assert that it exists and retrieve needed fields
    const listState = await fetchMaybeListState(rpc, listStateAddress);
    assertAccountExists(listState);
    const { owner, amount: maxAmount, rentPayer, makerBroker, privateTaker, cosigner } = listState.data;

    // check if listing is permissionlessly buyable or not
    if (
        // listing is listed for a private taker whose address doesn't match our address
        (isSome(privateTaker) && unwrapOption(privateTaker) != keypairSigner.address)
        // listing is listed w/ a cosigner, so it needs (!) to be taken from a frontend
        // (delete this part if you have access to the cosigner's private key)
        || cosigner
    ) {
        throw new Error("This listing can't be bought via SDK. It either specified a differing private taker or needs a valid cosignature!");
    }

    // fetch metadata for additional relevant fields
    const [ metadataPda ] = await findMetadataPda({mint: address(mint)});
    const { tokenStandard, data: { creators:creatorsRaw }, programmableConfig } = await fetchMetadata(rpc, metadataPda);

    const creators = creatorsRaw.map(creator => creator.address);
    const ruleSet = programmableConfig?.ruleSet ?? undefined;

    const buyLegacyAsyncInput: BuyLegacyAsyncInput = {
        payer: keypairSigner,
        owner: owner,
        mint: address(mint),
        maxAmount: maxAmount,
        rentDestination: rentPayer ?? undefined,
        makerBroker: unwrapOption(makerBroker) ?? undefined,
        // get taker broker fees of the price back to your own wallet!
        takerBroker: keypairSigner.address,
        authorizationRules: ruleSet,
        tokenStandard: tokenStandard,
        creators: creators,
    }
    // retrieve sell instruction
    const sellIx = await getBuyLegacyInstructionAsync(buyLegacyAsyncInput);
    await simulateTxWithIxs(rpc, [sellIx], keypairSigner);
}
buyLegacy(
    "NFT_ADDRESS_YOU_WANT_TO_BUY",
    "WHITELIST_OF_THE_COLLECTION_THE_NFT_IS_LISTED_FOR",
);
