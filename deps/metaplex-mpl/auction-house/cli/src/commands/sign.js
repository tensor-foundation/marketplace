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
exports.signMetadataInstruction = exports.signMetadata = void 0;
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("../helpers/constants");
const transactions_1 = require("../helpers/transactions");
const accounts_1 = require("../helpers/accounts");
const METADATA_SIGNATURE = Buffer.from([7]); //now thats some voodoo magic. WTF metaplex? XD
function signMetadata(metadata, keypair, env, rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const creatorKeyPair = (0, accounts_1.loadWalletKey)(keypair);
        const anchorProgram = yield (0, accounts_1.loadCandyProgram)(creatorKeyPair, env, rpcUrl);
        yield signWithRetry(anchorProgram, creatorKeyPair, new web3_js_1.PublicKey(metadata));
    });
}
exports.signMetadata = signMetadata;
function signWithRetry(anchorProgram, creatorKeyPair, metadataAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(anchorProgram.provider.connection, creatorKeyPair, [
            signMetadataInstruction(new web3_js_1.PublicKey(metadataAddress), creatorKeyPair.publicKey),
        ], [], 'single');
    });
}
function signMetadataInstruction(metadata, creator) {
    const data = METADATA_SIGNATURE;
    const keys = [
        {
            pubkey: metadata,
            isSigner: false,
            isWritable: true,
        },
        {
            pubkey: creator,
            isSigner: true,
            isWritable: false,
        },
    ];
    return new web3_js_1.TransactionInstruction({
        keys,
        programId: constants_1.TOKEN_METADATA_PROGRAM_ID,
        data,
    });
}
exports.signMetadataInstruction = signMetadataInstruction;
