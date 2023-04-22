"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.killStuckProcess = exports.connectionURL = exports.DEVNET = exports.logDebug = exports.createAndSignTransaction = exports.sleep = void 0;
const debug_1 = __importDefault(require("debug"));
const tape_1 = __importDefault(require("tape"));
const web3_js_1 = require("@solana/web3.js");
const amman_1 = require("@metaplex-foundation/amman");
var sleep_1 = require("./sleep");
Object.defineProperty(exports, "sleep", { enumerable: true, get: function () { return sleep_1.sleep; } });
var createAndSignTransaction_1 = require("./createAndSignTransaction");
Object.defineProperty(exports, "createAndSignTransaction", { enumerable: true, get: function () { return createAndSignTransaction_1.createAndSignTransaction; } });
exports.logDebug = (0, debug_1.default)('mpl:fp-test:debug');
exports.DEVNET = (0, web3_js_1.clusterApiUrl)('devnet');
exports.connectionURL = process.env.USE_DEVNET != null ? exports.DEVNET : amman_1.LOCALHOST;
function killStuckProcess() {
    // solana web socket keeps process alive for longer than necessary which we
    // "fix" here
    tape_1.default.onFinish(() => process.exit(0));
}
exports.killStuckProcess = killStuckProcess;
