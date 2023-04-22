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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const generated_1 = require("../src/generated");
const tape_1 = __importDefault(require("tape"));
const setup_1 = require("./setup");
const digital_asset_manager_1 = require("./utils/digital-asset-manager");
const spok_1 = __importDefault(require("spok"));
const utils_1 = require("./utils");
const bn_js_1 = require("bn.js");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const programmable_1 = require("./utils/programmable");
const mpl_token_auth_rules_1 = require("@metaplex-foundation/mpl-token-auth-rules");
const msgpack_1 = require("@msgpack/msgpack");
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('Delegate: create update collection items delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const collection = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    const [delegate] = yield API.getKeypair('Delegate');
    // delegate PDA
    const [delegateRecord] = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from('metadata'),
        generated_1.PROGRAM_ID.toBuffer(),
        collection.mint.toBuffer(),
        Buffer.from('collection_delegate'),
        payer.publicKey.toBuffer(),
        delegate.toBuffer(),
    ], generated_1.PROGRAM_ID);
    setup_1.amman.addr.addLabel('Metadata Delegate Record', delegateRecord);
    const args = {
        __kind: 'CollectionV1',
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate, collection.mint, collection.metadata, payer.publicKey, payer, args, handler, delegateRecord, collection.masterEdition);
    yield delegateTx.assertSuccess(t);
    const pda = yield generated_1.MetadataDelegateRecord.fromAccountAddress(connection, delegateRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate),
        mint: (0, utils_1.spokSamePubkey)(collection.mint),
    });
}));
(0, tape_1.default)('Delegate: create sale delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    const [delegate] = yield API.getKeypair('Delegate');
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const args = {
        __kind: 'SaleV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // asserts
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
    (0, spok_1.default)(t, tokenAccount, {
        delegatedAmount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        delegate: (0, utils_1.spokSamePubkey)(delegate),
    });
    const pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate),
        delegateRole: generated_1.TokenDelegateRole.Sale,
        state: generated_1.TokenState.Listed,
    });
}));
(0, tape_1.default)('Delegate: owner as sale delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const args = {
        __kind: 'SaleV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(payer.publicKey, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // asserts
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
    (0, spok_1.default)(t, tokenAccount, {
        delegatedAmount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        delegate: (0, utils_1.spokSamePubkey)(payer.publicKey),
    });
    const pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(payer.publicKey),
        delegateRole: generated_1.TokenDelegateRole.Sale,
        state: generated_1.TokenState.Listed,
    });
}));
(0, tape_1.default)('Delegate: create transfer delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    const [delegate] = yield API.getKeypair('Delegate');
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const args = {
        __kind: 'TransferV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // asserts
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
    (0, spok_1.default)(t, tokenAccount, {
        delegatedAmount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        delegate: (0, utils_1.spokSamePubkey)(delegate),
    });
    const pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate),
        delegateRole: generated_1.TokenDelegateRole.Transfer,
    });
}));
(0, tape_1.default)('Delegate: fail to create sale delegate on NFT', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.NonFungible);
    // creates a delegate
    const [delegate] = yield API.getKeypair('Delegate');
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const args = {
        __kind: 'SaleV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertError(t, /Invalid delegate role/);
}));
(0, tape_1.default)('Delegate: fail to replace pNFT transfer delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    const [delegate] = yield API.getKeypair('Delegate');
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const args = {
        __kind: 'TransferV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // asserts
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
    (0, spok_1.default)(t, tokenAccount, {
        delegatedAmount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        delegate: (0, utils_1.spokSamePubkey)(delegate),
    });
    const pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate),
        delegateRole: generated_1.TokenDelegateRole.Transfer,
    });
    // creates a new delegate
    const [newDelegate] = yield API.getKeypair('Delegate');
    const { tx: delegateTx2 } = yield API.delegate(newDelegate, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx2.assertError(t, /Delegate already exists/);
}));
(0, tape_1.default)('Delegate: create utility delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    const [delegate] = yield API.getKeypair('Delegate');
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const args = {
        __kind: 'UtilityV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // asserts
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
    (0, spok_1.default)(t, tokenAccount, {
        delegatedAmount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        delegate: (0, utils_1.spokSamePubkey)(delegate),
    });
    const pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate),
        delegateRole: generated_1.TokenDelegateRole.Utility,
    });
}));
(0, tape_1.default)('Delegate: try replace sale delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    const [delegate] = yield API.getKeypair('Delegate');
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const args = {
        __kind: 'SaleV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // asserts
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
    (0, spok_1.default)(t, tokenAccount, {
        delegatedAmount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        delegate: (0, utils_1.spokSamePubkey)(delegate),
    });
    const pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate),
        delegateRole: generated_1.TokenDelegateRole.Sale,
    });
    // creates a transfer delegate
    const [newDelegate] = yield API.getKeypair('Delegate');
    const args2 = {
        __kind: 'TransferV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx2 } = yield API.delegate(newDelegate, manager.mint, manager.metadata, payer.publicKey, payer, args2, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx2.assertError(t, /Delegate already exists/);
}));
(0, tape_1.default)('Delegate: create locked transfer delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    const [delegate] = yield API.getKeypair('Delegate');
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const args = {
        __kind: 'LockedTransferV1',
        amount: 1,
        lockedAddress: web3_js_1.PublicKey.default,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // asserts
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
    (0, spok_1.default)(t, tokenAccount, {
        delegatedAmount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        delegate: (0, utils_1.spokSamePubkey)(delegate),
    });
    const pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate),
        delegateRole: generated_1.TokenDelegateRole.LockedTransfer,
        lockedTransfer: (0, utils_1.spokSamePubkey)(web3_js_1.PublicKey.default),
    });
}));
(0, tape_1.default)('Delegate: create sale delegate with auth rules', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // creates the auth rules for the delegate
    const ruleSetName = 'delegate_test';
    const ruleSetTokenMetadata = {
        libVersion: 1,
        ruleSetName: ruleSetName,
        owner: Array.from(payer.publicKey.toBytes()),
        operations: {
            'Delegate:Sale': {
                All: {
                    rules: [
                        {
                            ProgramOwned: {
                                program: Array.from(generated_1.PROGRAM_ID.toBytes()),
                                field: 'Delegate',
                            },
                        },
                        {
                            Amount: {
                                amount: 1,
                                operator: 2,
                                field: 'Amount',
                            },
                        },
                    ],
                },
            },
        },
    };
    const [ruleSetPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('rule_set'), payer.publicKey.toBuffer(), Buffer.from(ruleSetName)], mpl_token_auth_rules_1.PROGRAM_ID);
    const { tx: createRuleSetTx } = yield API.createRuleSet(t, payer, ruleSetPda, (0, msgpack_1.encode)(ruleSetTokenMetadata), handler);
    yield createRuleSetTx.assertSuccess(t);
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, ruleSetPda);
    // creates a delegate
    // token record PDA (using metadata as delegate)
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const args = {
        __kind: 'SaleV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(manager.metadata, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord, ruleSetPda);
    yield delegateTx.assertSuccess(t);
    // asserts
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
    (0, spok_1.default)(t, tokenAccount, {
        delegatedAmount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        delegate: (0, utils_1.spokSamePubkey)(manager.metadata),
    });
    const pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(manager.metadata),
        delegateRole: generated_1.TokenDelegateRole.Sale,
        state: generated_1.TokenState.Listed,
    });
}));
(0, tape_1.default)('Delegate: fail to create LockedTransfer delegate with auth rules', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // creates the auth rules for the delegate
    const ruleSetName = 'delegate_test';
    const ruleSetTokenMetadata = {
        libVersion: 1,
        ruleSetName: ruleSetName,
        owner: Array.from(payer.publicKey.toBytes()),
        operations: {
            'Delegate:LockedTransfer': {
                All: {
                    rules: [
                        {
                            ProgramOwned: {
                                program: Array.from(generated_1.PROGRAM_ID.toBytes()),
                                field: 'Delegate',
                            },
                        },
                        {
                            Amount: {
                                amount: 1,
                                operator: 2,
                                field: 'Amount',
                            },
                        },
                    ],
                },
            },
        },
    };
    const [ruleSetPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('rule_set'), payer.publicKey.toBuffer(), Buffer.from(ruleSetName)], mpl_token_auth_rules_1.PROGRAM_ID);
    const { tx: createRuleSetTx } = yield API.createRuleSet(t, payer, ruleSetPda, (0, msgpack_1.encode)(ruleSetTokenMetadata), handler);
    yield createRuleSetTx.assertSuccess(t);
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, ruleSetPda);
    // creates a delegate
    // address of our invalid delegate
    const [delegate] = yield setup_1.amman.genLabeledKeypair('Delegate');
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const args = {
        __kind: 'LockedTransferV1',
        amount: 1,
        lockedAddress: web3_js_1.PublicKey.default,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord, ruleSetPda);
    delegateTx.then((x) => x.assertLogs(t, [/Program Owned check failed/i], {
        txLabel: 'tx: Delegate',
    }));
    yield delegateTx.assertError(t);
}));
