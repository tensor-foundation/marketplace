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
exports.createBuyTransaction = void 0;
const web3_js_1 = require("@solana/web3.js");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const instructions_1 = require("../../src/generated/instructions");
const createBuyTransaction = ({ connection, buyer, userTokenAccount, resourceMintMetadata, resourceMintEditionMarker, resourceMintMasterEdition, sellingResource, tradeHistory, tradeHistoryBump, market, marketTreasuryHolder, vault, vaultOwner, vaultOwnerBump, newMint, newMintEdition, newMintMetadata, newTokenAccount, additionalKeys, }) => __awaiter(void 0, void 0, void 0, function* () {
    const instruction = (0, instructions_1.createBuyInstruction)({
        // buyer wallet
        userWallet: buyer,
        // user token account
        userTokenAccount,
        // resource mint edition marker PDA
        editionMarker: resourceMintEditionMarker,
        // resource mint master edition
        masterEdition: resourceMintMasterEdition,
        // resource mint metadata PDA
        masterEditionMetadata: resourceMintMetadata,
        // token account for selling resource
        vault,
        // account which holds selling entities
        sellingResource,
        // owner of selling resource token account PDA
        owner: vaultOwner,
        // market account
        market,
        // PDA which creates on market for each buyer
        tradeHistory,
        // market treasury holder (buyer will send tokens to this account)
        treasuryHolder: marketTreasuryHolder,
        // newly generated mint address
        newMint,
        // newly generated mint metadata PDA
        newMetadata: newMintMetadata,
        // newly generated mint edition PDA
        newEdition: newMintEdition,
        newTokenAccount,
        // metaplex token metadata program address
        tokenMetadataProgram: mpl_token_metadata_1.PROGRAM_ID,
        clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
        anchorRemainingAccounts: additionalKeys,
    }, { tradeHistoryBump, vaultOwnerBump });
    const tx = new web3_js_1.Transaction();
    tx.add(instruction);
    tx.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
    tx.feePayer = buyer;
    return { tx };
});
exports.createBuyTransaction = createBuyTransaction;
