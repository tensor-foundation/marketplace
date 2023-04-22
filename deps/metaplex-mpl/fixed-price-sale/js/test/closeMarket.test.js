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
const actions_1 = require("./actions");
const utils_1 = require("./utils");
const transactions_1 = require("./transactions");
const src_1 = require("../src");
(0, utils_1.killStuckProcess)();
// TODO: This test is flaky and attempting to fix via sleep is not working.
// It needs to be fixed properly and reenabled ASAP
tape_1.default.skip('close-market: success', (t) => __awaiter(void 0, void 0, void 0, function* () {
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
    const { sellingResource } = yield (0, actions_1.initSellingResource)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        maxSupply: 100,
    });
    const { mint: treasuryMint } = yield (0, actions_1.mintNFT)({
        transactionHandler,
        payer,
        connection,
    });
    const startDate = Math.round(Date.now() / 1000) + 2;
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
    const { market } = yield (0, actions_1.createMarket)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        sellingResource: sellingResource.publicKey,
        treasuryMint: treasuryMint.publicKey,
        params,
    });
    yield (0, utils_1.sleep)(3000);
    const marketTx = yield (0, transactions_1.closeMarket)({
        transactionHandler,
        payer,
        connection,
        market,
    });
    yield transactionHandler.sendAndConfirmTransaction(marketTx, [payer]).assertSuccess(t);
    (0, utils_1.logDebug)(`market: ${market.publicKey}`);
    const marketAccount = yield connection.getAccountInfo(market.publicKey);
    const [marketData] = src_1.Market.deserialize(marketAccount === null || marketAccount === void 0 ? void 0 : marketAccount.data);
    t.assert('Ended' === marketData.state.toString());
}));
(0, tape_1.default)('close-market: should fail when the market has the specific endDate', (t) => __awaiter(void 0, void 0, void 0, function* () {
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
    const { sellingResource } = yield (0, actions_1.initSellingResource)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        maxSupply: 100,
    });
    const { mint: treasuryMint } = yield (0, actions_1.mintNFT)({
        transactionHandler,
        payer,
        connection,
    });
    const startDate = Math.round(Date.now() / 1000) + 2;
    const params = {
        name: 'Market',
        description: '',
        startDate,
        endDate: startDate + 4000,
        mutable: true,
        price: 1,
        piecesInOneWallet: 1,
        gatingConfig: null,
    };
    const { market } = yield (0, actions_1.createMarket)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        sellingResource: sellingResource.publicKey,
        treasuryMint: treasuryMint.publicKey,
        params,
    });
    yield (0, utils_1.sleep)(3000);
    const marketTx = yield (0, transactions_1.closeMarket)({
        transactionHandler,
        payer,
        connection,
        market,
    });
    (0, utils_1.logDebug)(`market: ${market.publicKey}`);
    yield transactionHandler
        .sendAndConfirmTransaction(marketTx, [payer])
        .assertError(t, src_1.MarketDurationIsNotUnlimitedError);
    (0, utils_1.logDebug)('expected transaction to fail due to limited market duration ');
}));
