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
exports.builtNftFanout = exports.builtWalletFanout = exports.builtTokenFanout = void 0;
const src_1 = require("../../src");
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const js_1 = require("@metaplex-foundation/js");
function builtTokenFanout(mint, mintAuth, fanoutSdk, shares, numberMembers) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = `Test${Date.now()}`;
        const { fanout } = yield fanoutSdk.initializeFanout({
            totalShares: 0,
            name: `Test${Date.now()}`,
            membershipModel: src_1.MembershipModel.Token,
            mint: mint.publicKey,
        });
        const mintInfo = yield mint.getMintInfo();
        const totalSupply = Math.pow(shares, mintInfo.decimals);
        const memberNumber = totalSupply / numberMembers;
        const members = [];
        for (let i = 0; i < numberMembers; i++) {
            const memberWallet = new web3_js_1.Keypair();
            yield fanoutSdk.connection.requestAirdrop(memberWallet.publicKey, 10000000000);
            const ata = yield mint.createAssociatedTokenAccount(memberWallet.publicKey);
            yield mint.mintTo(ata, mintAuth, [], memberNumber);
            const ix = yield fanoutSdk.stakeTokenMemberInstructions({
                shares: memberNumber,
                fanout: fanout,
                membershipMintTokenAccount: ata,
                membershipMint: mint.publicKey,
                member: memberWallet.publicKey,
                payer: memberWallet.publicKey,
            });
            console.log();
            const tx = yield fanoutSdk.sendInstructions(ix.instructions, [memberWallet], memberWallet.publicKey);
            if (!!tx.RpcResponseAndContext.value.err) {
                const txdetails = yield fanoutSdk.connection.getConfirmedTransaction(tx.TransactionSignature);
                console.log(txdetails, tx.RpcResponseAndContext.value.err);
            }
            members.push({
                voucher: ix.output.membershipVoucher,
                stakeAccount: ix.output.stakeAccount,
                wallet: memberWallet,
            });
        }
        const fanoutAccount = yield fanoutSdk.fetch(fanout, src_1.Fanout);
        return {
            fanout: fanout,
            name,
            membershipMint: mint,
            fanoutAccountData: fanoutAccount,
            members: members,
        };
    });
}
exports.builtTokenFanout = builtTokenFanout;
function builtWalletFanout(fanoutSdk, shares, numberMembers) {
    return __awaiter(this, void 0, void 0, function* () {
        const name = `Test${Date.now()}`;
        const init = yield fanoutSdk.initializeFanout({
            totalShares: shares,
            name,
            membershipModel: src_1.MembershipModel.Wallet,
        });
        const memberNumber = shares / numberMembers;
        const ixs = [];
        const members = [];
        for (let i = 0; i < numberMembers; i++) {
            const memberWallet = new web3_js_1.Keypair();
            const ix = yield fanoutSdk.addMemberWalletInstructions({
                fanout: init.fanout,
                fanoutNativeAccount: init.nativeAccount,
                membershipKey: memberWallet.publicKey,
                shares: memberNumber,
            });
            members.push({
                voucher: ix.output.membershipAccount,
                wallet: memberWallet,
            });
            ixs.push(...ix.instructions);
        }
        const tx = yield fanoutSdk.sendInstructions(ixs, [], fanoutSdk.wallet.publicKey);
        if (!!tx.RpcResponseAndContext.value.err) {
            const txdetails = yield fanoutSdk.connection.getConfirmedTransaction(tx.TransactionSignature);
            console.log(txdetails, tx.RpcResponseAndContext.value.err);
        }
        const fanoutAccount = yield fanoutSdk.fetch(init.fanout, src_1.Fanout);
        return {
            fanout: init.fanout,
            name,
            fanoutAccountData: fanoutAccount,
            members: members,
        };
    });
}
exports.builtWalletFanout = builtWalletFanout;
function builtNftFanout(fanoutSdk, shares, numberMembers) {
    return __awaiter(this, void 0, void 0, function* () {
        const metaplex = new js_1.Metaplex(fanoutSdk.connection);
        const name = `Test${Date.now()}`;
        const init = yield fanoutSdk.initializeFanout({
            totalShares: shares,
            name,
            membershipModel: src_1.MembershipModel.NFT,
        });
        const memberNumber = shares / numberMembers;
        const ixs = [];
        const members = [];
        for (let i = 0; i < numberMembers; i++) {
            const memberWallet = new web3_js_1.Keypair();
            const { nft } = yield metaplex.nfts().create({
                uri: 'URI' + i,
                name: 'NAME' + i,
                symbol: 'SYMBOL' + i,
                sellerFeeBasisPoints: 1000,
            });
            const token = new spl_token_1.Token(fanoutSdk.connection, nft.mint.address, spl_token_1.TOKEN_PROGRAM_ID, memberWallet);
            const tokenAccount = yield token.getOrCreateAssociatedAccountInfo(memberWallet.publicKey);
            const owner = yield token.getOrCreateAssociatedAccountInfo(fanoutSdk.wallet.publicKey);
            yield token.transfer(owner.address, tokenAccount.address, 
            //@ts-ignore
            fanoutSdk.wallet.payer, [], 1);
            const ix = yield fanoutSdk.addMemberNftInstructions({
                fanout: init.fanout,
                fanoutNativeAccount: init.nativeAccount,
                membershipKey: nft.mint.address,
                shares: memberNumber,
            });
            members.push({
                voucher: ix.output.membershipAccount,
                mint: nft.mint.address,
                wallet: memberWallet,
            });
            ixs.push(...ix.instructions);
        }
        const tx = yield fanoutSdk.sendInstructions(ixs, [], fanoutSdk.wallet.publicKey);
        if (!!tx.RpcResponseAndContext.value.err) {
            const txdetails = yield fanoutSdk.connection.getConfirmedTransaction(tx.TransactionSignature);
            console.log(txdetails, tx.RpcResponseAndContext.value.err);
        }
        const fanoutAccount = yield fanoutSdk.fetch(init.fanout, src_1.Fanout);
        return {
            fanout: init.fanout,
            name,
            fanoutAccountData: fanoutAccount,
            members: members,
        };
    });
}
exports.builtNftFanout = builtNftFanout;
