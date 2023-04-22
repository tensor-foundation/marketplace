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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintV2 = exports.mint = void 0;
const web3_js_1 = require("@solana/web3.js");
const accounts_1 = require("../helpers/accounts");
const constants_1 = require("../helpers/constants");
const anchor = __importStar(require("@project-serum/anchor"));
const spl_token_1 = require("@solana/spl-token");
const instructions_1 = require("../helpers/instructions");
const transactions_1 = require("../helpers/transactions");
const loglevel_1 = __importDefault(require("loglevel"));
function mint(keypair, env, configAddress, uuid, rpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        const mint = web3_js_1.Keypair.generate();
        const userKeyPair = (0, accounts_1.loadWalletKey)(keypair);
        const anchorProgram = yield (0, accounts_1.loadCandyProgram)(userKeyPair, env, rpcUrl);
        const userTokenAccountAddress = yield (0, accounts_1.getTokenWallet)(userKeyPair.publicKey, mint.publicKey);
        const [candyMachineAddress] = yield (0, accounts_1.getCandyMachineAddress)(configAddress, uuid);
        const candyMachine = yield anchorProgram.account.candyMachine.fetch(candyMachineAddress);
        const remainingAccounts = [];
        const signers = [mint, userKeyPair];
        const instructions = [
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: userKeyPair.publicKey,
                newAccountPubkey: mint.publicKey,
                space: spl_token_1.MintLayout.span,
                lamports: yield anchorProgram.provider.connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
                programId: constants_1.TOKEN_PROGRAM_ID,
            }),
            spl_token_1.Token.createInitMintInstruction(constants_1.TOKEN_PROGRAM_ID, mint.publicKey, 0, userKeyPair.publicKey, userKeyPair.publicKey),
            (0, instructions_1.createAssociatedTokenAccountInstruction)(userTokenAccountAddress, userKeyPair.publicKey, userKeyPair.publicKey, mint.publicKey),
            spl_token_1.Token.createMintToInstruction(constants_1.TOKEN_PROGRAM_ID, mint.publicKey, userTokenAccountAddress, userKeyPair.publicKey, [], 1),
        ];
        let tokenAccount;
        if (candyMachine.tokenMint) {
            const transferAuthority = anchor.web3.Keypair.generate();
            tokenAccount = yield (0, accounts_1.getTokenWallet)(userKeyPair.publicKey, candyMachine.tokenMint);
            remainingAccounts.push({
                pubkey: tokenAccount,
                isWritable: true,
                isSigner: false,
            });
            remainingAccounts.push({
                pubkey: userKeyPair.publicKey,
                isWritable: false,
                isSigner: true,
            });
            instructions.push(spl_token_1.Token.createApproveInstruction(constants_1.TOKEN_PROGRAM_ID, tokenAccount, transferAuthority.publicKey, userKeyPair.publicKey, [], candyMachine.data.price.toNumber()));
        }
        const metadataAddress = yield (0, accounts_1.getMetadata)(mint.publicKey);
        const masterEdition = yield (0, accounts_1.getMasterEdition)(mint.publicKey);
        instructions.push(yield anchorProgram.instruction.mintNft({
            accounts: {
                config: configAddress,
                candyMachine: candyMachineAddress,
                payer: userKeyPair.publicKey,
                //@ts-ignore
                wallet: candyMachine.wallet,
                mint: mint.publicKey,
                metadata: metadataAddress,
                masterEdition,
                mintAuthority: userKeyPair.publicKey,
                updateAuthority: userKeyPair.publicKey,
                tokenMetadataProgram: constants_1.TOKEN_METADATA_PROGRAM_ID,
                tokenProgram: constants_1.TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
            },
            remainingAccounts,
        }));
        if (tokenAccount) {
            instructions.push(spl_token_1.Token.createRevokeInstruction(constants_1.TOKEN_PROGRAM_ID, tokenAccount, userKeyPair.publicKey, []));
        }
        return (yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(anchorProgram.provider.connection, userKeyPair, instructions, signers)).txid;
    });
}
exports.mint = mint;
function mintV2(keypair, env, candyMachineAddress, rpcUrl) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const mint = web3_js_1.Keypair.generate();
        const userKeyPair = (0, accounts_1.loadWalletKey)(keypair);
        const anchorProgram = yield (0, accounts_1.loadCandyProgramV2)(userKeyPair, env, rpcUrl);
        const userTokenAccountAddress = yield (0, accounts_1.getTokenWallet)(userKeyPair.publicKey, mint.publicKey);
        const candyMachine = yield anchorProgram.account.candyMachine.fetch(candyMachineAddress);
        const remainingAccounts = [];
        const signers = [mint, userKeyPair];
        const cleanupInstructions = [];
        const instructions = [
            anchor.web3.SystemProgram.createAccount({
                fromPubkey: userKeyPair.publicKey,
                newAccountPubkey: mint.publicKey,
                space: spl_token_1.MintLayout.span,
                lamports: yield anchorProgram.provider.connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
                programId: constants_1.TOKEN_PROGRAM_ID,
            }),
            spl_token_1.Token.createInitMintInstruction(constants_1.TOKEN_PROGRAM_ID, mint.publicKey, 0, userKeyPair.publicKey, userKeyPair.publicKey),
            (0, instructions_1.createAssociatedTokenAccountInstruction)(userTokenAccountAddress, userKeyPair.publicKey, userKeyPair.publicKey, mint.publicKey),
            spl_token_1.Token.createMintToInstruction(constants_1.TOKEN_PROGRAM_ID, mint.publicKey, userTokenAccountAddress, userKeyPair.publicKey, [], 1),
        ];
        if (candyMachine.data.whitelistMintSettings) {
            const mint = new anchor.web3.PublicKey(candyMachine.data.whitelistMintSettings.mint);
            const whitelistToken = (yield (0, accounts_1.getAtaForMint)(mint, userKeyPair.publicKey))[0];
            remainingAccounts.push({
                pubkey: whitelistToken,
                isWritable: true,
                isSigner: false,
            });
            if (candyMachine.data.whitelistMintSettings.mode.burnEveryTime) {
                const whitelistBurnAuthority = anchor.web3.Keypair.generate();
                remainingAccounts.push({
                    pubkey: mint,
                    isWritable: true,
                    isSigner: false,
                });
                remainingAccounts.push({
                    pubkey: whitelistBurnAuthority.publicKey,
                    isWritable: false,
                    isSigner: true,
                });
                signers.push(whitelistBurnAuthority);
                const exists = yield anchorProgram.provider.connection.getAccountInfo(whitelistToken);
                if (exists) {
                    instructions.push(spl_token_1.Token.createApproveInstruction(constants_1.TOKEN_PROGRAM_ID, whitelistToken, whitelistBurnAuthority.publicKey, userKeyPair.publicKey, [], 1));
                    cleanupInstructions.push(spl_token_1.Token.createRevokeInstruction(constants_1.TOKEN_PROGRAM_ID, whitelistToken, userKeyPair.publicKey, []));
                }
            }
        }
        let tokenAccount;
        if (candyMachine.tokenMint) {
            const transferAuthority = anchor.web3.Keypair.generate();
            tokenAccount = yield (0, accounts_1.getTokenWallet)(userKeyPair.publicKey, candyMachine.tokenMint);
            remainingAccounts.push({
                pubkey: tokenAccount,
                isWritable: true,
                isSigner: false,
            });
            remainingAccounts.push({
                pubkey: transferAuthority.publicKey,
                isWritable: false,
                isSigner: true,
            });
            instructions.push(spl_token_1.Token.createApproveInstruction(constants_1.TOKEN_PROGRAM_ID, tokenAccount, transferAuthority.publicKey, userKeyPair.publicKey, [], candyMachine.data.price.toNumber()));
            signers.push(transferAuthority);
            cleanupInstructions.push(spl_token_1.Token.createRevokeInstruction(constants_1.TOKEN_PROGRAM_ID, tokenAccount, userKeyPair.publicKey, []));
        }
        const metadataAddress = yield (0, accounts_1.getMetadata)(mint.publicKey);
        const masterEdition = yield (0, accounts_1.getMasterEdition)(mint.publicKey);
        loglevel_1.default.debug('Remaining accounts: ', remainingAccounts.map(i => i.pubkey.toBase58()));
        const [candyMachineCreator, creatorBump] = yield (0, accounts_1.getCandyMachineCreator)(candyMachineAddress);
        instructions.push(yield anchorProgram.instruction.mintNft(creatorBump, {
            accounts: {
                candyMachine: candyMachineAddress,
                candyMachineCreator,
                payer: userKeyPair.publicKey,
                //@ts-ignore
                wallet: candyMachine.wallet,
                mint: mint.publicKey,
                metadata: metadataAddress,
                masterEdition,
                mintAuthority: userKeyPair.publicKey,
                updateAuthority: userKeyPair.publicKey,
                tokenMetadataProgram: constants_1.TOKEN_METADATA_PROGRAM_ID,
                tokenProgram: constants_1.TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
                recentBlockhashes: anchor.web3.SYSVAR_SLOT_HASHES_PUBKEY,
                instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            },
            remainingAccounts: remainingAccounts.length > 0 ? remainingAccounts : undefined,
        }));
        const collectionPDA = (yield (0, accounts_1.getCollectionPDA)(candyMachineAddress))[0];
        const collectionPDAAccount = yield anchorProgram.provider.connection.getAccountInfo(collectionPDA);
        if (collectionPDAAccount && candyMachine.data.retainAuthority) {
            try {
                const collectionPdaData = (yield anchorProgram.account.collectionPda.fetch(collectionPDA));
                const collectionMint = collectionPdaData.mint;
                const collectionAuthorityRecord = (yield (0, accounts_1.getCollectionAuthorityRecordPDA)(collectionMint, collectionPDA))[0];
                if (collectionMint) {
                    const collectionMetadata = yield (0, accounts_1.getMetadata)(collectionMint);
                    const collectionMasterEdition = yield (0, accounts_1.getMasterEdition)(collectionMint);
                    loglevel_1.default.debug('Collection PDA: ', collectionPDA.toBase58());
                    loglevel_1.default.debug('Authority: ', candyMachine.authority.toBase58());
                    instructions.push(yield anchorProgram.instruction.setCollectionDuringMint({
                        accounts: {
                            candyMachine: candyMachineAddress,
                            metadata: metadataAddress,
                            payer: userKeyPair.publicKey,
                            collectionPda: collectionPDA,
                            tokenMetadataProgram: constants_1.TOKEN_METADATA_PROGRAM_ID,
                            instructions: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
                            collectionMint: collectionMint,
                            collectionMetadata,
                            collectionMasterEdition,
                            authority: candyMachine.authority,
                            collectionAuthorityRecord,
                        },
                    }));
                }
            }
            catch (error) {
                console.error(error);
            }
        }
        const data = candyMachine.data;
        const txnEstimate = 892 +
            (collectionPDAAccount && data.retainAuthority ? 182 : 0) +
            (candyMachine.tokenMint ? 177 : 0) +
            (data.whitelistMintSettings ? 33 : 0) +
            (((_b = (_a = data.whitelistMintSettings) === null || _a === void 0 ? void 0 : _a.mode) === null || _b === void 0 ? void 0 : _b.burnEveryTime) ? 145 : 0) +
            (data.gatekeeper ? 33 : 0) +
            (((_c = data.gatekeeper) === null || _c === void 0 ? void 0 : _c.expireOnUse) ? 66 : 0);
        loglevel_1.default.info('Transaction size estimate: ', txnEstimate);
        const INIT_INSTRUCTIONS_LENGTH = 4;
        const INIT_SIGNERS_LENGTH = 1;
        let initInstructions = [];
        let initSigners = [];
        if (txnEstimate > 1230) {
            initInstructions = instructions.splice(0, INIT_INSTRUCTIONS_LENGTH);
            initSigners = signers.splice(0, INIT_SIGNERS_LENGTH);
        }
        if (initInstructions.length > 0) {
            yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(anchorProgram.provider.connection, userKeyPair, initInstructions, initSigners);
        }
        const mainInstructions = (yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(anchorProgram.provider.connection, userKeyPair, instructions, signers)).txid;
        if (cleanupInstructions.length > 0) {
            yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(anchorProgram.provider.connection, userKeyPair, cleanupInstructions, []);
        }
        return mainInstructions;
    });
}
exports.mintV2 = mintV2;
