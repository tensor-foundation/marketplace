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
const tape_1 = __importDefault(require("tape"));
const setup_1 = require("./setup");
const web3_js_1 = require("@solana/web3.js");
const digital_asset_manager_1 = require("./utils/digital-asset-manager");
const spl_token_1 = require("@solana/spl-token");
const splToken = __importStar(require("@solana/spl-token"));
const generated_1 = require("../src/generated");
const mpl_token_auth_rules_1 = require("@metaplex-foundation/mpl-token-auth-rules");
const generated_2 = require("../src/generated");
const msgpack_1 = require("@msgpack/msgpack");
const spok_1 = __importDefault(require("spok"));
const utils_1 = require("./utils");
const programmable_1 = require("./utils/programmable");
(0, setup_1.killStuckProcess)();
(0, tape_1.default)('Transfer: NonFungible', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer);
    const owner = payer;
    const destination = web3_js_1.Keypair.generate();
    const destinationToken = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mint, destination.publicKey);
    const amountBeforeTransfer = destinationToken.amount;
    // transfer
    const amount = 1;
    const { tx: transferTx } = yield API.transfer(payer, owner.publicKey, token, mint, metadata, masterEdition, destination.publicKey, destinationToken.address, null, amount, handler);
    yield transferTx.assertSuccess(t);
    // asserts
    const amountAfterTransfer = (yield (0, spl_token_1.getAccount)(connection, destinationToken.address)).amount;
    const remainingAmount = (yield (0, spl_token_1.getAccount)(connection, token)).amount;
    t.true(amountAfterTransfer > amountBeforeTransfer, 'amount after transfer is greater than before');
    t.true(amountAfterTransfer.toString() === '1', 'destination amount equal to 1');
    t.true(remainingAmount.toString() === '0', 'source amount equal to 0');
}));
(0, tape_1.default)('Transfer: ProgrammableNonFungible (wallet-to-wallet)', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const owner = payer;
    const authority = payer;
    const destination = web3_js_1.Keypair.generate();
    const invalidDestination = web3_js_1.Keypair.generate();
    setup_1.amman.airdrop(connection, destination.publicKey, 1);
    setup_1.amman.airdrop(connection, invalidDestination.publicKey, 1);
    // Set up our rule set with one pubkey match rule for transfer.
    const ruleSetName = 'transfer_test';
    const ruleSet = {
        libVersion: 1,
        ruleSetName: ruleSetName,
        owner: Array.from(owner.publicKey.toBytes()),
        operations: {
            Transfer: {
                ProgramOwned: {
                    program: Array.from(owner.publicKey.toBytes()),
                    field: 'Destination',
                },
            },
        },
    };
    const serializedRuleSet = (0, msgpack_1.encode)(ruleSet);
    // Find the ruleset PDA
    const [ruleSetPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('rule_set'), payer.publicKey.toBuffer(), Buffer.from(ruleSetName)], mpl_token_auth_rules_1.PROGRAM_ID);
    // Create the ruleset at the PDA address with the serialized ruleset values.
    const { tx: createRuleSetTx } = yield API.createRuleSet(t, payer, ruleSetPda, serializedRuleSet, handler);
    yield createRuleSetTx.assertSuccess(t);
    // Create an NFT with the programmable config stored on the metadata.
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, ruleSetPda);
    const metadataAccount = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, metadataAccount.programmableConfig, {
        ruleSet: (0, utils_1.spokSamePubkey)(ruleSetPda),
    });
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, token, 'confirmed', spl_token_1.TOKEN_PROGRAM_ID);
    t.true(tokenAccount.amount.toString() === '1', 'token account amount equal to 1');
    const destinationToken = yield (0, spl_token_1.createAssociatedTokenAccount)(connection, payer, mint, destination.publicKey);
    // owner token record
    const ownerTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, token);
    setup_1.amman.addr.addLabel('Owner Token Record', ownerTokenRecord);
    // destination token record
    const destinationTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, destinationToken);
    setup_1.amman.addr.addLabel('Destination Token Record', destinationTokenRecord);
    // Transfer the NFT to the destination account, this should work since
    // the destination account is in the ruleset.
    const { tx: transferTx } = yield API.transfer(authority, owner.publicKey, token, mint, metadata, masterEdition, destination.publicKey, destinationToken, ruleSetPda, 1, handler, ownerTokenRecord, destinationTokenRecord);
    yield transferTx.assertSuccess(t);
    t.true((yield (0, spl_token_1.getAccount)(connection, token)).amount.toString() === '0', 'token amount after transfer equal to 0');
}));
(0, tape_1.default)('Transfer: ProgrammableNonFungible (program-owned)', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const owner = payer;
    const authority = payer;
    // Set up our rule set with one pubkey match rule for transfer
    // where the target is a program-owned account of the Token Metadata
    // program.
    const ruleSetName = 'transfer_test';
    const ruleSet = {
        libVersion: 1,
        ruleSetName: ruleSetName,
        owner: Array.from(owner.publicKey.toBytes()),
        operations: {
            'Transfer:Owner': {
                ProgramOwned: {
                    program: Array.from(generated_2.PROGRAM_ID.toBytes()),
                    field: 'Destination',
                },
            },
        },
    };
    const serializedRuleSet = (0, msgpack_1.encode)(ruleSet);
    // Find the ruleset PDA
    const [ruleSetPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('rule_set'), payer.publicKey.toBuffer(), Buffer.from(ruleSetName)], mpl_token_auth_rules_1.PROGRAM_ID);
    // Create the ruleset at the PDA address with the serialized ruleset values.
    const { tx: createRuleSetTx } = yield API.createRuleSet(t, payer, ruleSetPda, serializedRuleSet, handler);
    yield createRuleSetTx.assertSuccess(t);
    // Create an NFT with the programmable config stored on the metadata.
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, ruleSetPda);
    const metadataAccount = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, metadataAccount.programmableConfig, {
        ruleSet: (0, utils_1.spokSamePubkey)(ruleSetPda),
    });
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, token, 'confirmed', spl_token_1.TOKEN_PROGRAM_ID);
    t.true(tokenAccount.amount.toString() === '1', 'token account amount equal to 1');
    // [FAIL] Our first destination is going to be an account owned by the
    // mpl-token-auth-rules program as a convenient program-owned account
    // that is not owned by token-metadata.
    const invalidDestination = ruleSetPda;
    // We have to manually run the create ATA transaction since the helper
    // function from SPL token does not allow creating one for an off-curve
    // address.
    const invalidDestinationToken = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, invalidDestination, true, // Allow off-curve addresses
    splToken.TOKEN_PROGRAM_ID, splToken.ASSOCIATED_TOKEN_PROGRAM_ID);
    const invalidAtaTx = new web3_js_1.Transaction().add((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, invalidDestinationToken, invalidDestination, mint, splToken.TOKEN_PROGRAM_ID, splToken.ASSOCIATED_TOKEN_PROGRAM_ID));
    yield (0, web3_js_1.sendAndConfirmTransaction)(connection, invalidAtaTx, [payer]);
    // owner token record
    const ownerTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, token);
    setup_1.amman.addr.addLabel('Owner Token Record', ownerTokenRecord);
    // destination token record
    let destinationTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, invalidDestinationToken);
    setup_1.amman.addr.addLabel('Destination Token Record', destinationTokenRecord);
    // Transfer the NFT to the invalid destination account, this should fail.
    const { tx: invalidTransferTx } = yield API.transfer(authority, owner.publicKey, token, mint, metadata, masterEdition, invalidDestination, invalidDestinationToken, ruleSetPda, 1, handler, ownerTokenRecord, destinationTokenRecord);
    // Cusper matches the error code from mpl-token-auth-rules
    // to a mpl-token-metadata error which gives us the wrong message
    // so we match on the actual log values here instead.
    invalidTransferTx.then((x) => x.assertLogs(t, [/Program Owned check failed/i], {
        txLabel: 'tx: Transfer',
    }));
    yield invalidTransferTx.assertError(t);
    // Transfer failed so token should still be present on the original
    // account.
    t.true((yield (0, spl_token_1.getAccount)(connection, token)).amount.toString() === '1', 'token amount after transfer equal to 1');
    t.true((yield (0, spl_token_1.getAccount)(connection, invalidDestinationToken)).amount.toString() === '0', 'token amount after transfer equal to 0');
    // [SUCESS] Our valid destination is going to be an account owned by the
    // mpl-token-metadata program. Any one will do so for convenience
    // we just use the existing metadata account.
    const destination = metadata;
    // We have to manually run the create ATA transaction since the helper
    // function from SPL token does not allow creating one for an off-curve
    // address.
    const destinationToken = yield (0, spl_token_1.getAssociatedTokenAddress)(mint, destination, true, // Allow off-curve addresses
    splToken.TOKEN_PROGRAM_ID, splToken.ASSOCIATED_TOKEN_PROGRAM_ID);
    const ataTx = new web3_js_1.Transaction().add((0, spl_token_1.createAssociatedTokenAccountInstruction)(payer.publicKey, destinationToken, destination, mint, splToken.TOKEN_PROGRAM_ID, splToken.ASSOCIATED_TOKEN_PROGRAM_ID));
    yield (0, web3_js_1.sendAndConfirmTransaction)(connection, ataTx, [payer]);
    // destination token record
    destinationTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, destinationToken);
    setup_1.amman.addr.addLabel('Destination Token Record', destinationTokenRecord);
    // Transfer the NFT to the destination account, this should work since
    // the destination account is in the ruleset.
    const { tx: transferTx } = yield API.transfer(authority, owner.publicKey, token, mint, metadata, masterEdition, destination, destinationToken, ruleSetPda, 1, handler, ownerTokenRecord, destinationTokenRecord);
    // Cusper matches the error code from mpl-token-auth-rules
    // to a mpl-token-metadata error which gives us the wrong message
    // so we match on the actual log values here instead.
    yield transferTx.assertSuccess(t);
    // Transfer succeed so token should have moved to the destination
    // account.
    t.true((yield (0, spl_token_1.getAccount)(connection, token)).amount.toString() === '0', 'token amount after transfer equal to 0');
    t.true((yield (0, spl_token_1.getAccount)(connection, destinationToken)).amount.toString() === '1', 'token amount after transfer equal to 1');
}));
/*
test('Transfer: NonFungibleEdition', async (t) => {
  const API = new InitTransactions();
  const { fstTxHandler: handler, payerPair: payer, connection } = await API.payer();

Need to call print instead of mint
  const { mint, metadata, masterEdition, token } = await createAndMintDefaultAsset(
    t,
    API,
    handler,
    payer,
    TokenStandard.NonFungibleEdition,
  );

  const owner = payer;
  const destination = Keypair.generate();
  const destinationToken = await createAssociatedTokenAccount(
    connection,
    payer,
    mint,
    destination.publicKey,
  );
  const amount = 1;

  const { tx: transferTx } = await API.transfer(
    owner,
    token,
    mint,
    metadata,
    masterEdition,
    destination.publicKey,
    destinationToken,
    amount,
    handler,
  );

  await transferTx.assertSuccess(t);
});
*/
(0, tape_1.default)('Transfer: Fungible', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.Fungible, null, 100);
    const owner = payer;
    const destination = web3_js_1.Keypair.generate();
    const destinationToken = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mint, destination.publicKey);
    const amountBeforeTransfer = destinationToken.amount;
    // transfer
    const amount = 5;
    const { tx: transferTx } = yield API.transfer(payer, owner.publicKey, token, mint, metadata, masterEdition, destination.publicKey, destinationToken.address, null, amount, handler);
    yield transferTx.assertSuccess(t);
    // asserts
    const amountAfterTransfer = (yield (0, spl_token_1.getAccount)(connection, destinationToken.address)).amount;
    const remainingAmount = (yield (0, spl_token_1.getAccount)(connection, token)).amount;
    t.true(amountAfterTransfer > amountBeforeTransfer, 'amount after transfer is greater than before');
    t.true(amountAfterTransfer.toString() === '5', 'destination amount equal to 5');
    t.equal(remainingAmount.toString(), '95', 'remaining amount after transfer is 95');
}));
(0, tape_1.default)('Transfer: FungibleAsset', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.FungibleAsset, null, 10);
    const owner = payer;
    const destination = web3_js_1.Keypair.generate();
    const destinationToken = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mint, destination.publicKey);
    const amountBeforeTransfer = destinationToken.amount;
    // transfer
    const amount = 5;
    const { tx: transferTx } = yield API.transfer(payer, owner.publicKey, token, mint, metadata, masterEdition, destination.publicKey, destinationToken.address, null, amount, handler);
    yield transferTx.assertSuccess(t);
    // asserts
    const amountAfterTransfer = (yield (0, spl_token_1.getAccount)(connection, destinationToken.address)).amount;
    const remainingAmount = (yield (0, spl_token_1.getAccount)(connection, token)).amount;
    t.true(amountAfterTransfer > amountBeforeTransfer, 'amount after transfer is greater than before');
    t.true(amountAfterTransfer.toString() === '5', 'destination amount equal to 5');
    t.equal(remainingAmount.toString(), '5', 'remaining amount after transfer is 5');
}));
(0, tape_1.default)('Transfer: NonFungible asset with delegate', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const owner = payer;
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.NonFungible, null, 1);
    // Generate the delegate keypair
    const delegate = web3_js_1.Keypair.generate();
    const delegateArgs = {
        __kind: 'StandardV1',
        amount: 1,
    };
    // Approve delegate
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, mint, metadata, payer.publicKey, payer, delegateArgs, handler, null, masterEdition, token);
    yield delegateTx.assertSuccess(t);
    const destination = web3_js_1.Keypair.generate();
    const destinationToken = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mint, destination.publicKey);
    const fakeDelegate = web3_js_1.Keypair.generate();
    const amount = 1;
    // [FAIL] Try to transfer with fake delegate. This should fail.
    const { tx: fakeDelegateTransferTx } = yield API.transfer(fakeDelegate, // Transfer authority: the fake delegate
    payer.publicKey, // Owner of the asset
    token, mint, metadata, masterEdition, destination.publicKey, destinationToken.address, null, amount, handler);
    yield fakeDelegateTransferTx.assertError(t, /Invalid authority type/);
    // Transfer using the legitimate delegate
    // Try to transfer with fake delegate. This should fail.
    const { tx: transferTx } = yield API.transfer(delegate, // Transfer authority: the real delegate
    owner.publicKey, // Owner of the asset
    token, mint, metadata, masterEdition, destination.publicKey, destinationToken.address, null, amount, handler);
    yield transferTx.assertSuccess(t);
}));
(0, tape_1.default)('Transfer: NonFungible asset with invalid authority', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.NonFungible, null, 1);
    // This is not a delegate, owner, or a public key in auth rules.
    // Because this is a NFT not a PNFT, it will fail as an
    // invalid authority, not as a failed auth rules check.
    const invalidAuthority = web3_js_1.Keypair.generate();
    const destination = web3_js_1.Keypair.generate();
    const destinationToken = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mint, destination.publicKey);
    const amount = 1;
    // Try to transfer with fake delegate. This should fail.
    const { tx: fakeDelegateTransferTx } = yield API.transfer(invalidAuthority, // transfer authority: the invalid authority
    payer.publicKey, // Owner of the asset
    token, mint, metadata, masterEdition, destination.publicKey, destinationToken.address, null, amount, handler);
    yield fakeDelegateTransferTx.assertError(t, /Invalid authority type/);
}));
(0, tape_1.default)('Transfer: ProgrammableNonFungible asset with invalid authority', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const owner = payer;
    // We add this authority to the rule_set as an "Authority"
    // type, which will allow it to transfer the asset.
    const validAuthority = web3_js_1.Keypair.generate();
    // This is not a delegate, owner, or a public key in auth rules.
    const invalidAuthority = web3_js_1.Keypair.generate();
    // Set up our rule set
    const ruleSetName = 'transfer_test';
    const ruleSet = {
        libVersion: 1,
        ruleSetName: ruleSetName,
        owner: Array.from(owner.publicKey.toBytes()),
        operations: {
            Transfer: {
                PubkeyMatch: {
                    pubkey: Array.from(validAuthority.publicKey.toBytes()),
                    field: 'Authority',
                },
            },
        },
    };
    const serializedRuleSet = (0, msgpack_1.encode)(ruleSet);
    // Find the ruleset PDA
    const [ruleSetPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('rule_set'), payer.publicKey.toBuffer(), Buffer.from(ruleSetName)], mpl_token_auth_rules_1.PROGRAM_ID);
    // Create the ruleset at the PDA address with the serialized ruleset values.
    const { tx: createRuleSetTx } = yield API.createRuleSet(t, payer, ruleSetPda, serializedRuleSet, handler);
    yield createRuleSetTx.assertSuccess(t);
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, ruleSetPda, 1);
    const destination = web3_js_1.Keypair.generate();
    const destinationToken = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, payer, mint, destination.publicKey);
    const amount = 1;
    // Try to transfer with fake delegate. This should fail.
    const { tx: invalidTransferTx } = yield API.transfer(invalidAuthority, // transfer authority: the invalid authority
    payer.publicKey, // Owner of the asset
    token, mint, metadata, masterEdition, destination.publicKey, destinationToken.address, ruleSetPda, amount, handler);
    yield invalidTransferTx.assertError(t, /Invalid authority type/);
}));
(0, tape_1.default)('Transfer: ProgrammableNonFungible (uninitialized wallet-to-wallet)', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const owner = payer;
    const authority = payer;
    const destination = web3_js_1.Keypair.generate();
    const invalidDestination = web3_js_1.Keypair.generate();
    setup_1.amman.airdrop(connection, destination.publicKey, 1);
    setup_1.amman.airdrop(connection, invalidDestination.publicKey, 1);
    // Set up our rule set with one pubkey match rule for transfer.
    const ruleSetName = 'transfer_test';
    const ruleSet = {
        libVersion: 1,
        ruleSetName: ruleSetName,
        owner: Array.from(owner.publicKey.toBytes()),
        operations: {
            Transfer: {
                ProgramOwned: {
                    program: Array.from(owner.publicKey.toBytes()),
                    field: 'Destination',
                },
            },
        },
    };
    const serializedRuleSet = (0, msgpack_1.encode)(ruleSet);
    // Find the ruleset PDA
    const [ruleSetPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('rule_set'), payer.publicKey.toBuffer(), Buffer.from(ruleSetName)], mpl_token_auth_rules_1.PROGRAM_ID);
    // Create the ruleset at the PDA address with the serialized ruleset values.
    const { tx: createRuleSetTx } = yield API.createRuleSet(t, payer, ruleSetPda, serializedRuleSet, handler);
    yield createRuleSetTx.assertSuccess(t);
    // Create an NFT with the programmable config stored on the metadata.
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, ruleSetPda);
    const metadataAccount = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, metadataAccount.programmableConfig, {
        ruleSet: (0, utils_1.spokSamePubkey)(ruleSetPda),
    });
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, token, 'confirmed', spl_token_1.TOKEN_PROGRAM_ID);
    t.true(tokenAccount.amount.toString() === '1', 'token account amount equal to 1');
    const [destinationToken] = web3_js_1.PublicKey.findProgramAddressSync([destination.publicKey.toBuffer(), splToken.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], splToken.ASSOCIATED_TOKEN_PROGRAM_ID);
    // owner token record
    const ownerTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, token);
    setup_1.amman.addr.addLabel('Owner Token Record', ownerTokenRecord);
    // destination token record
    const destinationTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, destinationToken);
    setup_1.amman.addr.addLabel('Destination Token Record', destinationTokenRecord);
    // Transfer the NFT to the destination account, this should work since
    // the destination account is in the ruleset.
    const { tx: transferTx } = yield API.transfer(authority, owner.publicKey, token, mint, metadata, masterEdition, destination.publicKey, destinationToken, ruleSetPda, 1, handler, ownerTokenRecord, destinationTokenRecord);
    yield transferTx.assertSuccess(t);
    t.true((yield (0, spl_token_1.getAccount)(connection, token)).amount.toString() === '0', 'token amount after transfer equal to 0');
}));
(0, tape_1.default)('Transfer: ProgrammableNonFungible (rule set revision)', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const owner = payer;
    // create a rule set that allows transfers to token metadata (revision 0)
    const ruleSetName = 'transfer_test';
    const ruleSetTokenMetadata = {
        libVersion: 1,
        ruleSetName: ruleSetName,
        owner: Array.from(owner.publicKey.toBytes()),
        operations: {
            'Transfer:TransferDelegate': {
                ProgramOwned: {
                    program: Array.from(generated_2.PROGRAM_ID.toBytes()),
                    field: 'Destination',
                },
            },
            'Transfer:Owner': {
                ProgramOwned: {
                    program: Array.from(generated_2.PROGRAM_ID.toBytes()),
                    field: 'Destination',
                },
            },
            'Delegate:Transfer': 'Pass',
        },
    };
    const [ruleSetPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('rule_set'), payer.publicKey.toBuffer(), Buffer.from(ruleSetName)], mpl_token_auth_rules_1.PROGRAM_ID);
    const { tx: createRuleSetTx } = yield API.createRuleSet(t, payer, ruleSetPda, (0, msgpack_1.encode)(ruleSetTokenMetadata), handler);
    yield createRuleSetTx.assertSuccess(t);
    // creates a pNFT
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, ruleSetPda);
    // creates a delegate
    const [, delegate] = yield API.getKeypair('Delegate');
    setup_1.amman.airdrop(connection, delegate.publicKey, 1);
    // token record PDA
    const tokenRecord = (0, programmable_1.findTokenRecordPda)(mint, token);
    setup_1.amman.addr.addLabel('Token Record', tokenRecord);
    const args = {
        __kind: 'TransferV1',
        amount: 1,
        authorizationData: null,
    };
    const { tx: delegateTx } = yield API.delegate(delegate.publicKey, mint, metadata, payer.publicKey, payer, args, handler, null, masterEdition, token, tokenRecord, ruleSetPda);
    yield delegateTx.assertSuccess(t);
    // checks that the rule set revision has been saved
    let pda = yield generated_1.TokenRecord.fromAccountAddress(connection, tokenRecord);
    (0, spok_1.default)(t, pda, {
        delegate: (0, utils_1.spokSamePubkey)(delegate.publicKey),
        delegateRole: generated_1.TokenDelegateRole.Transfer,
        ruleSetRevision: (0, utils_1.spokSameBignum)(0),
    });
    // updates the rule set to allow transfers only to token auth rules (revision 1)
    const ruleSetTokenAuthRules = {
        libVersion: 1,
        ruleSetName: ruleSetName,
        owner: Array.from(owner.publicKey.toBytes()),
        operations: {
            'Transfer:TransferDelegate': {
                ProgramOwned: {
                    program: Array.from(mpl_token_auth_rules_1.PROGRAM_ID.toBytes()),
                    field: 'Destination',
                },
            },
            'Transfer:Owner': {
                ProgramOwned: {
                    program: Array.from(mpl_token_auth_rules_1.PROGRAM_ID.toBytes()),
                    field: 'Destination',
                },
            },
        },
    };
    const { tx: createRuleSetTx2 } = yield API.createRuleSet(t, payer, ruleSetPda, (0, msgpack_1.encode)(ruleSetTokenAuthRules), handler);
    yield createRuleSetTx2.assertSuccess(t);
    // performs a transfer using the delegate to the metadata account, which is
    // allowed by revision 0 (this will work because the revision was saved when
    // we set the delegate)
    const [destinationToken] = web3_js_1.PublicKey.findProgramAddressSync([metadata.toBuffer(), splToken.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], splToken.ASSOCIATED_TOKEN_PROGRAM_ID);
    // owner token record
    const ownerTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, token);
    setup_1.amman.addr.addLabel('Owner Token Record', ownerTokenRecord);
    // destination token record
    const destinationTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, destinationToken);
    setup_1.amman.addr.addLabel('Destination Token Record', destinationTokenRecord);
    // Transfer the NFT to the destination account, this should work since
    // the destination account is in the ruleset.
    const { tx: transferTx } = yield API.transfer(owner, owner.publicKey, token, mint, metadata, masterEdition, metadata, destinationToken, ruleSetPda, 1, handler, ownerTokenRecord, destinationTokenRecord);
    yield transferTx.assertSuccess(t);
    t.true((yield (0, spl_token_1.getAccount)(connection, token)).amount.toString() === '0', 'token amount after transfer equal to 0');
    // revision on the source token must be null
    pda = yield generated_1.TokenRecord.fromAccountAddress(connection, ownerTokenRecord);
    (0, spok_1.default)(t, pda, {
        ruleSetRevision: null,
    });
    // revision on the destination token must be null
    pda = yield generated_1.TokenRecord.fromAccountAddress(connection, destinationTokenRecord);
    (0, spok_1.default)(t, pda, {
        ruleSetRevision: null,
    });
}));
(0, tape_1.default)('Transfer: ProgrammableNonFungible with address lookup table (LUT)', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    // 1) prepares the rule set and the programmable NFT for the transfer
    const owner = payer;
    const destination = web3_js_1.Keypair.generate();
    setup_1.amman.airdrop(connection, destination.publicKey, 1);
    const { tx: createRuleSetTx, ruleSet: ruleSetPda } = yield API.createDefaultRuleSet(t, handler, payer, 1);
    yield createRuleSetTx.assertSuccess(t);
    // create an NFT with the programmable config stored on the metadata.
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, ruleSetPda);
    const metadataAccount = yield generated_1.Metadata.fromAccountAddress(connection, metadata);
    (0, spok_1.default)(t, metadataAccount.programmableConfig, {
        ruleSet: (0, utils_1.spokSamePubkey)(ruleSetPda),
    });
    const tokenAccount = yield (0, spl_token_1.getAccount)(connection, token, 'confirmed', spl_token_1.TOKEN_PROGRAM_ID);
    t.true(tokenAccount.amount.toString() === '1', 'token account amount equal to 1');
    const destinationToken = yield (0, spl_token_1.createAssociatedTokenAccount)(connection, payer, mint, destination.publicKey);
    // owner token record
    const ownerTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, token);
    setup_1.amman.addr.addLabel('Owner Token Record', ownerTokenRecord);
    // destination token record
    const destinationTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, destinationToken);
    setup_1.amman.addr.addLabel('Destination Token Record', destinationTokenRecord);
    // 2) creates the lookup table (in practice the LUT would be created when the user 'deposits'
    // the NFT into the program)
    const { tx, lookupTable } = yield (0, setup_1.createLookupTable)(payer.publicKey, payer, handler, connection);
    yield tx.assertSuccess(t);
    // adds addresses to the lookup table
    const addresses = [
        owner.publicKey,
        ownerTokenRecord,
        token,
        mint,
        metadata,
        masterEdition,
        ruleSetPda,
        web3_js_1.SYSVAR_INSTRUCTIONS_PUBKEY,
    ];
    const { response } = yield (0, setup_1.addAddressesToTable)(lookupTable, payer.publicKey, payer, addresses, connection);
    t.true(response.value.err == null);
    const account = yield connection.getAccountInfo(lookupTable);
    const table = web3_js_1.AddressLookupTableAccount.deserialize(account.data);
    (0, spok_1.default)(t, table, {
        authority: (0, utils_1.spokSamePubkey)(payer.publicKey),
        addresses: [...addresses.map((value) => (0, utils_1.spokSamePubkey)(value))],
    });
    // 3) transfer the programmable NFT using the LUT
    const { instruction: transferIx } = yield API.getTransferInstruction(owner, owner.publicKey, token, mint, metadata, masterEdition, destination.publicKey, destinationToken, ruleSetPda, 1, handler, ownerTokenRecord, destinationTokenRecord);
    const lookupTableAccount = yield connection.getAddressLookupTable(lookupTable);
    console.log('[ waiting for lookup table activation ]');
    yield (0, setup_1.sleep)(1000);
    yield (0, setup_1.createAndSendV0Tx)(payer, [transferIx], connection, [lookupTableAccount.value]);
    t.true((yield (0, spl_token_1.getAccount)(connection, token)).amount.toString() === '0', 'token amount after transfer equal to 0');
}));
(0, tape_1.default)('Transfer: ProgrammableNonFungible (PDA Seeds)', (t) => __awaiter(void 0, void 0, void 0, function* () {
    const API = new setup_1.InitTransactions();
    const { fstTxHandler: handler, payerPair: payer, connection } = yield API.payer();
    const owner = payer;
    // create a rule set that allows transfers to token metadata (revision 0)
    const ruleSetName = 'transfer_test';
    const ruleSetTokenMetadata = {
        libVersion: 1,
        ruleSetName: ruleSetName,
        owner: Array.from(owner.publicKey.toBytes()),
        operations: {
            'Transfer:Owner': {
                All: {
                    rules: [
                        {
                            ProgramOwned: {
                                program: Array.from(generated_2.PROGRAM_ID.toBytes()),
                                field: 'Destination',
                            },
                        },
                        {
                            PDAMatch: {
                                program: null,
                                pda_field: 'Destination',
                                seeds_field: 'DestinationSeeds',
                            },
                        },
                    ],
                },
            },
        },
    };
    const [ruleSetPda] = web3_js_1.PublicKey.findProgramAddressSync([Buffer.from('rule_set'), payer.publicKey.toBuffer(), Buffer.from(ruleSetName)], mpl_token_auth_rules_1.PROGRAM_ID);
    const { tx: createRuleSetTx } = yield API.createRuleSet(t, payer, ruleSetPda, (0, msgpack_1.encode)(ruleSetTokenMetadata), handler);
    yield createRuleSetTx.assertSuccess(t);
    // creates a pNFT
    const { mint, metadata, masterEdition, token } = yield (0, digital_asset_manager_1.createAndMintDefaultAsset)(t, connection, API, handler, payer, generated_1.TokenStandard.ProgrammableNonFungible, ruleSetPda);
    const [destinationToken] = web3_js_1.PublicKey.findProgramAddressSync([metadata.toBuffer(), splToken.TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()], splToken.ASSOCIATED_TOKEN_PROGRAM_ID);
    // owner token record
    const ownerTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, token);
    setup_1.amman.addr.addLabel('Owner Token Record', ownerTokenRecord);
    // destination token record
    const destinationTokenRecord = (0, programmable_1.findTokenRecordPda)(mint, destinationToken);
    setup_1.amman.addr.addLabel('Destination Token Record', destinationTokenRecord);
    const map = new Map();
    map.set('DestinationSeeds', {
        __kind: 'Seeds',
        fields: [
            {
                seeds: [Buffer.from('metadata'), generated_2.PROGRAM_ID.toBuffer(), mint.toBuffer()],
            },
        ],
    });
    const authorizationData = {
        payload: {
            map,
        },
    };
    const args = {
        __kind: 'V1',
        amount: 1,
        authorizationData,
    };
    // Transfer the NFT to the destination account, this should work since
    // the destination account is in the ruleset.
    const { tx: transferTx } = yield API.transfer(owner, owner.publicKey, token, mint, metadata, masterEdition, metadata, destinationToken, ruleSetPda, 1, handler, ownerTokenRecord, destinationTokenRecord, args);
    yield transferTx.assertSuccess(t);
    t.true((yield (0, spl_token_1.getAccount)(connection, token)).amount.toString() === '0', 'token amount after transfer equal to 0');
}));
