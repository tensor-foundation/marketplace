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
/* eslint-disable @typescript-eslint/no-unused-vars */
const web3_js_1 = require("@solana/web3.js");
const common_1 = require("@project-serum/common"); //TODO remove this
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const src_1 = require("../src");
const js_1 = require("@metaplex-foundation/js");
const amman_1 = require("@metaplex-foundation/amman");
(0, chai_1.use)(chai_as_promised_1.default);
describe('fanout', () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection(amman_1.LOCALHOST, 'confirmed');
    const metaplex = new js_1.Metaplex(connection);
    let authorityWallet;
    metaplex.use((0, js_1.keypairIdentity)(authorityWallet));
    let fanoutSdk;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        authorityWallet = web3_js_1.Keypair.generate();
        yield connection.requestAirdrop(authorityWallet.publicKey, web3_js_1.LAMPORTS_PER_SOL * 10);
        fanoutSdk = new src_1.FanoutClient(connection, new common_1.NodeWallet(new web3_js_1.Account(authorityWallet.secretKey)));
        yield connection.requestAirdrop(authorityWallet.publicKey, web3_js_1.LAMPORTS_PER_SOL * 10);
    }));
    describe('NFT Signing', () => {
        it('Can Sign As Creator', () => __awaiter(void 0, void 0, void 0, function* () {
            const { fanout } = yield fanoutSdk.initializeFanout({
                totalShares: 100,
                name: `Test${Date.now()}`,
                membershipModel: src_1.MembershipModel.NFT,
            });
            const fanoutAccount = yield fanoutSdk.fetch(fanout, src_1.Fanout);
            const { nft } = yield metaplex.nfts().create({
                uri: 'URI',
                name: 'NAME',
                symbol: 'SYMBOL',
                sellerFeeBasisPoints: 1000,
                creators: [
                    {
                        address: authorityWallet.publicKey,
                        share: 0,
                        authority: authorityWallet,
                    },
                    {
                        address: fanoutAccount.accountKey,
                        share: 100,
                    },
                ],
            });
            //@ts-ignore
            const sign = yield fanoutSdk.signMetadata({
                fanout: fanout,
                metadata: nft.metadataAddress,
            });
            const meta = yield metaplex.nfts().findByMint({ mintAddress: nft.mint.address });
            (0, chai_1.expect)(meta.creators.at(1).verified);
            (0, chai_1.expect)(meta.creators.at(1).address).to.equal(fanoutAccount.accountKey.toBase58());
        }));
    });
}));
