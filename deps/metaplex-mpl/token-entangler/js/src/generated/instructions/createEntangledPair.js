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
exports.createCreateEntangledPairInstruction = void 0;
const splToken = __importStar(require("@solana/spl-token"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const web3 = __importStar(require("@solana/web3.js"));
/**
 * @category Instructions
 * @category CreateEntangledPair
 * @category generated
 */
const createEntangledPairStruct = new beet.BeetArgsStruct([
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['bump', beet.u8],
    ['reverseBump', beet.u8],
    ['tokenAEscrowBump', beet.u8],
    ['tokenBEscrowBump', beet.u8],
    ['price', beet.u64],
    ['paysEveryTime', beet.bool],
], 'CreateEntangledPairInstructionArgs');
const createEntangledPairInstructionDiscriminator = [166, 106, 32, 45, 156, 210, 209, 240];
/**
 * Creates a _CreateEntangledPair_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category CreateEntangledPair
 * @category generated
 */
function createCreateEntangledPairInstruction(accounts, args) {
    const { treasuryMint, payer, transferAuthority, authority, mintA, metadataA, editionA, mintB, metadataB, editionB, tokenB, tokenAEscrow, tokenBEscrow, entangledPair, reverseEntangledPair, } = accounts;
    const [data] = createEntangledPairStruct.serialize(Object.assign({ instructionDiscriminator: createEntangledPairInstructionDiscriminator }, args));
    const keys = [
        {
            pubkey: treasuryMint,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: payer,
            isWritable: true,
            isSigner: true,
        },
        {
            pubkey: transferAuthority,
            isWritable: false,
            isSigner: true,
        },
        {
            pubkey: authority,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: mintA,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: metadataA,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: editionA,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: mintB,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: metadataB,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: editionB,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: tokenB,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: tokenAEscrow,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: tokenBEscrow,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: entangledPair,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: reverseEntangledPair,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: splToken.TOKEN_PROGRAM_ID,
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
    ];
    const ix = new web3.TransactionInstruction({
        programId: new web3.PublicKey('qntmGodpGkrM42mN68VCZHXnKqDCT8rdY23wFcXCLPd'),
        keys,
        data,
    });
    return ix;
}
exports.createCreateEntangledPairInstruction = createCreateEntangledPairInstruction;
