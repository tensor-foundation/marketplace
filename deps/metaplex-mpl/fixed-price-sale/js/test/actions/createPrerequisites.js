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
exports.createPrerequisites = void 0;
const web3_js_1 = require("@solana/web3.js");
const amman_client_1 = require("@metaplex-foundation/amman-client");
const utils_1 = require("../utils");
const src_1 = require("../../src");
const createPrerequisites = () => __awaiter(void 0, void 0, void 0, function* () {
    const payer = web3_js_1.Keypair.generate();
    const connection = new web3_js_1.Connection(utils_1.connectionURL, 'confirmed');
    const amman = yield amman_client_1.Amman.instance({ errorResolver: src_1.cusper });
    yield amman.airdrop(connection, payer.publicKey, 30);
    return {
        payer,
        connection,
        transactionHandler: amman.payerTransactionHandler(connection, payer),
    };
});
exports.createPrerequisites = createPrerequisites;
