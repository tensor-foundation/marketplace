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
exports.createProcessAddMemberNftInstruction = exports.processAddMemberNftInstructionDiscriminator = exports.processAddMemberNftStruct = void 0;
const splToken = __importStar(require("@solana/spl-token"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
const AddMemberArgs_1 = require("../types/AddMemberArgs");
/**
 * @category Instructions
 * @category ProcessAddMemberNft
 * @category generated
 */
exports.processAddMemberNftStruct = new beet.BeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['args', AddMemberArgs_1.addMemberArgsBeet],
], 'ProcessAddMemberNftInstructionArgs');
exports.processAddMemberNftInstructionDiscriminator = [92, 255, 105, 209, 25, 41, 3, 7];
/**
 * Creates a _ProcessAddMemberNft_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category ProcessAddMemberNft
 * @category generated
 */
function createProcessAddMemberNftInstruction(accounts, args) {
    const { authority, fanout, membershipAccount, mint, metadata } = accounts;
    const [data] = exports.processAddMemberNftStruct.serialize(Object.assign({ instructionDiscriminator: exports.processAddMemberNftInstructionDiscriminator }, args));
    const keys = [
        {
            pubkey: authority,
            isWritable: true,
            isSigner: true,
        },
        {
            pubkey: fanout,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: membershipAccount,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: mint,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: metadata,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: web3.SystemProgram.programId,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: web3.SYSVAR_RENT_PUBKEY,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: splToken.TOKEN_PROGRAM_ID,
            isWritable: false,
            isSigner: false,
        },
    ];
    const ix = new web3.TransactionInstruction({
        programId: new web3.PublicKey('hyDQ4Nz1eYyegS6JfenyKwKzYxRsCWCriYSAjtzP4Vg'),
        keys,
        data,
    });
    return ix;
}
exports.createProcessAddMemberNftInstruction = createProcessAddMemberNftInstruction;
