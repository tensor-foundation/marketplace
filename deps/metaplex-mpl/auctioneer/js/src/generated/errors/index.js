"use strict";
/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorFromName = exports.errorFromCode = exports.CannotCancelHighestBidError = exports.BelowBidIncrementError = exports.BelowReservePriceError = exports.NotHighestBidderError = exports.SignerNotAuthError = exports.BidTooLowError = exports.AuctionActiveError = exports.AuctionEndedError = exports.AuctionNotStartedError = exports.BumpSeedNotInHashMapError = void 0;
const createErrorFromCodeLookup = new Map();
const createErrorFromNameLookup = new Map();
/**
 * BumpSeedNotInHashMap: 'Bump seed not in hash map'
 *
 * @category Errors
 * @category generated
 */
class BumpSeedNotInHashMapError extends Error {
    constructor() {
        super('Bump seed not in hash map');
        this.code = 0x1770;
        this.name = 'BumpSeedNotInHashMap';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, BumpSeedNotInHashMapError);
        }
    }
}
exports.BumpSeedNotInHashMapError = BumpSeedNotInHashMapError;
createErrorFromCodeLookup.set(0x1770, () => new BumpSeedNotInHashMapError());
createErrorFromNameLookup.set('BumpSeedNotInHashMap', () => new BumpSeedNotInHashMapError());
/**
 * AuctionNotStarted: 'Auction has not started yet'
 *
 * @category Errors
 * @category generated
 */
class AuctionNotStartedError extends Error {
    constructor() {
        super('Auction has not started yet');
        this.code = 0x1771;
        this.name = 'AuctionNotStarted';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, AuctionNotStartedError);
        }
    }
}
exports.AuctionNotStartedError = AuctionNotStartedError;
createErrorFromCodeLookup.set(0x1771, () => new AuctionNotStartedError());
createErrorFromNameLookup.set('AuctionNotStarted', () => new AuctionNotStartedError());
/**
 * AuctionEnded: 'Auction has ended'
 *
 * @category Errors
 * @category generated
 */
class AuctionEndedError extends Error {
    constructor() {
        super('Auction has ended');
        this.code = 0x1772;
        this.name = 'AuctionEnded';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, AuctionEndedError);
        }
    }
}
exports.AuctionEndedError = AuctionEndedError;
createErrorFromCodeLookup.set(0x1772, () => new AuctionEndedError());
createErrorFromNameLookup.set('AuctionEnded', () => new AuctionEndedError());
/**
 * AuctionActive: 'Auction has not ended yet'
 *
 * @category Errors
 * @category generated
 */
class AuctionActiveError extends Error {
    constructor() {
        super('Auction has not ended yet');
        this.code = 0x1773;
        this.name = 'AuctionActive';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, AuctionActiveError);
        }
    }
}
exports.AuctionActiveError = AuctionActiveError;
createErrorFromCodeLookup.set(0x1773, () => new AuctionActiveError());
createErrorFromNameLookup.set('AuctionActive', () => new AuctionActiveError());
/**
 * BidTooLow: 'The bid was lower than the highest bid'
 *
 * @category Errors
 * @category generated
 */
class BidTooLowError extends Error {
    constructor() {
        super('The bid was lower than the highest bid');
        this.code = 0x1774;
        this.name = 'BidTooLow';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, BidTooLowError);
        }
    }
}
exports.BidTooLowError = BidTooLowError;
createErrorFromCodeLookup.set(0x1774, () => new BidTooLowError());
createErrorFromNameLookup.set('BidTooLow', () => new BidTooLowError());
/**
 * SignerNotAuth: 'The signer must be the Auction House authority'
 *
 * @category Errors
 * @category generated
 */
class SignerNotAuthError extends Error {
    constructor() {
        super('The signer must be the Auction House authority');
        this.code = 0x1775;
        this.name = 'SignerNotAuth';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, SignerNotAuthError);
        }
    }
}
exports.SignerNotAuthError = SignerNotAuthError;
createErrorFromCodeLookup.set(0x1775, () => new SignerNotAuthError());
createErrorFromNameLookup.set('SignerNotAuth', () => new SignerNotAuthError());
/**
 * NotHighestBidder: 'Execute Sale must be run on the highest bidder'
 *
 * @category Errors
 * @category generated
 */
class NotHighestBidderError extends Error {
    constructor() {
        super('Execute Sale must be run on the highest bidder');
        this.code = 0x1776;
        this.name = 'NotHighestBidder';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, NotHighestBidderError);
        }
    }
}
exports.NotHighestBidderError = NotHighestBidderError;
createErrorFromCodeLookup.set(0x1776, () => new NotHighestBidderError());
createErrorFromNameLookup.set('NotHighestBidder', () => new NotHighestBidderError());
/**
 * BelowReservePrice: 'The bid price must be greater than the reserve price'
 *
 * @category Errors
 * @category generated
 */
class BelowReservePriceError extends Error {
    constructor() {
        super('The bid price must be greater than the reserve price');
        this.code = 0x1777;
        this.name = 'BelowReservePrice';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, BelowReservePriceError);
        }
    }
}
exports.BelowReservePriceError = BelowReservePriceError;
createErrorFromCodeLookup.set(0x1777, () => new BelowReservePriceError());
createErrorFromNameLookup.set('BelowReservePrice', () => new BelowReservePriceError());
/**
 * BelowBidIncrement: 'The bid must match the highest bid plus the minimum bid increment'
 *
 * @category Errors
 * @category generated
 */
class BelowBidIncrementError extends Error {
    constructor() {
        super('The bid must match the highest bid plus the minimum bid increment');
        this.code = 0x1778;
        this.name = 'BelowBidIncrement';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, BelowBidIncrementError);
        }
    }
}
exports.BelowBidIncrementError = BelowBidIncrementError;
createErrorFromCodeLookup.set(0x1778, () => new BelowBidIncrementError());
createErrorFromNameLookup.set('BelowBidIncrement', () => new BelowBidIncrementError());
/**
 * CannotCancelHighestBid: 'The highest bidder is not allowed to cancel'
 *
 * @category Errors
 * @category generated
 */
class CannotCancelHighestBidError extends Error {
    constructor() {
        super('The highest bidder is not allowed to cancel');
        this.code = 0x1779;
        this.name = 'CannotCancelHighestBid';
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, CannotCancelHighestBidError);
        }
    }
}
exports.CannotCancelHighestBidError = CannotCancelHighestBidError;
createErrorFromCodeLookup.set(0x1779, () => new CannotCancelHighestBidError());
createErrorFromNameLookup.set('CannotCancelHighestBid', () => new CannotCancelHighestBidError());
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
