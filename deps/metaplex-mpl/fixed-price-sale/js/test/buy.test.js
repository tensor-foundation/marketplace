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
const src_1 = require("../src");
const verifyCollection_1 = require("./actions/verifyCollection");
const js_1 = require("@metaplex-foundation/js");
(0, utils_2.killStuckProcess)();
(0, tape_1.default)('buy: successful purchase without gating', (t) => __awaiter(void 0, void 0, void 0, function* () {
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
        // No gating
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
    const { mint: newMint, mintAta } = yield (0, actions_1.mintTokenToAccount)({
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
        newTokenAccount: mintAta.publicKey,
    });
    yield transactionHandler.sendAndConfirmTransaction(buyTx, [payer]).assertSuccess(t);
    (0, utils_2.logDebug)('buy:: successful purchase');
}));
(0, tape_1.default)('buy: successful purchase with gating', (t) => __awaiter(void 0, void 0, void 0, function* () {
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
    // Create collection
    const { mint: collectionMint, metadata: collectionMetadata, edition: collectionMasterEditionAccount, } = yield (0, actions_1.mintNFT)({
        transactionHandler,
        payer,
        connection,
        maxSupply: 0,
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
        // Assign gating to market to use collection
        gatingConfig: {
            collection: collectionMint.publicKey,
            expireOnUse: true,
            gatingTime: null,
        },
    };
    const { market, treasuryHolder } = yield (0, actions_1.createMarket)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        sellingResource: sellingResource.publicKey,
        treasuryMint: treasuryMint.publicKey,
        collectionMint: collectionMint.publicKey,
        params,
    });
    const [tradeHistory, tradeHistoryBump] = yield (0, utils_1.findTradeHistoryAddress)(payer.publicKey, market.publicKey);
    const { mint: newMint, mintAta } = yield (0, actions_1.mintTokenToAccount)({
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
    // Create NFT from collection
    const { mint: userCollectionTokenMint, tokenAccount: userCollectionTokenAcc, metadata: userCollectionMetadata, } = yield (0, actions_1.mintNFT)({
        transactionHandler,
        payer,
        connection,
        collectionMint: collectionMint.publicKey,
    });
    yield (0, verifyCollection_1.verifyCollection)({
        transactionHandler,
        connection,
        payer,
        metadata: userCollectionMetadata,
        collectionAuthority: payer.publicKey,
        collection: collectionMetadata,
        collectionMint: collectionMint.publicKey,
        collectionMasterEditionAccount,
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
        newTokenAccount: mintAta.publicKey,
        additionalKeys: [
            {
                pubkey: userCollectionTokenAcc.publicKey,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: userCollectionTokenMint.publicKey,
                isSigner: false,
                isWritable: true,
            },
            {
                pubkey: userCollectionMetadata,
                isSigner: false,
                isWritable: false,
            },
        ],
    });
    yield transactionHandler.sendAndConfirmTransaction(buyTx, [payer]).assertSuccess(t);
    (0, utils_2.logDebug)('buy:: successful purchase');
}));
(0, tape_1.default)('buy: unsuccessful purchase with gating', (t) => __awaiter(void 0, void 0, void 0, function* () {
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
    // Create collection
    const { mint: collectionMint } = yield (0, actions_1.mintNFT)({
        transactionHandler,
        payer,
        connection,
        maxSupply: 0,
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
        // Assign gating to market to use collection
        gatingConfig: {
            collection: collectionMint.publicKey,
            expireOnUse: true,
            gatingTime: null,
        },
    };
    const { market, treasuryHolder } = yield (0, actions_1.createMarket)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        sellingResource: sellingResource.publicKey,
        treasuryMint: treasuryMint.publicKey,
        collectionMint: collectionMint.publicKey,
        params,
    });
    const [tradeHistory, tradeHistoryBump] = yield (0, utils_1.findTradeHistoryAddress)(payer.publicKey, market.publicKey);
    const { mint: newMint, mintAta } = yield (0, actions_1.mintTokenToAccount)({
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
        newTokenAccount: mintAta.publicKey,
        // User doesn't have gating token
    });
    yield transactionHandler
        .sendAndConfirmTransaction(buyTx, [payer])
        .assertError(t, src_1.GatingTokenMissingError);
}));
