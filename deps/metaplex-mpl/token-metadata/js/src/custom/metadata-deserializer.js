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
const Metadata_1 = require("../generated/accounts/Metadata");
const Collection_1 = require("../generated/types/Collection");
const CollectionDetails_1 = require("../generated/types/CollectionDetails");
const ProgrammableConfig_1 = require("../generated/types/ProgrammableConfig");
const Data_1 = require("../generated/types/Data");
const Key_1 = require("../generated/types/Key");
const TokenStandard_1 = require("../generated/types/TokenStandard");
const Uses_1 = require("../generated/types/Uses");
const NONE_BYTE_SIZE = beet.coptionNone('').byteSize;
/**
 * This is a custom deserializer for TokenMetadata in order to mitigate acounts with corrupted
 * data on chain.
 *
 * Instead of failing the deserialization for the section that is possibly corrupt it just returns
 * `null` for the fields that would normally be stored in that section.
 *
 * This deserializer matches the [fix implemented in the Rust program](https://github.com/metaplex-foundation/metaplex-program-library/blob/df36da5a78fb17e1690247b8041b761d27c83b1b/token-metadata/program/src/deser.rs#L6).
 * Also @see ../../../program/src/deser.rs
 */
function deserialize(buf, offset = 0) {
    let cursor = offset;
    // key
    const key = Key_1.keyBeet.read(buf, cursor);
    cursor += Key_1.keyBeet.byteSize;
    // updateAuthority
    const updateAuthority = beetSolana.publicKey.read(buf, cursor);
    cursor += beetSolana.publicKey.byteSize;
    // mint
    const mint = beetSolana.publicKey.read(buf, cursor);
    cursor += beetSolana.publicKey.byteSize;
    // data
    const [data, dataDelta] = Data_1.dataBeet.deserialize(buf, cursor);
    cursor = dataDelta;
    // primarySaleHappened
    const primarySaleHappened = beet.bool.read(buf, cursor);
    cursor += beet.bool.byteSize;
    // isMutable
    const isMutable = beet.bool.read(buf, cursor);
    cursor += beet.bool.byteSize;
    // editionNonce
    const editionNonceBeet = beet.coption(beet.u8).toFixedFromData(buf, cursor);
    const editionNonce = editionNonceBeet.read(buf, cursor);
    cursor += editionNonceBeet.byteSize;
    // -----------------
    // Possibly corrupted section
    // -----------------
    // NOTE: that we avoid trying to deserialize any subsequent fields if a
    // previous one was found to be corrupted just to save work
    // tokenStandard
    const [tokenStandard, tokenDelta, tokenCorrupted] = tryReadOption(beet.coption(TokenStandard_1.tokenStandardBeet), buf, cursor);
    cursor += tokenDelta;
    // collection
    const [collection, collectionDelta, collectionCorrupted] = tokenCorrupted
        ? [null, NONE_BYTE_SIZE, true]
        : tryReadOption(beet.coption(Collection_1.collectionBeet), buf, cursor);
    cursor += collectionDelta;
    // uses
    const [uses, usesDelta, usesCorrupted] = tokenCorrupted || collectionCorrupted
        ? [null, NONE_BYTE_SIZE, true]
        : tryReadOption(beet.coption(Uses_1.usesBeet), buf, cursor);
    cursor += usesDelta;
    // collection_details
    const [collectionDetails, collectionDetailsDelta, collectionDetailsCorrupted] = tokenCorrupted || collectionCorrupted || usesCorrupted
        ? [null, NONE_BYTE_SIZE, true]
        : tryReadOption(beet.coption(CollectionDetails_1.collectionDetailsBeet), buf, cursor);
    cursor += collectionDetailsDelta;
    // programmable_config
    const [programmableConfig, programmableConfigDelta, programmableConfigCorrupted] = tokenCorrupted || collectionCorrupted || usesCorrupted
        ? [null, NONE_BYTE_SIZE, true]
        : tryReadOption(beet.coption(ProgrammableConfig_1.programmableConfigBeet), buf, cursor);
    cursor += programmableConfigDelta;
    const anyCorrupted = tokenCorrupted ||
        collectionCorrupted ||
        usesCorrupted ||
        collectionDetailsCorrupted ||
        programmableConfigCorrupted;
    const args = {
        key,
        updateAuthority,
        mint,
        data,
        primarySaleHappened,
        isMutable,
        editionNonce,
        tokenStandard: anyCorrupted ? null : tokenStandard,
        collection: anyCorrupted ? null : collection,
        uses: anyCorrupted ? null : uses,
        collectionDetails: anyCorrupted ? null : collectionDetails,
        programmableConfig: anyCorrupted ? null : programmableConfig,
    };
    return [Metadata_1.Metadata.fromArgs(args), cursor];
}
exports.deserialize = deserialize;
function tryReadOption(optionBeet, buf, offset) {
    try {
        const fixed = optionBeet.toFixedFromData(buf, offset);
        const value = fixed.read(buf, offset);
        return [value, fixed.byteSize, false];
    }
    catch (e) {
        return [null, NONE_BYTE_SIZE, true];
    }
}
