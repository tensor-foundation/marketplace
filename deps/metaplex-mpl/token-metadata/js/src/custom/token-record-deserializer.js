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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserialize = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const Key_1 = require("../generated/types/Key");
const TokenRecord_1 = require("../generated/accounts/TokenRecord");
const generated_1 = require("../generated");
const _1 = require(".");
/**
 * This is a custom deserializer for TokenRecord in order to support variable account sizes.
 */
function deserialize(buf, offset = 0) {
    let cursor = offset;
    // key
    const key = Key_1.keyBeet.read(buf, cursor);
    cursor += Key_1.keyBeet.byteSize;
    // updateAuthority
    const bump = beet.u8.read(buf, cursor);
    cursor += beet.u8.byteSize;
    // state
    const state = generated_1.tokenStateBeet.read(buf, cursor);
    cursor += generated_1.tokenStateBeet.byteSize;
    // ruleSetRevision
    const [ruleSetRevision, ruleSetRevisionDelta] = (0, _1.tryReadOption)(beet.coption(beet.u64), buf, cursor);
    cursor += ruleSetRevisionDelta;
    // delegate
    const [delegate, delegateDelta] = (0, _1.tryReadOption)(beet.coption(beetSolana.publicKey), buf, cursor);
    cursor += delegateDelta;
    // delegateRole
    const [delegateRole, delegateRoleDelta] = (0, _1.tryReadOption)(beet.coption(generated_1.tokenDelegateRoleBeet), buf, cursor);
    cursor += delegateRoleDelta;
    // lockedTransfer (could be missing)
    const [lockedTransfer, lockedTransferDelta, lockedTransferCorrupted] = (0, _1.tryReadOption)(beet.coption(beetSolana.publicKey), buf, cursor);
    cursor += lockedTransferDelta;
    const args = {
        key,
        bump,
        state,
        ruleSetRevision,
        delegate,
        delegateRole,
        lockedTransfer: lockedTransferCorrupted ? null : lockedTransfer,
    };
    return [TokenRecord_1.TokenRecord.fromArgs(args), cursor];
}
exports.deserialize = deserialize;
