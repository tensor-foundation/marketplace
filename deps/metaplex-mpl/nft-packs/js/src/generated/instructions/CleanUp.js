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
exports.createCleanUpInstruction = exports.cleanUpInstructionDiscriminator = exports.CleanUpStruct = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
/**
 * @category Instructions
 * @category CleanUp
 * @category generated
 */
exports.CleanUpStruct = new beet.BeetArgsStruct([['instructionDiscriminator', beet.u8]], 'CleanUpInstructionArgs');
exports.cleanUpInstructionDiscriminator = 13;
/**
 * Creates a _CleanUp_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category CleanUp
 * @category generated
 */
function createCleanUpInstruction(accounts, programId = new web3.PublicKey('packFeFNZzMfD9aVWL7QbGz1WcU7R9zpf6pvNsw2BLu')) {
    const [data] = exports.CleanUpStruct.serialize({
        instructionDiscriminator: exports.cleanUpInstructionDiscriminator,
    });
    const keys = [
        {
            pubkey: accounts.packSet,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.packConfig,
            isWritable: true,
            isSigner: false,
        },
    ];
    const ix = new web3.TransactionInstruction({
        programId,
        keys,
        data,
    });
    return ix;
}
exports.createCleanUpInstruction = createCleanUpInstruction;
