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
const tape_1 = __importDefault(require("tape"));
const utils_1 = require("./utils");
const actions_1 = require("./actions");
const verifyCollection_1 = require("./actions/verifyCollection");
(0, utils_1.killStuckProcess)();
(0, tape_1.default)('buy: successful purchase for newly minted treasury mint', () => __awaiter(void 0, void 0, void 0, function* () {
    const { payer, connection, transactionHandler } = yield (0, actions_1.createPrerequisites)();
    const { mint: collectionMint, metadata: collectionMetadata, edition: collectionMasterEditionAccount, } = yield (0, actions_1.mintNFT)({
        transactionHandler,
        payer,
        connection,
        maxSupply: 0,
    });
    const { metadata: userCollectionMetadata } = yield (0, actions_1.mintNFT)({
        transactionHandler,
        payer,
        connection,
        collectionMint: collectionMint.publicKey,
    });
    yield (0, verifyCollection_1.verifyCollection)({
        transactionHandler,
        connection,
        payer,
        metadata: userCollectionMetadata,
        collectionAuthority: payer.publicKey,
        collection: collectionMetadata,
        collectionMint: collectionMint.publicKey,
        collectionMasterEditionAccount,
    });
}));
