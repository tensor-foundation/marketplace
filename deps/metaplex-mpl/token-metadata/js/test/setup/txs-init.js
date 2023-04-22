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
exports.InitTransactions = void 0;
const amman_client_1 = require("@metaplex-foundation/amman-client");
const splToken = __importStar(require("@solana/spl-token"));
const web3_js_1 = require("@solana/web3.js");
const generated_1 = require("../../src/generated");
const _1 = require(".");
const mpl_token_auth_rules_1 = require("@metaplex-foundation/mpl-token-auth-rules");
const spl_token_1 = require("@solana/spl-token");
const programmable_1 = require("../utils/programmable");
const msgpack_1 = require("@msgpack/msgpack");
class InitTransactions {
    constructor(resuseKeypairs = false) {
        this.resuseKeypairs = resuseKeypairs;
        this.getKeypair = resuseKeypairs ? _1.amman.loadOrGenKeypair : _1.amman.genLabeledKeypair;
    }
    payer() {
        return __awaiter(this, void 0, void 0, function* () {
            const [payer, payerPair] = yield this.getKeypair('Payer');
            const connection = new web3_js_1.Connection(amman_client_1.LOCALHOST, 'confirmed');
            yield _1.amman.airdrop(connection, payer, 2);
            const transactionHandler = _1.amman.payerTransactionHandler(connection, payerPair);
            return {
                fstTxHandler: transactionHandler,
                connection,
                payer,
                payerPair,
            };
        });
    }
    authority() {
        return __awaiter(this, void 0, void 0, function* () {
            const [authority, authorityPair] = yield this.getKeypair('Authority');
            const connection = new web3_js_1.Connection(amman_client_1.LOCALHOST, 'confirmed');
            yield _1.amman.airdrop(connection, authority, 2);
            const transactionHandler = _1.amman.payerTransactionHandler(connection, authorityPair);
            return {
                fstTxHandler: transactionHandler,
                connection,
                authority,
                authorityPair,
            };
        });
    }
    burn(handler, authority, mint, metadata, token, amount, edition = null, tokenRecord = null, masterEdition = null, masterEditionMint = null, masterEditionToken = null, editionMarker = null) {
        return __awaiter(this, void 0, void 0, function* () {
            _1.amman.addr.addLabel('Mint Account', mint);
            _1.amman.addr.addLabel('Metadata Account', metadata);
            if (edition != null) {
                _1.amman.addr.addLabel('Edition Account', edition);
            }
            const burnAccounts = {
                authority: authority.publicKey,
                metadata,
                edition,
                mint,
                token,
                tokenRecord,
                masterEdition,
                masterEditionMint,
                masterEditionToken,
                editionMarker,
                systemProgram: web3_js_1.SystemProgram.programId,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                splTokenProgram: splToken.TOKEN_PROGRAM_ID,
            };
            const burnArgs = {
                burnArgs: {
                    __kind: 'V1',
                    amount,
                },
            };
            const burnIx = (0, generated_1.createBurnInstruction)(burnAccounts, burnArgs);
            const tx = new web3_js_1.Transaction().add(burnIx);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [authority], 'tx: Burn'),
            };
        });
    }
    verify(handler, authority, delegateRecord = null, metadata, collectionMint = null, collectionMetadata = null, collectionMasterEdition = null, args) {
        return __awaiter(this, void 0, void 0, function* () {
            _1.amman.addr.addLabel('Metadata Account', metadata);
            const verifyAccounts = {
                authority: authority.publicKey,
                delegateRecord,
                metadata,
                collectionMint,
                collectionMetadata,
                collectionMasterEdition,
                systemProgram: web3_js_1.SystemProgram.programId,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
            };
            const verifyIx = (0, generated_1.createVerifyInstruction)(verifyAccounts, args);
            const tx = new web3_js_1.Transaction().add(verifyIx);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [authority], 'tx: Verify'),
            };
        });
    }
    unverify(handler, authority, delegateRecord = null, metadata, collectionMint = null, collectionMetadata = null, args) {
        return __awaiter(this, void 0, void 0, function* () {
            _1.amman.addr.addLabel('Metadata Account', metadata);
            const unverifyAccounts = {
                authority: authority.publicKey,
                delegateRecord,
                metadata,
                collectionMint,
                collectionMetadata,
                systemProgram: web3_js_1.SystemProgram.programId,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
            };
            const unverifyIx = (0, generated_1.createUnverifyInstruction)(unverifyAccounts, args);
            const tx = new web3_js_1.Transaction().add(unverifyIx);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [authority], 'tx: Verify'),
            };
        });
    }
    create(t, payer, assetData, decimals, printSupply, handler, mint = null, metadata = null, masterEdition = null, skipMasterEdition = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let mintPair = null;
            // create a keypair for the mint account (if needed)
            if (!mint) {
                const [, keypair] = yield this.getKeypair('Mint Account');
                _1.amman.addr.addLabel('Mint Account', keypair.publicKey);
                mintPair = keypair;
            }
            // metadata account
            if (!metadata) {
                const [address] = web3_js_1.PublicKey.findProgramAddressSync([
                    Buffer.from('metadata'),
                    generated_1.PROGRAM_ID.toBuffer(),
                    mint ? mint.toBuffer() : mintPair.publicKey.toBuffer(),
                ], generated_1.PROGRAM_ID);
                _1.amman.addr.addLabel('Metadata Account', address);
                metadata = address;
            }
            if (!masterEdition &&
                (assetData.tokenStandard == generated_1.TokenStandard.NonFungible ||
                    assetData.tokenStandard == generated_1.TokenStandard.ProgrammableNonFungible) &&
                !skipMasterEdition) {
                // master edition (optional)
                const [address] = web3_js_1.PublicKey.findProgramAddressSync([
                    Buffer.from('metadata'),
                    generated_1.PROGRAM_ID.toBuffer(),
                    mint ? mint.toBuffer() : mintPair.publicKey.toBuffer(),
                    Buffer.from('edition'),
                ], generated_1.PROGRAM_ID);
                _1.amman.addr.addLabel('Master Edition Account', address);
                masterEdition = address;
            }
            const accounts = {
                metadata,
                masterEdition,
                mint: mint ? mint : mintPair.publicKey,
                authority: payer.publicKey,
                payer: payer.publicKey,
                splTokenProgram: splToken.TOKEN_PROGRAM_ID,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                updateAuthority: payer.publicKey,
            };
            const args = {
                createArgs: {
                    __kind: 'V1',
                    assetData,
                    decimals,
                    printSupply: printSupply == 0 ? { __kind: 'Zero' } : { __kind: 'Limited', fields: [printSupply] },
                },
            };
            const createIx = (0, generated_1.createCreateInstruction)(accounts, args);
            if (!mint) {
                // this test always initializes the mint, we we need to set the
                // account to be writable and a signer
                for (let i = 0; i < createIx.keys.length; i++) {
                    if (createIx.keys[i].pubkey.toBase58() === mintPair.publicKey.toBase58()) {
                        createIx.keys[i].isSigner = true;
                        createIx.keys[i].isWritable = true;
                    }
                }
            }
            const tx = new web3_js_1.Transaction().add(createIx);
            const signers = [payer];
            if (!mint) {
                signers.push(mintPair);
            }
            return {
                tx: handler.sendAndConfirmTransaction(tx, signers, 'tx: Create'),
                mint: mint ? mint : mintPair.publicKey,
                metadata,
                masterEdition,
            };
        });
    }
    mint(t, connection, payer, mint, metadata, masterEdition, authorizationData, amount, handler, token = null, tokenRecord = null, tokenOwner = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!token) {
                // mint instrution will initialize a ATA account
                const [tokenPda] = web3_js_1.PublicKey.findProgramAddressSync([payer.publicKey.toBuffer(), splToken.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], splToken.ASSOCIATED_TOKEN_PROGRAM_ID);
                token = tokenPda;
            }
            if (!tokenOwner) {
                tokenOwner = payer.publicKey;
            }
            if (!tokenRecord) {
                tokenRecord = (0, programmable_1.findTokenRecordPda)(mint, token);
            }
            _1.amman.addr.addLabel('Token Account', token);
            const metadataAccount = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
            const authConfig = metadataAccount.programmableConfig;
            const mintAcccounts = {
                token,
                tokenOwner,
                metadata,
                masterEdition,
                tokenRecord,
                mint,
                payer: payer.publicKey,
                authority: payer.publicKey,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                splAtaProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                splTokenProgram: splToken.TOKEN_PROGRAM_ID,
                authorizationRules: authConfig ? authConfig.ruleSet : null,
                authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
            };
            const payload = {
                map: new Map(),
            };
            if (!authorizationData) {
                authorizationData = {
                    payload,
                };
            }
            const mintArgs = {
                mintArgs: {
                    __kind: 'V1',
                    amount,
                    authorizationData,
                },
            };
            const mintIx = (0, generated_1.createMintInstruction)(mintAcccounts, mintArgs);
            // creates the transaction
            const tx = new web3_js_1.Transaction().add(mintIx);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [payer], 'tx: Mint'),
                token,
            };
        });
    }
    transfer(authority, tokenOwner, token, mint, metadata, edition, destinationOwner, destination, authorizationRules, amount, handler, tokenRecord = null, destinationTokenRecord = null, args = null) {
        return __awaiter(this, void 0, void 0, function* () {
            _1.amman.addr.addLabel('Mint Account', mint);
            _1.amman.addr.addLabel('Metadata Account', metadata);
            if (edition != null) {
                _1.amman.addr.addLabel('Master Edition Account', edition);
            }
            _1.amman.addr.addLabel('Authority', authority.publicKey);
            _1.amman.addr.addLabel('Token Owner', tokenOwner);
            _1.amman.addr.addLabel('Token Account', token);
            _1.amman.addr.addLabel('Destination', destinationOwner);
            _1.amman.addr.addLabel('Destination Token Account', destination);
            const transferAcccounts = {
                authority: authority.publicKey,
                tokenOwner,
                token,
                metadata,
                mint,
                edition,
                destinationOwner,
                destination,
                payer: authority.publicKey,
                splTokenProgram: splToken.TOKEN_PROGRAM_ID,
                splAtaProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                authorizationRules,
                authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
                ownerTokenRecord: tokenRecord,
                destinationTokenRecord,
            };
            if (!args) {
                args = {
                    __kind: 'V1',
                    amount,
                    authorizationData: null,
                };
            }
            const modifyComputeUnits = web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
                units: 400000,
            });
            const transferArgs = {
                transferArgs: args,
            };
            const transferIx = (0, generated_1.createTransferInstruction)(transferAcccounts, transferArgs);
            const tx = new web3_js_1.Transaction().add(modifyComputeUnits).add(transferIx);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [authority], 'tx: Transfer'),
            };
        });
    }
    update(t, handler, mint, metadata, authority, updateTestData, delegateRecord = null, masterEdition = null, token = null, ruleSetPda, authorizationData) {
        return __awaiter(this, void 0, void 0, function* () {
            _1.amman.addr.addLabel('Mint Account', mint);
            _1.amman.addr.addLabel('Metadata Account', metadata);
            if (masterEdition != null) {
                _1.amman.addr.addLabel('Edition Account', masterEdition);
            }
            const updateAcccounts = {
                metadata,
                edition: masterEdition,
                mint,
                systemProgram: web3_js_1.SystemProgram.programId,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                authority: authority.publicKey,
                payer: authority.publicKey,
                token,
                delegateRecord,
                authorizationRulesProgram: ruleSetPda ? mpl_token_auth_rules_1.PROGRAM_ID : generated_1.PROGRAM_ID,
                authorizationRules: ruleSetPda,
            };
            const updateArgs = {
                updateArgs: {
                    __kind: 'V1',
                    newUpdateAuthority: updateTestData.newUpdateAuthority,
                    data: updateTestData.data,
                    primarySaleHappened: updateTestData.primarySaleHappened,
                    isMutable: updateTestData.isMutable,
                    collection: updateTestData.collection,
                    uses: updateTestData.uses,
                    collectionDetails: updateTestData.collectionDetails,
                    ruleSet: updateTestData.ruleSet,
                    authorizationData,
                },
            };
            const updateIx = (0, generated_1.createUpdateInstruction)(updateAcccounts, updateArgs);
            const tx = new web3_js_1.Transaction().add(updateIx);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [authority], 'tx: Update'),
            };
        });
    }
    delegate(delegate, mint, metadata, authority, payer, args, handler, delegateRecord = null, masterEdition = null, token = null, tokenRecord = null, ruleSetPda = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const delegateAcccounts = {
                delegateRecord,
                delegate,
                metadata,
                masterEdition,
                tokenRecord,
                mint,
                token,
                authority,
                payer: payer.publicKey,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                splTokenProgram: splToken.TOKEN_PROGRAM_ID,
                authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
                authorizationRules: ruleSetPda,
            };
            const mintArgs = {
                delegateArgs: args,
            };
            const mintIx = (0, generated_1.createDelegateInstruction)(delegateAcccounts, mintArgs);
            // creates the transaction
            const tx = new web3_js_1.Transaction().add(mintIx);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [payer], 'tx: Delegate'),
            };
        });
    }
    revoke(delegate, mint, metadata, authority, payer, args, handler, delegateRecord = null, masterEdition = null, token = null, tokenRecord = null, ruleSetPda = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const revokeAcccounts = {
                delegateRecord,
                delegate,
                metadata,
                masterEdition,
                tokenRecord,
                mint,
                token,
                authority: authority.publicKey,
                payer: payer.publicKey,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                splTokenProgram: splToken.TOKEN_PROGRAM_ID,
                authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
                authorizationRules: ruleSetPda,
            };
            const revokeArgs = {
                revokeArgs: args,
            };
            const mintIx = (0, generated_1.createRevokeInstruction)(revokeAcccounts, revokeArgs);
            // creates the transaction
            const tx = new web3_js_1.Transaction().add(mintIx);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [payer, authority], 'tx: Revoke'),
                delegate,
            };
        });
    }
    lock(delegate, mint, metadata, token, payer, handler, tokenRecord = null, tokenOwner = null, masterEdition = null, ruleSetPda = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const lockAcccounts = {
                authority: delegate.publicKey,
                tokenOwner,
                tokenRecord,
                token,
                mint,
                metadata,
                edition: masterEdition,
                payer: payer.publicKey,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                splTokenProgram: splToken.TOKEN_PROGRAM_ID,
                authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
                authorizationRules: ruleSetPda,
            };
            const lockArgs = {
                lockArgs: {
                    __kind: 'V1',
                    authorizationData: null,
                },
            };
            const mintIx = (0, generated_1.createLockInstruction)(lockAcccounts, lockArgs);
            // creates the transaction
            const tx = new web3_js_1.Transaction().add(mintIx);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [payer, delegate], 'tx: Lock'),
            };
        });
    }
    unlock(delegate, mint, metadata, token, payer, handler, tokenRecord = null, tokenOwner = null, masterEdition = null, ruleSetPda = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const unlockAcccounts = {
                authority: delegate.publicKey,
                tokenOwner,
                tokenRecord,
                token,
                mint,
                metadata,
                edition: masterEdition,
                payer: payer.publicKey,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                splTokenProgram: splToken.TOKEN_PROGRAM_ID,
                authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
                authorizationRules: ruleSetPda,
            };
            const unlockArgs = {
                unlockArgs: {
                    __kind: 'V1',
                    authorizationData: null,
                },
            };
            const mintIx = (0, generated_1.createUnlockInstruction)(unlockAcccounts, unlockArgs);
            // creates the transaction
            const tx = new web3_js_1.Transaction().add(mintIx);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [payer, delegate], 'tx: Unlock'),
            };
        });
    }
    //--------------------+
    // Helpers            |
    //--------------------+
    verifyCollection(t, payer, metadata, collectionMint, collectionMetadata, collectionMasterEdition, collectionAuthority, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            _1.amman.addr.addLabel('Metadata Account', metadata);
            _1.amman.addr.addLabel('Collection Mint Account', collectionMint);
            _1.amman.addr.addLabel('Collection Metadata Account', collectionMetadata);
            _1.amman.addr.addLabel('Collection Master Edition Account', collectionMasterEdition);
            const verifyCollectionAcccounts = {
                metadata,
                collectionAuthority: collectionAuthority.publicKey,
                collectionMint,
                collection: collectionMetadata,
                collectionMasterEditionAccount: collectionMasterEdition,
                payer: payer.publicKey,
            };
            const verifyInstruction = (0, generated_1.createVerifyCollectionInstruction)(verifyCollectionAcccounts);
            const tx = new web3_js_1.Transaction().add(verifyInstruction);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [payer, collectionAuthority], 'tx: Verify Collection'),
            };
        });
    }
    signMetadata(t, creator, metadata, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            _1.amman.addr.addLabel('Metadata Account', metadata);
            const signMetadataAcccounts = {
                metadata,
                creator: creator.publicKey,
            };
            const signMetadataInstruction = (0, generated_1.createSignMetadataInstruction)(signMetadataAcccounts);
            const tx = new web3_js_1.Transaction().add(signMetadataInstruction);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [creator], 'tx: Sign Metadata'),
            };
        });
    }
    createRuleSet(t, payer, ruleSetPda, serializedRuleSet, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            _1.amman.addr.addLabel('Payer', payer.publicKey);
            const createRuleSetAccounts = {
                ruleSetPda,
                payer: payer.publicKey,
                bufferPda: mpl_token_auth_rules_1.PROGRAM_ID,
            };
            const createRuleSetArgs = {
                createOrUpdateArgs: {
                    __kind: 'V1',
                    serializedRuleSet,
                },
            };
            const createRuleSetInstruction = (0, mpl_token_auth_rules_1.createCreateOrUpdateInstruction)(createRuleSetAccounts, createRuleSetArgs);
            const tx = new web3_js_1.Transaction().add(createRuleSetInstruction);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [payer], 'tx: CreateOrUpdateRuleSet'),
            };
        });
    }
    createDefaultRuleSet(t, handler, payer, amount = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const allowList = [Array.from(generated_1.PROGRAM_ID.toBytes())];
            const transferRules = {
                All: {
                    rules: [
                        {
                            Amount: {
                                amount,
                                operator: 2 /* equal */,
                                field: 'Amount',
                            },
                        },
                        {
                            Any: {
                                rules: [
                                    {
                                        ProgramOwnedList: {
                                            programs: allowList,
                                            field: 'Destination',
                                        },
                                    },
                                    {
                                        ProgramOwnedList: {
                                            programs: allowList,
                                            field: 'Source',
                                        },
                                    },
                                    {
                                        ProgramOwnedList: {
                                            programs: allowList,
                                            field: 'Authority',
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            };
            const ruleSetName = 'default_ruleset_test';
            const ruleSet = {
                libVersion: 1,
                ruleSetName: ruleSetName,
                owner: Array.from(payer.publicKey.toBytes()),
                operations: {
                    'Transfer:TransferDelegate': transferRules,
                    'Delegate:Sale': 'Pass',
                    'Delegate:Transfer': 'Pass',
                    'Delegate:LockedTransfer': 'Pass',
                },
            };
            const serializedRuleSet = (0, msgpack_1.encode)(ruleSet);
            // find the rule set PDA
            const [ruleSetPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('rule_set'), payer.publicKey.toBuffer(), Buffer.from(ruleSetName)], mpl_token_auth_rules_1.PROGRAM_ID);
            // creates the rule set
            const { tx: createRuleSetTx } = yield this.createRuleSet(t, payer, ruleSetPda, serializedRuleSet, handler);
            return { tx: createRuleSetTx, ruleSet: ruleSetPda };
        });
    }
    createMintAccount(payer, connection, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            const mint = web3_js_1.Keypair.generate();
            _1.amman.addr.addLabel('Mint Account', mint.publicKey);
            const ixs = [];
            ixs.push(web3_js_1.SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: mint.publicKey,
                lamports: yield connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
                space: spl_token_1.MintLayout.span,
                programId: spl_token_1.TOKEN_PROGRAM_ID,
            }));
            ixs.push((0, spl_token_1.createInitializeMintInstruction)(mint.publicKey, 0, payer.publicKey, payer.publicKey));
            const tx = new web3_js_1.Transaction().add(...ixs);
            return {
                tx: handler.sendAndConfirmTransaction(tx, [payer, mint], 'tx: Create Mint Account'),
                mint: mint.publicKey,
            };
        });
    }
    createTokenAccount(mint, payer, connection, handler, owner = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = web3_js_1.Keypair.generate();
            _1.amman.addr.addLabel('Token Account', token.publicKey);
            const tx = new web3_js_1.Transaction();
            tx.add(
            // create account
            web3_js_1.SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: token.publicKey,
                space: spl_token_1.ACCOUNT_SIZE,
                lamports: yield connection.getMinimumBalanceForRentExemption(spl_token_1.ACCOUNT_SIZE),
                programId: spl_token_1.TOKEN_PROGRAM_ID,
            }), 
            // initialize token account
            (0, spl_token_1.createInitializeAccountInstruction)(token.publicKey, mint, owner));
            return {
                tx: handler.sendAndConfirmTransaction(tx, [payer, token], 'tx: Create Token Account'),
                token: token.publicKey,
            };
        });
    }
    getTransferInstruction(authority, tokenOwner, token, mint, metadata, edition, destinationOwner, destination, authorizationRules, amount, handler, tokenRecord = null, destinationTokenRecord = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const transferAcccounts = {
                authority: authority.publicKey,
                tokenOwner,
                token,
                metadata,
                mint,
                edition,
                destinationOwner,
                destination,
                payer: authority.publicKey,
                splTokenProgram: splToken.TOKEN_PROGRAM_ID,
                splAtaProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                systemProgram: web3_js_1.SystemProgram.programId,
                sysvarInstructions: web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
                authorizationRules,
                authorizationRulesProgram: mpl_token_auth_rules_1.PROGRAM_ID,
                ownerTokenRecord: tokenRecord,
                destinationTokenRecord,
            };
            const transferArgs = {
                transferArgs: {
                    __kind: 'V1',
                    amount,
                    authorizationData: null,
                },
            };
            const instruction = (0, generated_1.createTransferInstruction)(transferAcccounts, transferArgs);
            return { instruction };
        });
    }
}
exports.InitTransactions = InitTransactions;
