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
exports.createClaimResourceTransaction = void 0;
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const web3_js_1 = require("@solana/web3.js");
const instructions_1 = require("../../src/generated/instructions");
const utils_1 = require("../utils");
const createClaimResourceTransaction = ({ payer, connection, market, treasuryHolder, sellingResource, vault, metadata, destination, vaultOwnerBump, owner, }) => __awaiter(void 0, void 0, void 0, function* () {
    const instruction = (0, instructions_1.createClaimResourceInstruction)({
        market,
        treasuryHolder,
        sellingResource,
        sellingResourceOwner: payer.publicKey,
        vault,
        metadata,
        owner,
        destination,
        tokenMetadataProgram: mpl_token_metadata_1.PROGRAM_ID,
        clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
    }, {
        vaultOwnerBump,
    });
    const claimResourceTx = yield (0, utils_1.createAndSignTransaction)(connection, payer, [instruction], [payer]);
    return claimResourceTx;
});
exports.createClaimResourceTransaction = createClaimResourceTransaction;
