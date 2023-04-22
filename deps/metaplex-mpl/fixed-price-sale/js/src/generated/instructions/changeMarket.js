"use strict";
/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChangeMarketInstruction = exports.changeMarketInstructionDiscriminator = exports.changeMarketStruct = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
/**
 * @category Instructions
 * @category ChangeMarket
 * @category generated
 */
exports.changeMarketStruct = new beet.FixableBeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['newName', beet.coption(beet.utf8String)],
    ['newDescription', beet.coption(beet.utf8String)],
    ['mutable', beet.coption(beet.bool)],
    ['newPrice', beet.coption(beet.u64)],
    ['newPiecesInOneWallet', beet.coption(beet.u64)],
], 'ChangeMarketInstructionArgs');
exports.changeMarketInstructionDiscriminator = [130, 59, 109, 101, 85, 226, 37, 88];
/**
 * Creates a _ChangeMarket_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category ChangeMarket
 * @category generated
 */
function createChangeMarketInstruction(accounts, args, programId = new web3.PublicKey('SaLeTjyUa5wXHnGuewUSyJ5JWZaHwz3TxqUntCE9czo')) {
    const [data] = exports.changeMarketStruct.serialize(Object.assign({ instructionDiscriminator: exports.changeMarketInstructionDiscriminator }, args));
    const keys = [
        {
            pubkey: accounts.market,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.owner,
            isWritable: false,
            isSigner: true,
        },
        {
            pubkey: accounts.clock,
            isWritable: false,
            isSigner: false,
        },
    ];
    if (accounts.anchorRemainingAccounts != null) {
        for (const acc of accounts.anchorRemainingAccounts) {
            keys.push(acc);
        }
    }
    const ix = new web3.TransactionInstruction({
        programId,
        keys,
        data,
    });
    return ix;
}
exports.createChangeMarketInstruction = createChangeMarketInstruction;
