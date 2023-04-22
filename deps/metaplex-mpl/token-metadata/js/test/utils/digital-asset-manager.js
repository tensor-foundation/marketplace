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
exports.createAndMintDefaultCollectionParent = exports.createAndMintDefaultAsset = exports.createDefaultAsset = exports.DigitalAssetManager = void 0;
const generated_1 = require("../../src/generated");
class DigitalAssetManager {
    constructor(mint, metadata, masterEdition) {
        this.mint = mint;
        this.metadata = metadata;
        this.masterEdition = masterEdition;
    }
    emptyAuthorizationData() {
        return {
            payload: {
                map: new Map(),
            },
        };
    }
    getAssetData(connection) {
        return __awaiter(this, void 0, void 0, function* () {
            const md = yield generated_1.Metadata.fromAccountAddress(connection, this.metadata);
            return {
                name: md.data.name,
                symbol: md.data.symbol,
                uri: md.data.uri,
                sellerFeeBasisPoints: md.data.sellerFeeBasisPoints,
                creators: md.data.creators,
                primarySaleHappened: md.primarySaleHappened,
                isMutable: md.isMutable,
                tokenStandard: md.tokenStandard,
                collection: md.collection,
                uses: md.uses,
                collectionDetails: md.collectionDetails,
                ruleSet: md.programmableConfig ? md.programmableConfig.ruleSet : null,
            };
        });
    }
}
exports.DigitalAssetManager = DigitalAssetManager;
function createDefaultAsset(t, connection, API, handler, payer, tokenStandard = generated_1.TokenStandard.NonFungible, ruleSet = null, collection = null, collectionDetails = null) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = 'DigitalAsset';
        const symbol = 'DA';
        const uri = 'uri';
        // Create the initial asset and ensure it was created successfully
        const assetData = {
            name,
            symbol,
            uri,
            sellerFeeBasisPoints: 0,
            creators: [
                {
                    address: payer.publicKey,
                    share: 100,
                    verified: false,
                },
            ],
            primarySaleHappened: false,
            isMutable: true,
            tokenStandard,
            collection: collection ? { key: collection, verified: false } : null,
            uses: null,
            collectionDetails,
            ruleSet,
        };
        const { tx: createTx, mint, metadata, masterEdition, } = yield API.create(t, payer, assetData, 0, 0, handler);
        yield createTx.assertSuccess(t);
        const daManager = new DigitalAssetManager(mint, metadata, masterEdition);
        return daManager;
    });
}
exports.createDefaultAsset = createDefaultAsset;
function createAndMintDefaultAsset(t, connection, API, handler, payer, tokenStandard = generated_1.TokenStandard.NonFungible, ruleSet = null, amount = 1, collection = null) {
    return __awaiter(this, void 0, void 0, function* () {
        const daManager = yield createDefaultAsset(t, connection, API, handler, payer, tokenStandard, ruleSet, collection, null);
        const { mint, metadata, masterEdition } = daManager;
        const { tx: mintTx, token } = yield API.mint(t, connection, payer, mint, metadata, masterEdition, daManager.emptyAuthorizationData(), amount, handler);
        yield mintTx.assertSuccess(t);
        daManager.token = token;
        return daManager;
    });
}
exports.createAndMintDefaultAsset = createAndMintDefaultAsset;
function createAndMintDefaultCollectionParent(t, connection, API, handler, payer, tokenStandard = generated_1.TokenStandard.NonFungible, collectionDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        const daManager = yield createDefaultAsset(t, connection, API, handler, payer, tokenStandard, null, null, collectionDetails);
        const { mint, metadata, masterEdition } = daManager;
        const { tx: mintTx, token } = yield API.mint(t, connection, payer, mint, metadata, masterEdition, daManager.emptyAuthorizationData(), 1, handler);
        yield mintTx.assertSuccess(t);
        daManager.token = token;
        return daManager;
    });
}
exports.createAndMintDefaultCollectionParent = createAndMintDefaultCollectionParent;
