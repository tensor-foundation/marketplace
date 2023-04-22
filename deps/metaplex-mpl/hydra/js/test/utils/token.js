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
exports.TokenUtils = void 0;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const chai_1 = require("chai");
class TokenUtils {
    constructor(provider) {
        this.provider = provider;
    }
    expectBalance(account, balance) {
        return __awaiter(this, void 0, void 0, function* () {
            const actual = yield this.provider.connection.getTokenAccountBalance(account);
            (0, chai_1.expect)(actual.value.uiAmount).to.equal(balance);
        });
    }
    expectBalanceWithin(account, balance, precision) {
        return __awaiter(this, void 0, void 0, function* () {
            const actual = yield this.provider.connection.getTokenAccountBalance(account);
            (0, chai_1.expect)(actual.value.uiAmount).to.within(balance, precision);
        });
    }
    expectAtaBalance(account, mint, balance) {
        return __awaiter(this, void 0, void 0, function* () {
            const ata = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, account);
            return this.expectBalance(ata, balance);
        });
    }
    createWrappedNativeAccount(provider, amount, wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            const newAccount = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.NATIVE_MINT, wallet);
            const transaction = new web3_js_1.Transaction();
            if (!(yield provider.connection.getAccountInfo(newAccount))) {
                transaction.add(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.NATIVE_MINT, newAccount, wallet, wallet));
            }
            // Send lamports to it (these will be wrapped into native tokens by the token program)
            transaction.add(web3_js_1.SystemProgram.transfer({
                fromPubkey: wallet,
                toPubkey: newAccount,
                lamports: amount,
            }));
            // Assign the new account to the native token mint.
            // the account will be initialized with a balance equal to the native token balance.
            // (i.e. amount)
            // transaction.add(Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, NATIVE_MINT, newAccount.publicKey, provider.wallet.publicKey)); // Send the three instructions
            yield provider.send(transaction);
            return newAccount;
        });
    }
    mintTo(mint, amount, destination, wallet) {
        return __awaiter(this, void 0, void 0, function* () {
            const mintTx = new web3_js_1.Transaction();
            mintTx.add(spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint, destination, wallet, [], amount));
            yield this.provider.send(mintTx);
        });
    }
    sendTokens(provider, mint, to, amount, owner, payer) {
        return __awaiter(this, void 0, void 0, function* () {
            const source = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, owner);
            const ata = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, to);
            const tx = new web3_js_1.Transaction({ feePayer: payer });
            if (!(yield provider.connection.getAccountInfo(ata))) {
                tx.add(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, ata, to, payer));
            }
            tx.add(spl_token_1.Token.createTransferInstruction(spl_token_1.TOKEN_PROGRAM_ID, source, ata, owner, [], amount));
            yield provider.send(tx);
            return ata;
        });
    }
    createAtaAndMint(provider, mint, amount, to, authority, payer) {
        return __awaiter(this, void 0, void 0, function* () {
            const ata = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, to);
            const mintTx = new web3_js_1.Transaction({ feePayer: payer });
            if (!(yield provider.connection.getAccountInfo(ata))) {
                mintTx.add(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint, ata, to, payer));
            }
            mintTx.add(spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint, ata, authority, [], amount));
            yield provider.send(mintTx);
            return ata;
        });
    }
}
exports.TokenUtils = TokenUtils;
