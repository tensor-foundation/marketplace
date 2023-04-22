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
exports.createStore = void 0;
const web3_js_1 = require("@solana/web3.js");
const instructions_1 = require("../../src/generated/instructions");
const utils_1 = require("../utils");
const createStore = ({ test, transactionHandler, payer, connection, params, }) => __awaiter(void 0, void 0, void 0, function* () {
    const store = web3_js_1.Keypair.generate();
    const instruction = (0, instructions_1.createCreateStoreInstruction)({
        store: store.publicKey,
        admin: payer.publicKey,
    }, params);
    const transaction = yield (0, utils_1.createAndSignTransaction)(connection, payer, [instruction], [store]);
    yield transactionHandler.sendAndConfirmTransaction(transaction, [store]).assertSuccess(test);
    (0, utils_1.logDebug)(`store: ${store.publicKey}`);
    return store;
});
exports.createStore = createStore;
