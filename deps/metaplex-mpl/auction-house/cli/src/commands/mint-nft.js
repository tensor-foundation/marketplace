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
exports.verifyCollection = exports.setAndVerifyCollectionAll = exports.setAndVerifyCollection = exports.updateMetadata = exports.mintNFT = exports.createMetadataAccount = exports.validateMetadata = exports.createMetadata = void 0;
const transactions_1 = require("../helpers/transactions");
const accounts_1 = require("../helpers/accounts");
const anchor = __importStar(require("@project-serum/anchor"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const loglevel_1 = __importDefault(require("loglevel"));
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const dist_1 = __importDefault(require("@supercharge/promise-pool/dist"));
const cliProgress = __importStar(require("cli-progress"));
const various_1 = require("../helpers/various");
const createMetadata = (metadataLink, verifyCreators, collection, uses) => __awaiter(void 0, void 0, void 0, function* () {
    // Metadata
    let metadata;
    try {
        metadata = yield (yield (0, node_fetch_1.default)(metadataLink, { method: 'GET' })).json();
    }
    catch (e) {
        loglevel_1.default.debug(e);
        loglevel_1.default.error('Invalid metadata at', metadataLink);
        return;
    }
    return (0, exports.validateMetadata)({
        metadata,
        uri: metadataLink,
        verifyCreators,
        collection,
        uses,
    });
});
exports.createMetadata = createMetadata;
// Validate metadata
const validateMetadata = ({ metadata, uri, verifyCreators = true, collection, uses, }) => {
    if (!metadata.name ||
        !metadata.image ||
        isNaN(metadata.seller_fee_basis_points) ||
        !metadata.properties ||
        !Array.isArray(metadata.properties.creators)) {
        loglevel_1.default.error('Invalid metadata file', metadata);
        return;
    }
    // Validate creators
    const metaCreators = metadata.properties.creators;
    if (metaCreators.some(creator => !creator.address) ||
        metaCreators.reduce((sum, creator) => creator.share + sum, 0) !== 100) {
        return;
    }
    const creators = metaCreators.map(creator => new mpl_token_metadata_1.Creator({
        address: creator.address,
        share: creator.share,
        verified: verifyCreators ? true : false,
    }));
    return new mpl_token_metadata_1.DataV2({
        symbol: metadata.symbol,
        name: metadata.name,
        uri,
        sellerFeeBasisPoints: metadata.seller_fee_basis_points,
        creators: creators,
        collection: collection
            ? new mpl_token_metadata_1.Collection({ key: collection.toBase58(), verified: false })
            : null,
        uses,
    });
};
exports.validateMetadata = validateMetadata;
const createMetadataAccount = ({ connection, data, mintKey, walletKeypair, }) => __awaiter(void 0, void 0, void 0, function* () {
    // Retrieve metadata
    const metadataAccount = yield (0, accounts_1.getMetadata)(mintKey);
    const signers = [];
    const wallet = new anchor.Wallet(walletKeypair);
    if (!(wallet === null || wallet === void 0 ? void 0 : wallet.publicKey))
        return;
    const instructions = new mpl_token_metadata_1.CreateMetadataV2({ feePayer: wallet.publicKey }, {
        metadata: metadataAccount,
        metadataData: data,
        updateAuthority: wallet.publicKey,
        mint: mintKey,
        mintAuthority: wallet.publicKey,
    }).instructions;
    // Execute transaction
    const txid = yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(connection, walletKeypair, instructions, signers);
    console.log('Metadata created', txid);
    return metadataAccount;
});
exports.createMetadataAccount = createMetadataAccount;
const mintNFT = (connection, walletKeypair, metadataLink, mutableMetadata = true, collection = null, maxSupply = 0, verifyCreators, use = null, receivingWallet = null) => __awaiter(void 0, void 0, void 0, function* () {
    // Retrieve metadata
    const data = yield (0, exports.createMetadata)(metadataLink, verifyCreators, collection, use);
    if (!data)
        return;
    // Create wallet from keypair
    const wallet = new anchor.Wallet(walletKeypair);
    if (!(wallet === null || wallet === void 0 ? void 0 : wallet.publicKey))
        return;
    // Allocate memory for the account
    const mintRent = yield connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span);
    // Generate a mint
    const mint = anchor.web3.Keypair.generate();
    const instructions = [];
    const signers = [mint, walletKeypair];
    instructions.push(web3_js_1.SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mint.publicKey,
        lamports: mintRent,
        space: spl_token_1.MintLayout.span,
        programId: spl_token_1.TOKEN_PROGRAM_ID,
    }));
    instructions.push(spl_token_1.Token.createInitMintInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, 0, wallet.publicKey, wallet.publicKey));
    const userTokenAccoutAddress = yield (0, accounts_1.getTokenWallet)(wallet.publicKey, mint.publicKey);
    instructions.push(spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, userTokenAccoutAddress, wallet.publicKey, wallet.publicKey));
    // Create metadata
    const metadataAccount = yield (0, accounts_1.getMetadata)(mint.publicKey);
    instructions.push(...new mpl_token_metadata_1.CreateMetadataV2({ feePayer: wallet.publicKey }, {
        metadata: metadataAccount,
        metadataData: data,
        updateAuthority: wallet.publicKey,
        mint: mint.publicKey,
        mintAuthority: wallet.publicKey,
    }).instructions);
    instructions.push(spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, userTokenAccoutAddress, wallet.publicKey, [], 1));
    // Create master edition
    const editionAccount = yield (0, accounts_1.getMasterEdition)(mint.publicKey);
    instructions.push(...new mpl_token_metadata_1.CreateMasterEditionV3({
        feePayer: wallet.publicKey,
    }, {
        edition: editionAccount,
        metadata: metadataAccount,
        mint: mint.publicKey,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey,
        maxSupply: new anchor.BN(maxSupply),
    }).instructions);
    if (!mutableMetadata) {
        instructions.push(...new mpl_token_metadata_1.UpdateMetadataV2({}, {
            metadata: metadataAccount,
            metadataData: data,
            updateAuthority: walletKeypair.publicKey,
            primarySaleHappened: null,
            isMutable: false,
        }).instructions);
    }
    if (receivingWallet) {
        const derivedAccount = yield (0, accounts_1.getTokenWallet)(receivingWallet, mint.publicKey);
        const createdAccountIx = spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, derivedAccount, receivingWallet, wallet.publicKey);
        const transferIx = spl_token_1.Token.createTransferInstruction(spl_token_1.TOKEN_PROGRAM_ID, userTokenAccoutAddress, derivedAccount, wallet.publicKey, signers, 1);
        const closeAccountIx = spl_token_1.Token.createCloseAccountInstruction(spl_token_1.TOKEN_PROGRAM_ID, userTokenAccoutAddress, wallet.publicKey, wallet.publicKey, signers);
        instructions.push(createdAccountIx, transferIx, closeAccountIx);
    }
    const res = yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(connection, walletKeypair, instructions, signers);
    try {
        yield connection.confirmTransaction(res.txid, 'max');
    }
    catch (_a) {
        // ignore
    }
    // Force wait for max confirmations
    yield connection.getParsedTransaction(res.txid, 'confirmed');
    loglevel_1.default.info('NFT created', res.txid);
    loglevel_1.default.info('\nNFT: Mint Address is ', mint.publicKey.toBase58());
    loglevel_1.default.info('NFT: Metadata address is ', metadataAccount.toBase58());
    return { metadataAccount, mint: mint.publicKey };
});
exports.mintNFT = mintNFT;
const updateMetadata = (mintKey, connection, walletKeypair, metadataLink, collection = null, verifyCreators, uses) => __awaiter(void 0, void 0, void 0, function* () {
    // Retrieve metadata
    const data = yield (0, exports.createMetadata)(metadataLink, verifyCreators, collection, uses);
    if (!data)
        return;
    const metadataAccount = yield (0, accounts_1.getMetadata)(mintKey);
    const signers = [];
    const instructions = new mpl_token_metadata_1.UpdateMetadataV2({}, {
        metadata: metadataAccount,
        metadataData: data,
        updateAuthority: walletKeypair.publicKey,
        primarySaleHappened: null,
        isMutable: null,
    }).instructions;
    // Execute transaction
    const txid = yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(connection, walletKeypair, instructions, signers);
    console.log('Metadata updated', txid);
    loglevel_1.default.info('\n\nUpdated NFT: Mint Address is ', mintKey.toBase58());
    return metadataAccount;
});
exports.updateMetadata = updateMetadata;
const setAndVerifyCollection = (mintKey, connection, walletKeypair, collectionMint) => __awaiter(void 0, void 0, void 0, function* () {
    const metadataAccount = yield (0, accounts_1.getMetadata)(mintKey);
    const collectionMetadataAccount = yield (0, accounts_1.getMetadata)(collectionMint);
    const collectionMasterEdition = yield (0, accounts_1.getMasterEdition)(collectionMint);
    const signers = [walletKeypair];
    const tx = new mpl_token_metadata_1.SetAndVerifyCollectionCollection({ feePayer: walletKeypair.publicKey }, {
        updateAuthority: walletKeypair.publicKey,
        metadata: metadataAccount,
        collectionAuthority: walletKeypair.publicKey,
        collectionMint: collectionMint,
        collectionMetadata: collectionMetadataAccount,
        collectionMasterEdition: collectionMasterEdition,
    });
    const txid = yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(connection, walletKeypair, tx.instructions, signers);
    return txid;
});
exports.setAndVerifyCollection = setAndVerifyCollection;
const setAndVerifyCollectionAll = (hashlist, connection, walletKeyPair, collectionMint, rateLimit) => __awaiter(void 0, void 0, void 0, function* () {
    const progressBar = new cliProgress.SingleBar({
        format: 'Progress: [{bar}] {percentage}% | {value}/{total}',
    }, cliProgress.Presets.shades_classic);
    progressBar.start(hashlist.length, 0);
    yield dist_1.default.withConcurrency(rateLimit || 10)
        .for(hashlist)
        .handleError((err, mint) => __awaiter(void 0, void 0, void 0, function* () {
        loglevel_1.default.error(`\nFailed in set and verify collection for ${mint}: ${err.message}`);
        yield (0, various_1.sleep)(5000);
    }))
        .process((mint) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const mintKey = new web3_js_1.PublicKey(mint);
            yield (0, exports.setAndVerifyCollection)(mintKey, connection, walletKeyPair, collectionMint);
        }
        finally {
            progressBar.increment();
        }
    }));
    progressBar.stop();
});
exports.setAndVerifyCollectionAll = setAndVerifyCollectionAll;
const verifyCollection = (mintKey, connection, walletKeypair, collectionMint) => __awaiter(void 0, void 0, void 0, function* () {
    const metadataAccount = yield (0, accounts_1.getMetadata)(mintKey);
    const collectionMetadataAccount = yield (0, accounts_1.getMetadata)(collectionMint);
    const collectionMasterEdition = yield (0, accounts_1.getMasterEdition)(collectionMint);
    const signers = [walletKeypair];
    const tx = new mpl_token_metadata_1.VerifyCollection({ feePayer: walletKeypair.publicKey }, {
        metadata: metadataAccount,
        collectionAuthority: walletKeypair.publicKey,
        collectionMint: collectionMint,
        collectionMetadata: collectionMetadataAccount,
        collectionMasterEdition: collectionMasterEdition,
    });
    const txid = yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(connection, walletKeypair, tx.instructions, signers);
    return txid;
});
exports.verifyCollection = verifyCollection;
