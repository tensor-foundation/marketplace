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
const web3_js_1 = require("@solana/web3.js");
const spl_account_compression_1 = require("@solana/spl-account-compression");
const generated_1 = require("../src/generated");
const mpl_bubblegum_1 = require("../src/mpl-bubblegum");
const bn_js_1 = require("bn.js");
function keypairFromSeed(seed) {
    const expandedSeed = Uint8Array.from(Buffer.from(`${seed}`));
    return web3_js_1.Keypair.fromSeed(expandedSeed.slice(0, 32));
}
function makeCompressedNFT(name, symbol, creators = []) {
    return {
        name: name,
        symbol: symbol,
        uri: 'https://metaplex.com',
        creators,
        editionNonce: 0,
        tokenProgramVersion: generated_1.TokenProgramVersion.Original,
        tokenStandard: generated_1.TokenStandard.Fungible,
        uses: null,
        collection: null,
        primarySaleHappened: false,
        sellerFeeBasisPoints: 0,
        isMutable: false,
    };
}
function setupTreeWithCompressedNFT(connection, payerKeypair, compressedNFT, depthSizePair = {
    maxDepth: 14,
    maxBufferSize: 64
}) {
    return __awaiter(this, void 0, void 0, function* () {
        const payer = payerKeypair.publicKey;
        const merkleTreeKeypair = web3_js_1.Keypair.generate();
        const merkleTree = merkleTreeKeypair.publicKey;
        const space = (0, spl_account_compression_1.getConcurrentMerkleTreeAccountSize)(depthSizePair.maxDepth, depthSizePair.maxBufferSize);
        const allocTreeIx = web3_js_1.SystemProgram.createAccount({
            fromPubkey: payer,
            newAccountPubkey: merkleTree,
            lamports: yield connection.getMinimumBalanceForRentExemption(space),
            space: space,
            programId: spl_account_compression_1.SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        });
        const [treeAuthority, _bump] = yield web3_js_1.PublicKey.findProgramAddress([merkleTree.toBuffer()], generated_1.PROGRAM_ID);
        const createTreeIx = (0, generated_1.createCreateTreeInstruction)({
            merkleTree,
            treeAuthority,
            treeCreator: payer,
            payer,
            logWrapper: spl_account_compression_1.SPL_NOOP_PROGRAM_ID,
            compressionProgram: spl_account_compression_1.SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        }, {
            maxBufferSize: depthSizePair.maxBufferSize,
            maxDepth: depthSizePair.maxDepth,
            public: false,
        }, generated_1.PROGRAM_ID);
        const mintIx = (0, generated_1.createMintV1Instruction)({
            merkleTree,
            treeAuthority,
            treeDelegate: payer,
            payer,
            leafDelegate: payer,
            leafOwner: payer,
            compressionProgram: spl_account_compression_1.SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
            logWrapper: spl_account_compression_1.SPL_NOOP_PROGRAM_ID,
        }, {
            message: compressedNFT,
        });
        const tx = new web3_js_1.Transaction().add(allocTreeIx).add(createTreeIx).add(mintIx);
        tx.feePayer = payer;
        yield (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [merkleTreeKeypair, payerKeypair], {
            commitment: 'confirmed',
            skipPreflight: true,
        });
        return {
            merkleTree,
        };
    });
}
describe('Bubblegum tests', () => {
    const connection = new web3_js_1.Connection('http://localhost:8899');
    const payerKeypair = keypairFromSeed('metaplex-test09870987098709870987009709870987098709870987');
    const payer = payerKeypair.publicKey;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield connection.requestAirdrop(payer, web3_js_1.LAMPORTS_PER_SOL);
    }));
    it('Can create a Bubblegum tree and mint to it', () => __awaiter(void 0, void 0, void 0, function* () {
        const compressedNFT = {
            name: 'Test Compressed NFT',
            symbol: 'TST',
            uri: 'https://metaplex.com',
            creators: [],
            editionNonce: 0,
            tokenProgramVersion: generated_1.TokenProgramVersion.Original,
            tokenStandard: generated_1.TokenStandard.Fungible,
            uses: null,
            collection: null,
            primarySaleHappened: false,
            sellerFeeBasisPoints: 0,
            isMutable: false,
        };
        yield setupTreeWithCompressedNFT(connection, payerKeypair, compressedNFT, { maxDepth: 14, maxBufferSize: 64 });
    }));
    describe('Unit test compressed NFT instructions', () => {
        let merkleTree;
        const originalCompressedNFT = makeCompressedNFT('test', 'TST');
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            yield connection.requestAirdrop(payer, web3_js_1.LAMPORTS_PER_SOL);
            const result = yield setupTreeWithCompressedNFT(connection, payerKeypair, originalCompressedNFT, {
                maxDepth: 14,
                maxBufferSize: 64,
            });
            merkleTree = result.merkleTree;
        }));
        it('Can verify existence a compressed NFT', () => __awaiter(void 0, void 0, void 0, function* () {
            // Todo(@ngundotra): expose commitment level in ConcurrentMerkleTreeAccount.fromAddress
            const accountInfo = yield connection.getAccountInfo(merkleTree, { commitment: 'confirmed' });
            const account = spl_account_compression_1.ConcurrentMerkleTreeAccount.fromBuffer(accountInfo.data);
            // Verify leaf exists
            const leafIndex = new bn_js_1.BN.BN(0);
            const assetId = yield (0, mpl_bubblegum_1.getLeafAssetId)(merkleTree, leafIndex);
            const verifyLeafIx = (0, spl_account_compression_1.createVerifyLeafIx)(merkleTree, {
                root: account.getCurrentRoot(),
                leaf: (0, mpl_bubblegum_1.computeCompressedNFTHash)(assetId, payer, payer, leafIndex, originalCompressedNFT),
                leafIndex: 0,
                proof: [],
            });
            const tx = new web3_js_1.Transaction().add(verifyLeafIx);
            const txId = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [payerKeypair], {
                commitment: 'confirmed',
                skipPreflight: true,
            });
            console.log('Verified NFT existence:', txId);
        }));
        // TODO(@metaplex): add collection tests here
    });
});
