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
const programmable_1 = require("./utils/programmable");
const spl_token_1 = require("@solana/spl-token");
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('Burn: NonFungible asset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.NonFungible);
    const { mint, metadata, masterEdition, token } = daManager;
    const authority = payer;
    const amount = 1;
    const { tx: updateTx } = yield API.burn(handler, authority, mint, metadata, token, amount, masterEdition);
    yield updateTx.assertSuccess(t);
    // All three accounts are closed.
    const metadataAccount = yield connection.getAccountInfo(metadata);
    const editionAccount = yield connection.getAccountInfo(masterEdition);
    const tokenAccount = yield connection.getAccountInfo(token);
    t.equal(metadataAccount, null);
    t.equal(editionAccount, null);
    t.equal(tokenAccount, null);
}));
(0, tape_1.default)('Burn: ProgrammableNonFungible asset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    const { mint, metadata, masterEdition, token } = daManager;
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(mint, token);
    const authority = payer;
    const amount = 1;
    const { tx: updateTx } = yield API.burn(handler, authority, mint, metadata, token, amount, masterEdition, tokenRecord);
    yield updateTx.assertSuccess(t);
    // All three accounts are closed.
    const metadataAccount = yield connection.getAccountInfo(metadata);
    const editionAccount = yield connection.getAccountInfo(masterEdition);
    const tokenAccount = yield connection.getAccountInfo(token);
    const tokenRecordAccount = yield connection.getAccountInfo(tokenRecord);
    t.equal(metadataAccount, null);
    t.equal(editionAccount, null);
    t.equal(tokenAccount, null);
    t.equal(tokenRecordAccount, null);
}));
(0, tape_1.default)('Burn: Fungible', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const tokenAmount = 10;
    const daManager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.Fungible, null, tokenAmount);
    const { mint, metadata, token } = daManager;
    const authority = payer;
    const burnAmount = 1;
    const { tx: burnTx1 } = yield API.burn(handler, authority, mint, metadata, token, burnAmount);
    yield burnTx1.assertSuccess(t);
    // Metadata and token accounts are open and correct number of tokens remaining.
    const md = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, token, 'confirmed', spl_token_1.TOKEN_PROGRAM_ID);
    const remainingAmount = tokenAmount - burnAmount;
    t.equals(md.mint.toString(), mint.toString());
    t.true(tokenAccount.amount.toString() === remainingAmount.toString(), 'token account amount equal to 9');
    const { tx: burnTx2 } = yield API.burn(handler, authority, mint, metadata, token, remainingAmount);
    yield burnTx2.assertSuccess(t);
    // Metadata account should still be open but token account should be closed.
    const md2 = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    const tokenAccount2 = yield connection.getAccountInfo(token);
    t.equals(md2.mint.toString(), mint.toString());
    t.equal(tokenAccount2, null);
}));
(0, tape_1.default)('Burn: Fungible asset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const tokenAmount = 10;
    const daManager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.FungibleAsset, null, tokenAmount);
    const { mint, metadata, token } = daManager;
    const authority = payer;
    const burnAmount = 1;
    const { tx: burnTx1 } = yield API.burn(handler, authority, mint, metadata, token, burnAmount);
    yield burnTx1.assertSuccess(t);
    // Metadata and token accounts are open and correct number of tokens remaining.
    const md = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, token, 'confirmed', spl_token_1.TOKEN_PROGRAM_ID);
    const remainingAmount = tokenAmount - burnAmount;
    t.equals(md.mint.toString(), mint.toString());
    t.true(tokenAccount.amount.toString() === remainingAmount.toString(), 'token account amount equal to 9');
    const { tx: burnTx2 } = yield API.burn(handler, authority, mint, metadata, token, remainingAmount);
    yield burnTx2.assertSuccess(t);
    // Metadata account should still be open but token account should be closed.
    const md2 = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    const tokenAccount2 = yield connection.getAccountInfo(token);
    t.equals(md2.mint.toString(), mint.toString());
    t.equal(tokenAccount2, null);
}));
