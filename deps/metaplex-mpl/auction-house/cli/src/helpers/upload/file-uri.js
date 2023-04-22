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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setImageUrlManifest = void 0;
/**
 * Set an asset's manifest from the filesystem & update it with the link
 * to the asset's image/animation link, obtained from signing the asset image/animation DataItem.
 *  Original function getUpdatedManifest from arweave-bundle
 */
function setImageUrlManifest(manifestString, imageLink, animationLink) {
    return __awaiter(this, void 0, void 0, function* () {
        const manifest = JSON.parse(manifestString);
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
exports.setImageUrlManifest = setImageUrlManifest;
