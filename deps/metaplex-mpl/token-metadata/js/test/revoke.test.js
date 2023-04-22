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
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('Revoke: revoke transfer delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    const [delegate] = yield API.getKeypair('Delegate');
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const delegateArgs = {
        __kind: 'TransferV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate, manager.mint, manager.metadata, payer.publicKey, payer, delegateArgs, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // asserts
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
    (0, spok_1.default)(t, tokenAccount, {
        delegatedAmount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        delegate: (0, utils_1.spokSamePubkey)(delegate),
    });
    let pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate),
        delegateRole: generated_1.TokenDelegateRole.Transfer,
    });
    // revoke
    const { tx: revoketeTx } = yield API.revoke(delegate, manager.mint, manager.metadata, payer, payer, generated_1.RevokeArgs.TransferV1, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield revoketeTx.assertSuccess(t);
    pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: null,
        delegateRole: null,
    });
}));
(0, tape_1.default)('Revoke: revoke collection delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    const [, delegate] = yield API.getKeypair('Delegate');
    // delegate PDA
    const [delegateRecord] = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from('metadata'),
        generated_1.PROGRAM_ID.toBuffer(),
        manager.mint.toBuffer(),
        Buffer.from('collection_delegate'),
        payer.publicKey.toBuffer(),
        delegate.publicKey.toBuffer(),
    ], generated_1.PROGRAM_ID);
    setup_1.amman.addr.addLabel('Delegate Record', delegateRecord);
    const delegateArgs = {
        __kind: 'CollectionV1',
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, manager.mint, manager.metadata, payer.publicKey, payer, delegateArgs, handler, delegateRecord, manager.masterEdition, manager.token);
    yield delegateTx.assertSuccess(t);
    // asserts
    const account = yield generated_1.MetadataDelegateRecord.fromAccountAddress(connection, delegateRecord);
    (0, spok_1.default)(t, account, {
        delegate: (0, utils_1.spokSamePubkey)(delegate.publicKey),
        mint: (0, utils_1.spokSamePubkey)(manager.mint),
    });
    // revoke
    const { tx: revoketeTx } = yield API.revoke(delegate.publicKey, manager.mint, manager.metadata, payer, payer, generated_1.RevokeArgs.CollectionV1, handler, delegateRecord, manager.masterEdition, manager.token);
    yield revoketeTx.assertSuccess(t);
    try {
        yield generated_1.MetadataDelegateRecord.fromAccountAddress(connection, delegateRecord);
        t.fail(`Metadata delegate account ${delegateRecord} was found`);
    }
    catch (err) {
        // we are expecting an error, since the account must be deleted
    }
}));
(0, tape_1.default)('Revoke: self-revoke collection delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    const [, delegate] = yield API.getKeypair('Delegate');
    // delegate PDA
    const [delegateRecord] = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from('metadata'),
        generated_1.PROGRAM_ID.toBuffer(),
        manager.mint.toBuffer(),
        Buffer.from('collection_delegate'),
        payer.publicKey.toBuffer(),
        delegate.publicKey.toBuffer(),
    ], generated_1.PROGRAM_ID);
    setup_1.amman.addr.addLabel('Delegate Record', delegateRecord);
    const delegateArgs = {
        __kind: 'CollectionV1',
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, manager.mint, manager.metadata, payer.publicKey, payer, delegateArgs, handler, delegateRecord, manager.masterEdition, manager.token);
    yield delegateTx.assertSuccess(t);
    // asserts
    const account = yield generated_1.MetadataDelegateRecord.fromAccountAddress(connection, delegateRecord);
    (0, spok_1.default)(t, account, {
        delegate: (0, utils_1.spokSamePubkey)(delegate.publicKey),
        mint: (0, utils_1.spokSamePubkey)(manager.mint),
    });
    // revoke
    const { tx: revoketeTx } = yield API.revoke(delegate.publicKey, manager.mint, manager.metadata, delegate, payer, generated_1.RevokeArgs.CollectionV1, handler, delegateRecord, manager.masterEdition, manager.token);
    yield revoketeTx.assertSuccess(t);
    try {
        yield generated_1.MetadataDelegateRecord.fromAccountAddress(connection, delegateRecord);
        t.fail(`Delegate account ${delegateRecord} was found`);
    }
    catch (err) {
        // we are expecting an error, since the account must be deleted
    }
    // try to revoke again
    const { tx: revoketeTx2 } = yield API.revoke(delegate.publicKey, manager.mint, manager.metadata, delegate, payer, generated_1.RevokeArgs.CollectionV1, handler, delegateRecord, manager.token, manager.masterEdition);
    yield revoketeTx2.assertError(t, /Delegate not found/);
}));
(0, tape_1.default)('Revoke: revoke locked transfer delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // creates a delegate
    const [delegate] = yield API.getKeypair('Delegate');
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const delegateArgs = {
        __kind: 'LockedTransferV1',
        amount: 1,
        lockedAddress: web3_js_1.PublicKey.default,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate, manager.mint, manager.metadata, payer.publicKey, payer, delegateArgs, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // asserts
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
    (0, spok_1.default)(t, tokenAccount, {
        delegatedAmount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        delegate: (0, utils_1.spokSamePubkey)(delegate),
    });
    let pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate),
        delegateRole: generated_1.TokenDelegateRole.LockedTransfer,
        lockedTransfer: (0, utils_1.spokSamePubkey)(web3_js_1.PublicKey.default),
    });
    // revoke
    const { tx: revoketeTx } = yield API.revoke(delegate, manager.mint, manager.metadata, payer, payer, generated_1.RevokeArgs.LockedTransferV1, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield revoketeTx.assertSuccess(t);
    pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: null,
        delegateRole: null,
        lockedTransfer: null,
    });
}));
