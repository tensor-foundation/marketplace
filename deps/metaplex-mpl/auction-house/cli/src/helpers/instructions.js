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
exports.createCandyMachineV2Account = exports.createUpdateMetadataInstruction = exports.createAssociatedTokenAccountInstruction = void 0;
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("./constants");
const anchor = __importStar(require("@project-serum/anchor"));
function createAssociatedTokenAccountInstruction(associatedTokenAddress, payer, walletAddress, splTokenMintAddress) {
    const keys = [
        {
            pubkey: payer,
            isSigner: true,
            isWritable: true,
        },
        {
            pubkey: associatedTokenAddress,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: walletAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: splTokenMintAddress,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: constants_1.TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        },
        {
            pubkey: web3_js_1.SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: constants_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
        data: Buffer.from([]),
    });
}
exports.createAssociatedTokenAccountInstruction = createAssociatedTokenAccountInstruction;
function createUpdateMetadataInstruction(metadataAccount, payer, txnData) {
    const keys = [
        {
            pubkey: metadataAccount,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: payer,
            isSigner: true,
            isWritable: false,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: constants_1.TOKEN_METADATA_PROGRAM_ID,
        data: txnData,
    });
}
exports.createUpdateMetadataInstruction = createUpdateMetadataInstruction;
function createCandyMachineV2Account(anchorProgram, candyData, payerWallet, candyAccount) {
    return __awaiter(this, void 0, void 0, function* () {
        const size = constants_1.CONFIG_ARRAY_START_V2 +
            (candyData.hiddenSettings
                ? 0
                : 4 +
                    candyData.itemsAvailable.toNumber() * constants_1.CONFIG_LINE_SIZE_V2 +
                    8 +
                    2 * (Math.floor(candyData.itemsAvailable.toNumber() / 8) + 1));
        return anchor.web3.SystemProgram.createAccount({
            fromPubkey: payerWallet,
            newAccountPubkey: candyAccount,
            space: size,
            lamports: yield anchorProgram.provider.connection.getMinimumBalanceForRentExemption(size),
            programId: constants_1.CANDY_MACHINE_PROGRAM_V2_ID,
        });
    });
}
exports.createCandyMachineV2Account = createCandyMachineV2Account;
