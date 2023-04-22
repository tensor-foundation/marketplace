"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Go back to anchor once they handle:
// Error: Raw transaction 4nZwiENzNwKLfCBtDirAr5xE71GUqsNKsUNafSUHiEUkWhqbVgEmximswnDFp4ZFFy5C4NXJ75qCKP6nnWBSmFey failed ({"err":{"InstructionError":[4,{"Custom":1}]}})
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramError = exports.LangErrorMessage = exports.SystemErrorMessage = exports.LangErrorCode = void 0;
const errors_1 = require("./generated/errors");
exports.LangErrorCode = {
    // Instructions.
    InstructionMissing: 100,
    InstructionFallbackNotFound: 101,
    InstructionDidNotDeserialize: 102,
    InstructionDidNotSerialize: 103,
    // IDL instructions.
    IdlInstructionStub: 120,
    IdlInstructionInvalidProgram: 121,
    // Constraints.
    ConstraintMut: 140,
    ConstraintHasOne: 141,
    ConstraintSigner: 142,
    ConstraintRaw: 143,
    ConstraintOwner: 144,
    ConstraintRentExempt: 145,
    ConstraintSeeds: 146,
    ConstraintExecutable: 147,
    ConstraintState: 148,
    ConstraintAssociated: 149,
    ConstraintAssociatedInit: 150,
    ConstraintClose: 151,
    ConstraintAddress: 152,
    // Accounts.
    AccountDiscriminatorAlreadySet: 160,
    AccountDiscriminatorNotFound: 161,
    AccountDiscriminatorMismatch: 162,
    AccountDidNotDeserialize: 163,
    AccountDidNotSerialize: 164,
    AccountNotEnoughKeys: 165,
    AccountNotMutable: 166,
    AccountNotProgramOwned: 167,
    InvalidProgramId: 168,
    InvalidProgramIdExecutable: 169,
    // State.
    StateInvalidAddress: 180,
    // Used for APIs that shouldn't be used anymore.
    Deprecated: 299,
};
exports.SystemErrorMessage = new Map([
    [1, 'Insufficient balance.'],
    [2, 'Invalid instruction data.'],
    [3, 'Invalid account data'],
    [4, 'Account data too small'],
    [5, 'Insufficient funds'],
    [6, 'Incorrect prgoram id'],
    [7, 'Missing required signature'],
    [8, 'Account already initialized'],
    [9, 'Attempt to operate on an account that was not yet initialized'],
    [10, 'Not enough account keys provided'],
    [11, 'Account borrow failed, already borrowed'],
    [12, 'Max seed length exceeded'],
    [13, 'Invalid seeds'],
    [14, 'Borsh IO Error'],
    [15, 'Account not rent exempt'],
]);
exports.LangErrorMessage = new Map([
    // Instructions.
    [exports.LangErrorCode.InstructionMissing, '8 byte instruction identifier not provided'],
    [exports.LangErrorCode.InstructionFallbackNotFound, 'Fallback functions are not supported'],
    [
        exports.LangErrorCode.InstructionDidNotDeserialize,
        'The program could not deserialize the given instruction',
    ],
    [
        exports.LangErrorCode.InstructionDidNotSerialize,
        'The program could not serialize the given instruction',
    ],
    // Idl instructions.
    [exports.LangErrorCode.IdlInstructionStub, 'The program was compiled without idl instructions'],
    [
        exports.LangErrorCode.IdlInstructionInvalidProgram,
        'The transaction was given an invalid program for the IDL instruction',
    ],
    // Constraints.
    [exports.LangErrorCode.ConstraintMut, 'A mut constraint was violated'],
    [exports.LangErrorCode.ConstraintHasOne, 'A has_one constraint was violated'],
    [exports.LangErrorCode.ConstraintSigner, 'A signer constraint was violated'],
    [exports.LangErrorCode.ConstraintRaw, 'A raw constraint was violated'],
    [exports.LangErrorCode.ConstraintOwner, 'An owner constraint was violated'],
    [exports.LangErrorCode.ConstraintRentExempt, 'A rent exempt constraint was violated'],
    [exports.LangErrorCode.ConstraintSeeds, 'A seeds constraint was violated'],
    [exports.LangErrorCode.ConstraintExecutable, 'An executable constraint was violated'],
    [exports.LangErrorCode.ConstraintState, 'A state constraint was violated'],
    [exports.LangErrorCode.ConstraintAssociated, 'An associated constraint was violated'],
    [exports.LangErrorCode.ConstraintAssociatedInit, 'An associated init constraint was violated'],
    [exports.LangErrorCode.ConstraintClose, 'A close constraint was violated'],
    [exports.LangErrorCode.ConstraintAddress, 'An address constraint was violated'],
    // Accounts.
    [
        exports.LangErrorCode.AccountDiscriminatorAlreadySet,
        'The account discriminator was already set on this account',
    ],
    [exports.LangErrorCode.AccountDiscriminatorNotFound, 'No 8 byte discriminator was found on the account'],
    [
        exports.LangErrorCode.AccountDiscriminatorMismatch,
        '8 byte discriminator did not match what was expected',
    ],
    [exports.LangErrorCode.AccountDidNotDeserialize, 'Failed to deserialize the account'],
    [exports.LangErrorCode.AccountDidNotSerialize, 'Failed to serialize the account'],
    [exports.LangErrorCode.AccountNotEnoughKeys, 'Not enough account keys given to the instruction'],
    [exports.LangErrorCode.AccountNotMutable, 'The given account is not mutable'],
    [exports.LangErrorCode.AccountNotProgramOwned, 'The given account is not owned by the executing program'],
    [exports.LangErrorCode.InvalidProgramId, 'Program ID was not as expected'],
    [exports.LangErrorCode.InvalidProgramIdExecutable, 'Program account is not executable'],
    // State.
    [exports.LangErrorCode.StateInvalidAddress, 'The given state account does not have the correct address'],
    // Misc.
    [exports.LangErrorCode.Deprecated, 'The API being used is deprecated and should no longer be used'],
]);
// An error from a user defined program.
class ProgramError {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(code, msg, ...params) {
        this.code = code;
        this.msg = msg;
    }
    static parse(err) {
        var _a, _b;
        let errorCode = null;
        if (err.InstructionError) {
            if ((_a = err.InstructionError[1]) === null || _a === void 0 ? void 0 : _a.Custom) {
                errorCode = err.InstructionError[1].Custom;
            }
        }
        if (errorCode == null) {
            // TODO: don't rely on the error string. web3.js should preserve the error
            //       code information instead of giving us an untyped string.
            const components = err.toString().split('custom program error: ');
            if (errorCode == null && components.length !== 2) {
                return null;
            }
            try {
                errorCode = parseInt(components[1]);
            }
            catch (parseErr) {
                return null;
            }
        }
        const errorMsg = ((_b = (0, errors_1.errorFromCode)(errorCode)) === null || _b === void 0 ? void 0 : _b.toString()) ||
            exports.LangErrorMessage.get(errorCode) ||
            exports.SystemErrorMessage.get(errorCode);
        if (errorMsg !== undefined) {
            return new ProgramError(errorCode, errorMsg, errorCode + ': ' + errorMsg);
        }
        // Unable to parse the error. Just return the untranslated error.
        return null;
    }
    toString() {
        return this.msg;
    }
}
exports.ProgramError = ProgramError;
