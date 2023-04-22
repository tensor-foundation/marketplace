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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawBundlr = exports.makeArweaveBundleUploadGenerator = exports.LAMPORTS = void 0;
const cliProgress = __importStar(require("cli-progress"));
const promises_1 = require("fs/promises");
const promise_pool_1 = require("@supercharge/promise-pool");
const path_1 = __importDefault(require("path"));
const arweave_1 = __importDefault(require("arweave"));
const arbundles_1 = require("arbundles");
const loglevel_1 = __importDefault(require("loglevel"));
const storage_type_1 = require("../storage-type");
const mime_1 = require("mime");
const various_1 = require("../various");
const client_1 = __importDefault(require("@bundlr-network/client"));
const upload_1 = require("../../commands/upload");
exports.LAMPORTS = 1000000000;
// The limit for the cumulated size of filepairs to include in a single bundle.
// arBundles has a limit of 250MB, we use our own limit way below that to:
// - account for the bundling overhead (tags, headers, ...)
// - lower the risk of having to re-upload voluminous filepairs
// - lower the risk for OOM crashes of the Node.js process
// - provide feedback to the user as the collection is bundles & uploaded progressively
// Change at your own risk.
const BUNDLE_SIZE_BYTE_LIMIT = 50 * 1024 * 1024;
/**
 * Tags to include with every individual transaction.
 */
const BASE_TAGS = [{ name: 'App-Name', value: 'Metaplex Candy Machine' }];
const contentTypeTags = {
    json: { name: 'Content-Type', value: 'application/json' },
    'arweave-manifest': {
        name: 'Content-Type',
        value: 'application/x.arweave-manifest+json',
    },
};
/**
 * Create an Arweave instance with sane defaults.
 */
function getArweave() {
    return new arweave_1.default({
        host: 'arweave.net',
        port: 443,
        protocol: 'https',
        timeout: 20000,
        logging: false,
        logger: console.log,
    });
}
/**
 * Simplistic helper to convert a bytes value to its MB counterpart.
 */
function sizeMB(bytes) {
    const precision = 3;
    const rounder = Math.pow(10, 3);
    return (Math.round((bytes / (1024 * 1024)) * rounder) / rounder).toFixed(precision);
}
/**
 * Create the Arweave Path Manifest from the asset image / manifest
 * pair txIds, helps Arweave Gateways find the files.
 * Instructs arweave gateways to serve metadata.json by default
 * when accessing the transaction.
 * See:
 * - https://github.com/ArweaveTeam/arweave/blob/master/doc/path-manifest-schema.md
 * - https://github.com/metaplex-foundation/metaplex/pull/859#pullrequestreview-805914075
 */
function createArweavePathManifest(manifestTxId, imageTxId, imageType, animationTxId, animationType) {
    const arweavePathManifest = {
        manifest: 'arweave/paths',
        version: '0.1.0',
        paths: {
            [`image${imageType}`]: {
                id: imageTxId,
            },
            'metadata.json': {
                id: manifestTxId,
            },
        },
        index: {
            path: 'metadata.json',
        },
    };
    if (animationTxId) {
        arweavePathManifest.paths[`animation${animationType}`] = {
            id: animationTxId,
        };
    }
    return arweavePathManifest;
}
// The size in bytes of a dummy Arweave Path Manifest.
// Used to account for the size of a file pair manifest, in the computation
// of a bundle range.
const dummyAreaveManifestByteSize = (() => {
    const dummyAreaveManifest = createArweavePathManifest('akBSbAEWTf6xDDnrG_BHKaxXjxoGuBnuhMnoYKUCDZo', 'akBSbAEWTf6xDDnrG_BHKaxXjxoGuBnuhMnoYKUCDZo', '.png', 'akBSbAEWTf6xDDnrG_BHKaxXjxoGuBnuhMnoYKUCDZo', '.mp4');
    return Buffer.byteLength(JSON.stringify(dummyAreaveManifest));
})();
function getFilePairSize({ image, animation, manifest, }) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield [image, animation, manifest].reduce((accP, file) => __awaiter(this, void 0, void 0, function* () {
            const acc = yield accP;
            if (!file) {
                return acc;
            }
            else {
                const { size } = yield (0, promises_1.stat)(file);
                //Adds the 2kb buffer for the txn header and the 10kb min file upload size for bundlr
                return acc + 2000 + Math.max(10000, size);
            }
        }), Promise.resolve(dummyAreaveManifestByteSize));
    });
}
/**
 * From a list of file pairs, compute the BundleRange that should be included
 * in a bundle, consisting of one or multiple image + manifest pairs,
 * according to the size of the files to be included in respect of the
 * BUNDLE_SIZE_LIMIT.
 */
function getBundleRange(filePairs, splitSize = false) {
    return __awaiter(this, void 0, void 0, function* () {
        let total = 0;
        let count = 0;
        for (const filePair of filePairs) {
            const filePairSize = yield getFilePairSize(filePair);
            const limit = splitSize
                ? BUNDLE_SIZE_BYTE_LIMIT * 2
                : BUNDLE_SIZE_BYTE_LIMIT;
            if (total + filePairSize >= limit) {
                if (count === 0) {
                    throw new Error(`Image + Manifest filepair (${filePair.key}) too big (${sizeMB(filePairSize)}MB) for arBundles size limit of ${sizeMB(BUNDLE_SIZE_BYTE_LIMIT)}MB.`);
                }
                break;
            }
            total += filePairSize;
            count += 1;
        }
        return { count, size: total };
    });
}
const imageTags = [...BASE_TAGS];
/**
 * Retrieve a DataItem which will hold the asset's image binary data
 * & represent an individual Arweave transaction which can be signed & bundled.
 */
function getImageDataItem(signer, image, contentType) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, arbundles_1.createData)(image, signer, {
            tags: imageTags.concat({ name: 'Content-Type', value: contentType }),
        });
    });
}
const manifestTags = [...BASE_TAGS, contentTypeTags['json']];
/**
 * Retrieve a DataItem which will hold the asset's manifest binary data
 * & represent an individual Arweave transaction which can be signed & bundled.
 */
function getManifestDataItem(signer, manifest) {
    return (0, arbundles_1.createData)(JSON.stringify(manifest), signer, { tags: manifestTags });
}
const arweavePathManifestTags = [
    ...BASE_TAGS,
    contentTypeTags['arweave-manifest'],
];
/**
 * Retrieve a DataItem which will hold the Arweave Path Manifest binary data
 * & represent an individual Arweave transaction which can be signed & bundled.
 */
function getArweavePathManifestDataItem(signer, arweavePathManifest) {
    return (0, arbundles_1.createData)(JSON.stringify(arweavePathManifest), signer, {
        tags: arweavePathManifestTags,
    });
}
/**
 * Retrieve an asset's manifest from the filesystem & update it with the link
 * to the asset's image/animation link, obtained from signing the asset image/animation DataItem.
 */
function getUpdatedManifest(manifestPath, imageLink, animationLink) {
    return __awaiter(this, void 0, void 0, function* () {
        const manifest = JSON.parse((yield (0, promises_1.readFile)(manifestPath)).toString());
        const originalImage = manifest.image;
        manifest.image = imageLink;
        manifest.properties.files.forEach(file => {
            if (file.uri === originalImage)
                file.uri = imageLink;
        });
        if (animationLink) {
            manifest.animation_url = animationLink;
        }
        return manifest;
    });
}
/**
 * Fetches the corresponding filepair and creates a data item if arweave bundle
 * or creates a bundlr transaction if arweave sol, to basically avoid clashing
 * between data item's id
 */
function processFiles({ signer, filePair, bundlr, storageType, }) {
    return __awaiter(this, void 0, void 0, function* () {
        let imageDataItem;
        let animationDataItem;
        let manifestDataItem;
        let arweavePathManifestDataItem;
        const imageContentType = (0, mime_1.getType)(filePair.image);
        const imageBuffer = yield (0, promises_1.readFile)(filePair.image);
        if (storageType === storage_type_1.StorageType.ArweaveSol) {
            //@ts-ignore
            imageDataItem = bundlr.createTransaction(imageBuffer, {
                tags: imageTags.concat({
                    name: 'Content-Type',
                    value: imageContentType,
                }),
            });
            yield imageDataItem.sign();
        }
        else if (storageType === storage_type_1.StorageType.ArweaveBundle) {
            imageDataItem = yield getImageDataItem(signer, imageBuffer, imageContentType);
            yield imageDataItem.sign(signer);
        }
        let animationContentType = undefined;
        if (filePair.animation) {
            animationContentType = (0, mime_1.getType)(filePair.animation);
            const animationBuffer = yield (0, promises_1.readFile)(filePair.animation);
            if (storageType === storage_type_1.StorageType.ArweaveSol) {
                //@ts-ignore
                animationDataItem = bundlr.createTransaction(animationBuffer, {
                    tags: imageTags.concat({
                        name: 'Content-Type',
                        value: animationContentType,
                    }),
                });
                yield animationDataItem.sign();
            }
            else if (storageType === storage_type_1.StorageType.ArweaveBundle) {
                animationDataItem = yield getImageDataItem(signer, animationBuffer, animationContentType);
                yield animationDataItem.sign(signer);
            }
        }
        const imageLink = `https://arweave.net/${imageDataItem.id}?ext=${path_1.default
            .extname(filePair.image)
            .replace('.', '')}`;
        const animationLink = filePair.animation
            ? `https://arweave.net/${animationDataItem.id}?ext=${path_1.default
                .extname(filePair.animation)
                .replace('.', '')}`
            : undefined;
        const manifest = yield getUpdatedManifest(filePair.manifest, imageLink, animationLink);
        if (storageType === storage_type_1.StorageType.ArweaveSol) {
            //@ts-ignore
            manifestDataItem = bundlr.createTransaction(JSON.stringify(manifest), {
                tags: manifestTags,
            });
            yield manifestDataItem.sign();
        }
        else if (storageType === storage_type_1.StorageType.ArweaveBundle) {
            manifestDataItem = getManifestDataItem(signer, manifest);
            yield manifestDataItem.sign(signer);
        }
        const arweavePathManifest = createArweavePathManifest(manifestDataItem.id, imageDataItem.id, `.${(0, mime_1.getExtension)(imageContentType)}`, filePair.animation ? animationDataItem.id : undefined, filePair.animation ? `.${(0, mime_1.getExtension)(animationContentType)}` : undefined);
        if (storageType === storage_type_1.StorageType.ArweaveSol) {
            //@ts-ignore
            arweavePathManifestDataItem = bundlr.createTransaction(JSON.stringify(arweavePathManifest), { tags: arweavePathManifestTags });
            yield arweavePathManifestDataItem.sign();
            yield arweavePathManifestDataItem.sign(signer);
        }
        else if (storageType === storage_type_1.StorageType.ArweaveBundle) {
            arweavePathManifestDataItem = getArweavePathManifestDataItem(signer, arweavePathManifest);
            yield arweavePathManifestDataItem.sign(signer);
        }
        return {
            imageDataItem,
            animationDataItem,
            manifestDataItem,
            arweavePathManifestDataItem,
            manifest,
        };
    });
}
/**
 * Initialize the Arweave Bundle Upload Generator.
 * Returns a Generator function that allows to trigger an asynchronous bundle
 * upload to Arweave when calling generator.next().
 * The Arweave Bundle Upload Generator automatically groups assets file pairs
 * into appropriately sized bundles.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator
 */
function makeArweaveBundleUploadGenerator(storage, dirname, assets, env, jwk, walletKeyPair, batchSize, rpcUrl) {
    return __asyncGenerator(this, arguments, function* makeArweaveBundleUploadGenerator_1() {
        let signer;
        const storageType = storage;
        if (storageType === storage_type_1.StorageType.ArweaveSol && !walletKeyPair) {
            throw new Error('To pay for uploads with SOL, you need to pass a Solana Keypair');
        }
        if (storageType === storage_type_1.StorageType.ArweaveBundle && !jwk) {
            throw new Error('To pay for uploads with AR, you need to pass a Arweave JWK');
        }
        if (storageType === storage_type_1.StorageType.ArweaveBundle) {
            signer = new arbundles_1.signers.ArweaveSigner(jwk);
        }
        const arweave = getArweave();
        const bundlr = storageType === storage_type_1.StorageType.ArweaveSol
            ? env === 'mainnet-beta'
                ? new client_1.default('https://node1.bundlr.network', 'solana', walletKeyPair.secretKey, {
                    timeout: 60000,
                    providerUrl: rpcUrl !== null && rpcUrl !== void 0 ? rpcUrl : 'https://api.metaplex.solana.com',
                })
                : new client_1.default('https://devnet.bundlr.network', 'solana', walletKeyPair.secretKey, {
                    timeout: 60000,
                    providerUrl: 'https://metaplex.devnet.rpcpool.com',
                })
            : undefined;
        loglevel_1.default.debug('Bundlr type is: ', env);
        const filePairs = assets.map((asset) => {
            const manifestPath = path_1.default.join(dirname, `${asset.index}.json`);
            const manifestData = (0, upload_1.getAssetManifest)(dirname, asset.index);
            return {
                key: asset.index,
                image: path_1.default.join(dirname, `${manifestData.image}`),
                animation: 'animation_url' in manifestData
                    ? path_1.default.join(dirname, `${manifestData.animation_url}`)
                    : undefined,
                manifest: manifestPath,
            };
        });
        if (storageType === storage_type_1.StorageType.ArweaveSol) {
            const bytes = (yield __await(Promise.all(filePairs.map(getFilePairSize)))).reduce((a, b) => a + b, 0);
            const cost = yield __await(bundlr.utils.getPrice('solana', bytes));
            const bufferCost = cost.multipliedBy(3).dividedToIntegerBy(2);
            loglevel_1.default.info(`${bufferCost.toNumber() / exports.LAMPORTS} SOL to upload ${sizeMB(bytes)}MB with buffer`);
            const currentBalance = yield __await(bundlr.getLoadedBalance());
            if (currentBalance.lt(bufferCost)) {
                loglevel_1.default.info(`Current balance ${currentBalance.toNumber() / exports.LAMPORTS}. Sending fund txn...`);
                yield __await(bundlr.fund(bufferCost.minus(currentBalance)));
                loglevel_1.default.info(`Successfully funded Arweave Bundler, starting upload`);
            }
            else {
                loglevel_1.default.info(`Current balance ${currentBalance.toNumber() / exports.LAMPORTS} is sufficient.`);
            }
        }
        // As long as we still have file pairs needing upload, compute the next range
        // of file pairs we can include in the next bundle.
        while (filePairs.length) {
            const { count, size } = yield __await(getBundleRange(filePairs, storage === storage_type_1.StorageType.ArweaveSol));
            loglevel_1.default.info(`Computed Bundle range, including ${count} file pair(s) totaling ${sizeMB(size)}MB.`);
            const bundleFilePairs = filePairs.splice(0, count);
            loglevel_1.default.info('Processing file groups...');
            const progressBar = new cliProgress.SingleBar({
                format: 'Progress: [{bar}] {percentage}% | {value}/{total}',
            }, cliProgress.Presets.shades_classic);
            progressBar.start(bundleFilePairs.length, 0);
            const { cacheKeys, dataItems, arweavePathManifestLinks, updatedManifests } = yield __await(bundleFilePairs.reduce(
            // Process a bundle file pair (image + manifest).
            // - retrieve image data, put it in a DataItem
            // - sign the image DataItem and build the image link from the txId.
            // - retrieve & update the asset manifest w/ the image link
            // - put the manifest in a DataItem
            // - sign the manifest DataItem and build the manifest link form the txId.
            // - create the Arweave Path Manifest w/ both asset image + manifest txIds pair.
            // - fill the results accumulator
            function processBundleFilePair(accP, filePair) {
                return __awaiter(this, void 0, void 0, function* () {
                    const acc = yield accP;
                    loglevel_1.default.debug('Processing File Pair', filePair.key);
                    const { imageDataItem, animationDataItem, manifestDataItem, arweavePathManifestDataItem, manifest, } = yield processFiles({ storageType, signer, bundlr, filePair });
                    const arweavePathManifestLink = `https://arweave.net/${manifestDataItem.id}`;
                    acc.cacheKeys.push(filePair.key);
                    acc.dataItems.push(imageDataItem, manifestDataItem, arweavePathManifestDataItem);
                    if (filePair.animation) {
                        acc.dataItems.push(animationDataItem);
                    }
                    acc.arweavePathManifestLinks.push(arweavePathManifestLink);
                    acc.updatedManifests.push(manifest);
                    loglevel_1.default.debug('Processed File Pair', filePair.key);
                    progressBar.increment();
                    return acc;
                });
            }, Promise.resolve({
                cacheKeys: [],
                dataItems: [],
                arweavePathManifestLinks: [],
                updatedManifests: [],
            })));
            progressBar.stop();
            if (storageType === storage_type_1.StorageType.ArweaveSol) {
                const bundlrTransactions = [
                    ...dataItems,
                ];
                loglevel_1.default.info('Uploading bundle via Bundlr... in multiple transactions');
                const progressBar = new cliProgress.SingleBar({
                    format: 'Progress: [{bar}] {percentage}% | {value}/{total}',
                }, cliProgress.Presets.shades_classic);
                progressBar.start(bundlrTransactions.length, 0);
                let errored = false;
                yield __await(promise_pool_1.PromisePool.withConcurrency(batchSize || 20)
                    .for(bundlrTransactions)
                    .handleError((err) => __awaiter(this, void 0, void 0, function* () {
                    if (!errored) {
                        errored = true;
                        loglevel_1.default.error(`\nCould not complete Bundlr tx upload successfully, exiting due to: `, err);
                    }
                    throw err;
                }))
                    .process((tx) => __awaiter(this, void 0, void 0, function* () {
                    let attempts = 0;
                    const uploadTransaction = () => __awaiter(this, void 0, void 0, function* () {
                        yield tx.upload().catch((err) => __awaiter(this, void 0, void 0, function* () {
                            attempts++;
                            if (attempts >= 3) {
                                throw err;
                            }
                            loglevel_1.default.debug(`Failed Bundlr tx upload, retrying transaction (attempt: ${attempts})`, err);
                            yield (0, various_1.sleep)(5 * 1000);
                            yield uploadTransaction();
                        }));
                    });
                    yield uploadTransaction();
                    progressBar.increment();
                })));
                progressBar.stop();
                loglevel_1.default.info('Bundle uploaded!');
            }
            if (storageType === storage_type_1.StorageType.ArweaveBundle) {
                const startBundleTime = Date.now();
                loglevel_1.default.info('Bundling...');
                const bundle = yield __await((0, arbundles_1.bundleAndSignData)(dataItems, signer));
                const endBundleTime = Date.now();
                loglevel_1.default.info(`Bundled ${dataItems.length} data items in ${(endBundleTime - startBundleTime) / 1000}s`);
                // @ts-ignore
                // Argument of type
                // 'import("node_modules/arweave/node/common").default'
                // is not assignable to parameter of type
                // 'import("node_modules/arbundles/node_modules/arweave/node/common").default'.
                // Types of property 'api' are incompatible.
                const tx = yield __await(bundle.toTransaction(arweave, jwk));
                yield __await(arweave.transactions.sign(tx, jwk));
                loglevel_1.default.info('Uploading bundle via arbundle...');
                yield __await(arweave.transactions.post(tx));
                loglevel_1.default.info('Bundle uploaded!', tx.id);
            }
            yield yield __await({ cacheKeys, arweavePathManifestLinks, updatedManifests });
        }
    });
}
exports.makeArweaveBundleUploadGenerator = makeArweaveBundleUploadGenerator;
const withdrawBundlr = (walletKeyPair) => __awaiter(void 0, void 0, void 0, function* () {
    const bundlr = new client_1.default('https://node1.bundlr.network', 'solana', walletKeyPair.secretKey);
    const balance = yield bundlr.getLoadedBalance();
    if (balance.minus(5000).lte(0)) {
        loglevel_1.default.error(`Error: Balance in Bundlr node (${balance.dividedBy(exports.LAMPORTS)} SOL) is too low to withdraw.`);
    }
    else {
        loglevel_1.default.info(`Requesting a withdrawal of ${balance
            .minus(5000)
            .dividedBy(exports.LAMPORTS)} SOL from Bundlr...`);
        try {
            const withdrawResponse = yield bundlr.withdrawBalance(balance.minus(5000));
            if (withdrawResponse.status == 200) {
                loglevel_1.default.info(`Successfully withdrew ${withdrawResponse.data.final / exports.LAMPORTS} SOL.`);
            }
            else if (withdrawResponse.status == 400) {
                loglevel_1.default.info(withdrawResponse.data);
                loglevel_1.default.info('Withdraw unsucessful. An additional attempt will be made after all files are uploaded.');
            }
        }
        catch (err) {
            loglevel_1.default.error('Error processing withdrawal request. Please try again using the withdraw_bundlr command in our CLI');
            loglevel_1.default.error('Error: ', err);
        }
    }
});
exports.withdrawBundlr = withdrawBundlr;
