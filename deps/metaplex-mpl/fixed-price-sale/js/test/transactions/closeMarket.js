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
exports.closeMarket = void 0;
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("../utils");
const instructions_1 = require("../../src/generated/instructions");
const closeMarket = ({ payer, connection, market, }) => __awaiter(void 0, void 0, void 0, function* () {
    const instruction = yield (0, instructions_1.createCloseMarketInstruction)({
        market: market.publicKey,
        owner: payer.publicKey,
        clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
    });
    const marketTx = yield (0, utils_1.createAndSignTransaction)(connection, payer, [instruction], [payer]);
    return marketTx;
});
exports.closeMarket = closeMarket;
