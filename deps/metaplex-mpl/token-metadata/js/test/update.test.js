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
const spok_1 = __importDefault(require("spok"));
const generated_1 = require("../src/generated");
const tape_1 = __importDefault(require("tape"));
const setup_1 = require("./setup");
const web3_js_1 = require("@solana/web3.js");
const digital_asset_manager_1 = require("./utils/digital-asset-manager");
const update_test_data_1 = require("./utils/update-test-data");
const msgpack_1 = require("@msgpack/msgpack");
const mpl_token_auth_rules_1 = require("@metaplex-foundation/mpl-token-auth-rules");
const utils_1 = require("./utils");
const programmable_1 = require("./utils/programmable");
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('Update: NonFungible asset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const assetData = yield daManager.getAssetData(connection);
    const authority = payer;
    // Change some values and run update.
    const data = {
        name: 'DigitalAsset2',
        symbol: 'DA2',
        uri: 'uri2',
        sellerFeeBasisPoints: 0,
        creators: assetData.creators,
    };
    const authorizationData = daManager.emptyAuthorizationData();
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = data;
    updateData.authorizationData = authorizationData;
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertSuccess(t);
}));
(0, tape_1.default)('Update: Fungible Token', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.Fungible, null, 10);
    const { mint, metadata, masterEdition } = daManager;
    const assetData = yield daManager.getAssetData(connection);
    const authority = payer;
    // Change some values and run update.
    const data = {
        name: 'DigitalAsset2',
        symbol: 'DA2',
        uri: 'uri2',
        sellerFeeBasisPoints: 0,
        creators: assetData.creators,
    };
    const authorizationData = daManager.emptyAuthorizationData();
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = data;
    updateData.authorizationData = authorizationData;
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertSuccess(t);
}));
(0, tape_1.default)('Update: Fungible Asset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.FungibleAsset, null, 10);
    const { mint, metadata, masterEdition } = daManager;
    const assetData = yield daManager.getAssetData(connection);
    const authority = payer;
    // Change some values and run update.
    const data = {
        name: 'DigitalAsset2',
        symbol: 'DA2',
        uri: 'uri2',
        sellerFeeBasisPoints: 0,
        creators: assetData.creators,
    };
    const authorizationData = daManager.emptyAuthorizationData();
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = data;
    updateData.authorizationData = authorizationData;
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertSuccess(t);
}));
(0, tape_1.default)('Update: Cannot Flip IsMutable to True', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    // Flip isMutable to false
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.isMutable = false;
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertSuccess(t);
    const updatedMetadata = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, updatedMetadata, {
        isMutable: false,
    });
    // Try to flip isMutable to true
    updateData.isMutable = true;
    const { tx: updateTx2 } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx2.assertError(t, /Is Mutable can only be flipped to false/i);
}));
(0, tape_1.default)('Update: Cannot Flip PrimarySaleHappened to False', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    // Flip to true
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.primarySaleHappened = true;
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertSuccess(t);
    const updatedMetadata = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, updatedMetadata, {
        primarySaleHappened: true,
    });
    // Try to flip false -- this should fail
    updateData.primarySaleHappened = false;
    const { tx: updateTx2 } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx2.assertError(t, /Primary sale can only be flipped to true/i);
}));
(0, tape_1.default)('Update: Set New Update Authority', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    const newUpdateAuthority = new web3_js_1.Keypair().publicKey;
    // Flip to true
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.newUpdateAuthority = newUpdateAuthority;
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertSuccess(t);
    const updatedMetadata = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, updatedMetadata, {
        updateAuthority: newUpdateAuthority,
    });
}));
(0, tape_1.default)('Update: Cannot Update Immutable Data', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    // Flip isMutable to false
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.isMutable = false;
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertSuccess(t);
    // Try to write some data.
    updateData.data = {
        name: 'new-name',
        symbol: 'new-symbol',
        uri: 'new-uri',
        sellerFeeBasisPoints: 500,
        creators: null,
    };
    const { tx: updateTx2 } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx2.assertError(t, /Data is immutable/i);
}));
(0, tape_1.default)('Update: Name Cannot Exceed 32 Bytes', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = {
        name: ''.padEnd(33, 'a'),
        symbol: 'new-symbol',
        uri: 'new-uri',
        sellerFeeBasisPoints: 100,
        creators: null,
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertError(t, /Name too long/i);
}));
(0, tape_1.default)('Update: Symbol Cannot Exceed 10 Bytes', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = {
        name: 'new-name',
        symbol: ''.padEnd(11, 'a'),
        uri: 'new-uri',
        sellerFeeBasisPoints: 100,
        creators: null,
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertError(t, /Symbol too long/i);
}));
(0, tape_1.default)('Update: URI Cannot Exceed 200 Bytes', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = {
        name: 'new-name',
        symbol: 'new-symbol',
        uri: ''.padEnd(201, 'a'),
        sellerFeeBasisPoints: 100,
        creators: null,
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertError(t, /Uri too long/i);
}));
(0, tape_1.default)('Update: SellerFeeBasisPoints Cannot Exceed 10_000', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = {
        name: 'new-name',
        symbol: 'new-symbol',
        uri: 'new-uri',
        sellerFeeBasisPoints: 10005,
        creators: null,
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertError(t, /Basis points cannot be more than 10000/i);
}));
(0, tape_1.default)('Update: Creators Array Cannot Exceed Five Items', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    const creators = [];
    for (let i = 0; i < 6; i++) {
        creators.push({
            address: new web3_js_1.Keypair().publicKey,
            verified: false,
            share: i < 5 ? 20 : 0, // Don't exceed 100% share total.
        });
    }
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = {
        name: 'new-name',
        symbol: 'new-symbol',
        uri: 'new-uri',
        sellerFeeBasisPoints: 100,
        creators,
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertError(t, /Creators list too long/i);
}));
(0, tape_1.default)('Update: No Duplicate Creator Addresses', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    const creators = [];
    for (let i = 0; i < 2; i++) {
        creators.push({
            address: payer.publicKey,
            verified: true,
            share: 50,
        });
    }
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = {
        name: 'new-name',
        symbol: 'new-symbol',
        uri: 'new-uri',
        sellerFeeBasisPoints: 100,
        creators,
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertError(t, /No duplicate creator addresses/i);
}));
(0, tape_1.default)('Update: Creator Shares Must Equal 100', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    const creators = [];
    creators.push({
        address: payer.publicKey,
        verified: true,
        share: 101,
    });
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = {
        name: 'new-name',
        symbol: 'new-symbol',
        uri: 'new-uri',
        sellerFeeBasisPoints: 100,
        creators,
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertError(t, /Share total must equal 100 for creator array/i);
}));
(0, tape_1.default)('Update: Cannot Unverify Another Creator', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    // Create a new creator with a different keypair.
    const creatorKey = new web3_js_1.Keypair();
    yield setup_1.amman.airdrop(connection, creatorKey.publicKey, 1);
    // Add new creator to metadata.
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = {
        name: 'new-name',
        symbol: 'new-symbol',
        uri: 'new-uri',
        sellerFeeBasisPoints: 100,
        creators: [
            {
                address: payer.publicKey,
                share: 100,
                verified: false,
            },
            {
                address: creatorKey.publicKey,
                share: 0,
                verified: false,
            },
        ],
    };
    // Update metadata with new creator.
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertSuccess(t);
    // Sign metadata with new creator.
    const { tx: signMetadataTx } = yield API.signMetadata(t, creatorKey, metadata, handler);
    yield signMetadataTx.assertSuccess(t);
    const updatedMetadata = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    t.equal(updatedMetadata.data.creators[1].verified, true);
    // Have the original keypair try to unverify it.
    const newCreators = [];
    newCreators.push({
        address: creatorKey.publicKey,
        verified: false,
        share: 100,
    });
    const updateData2 = new update_test_data_1.UpdateTestData();
    updateData2.data = {
        name: 'new-name',
        symbol: 'new-symbol',
        uri: 'new-uri',
        sellerFeeBasisPoints: 100,
        creators: newCreators,
    };
    const { tx: updateTx2 } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx2.assertError(t, /cannot unilaterally unverify another creator/i);
}));
(0, tape_1.default)('Update: Cannot Verify Another Creator', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const authority = payer;
    const creatorKey = new web3_js_1.Keypair();
    yield setup_1.amman.airdrop(connection, creatorKey.publicKey, 1);
    // Start with an unverified creator
    const creators = [];
    creators.push({
        address: creatorKey.publicKey,
        verified: false,
        share: 100,
    });
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = {
        name: 'new-name',
        symbol: 'new-symbol',
        uri: 'new-uri',
        sellerFeeBasisPoints: 100,
        creators,
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertSuccess(t);
    const updatedMetadata = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, updatedMetadata.data, {
        creators: updateData.data.creators,
    });
    // Have a different keypair try to verify it.
    const newCreators = [];
    newCreators.push({
        address: creatorKey.publicKey,
        verified: true,
        share: 100,
    });
    const updateData2 = new update_test_data_1.UpdateTestData();
    updateData2.data = {
        name: 'new-name',
        symbol: 'new-symbol',
        uri: 'new-uri',
        sellerFeeBasisPoints: 100,
        creators: newCreators,
    };
    const { tx: updateTx2 } = yield API.update(t, handler, mint, metadata, authority, updateData2, null, masterEdition);
    yield updateTx2.assertError(t, /cannot unilaterally verify another creator, they must sign/i);
}));
(0, tape_1.default)('Update: Update Unverified Collection Key', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const name = 'DigitalAsset';
    const symbol = 'DA';
    const uri = 'uri';
    const authority = payer;
    const collectionParent = new web3_js_1.Keypair();
    const newCollectionParent = new web3_js_1.Keypair();
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
        tokenStandard: generated_1.TokenStandard.NonFungible,
        collection: { key: collectionParent.publicKey, verified: false },
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: createTx, mint, metadata, masterEdition, } = yield API.create(t, payer, assetData, 0, 0, handler);
    yield createTx.assertSuccess(t);
    const createdMetadata = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, createdMetadata, {
        collection: {
            key: collectionParent.publicKey,
            verified: false,
        },
    });
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.collection = {
        __kind: 'Set',
        fields: [
            {
                key: newCollectionParent.publicKey,
                verified: false,
            },
        ],
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertSuccess(t);
    const updatedMetadata = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, updatedMetadata.collection, {
        verified: false,
        key: (0, utils_1.spokSamePubkey)(newCollectionParent.publicKey),
    });
}));
(0, tape_1.default)('Update: Fail to Verify an Unverified Collection', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const name = 'DigitalAsset';
    const symbol = 'DA';
    const uri = 'uri';
    const authority = payer;
    const collectionParent = new web3_js_1.Keypair();
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
        tokenStandard: generated_1.TokenStandard.NonFungible,
        collection: { key: collectionParent.publicKey, verified: false },
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: createTx, mint, metadata, masterEdition, } = yield API.create(t, payer, assetData, 0, 0, handler);
    yield createTx.assertSuccess(t);
    const createdMetadata = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, createdMetadata, {
        collection: {
            key: collectionParent.publicKey,
            verified: false,
        },
    });
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.collection = {
        __kind: 'Set',
        fields: [
            {
                key: collectionParent.publicKey,
                verified: true,
            },
        ],
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertError(t, /Collection cannot be verified in this instruction/);
}));
(0, tape_1.default)('Update: Fail to Update a Verified Collection', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const name = 'DigitalAsset';
    const symbol = 'DA';
    const uri = 'uri';
    // Create parent NFT.
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint: collectionMint, metadata: collectionMetadata, masterEdition: collectionMasterEdition, } = daManager;
    const authority = payer;
    const newCollectionParent = new web3_js_1.Keypair();
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
        tokenStandard: generated_1.TokenStandard.NonFungible,
        collection: { key: collectionMint, verified: false },
        uses: null,
        collectionDetails: null,
        ruleSet: null,
    };
    const { tx: createTx, mint, metadata, masterEdition, } = yield API.create(t, payer, assetData, 0, 0, handler);
    yield createTx.assertSuccess(t);
    const createdMetadata = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, createdMetadata, {
        collection: {
            key: collectionMint,
            verified: false,
        },
    });
    const { tx: verifyCollectionTx } = yield API.verifyCollection(t, payer, metadata, collectionMint, collectionMetadata, collectionMasterEdition, payer, handler);
    yield verifyCollectionTx.assertSuccess(t);
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.collection = {
        __kind: 'Set',
        fields: [
            {
                key: newCollectionParent.publicKey,
                verified: true,
            },
        ],
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition);
    yield updateTx.assertError(t, /Collection cannot be verified in this instruction/);
}));
(0, tape_1.default)('Update: Update pNFT Config', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, null, 1);
    const authority = payer;
    const dummyRuleSet = web3_js_1.Keypair.generate().publicKey;
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.ruleSet = {
        __kind: 'Set',
        fields: [dummyRuleSet],
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition, token);
    yield updateTx.assertSuccess(t);
    const updatedMetadata = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, updatedMetadata.programmableConfig, {
        ruleSet: dummyRuleSet,
    });
}));
(0, tape_1.default)('Update: Fail to update rule set on NFT', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const authority = payer;
    const dummyRuleSet = web3_js_1.Keypair.generate().publicKey;
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.NonFungible, null, 1);
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.ruleSet = {
        __kind: 'Set',
        fields: [dummyRuleSet],
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition, token);
    yield updateTx.assertError(t, /Invalid token standard/);
}));
(0, tape_1.default)('Update: Update existing pNFT rule set config to None', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const authority = payer;
    // We need a real ruleset here to pass the mint checks.
    // Set up our rule set
    const ruleSetName = 'update_test';
    const ruleSet = {
        libVersion: 1,
        ruleSetName: ruleSetName,
        owner: Array.from(authority.publicKey.toBytes()),
        operations: {
            'Transfer:Owner': {
                PubkeyMatch: {
                    pubkey: Array.from(authority.publicKey.toBytes()),
                    field: 'Destination',
                },
            },
        },
    };
    const serializedRuleSet = (0, msgpack_1.encode)(ruleSet);
    // Find the ruleset PDA
    const [ruleSetPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('rule_set'), payer.publicKey.toBuffer(), Buffer.from(ruleSetName)], mpl_token_auth_rules_1.PROGRAM_ID);
    const { tx: createRuleSetTx } = yield API.createRuleSet(t, payer, ruleSetPda, serializedRuleSet, handler);
    yield createRuleSetTx.assertSuccess(t);
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, ruleSetPda, 1);
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.ruleSet = {
        __kind: 'Clear',
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition, token, ruleSetPda);
    yield updateTx.assertSuccess(t);
    const updatedMetadata = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    t.equal(updatedMetadata.programmableConfig, null);
}));
(0, tape_1.default)('Update: Invalid Update Authority Fails', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    const invalidUpdateAuthority = new web3_js_1.Keypair();
    // Flip to true
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = {
        name: 'fake name',
        symbol: 'fake',
        uri: 'fake uri',
        sellerFeeBasisPoints: 500,
        creators: null,
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, invalidUpdateAuthority, updateData, null, masterEdition);
    yield updateTx.assertError(t, /Invalid authority type/);
}));
(0, tape_1.default)('Update: Delegate Authority Type Not Supported', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    // creates a delegate
    const [, delegate] = yield API.getKeypair('Delegate');
    // delegate PDA
    const [delegateRecord] = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from('metadata'),
        generated_1.PROGRAM_ID.toBuffer(),
        daManager.mint.toBuffer(),
        Buffer.from('update_delegate'),
        payer.publicKey.toBuffer(),
        delegate.publicKey.toBuffer(),
    ], generated_1.PROGRAM_ID);
    setup_1.amman.addr.addLabel('Delegate Record', delegateRecord);
    const args = {
        __kind: 'UpdateV1',
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, daManager.mint, daManager.metadata, payer.publicKey, payer, args, handler, delegateRecord, daManager.masterEdition);
    yield delegateTx.assertSuccess(t);
    const assetData = yield daManager.getAssetData(connection);
    const authority = delegate;
    // Change some values and run update.
    const data = {
        name: 'DigitalAsset2',
        symbol: 'DA2',
        uri: 'uri2',
        sellerFeeBasisPoints: 10,
        creators: assetData.creators,
    };
    const authorizationData = daManager.emptyAuthorizationData();
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = data;
    updateData.authorizationData = authorizationData;
    const { tx: updateTx } = yield API.update(t, handler, daManager.mint, daManager.metadata, authority, updateData, delegateRecord, daManager.masterEdition);
    updateTx.then((x) => x.assertLogs(t, [/Invalid authority type/i], {
        txLabel: 'tx: Update',
    }));
    yield updateTx.assertError(t);
}));
(0, tape_1.default)('Update: Holder Authority Type Not Supported', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const daManager = yield (0, digital_asset_manager_1.createDefaultAsset)(t, connection, API, handler, payer);
    const { mint, metadata, masterEdition } = daManager;
    // initialize a token account
    const [, holder] = yield setup_1.amman.genLabeledKeypair('Holder');
    const { tx: tokenTx, token } = yield API.createTokenAccount(mint, payer, connection, handler, holder.publicKey);
    yield tokenTx.assertSuccess(t);
    // mint 1 asset
    const amount = 1;
    const { tx: mintTx } = yield API.mint(t, connection, payer, mint, metadata, masterEdition, daManager.emptyAuthorizationData(), amount, handler, token);
    yield mintTx.assertSuccess(t);
    const assetData = yield daManager.getAssetData(connection);
    // Change some values and run update.
    const data = {
        name: 'DigitalAsset2',
        symbol: 'DA2',
        uri: 'uri2',
        sellerFeeBasisPoints: 0,
        creators: assetData.creators,
    };
    const authorizationData = daManager.emptyAuthorizationData();
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.data = data;
    updateData.authorizationData = authorizationData;
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, holder, updateData, null, masterEdition, token);
    updateTx.then((x) => x.assertLogs(t, [/Auth type: Holder/i, /Feature not supported currently/i], {
        txLabel: 'tx: Update',
    }));
    yield updateTx.assertError(t);
}));
(0, tape_1.default)('Update: Cannot Update pNFT Config with locked token', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, null, 1);
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(mint, token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        state: generated_1.TokenState.Unlocked /* asset should be unlocked */,
    });
    // creates a delegate
    const [, delegate] = yield API.getKeypair('Delegate');
    const args = {
        __kind: 'UtilityV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, mint, metadata, payer.publicKey, payer, args, handler, null, masterEdition, token, tokenRecord);
    yield delegateTx.assertSuccess(t);
    // lock asset with delegate
    const { tx: lockTx } = yield API.lock(delegate, mint, metadata, token, payer, handler, tokenRecord, null, masterEdition);
    yield lockTx.assertSuccess(t);
    // updates the metadata
    const authority = payer;
    const dummyRuleSet = web3_js_1.Keypair.generate().publicKey;
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.ruleSet = {
        __kind: 'Set',
        fields: [dummyRuleSet],
    };
    const { tx: updateTx } = yield API.update(t, handler, mint, metadata, authority, updateData, null, masterEdition, token);
    yield updateTx.assertError(t, /Cannot update the rule set of a programmable asset that has a delegate/i);
}));
(0, tape_1.default)('Update: rule set update with programmable config delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const collection = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    const nft = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, null, 1, collection.mint);
    let metadata = yield generated_1.Metadata.fromAccountAddress(connection, nft.metadata);
    (0, spok_1.default)(t, metadata, {
        tokenStandard: generated_1.TokenStandard.ProgrammableNonFungible,
        programmableConfig: { __kind: 'V1', ruleSet: null },
    });
    // creates a delegate
    const [, delegate] = yield API.getKeypair('Delegate');
    // delegate PDA
    const [delegateRecord] = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from('metadata'),
        generated_1.PROGRAM_ID.toBuffer(),
        collection.mint.toBuffer(),
        Buffer.from('programmable_config_delegate'),
        payer.publicKey.toBuffer(),
        delegate.publicKey.toBuffer(),
    ], generated_1.PROGRAM_ID);
    setup_1.amman.addr.addLabel('Metadata Delegate Record', delegateRecord);
    const args = {
        __kind: 'ProgrammableConfigV1',
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, collection.mint, collection.metadata, payer.publicKey, payer, args, handler, delegateRecord, collection.masterEdition);
    yield delegateTx.assertSuccess(t);
    const pda = yield generated_1.MetadataDelegateRecord.fromAccountAddress(connection, delegateRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate.publicKey),
        mint: (0, utils_1.spokSamePubkey)(collection.mint),
    });
    // update the nft via the delegate
    const dummyRuleSet = web3_js_1.Keypair.generate().publicKey;
    const updateData = new update_test_data_1.UpdateTestData();
    updateData.ruleSet = {
        __kind: 'Set',
        fields: [dummyRuleSet],
    };
    const { tx: updateTx } = yield API.update(t, handler, nft.mint, nft.metadata, delegate, updateData, delegateRecord, nft.masterEdition, nft.token);
    yield updateTx.assertSuccess(t);
    metadata = yield generated_1.Metadata.fromAccountAddress(connection, nft.metadata);
    (0, spok_1.default)(t, metadata, {
        tokenStandard: generated_1.TokenStandard.ProgrammableNonFungible,
        programmableConfig: { __kind: 'V1', ruleSet: (0, utils_1.spokSamePubkey)(dummyRuleSet) },
    });
}));
(0, tape_1.default)('Update: fail to update metadata with programmable config delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const collection = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    const nft = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, null, 1, collection.mint);
    const metadata = yield generated_1.Metadata.fromAccountAddress(connection, nft.metadata);
    (0, spok_1.default)(t, metadata, {
        tokenStandard: generated_1.TokenStandard.ProgrammableNonFungible,
        programmableConfig: { __kind: 'V1', ruleSet: null },
    });
    // creates a delegate
    const [, delegate] = yield API.getKeypair('Delegate');
    // delegate PDA
    const [delegateRecord] = web3_js_1.PublicKey.findProgramAddressSync([
        Buffer.from('metadata'),
        generated_1.PROGRAM_ID.toBuffer(),
        collection.mint.toBuffer(),
        Buffer.from('programmable_config_delegate'),
        payer.publicKey.toBuffer(),
        delegate.publicKey.toBuffer(),
    ], generated_1.PROGRAM_ID);
    setup_1.amman.addr.addLabel('Metadata Delegate Record', delegateRecord);
    const args = {
        __kind: 'ProgrammableConfigV1',
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, collection.mint, collection.metadata, payer.publicKey, payer, args, handler, delegateRecord, collection.masterEdition);
    yield delegateTx.assertSuccess(t);
    const pda = yield generated_1.MetadataDelegateRecord.fromAccountAddress(connection, delegateRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate.publicKey),
        mint: (0, utils_1.spokSamePubkey)(collection.mint),
    });
    // update the nft via the delegate
    const dummyRuleSet = web3_js_1.Keypair.generate().publicKey;
    const updateData = new update_test_data_1.UpdateTestData();
    // Original values:
    // name = 'DigitalAsset'
    // symbol = 'DA'
    // uri = 'uri'
    updateData.data = Object.assign({ name: 'NewDigitalAsset', symbol: 'NewDA' }, metadata.data);
    updateData.ruleSet = {
        __kind: 'Set',
        fields: [dummyRuleSet],
    };
    const { tx: updateTx } = yield API.update(t, handler, nft.mint, nft.metadata, delegate, updateData, delegateRecord, nft.masterEdition, nft.token);
    yield updateTx.assertError(t, /Authority cannot apply all update args/i);
}));
