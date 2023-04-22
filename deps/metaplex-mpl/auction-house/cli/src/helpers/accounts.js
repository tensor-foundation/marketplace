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
exports.getProgramAccounts = exports.getBalance = exports.getTokenAmount = exports.loadTokenEntanglementProgream = exports.loadAuctionHouseProgram = exports.loadFairLaunchProgram = exports.loadCandyProgramV2 = exports.loadCandyProgram = exports.loadWalletKey = exports.getTokenEntanglementEscrows = exports.getTokenEntanglement = exports.getAuctionHouseTradeState = exports.getAuctionHouseBuyerEscrow = exports.getAuctionHouseTreasuryAcct = exports.getAuctionHouseFeeAcct = exports.getAuctionHouseProgramAsSigner = exports.getAuctionHouse = exports.getEditionMarkPda = exports.getMasterEdition = exports.getCollectionAuthorityRecordPDA = exports.getCollectionPDA = exports.getMetadata = exports.getTreasury = exports.getParticipationToken = exports.getParticipationMint = exports.getAtaForMint = exports.getFairLaunchTicketSeqLookup = exports.getFairLaunchLotteryBitmap = exports.getFairLaunchTicket = exports.getCandyMachineCreator = exports.getFairLaunch = exports.getTokenMint = exports.deriveCandyMachineV2ProgramAddress = exports.getCandyMachineAddress = exports.getTokenWallet = exports.uuidFromConfigPubkey = exports.createCandyMachineV2 = exports.deserializeAccount = void 0;
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("./constants");
const anchor = __importStar(require("@project-serum/anchor"));
const fs_1 = __importDefault(require("fs"));
const instructions_1 = require("./instructions");
const loglevel_1 = __importDefault(require("loglevel"));
const spl_token_1 = require("@solana/spl-token");
const various_1 = require("./various");
const bytes_1 = require("@project-serum/anchor/dist/cjs/utils/bytes");
// TODO: expose in spl package
const deserializeAccount = (data) => {
    const accountInfo = spl_token_1.AccountLayout.decode(data);
    accountInfo.mint = new web3_js_1.PublicKey(accountInfo.mint);
    accountInfo.owner = new web3_js_1.PublicKey(accountInfo.owner);
    accountInfo.amount = spl_token_1.u64.fromBuffer(accountInfo.amount);
    if (accountInfo.delegateOption === 0) {
        accountInfo.delegate = null;
        accountInfo.delegatedAmount = new spl_token_1.u64(0);
    }
    else {
        accountInfo.delegate = new web3_js_1.PublicKey(accountInfo.delegate);
        accountInfo.delegatedAmount = spl_token_1.u64.fromBuffer(accountInfo.delegatedAmount);
    }
    accountInfo.isInitialized = accountInfo.state !== 0;
    accountInfo.isFrozen = accountInfo.state === 2;
    if (accountInfo.isNativeOption === 1) {
        accountInfo.rentExemptReserve = spl_token_1.u64.fromBuffer(accountInfo.isNative);
        accountInfo.isNative = true;
    }
    else {
        accountInfo.rentExemptReserve = null;
        accountInfo.isNative = false;
    }
    if (accountInfo.closeAuthorityOption === 0) {
        accountInfo.closeAuthority = null;
    }
    else {
        accountInfo.closeAuthority = new web3_js_1.PublicKey(accountInfo.closeAuthority);
    }
    return accountInfo;
};
exports.deserializeAccount = deserializeAccount;
const createCandyMachineV2 = function (anchorProgram, payerWallet, treasuryWallet, splToken, candyData) {
    return __awaiter(this, void 0, void 0, function* () {
        const candyAccount = web3_js_1.Keypair.generate();
        candyData.uuid = uuidFromConfigPubkey(candyAccount.publicKey);
        if (!candyData.creators || candyData.creators.length === 0) {
            throw new Error(`Invalid config, there must be at least one creator.`);
        }
        const totalShare = (candyData.creators || []).reduce((acc, curr) => acc + curr.share, 0);
        if (totalShare !== 100) {
            throw new Error(`Invalid config, creators shares must add up to 100`);
        }
        const remainingAccounts = [];
        if (splToken) {
            remainingAccounts.push({
                pubkey: splToken,
                isSigner: false,
                isWritable: false,
            });
        }
        return {
            candyMachine: candyAccount.publicKey,
            uuid: candyData.uuid,
            txId: yield anchorProgram.rpc.initializeCandyMachine(candyData, {
                accounts: {
                    candyMachine: candyAccount.publicKey,
                    wallet: treasuryWallet,
                    authority: payerWallet.publicKey,
                    payer: payerWallet.publicKey,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                },
                signers: [payerWallet, candyAccount],
                remainingAccounts: remainingAccounts.length > 0 ? remainingAccounts : undefined,
                instructions: [
                    yield (0, instructions_1.createCandyMachineV2Account)(anchorProgram, candyData, payerWallet.publicKey, candyAccount.publicKey),
                ],
            }),
        };
    });
};
exports.createCandyMachineV2 = createCandyMachineV2;
function uuidFromConfigPubkey(configAccount) {
    return configAccount.toBase58().slice(0, 6);
}
exports.uuidFromConfigPubkey = uuidFromConfigPubkey;
const getTokenWallet = function (wallet, mint) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield web3_js_1.PublicKey.findProgramAddress([wallet.toBuffer(), constants_1.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], constants_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID))[0];
    });
};
exports.getTokenWallet = getTokenWallet;
const getCandyMachineAddress = (config, uuid) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from(constants_1.CANDY_MACHINE), config.toBuffer(), Buffer.from(uuid)], constants_1.CANDY_MACHINE_PROGRAM_ID);
});
exports.getCandyMachineAddress = getCandyMachineAddress;
const deriveCandyMachineV2ProgramAddress = (candyMachineId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield web3_js_1.PublicKey.findProgramAddress([Buffer.from(constants_1.CANDY_MACHINE), candyMachineId.toBuffer()], constants_1.CANDY_MACHINE_PROGRAM_V2_ID);
});
exports.deriveCandyMachineV2ProgramAddress = deriveCandyMachineV2ProgramAddress;
const getTokenMint = (authority, uuid) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('fair_launch'),
        authority.toBuffer(),
        Buffer.from('mint'),
        Buffer.from(uuid),
    ], constants_1.FAIR_LAUNCH_PROGRAM_ID);
});
exports.getTokenMint = getTokenMint;
const getFairLaunch = (tokenMint) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from('fair_launch'), tokenMint.toBuffer()], constants_1.FAIR_LAUNCH_PROGRAM_ID);
});
exports.getFairLaunch = getFairLaunch;
const getCandyMachineCreator = (candyMachine) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from('candy_machine'), candyMachine.toBuffer()], constants_1.CANDY_MACHINE_PROGRAM_V2_ID);
});
exports.getCandyMachineCreator = getCandyMachineCreator;
const getFairLaunchTicket = (tokenMint, buyer) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from('fair_launch'), tokenMint.toBuffer(), buyer.toBuffer()], constants_1.FAIR_LAUNCH_PROGRAM_ID);
});
exports.getFairLaunchTicket = getFairLaunchTicket;
const getFairLaunchLotteryBitmap = (tokenMint) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from('fair_launch'), tokenMint.toBuffer(), Buffer.from('lottery')], constants_1.FAIR_LAUNCH_PROGRAM_ID);
});
exports.getFairLaunchLotteryBitmap = getFairLaunchLotteryBitmap;
const getFairLaunchTicketSeqLookup = (tokenMint, seq) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from('fair_launch'), tokenMint.toBuffer(), seq.toBuffer('le', 8)], constants_1.FAIR_LAUNCH_PROGRAM_ID);
});
exports.getFairLaunchTicketSeqLookup = getFairLaunchTicketSeqLookup;
const getAtaForMint = (mint, buyer) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([buyer.toBuffer(), constants_1.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], constants_1.SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID);
});
exports.getAtaForMint = getAtaForMint;
const getParticipationMint = (authority, uuid) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('fair_launch'),
        authority.toBuffer(),
        Buffer.from('mint'),
        Buffer.from(uuid),
        Buffer.from('participation'),
    ], constants_1.FAIR_LAUNCH_PROGRAM_ID);
});
exports.getParticipationMint = getParticipationMint;
const getParticipationToken = (authority, uuid) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('fair_launch'),
        authority.toBuffer(),
        Buffer.from('mint'),
        Buffer.from(uuid),
        Buffer.from('participation'),
        Buffer.from('account'),
    ], constants_1.FAIR_LAUNCH_PROGRAM_ID);
});
exports.getParticipationToken = getParticipationToken;
const getTreasury = (tokenMint) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from('fair_launch'), tokenMint.toBuffer(), Buffer.from('treasury')], constants_1.FAIR_LAUNCH_PROGRAM_ID);
});
exports.getTreasury = getTreasury;
const getMetadata = (mint) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('metadata'),
        constants_1.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
    ], constants_1.TOKEN_METADATA_PROGRAM_ID))[0];
});
exports.getMetadata = getMetadata;
const getCollectionPDA = (candyMachineAddress) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from('collection'), candyMachineAddress.toBuffer()], constants_1.CANDY_MACHINE_PROGRAM_V2_ID);
});
exports.getCollectionPDA = getCollectionPDA;
const getCollectionAuthorityRecordPDA = (mint, newAuthority) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('metadata'),
        constants_1.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('collection_authority'),
        newAuthority.toBuffer(),
    ], constants_1.TOKEN_METADATA_PROGRAM_ID);
});
exports.getCollectionAuthorityRecordPDA = getCollectionAuthorityRecordPDA;
const getMasterEdition = (mint) => __awaiter(void 0, void 0, void 0, function* () {
    return (yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('metadata'),
        constants_1.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('edition'),
    ], constants_1.TOKEN_METADATA_PROGRAM_ID))[0];
});
exports.getMasterEdition = getMasterEdition;
const getEditionMarkPda = (mint, edition) => __awaiter(void 0, void 0, void 0, function* () {
    const editionNumber = Math.floor(edition / 248);
    return (yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from('metadata'),
        constants_1.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('edition'),
        Buffer.from(editionNumber.toString()),
    ], constants_1.TOKEN_METADATA_PROGRAM_ID))[0];
});
exports.getEditionMarkPda = getEditionMarkPda;
const getAuctionHouse = (creator, treasuryMint) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from(constants_1.AUCTION_HOUSE), creator.toBuffer(), treasuryMint.toBuffer()], constants_1.AUCTION_HOUSE_PROGRAM_ID);
});
exports.getAuctionHouse = getAuctionHouse;
const getAuctionHouseProgramAsSigner = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from(constants_1.AUCTION_HOUSE), Buffer.from('signer')], constants_1.AUCTION_HOUSE_PROGRAM_ID);
});
exports.getAuctionHouseProgramAsSigner = getAuctionHouseProgramAsSigner;
const getAuctionHouseFeeAcct = (auctionHouse) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from(constants_1.AUCTION_HOUSE),
        auctionHouse.toBuffer(),
        Buffer.from(constants_1.FEE_PAYER),
    ], constants_1.AUCTION_HOUSE_PROGRAM_ID);
});
exports.getAuctionHouseFeeAcct = getAuctionHouseFeeAcct;
const getAuctionHouseTreasuryAcct = (auctionHouse) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from(constants_1.AUCTION_HOUSE),
        auctionHouse.toBuffer(),
        Buffer.from(constants_1.TREASURY),
    ], constants_1.AUCTION_HOUSE_PROGRAM_ID);
});
exports.getAuctionHouseTreasuryAcct = getAuctionHouseTreasuryAcct;
const getAuctionHouseBuyerEscrow = (auctionHouse, wallet) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from(constants_1.AUCTION_HOUSE), auctionHouse.toBuffer(), wallet.toBuffer()], constants_1.AUCTION_HOUSE_PROGRAM_ID);
});
exports.getAuctionHouseBuyerEscrow = getAuctionHouseBuyerEscrow;
const getAuctionHouseTradeState = (auctionHouse, wallet, tokenAccount, treasuryMint, tokenMint, tokenSize, buyPrice) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([
        Buffer.from(constants_1.AUCTION_HOUSE),
        wallet.toBuffer(),
        auctionHouse.toBuffer(),
        tokenAccount.toBuffer(),
        treasuryMint.toBuffer(),
        tokenMint.toBuffer(),
        buyPrice.toBuffer('le', 8),
        tokenSize.toBuffer('le', 8),
    ], constants_1.AUCTION_HOUSE_PROGRAM_ID);
});
exports.getAuctionHouseTradeState = getAuctionHouseTradeState;
const getTokenEntanglement = (mintA, mintB) => __awaiter(void 0, void 0, void 0, function* () {
    return yield anchor.web3.PublicKey.findProgramAddress([Buffer.from(constants_1.TOKEN_ENTANGLER), mintA.toBuffer(), mintB.toBuffer()], constants_1.TOKEN_ENTANGLEMENT_PROGRAM_ID);
});
exports.getTokenEntanglement = getTokenEntanglement;
const getTokenEntanglementEscrows = (mintA, mintB) => __awaiter(void 0, void 0, void 0, function* () {
    return [
        ...(yield anchor.web3.PublicKey.findProgramAddress([
            Buffer.from(constants_1.TOKEN_ENTANGLER),
            mintA.toBuffer(),
            mintB.toBuffer(),
            Buffer.from(constants_1.ESCROW),
            Buffer.from(constants_1.A),
        ], constants_1.TOKEN_ENTANGLEMENT_PROGRAM_ID)),
        ...(yield anchor.web3.PublicKey.findProgramAddress([
            Buffer.from(constants_1.TOKEN_ENTANGLER),
            mintA.toBuffer(),
            mintB.toBuffer(),
            Buffer.from(constants_1.ESCROW),
            Buffer.from(constants_1.B),
        ], constants_1.TOKEN_ENTANGLEMENT_PROGRAM_ID)),
    ];
});
exports.getTokenEntanglementEscrows = getTokenEntanglementEscrows;
function loadWalletKey(keypair) {
    if (!keypair || keypair == '') {
        throw new Error('Keypair is required!');
    }
    const decodedKey = new Uint8Array(keypair.endsWith('.json') && !Array.isArray(keypair)
        ? JSON.parse(fs_1.default.readFileSync(keypair).toString())
        : bytes_1.bs58.decode(keypair));
    const loaded = web3_js_1.Keypair.fromSecretKey(decodedKey);
    loglevel_1.default.info(`wallet public key: ${loaded.publicKey}`);
    return loaded;
}
exports.loadWalletKey = loadWalletKey;
function loadCandyProgram(walletKeyPair, env, customRpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (customRpcUrl)
            console.log('USING CUSTOM URL', customRpcUrl);
        // @ts-ignore
        const solConnection = new anchor.web3.Connection(
        //@ts-ignore
        customRpcUrl || (0, various_1.getCluster)(env));
        const walletWrapper = new anchor.Wallet(walletKeyPair);
        const provider = new anchor.Provider(solConnection, walletWrapper, {
            preflightCommitment: 'recent',
        });
        const idl = yield anchor.Program.fetchIdl(constants_1.CANDY_MACHINE_PROGRAM_ID, provider);
        const program = new anchor.Program(idl, constants_1.CANDY_MACHINE_PROGRAM_ID, provider);
        loglevel_1.default.debug('program id from anchor', program.programId.toBase58());
        return program;
    });
}
exports.loadCandyProgram = loadCandyProgram;
function loadCandyProgramV2(walletKeyPair, env, customRpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (customRpcUrl)
            console.log('USING CUSTOM URL', customRpcUrl);
        // @ts-ignore
        const solConnection = new anchor.web3.Connection(
        //@ts-ignore
        customRpcUrl || (0, various_1.getCluster)(env));
        const walletWrapper = new anchor.Wallet(walletKeyPair);
        const provider = new anchor.Provider(solConnection, walletWrapper, {
            preflightCommitment: 'recent',
        });
        const idl = yield anchor.Program.fetchIdl(constants_1.CANDY_MACHINE_PROGRAM_V2_ID, provider);
        const program = new anchor.Program(idl, constants_1.CANDY_MACHINE_PROGRAM_V2_ID, provider);
        loglevel_1.default.debug('program id from anchor', program.programId.toBase58());
        return program;
    });
}
exports.loadCandyProgramV2 = loadCandyProgramV2;
function loadFairLaunchProgram(walletKeyPair, env, customRpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (customRpcUrl)
            console.log('USING CUSTOM URL', customRpcUrl);
        // @ts-ignore
        const solConnection = new anchor.web3.Connection(
        //@ts-ignore
        customRpcUrl || (0, various_1.getCluster)(env));
        const walletWrapper = new anchor.Wallet(walletKeyPair);
        const provider = new anchor.Provider(solConnection, walletWrapper, {
            preflightCommitment: 'recent',
        });
        const idl = yield anchor.Program.fetchIdl(constants_1.FAIR_LAUNCH_PROGRAM_ID, provider);
        return new anchor.Program(idl, constants_1.FAIR_LAUNCH_PROGRAM_ID, provider);
    });
}
exports.loadFairLaunchProgram = loadFairLaunchProgram;
function loadAuctionHouseProgram(walletKeyPair, env, customRpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (customRpcUrl)
            console.log('USING CUSTOM URL', customRpcUrl);
        // @ts-ignore
        const solConnection = new anchor.web3.Connection(
        //@ts-ignore
        customRpcUrl || (0, various_1.getCluster)(env));
        const walletWrapper = new anchor.Wallet(walletKeyPair);
        const provider = new anchor.Provider(solConnection, walletWrapper, {
            preflightCommitment: 'recent',
        });
        const idl = yield anchor.Program.fetchIdl(constants_1.AUCTION_HOUSE_PROGRAM_ID, provider);
        return new anchor.Program(idl, constants_1.AUCTION_HOUSE_PROGRAM_ID, provider);
    });
}
exports.loadAuctionHouseProgram = loadAuctionHouseProgram;
function loadTokenEntanglementProgream(walletKeyPair, env, customRpcUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (customRpcUrl)
            console.log('USING CUSTOM URL', customRpcUrl);
        // @ts-ignore
        const solConnection = new anchor.web3.Connection(
        //@ts-ignore
        customRpcUrl || (0, various_1.getCluster)(env));
        const walletWrapper = new anchor.Wallet(walletKeyPair);
        const provider = new anchor.Provider(solConnection, walletWrapper, {
            preflightCommitment: 'recent',
        });
        const idl = yield anchor.Program.fetchIdl(constants_1.TOKEN_ENTANGLEMENT_PROGRAM_ID, provider);
        return new anchor.Program(idl, constants_1.TOKEN_ENTANGLEMENT_PROGRAM_ID, provider);
    });
}
exports.loadTokenEntanglementProgream = loadTokenEntanglementProgream;
function getTokenAmount(anchorProgram, account, mint) {
    return __awaiter(this, void 0, void 0, function* () {
        let amount = 0;
        if (!mint.equals(constants_1.WRAPPED_SOL_MINT)) {
            try {
                const token = yield anchorProgram.provider.connection.getTokenAccountBalance(account);
                amount = token.value.uiAmount * Math.pow(10, token.value.decimals);
            }
            catch (e) {
                loglevel_1.default.error(e);
                loglevel_1.default.info('Account ', account.toBase58(), 'didnt return value. Assuming 0 tokens.');
            }
        }
        else {
            amount = yield anchorProgram.provider.connection.getBalance(account);
        }
        return amount;
    });
}
exports.getTokenAmount = getTokenAmount;
const getBalance = (account, env, customRpcUrl) => __awaiter(void 0, void 0, void 0, function* () {
    if (customRpcUrl)
        console.log('USING CUSTOM URL', customRpcUrl);
    const connection = new anchor.web3.Connection(
    //@ts-ignore
    customRpcUrl || (0, various_1.getCluster)(env));
    return yield connection.getBalance(account);
});
exports.getBalance = getBalance;
function getProgramAccounts(connection, programId, configOrCommitment) {
    return __awaiter(this, void 0, void 0, function* () {
        const extra = {};
        let commitment;
        //let encoding;
        if (configOrCommitment) {
            if (typeof configOrCommitment === 'string') {
                commitment = configOrCommitment;
            }
            else {
                commitment = configOrCommitment.commitment;
                //encoding = configOrCommitment.encoding;
                if (configOrCommitment.dataSlice) {
                    extra.dataSlice = configOrCommitment.dataSlice;
                }
                if (configOrCommitment.filters) {
                    extra.filters = configOrCommitment.filters;
                }
            }
        }
        const args = connection._buildArgs([programId], commitment, 'base64', extra);
        const unsafeRes = yield connection._rpcRequest('getProgramAccounts', args);
        return unsafeResAccounts(unsafeRes.result);
    });
}
exports.getProgramAccounts = getProgramAccounts;
function unsafeAccount(account) {
    return {
        // TODO: possible delay parsing could be added here
        data: Buffer.from(account.data[0], 'base64'),
        executable: account.executable,
        lamports: account.lamports,
        // TODO: maybe we can do it in lazy way? or just use string
        owner: account.owner,
    };
}
function unsafeResAccounts(data) {
    return data.map(item => ({
        account: unsafeAccount(item.account),
        pubkey: item.pubkey,
    }));
}
