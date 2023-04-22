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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCollection = void 0;
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore createMintToInstruction export actually exist but isn't setup correctly
const assert_1 = require("assert");
const utils_1 = require("../utils");
function verifyCollection(_a) {
    var { transactionHandler, connection, payer } = _a, params = __rest(_a, ["transactionHandler", "connection", "payer"]);
    return __awaiter(this, void 0, void 0, function* () {
        const verifyCollectionInstruction = (0, mpl_token_metadata_1.createVerifyCollectionInstruction)(Object.assign({ payer: payer.publicKey }, params));
        const verifyCollectionTx = yield (0, utils_1.createAndSignTransaction)(connection, payer, [verifyCollectionInstruction], [payer]);
        yield transactionHandler.sendAndConfirmTransaction(verifyCollectionTx, []).assertSuccess(assert_1.strict);
    });
}
exports.verifyCollection = verifyCollection;
