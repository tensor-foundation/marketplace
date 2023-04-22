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
exports.createWithdrawTransaction = void 0;
/* eslint-disable @typescript-eslint/no-non-null-assertion */
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("../utils");
const instructions_1 = require("../../src/generated/instructions");
const createWithdrawTransaction = ({ payer, connection, market, payoutTicket, destination, treasuryMint, treasuryHolder, metadata, sellingResource, treasuryOwnerBump, payoutTicketBump, treasuryOwner, primaryMetadataCreators, }) => __awaiter(void 0, void 0, void 0, function* () {
    const remainingAccounts = [];
    for (const creator of primaryMetadataCreators) {
        remainingAccounts.push({ pubkey: creator, isWritable: true, isSigner: false });
    }
    const instruction = yield (0, instructions_1.createWithdrawInstruction)({
        market,
        sellingResource,
        metadata,
        treasuryHolder,
        treasuryMint,
        owner: treasuryOwner,
        destination,
        funder: payer.publicKey,
        payer: payer.publicKey,
        payoutTicket: payoutTicket,
        associatedTokenProgram: spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID,
        anchorRemainingAccounts: remainingAccounts,
        clock: web3_js_1.SYSVAR_CLOCK_PUBKEY,
    }, {
        treasuryOwnerBump,
        payoutTicketBump,
    });
    const withdrawTx = yield (0, utils_1.createAndSignTransaction)(connection, payer, [instruction], [payer]);
    return withdrawTx;
});
exports.createWithdrawTransaction = createWithdrawTransaction;
