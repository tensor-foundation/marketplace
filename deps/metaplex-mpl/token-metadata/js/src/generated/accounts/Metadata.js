"use strict";
/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
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
exports.metadataBeet = exports.Metadata = void 0;
const web3 = __importStar(require("@solana/web3.js"));
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const Key_1 = require("../types/Key");
const Data_1 = require("../types/Data");
const TokenStandard_1 = require("../types/TokenStandard");
const Collection_1 = require("../types/Collection");
const Uses_1 = require("../types/Uses");
const CollectionDetails_1 = require("../types/CollectionDetails");
const ProgrammableConfig_1 = require("../types/ProgrammableConfig");
const customSerializer = __importStar(require("../../custom/metadata-deserializer"));
/**
 * Holds the data for the {@link Metadata} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
class Metadata {
    constructor(key, updateAuthority, mint, data, primarySaleHappened, isMutable, editionNonce, tokenStandard, collection, uses, collectionDetails, programmableConfig) {
        this.key = key;
        this.updateAuthority = updateAuthority;
        this.mint = mint;
        this.data = data;
        this.primarySaleHappened = primarySaleHappened;
        this.isMutable = isMutable;
        this.editionNonce = editionNonce;
        this.tokenStandard = tokenStandard;
        this.collection = collection;
        this.uses = uses;
        this.collectionDetails = collectionDetails;
        this.programmableConfig = programmableConfig;
    }
    /**
     * Creates a {@link Metadata} instance from the provided args.
     */
    static fromArgs(args) {
        return new Metadata(args.key, args.updateAuthority, args.mint, args.data, args.primarySaleHappened, args.isMutable, args.editionNonce, args.tokenStandard, args.collection, args.uses, args.collectionDetails, args.programmableConfig);
    }
    /**
     * Deserializes the {@link Metadata} from the data of the provided {@link web3.AccountInfo}.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static fromAccountInfo(accountInfo, offset = 0) {
        return Metadata.deserialize(accountInfo.data, offset);
    }
    /**
     * Retrieves the account info from the provided address and deserializes
     * the {@link Metadata} from its data.
     *
     * @throws Error if no account info is found at the address or if deserialization fails
     */
    static fromAccountAddress(connection, address, commitmentOrConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const accountInfo = yield connection.getAccountInfo(address, commitmentOrConfig);
            if (accountInfo == null) {
                throw new Error(`Unable to find Metadata account at ${address}`);
            }
            return Metadata.fromAccountInfo(accountInfo, 0)[0];
        });
    }
    /**
     * Provides a {@link web3.Connection.getProgramAccounts} config builder,
     * to fetch accounts matching filters that can be specified via that builder.
     *
     * @param programId - the program that owns the accounts we are filtering
     */
    static gpaBuilder(programId = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')) {
        return beetSolana.GpaBuilder.fromStruct(programId, exports.metadataBeet);
    }
    /**
     * Deserializes the {@link Metadata} from the provided data Buffer.
     * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
     */
    static deserialize(buf, offset = 0) {
        return resolvedDeserialize(buf, offset);
    }
    /**
     * Serializes the {@link Metadata} into a Buffer.
     * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
     */
    serialize() {
        return resolvedSerialize(this);
    }
    /**
     * Returns the byteSize of a {@link Buffer} holding the serialized data of
     * {@link Metadata} for the provided args.
     *
     * @param args need to be provided since the byte size for this account
     * depends on them
     */
    static byteSize(args) {
        const instance = Metadata.fromArgs(args);
        return exports.metadataBeet.toFixedFromValue(instance).byteSize;
    }
    /**
     * Fetches the minimum balance needed to exempt an account holding
     * {@link Metadata} data from rent
     *
     * @param args need to be provided since the byte size for this account
     * depends on them
     * @param connection used to retrieve the rent exemption information
     */
    static getMinimumBalanceForRentExemption(args, connection, commitment) {
        return __awaiter(this, void 0, void 0, function* () {
            return connection.getMinimumBalanceForRentExemption(Metadata.byteSize(args), commitment);
        });
    }
    /**
     * Returns a readable version of {@link Metadata} properties
     * and can be used to convert to JSON and/or logging
     */
    pretty() {
        return {
            key: 'Key.' + Key_1.Key[this.key],
            updateAuthority: this.updateAuthority.toBase58(),
            mint: this.mint.toBase58(),
            data: this.data,
            primarySaleHappened: this.primarySaleHappened,
            isMutable: this.isMutable,
            editionNonce: this.editionNonce,
            tokenStandard: this.tokenStandard,
            collection: this.collection,
            uses: this.uses,
            collectionDetails: this.collectionDetails,
            programmableConfig: this.programmableConfig,
        };
    }
}
exports.Metadata = Metadata;
/**
 * @category Accounts
 * @category generated
 */
exports.metadataBeet = new beet.FixableBeetStruct([
    ['key', Key_1.keyBeet],
    ['updateAuthority', beetSolana.publicKey],
    ['mint', beetSolana.publicKey],
    ['data', Data_1.dataBeet],
    ['primarySaleHappened', beet.bool],
    ['isMutable', beet.bool],
    ['editionNonce', beet.coption(beet.u8)],
    ['tokenStandard', beet.coption(TokenStandard_1.tokenStandardBeet)],
    ['collection', beet.coption(Collection_1.collectionBeet)],
    ['uses', beet.coption(Uses_1.usesBeet)],
    ['collectionDetails', beet.coption(CollectionDetails_1.collectionDetailsBeet)],
    ['programmableConfig', beet.coption(ProgrammableConfig_1.programmableConfigBeet)],
], Metadata.fromArgs, 'Metadata');
const serializer = customSerializer;
const resolvedSerialize = typeof serializer.serialize === 'function'
    ? serializer.serialize.bind(serializer)
    : exports.metadataBeet.serialize.bind(exports.metadataBeet);
const resolvedDeserialize = typeof serializer.deserialize === 'function'
    ? serializer.deserialize.bind(serializer)
    : exports.metadataBeet.deserialize.bind(exports.metadataBeet);
