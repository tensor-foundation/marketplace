"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTokenRecordPda = exports.createPassRuleSet = void 0;
// @ts-ignore
const msgpack_1 = require("@msgpack/msgpack");
const web3_js_1 = require("@solana/web3.js");
const generated_1 = require("../../src/generated");
function createPassRuleSet(ruleSetName, owner, operation) {
    const operations = {};
    operations[operation] = 'Pass';
    const ruleSet = {
        ruleSetName,
        owner: Array.from(owner.toBytes()),
        operations,
    };
    return (0, msgpack_1.encode)(ruleSet);
}
exports.createPassRuleSet = createPassRuleSet;
function findTokenRecordPda(mint, token) {
    return web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from('metadata'),
        generated_1.PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('token_record'),
        token.toBuffer(),
    ], generated_1.PROGRAM_ID)[0];
}
exports.findTokenRecordPda = findTokenRecordPda;
