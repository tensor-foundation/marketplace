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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSamePubkey = exports.assertIsNotNull = exports.spokSamePubkey = exports.spokSameBigint = exports.spokSameBignum = exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = void 0;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
__exportStar(require("./errors"), exports);
exports.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new web3_js_1.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
function spokSameBignum(a) {
    const same = (b) => {
        if (a == null && b == null) {
            return true;
        }
        if (a == null) {
            return false;
        }
        return b != null && new bn_js_1.default(a).eq(new bn_js_1.default(b));
    };
    same.$spec = `spokSameBignum(${a})`;
    same.$description = `${a} equal`;
    return same;
}
exports.spokSameBignum = spokSameBignum;
function spokSameBigint(a) {
    const same = (b) => {
        if (a == null && b == null) {
            return true;
        }
        if (a == null) {
            return false;
        }
        return b != null && new bn_js_1.default(a.toString()).eq(new bn_js_1.default(b.toString()));
    };
    same.$spec = `spokSameBigint(${a})`;
    same.$description = `${a} equal`;
    return same;
}
exports.spokSameBigint = spokSameBigint;
function spokSamePubkey(a) {
    const same = (b) => b != null && !!(a === null || a === void 0 ? void 0 : a.equals(b));
    same.$spec = `spokSamePubkey(${a === null || a === void 0 ? void 0 : a.toBase58()})`;
    same.$description = `${a === null || a === void 0 ? void 0 : a.toBase58()} equal`;
    return same;
}
exports.spokSamePubkey = spokSamePubkey;
function assertIsNotNull(t, x) {
    t.ok(x, 'should be non null');
}
exports.assertIsNotNull = assertIsNotNull;
function assertSamePubkey(t, a, b) {
    t.equal(a === null || a === void 0 ? void 0 : a.toBase58(), b.toBase58(), 'pubkeys are same');
}
exports.assertSamePubkey = assertSamePubkey;
