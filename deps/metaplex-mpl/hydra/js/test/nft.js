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
const spl_token_1 = require("@solana/spl-token");
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const src_1 = require("../src");
const amman_1 = require("@metaplex-foundation/amman");
const scenarios_1 = require("./utils/scenarios");
const js_1 = require("@metaplex-foundation/js");
const anchor_1 = require("@project-serum/anchor");
(0, chai_1.use)(chai_as_promised_1.default);
describe('fanout', () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection(amman_1.LOCALHOST, 'confirmed');
    const metaplex = new js_1.Metaplex(connection);
    const lamportsNeeded = 10000000000;
    let authorityWallet;
    metaplex.use((0, js_1.keypairIdentity)(authorityWallet));
    let fanoutSdk;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        authorityWallet = web3_js_1.Keypair.generate();
        let signature = yield connection.requestAirdrop(authorityWallet.publicKey, 1000000000);
        yield connection.confirmTransaction(signature);
        fanoutSdk = new src_1.FanoutClient(connection, new anchor_1.Wallet(authorityWallet));
        signature = yield connection.requestAirdrop(authorityWallet.publicKey, 1000000000);
        yield connection.confirmTransaction(signature);
    }));
    describe('NFT membership model', () => {
        describe('Creation', () => {
            it('Init', () => __awaiter(void 0, void 0, void 0, function* () {
                const { fanout } = yield fanoutSdk.initializeFanout({
                    totalShares: 100,
                    name: `Test${Date.now()}`,
                    membershipModel: src_1.MembershipModel.NFT,
                });
                const fanoutAccount = yield fanoutSdk.fetch(fanout, src_1.Fanout);
                (0, chai_1.expect)(fanoutAccount.membershipModel).to.equal(src_1.MembershipModel.NFT);
                (0, chai_1.expect)(fanoutAccount.lastSnapshotAmount.toString()).to.equal('0');
                (0, chai_1.expect)(fanoutAccount.totalMembers.toString()).to.equal('0');
                (0, chai_1.expect)(fanoutAccount.totalInflow.toString()).to.equal('0');
                (0, chai_1.expect)(fanoutAccount.totalAvailableShares.toString()).to.equal('100');
                (0, chai_1.expect)(fanoutAccount.totalShares.toString()).to.equal('100');
                (0, chai_1.expect)(fanoutAccount.membershipMint).to.equal(null);
                (0, chai_1.expect)(fanoutAccount.totalStakedShares).to.equal(null);
            }));
            it('Init For mint', () => __awaiter(void 0, void 0, void 0, function* () {
                const { fanout } = yield fanoutSdk.initializeFanout({
                    totalShares: 100,
                    name: `Test${Date.now()}`,
                    membershipModel: src_1.MembershipModel.NFT,
                });
                const mint = yield spl_token_1.Token.createMint(connection, authorityWallet, authorityWallet.publicKey, null, 6, spl_token_1.TOKEN_PROGRAM_ID);
                const { fanoutForMint, tokenAccount } = yield fanoutSdk.initializeFanoutForMint({
                    fanout,
                    mint: mint.publicKey,
                });
                const fanoutMintAccount = yield fanoutSdk.fetch(fanoutForMint, src_1.FanoutMint);
                (0, chai_1.expect)(fanoutMintAccount.mint.toBase58()).to.equal(mint.publicKey.toBase58());
                (0, chai_1.expect)(fanoutMintAccount.fanout.toBase58()).to.equal(fanout.toBase58());
                (0, chai_1.expect)(fanoutMintAccount.tokenAccount.toBase58()).to.equal(tokenAccount.toBase58());
                (0, chai_1.expect)(fanoutMintAccount.totalInflow.toString()).to.equal('0');
                (0, chai_1.expect)(fanoutMintAccount.lastSnapshotAmount.toString()).to.equal('0');
            }));
        });
        describe('Adding Members', () => {
            it('Adds Members With NFT', () => __awaiter(void 0, void 0, void 0, function* () {
                var _a, _b;
                const init = yield fanoutSdk.initializeFanout({
                    totalShares: 100,
                    name: `Test${Date.now()}`,
                    membershipModel: src_1.MembershipModel.NFT,
                });
                const { nft } = yield metaplex.nfts().create({
                    uri: 'URI',
                    name: 'NAME',
                    symbol: 'SYMBOL',
                    sellerFeeBasisPoints: 1000,
                });
                const { membershipAccount } = yield fanoutSdk.addMemberNft({
                    fanout: init.fanout,
                    fanoutNativeAccount: init.nativeAccount,
                    membershipKey: nft.mint.address,
                    shares: 10,
                });
                const fanoutAccount = yield fanoutSdk.fetch(init.fanout, src_1.Fanout);
                const membershipAccountData = yield fanoutSdk.fetch(membershipAccount, src_1.FanoutMembershipVoucher);
                (0, chai_1.expect)(fanoutAccount.membershipModel).to.equal(src_1.MembershipModel.NFT);
                (0, chai_1.expect)(fanoutAccount.lastSnapshotAmount.toString()).to.equal('0');
                (0, chai_1.expect)(fanoutAccount.totalMembers.toString()).to.equal('1');
                (0, chai_1.expect)(fanoutAccount.totalInflow.toString()).to.equal('0');
                (0, chai_1.expect)(fanoutAccount.totalAvailableShares.toString()).to.equal('90');
                (0, chai_1.expect)(fanoutAccount.totalShares.toString()).to.equal('100');
                (0, chai_1.expect)(fanoutAccount.membershipMint).to.equal(null);
                (0, chai_1.expect)(fanoutAccount.totalStakedShares).to.equal(null);
                (0, chai_1.expect)((_a = membershipAccountData === null || membershipAccountData === void 0 ? void 0 : membershipAccountData.shares) === null || _a === void 0 ? void 0 : _a.toString()).to.equal('10');
                (0, chai_1.expect)((_b = membershipAccountData === null || membershipAccountData === void 0 ? void 0 : membershipAccountData.membershipKey) === null || _b === void 0 ? void 0 : _b.toBase58()).to.equal(nft.mint.address.toBase58());
            }));
            it('Cannot Add mismatched Metadata', () => __awaiter(void 0, void 0, void 0, function* () {
                var _c, _d;
                const init = yield fanoutSdk.initializeFanout({
                    totalShares: 100,
                    name: `Test${Date.now()}`,
                    membershipModel: src_1.MembershipModel.NFT,
                });
                const { nft } = yield metaplex.nfts().create({
                    uri: 'URI',
                    name: 'NAME',
                    symbol: 'SYMBOL',
                    sellerFeeBasisPoints: 1000,
                });
                const { membershipAccount } = yield fanoutSdk.addMemberNft({
                    fanout: init.fanout,
                    fanoutNativeAccount: init.nativeAccount,
                    membershipKey: nft.mint.address,
                    shares: 10,
                });
                const fanoutAccount = yield fanoutSdk.fetch(init.fanout, src_1.Fanout);
                const membershipAccountData = yield fanoutSdk.fetch(membershipAccount, src_1.FanoutMembershipVoucher);
                (0, chai_1.expect)(fanoutAccount.membershipModel).to.equal(src_1.MembershipModel.NFT);
                (0, chai_1.expect)(fanoutAccount.lastSnapshotAmount.toString()).to.equal('0');
                (0, chai_1.expect)(fanoutAccount.totalMembers.toString()).to.equal('1');
                (0, chai_1.expect)(fanoutAccount.totalInflow.toString()).to.equal('0');
                (0, chai_1.expect)(fanoutAccount.totalAvailableShares.toString()).to.equal('90');
                (0, chai_1.expect)(fanoutAccount.totalShares.toString()).to.equal('100');
                (0, chai_1.expect)(fanoutAccount.membershipMint).to.equal(null);
                (0, chai_1.expect)(fanoutAccount.totalStakedShares).to.equal(null);
                (0, chai_1.expect)((_c = membershipAccountData === null || membershipAccountData === void 0 ? void 0 : membershipAccountData.shares) === null || _c === void 0 ? void 0 : _c.toString()).to.equal('10');
                (0, chai_1.expect)((_d = membershipAccountData === null || membershipAccountData === void 0 ? void 0 : membershipAccountData.membershipKey) === null || _d === void 0 ? void 0 : _d.toBase58()).to.equal(nft.mint.address.toBase58());
            }));
        });
        it('Distribute a Native Fanout with NFT Members', () => __awaiter(void 0, void 0, void 0, function* () {
            const builtFanout = yield (0, scenarios_1.builtNftFanout)(fanoutSdk, 100, 5);
            (0, chai_1.expect)(builtFanout.fanoutAccountData.totalAvailableShares.toString()).to.equal('0');
            (0, chai_1.expect)(builtFanout.fanoutAccountData.totalMembers.toString()).to.equal('5');
            (0, chai_1.expect)(builtFanout.fanoutAccountData.lastSnapshotAmount.toString()).to.equal('0');
            const distBot = new web3_js_1.Keypair();
            yield connection.requestAirdrop(builtFanout.fanoutAccountData.accountKey, lamportsNeeded);
            yield connection.requestAirdrop(distBot.publicKey, 1000000000);
            const member1 = builtFanout.members[0];
            const member2 = builtFanout.members[1];
            const distMember1 = yield fanoutSdk.distributeNftMemberInstructions({
                distributeForMint: false,
                member: member1.wallet.publicKey,
                membershipKey: member1.mint,
                fanout: builtFanout.fanout,
                payer: distBot.publicKey,
            });
            const distMember2 = yield fanoutSdk.distributeNftMemberInstructions({
                distributeForMint: false,
                member: member2.wallet.publicKey,
                membershipKey: member2.mint,
                fanout: builtFanout.fanout,
                payer: distBot.publicKey,
            });
            const memberDataBefore1 = yield connection.getAccountInfo(member1.wallet.publicKey);
            const memberDataBefore2 = yield connection.getAccountInfo(member2.wallet.publicKey);
            const holdingAccountBefore = yield connection.getAccountInfo(builtFanout.fanoutAccountData.accountKey);
            (0, chai_1.expect)(memberDataBefore2).to.be.null;
            (0, chai_1.expect)(memberDataBefore1).to.be.null;
            const holdingAccountReserved = yield connection.getMinimumBalanceForRentExemption(1);
            const firstSnapshot = lamportsNeeded;
            (0, chai_1.expect)((holdingAccountBefore === null || holdingAccountBefore === void 0 ? void 0 : holdingAccountBefore.lamports) + lamportsNeeded).to.equal(firstSnapshot + holdingAccountReserved);
            const tx = yield fanoutSdk.sendInstructions([...distMember1.instructions, ...distMember2.instructions], [distBot], distBot.publicKey);
            if (!!tx.RpcResponseAndContext.value.err) {
                const txdetails = yield connection.getConfirmedTransaction(tx.TransactionSignature);
                console.log(txdetails, tx.RpcResponseAndContext.value.err);
            }
            const memberDataAfter1 = yield connection.getAccountInfo(member1.wallet.publicKey);
            const memberDataAfter2 = yield connection.getAccountInfo(member2.wallet.publicKey);
            const holdingAccountAfter = yield connection.getAccountInfo(builtFanout.fanoutAccountData.accountKey);
            const membershipAccount1 = yield fanoutSdk.fetch(member1.voucher, src_1.FanoutMembershipVoucher);
            (0, chai_1.expect)(memberDataAfter1 === null || memberDataAfter1 === void 0 ? void 0 : memberDataAfter1.lamports).to.equal(firstSnapshot * 0.2);
            (0, chai_1.expect)(memberDataAfter2 === null || memberDataAfter2 === void 0 ? void 0 : memberDataAfter2.lamports).to.equal(firstSnapshot * 0.2);
            (0, chai_1.expect)(holdingAccountAfter === null || holdingAccountAfter === void 0 ? void 0 : holdingAccountAfter.lamports).to.equal(firstSnapshot - firstSnapshot * 0.4 + holdingAccountReserved);
            (0, chai_1.expect)(builtFanout.fanoutAccountData.lastSnapshotAmount.toString()).to.equal('0');
            (0, chai_1.expect)(membershipAccount1.totalInflow.toString()).to.equal(`${firstSnapshot * 0.2}`);
            const distAgainMember1 = yield fanoutSdk.distributeNftMemberInstructions({
                distributeForMint: false,
                member: member1.wallet.publicKey,
                membershipKey: member1.mint,
                fanout: builtFanout.fanout,
                payer: distBot.publicKey,
            });
            const distAgainMember1Tx = yield fanoutSdk.sendInstructions([...distAgainMember1.instructions], [distBot], distBot.publicKey);
            yield connection.getTransaction(distAgainMember1Tx.TransactionSignature);
            const memberDataAfterAgain1 = yield connection.getAccountInfo(member1.wallet.publicKey);
            (0, chai_1.expect)(memberDataAfterAgain1 === null || memberDataAfterAgain1 === void 0 ? void 0 : memberDataAfterAgain1.lamports).to.equal(firstSnapshot * 0.2);
            const membershipAccountAgain1 = yield fanoutSdk.fetch(member1.voucher, src_1.FanoutMembershipVoucher);
            (0, chai_1.expect)(membershipAccountAgain1.totalInflow.toString()).to.equal(`${firstSnapshot * 0.2}`);
            const sent2 = lamportsNeeded;
            yield connection.requestAirdrop(builtFanout.fanoutAccountData.accountKey, sent2);
            const secondInflow = sent2;
            yield fanoutSdk.distributeAll({
                fanout: builtFanout.fanout,
                payer: fanoutSdk.wallet.publicKey,
                mint: spl_token_1.NATIVE_MINT,
            });
            const memberDataAfterFinal1 = yield connection.getAccountInfo(member1.wallet.publicKey);
            // @ts-ignore
            (0, chai_1.expect)(memberDataAfterFinal1 === null || memberDataAfterFinal1 === void 0 ? void 0 : memberDataAfterFinal1.lamports).to.equal((memberDataAfter1 === null || memberDataAfter1 === void 0 ? void 0 : memberDataAfter1.lamports) + secondInflow * 0.2);
            const membershipAccountFinal1 = yield fanoutSdk.fetch(member1.voucher, src_1.FanoutMembershipVoucher);
            // @ts-ignore
            (0, chai_1.expect)(membershipAccountFinal1 === null || membershipAccountFinal1 === void 0 ? void 0 : membershipAccountFinal1.totalInflow.toString()).to.equal(`${(memberDataAfter1 === null || memberDataAfter1 === void 0 ? void 0 : memberDataAfter1.lamports) + secondInflow * 0.2}`);
        }));
        it('Distributes a Fanout under a certain mint for NFT Members', () => __awaiter(void 0, void 0, void 0, function* () {
            const builtFanout = yield (0, scenarios_1.builtNftFanout)(fanoutSdk, 100, 5);
            const mint = yield spl_token_1.Token.createMint(connection, authorityWallet, authorityWallet.publicKey, null, 6, spl_token_1.TOKEN_PROGRAM_ID);
            const { fanoutForMint } = yield fanoutSdk.initializeFanoutForMint({
                fanout: builtFanout.fanout,
                mint: mint.publicKey,
            });
            const fanoutForMintAccountData = yield fanoutSdk.fetch(fanoutForMint, src_1.FanoutMint);
            const distBot = new web3_js_1.Keypair();
            yield connection.requestAirdrop(distBot.publicKey, lamportsNeeded);
            const sent = 112 * 1000000;
            yield mint.mintTo(fanoutForMintAccountData.tokenAccount, authorityWallet, [], sent);
            const member1 = builtFanout.members[0];
            const member2 = builtFanout.members[1];
            const distMember1 = yield fanoutSdk.distributeNftMemberInstructions({
                distributeForMint: true,
                member: member1.wallet.publicKey,
                membershipKey: member1.mint,
                fanout: builtFanout.fanout,
                payer: distBot.publicKey,
                fanoutMint: mint.publicKey,
            });
            const distMember2 = yield fanoutSdk.distributeNftMemberInstructions({
                distributeForMint: true,
                member: member2.wallet.publicKey,
                membershipKey: member2.mint,
                fanout: builtFanout.fanout,
                payer: distBot.publicKey,
                fanoutMint: mint.publicKey,
            });
            const fanoutMintMember1TokenAccount = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, member1.wallet.publicKey);
            const fanoutMintMember2TokenAccount = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, member2.wallet.publicKey);
            const [fanoutForMintMembershipVoucher, _] = yield src_1.FanoutClient.mintMembershipVoucher(fanoutForMint, member1.mint, mint.publicKey);
            {
                const tx = yield fanoutSdk.sendInstructions([...distMember1.instructions, ...distMember2.instructions], [distBot], distBot.publicKey);
                if (!!tx.RpcResponseAndContext.value.err) {
                    const txdetails = yield connection.getConfirmedTransaction(tx.TransactionSignature);
                    console.log(txdetails, tx.RpcResponseAndContext.value.err);
                }
            }
            const fanoutForMintAccountDataAfter = yield fanoutSdk.fetch(fanoutForMint, src_1.FanoutMint);
            const fanoutForMintMember1VoucherAfter = yield fanoutSdk.fetch(fanoutForMintMembershipVoucher, src_1.FanoutMembershipMintVoucher);
            (0, chai_1.expect)((yield connection.getTokenAccountBalance(fanoutMintMember1TokenAccount)).value.amount).to.equal(`${sent * 0.2}`);
            (0, chai_1.expect)((yield connection.getTokenAccountBalance(fanoutMintMember2TokenAccount)).value.amount).to.equal(`${sent * 0.2}`);
            (0, chai_1.expect)(fanoutForMintAccountDataAfter.totalInflow.toString()).to.equal(`${sent}`);
            (0, chai_1.expect)(fanoutForMintAccountDataAfter.lastSnapshotAmount.toString()).to.equal(`${sent - sent * 0.2 * 2}`);
            (0, chai_1.expect)(fanoutForMintMember1VoucherAfter.lastInflow.toString()).to.equal(`${sent}`);
            const distMember1Again = yield fanoutSdk.distributeNftMemberInstructions({
                distributeForMint: true,
                member: member1.wallet.publicKey,
                membershipKey: member1.mint,
                fanout: builtFanout.fanout,
                payer: distBot.publicKey,
                fanoutMint: mint.publicKey,
            });
            yield fanoutSdk.sendInstructions([...distMember1Again.instructions], [distBot], distBot.publicKey);
            yield fanoutSdk.sendInstructions([...distMember1Again.instructions], [distBot], distBot.publicKey);
            (0, chai_1.expect)((yield connection.getTokenAccountBalance(fanoutMintMember1TokenAccount)).value.amount).to.equal(`${sent * 0.2}`);
            const sent2 = 113 * 1000000;
            yield mint.mintTo(fanoutForMintAccountData.tokenAccount, authorityWallet, [], sent2);
            const member3 = builtFanout.members[2];
            const distMember3 = yield fanoutSdk.distributeNftMemberInstructions({
                distributeForMint: true,
                member: member3.wallet.publicKey,
                membershipKey: member3.mint,
                fanout: builtFanout.fanout,
                payer: distBot.publicKey,
                fanoutMint: mint.publicKey,
            });
            const distMember1Final = yield fanoutSdk.distributeNftMemberInstructions({
                distributeForMint: true,
                member: member1.wallet.publicKey,
                membershipKey: member1.mint,
                fanout: builtFanout.fanout,
                payer: distBot.publicKey,
                fanoutMint: mint.publicKey,
            });
            const distMember2Final = yield fanoutSdk.distributeNftMemberInstructions({
                distributeForMint: true,
                member: member2.wallet.publicKey,
                membershipKey: member2.mint,
                fanout: builtFanout.fanout,
                payer: distBot.publicKey,
                fanoutMint: mint.publicKey,
            });
            yield fanoutSdk.sendInstructions([
                ...distMember1Final.instructions,
                ...distMember2Final.instructions,
                ...distMember3.instructions,
            ], [distBot], distBot.publicKey);
            const fanoutMintMember3TokenAccount = yield spl_token_1.Token.getAssociatedTokenAddress(spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID, spl_token_1.TOKEN_PROGRAM_ID, mint.publicKey, member3.wallet.publicKey);
            (0, chai_1.expect)((yield connection.getTokenAccountBalance(fanoutMintMember1TokenAccount)).value.amount).to.equal(`${sent * 0.2 + sent2 * 0.2}`);
            (0, chai_1.expect)((yield connection.getTokenAccountBalance(fanoutMintMember2TokenAccount)).value.amount).to.equal(`${sent * 0.2 + sent2 * 0.2}`);
            (0, chai_1.expect)((yield connection.getTokenAccountBalance(fanoutMintMember3TokenAccount)).value.amount).to.equal(`${sent * 0.2 + sent2 * 0.2}`);
        }));
    });
}));
