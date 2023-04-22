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
exports.ipfsUpload = void 0;
const loglevel_1 = __importDefault(require("loglevel"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const ipfs_http_client_1 = require("ipfs-http-client");
const path_1 = __importDefault(require("path"));
const file_uri_1 = require("./file-uri");
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function ipfsUpload(ipfsCredentials, image, animation, manifestBuffer) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenIfps = `${ipfsCredentials.projectId}:${ipfsCredentials.secretKey}`;
        // @ts-ignore
        const ipfs = (0, ipfs_http_client_1.create)('https://ipfs.infura.io:5001');
        const authIFPS = Buffer.from(tokenIfps).toString('base64');
        const uploadToIpfs = (source) => __awaiter(this, void 0, void 0, function* () {
            const { cid } = yield ipfs.add(source).catch();
            return cid;
        });
        function uploadMedia(media) {
            return __awaiter(this, void 0, void 0, function* () {
                const mediaHash = yield uploadToIpfs((0, ipfs_http_client_1.globSource)(media, { recursive: true }));
                loglevel_1.default.debug('mediaHash:', mediaHash);
                const mediaUrl = `https://ipfs.io/ipfs/${mediaHash}`;
                loglevel_1.default.info('mediaUrl:', mediaUrl);
                yield (0, node_fetch_1.default)(`https://ipfs.infura.io:5001/api/v0/pin/add?arg=${mediaHash}`, {
                    headers: {
                        Authorization: `Basic ${authIFPS}`,
                    },
                    method: 'POST',
                });
                loglevel_1.default.info('uploaded media for file:', media);
                return mediaUrl;
            });
        }
        const imageUrl = `${yield uploadMedia(image)}?ext=${path_1.default
            .extname(image)
            .replace('.', '')}`;
        const animationUrl = animation
            ? `${yield uploadMedia(animation)}?ext=${path_1.default
                .extname(animation)
                .replace('.', '')}`
            : undefined;
        const manifestJson = yield (0, file_uri_1.setImageUrlManifest)(manifestBuffer.toString('utf8'), imageUrl, animationUrl);
        const manifestHash = yield uploadToIpfs(Buffer.from(JSON.stringify(manifestJson)));
        yield (0, node_fetch_1.default)(`https://ipfs.infura.io:5001/api/v0/pin/add?arg=${manifestHash}`, {
            headers: {
                Authorization: `Basic ${authIFPS}`,
            },
            method: 'POST',
        });
        yield sleep(500);
        const link = `https://ipfs.io/ipfs/${manifestHash}`;
        loglevel_1.default.info('uploaded manifest: ', link);
        return [link, imageUrl, animationUrl];
    });
}
exports.ipfsUpload = ipfsUpload;
