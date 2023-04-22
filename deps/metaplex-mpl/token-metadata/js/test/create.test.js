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
const spok_1 = __importDefault(require("spok"));
const generated_1 = require("../src/generated");
const tape_1 = __importDefault(require("tape"));
const setup_1 = require("./setup");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const utils_1 = require("./utils");
const bn_js_1 = require("bn.js");
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('Create: ProgrammableNonFungible', (t) => __awaiter(void 0, void 0, void 0, function* () {
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
    const { tx: transaction, metadata: address } = yield API.create(t, payer, data, 0, 0, handler);
    // executes the transaction
    yield transaction.assertSuccess(t);
    const metadata = yield generated_1.Metadata.fromAccountAddress(connection, address);
    (0, spok_1.default)(t, metadata, {
        data: {
            sellerFeeBasisPoints: 0,
        },
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.ProgrammableNonFungible,
    });
    t.equal(metadata.data.name.replace(/\0+/, ''), 'ProgrammableNonFungible');
    t.equal(metadata.data.symbol.replace(/\0+/, ''), 'PNF');
    t.equal(metadata.data.uri.replace(/\0+/, ''), 'uri');
}));
(0, tape_1.default)('Create: ProgrammableNonFungible with existing mint account', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // initialize a mint account
    const { tx: mintTx, mint } = yield API.createMintAccount(payer, connection, handler);
    yield mintTx.assertSuccess(t);
    // create the metadata
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
    const { tx: transaction, metadata: address } = yield API.create(t, payer, data, 0, 0, handler, mint);
    // executes the transaction
    yield transaction.assertSuccess(t);
    const metadata = yield generated_1.Metadata.fromAccountAddress(connection, address);
    (0, spok_1.default)(t, metadata, {
        data: {
            sellerFeeBasisPoints: 0,
        },
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.ProgrammableNonFungible,
    });
    t.equal(metadata.data.name.replace(/\0+/, ''), 'ProgrammableNonFungible');
    t.equal(metadata.data.symbol.replace(/\0+/, ''), 'PNF');
    t.equal(metadata.data.uri.replace(/\0+/, ''), 'uri');
}));
(0, tape_1.default)('Create: fail to create ProgrammableNonFungible with minted mint account', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // initialize a mint account and mints one token
    const [mint, mintKeypair] = yield setup_1.amman.genLabeledKeypair('Mint Account');
    const tokenAccount = web3_js_1.PublicKey.findProgramAddressSync([payer.publicKey.toBuffer(), spl_token_1.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], utils_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID)[0];
    const ixs = [];
    ixs.push(web3_js_1.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: yield connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
        space: spl_token_1.MintLayout.span,
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    }));
    ixs.push((0, spl_token_1.createInitializeMintInstruction)(mint, 0, payer.publicKey, payer.publicKey));
    ixs.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, tokenAccount, payer.publicKey, mint));
    ixs.push((0, spl_token_1.createMintToInstruction)(mint, tokenAccount, payer.publicKey, 1, []));
    // candy machine mint instruction
    const tx = new web3_js_1.Transaction().add(...ixs);
    yield handler
        .sendAndConfirmTransaction(tx, [payer, mintKeypair], 'tx: Mint One Token')
        .assertSuccess(t);
    // create the metadata
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
    const { tx: transaction } = yield API.create(t, payer, data, 0, 0, handler, mint);
    // executes the transaction
    yield transaction.assertError(t, /Mint supply must be zero/);
}));
(0, tape_1.default)('Create: failt to create ProgrammableNonFungible with existing metadata account', (t) => __awaiter(void 0, void 0, void 0, function* () {
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
    const { tx: transaction, metadata: address, mint, } = yield API.create(t, payer, data, 0, 0, handler);
    // executes the transaction
    yield transaction.assertSuccess(t);
    const metadata = yield generated_1.Metadata.fromAccountAddress(connection, address);
    (0, spok_1.default)(t, metadata, {
        data: {
            sellerFeeBasisPoints: 0,
        },
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.ProgrammableNonFungible,
    });
    t.equal(metadata.data.name.replace(/\0+/, ''), 'ProgrammableNonFungible');
    t.equal(metadata.data.symbol.replace(/\0+/, ''), 'PNF');
    t.equal(metadata.data.uri.replace(/\0+/, ''), 'uri');
    // tries to create another metadata account to the mint
    const { tx: duplicatedTx } = yield API.create(t, payer, data, 0, 0, handler, mint);
    // executes the transaction
    yield duplicatedTx.assertError(t, /Mint authority provided does not match the authority/);
}));
(0, tape_1.default)('Create: failt to create ProgrammableNonFungible with existing master edition account', (t) => __awaiter(void 0, void 0, void 0, function* () {
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
    const { tx: transaction, metadata: address, masterEdition, } = yield API.create(t, payer, data, 0, 0, handler);
    // executes the transaction
    yield transaction.assertSuccess(t);
    const metadata = yield generated_1.Metadata.fromAccountAddress(connection, address);
    (0, spok_1.default)(t, metadata, {
        data: {
            sellerFeeBasisPoints: 0,
        },
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.ProgrammableNonFungible,
    });
    t.equal(metadata.data.name.replace(/\0+/, ''), 'ProgrammableNonFungible');
    t.equal(metadata.data.symbol.replace(/\0+/, ''), 'PNF');
    t.equal(metadata.data.uri.replace(/\0+/, ''), 'uri');
    // tries to create another metadata account to the mint
    const { tx: duplicatedTx } = yield API.create(t, payer, data, 0, 0, handler, null, null, masterEdition);
    // executes the transaction
    yield duplicatedTx.assertError(t, /Derived key invalid/);
}));
(0, tape_1.default)('Create: fail to create ProgrammableNonFungible without master edition', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer } = yield API.payer();
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
    // tries to create a metadata account
    const { tx: duplicatedTx } = yield API.create(t, payer, data, 0, 0, handler, null /* mint */, null /* metadata */, null /* masterEdition */, true /* skip master edition */);
    // executes the transaction
    yield duplicatedTx.assertError(t, /Missing master edition account/);
}));
(0, tape_1.default)('Create: fail to create NonFungible without master edition', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer } = yield API.payer();
    const data = {
        name: 'NonFungible',
        symbol: 'NF',
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
        tokenStandard: generated_1.TokenStandard.NonFungible,
        collection: null,
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: transaction } = yield API.create(t, payer, data, 0, 0, handler, null /* mint */, null /* metadata */, null /* masterEdition */, true /* skip master edition */);
    // executes the transaction
    yield transaction.assertError(t, /Missing master edition account/);
}));
(0, tape_1.default)('Create: create NonFungible with minted mint account', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // initialize a mint account and mints one token
    const [mint, mintKeypair] = yield setup_1.amman.genLabeledKeypair('Mint Account');
    const tokenAccount = web3_js_1.PublicKey.findProgramAddressSync([payer.publicKey.toBuffer(), spl_token_1.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], utils_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID)[0];
    const ixs = [];
    ixs.push(web3_js_1.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: yield connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
        space: spl_token_1.MintLayout.span,
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    }));
    ixs.push((0, spl_token_1.createInitializeMintInstruction)(mint, 0, payer.publicKey, payer.publicKey));
    ixs.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, tokenAccount, payer.publicKey, mint));
    ixs.push((0, spl_token_1.createMintToInstruction)(mint, tokenAccount, payer.publicKey, 1, []));
    // candy machine mint instruction
    const tx = new web3_js_1.Transaction().add(...ixs);
    yield handler
        .sendAndConfirmTransaction(tx, [payer, mintKeypair], 'tx: Mint One Token')
        .assertSuccess(t);
    // create the metadata
    const data = {
        name: 'NonFungible',
        symbol: 'NF',
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
        tokenStandard: generated_1.TokenStandard.NonFungible,
        collection: null,
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: transaction, metadata: address } = yield API.create(t, payer, data, 0, 0, handler, mint);
    // executes the transaction
    yield transaction.assertSuccess(t);
    const metadata = yield generated_1.Metadata.fromAccountAddress(connection, address);
    (0, spok_1.default)(t, metadata, {
        data: {
            sellerFeeBasisPoints: 0,
        },
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.NonFungible,
    });
    t.equal(metadata.data.name.replace(/\0+/, ''), 'NonFungible');
    t.equal(metadata.data.symbol.replace(/\0+/, ''), 'NF');
    t.equal(metadata.data.uri.replace(/\0+/, ''), 'uri');
}));
(0, tape_1.default)('Create: fail to create NonFungible with more than 2 mints', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // initialize a mint account and mints two tokens
    const [mint, mintKeypair] = yield setup_1.amman.genLabeledKeypair('Mint Account');
    const tokenAccount = web3_js_1.PublicKey.findProgramAddressSync([payer.publicKey.toBuffer(), spl_token_1.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], utils_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID)[0];
    const ixs = [];
    ixs.push(web3_js_1.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: yield connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
        space: spl_token_1.MintLayout.span,
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    }));
    ixs.push((0, spl_token_1.createInitializeMintInstruction)(mint, 0, payer.publicKey, payer.publicKey));
    ixs.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, tokenAccount, payer.publicKey, mint));
    ixs.push((0, spl_token_1.createMintToInstruction)(mint, tokenAccount, payer.publicKey, 2, []));
    // candy machine mint instruction
    const tx = new web3_js_1.Transaction().add(...ixs);
    yield handler
        .sendAndConfirmTransaction(tx, [payer, mintKeypair], 'tx: Mint Two Tokens')
        .assertSuccess(t);
    // create the metadata
    const data = {
        name: 'NonFungible',
        symbol: 'NF',
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
        tokenStandard: generated_1.TokenStandard.NonFungible,
        collection: null,
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: transaction } = yield API.create(t, payer, data, 0, 0, handler, mint);
    // executes the transaction
    yield transaction.assertError(t, /Invalid mint account/);
}));
(0, tape_1.default)('Create: Fungible', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const data = {
        name: 'Fungible',
        symbol: 'FUN',
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
        tokenStandard: generated_1.TokenStandard.Fungible,
        collection: null,
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: transaction, metadata: address, mint, } = yield API.create(t, payer, data, 9, 0, handler);
    // executes the transaction
    yield transaction.assertSuccess(t);
    const metadata = yield generated_1.Metadata.fromAccountAddress(connection, address);
    (0, spok_1.default)(t, metadata, {
        data: {
            sellerFeeBasisPoints: 0,
        },
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.Fungible,
    });
    t.equal(metadata.data.name.replace(/\0+/, ''), 'Fungible');
    t.equal(metadata.data.symbol.replace(/\0+/, ''), 'FUN');
    t.equal(metadata.data.uri.replace(/\0+/, ''), 'uri');
    const mintAccount = yield (0, spl_token_1.getMint)(connection, mint);
    (0, spok_1.default)(t, mintAccount, {
        decimals: 9,
        supply: (0, utils_1.spokSameBigint)(new bn_js_1.BN(0)),
        mintAuthority: (0, utils_1.spokSamePubkey)(payer.publicKey),
    });
}));
(0, tape_1.default)('Create: FungibleAsset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const data = {
        name: 'FungibleAsset',
        symbol: 'FA',
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
        tokenStandard: generated_1.TokenStandard.FungibleAsset,
        collection: null,
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: transaction, metadata: address, mint, } = yield API.create(t, payer, data, 2, 0, handler);
    // executes the transaction
    yield transaction.assertSuccess(t);
    const metadata = yield generated_1.Metadata.fromAccountAddress(connection, address);
    (0, spok_1.default)(t, metadata, {
        data: {
            sellerFeeBasisPoints: 0,
        },
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.FungibleAsset,
    });
    t.equal(metadata.data.name.replace(/\0+/, ''), 'FungibleAsset');
    t.equal(metadata.data.symbol.replace(/\0+/, ''), 'FA');
    t.equal(metadata.data.uri.replace(/\0+/, ''), 'uri');
    const mintAccount = yield (0, spl_token_1.getMint)(connection, mint);
    (0, spok_1.default)(t, mintAccount, {
        decimals: 2,
        supply: (0, utils_1.spokSameBigint)(new bn_js_1.BN(0)),
        mintAuthority: (0, utils_1.spokSamePubkey)(payer.publicKey),
    });
}));
(0, tape_1.default)('Create: create Fungible with minted mint account', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // initialize a mint account and mints one token
    const [mint, mintKeypair] = yield setup_1.amman.genLabeledKeypair('Mint Account');
    const tokenAccount = web3_js_1.PublicKey.findProgramAddressSync([payer.publicKey.toBuffer(), spl_token_1.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], utils_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID)[0];
    const ixs = [];
    ixs.push(web3_js_1.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: yield connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
        space: spl_token_1.MintLayout.span,
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    }));
    ixs.push((0, spl_token_1.createInitializeMintInstruction)(mint, 5, payer.publicKey, payer.publicKey));
    ixs.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, tokenAccount, payer.publicKey, mint));
    ixs.push((0, spl_token_1.createMintToInstruction)(mint, tokenAccount, payer.publicKey, 100, []));
    // candy machine mint instruction
    const tx = new web3_js_1.Transaction().add(...ixs);
    yield handler
        .sendAndConfirmTransaction(tx, [payer, mintKeypair], 'tx: Mint 100 Tokens')
        .assertSuccess(t);
    // create the metadata
    const data = {
        name: 'Fungible',
        symbol: 'FUN',
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
        tokenStandard: generated_1.TokenStandard.Fungible,
        collection: null,
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: transaction, metadata: address } = yield API.create(t, payer, data, 0, 0, handler, mint);
    // executes the transaction
    yield transaction.assertSuccess(t);
    const metadata = yield generated_1.Metadata.fromAccountAddress(connection, address);
    (0, spok_1.default)(t, metadata, {
        data: {
            sellerFeeBasisPoints: 0,
        },
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.Fungible,
    });
    t.equal(metadata.data.name.replace(/\0+/, ''), 'Fungible');
    t.equal(metadata.data.symbol.replace(/\0+/, ''), 'FUN');
    t.equal(metadata.data.uri.replace(/\0+/, ''), 'uri');
}));
(0, tape_1.default)('Create: create FungibleAsset with minted mint account', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // initialize a mint account and mints one token
    const [mint, mintKeypair] = yield setup_1.amman.genLabeledKeypair('Mint Account');
    const tokenAccount = web3_js_1.PublicKey.findProgramAddressSync([payer.publicKey.toBuffer(), spl_token_1.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], utils_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID)[0];
    const ixs = [];
    ixs.push(web3_js_1.SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        lamports: yield connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
        space: spl_token_1.MintLayout.span,
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    }));
    ixs.push((0, spl_token_1.createInitializeMintInstruction)(mint, 5, payer.publicKey, payer.publicKey));
    ixs.push((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, tokenAccount, payer.publicKey, mint));
    ixs.push((0, spl_token_1.createMintToInstruction)(mint, tokenAccount, payer.publicKey, 100, []));
    // candy machine mint instruction
    const tx = new web3_js_1.Transaction().add(...ixs);
    yield handler
        .sendAndConfirmTransaction(tx, [payer, mintKeypair], 'tx: Mint 100 Tokens')
        .assertSuccess(t);
    // create the metadata
    const data = {
        name: 'FungibleAsset',
        symbol: 'FA',
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
        tokenStandard: generated_1.TokenStandard.FungibleAsset,
        collection: null,
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: transaction, metadata: address } = yield API.create(t, payer, data, 0, 0, handler, mint);
    // executes the transaction
    yield transaction.assertSuccess(t);
    const metadata = yield generated_1.Metadata.fromAccountAddress(connection, address);
    (0, spok_1.default)(t, metadata, {
        data: {
            sellerFeeBasisPoints: 0,
        },
        primarySaleHappened: false,
        isMutable: true,
        tokenStandard: generated_1.TokenStandard.FungibleAsset,
    });
    t.equal(metadata.data.name.replace(/\0+/, ''), 'FungibleAsset');
    t.equal(metadata.data.symbol.replace(/\0+/, ''), 'FA');
    t.equal(metadata.data.uri.replace(/\0+/, ''), 'uri');
}));
