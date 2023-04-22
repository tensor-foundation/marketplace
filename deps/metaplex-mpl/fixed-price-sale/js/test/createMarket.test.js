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
const utils_1 = require("./utils");
const actions_1 = require("./actions");
(0, utils_1.killStuckProcess)();
(0, tape_1.default)('create-market: success', (t) => __awaiter(void 0, void 0, void 0, function* () {
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
    const startDate = Math.round(Date.now() / 1000) + 5;
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
    yield (0, actions_1.createMarket)({
        test: t,
        transactionHandler,
        payer,
        connection,
        store: store.publicKey,
        sellingResource: sellingResource.publicKey,
        treasuryMint: treasuryMint.publicKey,
        params,
    });
}));
