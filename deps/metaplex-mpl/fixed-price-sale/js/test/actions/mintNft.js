"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintNFT = void 0;
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const spl_token_1 = require("@solana/spl-token");
const assert_1 = require("assert");
const createTokenAccount_1 = require("../transactions/createTokenAccount");
const createMintAccount_1 = require("./createMintAccount");
const js_1 = require("@metaplex-foundation/js");
const URI = 'https://arweave.net/Rmg4pcIv-0FQ7M7X838p2r592Q4NU63Fj7o7XsvBHEE';
const NAME = 'test';
const SYMBOL = 'sym';
const SELLER_FEE_BASIS_POINTS = 10;
function mintNFT({ transactionHandler, payer, connection, creators, collectionMint, maxSupply = 100, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const { mint, createMintTx } = yield createMintAccount_1.CreateMint.createMintAccount(connection, payer.publicKey);
        yield transactionHandler.sendAndConfirmTransaction(createMintTx, [mint]).assertSuccess(assert_1.strict);
        const { tokenAccount, createTokenTx } = yield (0, createTokenAccount_1.createTokenAccount)({
            payer: payer.publicKey,
            mint: mint.publicKey,
            connection,
        });
        createTokenTx.add((0, spl_token_1.createMintToInstruction)(mint.publicKey, tokenAccount.publicKey, payer.publicKey, 1));
        const data = {
            uri: URI,
            name: NAME,
            symbol: SYMBOL,
            sellerFeeBasisPoints: SELLER_FEE_BASIS_POINTS,
            creators: creators !== null && creators !== void 0 ? creators : null,
            collection: collectionMint
                ? {
                    key: collectionMint,
                    verified: false,
                }
                : null,
            uses: null,
        };
        const metaplex = js_1.Metaplex.make(connection);
        const pdas = metaplex.nfts().pdas();
        const metadata = pdas.metadata({ mint: mint.publicKey });
        const createMetadataInstruction = (0, mpl_token_metadata_1.createCreateMetadataAccountV2Instruction)({
            metadata,
            mint: mint.publicKey,
            updateAuthority: payer.publicKey,
            mintAuthority: payer.publicKey,
            payer: payer.publicKey,
        }, { createMetadataAccountArgsV2: { isMutable: true, data } });
        createTokenTx.add(createMetadataInstruction);
        const edition = pdas.edition({ mint: mint.publicKey });
        const masterEditionInstruction = (0, mpl_token_metadata_1.createCreateMasterEditionV3Instruction)({
            edition,
            metadata,
            updateAuthority: payer.publicKey,
            mint: mint.publicKey,
            mintAuthority: payer.publicKey,
            payer: payer.publicKey,
        }, {
            createMasterEditionArgs: { maxSupply },
        });
        createTokenTx.add(masterEditionInstruction);
        yield transactionHandler
            .sendAndConfirmTransaction(createTokenTx, [tokenAccount])
            .assertSuccess(assert_1.strict);
        return { tokenAccount, edition, editionBump: edition.bump, mint, metadata };
    });
}
exports.mintNFT = mintNFT;
