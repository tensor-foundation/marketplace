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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCollectionMintPubkey = exports.parseUses = exports.getCluster = exports.getPriceWithMantissa = exports.chunks = exports.getMultipleAccounts = exports.parseDate = exports.parsePrice = exports.fromUTF8Array = exports.sleep = exports.getUnixTs = exports.shuffle = exports.getCandyMachineV2Config = void 0;
const web3_js_1 = require("@solana/web3.js");
const fs_1 = __importDefault(require("fs"));
const loglevel_1 = __importDefault(require("loglevel"));
const anchor_1 = require("@project-serum/anchor");
const spl_token_1 = require("@solana/spl-token");
const accounts_1 = require("./accounts");
const constants_1 = require("./constants");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
function getCandyMachineV2Config(walletKeyPair, anchorProgram, configPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (configPath === undefined) {
            throw new Error('The configPath is undefined');
        }
        const configString = fs_1.default.readFileSync(configPath);
        //@ts-ignore
        const config = JSON.parse(configString);
        const { storage, nftStorageKey, nftStorageGateway, ipfsInfuraProjectId, number, ipfsInfuraSecret, pinataJwt, pinataGateway, awsS3Bucket, noRetainAuthority, noMutable, batchSize, price, splToken, splTokenAccount, solTreasuryAccount, gatekeeper, endSettings, hiddenSettings, whitelistMintSettings, goLiveDate, uuid, arweaveJwk, } = config;
        let wallet;
        let parsedPrice = price;
        const splTokenAccountFigured = splTokenAccount
            ? splTokenAccount
            : splToken
                ? (yield (0, accounts_1.getAtaForMint)(new anchor_1.web3.PublicKey(splToken), walletKeyPair.publicKey))[0]
                : null;
        if (splTokenAccount) {
            if (solTreasuryAccount) {
                throw new Error('If spl-token-account or spl-token is set then sol-treasury-account cannot be set');
            }
            if (!splToken) {
                throw new Error('If spl-token-account is set, spl-token must also be set');
            }
            const splTokenKey = new anchor_1.web3.PublicKey(splToken);
            const splTokenAccountKey = new anchor_1.web3.PublicKey(splTokenAccountFigured);
            if (!splTokenAccountFigured) {
                throw new Error('If spl-token is set, spl-token-account must also be set');
            }
            const token = new spl_token_1.Token(anchorProgram.provider.connection, splTokenKey, spl_token_1.TOKEN_PROGRAM_ID, walletKeyPair);
            const mintInfo = yield token.getMintInfo();
            if (!mintInfo.isInitialized) {
                throw new Error(`The specified spl-token is not initialized`);
            }
            const tokenAccount = yield token.getAccountInfo(splTokenAccountKey);
            if (!tokenAccount.isInitialized) {
                throw new Error(`The specified spl-token-account is not initialized`);
            }
            if (!tokenAccount.mint.equals(splTokenKey)) {
                throw new Error(`The spl-token-account's mint (${tokenAccount.mint.toString()}) does not match specified spl-token ${splTokenKey.toString()}`);
            }
            wallet = new anchor_1.web3.PublicKey(splTokenAccountKey);
            parsedPrice = price * Math.pow(10, mintInfo.decimals);
            if ((whitelistMintSettings === null || whitelistMintSettings === void 0 ? void 0 : whitelistMintSettings.discountPrice) ||
                (whitelistMintSettings === null || whitelistMintSettings === void 0 ? void 0 : whitelistMintSettings.discountPrice) === 0) {
                whitelistMintSettings.discountPrice *= Math.pow(10, mintInfo.decimals);
            }
        }
        else {
            parsedPrice = price * Math.pow(10, 9);
            if ((whitelistMintSettings === null || whitelistMintSettings === void 0 ? void 0 : whitelistMintSettings.discountPrice) ||
                (whitelistMintSettings === null || whitelistMintSettings === void 0 ? void 0 : whitelistMintSettings.discountPrice) === 0) {
                whitelistMintSettings.discountPrice *= Math.pow(10, 9);
            }
            wallet = solTreasuryAccount
                ? new anchor_1.web3.PublicKey(solTreasuryAccount)
                : walletKeyPair.publicKey;
        }
        if (whitelistMintSettings) {
            whitelistMintSettings.mint = new anchor_1.web3.PublicKey(whitelistMintSettings.mint);
            if ((whitelistMintSettings === null || whitelistMintSettings === void 0 ? void 0 : whitelistMintSettings.discountPrice) ||
                (whitelistMintSettings === null || whitelistMintSettings === void 0 ? void 0 : whitelistMintSettings.discountPrice) === 0) {
                whitelistMintSettings.discountPrice = new anchor_1.BN(whitelistMintSettings.discountPrice);
            }
        }
        if (endSettings) {
            if (endSettings.endSettingType.date) {
                endSettings.number = new anchor_1.BN(parseDate(endSettings.value));
            }
            else if (endSettings.endSettingType.amount) {
                endSettings.number = new anchor_1.BN(endSettings.value);
            }
            delete endSettings.value;
        }
        if (hiddenSettings) {
            const utf8Encode = new TextEncoder();
            hiddenSettings.hash = utf8Encode.encode(hiddenSettings.hash);
        }
        if (gatekeeper) {
            gatekeeper.gatekeeperNetwork = new anchor_1.web3.PublicKey(gatekeeper.gatekeeperNetwork);
        }
        return {
            storage,
            nftStorageKey,
            nftStorageGateway,
            ipfsInfuraProjectId,
            number,
            ipfsInfuraSecret,
            pinataJwt,
            pinataGateway: pinataGateway ? pinataGateway : null,
            awsS3Bucket,
            retainAuthority: !noRetainAuthority,
            mutable: !noMutable,
            batchSize,
            price: new anchor_1.BN(parsedPrice),
            treasuryWallet: wallet,
            splToken: splToken ? new anchor_1.web3.PublicKey(splToken) : null,
            gatekeeper,
            endSettings,
            hiddenSettings,
            whitelistMintSettings,
            goLiveDate: goLiveDate ? new anchor_1.BN(parseDate(goLiveDate)) : null,
            uuid,
            arweaveJwk,
        };
    });
}
exports.getCandyMachineV2Config = getCandyMachineV2Config;
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}
exports.shuffle = shuffle;
const getUnixTs = () => {
    return new Date().getTime() / 1000;
};
exports.getUnixTs = getUnixTs;
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.sleep = sleep;
function fromUTF8Array(data) {
    // array of bytes
    let str = '', i;
    for (i = 0; i < data.length; i++) {
        const value = data[i];
        if (value < 0x80) {
            str += String.fromCharCode(value);
        }
        else if (value > 0xbf && value < 0xe0) {
            str += String.fromCharCode(((value & 0x1f) << 6) | (data[i + 1] & 0x3f));
            i += 1;
        }
        else if (value > 0xdf && value < 0xf0) {
            str += String.fromCharCode(((value & 0x0f) << 12) |
                ((data[i + 1] & 0x3f) << 6) |
                (data[i + 2] & 0x3f));
            i += 2;
        }
        else {
            // surrogate pair
            const charCode = (((value & 0x07) << 18) |
                ((data[i + 1] & 0x3f) << 12) |
                ((data[i + 2] & 0x3f) << 6) |
                (data[i + 3] & 0x3f)) -
                0x010000;
            str += String.fromCharCode((charCode >> 10) | 0xd800, (charCode & 0x03ff) | 0xdc00);
            i += 3;
        }
    }
    return str;
}
exports.fromUTF8Array = fromUTF8Array;
function parsePrice(price, mantissa = web3_js_1.LAMPORTS_PER_SOL) {
    return Math.ceil(parseFloat(price) * mantissa);
}
exports.parsePrice = parsePrice;
function parseDate(date) {
    if (date === 'now') {
        return Date.now() / 1000;
    }
    return Date.parse(date) / 1000;
}
exports.parseDate = parseDate;
const getMultipleAccounts = (connection, keys, commitment) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield Promise.all(chunks(keys, 99).map(chunk => getMultipleAccountsCore(connection, chunk, commitment)));
    const array = result
        .map(a => 
    //@ts-ignore
    a.array.map(acc => {
        if (!acc) {
            return undefined;
        }
        const { data } = acc, rest = __rest(acc, ["data"]);
        const obj = Object.assign(Object.assign({}, rest), { data: Buffer.from(data[0], 'base64') });
        return obj;
    }))
        //@ts-ignore
        .flat();
    return { keys, array };
});
exports.getMultipleAccounts = getMultipleAccounts;
function chunks(array, size) {
    return Array.apply(0, new Array(Math.ceil(array.length / size))).map((_, index) => array.slice(index * size, (index + 1) * size));
}
exports.chunks = chunks;
const getMultipleAccountsCore = (connection, keys, commitment) => __awaiter(void 0, void 0, void 0, function* () {
    const args = connection._buildArgs([keys], commitment, 'base64');
    const unsafeRes = yield connection._rpcRequest('getMultipleAccounts', args);
    if (unsafeRes.error) {
        throw new Error('failed to get info about account ' + unsafeRes.error.message);
    }
    if (unsafeRes.result.value) {
        const array = unsafeRes.result.value;
        return { keys, array };
    }
    // TODO: fix
    throw new Error();
});
const getPriceWithMantissa = (price, mint, walletKeyPair, anchorProgram) => __awaiter(void 0, void 0, void 0, function* () {
    const token = new spl_token_1.Token(anchorProgram.provider.connection, new anchor_1.web3.PublicKey(mint), spl_token_1.TOKEN_PROGRAM_ID, walletKeyPair);
    const mintInfo = yield token.getMintInfo();
    const mantissa = Math.pow(10, mintInfo.decimals);
    return Math.ceil(price * mantissa);
});
exports.getPriceWithMantissa = getPriceWithMantissa;
function getCluster(name) {
    if (name === '') {
        loglevel_1.default.info('Using cluster', constants_1.DEFAULT_CLUSTER.name);
        return constants_1.DEFAULT_CLUSTER.url;
    }
    for (const cluster of constants_1.CLUSTERS) {
        if (cluster.name === name) {
            loglevel_1.default.info('Using cluster', cluster.name);
            return cluster.url;
        }
    }
    throw new Error(`Could not get cluster: ${name}`);
    return null;
}
exports.getCluster = getCluster;
function parseUses(useMethod, total) {
    if (!!useMethod && !!total) {
        const realUseMethod = mpl_token_metadata_1.UseMethod[useMethod];
        if (!realUseMethod) {
            throw new Error(`Invalid use method: ${useMethod}`);
        }
        return new mpl_token_metadata_1.Uses({ useMethod: realUseMethod, total, remaining: total });
    }
    return null;
}
exports.parseUses = parseUses;
function parseCollectionMintPubkey(collectionMint, connection, walletKeypair) {
    return __awaiter(this, void 0, void 0, function* () {
        let collectionMintPubkey = null;
        if (collectionMint) {
            try {
                collectionMintPubkey = new web3_js_1.PublicKey(collectionMint);
            }
            catch (error) {
                throw new Error('Invalid Pubkey option. Please enter it as a base58 mint id');
            }
            const token = new spl_token_1.Token(connection, collectionMintPubkey, spl_token_1.TOKEN_PROGRAM_ID, walletKeypair);
            yield token.getMintInfo();
        }
        if (collectionMintPubkey) {
            const metadata = yield mpl_token_metadata_1.Metadata.findByMint(connection, collectionMintPubkey).catch();
            if (metadata.data.updateAuthority !== walletKeypair.publicKey.toString()) {
                throw new Error('Invalid collection mint option. Metadata update authority does not match provided wallet keypair');
            }
            const edition = yield mpl_token_metadata_1.Metadata.getEdition(connection, collectionMintPubkey);
            if (edition.data.key !== mpl_token_metadata_1.MetadataKey.MasterEditionV1 &&
                edition.data.key !== mpl_token_metadata_1.MetadataKey.MasterEditionV2) {
                throw new Error('Invalid collection mint. Provided collection mint does not have a master edition associated with it.');
            }
        }
        return collectionMintPubkey;
    });
}
exports.parseCollectionMintPubkey = parseCollectionMintPubkey;
