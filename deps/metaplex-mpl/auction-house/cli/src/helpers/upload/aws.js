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
exports.awsUpload = void 0;
const loglevel_1 = __importDefault(require("loglevel"));
const path_1 = require("path");
const fs_1 = require("fs");
const client_s3_1 = require("@aws-sdk/client-s3");
const path_2 = __importDefault(require("path"));
const mime_1 = require("mime");
const file_uri_1 = require("./file-uri");
function uploadFile(s3Client, awsS3Bucket, filename, contentType, body) {
    return __awaiter(this, void 0, void 0, function* () {
        const mediaUploadParams = {
            Bucket: awsS3Bucket,
            Key: filename,
            Body: body,
            ACL: 'public-read',
            ContentType: contentType,
        };
        try {
            yield s3Client.send(new client_s3_1.PutObjectCommand(mediaUploadParams));
            loglevel_1.default.info('uploaded filename:', filename);
        }
        catch (err) {
            loglevel_1.default.info('Error', err);
        }
        const url = `https://${awsS3Bucket}.s3.amazonaws.com/${filename}`;
        loglevel_1.default.debug('Location:', url);
        return url;
    });
}
function awsUpload(awsS3Bucket, image, animation, manifestBuffer) {
    return __awaiter(this, void 0, void 0, function* () {
        const REGION = 'us-east-1'; // TODO: Parameterize this.
        const s3Client = new client_s3_1.S3Client({ region: REGION });
        function uploadMedia(media) {
            return __awaiter(this, void 0, void 0, function* () {
                const mediaPath = `assets/${(0, path_1.basename)(media)}`;
                loglevel_1.default.debug('media:', media);
                loglevel_1.default.debug('mediaPath:', mediaPath);
                const mediaFileStream = (0, fs_1.createReadStream)(media);
                const mediaUrl = yield uploadFile(s3Client, awsS3Bucket, mediaPath, (0, mime_1.getType)(media), mediaFileStream);
                return mediaUrl;
            });
        }
        // Copied from ipfsUpload
        const imageUrl = `${yield uploadMedia(image)}?ext=${path_2.default
            .extname(image)
            .replace('.', '')}`;
        const animationUrl = animation
            ? `${yield uploadMedia(animation)}?ext=${path_2.default
                .extname(animation)
                .replace('.', '')}`
            : undefined;
        const manifestJson = yield (0, file_uri_1.setImageUrlManifest)(manifestBuffer.toString('utf8'), imageUrl, animationUrl);
        const updatedManifestBuffer = Buffer.from(JSON.stringify(manifestJson));
        const extensionRegex = new RegExp(`${path_2.default.extname(image)}$`);
        const metadataFilename = image.replace(extensionRegex, '.json');
        const metadataUrl = yield uploadFile(s3Client, awsS3Bucket, metadataFilename, 'application/json', updatedManifestBuffer);
        return [metadataUrl, imageUrl, animationUrl];
    });
}
exports.awsUpload = awsUpload;
