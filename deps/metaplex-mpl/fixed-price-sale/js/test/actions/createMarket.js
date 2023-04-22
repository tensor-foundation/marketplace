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
exports.createMarket = void 0;
const web3_js_1 = require("@solana/web3.js");
const transactions_1 = require("../transactions");
const utils_1 = require("../utils");
const utils_2 = require("../../src/utils");
const instructions_1 = require("../../src/generated/instructions");
const createMarket = ({ test, transactionHandler, payer, connection, store, sellingResource, treasuryMint, collectionMint, params, }) => __awaiter(void 0, void 0, void 0, function* () {
    const [treasuryOwner, treasuryOwnerBump] = yield (0, utils_2.findTreasuryOwnerAddress)(treasuryMint, sellingResource);
    (0, utils_1.logDebug)(`treasuryOwner: ${treasuryOwner.toBase58()}`);
    const { tokenAccount: treasuryHolder, createTokenTx } = yield (0, transactions_1.createTokenAccount)({
        payer: payer.publicKey,
        connection,
        mint: treasuryMint,
        owner: treasuryOwner,
    });
    yield transactionHandler
        .sendAndConfirmTransaction(createTokenTx, [treasuryHolder])
        .assertSuccess(test);
    (0, utils_1.logDebug)(`treasuryHolder: ${treasuryHolder.publicKey}`);
    const market = web3_js_1.Keypair.generate();
    const remainingAccounts = [];
    if (collectionMint) {
        remainingAccounts.push({ pubkey: collectionMint, isWritable: true, isSigner: false });
    }
    const instruction = (0, instructions_1.createCreateMarketInstruction)({
        market: market.publicKey,
        store,
        sellingResourceOwner: payer.publicKey,
        sellingResource,
        mint: treasuryMint,
        treasuryHolder: treasuryHolder.publicKey,
        owner: treasuryOwner,
        anchorRemainingAccounts: remainingAccounts,
    }, Object.assign({ treasuryOwnerBump }, params));
    const marketTx = yield (0, utils_1.createAndSignTransaction)(connection, payer, [instruction], [market]);
    yield transactionHandler.sendAndConfirmTransaction(marketTx, [market]).assertSuccess(test);
    (0, utils_1.logDebug)(`market: ${market.publicKey}`);
    return { market, treasuryHolder, treasuryOwnerBump, treasuryOwner };
});
exports.createMarket = createMarket;
