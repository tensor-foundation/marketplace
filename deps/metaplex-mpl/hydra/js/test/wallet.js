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
const web3_js_1 = require("@solana/web3.js");
const common_1 = require("@project-serum/common"); //TODO remove this
const spl_token_1 = require("@solana/spl-token");
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const src_1 = require("../src");
const amman_1 = require("@metaplex-foundation/amman");
const scenarios_1 = require("./utils/scenarios");
(0, chai_1.use)(chai_as_promised_1.default);
describe('fanout', () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection(amman_1.LOCALHOST, 'confirmed');
    const lamportsNeeded = 10000000000;
    let authorityWallet;
    let fanoutSdk;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        authorityWallet = web3_js_1.Keypair.generate();
        yield connection.requestAirdrop(authorityWallet.publicKey, web3_js_1.LAMPORTS_PER_SOL * 10);
        fanoutSdk = new src_1.FanoutClient(connection, new common_1.NodeWallet(new web3_js_1.Account(authorityWallet.secretKey)));
        yield connection.requestAirdrop(authorityWallet.publicKey, web3_js_1.LAMPORTS_PER_SOL * 10);
    }));
    describe('Wallet membership model', () => {
        it('Init', () => __awaiter(void 0, void 0, void 0, function* () {
            const { fanout } = yield fanoutSdk.initializeFanout({
                totalShares: 100,
                name: `Test${Date.now()}`,
                membershipModel: src_1.MembershipModel.Wallet,
            });
            const fanoutAccount = yield fanoutSdk.fetch(fanout, src_1.Fanout);
            (0, chai_1.expect)(fanoutAccount.membershipModel).to.equal(src_1.MembershipModel.Wallet);
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
                membershipModel: src_1.MembershipModel.Wallet,
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
        it('Init For Wrapped Sol', () => __awaiter(void 0, void 0, void 0, function* () {
            const { fanout } = yield fanoutSdk.initializeFanout({
                totalShares: 100,
                name: `Test${Date.now()}`,
                membershipModel: src_1.MembershipModel.Wallet,
            });
            const { fanoutForMint, tokenAccount } = yield fanoutSdk.initializeFanoutForMint({
                fanout,
                mint: spl_token_1.NATIVE_MINT,
            });
            const fanoutMintAccount = yield fanoutSdk.fetch(fanoutForMint, src_1.FanoutMint);
            (0, chai_1.expect)(fanoutMintAccount.mint.toBase58()).to.equal(spl_token_1.NATIVE_MINT.toBase58());
            (0, chai_1.expect)(fanoutMintAccount.fanout.toBase58()).to.equal(fanout.toBase58());
            (0, chai_1.expect)(fanoutMintAccount.tokenAccount.toBase58()).to.equal(tokenAccount.toBase58());
            (0, chai_1.expect)(fanoutMintAccount.totalInflow.toString()).to.equal('0');
            (0, chai_1.expect)(fanoutMintAccount.lastSnapshotAmount.toString()).to.equal('0');
        }));
        it('Adds Members With Wallet', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const init = yield fanoutSdk.initializeFanout({
                totalShares: 100,
                name: `Test${Date.now()}`,
                membershipModel: src_1.MembershipModel.Wallet,
            });
            const member = new web3_js_1.Keypair();
            const { membershipAccount } = yield fanoutSdk.addMemberWallet({
                fanout: init.fanout,
                fanoutNativeAccount: init.nativeAccount,
                membershipKey: member.publicKey,
                shares: 10,
            });
            const fanoutAccount = yield fanoutSdk.fetch(init.fanout, src_1.Fanout);
            const membershipAccountData = yield fanoutSdk.fetch(membershipAccount, src_1.FanoutMembershipVoucher);
            (0, chai_1.expect)(fanoutAccount.membershipModel).to.equal(src_1.MembershipModel.Wallet);
            (0, chai_1.expect)(fanoutAccount.lastSnapshotAmount.toString()).to.equal('0');
            (0, chai_1.expect)(fanoutAccount.totalMembers.toString()).to.equal('1');
            (0, chai_1.expect)(fanoutAccount.totalInflow.toString()).to.equal('0');
            (0, chai_1.expect)(fanoutAccount.totalAvailableShares.toString()).to.equal('90');
            (0, chai_1.expect)(fanoutAccount.totalShares.toString()).to.equal('100');
            (0, chai_1.expect)(fanoutAccount.membershipMint).to.equal(null);
            (0, chai_1.expect)(fanoutAccount.totalStakedShares).to.equal(null);
            (0, chai_1.expect)((_a = membershipAccountData === null || membershipAccountData === void 0 ? void 0 : membershipAccountData.shares) === null || _a === void 0 ? void 0 : _a.toString()).to.equal('10');
            (0, chai_1.expect)((_b = membershipAccountData === null || membershipAccountData === void 0 ? void 0 : membershipAccountData.membershipKey) === null || _b === void 0 ? void 0 : _b.toBase58()).to.equal(member.publicKey.toBase58());
        }));
        it('Distribute a Native Fanout with Wallet Members', () => __awaiter(void 0, void 0, void 0, function* () {
            const builtFanout = yield (0, scenarios_1.builtWalletFanout)(fanoutSdk, 100, 5);
            (0, chai_1.expect)(builtFanout.fanoutAccountData.totalAvailableShares.toString()).to.equal('0');
            (0, chai_1.expect)(builtFanout.fanoutAccountData.totalMembers.toString()).to.equal('5');
            (0, chai_1.expect)(builtFanout.fanoutAccountData.lastSnapshotAmount.toString()).to.equal('0');
            const distBot = new web3_js_1.Keypair();
            yield connection.requestAirdrop(builtFanout.fanoutAccountData.accountKey, lamportsNeeded);
            yield connection.requestAirdrop(distBot.publicKey, lamportsNeeded);
            const member1 = builtFanout.members[0];
            const member2 = builtFanout.members[1];
            const distMember1 = yield fanoutSdk.distributeWalletMemberInstructions({
                distributeForMint: false,
                member: member1.wallet.publicKey,
                fanout: builtFanout.fanout,
                payer: distBot.publicKey,
            });
            const distMember2 = yield fanoutSdk.distributeWalletMemberInstructions({
                distributeForMint: false,
                member: member2.wallet.publicKey,
                fanout: builtFanout.fanout,
                payer: distBot.publicKey,
            });
            const holdingAccountReserved = yield connection.getMinimumBalanceForRentExemption(1);
            const memberDataBefore1 = yield connection.getAccountInfo(member1.wallet.publicKey);
            const memberDataBefore2 = yield connection.getAccountInfo(member2.wallet.publicKey);
            const holdingAccountBefore = yield connection.getAccountInfo(builtFanout.fanoutAccountData.accountKey);
            (0, chai_1.expect)(memberDataBefore2).to.be.null;
            (0, chai_1.expect)(memberDataBefore1).to.be.null;
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
        }));
        it('Transfer Shares', () => __awaiter(void 0, void 0, void 0, function* () {
            const builtFanout = yield (0, scenarios_1.builtWalletFanout)(fanoutSdk, 100, 5);
            const sent = 10;
            yield connection.requestAirdrop(builtFanout.fanoutAccountData.accountKey, sent);
            yield connection.requestAirdrop(fanoutSdk.wallet.publicKey, 1);
            const member0Wallet = builtFanout.members[0].wallet;
            const member1Wallet = builtFanout.members[1].wallet;
            const member0Voucher = builtFanout.members[0].voucher;
            const member1Voucher = builtFanout.members[1].voucher;
            yield fanoutSdk.transferShares({
                fromMember: member0Wallet.publicKey,
                toMember: member1Wallet.publicKey,
                fanout: builtFanout.fanout,
                shares: 20,
            });
            const membershipAccount0 = yield fanoutSdk.fetch(member0Voucher, src_1.FanoutMembershipVoucher);
            const membershipAccount1 = yield fanoutSdk.fetch(member1Voucher, src_1.FanoutMembershipVoucher);
            (0, chai_1.expect)(membershipAccount0.shares.toString()).to.equal('0');
            (0, chai_1.expect)(membershipAccount1.shares.toString()).to.equal('40');
        }));
        it('Remove Member', () => __awaiter(void 0, void 0, void 0, function* () {
            const builtFanout = yield (0, scenarios_1.builtWalletFanout)(fanoutSdk, 100, 5);
            const sent = 10;
            const rando = new web3_js_1.Keypair();
            yield connection.requestAirdrop(builtFanout.fanoutAccountData.accountKey, sent);
            yield connection.requestAirdrop(fanoutSdk.wallet.publicKey, 1);
            const member0Wallet = builtFanout.members[0].wallet;
            const member1Wallet = builtFanout.members[1].wallet;
            const member0Voucher = builtFanout.members[0].voucher;
            yield fanoutSdk.transferShares({
                fromMember: member0Wallet.publicKey,
                toMember: member1Wallet.publicKey,
                fanout: builtFanout.fanout,
                shares: 20,
            });
            yield fanoutSdk.removeMember({
                destination: rando.publicKey,
                fanout: builtFanout.fanout,
                member: member0Wallet.publicKey,
            });
            const fanout_after = yield fanoutSdk.fetch(builtFanout.fanout, src_1.Fanout);
            (0, chai_1.expect)(fanout_after.totalMembers.toString()).to.equal('4');
            (0, chai_1.expect)(fanoutSdk.getAccountInfo(member0Voucher)).to.be.rejectedWith(new Error('Account Not Found'));
        }));
    });
}));
