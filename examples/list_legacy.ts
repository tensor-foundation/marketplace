import { simulateTxWithIxs } from "@tensor-foundation/common-helpers";
import { rpc, keypairBytes } from "./common";
import { address, KeyPairSigner, createKeyPairSignerFromBytes } from "@solana/web3.js";
import {
    ListLegacyAsyncInput,
    getListLegacyInstructionAsync,
} from "@tensor-foundation/marketplace";

// lists mint for amount specified in lamports (1 SOL == 1_000_000_000 lamports) 
async function listLegacyMint(mint: string, amountLamports: number) {
    const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
        Buffer.from(keypairBytes),
        false,
    );
    const listLegacyAsyncInput: ListLegacyAsyncInput = {
        owner: keypairSigner,
        mint: address(mint),
        amount: amountLamports,
        // get 50 BPS of the price back to your own wallet by being the makerBroker
        // when the listing gets sold!
        makerBroker: keypairSigner.address,
    }
    // retrieve list instruction
    const listIx = await getListLegacyInstructionAsync(listLegacyAsyncInput);
    await simulateTxWithIxs(rpc, [listIx], keypairSigner);
}
listLegacyMint(
    "NFT_ADDRESS_YOU_WANT_TO_LIST",
    1 * 1_000_000_000,
);
