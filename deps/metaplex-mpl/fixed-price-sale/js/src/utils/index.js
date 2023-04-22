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
exports.validateMembershipToken = exports.findPrimaryMetadataCreatorsAddress = exports.findPayoutTicketAddress = exports.findTradeHistoryAddress = exports.findTreasuryOwnerAddress = exports.findVaultOwnerAddress = void 0;
const web3_js_1 = require("@solana/web3.js");
const generated_1 = require("../generated");
const js_1 = require("@metaplex-foundation/js");
const VAULT_OWNER_PREFIX = 'mt_vault';
const HISTORY_PREFIX = 'history';
const PAYOUT_TICKET_PREFIX = 'payout_ticket';
const HOLDER_PREFIX = 'holder';
const PRIMARY_METADATA_CREATORS_PREFIX = 'primary_creators';
const findVaultOwnerAddress = (mint, store) => web3_js_1.PublicKey.findProgramAddress([Buffer.from(VAULT_OWNER_PREFIX), mint.toBuffer(), store.toBuffer()], generated_1.PROGRAM_ID);
exports.findVaultOwnerAddress = findVaultOwnerAddress;
const findTreasuryOwnerAddress = (treasuryMint, sellingResource) => web3_js_1.PublicKey.findProgramAddress([Buffer.from(HOLDER_PREFIX), treasuryMint.toBuffer(), sellingResource.toBuffer()], generated_1.PROGRAM_ID);
exports.findTreasuryOwnerAddress = findTreasuryOwnerAddress;
const findTradeHistoryAddress = (wallet, market) => web3_js_1.PublicKey.findProgramAddress([Buffer.from(HISTORY_PREFIX), wallet.toBuffer(), market.toBuffer()], generated_1.PROGRAM_ID);
exports.findTradeHistoryAddress = findTradeHistoryAddress;
const findPayoutTicketAddress = (market, funder) => {
    return web3_js_1.PublicKey.findProgramAddress([Buffer.from(PAYOUT_TICKET_PREFIX), market.toBuffer(), funder.toBuffer()], generated_1.PROGRAM_ID);
};
exports.findPayoutTicketAddress = findPayoutTicketAddress;
const findPrimaryMetadataCreatorsAddress = (metadata) => web3_js_1.PublicKey.findProgramAddress([Buffer.from(PRIMARY_METADATA_CREATORS_PREFIX), metadata.toBuffer()], generated_1.PROGRAM_ID);
exports.findPrimaryMetadataCreatorsAddress = findPrimaryMetadataCreatorsAddress;
const validateMembershipToken = (connection, me, ta) => __awaiter(void 0, void 0, void 0, function* () {
    const metaplex = js_1.Metaplex.make(connection);
    const nft = yield metaplex.nfts().findByMint({ mintAddress: ta.mint });
    (0, js_1.assertNft)(nft);
    (0, js_1.assertNftPrintEdition)(nft.edition);
    return nft.edition.parent.equals(me);
});
exports.validateMembershipToken = validateMembershipToken;
