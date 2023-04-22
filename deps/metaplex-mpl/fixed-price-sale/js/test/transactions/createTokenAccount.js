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
exports.createTokenAccount = void 0;
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const createTokenAccount = ({ payer, mint, connection, owner, }) => __awaiter(void 0, void 0, void 0, function* () {
    const tokenAccount = web3_js_1.Keypair.generate();
    const createTokenTx = new web3_js_1.Transaction();
    const accountRentExempt = yield connection.getMinimumBalanceForRentExemption(spl_token_1.AccountLayout.span);
    createTokenTx.add(web3_js_1.SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: tokenAccount.publicKey,
        lamports: accountRentExempt,
        space: spl_token_1.AccountLayout.span,
        programId: new web3_js_1.PublicKey(spl_token_1.TOKEN_PROGRAM_ID),
    }));
    createTokenTx.add((0, spl_token_1.createInitializeAccountInstruction)(tokenAccount.publicKey, mint, owner !== null && owner !== void 0 ? owner : payer));
    createTokenTx.recentBlockhash = (yield connection.getRecentBlockhash()).blockhash;
    createTokenTx.feePayer = payer;
    createTokenTx.partialSign(tokenAccount);
    return {
        tokenAccount,
        createTokenTx,
    };
});
exports.createTokenAccount = createTokenAccount;
