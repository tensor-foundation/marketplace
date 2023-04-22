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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCollection = void 0;
const web3_js_1 = require("@solana/web3.js");
const accounts_1 = require("../helpers/accounts");
const constants_1 = require("../helpers/constants");
const anchor = __importStar(require("@project-serum/anchor"));
const spl_token_1 = require("@solana/spl-token");
const transactions_1 = require("../helpers/transactions");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const loglevel_1 = __importDefault(require("loglevel"));
const various_1 = require("../helpers/various");
function setCollection(walletKeyPair, anchorProgram, candyMachineAddress, collectionMint) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const signers = [walletKeyPair];
        const wallet = new anchor.Wallet(walletKeyPair);
        const instructions = [];
        let mintPubkey;
        let metadataPubkey;
        let masterEditionPubkey;
        let collectionPDAPubkey;
        let collectionAuthorityRecordPubkey;
        const candyMachine = yield anchorProgram.account.candyMachine.fetch(candyMachineAddress);
        if (!collectionMint) {
            const mint = anchor.web3.Keypair.generate();
            mintPubkey = mint.publicKey;
            metadataPubkey = yield (0, accounts_1.getMetadata)(mintPubkey);
            masterEditionPubkey = yield (0, accounts_1.getMasterEdition)(mintPubkey);
            [collectionPDAPubkey] = yield (0, accounts_1.getCollectionPDA)(candyMachineAddress);
            [collectionAuthorityRecordPubkey] = yield (0, accounts_1.getCollectionAuthorityRecordPDA)(mintPubkey, collectionPDAPubkey);
            signers.push(mint);
            const userTokenAccountAddress = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, wallet.publicKey);
            instructions.push(...[
                anchor.web3.SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: mintPubkey,
                    space: spl_token_1.MintLayout.span,
                    lamports: yield anchorProgram.provider.connection.getMinimumBalanceForRentExemption(spl_token_1.MintLayout.span),
                    programId: spl_token_1.TOKEN_PROGRAM_ID,
                }),
                spl_token_1.Token.createInitMintInstruction(spl_token_1.TOKEN_PROGRAM_ID, mintPubkey, 0, wallet.publicKey, wallet.publicKey),
                spl_token_1.Token.createAssociatedTokenAccountInstruction(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mintPubkey, userTokenAccountAddress, wallet.publicKey, wallet.publicKey),
                spl_token_1.Token.createMintToInstruction(spl_token_1.TOKEN_PROGRAM_ID, mintPubkey, userTokenAccountAddress, wallet.publicKey, [], 1),
            ]);
            const data = new mpl_token_metadata_1.DataV2({
                symbol: (_a = candyMachine.data.symbol) !== null && _a !== void 0 ? _a : '',
                name: 'Collection NFT',
                uri: '',
                sellerFeeBasisPoints: candyMachine.data.seller_fee_basis_points,
                creators: [
                    new mpl_token_metadata_1.Creator({
                        address: wallet.publicKey.toBase58(),
                        verified: true,
                        share: 100,
                    }),
                ],
                collection: null,
                uses: null,
            });
            instructions.push(...new mpl_token_metadata_1.CreateMetadataV2({ feePayer: wallet.publicKey }, {
                metadata: metadataPubkey,
                metadataData: data,
                updateAuthority: wallet.publicKey,
                mint: mintPubkey,
                mintAuthority: wallet.publicKey,
            }).instructions);
            instructions.push(...new mpl_token_metadata_1.CreateMasterEditionV3({
                feePayer: wallet.publicKey,
            }, {
                edition: masterEditionPubkey,
                metadata: metadataPubkey,
                mint: mintPubkey,
                mintAuthority: wallet.publicKey,
                updateAuthority: wallet.publicKey,
                maxSupply: new anchor.BN(0),
            }).instructions);
        }
        else {
            mintPubkey = yield (0, various_1.parseCollectionMintPubkey)(collectionMint, anchorProgram.provider.connection, walletKeyPair);
            metadataPubkey = yield (0, accounts_1.getMetadata)(mintPubkey);
            masterEditionPubkey = yield (0, accounts_1.getMasterEdition)(mintPubkey);
            [collectionPDAPubkey] = yield (0, accounts_1.getCollectionPDA)(candyMachineAddress);
            [collectionAuthorityRecordPubkey] = yield (0, accounts_1.getCollectionAuthorityRecordPDA)(mintPubkey, collectionPDAPubkey);
        }
        instructions.push(yield anchorProgram.instruction.setCollection({
            accounts: {
                candyMachine: candyMachineAddress,
                authority: wallet.publicKey,
                collectionPda: collectionPDAPubkey,
                payer: wallet.publicKey,
                systemProgram: web3_js_1.SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                metadata: metadataPubkey,
                mint: mintPubkey,
                edition: masterEditionPubkey,
                collectionAuthorityRecord: collectionAuthorityRecordPubkey,
                tokenMetadataProgram: constants_1.TOKEN_METADATA_PROGRAM_ID,
            },
        }));
        loglevel_1.default.info('Candy machine address: ', candyMachineAddress.toBase58());
        loglevel_1.default.info('Collection metadata address: ', metadataPubkey.toBase58());
        loglevel_1.default.info('Collection metadata authority: ', wallet.publicKey.toBase58());
        loglevel_1.default.info('Collection master edition address: ', masterEditionPubkey.toBase58());
        loglevel_1.default.info('Collection mint address: ', mintPubkey.toBase58());
        loglevel_1.default.info('Collection PDA address: ', collectionPDAPubkey.toBase58());
        loglevel_1.default.info('Collection authority record address: ', collectionAuthorityRecordPubkey.toBase58());
        const txId = (yield (0, transactions_1.sendTransactionWithRetryWithKeypair)(anchorProgram.provider.connection, walletKeyPair, instructions, signers)).txid;
        const toReturn = {
            collectionMetadata: metadataPubkey.toBase58(),
            collectionPDA: collectionPDAPubkey.toBase58(),
            txId,
        };
        return toReturn;
    });
}
exports.setCollection = setCollection;
