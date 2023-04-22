"use strict";
/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorFromName = exports.errorFromCode = exports.BumpSeedNotInHashMapError = exports.MustHaveSupplyOneError = exports.EntangledPairExistsError = exports.InvalidMintError = exports.InvalidTokenAmountError = exports.EditionDoesntExistError = exports.MetadataDoesntExistError = exports.DerivedKeyInvalidError = exports.NumericalOverflowError = exports.NotRentExemptError = exports.StatementFalseError = exports.PublicKeysShouldBeUniqueError = exports.IncorrectOwnerError = exports.UninitializedAccountError = exports.InvalidMintAuthorityError = exports.PublicKeyMismatchError = void 0;
const createErrorFromCodeLookup = new Map();
const createErrorFromNameLookup = new Map();
/**
 * PublicKeyMismatch: 'PublicKeyMismatch'
 *
 * @category Errors
 * @category generated
 */
class PublicKeyMismatchError extends Error {
    constructor() {
        super('PublicKeyMismatch');
        this.code = 0x1770;
        this.name = 'PublicKeyMismatch';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, PublicKeyMismatchError);
        }
    }
}
exports.PublicKeyMismatchError = PublicKeyMismatchError;
createErrorFromCodeLookup.set(0x1770, () => new PublicKeyMismatchError());
createErrorFromNameLookup.set('PublicKeyMismatch', () => new PublicKeyMismatchError());
/**
 * InvalidMintAuthority: 'InvalidMintAuthority'
 *
 * @category Errors
 * @category generated
 */
class InvalidMintAuthorityError extends Error {
    constructor() {
        super('InvalidMintAuthority');
        this.code = 0x1771;
        this.name = 'InvalidMintAuthority';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidMintAuthorityError);
        }
    }
}
exports.InvalidMintAuthorityError = InvalidMintAuthorityError;
createErrorFromCodeLookup.set(0x1771, () => new InvalidMintAuthorityError());
createErrorFromNameLookup.set('InvalidMintAuthority', () => new InvalidMintAuthorityError());
/**
 * UninitializedAccount: 'UninitializedAccount'
 *
 * @category Errors
 * @category generated
 */
class UninitializedAccountError extends Error {
    constructor() {
        super('UninitializedAccount');
        this.code = 0x1772;
        this.name = 'UninitializedAccount';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, UninitializedAccountError);
        }
    }
}
exports.UninitializedAccountError = UninitializedAccountError;
createErrorFromCodeLookup.set(0x1772, () => new UninitializedAccountError());
createErrorFromNameLookup.set('UninitializedAccount', () => new UninitializedAccountError());
/**
 * IncorrectOwner: 'IncorrectOwner'
 *
 * @category Errors
 * @category generated
 */
class IncorrectOwnerError extends Error {
    constructor() {
        super('IncorrectOwner');
        this.code = 0x1773;
        this.name = 'IncorrectOwner';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, IncorrectOwnerError);
        }
    }
}
exports.IncorrectOwnerError = IncorrectOwnerError;
createErrorFromCodeLookup.set(0x1773, () => new IncorrectOwnerError());
createErrorFromNameLookup.set('IncorrectOwner', () => new IncorrectOwnerError());
/**
 * PublicKeysShouldBeUnique: 'PublicKeysShouldBeUnique'
 *
 * @category Errors
 * @category generated
 */
class PublicKeysShouldBeUniqueError extends Error {
    constructor() {
        super('PublicKeysShouldBeUnique');
        this.code = 0x1774;
        this.name = 'PublicKeysShouldBeUnique';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, PublicKeysShouldBeUniqueError);
        }
    }
}
exports.PublicKeysShouldBeUniqueError = PublicKeysShouldBeUniqueError;
createErrorFromCodeLookup.set(0x1774, () => new PublicKeysShouldBeUniqueError());
createErrorFromNameLookup.set('PublicKeysShouldBeUnique', () => new PublicKeysShouldBeUniqueError());
/**
 * StatementFalse: 'StatementFalse'
 *
 * @category Errors
 * @category generated
 */
class StatementFalseError extends Error {
    constructor() {
        super('StatementFalse');
        this.code = 0x1775;
        this.name = 'StatementFalse';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, StatementFalseError);
        }
    }
}
exports.StatementFalseError = StatementFalseError;
createErrorFromCodeLookup.set(0x1775, () => new StatementFalseError());
createErrorFromNameLookup.set('StatementFalse', () => new StatementFalseError());
/**
 * NotRentExempt: 'NotRentExempt'
 *
 * @category Errors
 * @category generated
 */
class NotRentExemptError extends Error {
    constructor() {
        super('NotRentExempt');
        this.code = 0x1776;
        this.name = 'NotRentExempt';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, NotRentExemptError);
        }
    }
}
exports.NotRentExemptError = NotRentExemptError;
createErrorFromCodeLookup.set(0x1776, () => new NotRentExemptError());
createErrorFromNameLookup.set('NotRentExempt', () => new NotRentExemptError());
/**
 * NumericalOverflow: 'NumericalOverflow'
 *
 * @category Errors
 * @category generated
 */
class NumericalOverflowError extends Error {
    constructor() {
        super('NumericalOverflow');
        this.code = 0x1777;
        this.name = 'NumericalOverflow';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, NumericalOverflowError);
        }
    }
}
exports.NumericalOverflowError = NumericalOverflowError;
createErrorFromCodeLookup.set(0x1777, () => new NumericalOverflowError());
createErrorFromNameLookup.set('NumericalOverflow', () => new NumericalOverflowError());
/**
 * DerivedKeyInvalid: 'Derived key invalid'
 *
 * @category Errors
 * @category generated
 */
class DerivedKeyInvalidError extends Error {
    constructor() {
        super('Derived key invalid');
        this.code = 0x1778;
        this.name = 'DerivedKeyInvalid';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, DerivedKeyInvalidError);
        }
    }
}
exports.DerivedKeyInvalidError = DerivedKeyInvalidError;
createErrorFromCodeLookup.set(0x1778, () => new DerivedKeyInvalidError());
createErrorFromNameLookup.set('DerivedKeyInvalid', () => new DerivedKeyInvalidError());
/**
 * MetadataDoesntExist: 'Metadata doesn't exist'
 *
 * @category Errors
 * @category generated
 */
class MetadataDoesntExistError extends Error {
    constructor() {
        super("Metadata doesn't exist");
        this.code = 0x1779;
        this.name = 'MetadataDoesntExist';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, MetadataDoesntExistError);
        }
    }
}
exports.MetadataDoesntExistError = MetadataDoesntExistError;
createErrorFromCodeLookup.set(0x1779, () => new MetadataDoesntExistError());
createErrorFromNameLookup.set('MetadataDoesntExist', () => new MetadataDoesntExistError());
/**
 * EditionDoesntExist: 'Edition doesn't exist'
 *
 * @category Errors
 * @category generated
 */
class EditionDoesntExistError extends Error {
    constructor() {
        super("Edition doesn't exist");
        this.code = 0x177a;
        this.name = 'EditionDoesntExist';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, EditionDoesntExistError);
        }
    }
}
exports.EditionDoesntExistError = EditionDoesntExistError;
createErrorFromCodeLookup.set(0x177a, () => new EditionDoesntExistError());
createErrorFromNameLookup.set('EditionDoesntExist', () => new EditionDoesntExistError());
/**
 * InvalidTokenAmount: 'Invalid token amount'
 *
 * @category Errors
 * @category generated
 */
class InvalidTokenAmountError extends Error {
    constructor() {
        super('Invalid token amount');
        this.code = 0x177b;
        this.name = 'InvalidTokenAmount';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidTokenAmountError);
        }
    }
}
exports.InvalidTokenAmountError = InvalidTokenAmountError;
createErrorFromCodeLookup.set(0x177b, () => new InvalidTokenAmountError());
createErrorFromNameLookup.set('InvalidTokenAmount', () => new InvalidTokenAmountError());
/**
 * InvalidMint: 'This token is not a valid mint for this entangled pair'
 *
 * @category Errors
 * @category generated
 */
class InvalidMintError extends Error {
    constructor() {
        super('This token is not a valid mint for this entangled pair');
        this.code = 0x177c;
        this.name = 'InvalidMint';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, InvalidMintError);
        }
    }
}
exports.InvalidMintError = InvalidMintError;
createErrorFromCodeLookup.set(0x177c, () => new InvalidMintError());
createErrorFromNameLookup.set('InvalidMint', () => new InvalidMintError());
/**
 * EntangledPairExists: 'This pair already exists as it's reverse'
 *
 * @category Errors
 * @category generated
 */
class EntangledPairExistsError extends Error {
    constructor() {
        super("This pair already exists as it's reverse");
        this.code = 0x177d;
        this.name = 'EntangledPairExists';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, EntangledPairExistsError);
        }
    }
}
exports.EntangledPairExistsError = EntangledPairExistsError;
createErrorFromCodeLookup.set(0x177d, () => new EntangledPairExistsError());
createErrorFromNameLookup.set('EntangledPairExists', () => new EntangledPairExistsError());
/**
 * MustHaveSupplyOne: 'Must have supply one!'
 *
 * @category Errors
 * @category generated
 */
class MustHaveSupplyOneError extends Error {
    constructor() {
        super('Must have supply one!');
        this.code = 0x177e;
        this.name = 'MustHaveSupplyOne';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, MustHaveSupplyOneError);
        }
    }
}
exports.MustHaveSupplyOneError = MustHaveSupplyOneError;
createErrorFromCodeLookup.set(0x177e, () => new MustHaveSupplyOneError());
createErrorFromNameLookup.set('MustHaveSupplyOne', () => new MustHaveSupplyOneError());
/**
 * BumpSeedNotInHashMap: 'Bump seed not in hash map'
 *
 * @category Errors
 * @category generated
 */
class BumpSeedNotInHashMapError extends Error {
    constructor() {
        super('Bump seed not in hash map');
        this.code = 0x177f;
        this.name = 'BumpSeedNotInHashMap';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, BumpSeedNotInHashMapError);
        }
    }
}
exports.BumpSeedNotInHashMapError = BumpSeedNotInHashMapError;
createErrorFromCodeLookup.set(0x177f, () => new BumpSeedNotInHashMapError());
createErrorFromNameLookup.set('BumpSeedNotInHashMap', () => new BumpSeedNotInHashMapError());
/**
 * Attempts to resolve a custom program error from the provided error code.
 * @category Errors
 * @category generated
 */
function errorFromCode(code) {
    const createError = createErrorFromCodeLookup.get(code);
    return createError != null ? createError() : null;
}
exports.errorFromCode = errorFromCode;
/**
 * Attempts to resolve a custom program error from the provided error name, i.e. 'Unauthorized'.
 * @category Errors
 * @category generated
 */
function errorFromName(name) {
    const createError = createErrorFromNameLookup.get(name);
    return createError != null ? createError() : null;
}
exports.errorFromName = errorFromName;
