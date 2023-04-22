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
exports.initSellingResource = void 0;
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("../../src/utils");
const utils_2 = require("../utils");
const createTokenAccount_1 = require("../transactions/createTokenAccount");
const mintNft_1 = require("./mintNft");
const instructions_1 = require("../../src/generated/instructions");
const transactions_1 = require("../transactions");
const initSellingResource = ({ test, transactionHandler, payer, connection, store, maxSupply, }) => __awaiter(void 0, void 0, void 0, function* () {
    const secondaryCreator = {
        address: payer.publicKey,
        share: 100,
        verified: true,
    };
    const { edition: masterEdition, editionBump: masterEditionBump, tokenAccount: resourceToken, mint: resourceMint, metadata, } = yield (0, mintNft_1.mintNFT)({
        transactionHandler,
        payer,
        connection,
        creators: [secondaryCreator],
    });
    const [vaultOwner, vaultOwnerBump] = yield (0, utils_1.findVaultOwnerAddress)(resourceMint.publicKey, store);
    const { tokenAccount: vault, createTokenTx } = yield (0, createTokenAccount_1.createTokenAccount)({
        payer: payer.publicKey,
        mint: resourceMint.publicKey,
        connection,
        owner: vaultOwner,
    });
    yield transactionHandler.sendAndConfirmTransaction(createTokenTx, [vault]).assertSuccess(test);
    const sellingResource = web3_js_1.Keypair.generate();
    const initSellingResourceInstruction = (0, instructions_1.createInitSellingResourceInstruction)({
        store,
        admin: payer.publicKey,
        sellingResource: sellingResource.publicKey,
        sellingResourceOwner: payer.publicKey,
        metadata,
        masterEdition,
        resourceMint: resourceMint.publicKey,
        resourceToken: resourceToken.publicKey,
        vault: vault.publicKey,
        owner: vaultOwner,
    }, {
        masterEditionBump,
        vaultOwnerBump,
        maxSupply,
    });
    const primaryCreator = {
        address: payer.publicKey,
        share: 100,
        verified: false,
    };
    const { savePrimaryMetadataCreatorsInstruction, primaryMetadataCreators } = yield (0, transactions_1.createSavePrimaryMetadataCreators)({
        transactionHandler,
        payer,
        connection,
        metadata,
        creators: [primaryCreator],
    });
    (0, utils_2.logDebug)(`primary metadata creators ${primaryMetadataCreators}`);
    const initSellingResourceTx = yield (0, utils_2.createAndSignTransaction)(connection, payer, [initSellingResourceInstruction, savePrimaryMetadataCreatorsInstruction], [sellingResource]);
    yield transactionHandler
        .sendAndConfirmTransaction(initSellingResourceTx, [sellingResource])
        .assertSuccess(test);
    (0, utils_2.logDebug)(`selling-resource: ${sellingResource.publicKey}`);
    return {
        sellingResource,
        vault,
        vaultOwner,
        vaultOwnerBump,
        resourceMint,
        metadata,
        primaryMetadataCreators: [primaryMetadataCreators],
    };
});
exports.initSellingResource = initSellingResource;
