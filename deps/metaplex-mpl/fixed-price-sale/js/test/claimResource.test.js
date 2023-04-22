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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore these exports actually exist but aren't setup correctly
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("../src/utils");
const actions_1 = require("./actions");
const transactions_1 = require("./transactions");
const utils_2 = require("./utils");
const src_1 = require("../src");
const js_1 = require("@metaplex-foundation/js");
(0, utils_2.killStuckProcess)();
(0, tape_1.default)('claim resource: success', (t) => __awaiter(void 0, void 0, void 0, function* () {
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
    const { sellingResource, vault, vaultOwner, vaultOwnerBump, resourceMint, primaryMetadataCreators, } = yield (0, actions_1.initSellingResource)({
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
    const startDate = Math.round(Date.now() / 1000) + 1;
    const params = {
        name: 'Market',
        description: '',
        startDate,
        endDate: null,
        mutable: true,
        price: 0.001,
        piecesInOneWallet: 1,
        gatingConfig: null,
    };
    const { market, treasuryHolder, treasuryOwnerBump, treasuryOwner } = yield (0, actions_1.createMarket)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        sellingResource: sellingResource.publicKey,
        treasuryMint: treasuryMint.publicKey,
        params,
    });
    yield (0, utils_2.sleep)(3000);
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
    yield (0, utils_2.sleep)(3000);
    const marketTx = yield (0, transactions_1.closeMarket)({
        transactionHandler,
        payer,
        connection,
        market,
    });
    yield transactionHandler.sendAndConfirmTransaction(marketTx, [payer]).assertSuccess(t);
    (0, utils_2.logDebug)(`market: ${market.publicKey}`);
    const [payoutTicket, payoutTicketBump] = yield (0, utils_1.findPayoutTicketAddress)(market.publicKey, payer.publicKey);
    const destination = yield (0, spl_token_1.getAssociatedTokenAddress)(treasuryMint.publicKey, payer.publicKey);
    const metadata = yield pdas.metadata({ mint: resourceMint.publicKey });
    const withdrawTx = yield (0, transactions_1.createWithdrawTransaction)({
        connection,
        payer,
        market: market.publicKey,
        sellingResource: sellingResource.publicKey,
        metadata,
        treasuryHolder: treasuryHolder.publicKey,
        treasuryMint: treasuryMint.publicKey,
        destination,
        payoutTicket,
        payoutTicketBump,
        treasuryOwnerBump,
        treasuryOwner,
        primaryMetadataCreators,
    });
    yield transactionHandler.sendAndConfirmTransaction(withdrawTx, [payer]).assertSuccess(t);
    const { tokenAccount: claimToken, createTokenTx } = yield (0, transactions_1.createTokenAccount)({
        payer: payer.publicKey,
        mint: resourceMint.publicKey,
        connection,
    });
    yield transactionHandler.sendAndConfirmTransaction(createTokenTx, [claimToken]).assertSuccess(t);
    const claimResourceTx = yield (0, transactions_1.createClaimResourceTransaction)({
        connection,
        payer,
        market: market.publicKey,
        sellingResource: sellingResource.publicKey,
        metadata,
        treasuryHolder: treasuryHolder.publicKey,
        destination: claimToken.publicKey,
        vault: vault.publicKey,
        vaultOwnerBump,
        owner: vaultOwner,
    });
    yield transactionHandler.sendAndConfirmTransaction(claimResourceTx, [payer]).assertSuccess(t);
    const createdToken = yield (0, spl_token_1.getAccount)(connection, claimToken.publicKey);
    t.assert(createdToken.mint.toBase58() === resourceMint.publicKey.toBase58());
    t.assert(createdToken.owner.toBase58() === payer.publicKey.toBase58());
}));
(0, tape_1.default)('claim resource:  should fail due to the treasury not empty', (t) => __awaiter(void 0, void 0, void 0, function* () {
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
    const startDate = Math.round(Date.now() / 1000) + 1;
    const params = {
        name: 'Market',
        description: '',
        startDate,
        endDate: null,
        mutable: true,
        price: 1,
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
    yield (0, utils_2.sleep)(3000);
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
    yield (0, utils_2.sleep)(3000);
    const marketTx = yield (0, transactions_1.closeMarket)({
        transactionHandler,
        payer,
        connection,
        market,
    });
    yield transactionHandler.sendAndConfirmTransaction(marketTx, [payer]).assertSuccess(t);
    (0, utils_2.logDebug)(`market: ${market.publicKey}`);
    const metadata = yield pdas.metadata({ mint: resourceMint.publicKey });
    const { tokenAccount: claimToken, createTokenTx } = yield (0, transactions_1.createTokenAccount)({
        payer: payer.publicKey,
        mint: resourceMint.publicKey,
        connection,
    });
    yield transactionHandler.sendAndConfirmTransaction(createTokenTx, [claimToken]).assertSuccess(t);
    const claimResourceTx = yield (0, transactions_1.createClaimResourceTransaction)({
        connection,
        payer,
        market: market.publicKey,
        sellingResource: sellingResource.publicKey,
        metadata,
        treasuryHolder: treasuryHolder.publicKey,
        destination: claimToken.publicKey,
        vault: vault.publicKey,
        vaultOwnerBump,
        owner: vaultOwner,
    });
    yield transactionHandler
        .sendAndConfirmTransaction(claimResourceTx, [payer])
        .assertError(t, src_1.TreasuryIsNotEmptyError);
    (0, utils_2.logDebug)(`expected transaction to fail due to 'treasury not empty'`);
}));
