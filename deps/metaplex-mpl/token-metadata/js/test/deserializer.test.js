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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const spok_1 = __importDefault(require("spok"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const mpl_token_metadata_1 = require("../src/mpl-token-metadata");
const web3_js_1 = require("@solana/web3.js");
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const fixtures = path_1.default.join(__dirname, 'fixtures');
(0, tape_1.default)('deserialize: faulty token metadata', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = 'faulty_13gxS4r6SiJn8fwizKZT2W8x8DL6vjN1nAhPWsfNXegb.buf';
    const data = yield fs_1.promises.readFile(path_1.default.join(fixtures, filename));
    const [metadata] = mpl_token_metadata_1.Metadata.deserialize(data);
    (0, spok_1.default)(t, metadata, {
        key: mpl_token_metadata_1.Key.MetadataV1,
        data: {
            symbol: spok_1.default.startsWith('BORYOKU'),
            name: spok_1.default.startsWith('Boryoku Dragonz #515'),
            sellerFeeBasisPoints: 500,
        },
        primarySaleHappened: true,
        isMutable: true,
        editionNonce: 255,
        tokenStandard: null,
        collection: null,
        uses: null,
    });
    {
        t.comment('+++ adding tokenStandard and corrupting following data');
        const metadataWithTokenStandard = mpl_token_metadata_1.Metadata.fromArgs(Object.assign(Object.assign({}, metadata), { tokenStandard: mpl_token_metadata_1.TokenStandard.NonFungibleEdition }));
        const [serialized] = mpl_token_metadata_1.metadataBeet.serialize(metadataWithTokenStandard);
        const buf = Buffer.concat([serialized, Buffer.from('some bogus data here')]);
        const [deserialized] = mpl_token_metadata_1.Metadata.deserialize(buf);
        (0, spok_1.default)(t, deserialized, {
            key: mpl_token_metadata_1.Key.MetadataV1,
            data: {
                symbol: spok_1.default.startsWith('BORYOKU'),
                name: spok_1.default.startsWith('Boryoku Dragonz #515'),
                sellerFeeBasisPoints: 500,
            },
            primarySaleHappened: true,
            isMutable: true,
            editionNonce: 255,
            tokenStandard: mpl_token_metadata_1.TokenStandard.NonFungibleEdition,
            collection: null,
            uses: null,
        });
    }
    {
        t.comment('+++ adding collection and corrupting following data');
        const metadataWithTokenStandardAndCollection = mpl_token_metadata_1.Metadata.fromArgs(Object.assign(Object.assign({}, metadata), { tokenStandard: mpl_token_metadata_1.TokenStandard.NonFungibleEdition, collection: { verified: true, key: metadata.updateAuthority } }));
        const [serialized] = mpl_token_metadata_1.metadataBeet.serialize(metadataWithTokenStandardAndCollection);
        const buf = Buffer.concat([serialized, Buffer.from('some bogus data here')]);
        const [deserialized] = mpl_token_metadata_1.Metadata.deserialize(buf);
        (0, spok_1.default)(t, deserialized, {
            key: mpl_token_metadata_1.Key.MetadataV1,
            data: {
                symbol: spok_1.default.startsWith('BORYOKU'),
                name: spok_1.default.startsWith('Boryoku Dragonz #515'),
                sellerFeeBasisPoints: 500,
            },
            primarySaleHappened: true,
            isMutable: true,
            editionNonce: 255,
            tokenStandard: mpl_token_metadata_1.TokenStandard.NonFungibleEdition,
            collection: {
                verified: true,
                key: ((k) => k.equals(metadata.updateAuthority)),
            },
            uses: null,
        });
    }
}));
(0, tape_1.default)('deserialize: fixed token metadata', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = 'faulty_13gxS4r6SiJn8fwizKZT2W8x8DL6vjN1nAhPWsfNXegb.buf';
    const data = yield fs_1.promises.readFile(path_1.default.join(fixtures, filename));
    const [metadata] = mpl_token_metadata_1.Metadata.deserialize(data);
    const metadataFixed = mpl_token_metadata_1.Metadata.fromArgs(Object.assign(Object.assign({}, metadata), { tokenStandard: mpl_token_metadata_1.TokenStandard.NonFungibleEdition, collection: { verified: true, key: metadata.updateAuthority }, uses: {
            useMethod: mpl_token_metadata_1.UseMethod.Multiple,
            remaining: 2,
            total: 1,
        } }));
    const [buf] = mpl_token_metadata_1.metadataBeet.serialize(metadataFixed);
    const [deserialized] = mpl_token_metadata_1.Metadata.deserialize(buf);
    (0, spok_1.default)(t, deserialized, {
        key: mpl_token_metadata_1.Key.MetadataV1,
        data: {
            symbol: spok_1.default.startsWith('BORYOKU'),
            name: spok_1.default.startsWith('Boryoku Dragonz #515'),
            sellerFeeBasisPoints: 500,
        },
        primarySaleHappened: true,
        isMutable: true,
        editionNonce: 255,
        tokenStandard: mpl_token_metadata_1.TokenStandard.NonFungibleEdition,
        collection: {
            verified: true,
            key: ((k) => k.equals(metadata.updateAuthority)),
        },
        uses: {
            useMethod: mpl_token_metadata_1.UseMethod.Multiple,
            remaining: (n) => n.toString() === '2',
            total: (n) => n.toString() === '1',
        },
    });
}));
(0, tape_1.default)('deserialize: token record without lockedTransfer', (t) => __awaiter(void 0, void 0, void 0, function* () {
    // 1 (Key)
    // 1 (bump)
    // 1 (state)
    // 9 (optional rule set revision)
    // 33 (optional delegate)
    // 2 (optional delegate role)
    const buffer = Buffer.alloc(48);
    let offset = 0;
    // key
    mpl_token_metadata_1.keyBeet.write(buffer, offset, mpl_token_metadata_1.Key.TokenRecord);
    offset += mpl_token_metadata_1.keyBeet.byteSize;
    // bump
    beet.u8.write(buffer, offset, 255);
    offset += beet.u8.byteSize;
    // state
    mpl_token_metadata_1.tokenStateBeet.write(buffer, offset, mpl_token_metadata_1.TokenState.Unlocked);
    offset += mpl_token_metadata_1.tokenStateBeet.byteSize;
    // ruleSetRevision
    const ruleSetRevisionBeet = beet.coption(beet.u64).toFixedFromValue(1);
    ruleSetRevisionBeet.write(buffer, offset, 1);
    offset += ruleSetRevisionBeet.byteSize;
    // delegate
    const delegateBeet = beet.coption(beetSolana.publicKey).toFixedFromValue(web3_js_1.PublicKey.default);
    delegateBeet.write(buffer, offset, web3_js_1.PublicKey.default);
    offset += delegateBeet.byteSize;
    // ruleSetRevision
    const delegateRoleBeet = beet
        .coption(mpl_token_metadata_1.tokenDelegateRoleBeet)
        .toFixedFromValue(mpl_token_metadata_1.TokenDelegateRole.Sale);
    delegateRoleBeet.write(buffer, offset, mpl_token_metadata_1.TokenDelegateRole.Sale);
    offset += delegateRoleBeet.byteSize;
    const [tokenRecord] = mpl_token_metadata_1.TokenRecord.deserialize(buffer);
    t.true(tokenRecord.lockedTransfer == null);
}));
(0, tape_1.default)('deserialize: failed token record without lockedTransfer', (t) => __awaiter(void 0, void 0, void 0, function* () {
    // 1 (Key)
    // 1 (bump)
    // 1 (state)
    // 9 (optional rule set revision)
    // 33 (optional delegate)
    // 2 (optional delegate role)
    // 1 extra byte (garbage)
    const buffer = Buffer.alloc(48);
    let offset = 0;
    // key
    mpl_token_metadata_1.keyBeet.write(buffer, offset, mpl_token_metadata_1.Key.TokenRecord);
    offset += mpl_token_metadata_1.keyBeet.byteSize;
    // bump
    beet.u8.write(buffer, offset, 255);
    offset += beet.u8.byteSize;
    // state
    mpl_token_metadata_1.tokenStateBeet.write(buffer, offset, mpl_token_metadata_1.TokenState.Unlocked);
    offset += mpl_token_metadata_1.tokenStateBeet.byteSize;
    // ruleSetRevision
    const ruleSetRevisionBeet = beet.coption(beet.u64).toFixedFromValue(1);
    ruleSetRevisionBeet.write(buffer, offset, 1);
    offset += ruleSetRevisionBeet.byteSize;
    // delegate
    const delegateBeet = beet.coption(beetSolana.publicKey).toFixedFromValue(web3_js_1.PublicKey.default);
    delegateBeet.write(buffer, offset, web3_js_1.PublicKey.default);
    offset += delegateBeet.byteSize;
    // ruleSetRevision
    const delegateRoleBeet = beet
        .coption(mpl_token_metadata_1.tokenDelegateRoleBeet)
        .toFixedFromValue(mpl_token_metadata_1.TokenDelegateRole.Sale);
    delegateRoleBeet.write(buffer, offset, mpl_token_metadata_1.TokenDelegateRole.Sale);
    offset += delegateRoleBeet.byteSize;
    // garbage byte
    beet.u8.write(buffer, offset, 255);
    offset += beet.u8.byteSize;
    let failed = false;
    try {
        mpl_token_metadata_1.TokenRecord.deserialize(buffer);
    }
    catch (e) {
        // we are expecting an error
        failed = true;
    }
    t.true(failed, 'deserialization failed');
}));
