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
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('Mint: ProgrammableNonFungible', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const data = {
        name: 'ProgrammableNonFungible',
        symbol: 'PNF',
        uri: 'uri',
        sellerFeeBasisPoints: 0,
        creators: [
            {
                address: payer.publicKey,
                share: 100,
                verified: false,
            },
        ],
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.ProgrammableNonFungible,
        collection: null,
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: createTx, metadata, mint } = yield API.create(t, payer, data, 0, 0, handler);
    yield createTx.assertSuccess(t);
    // mint 1 asset
    const amount = 1;
    const [masterEdition] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('metadata'), generated_1.PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')], generated_1.PROGRAM_ID);
    setup_1.amman.addr.addLabel('Master Edition Account', masterEdition);
    const daManager = new digital_asset_manager_1.DigitalAssetManager(mint, metadata, masterEdition);
    const { tx: mintTx, token } = yield API.mint(t, connection, payer, mint, metadata, masterEdition, daManager.emptyAuthorizationData(), amount, handler);
    yield mintTx.assertSuccess(t);
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, token);
    (0, spok_1.default)(t, tokenAccount, {
        amount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        isFrozen: true,
        owner: payer.publicKey,
    });
}));
(0, tape_1.default)('Mint: ProgrammableNonFungible with existing token account', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const data = {
        name: 'ProgrammableNonFungible',
        symbol: 'PNF',
        uri: 'uri',
        sellerFeeBasisPoints: 0,
        creators: [
            {
                address: payer.publicKey,
                share: 100,
                verified: false,
            },
        ],
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.ProgrammableNonFungible,
        collection: null,
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: createTx, metadata, mint } = yield API.create(t, payer, data, 0, 0, handler);
    yield createTx.assertSuccess(t);
    // initialize a token account
    const { tx: tokenTx, token } = yield API.createTokenAccount(mint, payer, connection, handler, payer.publicKey);
    yield tokenTx.assertSuccess(t);
    // mint 1 asset
    const amount = 1;
    const [masterEdition] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('metadata'), generated_1.PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')], generated_1.PROGRAM_ID);
    setup_1.amman.addr.addLabel('Master Edition Account', masterEdition);
    const daManager = new digital_asset_manager_1.DigitalAssetManager(mint, metadata, masterEdition);
    const { tx: mintTx } = yield API.mint(t, connection, payer, mint, metadata, masterEdition, daManager.emptyAuthorizationData(), amount, handler, token);
    yield mintTx.assertSuccess(t);
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, token);
    (0, spok_1.default)(t, tokenAccount, {
        amount: (0, utils_1.spokSameBigint)(new bn_js_1.BN(1)),
        isFrozen: true,
        owner: payer.publicKey,
    });
}));
(0, tape_1.default)('Mint: fail to mint zero (0) tokens from ProgrammableNonFungible', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const data = {
        name: 'ProgrammableNonFungible',
        symbol: 'PNF',
        uri: 'uri',
        sellerFeeBasisPoints: 0,
        creators: [
            {
                address: payer.publicKey,
                share: 100,
                verified: false,
            },
        ],
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.ProgrammableNonFungible,
        collection: null,
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: createTx, metadata, mint } = yield API.create(t, payer, data, 0, 0, handler);
    yield createTx.assertSuccess(t);
    // mint 0 asset
    const [masterEdition] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('metadata'), generated_1.PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')], generated_1.PROGRAM_ID);
    setup_1.amman.addr.addLabel('Master Edition Account', masterEdition);
    const daManager = new digital_asset_manager_1.DigitalAssetManager(mint, metadata, masterEdition);
    const { tx: mintTx } = yield API.mint(t, connection, payer, mint, metadata, masterEdition, daManager.emptyAuthorizationData(), 0, handler);
    yield mintTx.assertError(t, /Amount must be greater than zero/);
}));
(0, tape_1.default)('Mint: fail to mint multiple from ProgrammableNonFungible', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const data = {
        name: 'ProgrammableNonFungible',
        symbol: 'PNF',
        uri: 'uri',
        sellerFeeBasisPoints: 0,
        creators: [
            {
                address: payer.publicKey,
                share: 100,
                verified: false,
            },
        ],
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.ProgrammableNonFungible,
        collection: null,
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: createTx, metadata, mint } = yield API.create(t, payer, data, 0, 0, handler);
    yield createTx.assertSuccess(t);
    // tries to mint 2 asset
    const [masterEdition] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('metadata'), generated_1.PROGRAM_ID.toBuffer(), mint.toBuffer(), Buffer.from('edition')], generated_1.PROGRAM_ID);
    setup_1.amman.addr.addLabel('Master Edition Account', masterEdition);
    const manager = new digital_asset_manager_1.DigitalAssetManager(mint, metadata, masterEdition);
    const { tx: multipleMintTx } = yield API.mint(t, connection, payer, mint, metadata, masterEdition, manager.emptyAuthorizationData(), 2, handler);
    yield multipleMintTx.assertError(t, /Editions must have exactly one token/);
    // tries to mint 1 asset
    const { tx: mintTx } = yield API.mint(t, connection, payer, mint, metadata, masterEdition, manager.emptyAuthorizationData(), 1, handler);
    yield mintTx.assertSuccess(t);
    // tries to mint another one asset
    const { tx: mintTx2 } = yield API.mint(t, connection, payer, mint, metadata, masterEdition, manager.emptyAuthorizationData(), 1, handler);
    yield mintTx2.assertError(t, /Editions must have exactly one token/);
}));
