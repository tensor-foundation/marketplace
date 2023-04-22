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
exports.updateMetadataFromCache = exports.updateFromCache = void 0;
const web3_js_1 = require("@solana/web3.js");
const transactions_1 = require("../helpers/transactions");
const borsh_1 = require("borsh");
const loglevel_1 = __importDefault(require("loglevel"));
const various_1 = require("../helpers/various");
const signAll_1 = require("./signAll");
const instructions_1 = require("../helpers/instructions");
const schema_1 = require("../helpers/schema");
const accounts_1 = require("../helpers/accounts");
const SIGNING_INTERVAL = 60 * 1000; //60s
function updateFromCache(connection, wallet, candyMachineAddress, batchSize, daemon, cacheContent, newCacheContent) {
    return __awaiter(this, void 0, void 0, function* () {
        if (daemon) {
            // noinspection InfiniteLoopJS
            for (;;) {
                yield updateMetadataFromCache(candyMachineAddress, connection, wallet, batchSize, cacheContent, newCacheContent);
                yield (0, various_1.sleep)(SIGNING_INTERVAL);
            }
        }
        else {
            yield updateMetadataFromCache(candyMachineAddress, connection, wallet, batchSize, cacheContent, newCacheContent);
        }
    });
}
exports.updateFromCache = updateFromCache;
function updateMetadataFromCache(candyMachineAddress, connection, wallet, batchSize, cacheContent, newCacheContent) {
    return __awaiter(this, void 0, void 0, function* () {
        const [candyMachineAddr] = yield (0, accounts_1.deriveCandyMachineV2ProgramAddress)(new web3_js_1.PublicKey(candyMachineAddress));
        candyMachineAddress = candyMachineAddr.toBase58();
        const metadataByCandyMachine = yield (0, signAll_1.getAccountsByCreatorAddress)(candyMachineAddress, connection);
        const differences = {};
        for (let i = 0; i < Object.keys(cacheContent.items).length; i++) {
            if (cacheContent.items[i.toString()].link !=
                newCacheContent.items[i.toString()].link) {
                differences[cacheContent.items[i.toString()].link] =
                    newCacheContent.items[i.toString()].link;
            }
        }
        const toUpdate = metadataByCandyMachine.filter(m => !!differences[m[0].data.uri]);
        loglevel_1.default.info('Found', toUpdate.length, 'uris to update');
        let total = 0;
        while (toUpdate.length > 0) {
            loglevel_1.default.debug('Signing metadata ');
            let sliceAmount = batchSize;
            if (toUpdate.length < batchSize) {
                sliceAmount = toUpdate.length;
            }
            const removed = toUpdate.splice(0, sliceAmount);
            total += sliceAmount;
            yield (0, signAll_1.delay)(500);
            yield updateMetadataBatch(removed, connection, wallet, differences);
            loglevel_1.default.debug(`Processed ${total} nfts`);
        }
        loglevel_1.default.info(`Finished signing metadata for ${total} NFTs`);
    });
}
exports.updateMetadataFromCache = updateMetadataFromCache;
function updateMetadataBatch(metadataList, connection, keypair, differences) {
    return __awaiter(this, void 0, void 0, function* () {
        const instructions = metadataList.map(meta => {
            const newData = new schema_1.Data(Object.assign(Object.assign({}, meta[0].data), { creators: meta[0].data.creators.map(c => new schema_1.Creator(Object.assign(Object.assign({}, c), { address: new web3_js_1.PublicKey(c.address).toBase58() }))), uri: differences[meta[0].data.uri] }));
            const value = new schema_1.UpdateMetadataArgs({
                data: newData,
                updateAuthority: keypair.publicKey.toBase58(),
                primarySaleHappened: null,
            });
            const txnData = Buffer.from((0, borsh_1.serialize)(schema_1.METADATA_SCHEMA, value));
            return (0, instructions_1.createUpdateMetadataInstruction)(new web3_js_1.PublicKey(meta[1]), keypair.publicKey, txnData);
        });
        yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(connection, keypair, instructions, [], 'single');
    });
}
