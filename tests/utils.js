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
exports.createLUT = exports.updateLUT = exports.calcFees = exports.FEE_PCT = exports.DEFAULT_DEPTH_SIZE = exports.calcMinRent = exports.simulateTxTable = exports.tcompSdk = exports.TEST_KEYPAIR = exports.TEST_PROVIDER = exports.cartesian = exports.withLamports = exports.buildAndSendTx = exports.getLamports = exports.ALRADY_IN_USE_ERR = exports.HAS_ONE_ERR = exports.INTEGER_OVERFLOW_ERR = exports.ACCT_NOT_EXISTS_ERR = exports.waitMS = exports.stringifyPKsAndBNs = exports.hexCode = void 0;
const anchor = __importStar(require("@project-serum/anchor"));
const anchor_1 = require("@project-serum/anchor");
const solana_contrib_1 = require("@saberhq/solana-contrib");
const web3_js_1 = require("@solana/web3.js");
const exponential_backoff_1 = require("exponential-backoff");
const path_1 = require("path");
const src_1 = require("../src");
const shared_1 = require("../src/shared");
const tensor_common_1 = require("@tensor-hq/tensor-common");
const spl_account_compression_1 = require("@solana/spl-account-compression");
const spl_token_1 = require("@solana/spl-token");
// Exporting these here vs in each .test.ts file prevents weird undefined issues.
var src_2 = require("../src");
Object.defineProperty(exports, "hexCode", { enumerable: true, get: function () { return src_2.hexCode; } });
Object.defineProperty(exports, "stringifyPKsAndBNs", { enumerable: true, get: function () { return src_2.stringifyPKsAndBNs; } });
var tensor_common_2 = require("@tensor-hq/tensor-common");
Object.defineProperty(exports, "waitMS", { enumerable: true, get: function () { return tensor_common_2.waitMS; } });
exports.ACCT_NOT_EXISTS_ERR = "Account does not exist";
// Vipers IntegerOverflow error.
exports.INTEGER_OVERFLOW_ERR = "0x44f";
exports.HAS_ONE_ERR = "0x7d1";
exports.ALRADY_IN_USE_ERR = "0x0";
const getLamports = (acct) => (0, shared_1.getLamports)(exports.TEST_PROVIDER.connection, acct);
exports.getLamports = getLamports;
const buildAndSendTx = ({ provider = exports.TEST_PROVIDER, ixs, extraSigners, opts, debug, lookupTableAccounts, blockhash, }) => __awaiter(void 0, void 0, void 0, function* () {
    let tx;
    if ((0, src_1.isNullLike)(lookupTableAccounts)) {
        //build legacy
        ({ tx } = yield (0, exponential_backoff_1.backOff)(() => (0, tensor_common_1.buildTx)({
            connections: [provider.connection],
            instructions: ixs,
            additionalSigners: extraSigners,
            feePayer: provider.publicKey,
        }), {
            // Retry blockhash errors (happens during tests sometimes).
            retry: (e) => {
                return e.message.includes("blockhash");
            },
        }));
        //sometimes have to pass manually, eg when updating LUT
        if (!!blockhash) {
            tx.recentBlockhash = blockhash;
        }
        yield provider.wallet.signTransaction(tx);
    }
    else {
        //build v0
        ({ tx } = yield (0, exponential_backoff_1.backOff)(() => (0, tensor_common_1.buildTxV0)({
            connections: [provider.connection],
            instructions: ixs,
            //have to add TEST_KEYPAIR here instead of wallet.signTx() since partialSign not impl on v0 txs
            additionalSigners: [exports.TEST_KEYPAIR, ...(extraSigners !== null && extraSigners !== void 0 ? extraSigners : [])],
            feePayer: provider.publicKey,
            addressLookupTableAccs: lookupTableAccounts,
        }), {
            // Retry blockhash errors (happens during tests sometimes).
            retry: (e) => {
                return e.message.includes("blockhash");
            },
        }));
    }
    try {
        if (debug)
            opts = Object.assign(Object.assign({}, opts), { commitment: "confirmed" });
        const sig = yield provider.connection.sendRawTransaction(tx.serialize({ verifySignatures: false }), opts);
        yield provider.connection.confirmTransaction(sig, "confirmed");
        if (debug) {
            console.log(yield provider.connection.getTransaction(sig, {
                commitment: "confirmed",
            }));
        }
        return sig;
    }
    catch (e) {
        //this is needed to see program error logs
        console.error("❌ FAILED TO SEND TX, FULL ERROR: ❌");
        console.error(e);
        throw e;
    }
});
exports.buildAndSendTx = buildAndSendTx;
// This passes the accounts' lamports before the provided `callback` function is called.
// Useful for doing before/after lamports diffing.
//
// Example:
// ```
// // Create tx...
// await withLamports(
//   { prevLamports: traderA.publicKey, prevEscrowLamports: solEscrowPda },
//   async ({ prevLamports, prevEscrowLamports }) => {
//     // Actually send tx
//     await buildAndSendTx({...});
//     const currlamports = await getLamports(traderA.publicKey);
//     // Compare currlamports w/ prevLamports
//   })
// );
// ```
const withLamports = (accts, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const results = Object.fromEntries(yield Promise.all(Object.entries(accts).map(([k, key]) => __awaiter(void 0, void 0, void 0, function* () {
        return [
            k,
            yield (0, exports.getLamports)(key),
        ];
    }))));
    return yield callback(results);
});
exports.withLamports = withLamports;
// Lets you form the cartesian/cross product of a bunch of parameters, useful for tests with a ladder.
//
// Example:
// ```
// await Promise.all(
//   cartesian([traderA, traderB], [nftPoolConfig, tradePoolConfig]).map(
//     async ([owner, config]) => {
//        // Do stuff
//     }
//   )
// );
// ```
const cartesian = (...arr) => arr.reduce((a, b) => a.flatMap((c) => b.map((d) => [...c, d])), [[]]);
exports.cartesian = cartesian;
//(!) provider used across all tests
process.env.ANCHOR_WALLET = (0, path_1.resolve)(__dirname, "test-keypair.json");
exports.TEST_PROVIDER = anchor.AnchorProvider.local();
exports.TEST_KEYPAIR = web3_js_1.Keypair.fromSecretKey(Buffer.from(JSON.parse(require("fs").readFileSync(process.env.ANCHOR_WALLET, {
    encoding: "utf-8",
}))));
exports.tcompSdk = new src_1.TCompSDK({ provider: exports.TEST_PROVIDER });
//useful for debugging
const simulateTxTable = (ixs) => __awaiter(void 0, void 0, void 0, function* () {
    const broadcaster = new solana_contrib_1.SingleConnectionBroadcaster(exports.TEST_PROVIDER.connection);
    const wallet = new anchor_1.Wallet(web3_js_1.Keypair.generate());
    const provider = new solana_contrib_1.SolanaProvider(exports.TEST_PROVIDER.connection, broadcaster, wallet);
    const tx = new solana_contrib_1.TransactionEnvelope(provider, ixs);
    console.log(yield tx.simulateTable());
});
exports.simulateTxTable = simulateTxTable;
const calcMinRent = (address) => __awaiter(void 0, void 0, void 0, function* () {
    const acc = yield exports.TEST_PROVIDER.connection.getAccountInfo(address);
    if (acc) {
        console.log("min rent is", yield exports.TEST_PROVIDER.connection.getMinimumBalanceForRentExemption(acc.data.length));
    }
    else {
        console.log("acc not found");
    }
});
exports.calcMinRent = calcMinRent;
exports.DEFAULT_DEPTH_SIZE = {
    maxDepth: 14,
    maxBufferSize: 64,
};
exports.FEE_PCT = src_1.FEE_BPS / 1e4;
const calcFees = (amount) => {
    const totalFee = Math.trunc(amount * exports.FEE_PCT);
    const brokerFee = Math.trunc((totalFee * src_1.TAKER_BROKER_PCT) / 100);
    const tcompFee = totalFee - brokerFee;
    return { totalFee, brokerFee, tcompFee };
};
exports.calcFees = calcFees;
const updateLUT = ({ provider = exports.TEST_PROVIDER, committment = "finalized", lookupTableAddress, addresses, }) => __awaiter(void 0, void 0, void 0, function* () {
    const conn = provider.connection;
    //needed else we keep refetching the blockhash
    const blockhash = (yield conn.getLatestBlockhash(committment)).blockhash;
    console.log("blockhash", blockhash);
    //add NEW addresses ONLY
    const extendInstruction = web3_js_1.AddressLookupTableProgram.extendLookupTable({
        payer: provider.publicKey,
        authority: provider.publicKey,
        lookupTable: lookupTableAddress,
        addresses,
    });
    let done = false;
    while (!done) {
        try {
            yield (0, exports.buildAndSendTx)({
                provider,
                ixs: [extendInstruction],
                blockhash,
            });
            done = true;
        }
        catch (e) {
            console.log("failed, try again in 5");
            yield (0, tensor_common_1.waitMS)(5000);
        }
    }
    //fetch (this will actually show wrong the first time, need to rerun
    const lookupTableAccount = (yield conn.getAddressLookupTable(lookupTableAddress)).value;
    console.log("updated LUT", lookupTableAccount);
});
exports.updateLUT = updateLUT;
const createLUT = (provider = exports.TEST_PROVIDER, slotCommitment = "finalized") => __awaiter(void 0, void 0, void 0, function* () {
    const conn = provider.connection;
    //use finalized, otherwise get "is not a recent slot err"
    const slot = yield conn.getSlot(slotCommitment);
    //create
    const [lookupTableInst, lookupTableAddress] = web3_js_1.AddressLookupTableProgram.createLookupTable({
        authority: provider.publicKey,
        payer: provider.publicKey,
        recentSlot: slot,
    });
    //see if already created
    let lookupTableAccount = (yield conn.getAddressLookupTable(lookupTableAddress)).value;
    if (!!lookupTableAccount) {
        console.log("LUT exists", lookupTableAddress.toBase58());
        return lookupTableAccount;
    }
    console.log("LUT missing");
    const [tcomp] = (0, src_1.findTCompPda)({});
    //add addresses
    const extendInstruction = web3_js_1.AddressLookupTableProgram.extendLookupTable({
        payer: provider.publicKey,
        authority: provider.publicKey,
        lookupTable: lookupTableAddress,
        addresses: [
            spl_account_compression_1.SPL_NOOP_PROGRAM_ID,
            spl_account_compression_1.SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            web3_js_1.SystemProgram.programId,
            src_1.BUBBLEGUM_PROGRAM_ID,
            tcomp,
            //for spl payments
            spl_token_1.TOKEN_PROGRAM_ID,
            spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
            //margin
            tensor_common_1.TENSORSWAP_ADDR,
            //future proofing
            web3_js_1.SYSVAR_RENT_PUBKEY,
            tensor_common_1.AUTH_PROG_ID,
            tensor_common_1.TMETA_PROG_ID,
            web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
        ],
    });
    let done = false;
    while (!done) {
        try {
            yield (0, exports.buildAndSendTx)({
                provider,
                ixs: [lookupTableInst, extendInstruction],
            });
            done = true;
        }
        catch (e) {
            console.log("failed, try again in 5");
            yield (0, tensor_common_1.waitMS)(5000);
        }
    }
    console.log("new LUT created", lookupTableAddress.toBase58());
    //fetch
    lookupTableAccount = (yield conn.getAddressLookupTable(lookupTableAddress))
        .value;
    return lookupTableAccount;
});
exports.createLUT = createLUT;
