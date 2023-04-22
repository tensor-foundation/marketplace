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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const utils_1 = require("../src/utils");
const transactions_1 = require("./transactions");
const utils_2 = require("./utils");
const actions_1 = require("./actions");
const spl_token_1 = require("@solana/spl-token");
const js_1 = require("@metaplex-foundation/js");
(0, utils_2.killStuckProcess)();
(0, tape_1.default)('validate: successful purchase and validation', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const { payer, connection, transactionHandler } = yield (0, actions_1.createPrerequisites)();
    const store = yield (0, actions_1.createStore)({
        test: t,
        transactionHandler,
        payer,
        connection,
        params: {
            name: 'Store',
            description: 'Description',
        },
    });
    const { sellingResource, vault, vaultOwner, vaultOwnerBump, resourceMint } = yield (0, actions_1.initSellingResource)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        maxSupply: 100,
    });
    const { mint: treasuryMint, tokenAccount: userTokenAcc } = yield (0, actions_1.mintNFT)({
        transactionHandler,
        payer,
        connection,
    });
    const startDate = Math.round(Date.now() / 1000);
    const params = {
        name: 'Market',
        description: '',
        startDate,
        endDate: startDate + 5 * 20,
        mutable: true,
        price: 0.001,
        piecesInOneWallet: 1,
        gatingConfig: null,
    };
    const { market, treasuryHolder } = yield (0, actions_1.createMarket)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        sellingResource: sellingResource.publicKey,
        treasuryMint: treasuryMint.publicKey,
        params,
    });
    const [tradeHistory, tradeHistoryBump] = yield (0, utils_1.findTradeHistoryAddress)(payer.publicKey, market.publicKey);
    const { mint: newMint, mintAta: newMintAta } = yield (0, actions_1.mintTokenToAccount)({
        connection,
        payer: payer.publicKey,
        transactionHandler,
    });
    (0, utils_2.logDebug)('new mint', newMint.publicKey.toBase58());
    const metaplex = js_1.Metaplex.make(connection);
    const pdas = metaplex.nfts().pdas();
    const newMintEdition = pdas.edition({ mint: newMint.publicKey });
    const newMintMetadata = pdas.metadata({ mint: newMint.publicKey });
    const resourceMintMasterEdition = pdas.edition({ mint: resourceMint.publicKey });
    const resourceMintMetadata = pdas.metadata({ mint: resourceMint.publicKey });
    const resourceMintEditionMarker = pdas.editionMarker({
        mint: resourceMint.publicKey,
        edition: (0, js_1.toBigNumber)(1),
    });
    yield (0, utils_2.sleep)(1000);
    const { tx: buyTx } = yield (0, transactions_1.createBuyTransaction)({
        connection,
        buyer: payer.publicKey,
        userTokenAccount: userTokenAcc.publicKey,
        resourceMintMetadata,
        resourceMintEditionMarker,
        resourceMintMasterEdition,
        sellingResource: sellingResource.publicKey,
        market: market.publicKey,
        marketTreasuryHolder: treasuryHolder.publicKey,
        vaultOwner,
        tradeHistory,
        tradeHistoryBump,
        vault: vault.publicKey,
        vaultOwnerBump,
        newMint: newMint.publicKey,
        newMintEdition,
        newMintMetadata,
        newTokenAccount: newMintAta.publicKey,
    });
    yield transactionHandler.sendAndConfirmTransaction(buyTx, [payer]).assertSuccess(t);
    (0, utils_2.logDebug)('validate: successful purchase');
    console.log(resourceMintMasterEdition.toString(), userTokenAcc.publicKey.toString());
    const ta = yield (0, spl_token_1.getAccount)(connection, newMintAta.publicKey);
    const result = yield (0, utils_1.validateMembershipToken)(connection, resourceMintMasterEdition, ta);
    (0, utils_2.logDebug)('validate: copy is valid');
    t.equal(result, true);
}));
(0, tape_1.default)('validate: successful purchase and failed validation', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const { payer, connection, transactionHandler } = yield (0, actions_1.createPrerequisites)();
    const store = yield (0, actions_1.createStore)({
        test: t,
        transactionHandler,
        payer,
        connection,
        params: {
            name: 'Store',
            description: 'Description',
        },
    });
    const { sellingResource, vault, vaultOwner, vaultOwnerBump, resourceMint } = yield (0, actions_1.initSellingResource)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        maxSupply: 100,
    });
    const { mint: treasuryMint, tokenAccount: userTokenAcc } = yield (0, actions_1.mintNFT)({
        transactionHandler,
        payer,
        connection,
    });
    const startDate = Math.round(Date.now() / 1000);
    const params = {
        name: 'Market',
        description: '',
        startDate,
        endDate: startDate + 5 * 20,
        mutable: true,
        price: 0.001,
        piecesInOneWallet: 1,
        gatingConfig: null,
    };
    const { market, treasuryHolder } = yield (0, actions_1.createMarket)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        sellingResource: sellingResource.publicKey,
        treasuryMint: treasuryMint.publicKey,
        params,
    });
    const [tradeHistory, tradeHistoryBump] = yield (0, utils_1.findTradeHistoryAddress)(payer.publicKey, market.publicKey);
    const { mint: newMint, mintAta: newMintAta } = yield (0, actions_1.mintTokenToAccount)({
        connection,
        payer: payer.publicKey,
        transactionHandler,
    });
    (0, utils_2.logDebug)('new mint', newMint.publicKey.toBase58());
    const metaplex = js_1.Metaplex.make(connection);
    const pdas = metaplex.nfts().pdas();
    const newMintEdition = pdas.edition({ mint: newMint.publicKey });
    const newMintMetadata = pdas.metadata({ mint: newMint.publicKey });
    const resourceMintMasterEdition = pdas.edition({ mint: resourceMint.publicKey });
    const resourceMintMetadata = pdas.metadata({ mint: resourceMint.publicKey });
    const resourceMintEditionMarker = pdas.editionMarker({
        mint: resourceMint.publicKey,
        edition: (0, js_1.toBigNumber)(1),
    });
    yield (0, utils_2.sleep)(1000);
    const { tx: buyTx } = yield (0, transactions_1.createBuyTransaction)({
        connection,
        buyer: payer.publicKey,
        userTokenAccount: userTokenAcc.publicKey,
        resourceMintMetadata,
        resourceMintEditionMarker,
        resourceMintMasterEdition,
        sellingResource: sellingResource.publicKey,
        market: market.publicKey,
        marketTreasuryHolder: treasuryHolder.publicKey,
        vaultOwner,
        tradeHistory,
        tradeHistoryBump,
        vault: vault.publicKey,
        vaultOwnerBump,
        newMint: newMint.publicKey,
        newMintEdition,
        newMintMetadata,
        newTokenAccount: newMintAta.publicKey,
    });
    yield transactionHandler.sendAndConfirmTransaction(buyTx, [payer]).assertSuccess(t);
    (0, utils_2.logDebug)('validate: successful purchase');
    const { edition: masterEdition } = yield (0, actions_1.mintNFT)({
        transactionHandler,
        payer,
        connection,
    });
    const ta = yield (0, spl_token_1.getAccount)(connection, newMintAta.publicKey);
    const result = yield (0, utils_1.validateMembershipToken)(connection, masterEdition, ta);
    (0, utils_2.logDebug)('validate: copy is invalid');
    t.equal(result, false);
}));
