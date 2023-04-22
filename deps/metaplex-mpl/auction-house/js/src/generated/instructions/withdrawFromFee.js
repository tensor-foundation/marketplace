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
exports.createWithdrawFromFeeInstruction = exports.withdrawFromFeeInstructionDiscriminator = exports.withdrawFromFeeStruct = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
/**
 * @category Instructions
 * @category WithdrawFromFee
 * @category generated
 */
exports.withdrawFromFeeStruct = new beet.BeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['amount', beet.u64],
], 'WithdrawFromFeeInstructionArgs');
exports.withdrawFromFeeInstructionDiscriminator = [179, 208, 190, 154, 32, 179, 19, 59];
/**
 * Creates a _WithdrawFromFee_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category WithdrawFromFee
 * @category generated
 */
function createWithdrawFromFeeInstruction(accounts, args, programId = new web3.PublicKey('hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk')) {
    var _a;
    const [data] = exports.withdrawFromFeeStruct.serialize(Object.assign({ instructionDiscriminator: exports.withdrawFromFeeInstructionDiscriminator }, args));
    const keys = [
        {
            pubkey: accounts.authority,
            isWritable: false,
            isSigner: true,
        },
        {
            pubkey: accounts.feeWithdrawalDestination,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.auctionHouseFeeAccount,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.auctionHouse,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: (_a = accounts.systemProgram) !== null && _a !== void 0 ? _a : web3.SystemProgram.programId,
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
exports.createWithdrawFromFeeInstruction = createWithdrawFromFeeInstruction;
