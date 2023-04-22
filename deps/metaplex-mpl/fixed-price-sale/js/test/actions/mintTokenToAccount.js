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
exports.mintTokenToAccount = void 0;
const web3_js_1 = require("@solana/web3.js");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore createMintToInstruction export actually exist but isn't setup correctly
const spl_token_1 = require("@solana/spl-token");
const assert_1 = require("assert");
const createMintAccount_1 = require("./createMintAccount");
const transactions_1 = require("../transactions");
const mintTokenToAccount = ({ connection, payer, transactionHandler, }) => __awaiter(void 0, void 0, void 0, function* () {
    const tx = new web3_js_1.Transaction();
    const { mint, createMintTx } = yield createMintAccount_1.CreateMint.createMintAccount(connection, payer);
    tx.add(createMintTx);
    const { tokenAccount: associatedTokenAccount, createTokenTx } = yield (0, transactions_1.createTokenAccount)({
        payer,
        mint: mint.publicKey,
        connection,
    });
    tx.add(createTokenTx);
    tx.add((0, spl_token_1.createMintToInstruction)(mint.publicKey, associatedTokenAccount.publicKey, payer, 1));
    yield transactionHandler
        .sendAndConfirmTransaction(tx, [mint, associatedTokenAccount])
        .assertSuccess(assert_1.strict);
    return { mint, mintAta: associatedTokenAccount };
});
exports.mintTokenToAccount = mintTokenToAccount;
