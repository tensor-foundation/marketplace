import { simulateTxWithIxs } from "@tensor-foundation/common-helpers";
import { rpc, keypairBytes } from "./common";
import { 
    address, 
    KeyPairSigner, 
    createKeyPairSignerFromBytes, 
    parseBase64RpcAccount, 
    assertAccountExists, 
    Address, 
    isSome, 
    unwrapOption 
} from "@solana/web3.js";
import {
    TakeBidLegacyAsyncInput,
    Target,
    fetchBidState,
    getTakeBidLegacyInstructionAsync,
} from "@tensor-foundation/marketplace";
import { Mode, TensorWhitelistAccount, decodeWhitelist, decodeWhitelistV2, identifyTensorWhitelistAccount } from "@tensor-foundation/whitelist";

// sells mint into bid, specified by its bidState account address
async function takeLegacyCollectionBid(mint: string, bidStateAccount: string) {
    const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
        Buffer.from(keypairBytes),
        false,
    );

    // fetch bidState for needed fields
    const bidState = await fetchBidState(rpc, address(bidStateAccount)).then(resp => resp.data);
    const { owner, amount: minAmount, target, targetId, makerBroker, cosigner } = bidState;

    let isVerifiedViaFVC: boolean = false;
    let creators: Address[] = [];

    // if target === Target.Whitelist ==> bid is a collection or trait bid so we 
    // throw an error if it is a trait bid (trait bid take instructions need
    // to have a valid cosignature, so they have to be retrieved from our API)
    if(cosigner) throw new Error(`${bidStateAccount} is a trait bid. Please retrieve the buy instruction via our API.`);

    // Now if target === Target.Whitelist, we know it is a collection bid
    // and we can retrieve Creators (FVC) Address/es if given
    if (target === Target.Whitelist) {
        // check if whitelist is v1 or v2 
        // and retrieve creators if given
        const whitelistAccount = await rpc
            .getAccountInfo(targetId, { encoding: "base64" })
            .send()
            .then(resp => parseBase64RpcAccount(targetId, resp.value));
        assertAccountExists(whitelistAccount);
        const whitelistAccountType = identifyTensorWhitelistAccount(whitelistAccount);
        if (whitelistAccountType === TensorWhitelistAccount.Whitelist) {
            const decodedWhitelist = decodeWhitelist(whitelistAccount);
            isVerifiedViaFVC = isSome(decodedWhitelist.data.fvc);
            if (isVerifiedViaFVC) creators.push(unwrapOption(decodedWhitelist.data.fvc)!);
        }
        else if (whitelistAccountType == TensorWhitelistAccount.WhitelistV2) {
            const decodedWhitelistV2 = decodeWhitelistV2(whitelistAccount);
            isVerifiedViaFVC = !!decodedWhitelistV2.data.conditions.find((condition) => condition.mode === Mode.FVC);
            if (isVerifiedViaFVC) decodedWhitelistV2.data.conditions
                .filter((condition) => condition.mode === Mode.FVC)
                .forEach(condition => creators.push(condition.value));
        }
    }
    else throw new Error(`${bidStateAccount} is not a collection bid.`);

    const takeBidLegacyAsyncInput: TakeBidLegacyAsyncInput = {
        seller: keypairSigner,
        owner: owner,
        mint: address(mint),
        bidState: address(bidStateAccount),
        whitelist: targetId,
        minAmount: minAmount,
        makerBroker: unwrapOption(makerBroker) ?? undefined,
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
