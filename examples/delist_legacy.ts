import { simulateTxWithIxs } from "@tensor-foundation/common-helpers";
import { rpc, keypairBytes } from "./common";
import { address, KeyPairSigner, createKeyPairSignerFromBytes } from "@solana/web3.js";
import {
    DelistLegacyAsyncInput,
    getDelistLegacyInstructionAsync,
} from "@tensor-foundation/marketplace";

// delists NFT
async function delistLegacyMint(mint: string) {
    const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
        Buffer.from(keypairBytes),
        false,
    );
    const delistLegacyAsyncInput: DelistLegacyAsyncInput = {
        owner: keypairSigner,
        mint: address(mint),    
    }
    // retrieve delist instruction
    const delistIx = await getDelistLegacyInstructionAsync(delistLegacyAsyncInput);
    await simulateTxWithIxs(rpc, [delistIx], keypairSigner);
}
delistLegacyMint(
    "NFT_ADDRESS_YOU_WANT_TO_DELIST"
);
