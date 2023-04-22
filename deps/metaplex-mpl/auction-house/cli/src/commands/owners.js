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
exports.delay = exports.getOwnersByMintAddresses = void 0;
const constants_1 = require("../helpers/constants");
const loglevel_1 = __importDefault(require("loglevel"));
function getOwnersByMintAddresses(addresses, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const owners = [];
        loglevel_1.default.debug("Recuperation of the owners' addresses");
        for (const address of addresses) {
            owners.push(yield getOwnerOfTokenAddress(address, connection));
            yield delay(500);
        }
        return owners;
    });
}
exports.getOwnersByMintAddresses = getOwnersByMintAddresses;
function getOwnerOfTokenAddress(address, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const programAccountsConfig = {
                filters: [
                    {
                        dataSize: 165,
                    },
                    {
                        memcmp: {
                            offset: 0,
                            bytes: address,
                        },
                    },
                ],
            };
            const results = yield connection.getParsedProgramAccounts(constants_1.TOKEN_PROGRAM_ID, programAccountsConfig);
            const tokenOwner = results.find(token => token.account.data.parsed.info.tokenAmount.amount == 1);
            const ownerAddress = tokenOwner.account.data.parsed.info.owner;
            return ownerAddress;
        }
        catch (error) {
            console.log(`Unable to get owner of: ${address}`);
        }
    });
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
