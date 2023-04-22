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
exports.CreateMint = void 0;
const assert_1 = require("assert");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore createInitializeMintInstruction export actually exist but isn't setup correctly
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
/**
 * Transaction that is used to create a mint.
 */
class CreateMint extends web3_js_1.Transaction {
    constructor(options, params) {
        const { feePayer } = options;
        (0, assert_1.strict)(feePayer != null, 'need to provide non-null feePayer');
        const { newAccountPubkey, lamports, decimals, owner, freezeAuthority } = params;
        super(options);
        this.add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: feePayer,
            newAccountPubkey,
            lamports,
            space: spl_token_1.MintLayout.span,
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        }));
        this.add((0, spl_token_1.createInitializeMintInstruction)(newAccountPubkey, decimals !== null && decimals !== void 0 ? decimals : 0, owner !== null && owner !== void 0 ? owner : feePayer, freezeAuthority !== null && freezeAuthority !== void 0 ? freezeAuthority : feePayer));
    }
    static createMintAccount(connection, payer) {
        return __awaiter(this, void 0, void 0, function* () {
            const mint = web3_js_1.Keypair.generate();
            const mintRent = yield connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span, 'confirmed');
            const createMintTx = new CreateMint({ feePayer: payer }, {
                newAccountPubkey: mint.publicKey,
                lamports: mintRent,
            });
            return { mint, createMintTx };
        });
    }
}
exports.CreateMint = CreateMint;
