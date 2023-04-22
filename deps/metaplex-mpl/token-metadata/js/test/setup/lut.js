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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAndSendV0Tx = exports.addAddressesToTable = exports.createLookupTable = void 0;
const web3_js_1 = require("@solana/web3.js");
function createLookupTable(authority, payer, handler, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        // get current `slot`
        const slot = yield connection.getSlot();
        // create an Address Lookup Table
        const [lookupTableIx, address] = web3_js_1.AddressLookupTableProgram.createLookupTable({
            authority: authority,
            payer: payer.publicKey,
            recentSlot: slot,
        });
        const tx = new web3_js_1.Transaction().add(lookupTableIx);
        // send the transaction
        return {
            tx: handler.sendAndConfirmTransaction(tx, [payer], 'tx: Create Lookup Table'),
            lookupTable: address,
        };
    });
}
exports.createLookupTable = createLookupTable;
function addAddressesToTable(lookupTable, authority, payer, addresses, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const addAddressesInstruction = web3_js_1.AddressLookupTableProgram.extendLookupTable({
            payer: payer.publicKey,
            authority,
            lookupTable,
            addresses,
        });
        return yield createAndSendV0Tx(payer, [addAddressesInstruction], connection);
    });
}
exports.addAddressesToTable = addAddressesToTable;
function createAndSendV0Tx(payer, instructions, connection, lookupTables = []) {
    return __awaiter(this, void 0, void 0, function* () {
        const latestBlockhash = yield connection.getLatestBlockhash('finalized');
        const messageV0 = new web3_js_1.TransactionMessage({
            payerKey: payer.publicKey,
            recentBlockhash: latestBlockhash.blockhash,
            instructions,
        }).compileToV0Message(lookupTables);
        // creates the versioned transaction
        const transaction = new web3_js_1.VersionedTransaction(messageV0);
        //console.log('Transaction size with address lookup: ' + transaction.serialize().length + ' bytes');
        transaction.sign([payer]);
        const signature = yield connection.sendTransaction(transaction, { maxRetries: 5 });
        const response = yield connection.confirmTransaction({
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        return { response, signature };
    });
}
exports.createAndSendV0Tx = createAndSendV0Tx;
