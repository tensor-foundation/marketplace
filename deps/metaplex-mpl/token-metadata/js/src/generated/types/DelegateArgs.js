"use strict";
/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.delegateArgsBeet = exports.isDelegateArgsProgrammableConfigV1 = exports.isDelegateArgsLockedTransferV1 = exports.isDelegateArgsStandardV1 = exports.isDelegateArgsStakingV1 = exports.isDelegateArgsUtilityV1 = exports.isDelegateArgsUpdateV1 = exports.isDelegateArgsTransferV1 = exports.isDelegateArgsSaleV1 = exports.isDelegateArgsCollectionV1 = void 0;
const beet = __importStar(require("@metaplex-foundation/beet"));
const beetSolana = __importStar(require("@metaplex-foundation/beet-solana"));
const AuthorizationData_1 = require("./AuthorizationData");
const isDelegateArgsCollectionV1 = (x) => x.__kind === 'CollectionV1';
exports.isDelegateArgsCollectionV1 = isDelegateArgsCollectionV1;
const isDelegateArgsSaleV1 = (x) => x.__kind === 'SaleV1';
exports.isDelegateArgsSaleV1 = isDelegateArgsSaleV1;
const isDelegateArgsTransferV1 = (x) => x.__kind === 'TransferV1';
exports.isDelegateArgsTransferV1 = isDelegateArgsTransferV1;
const isDelegateArgsUpdateV1 = (x) => x.__kind === 'UpdateV1';
exports.isDelegateArgsUpdateV1 = isDelegateArgsUpdateV1;
const isDelegateArgsUtilityV1 = (x) => x.__kind === 'UtilityV1';
exports.isDelegateArgsUtilityV1 = isDelegateArgsUtilityV1;
const isDelegateArgsStakingV1 = (x) => x.__kind === 'StakingV1';
exports.isDelegateArgsStakingV1 = isDelegateArgsStakingV1;
const isDelegateArgsStandardV1 = (x) => x.__kind === 'StandardV1';
exports.isDelegateArgsStandardV1 = isDelegateArgsStandardV1;
const isDelegateArgsLockedTransferV1 = (x) => x.__kind === 'LockedTransferV1';
exports.isDelegateArgsLockedTransferV1 = isDelegateArgsLockedTransferV1;
const isDelegateArgsProgrammableConfigV1 = (x) => x.__kind === 'ProgrammableConfigV1';
exports.isDelegateArgsProgrammableConfigV1 = isDelegateArgsProgrammableConfigV1;
/**
 * @category userTypes
 * @category generated
 */
exports.delegateArgsBeet = beet.dataEnum([
    [
        'CollectionV1',
        new beet.FixableBeetArgsStruct([['authorizationData', beet.coption(AuthorizationData_1.authorizationDataBeet)]], 'DelegateArgsRecord["CollectionV1"]'),
    ],
    [
        'SaleV1',
        new beet.FixableBeetArgsStruct([
            ['amount', beet.u64],
            ['authorizationData', beet.coption(AuthorizationData_1.authorizationDataBeet)],
        ], 'DelegateArgsRecord["SaleV1"]'),
    ],
    [
        'TransferV1',
        new beet.FixableBeetArgsStruct([
            ['amount', beet.u64],
            ['authorizationData', beet.coption(AuthorizationData_1.authorizationDataBeet)],
        ], 'DelegateArgsRecord["TransferV1"]'),
    ],
    [
        'UpdateV1',
        new beet.FixableBeetArgsStruct([['authorizationData', beet.coption(AuthorizationData_1.authorizationDataBeet)]], 'DelegateArgsRecord["UpdateV1"]'),
    ],
    [
        'UtilityV1',
        new beet.FixableBeetArgsStruct([
            ['amount', beet.u64],
            ['authorizationData', beet.coption(AuthorizationData_1.authorizationDataBeet)],
        ], 'DelegateArgsRecord["UtilityV1"]'),
    ],
    [
        'StakingV1',
        new beet.FixableBeetArgsStruct([
            ['amount', beet.u64],
            ['authorizationData', beet.coption(AuthorizationData_1.authorizationDataBeet)],
        ], 'DelegateArgsRecord["StakingV1"]'),
    ],
    [
        'StandardV1',
        new beet.BeetArgsStruct([['amount', beet.u64]], 'DelegateArgsRecord["StandardV1"]'),
    ],
    [
        'LockedTransferV1',
        new beet.FixableBeetArgsStruct([
            ['amount', beet.u64],
            ['lockedAddress', beetSolana.publicKey],
            ['authorizationData', beet.coption(AuthorizationData_1.authorizationDataBeet)],
        ], 'DelegateArgsRecord["LockedTransferV1"]'),
    ],
    [
        'ProgrammableConfigV1',
        new beet.FixableBeetArgsStruct([['authorizationData', beet.coption(AuthorizationData_1.authorizationDataBeet)]], 'DelegateArgsRecord["ProgrammableConfigV1"]'),
    ],
]);
