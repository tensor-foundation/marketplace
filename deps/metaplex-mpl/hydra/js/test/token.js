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
/* eslint-disable @typescript-eslint/no-unused-vars */
const web3_js_1 = require("@solana/web3.js");
const splToken = __importStar(require("@solana/spl-token"));
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const src_1 = require("../src");
const amman_1 = require("@metaplex-foundation/amman");
const scenarios_1 = require("./utils/scenarios");
const anchor_1 = require("@project-serum/anchor");
(0, chai_1.use)(chai_as_promised_1.default);
describe('fanout', () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection(amman_1.LOCALHOST, 'confirmed');
    const lamportsNeeded = 10000000000;
    let authorityWallet;
    let fanoutSdk;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        authorityWallet = web3_js_1.Keypair.generate();
        let signature = yield connection.requestAirdrop(authorityWallet.publicKey, lamportsNeeded);
        yield connection.confirmTransaction(signature);
        fanoutSdk = new src_1.FanoutClient(connection, new anchor_1.Wallet(authorityWallet));
        signature = yield connection.requestAirdrop(authorityWallet.publicKey, lamportsNeeded);
        yield connection.confirmTransaction(signature);
    }));
    describe('Token membership model', () => {
        it('Creates fanout w/ token, 2 members stake, has 5 random revenue events, and distributes', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c;
            const membershipMint = yield splToken.createMint(connection, authorityWallet, authorityWallet.publicKey, null, 6);
            const distBot = new web3_js_1.Keypair();
            yield connection.requestAirdrop(distBot.publicKey, lamportsNeeded);
            const supply = 1000000 * Math.pow(10, 6);
            const tokenAcct = yield splToken.createAccount(connection, authorityWallet, membershipMint, authorityWallet.publicKey);
            const { fanout } = yield fanoutSdk.initializeFanout({
                totalShares: 0,
                name: `Test${Date.now()}`,
                membershipModel: src_1.MembershipModel.Token,
                mint: membershipMint,
            });
            const mint = yield splToken.createMint(connection, authorityWallet, authorityWallet.publicKey, null, 6);
            const mintAcctAuthority = yield splToken.createAssociatedTokenAccount(connection, authorityWallet, mint, authorityWallet.publicKey);
            const { fanoutForMint, tokenAccount } = yield fanoutSdk.initializeFanoutForMint({
                fanout,
                mint: mint,
            });
            const fanoutMintAccount = yield fanoutSdk.fetch(fanoutForMint, src_1.FanoutMint);
            (0, chai_1.expect)(fanoutMintAccount.mint.toBase58()).to.equal(mint.toBase58());
            (0, chai_1.expect)(fanoutMintAccount.fanout.toBase58()).to.equal(fanout.toBase58());
            (0, chai_1.expect)(fanoutMintAccount.tokenAccount.toBase58()).to.equal(tokenAccount.toBase58());
            (0, chai_1.expect)(fanoutMintAccount.totalInflow.toString()).to.equal('0');
            (0, chai_1.expect)(fanoutMintAccount.lastSnapshotAmount.toString()).to.equal('0');
            let totalStaked = 0;
            const members = [];
            yield splToken.mintTo(connection, authorityWallet, membershipMint, tokenAcct, authorityWallet, supply);
            for (let index = 0; index <= 4; index++) {
                const member = new web3_js_1.Keypair();
                const pseudoRng = Math.floor(supply * Math.random() * 0.138);
                yield connection.requestAirdrop(member.publicKey, lamportsNeeded);
                const tokenAcctMember = yield splToken.createAssociatedTokenAccount(connection, authorityWallet, membershipMint, member.publicKey);
                const mintAcctMember = yield splToken.createAssociatedTokenAccount(connection, authorityWallet, mint, member.publicKey);
                yield splToken.transfer(connection, authorityWallet, tokenAcct, tokenAcctMember, authorityWallet.publicKey, pseudoRng);
                totalStaked += pseudoRng;
                const ixs = yield fanoutSdk.stakeTokenMemberInstructions({
                    shares: pseudoRng,
                    fanout: fanout,
                    membershipMintTokenAccount: tokenAcctMember,
                    membershipMint: membershipMint,
                    member: member.publicKey,
                    payer: member.publicKey,
                });
                const tx = yield fanoutSdk.sendInstructions(ixs.instructions, [member], member.publicKey);
                if (!!tx.RpcResponseAndContext.value.err) {
                    const txdetails = yield connection.getConfirmedTransaction(tx.TransactionSignature);
                    console.log(txdetails, tx.RpcResponseAndContext.value.err);
                }
                const voucher = yield fanoutSdk.fetch(ixs.output.membershipVoucher, src_1.FanoutMembershipVoucher);
                (0, chai_1.expect)((_a = voucher.shares) === null || _a === void 0 ? void 0 : _a.toString()).to.equal(`${pseudoRng}`);
                (0, chai_1.expect)((_b = voucher.membershipKey) === null || _b === void 0 ? void 0 : _b.toBase58()).to.equal(member.publicKey.toBase58());
                (0, chai_1.expect)((_c = voucher.fanout) === null || _c === void 0 ? void 0 : _c.toBase58()).to.equal(fanout.toBase58());
                const stake = yield splToken.getAccount(connection, ixs.output.stakeAccount);
                (0, chai_1.expect)(stake.amount.toString()).to.equal(`${pseudoRng}`);
                members.push({
                    member,
                    membershipTokenAccount: tokenAcctMember,
                    fanoutMintTokenAccount: mintAcctMember,
                    shares: pseudoRng,
                });
            }
            //@ts-ignore
            let runningTotal = 0;
            for (let index = 0; index <= 4; index++) {
                const sent = Math.floor(Math.random() * 100 * Math.pow(10, 6));
                yield splToken.mintTo(connection, authorityWallet, mint, mintAcctAuthority, authorityWallet, sent);
                yield splToken.transfer(connection, authorityWallet, mintAcctAuthority, tokenAccount, authorityWallet, sent);
                runningTotal += sent;
                const member = members[index];
                const ix = yield fanoutSdk.distributeTokenMemberInstructions({
                    distributeForMint: true,
                    fanoutMint: mint,
                    membershipMint: membershipMint,
                    fanout: fanout,
                    member: member.member.publicKey,
                    payer: distBot.publicKey,
                });
                // @ts-ignore
                const tx = yield fanoutSdk.sendInstructions(ix.instructions, [distBot], distBot.publicKey);
                if (!!tx.RpcResponseAndContext.value.err) {
                    const txdetails = yield connection.getConfirmedTransaction(tx.TransactionSignature);
                    console.log(txdetails, tx.RpcResponseAndContext.value.err);
                }
                const tokenAcctInfo = yield connection.getTokenAccountBalance(member.fanoutMintTokenAccount, 'confirmed');
                const diff = ((supply - totalStaked) * sent) / totalStaked;
                const amountDist = (member.shares * diff) / supply;
                (0, chai_1.expect)(tokenAcctInfo.value.amount, `${amountDist}`);
                // @ts-ignore
            }
        }));
        it('Init', () => __awaiter(void 0, void 0, void 0, function* () {
            var _d, _e;
            const membershipMint = yield splToken.createMint(connection, authorityWallet, authorityWallet.publicKey, null, 6);
            const supply = 1000000 * Math.pow(10, 6);
            const tokenAcct = yield splToken.createAccount(connection, authorityWallet, membershipMint, authorityWallet.publicKey);
            yield splToken.mintTo(connection, authorityWallet, membershipMint, tokenAcct, authorityWallet, supply);
            const { fanout } = yield fanoutSdk.initializeFanout({
                totalShares: 0,
                name: `Test${Date.now()}`,
                membershipModel: src_1.MembershipModel.Token,
                mint: membershipMint,
            });
            const fanoutAccount = yield fanoutSdk.fetch(fanout, src_1.Fanout);
            (0, chai_1.expect)(fanoutAccount.membershipModel).to.equal(src_1.MembershipModel.Token);
            (0, chai_1.expect)(fanoutAccount.lastSnapshotAmount.toString()).to.equal('0');
            (0, chai_1.expect)(fanoutAccount.totalMembers.toString()).to.equal('0');
            (0, chai_1.expect)(fanoutAccount.totalInflow.toString()).to.equal('0');
            (0, chai_1.expect)(fanoutAccount.totalAvailableShares.toString()).to.equal('0');
            (0, chai_1.expect)(fanoutAccount.totalShares.toString()).to.equal(supply.toString());
            (0, chai_1.expect)((_d = fanoutAccount.membershipMint) === null || _d === void 0 ? void 0 : _d.toBase58()).to.equal(membershipMint.toBase58());
            (0, chai_1.expect)((_e = fanoutAccount.totalStakedShares) === null || _e === void 0 ? void 0 : _e.toString()).to.equal('0');
        }));
        it('Init For mint', () => __awaiter(void 0, void 0, void 0, function* () {
            const membershipMint = yield splToken.createMint(connection, authorityWallet, authorityWallet.publicKey, null, 6);
            const supply = 1000000 * Math.pow(10, 6);
            const tokenAcct = yield splToken.createAccount(connection, authorityWallet, membershipMint, authorityWallet.publicKey);
            yield splToken.mintTo(connection, authorityWallet, membershipMint, tokenAcct, authorityWallet, supply);
            const { fanout } = yield fanoutSdk.initializeFanout({
                totalShares: 0,
                name: `Test${Date.now()}`,
                membershipModel: src_1.MembershipModel.Token,
                mint: membershipMint,
            });
            const mint = yield splToken.createMint(connection, authorityWallet, authorityWallet.publicKey, null, 6);
            const { fanoutForMint, tokenAccount } = yield fanoutSdk.initializeFanoutForMint({
                fanout,
                mint: mint,
            });
            const fanoutMintAccount = yield fanoutSdk.fetch(fanoutForMint, src_1.FanoutMint);
            (0, chai_1.expect)(fanoutMintAccount.mint.toBase58()).to.equal(mint.toBase58());
            (0, chai_1.expect)(fanoutMintAccount.fanout.toBase58()).to.equal(fanout.toBase58());
            (0, chai_1.expect)(fanoutMintAccount.tokenAccount.toBase58()).to.equal(tokenAccount.toBase58());
            (0, chai_1.expect)(fanoutMintAccount.totalInflow.toString()).to.equal('0');
            (0, chai_1.expect)(fanoutMintAccount.lastSnapshotAmount.toString()).to.equal('0');
        }));
        it('Stakes Members', () => __awaiter(void 0, void 0, void 0, function* () {
            var _f, _g, _h, _j, _k;
            const membershipMint = yield splToken.createMint(connection, authorityWallet, authorityWallet.publicKey, null, 6);
            const supply = 1000000 * Math.pow(10, 6);
            const member = new web3_js_1.Keypair();
            yield connection.requestAirdrop(member.publicKey, lamportsNeeded);
            const tokenAcct = yield splToken.createAccount(connection, authorityWallet, membershipMint, authorityWallet.publicKey);
            const tokenAcctMember = yield splToken.createAssociatedTokenAccount(connection, authorityWallet, membershipMint, member.publicKey);
            yield splToken.mintTo(connection, authorityWallet, membershipMint, tokenAcct, authorityWallet, supply);
            yield splToken.transfer(connection, authorityWallet, tokenAcct, tokenAcctMember, authorityWallet, supply * 0.1);
            const { fanout } = yield fanoutSdk.initializeFanout({
                totalShares: 0,
                name: `Test${Date.now()}`,
                membershipModel: src_1.MembershipModel.Token,
                mint: membershipMint,
            });
            const ixs = yield fanoutSdk.stakeTokenMemberInstructions({
                shares: supply * 0.1,
                fanout: fanout,
                membershipMintTokenAccount: tokenAcctMember,
                membershipMint: membershipMint,
                member: member.publicKey,
                payer: member.publicKey,
            });
            const tx = yield fanoutSdk.sendInstructions(ixs.instructions, [member], member.publicKey);
            if (!!tx.RpcResponseAndContext.value.err) {
                const txdetails = yield connection.getConfirmedTransaction(tx.TransactionSignature);
                console.log(txdetails, tx.RpcResponseAndContext.value.err);
            }
            const voucher = yield fanoutSdk.fetch(ixs.output.membershipVoucher, src_1.FanoutMembershipVoucher);
            (0, chai_1.expect)((_f = voucher.shares) === null || _f === void 0 ? void 0 : _f.toString()).to.equal(`${supply * 0.1}`);
            (0, chai_1.expect)((_g = voucher.membershipKey) === null || _g === void 0 ? void 0 : _g.toBase58()).to.equal(member.publicKey.toBase58());
            (0, chai_1.expect)((_h = voucher.fanout) === null || _h === void 0 ? void 0 : _h.toBase58()).to.equal(fanout.toBase58());
            const stake = yield splToken.getAccount(connection, ixs.output.stakeAccount);
            (0, chai_1.expect)(stake.amount.toString()).to.equal(`${supply * 0.1}`);
            const fanoutAccountData = yield fanoutSdk.fetch(fanout, src_1.Fanout);
            (0, chai_1.expect)((_j = fanoutAccountData.totalShares) === null || _j === void 0 ? void 0 : _j.toString()).to.equal(`${supply}`);
            (0, chai_1.expect)((_k = fanoutAccountData.totalStakedShares) === null || _k === void 0 ? void 0 : _k.toString()).to.equal(`${supply * 0.1}`);
        }));
        it('Allows Authority to Stake Members', () => __awaiter(void 0, void 0, void 0, function* () {
            var _l, _m, _o, _p, _q;
            const membershipMint = yield splToken.createMint(connection, authorityWallet, authorityWallet.publicKey, null, 6);
            const supply = 1000000 * Math.pow(10, 6);
            const member = new web3_js_1.Keypair();
            yield connection.requestAirdrop(member.publicKey, lamportsNeeded);
            const tokenAcct = yield splToken.createAccount(connection, authorityWallet, membershipMint, authorityWallet.publicKey);
            yield splToken.mintTo(connection, authorityWallet, membershipMint, tokenAcct, authorityWallet, supply);
            const { fanout } = yield fanoutSdk.initializeFanout({
                totalShares: 0,
                name: `Test${Date.now()}`,
                membershipModel: src_1.MembershipModel.Token,
                mint: membershipMint,
            });
            const ixs = yield fanoutSdk.stakeForTokenMemberInstructions({
                shares: supply * 0.1,
                fanout: fanout,
                membershipMintTokenAccount: tokenAcct,
                membershipMint: membershipMint,
                fanoutAuthority: authorityWallet.publicKey,
                member: member.publicKey,
                payer: authorityWallet.publicKey,
            });
            const tx = yield fanoutSdk.sendInstructions(ixs.instructions, [], authorityWallet.publicKey);
            if (!!tx.RpcResponseAndContext.value.err) {
                const txdetails = yield connection.getConfirmedTransaction(tx.TransactionSignature);
                console.log(txdetails, tx.RpcResponseAndContext.value.err);
            }
            const voucher = yield fanoutSdk.fetch(ixs.output.membershipVoucher, src_1.FanoutMembershipVoucher);
            (0, chai_1.expect)((_l = voucher.shares) === null || _l === void 0 ? void 0 : _l.toString()).to.equal(`${supply * 0.1}`);
            (0, chai_1.expect)((_m = voucher.membershipKey) === null || _m === void 0 ? void 0 : _m.toBase58()).to.equal(member.publicKey.toBase58());
            (0, chai_1.expect)((_o = voucher.fanout) === null || _o === void 0 ? void 0 : _o.toBase58()).to.equal(fanout.toBase58());
            const stake = yield splToken.getAccount(connection, ixs.output.stakeAccount);
            (0, chai_1.expect)(stake.amount.toString()).to.equal(`${supply * 0.1}`);
            const fanoutAccountData = yield fanoutSdk.fetch(fanout, src_1.Fanout);
            (0, chai_1.expect)((_p = fanoutAccountData.totalShares) === null || _p === void 0 ? void 0 : _p.toString()).to.equal(`${supply}`);
            (0, chai_1.expect)((_q = fanoutAccountData.totalStakedShares) === null || _q === void 0 ? void 0 : _q.toString()).to.equal(`${supply * 0.1}`);
        }));
        it('Distribute a Native Fanout with Token Members', () => __awaiter(void 0, void 0, void 0, function* () {
            var _r, _s;
            const membershipMint = yield splToken.createMint(connection, authorityWallet, authorityWallet.publicKey, null, 6);
            const distBot = new web3_js_1.Keypair();
            yield connection.requestAirdrop(distBot.publicKey, lamportsNeeded);
            const builtFanout = yield (0, scenarios_1.builtTokenFanout)(membershipMint, authorityWallet, fanoutSdk, 100, 5);
            (0, chai_1.expect)(builtFanout.fanoutAccountData.totalAvailableShares.toString()).to.equal('0');
            (0, chai_1.expect)(builtFanout.fanoutAccountData.totalMembers.toString()).to.equal('5');
            (0, chai_1.expect)((_r = builtFanout.fanoutAccountData.totalShares) === null || _r === void 0 ? void 0 : _r.toString()).to.equal(`${Math.pow(100, 6)}`);
            (0, chai_1.expect)((_s = builtFanout.fanoutAccountData.totalStakedShares) === null || _s === void 0 ? void 0 : _s.toString()).to.equal(`${Math.pow(100, 6)}`);
            (0, chai_1.expect)(builtFanout.fanoutAccountData.lastSnapshotAmount.toString()).to.equal('0');
            yield connection.requestAirdrop(builtFanout.fanoutAccountData.accountKey, lamportsNeeded);
            const firstSnapshot = lamportsNeeded;
            const firstMemberAmount = firstSnapshot * 0.2;
            const member1 = builtFanout.members[0];
            const ix = yield fanoutSdk.distributeTokenMemberInstructions({
                distributeForMint: false,
                membershipMint: membershipMint,
                fanout: builtFanout.fanout,
                member: member1.wallet.publicKey,
                payer: distBot.publicKey,
            });
            const memberBefore = yield fanoutSdk.connection.getAccountInfo(member1.wallet.publicKey);
            const tx = yield fanoutSdk.sendInstructions(ix.instructions, [distBot], distBot.publicKey);
            if (!!tx.RpcResponseAndContext.value.err) {
                const txdetails = yield connection.getConfirmedTransaction(tx.TransactionSignature);
                console.log(txdetails, tx.RpcResponseAndContext.value.err);
            }
            const voucher = yield fanoutSdk.fetch(ix.output.membershipVoucher, src_1.FanoutMembershipVoucher);
            const memberAfter = yield fanoutSdk.connection.getAccountInfo(member1.wallet.publicKey);
            (0, chai_1.expect)(voucher.lastInflow.toString()).to.equal(`${firstSnapshot}`);
            (0, chai_1.expect)(voucher.shares.toString()).to.equal(`${Math.pow(100, 6) / 5}`);
            // @ts-ignore
            (0, chai_1.expect)((memberAfter === null || memberAfter === void 0 ? void 0 : memberAfter.lamports) - (memberBefore === null || memberBefore === void 0 ? void 0 : memberBefore.lamports)).to.equal(firstMemberAmount);
        }));
        it('Unstake a Native Fanout with Token Members', () => __awaiter(void 0, void 0, void 0, function* () {
            var _t;
            const membershipMint = yield splToken.createMint(connection, authorityWallet, authorityWallet.publicKey, null, 6);
            const distBot = new web3_js_1.Keypair();
            const signature = yield connection.requestAirdrop(distBot.publicKey, 1);
            yield connection.confirmTransaction(signature);
            const builtFanout = yield (0, scenarios_1.builtTokenFanout)(membershipMint, authorityWallet, fanoutSdk, 100, 5);
            const sent = 10;
            const beforeUnstake = yield fanoutSdk.fetch(builtFanout.fanout, src_1.Fanout);
            yield connection.requestAirdrop(builtFanout.fanoutAccountData.accountKey, sent);
            const firstSnapshot = sent * web3_js_1.LAMPORTS_PER_SOL;
            //@ts-ignore
            const firstMemberAmount = firstSnapshot * 0.2;
            const member1 = builtFanout.members[0];
            const memberFanoutSdk = new src_1.FanoutClient(connection, new anchor_1.Wallet(member1.wallet));
            const ix = yield memberFanoutSdk.distributeTokenMemberInstructions({
                distributeForMint: false,
                membershipMint: membershipMint,
                fanout: builtFanout.fanout,
                member: member1.wallet.publicKey,
                payer: member1.wallet.publicKey,
            });
            const voucherBefore = yield memberFanoutSdk.fetch(ix.output.membershipVoucher, src_1.FanoutMembershipVoucher);
            yield memberFanoutSdk.unstakeTokenMember({
                fanout: builtFanout.fanout,
                member: member1.wallet.publicKey,
                payer: member1.wallet.publicKey,
            });
            const afterUnstake = yield memberFanoutSdk.fetch(builtFanout.fanout, src_1.Fanout);
            //@ts-ignore
            const memberAfter = yield memberFanoutSdk.connection.getAccountInfo(member1.wallet.publicKey);
            (0, chai_1.expect)((_t = afterUnstake.totalStakedShares) === null || _t === void 0 ? void 0 : _t.toString()).to.equal(`${(beforeUnstake === null || beforeUnstake === void 0 ? void 0 : beforeUnstake.totalStakedShares).sub(voucherBefore.shares)}`);
        }));
    });
}));
