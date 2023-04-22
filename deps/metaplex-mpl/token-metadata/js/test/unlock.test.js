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
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const spok_1 = __importDefault(require("spok"));
const generated_1 = require("../src/generated");
const tape_1 = __importDefault(require("tape"));
const setup_1 = require("./setup");
const utils_1 = require("./utils");
const digital_asset_manager_1 = require("./utils/digital-asset-manager");
const programmable_1 = require("./utils/programmable");
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('Unlock: owner unlock NonFungible asset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.NonFungible);
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            amount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
            isFrozen: false,
            owner: payer.publicKey,
        });
    }
    // creates a delegate
    const [, delegate] = yield API.getKeypair('Delegate');
    const args = {
        __kind: 'StandardV1',
        amount: 1,
    };
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token);
    yield delegateTx.assertSuccess(t);
    // lock asset
    const { tx: lockTx } = yield API.lock(delegate, manager.mint, manager.metadata, manager.token, payer, handler, null, null, manager.masterEdition);
    yield lockTx.assertSuccess(t);
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            isFrozen: true,
        });
    }
    // unlock asset
    const { tx: unlockTx } = yield API.unlock(payer, manager.mint, manager.metadata, manager.token, payer, handler, null, manager.masterEdition);
    yield unlockTx.assertError(t, /Invalid authority type/);
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            isFrozen: true,
        });
    }
}));
(0, tape_1.default)('Unlock: owner unlock ProgrammableNonFungible asset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            amount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
            isFrozen: true,
            owner: payer.publicKey,
        });
    }
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    let pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        state: generated_1.TokenState.Unlocked /* asset should be unlocked */,
    });
    // creates a delegate
    const [, delegate] = yield API.getKeypair('Delegate');
    const args = {
        __kind: 'UtilityV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // lock asset
    const { tx: lockTx } = yield API.lock(delegate, manager.mint, manager.metadata, manager.token, payer, handler, tokenRecord, manager.masterEdition);
    yield lockTx.assertSuccess(t);
    pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        state: generated_1.TokenState.Locked /* asset should be locked */,
    });
    // unlock asset
    const { tx: unlockTx } = yield API.unlock(payer, manager.mint, manager.metadata, manager.token, payer, handler, tokenRecord, manager.masterEdition);
    yield unlockTx.assertError(t, /Invalid authority type/);
    pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        state: generated_1.TokenState.Locked /* should be unlocked still */,
    });
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            isFrozen: true,
        });
    }
}));
(0, tape_1.default)('Unlock: unlock Fungible asset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.Fungible, null, 100);
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            amount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(100)),
            isFrozen: false,
            owner: payer.publicKey,
        });
    }
    // lock asset
    const { tx: lockTx } = yield API.lock(payer, manager.mint, manager.metadata, manager.token, payer, handler, null, payer.publicKey);
    yield lockTx.assertSuccess(t);
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            isFrozen: true,
        });
    }
    // unlock asset
    const { tx: unlockTx } = yield API.unlock(payer, manager.mint, manager.metadata, manager.token, payer, handler, null, payer.publicKey);
    yield unlockTx.assertSuccess(t);
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            isFrozen: false,
        });
    }
}));
(0, tape_1.default)('Unlock: delegate unlock NonFungible asset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.NonFungible);
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            amount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
            isFrozen: false,
            owner: payer.publicKey,
        });
    }
    // creates a delegate
    const [, delegate] = yield API.getKeypair('Delegate');
    const args = {
        __kind: 'StandardV1',
        amount: 1,
    };
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token);
    yield delegateTx.assertSuccess(t);
    // lock asset with delegate
    const { tx: utilityTx } = yield API.lock(delegate, manager.mint, manager.metadata, manager.token, payer, handler, null, null, manager.masterEdition);
    yield utilityTx.assertSuccess(t);
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            isFrozen: true,
        });
    }
    // unlock asset with delegate
    const { tx: unlockTx } = yield API.unlock(delegate, manager.mint, manager.metadata, manager.token, payer, handler, null, null, manager.masterEdition);
    yield unlockTx.assertSuccess(t);
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            isFrozen: false,
        });
    }
}));
(0, tape_1.default)('Unlock: LockedTransfer delegate unlock ProgrammableNonFungible asset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const manager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    if (manager.token) {
        const tokenAccount = yield (0, spl_token_1.getAccount)(connection, manager.token);
        (0, spok_1.default)(t, tokenAccount, {
            amount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
            isFrozen: true,
            owner: payer.publicKey,
        });
    }
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(manager.mint, manager.token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    let pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        state: generated_1.TokenState.Unlocked /* asset should be unlocked */,
    });
    // creates a delegate
    const [, delegate] = yield API.getKeypair('Delegate');
    const args = {
        __kind: 'LockedTransferV1',
        amount: 1,
        lockedAddress: web3_js_1.PublicKey.default,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, manager.mint, manager.metadata, payer.publicKey, payer, args, handler, null, manager.masterEdition, manager.token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // lock asset with delegate
    const { tx: lockTx } = yield API.lock(delegate, manager.mint, manager.metadata, manager.token, payer, handler, tokenRecord, null, manager.masterEdition);
    yield lockTx.assertSuccess(t);
    pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        state: generated_1.TokenState.Locked /* asset should be locked */,
        delegateRole: generated_1.TokenDelegateRole.LockedTransfer,
        lockedTransfer: web3_js_1.PublicKey.default,
    });
    // unlocks the token
    // unlock asset with delegate
    const { tx: unlockTx } = yield API.unlock(delegate, manager.mint, manager.metadata, manager.token, payer, handler, tokenRecord, null, manager.masterEdition);
    yield unlockTx.assertSuccess(t);
    pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        state: generated_1.TokenState.Unlocked /* should be unlocked */,
        delegateRole: generated_1.TokenDelegateRole.LockedTransfer,
        lockedTransfer: web3_js_1.PublicKey.default,
    });
}));
