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
exports.createAndSignTransaction = void 0;
const web3_js_1 = require("@solana/web3.js");
function createAndSignTransaction(connection, payer, instructions, signers) {
    return __awaiter(this, void 0, void 0, function* () {
        const tx = new web3_js_1.Transaction();
        tx.add(...instructions);
        tx.recentBlockhash = (yield connection.getRecentBlockhash()).blockhash;
        tx.feePayer = payer.publicKey;
        tx.partialSign(...signers);
        return tx;
    });
}
exports.createAndSignTransaction = createAndSignTransaction;
