"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.withdrawV2 = exports.withdraw = void 0;
const web3_js_1 = require("@solana/web3.js");
const anchor = __importStar(require("@project-serum/anchor"));
const transactions_1 = require("../helpers/transactions");
function withdraw(anchorProgram, keypair, env, configAddress, lamports, charityAddress, charityPercent) {
    return __awaiter(this, void 0, void 0, function* () {
        const signers = [keypair];
        const instructions = [
            anchorProgram.instruction.withdrawFunds({
                accounts: {
                    config: configAddress,
                    authority: keypair.publicKey,
                },
            }),
        ];
        if (!!charityAddress && charityPercent > 0) {
            const cpf = 100 / charityPercent;
            instructions.push(anchor.web3.SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: new web3_js_1.PublicKey(charityAddress),
                lamports: Math.floor(lamports * cpf),
            }));
        }
        return (yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(anchorProgram.provider.connection, keypair, instructions, signers)).txid;
    });
}
exports.withdraw = withdraw;
function withdrawV2(anchorProgram, keypair, env, candyAddress, lamports, charityAddress, charityPercent) {
    return __awaiter(this, void 0, void 0, function* () {
        const signers = [keypair];
        //TODO: add collection PDA account
        const instructions = [
            anchorProgram.instruction.withdrawFunds({
                accounts: {
                    candyMachine: candyAddress,
                    authority: keypair.publicKey,
                },
            }),
        ];
        if (!!charityAddress && charityPercent > 0) {
            const cpf = 100 / charityPercent;
            instructions.push(anchor.web3.SystemProgram.transfer({
                fromPubkey: keypair.publicKey,
                toPubkey: new web3_js_1.PublicKey(charityAddress),
                lamports: Math.floor(lamports * cpf),
            }));
        }
        return (yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(anchorProgram.provider.connection, keypair, instructions, signers)).txid;
    });
}
exports.withdrawV2 = withdrawV2;
