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
exports.pinataUpload = void 0;
const loglevel_1 = __importDefault(require("loglevel"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const file_uri_1 = require("./file-uri");
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('waiting');
        return new Promise(resolve => setTimeout(resolve, ms));
    });
}
function uploadMedia(media, jwt) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = new form_data_1.default();
        data.append('file', fs_1.default.createReadStream(media));
        const res = yield (0, node_fetch_1.default)(`https://api.pinata.cloud/pinning/pinFileToIPFS`, {
            headers: {
                Authorization: `Bearer ${jwt}`,
            },
            method: 'POST',
            body: data,
        });
        const json = yield res.json();
        return json.IpfsHash;
    });
}
function pinataUpload(image, animation, manifestBuffer, jwt, gateway) {
    return __awaiter(this, void 0, void 0, function* () {
        const gatewayUrl = gateway ? gateway : `https://ipfs.io`;
        const imageCid = yield uploadMedia(image, jwt);
        loglevel_1.default.info('uploaded image: ', `${gatewayUrl}/ipfs/${imageCid}`);
        yield sleep(500);
        let animationCid = undefined;
        let animationUrl = undefined;
        if (animation) {
            animationCid = yield uploadMedia(animation, jwt);
            loglevel_1.default.info('uploaded image: ', `${gatewayUrl}/ipfs/${animationCid}`);
        }
        const mediaUrl = `${gatewayUrl}/ipfs/${imageCid}`;
        if (animationCid) {
            animationUrl = `${gatewayUrl}/ipfs/${animationCid}`;
        }
        const manifestJson = yield (0, file_uri_1.setImageUrlManifest)(manifestBuffer.toString('utf8'), mediaUrl, animationUrl);
        fs_1.default.writeFileSync('tempJson.json', JSON.stringify(manifestJson));
        const metadataCid = yield uploadMedia('tempJson.json', jwt);
        yield sleep(500);
        const link = `${gatewayUrl}/ipfs/${metadataCid}`;
        loglevel_1.default.info('uploaded manifest: ', link);
        return [link, mediaUrl, animationUrl];
    });
}
exports.pinataUpload = pinataUpload;
