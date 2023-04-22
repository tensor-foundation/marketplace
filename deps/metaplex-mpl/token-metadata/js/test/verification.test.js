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
const digital_asset_manager_1 = require("./utils/digital-asset-manager");
const utils_1 = require("./utils");
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('Verify and Unverify: creator', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // Create item NFT.
    const daItemManager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible);
    // Creator is unverified.
    const metadataInitial = yield generated_1.Metadata.fromAccountAddress(connection, daItemManager.metadata);
    const unverifiedCreators = [
        {
            address: (0, utils_1.spokSamePubkey)(payer.publicKey),
            verified: false,
            share: 100,
        },
    ];
    (0, spok_1.default)(t, metadataInitial.data, {
        creators: unverifiedCreators,
    });
    // Verify.
    const authority = payer;
    const verifyArgs = {
        verificationArgs: generated_1.VerificationArgs.CreatorV1,
    };
    const { tx: verifyTx } = yield API.verify(handler, authority, null, daItemManager.metadata, null, null, null, verifyArgs);
    yield verifyTx.assertSuccess(t);
    // Creator is verified.
    const metadataVerified = yield generated_1.Metadata.fromAccountAddress(connection, daItemManager.metadata);
    const verifiedCreators = [
        {
            address: (0, utils_1.spokSamePubkey)(payer.publicKey),
            verified: true,
            share: 100,
        },
    ];
    (0, spok_1.default)(t, metadataVerified.data, {
        creators: verifiedCreators,
    });
    // Unverify.
    const unverifyArgs = {
        verificationArgs: generated_1.VerificationArgs.CreatorV1,
    };
    const { tx: unverifyTx } = yield API.unverify(handler, authority, null, daItemManager.metadata, null, null, unverifyArgs);
    yield unverifyTx.assertSuccess(t);
    // Creator is unverified.
    const metadataUnverified = yield generated_1.Metadata.fromAccountAddress(connection, daItemManager.metadata);
    (0, spok_1.default)(t, metadataUnverified.data, {
        creators: unverifiedCreators,
    });
}));
(0, tape_1.default)('Verify and Unverify: NFT member of NFT collection', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // Create collection parent NFT.
    const collectionDetails = {
        __kind: 'V1',
        size: 0,
    };
    const daCollectionManager = yield (0, digital_asset_manager_1.createAndMintDefaultCollectionParent)(t, connection, API, handler, payer, generated_1.TokenStandard.NonFungible, collectionDetails);
    // Create item NFT.
    const daItemManager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.NonFungible, null, 1, daCollectionManager.mint);
    // Collection is set for item but unverified.
    const metadataInitial = yield generated_1.Metadata.fromAccountAddress(connection, daItemManager.metadata);
    (0, spok_1.default)(t, metadataInitial.collection, {
        key: (0, utils_1.spokSamePubkey)(daCollectionManager.mint),
        verified: false,
    });
    // Verify.
    const authority = payer;
    const verifyArgs = {
        verificationArgs: generated_1.VerificationArgs.CollectionV1,
    };
    const { tx: verifyTx } = yield API.verify(handler, authority, null, daItemManager.metadata, daCollectionManager.mint, daCollectionManager.metadata, daCollectionManager.masterEdition, verifyArgs);
    yield verifyTx.assertSuccess(t);
    // Collection is verified.
    const metadataVerified = yield generated_1.Metadata.fromAccountAddress(connection, daItemManager.metadata);
    (0, spok_1.default)(t, metadataVerified.collection, {
        key: (0, utils_1.spokSamePubkey)(daCollectionManager.mint),
        verified: true,
    });
    // Unverify.
    const unverifyArgs = {
        verificationArgs: generated_1.VerificationArgs.CollectionV1,
    };
    const { tx: unverifyTx } = yield API.unverify(handler, authority, null, daItemManager.metadata, daCollectionManager.mint, daCollectionManager.metadata, unverifyArgs);
    yield unverifyTx.assertSuccess(t);
    // Collection is unverified.
    const metadataUnverified = yield generated_1.Metadata.fromAccountAddress(connection, daItemManager.metadata);
    (0, spok_1.default)(t, metadataUnverified.collection, {
        key: (0, utils_1.spokSamePubkey)(daCollectionManager.mint),
        verified: false,
    });
}));
(0, tape_1.default)('Verify and Unverify: pNFT member of pNFT collection', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // Create collection parent NFT.
    const collectionDetails = {
        __kind: 'V1',
        size: 0,
    };
    const daCollectionManager = yield (0, digital_asset_manager_1.createAndMintDefaultCollectionParent)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, collectionDetails);
    // Create item NFT.
    const daItemManager = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, null, 1, daCollectionManager.mint);
    // Collection is set for item but unverified.
    const metadataInitial = yield generated_1.Metadata.fromAccountAddress(connection, daItemManager.metadata);
    (0, spok_1.default)(t, metadataInitial.collection, {
        key: (0, utils_1.spokSamePubkey)(daCollectionManager.mint),
        verified: false,
    });
    // Verify.
    const authority = payer;
    const verifyArgs = {
        verificationArgs: generated_1.VerificationArgs.CollectionV1,
    };
    const { tx: verifyTx } = yield API.verify(handler, authority, null, daItemManager.metadata, daCollectionManager.mint, daCollectionManager.metadata, daCollectionManager.masterEdition, verifyArgs);
    yield verifyTx.assertSuccess(t);
    // Collection is verified.
    const metadataVerified = yield generated_1.Metadata.fromAccountAddress(connection, daItemManager.metadata);
    (0, spok_1.default)(t, metadataVerified.collection, {
        key: (0, utils_1.spokSamePubkey)(daCollectionManager.mint),
        verified: true,
    });
    // Unverify.
    const unverifyArgs = {
        verificationArgs: generated_1.VerificationArgs.CollectionV1,
    };
    const { tx: unverifyTx } = yield API.unverify(handler, authority, null, daItemManager.metadata, daCollectionManager.mint, daCollectionManager.metadata, unverifyArgs);
    yield unverifyTx.assertSuccess(t);
    // Collection is unverified.
    const metadataUnverified = yield generated_1.Metadata.fromAccountAddress(connection, daItemManager.metadata);
    (0, spok_1.default)(t, metadataUnverified.collection, {
        key: (0, utils_1.spokSamePubkey)(daCollectionManager.mint),
        verified: false,
    });
}));
