/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  isProgramError,
  type Address,
  type SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
  type SolanaError,
} from '@solana/web3.js';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';

/** ArithmeticError: arithmetic error */
export const TENSOR_MARKETPLACE_ERROR__ARITHMETIC_ERROR = 0x17d4; // 6100
/** ExpiryTooLarge: expiry too large */
export const TENSOR_MARKETPLACE_ERROR__EXPIRY_TOO_LARGE = 0x17d5; // 6101
/** BadOwner: bad owner */
export const TENSOR_MARKETPLACE_ERROR__BAD_OWNER = 0x17d6; // 6102
/** BadListState: bad list state */
export const TENSOR_MARKETPLACE_ERROR__BAD_LIST_STATE = 0x17d7; // 6103
/** BadRoyaltiesPct: royalties pct must be between 0 and 100 */
export const TENSOR_MARKETPLACE_ERROR__BAD_ROYALTIES_PCT = 0x17d8; // 6104
/** PriceMismatch: price mismatch */
export const TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH = 0x17d9; // 6105
/** CreatorMismatch: creator mismatch */
export const TENSOR_MARKETPLACE_ERROR__CREATOR_MISMATCH = 0x17da; // 6106
/** InsufficientBalance: insufficient balance */
export const TENSOR_MARKETPLACE_ERROR__INSUFFICIENT_BALANCE = 0x17db; // 6107
/** BidExpired: bid has expired */
export const TENSOR_MARKETPLACE_ERROR__BID_EXPIRED = 0x17dc; // 6108
/** TakerNotAllowed: taker not allowed */
export const TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED = 0x17dd; // 6109
/** BadBidField: cannot pass bid field */
export const TENSOR_MARKETPLACE_ERROR__BAD_BID_FIELD = 0x17de; // 6110
/** BidNotYetExpired: bid not yet expired */
export const TENSOR_MARKETPLACE_ERROR__BID_NOT_YET_EXPIRED = 0x17df; // 6111
/** BadMargin: bad margin */
export const TENSOR_MARKETPLACE_ERROR__BAD_MARGIN = 0x17e0; // 6112
/** WrongIxForBidTarget: wrong ix for bid target called */
export const TENSOR_MARKETPLACE_ERROR__WRONG_IX_FOR_BID_TARGET = 0x17e1; // 6113
/** WrongTargetId: wrong target id */
export const TENSOR_MARKETPLACE_ERROR__WRONG_TARGET_ID = 0x17e2; // 6114
/** MissingFvc: creator array missing first verified creator */
export const TENSOR_MARKETPLACE_ERROR__MISSING_FVC = 0x17e3; // 6115
/** MissingCollection: metadata missing collection */
export const TENSOR_MARKETPLACE_ERROR__MISSING_COLLECTION = 0x17e4; // 6116
/** CannotModifyTarget: cannot modify bid target, create a new bid */
export const TENSOR_MARKETPLACE_ERROR__CANNOT_MODIFY_TARGET = 0x17e5; // 6117
/** TargetIdMustEqualBidId: target id and bid id must be the same for single bids */
export const TENSOR_MARKETPLACE_ERROR__TARGET_ID_MUST_EQUAL_BID_ID = 0x17e6; // 6118
/** CurrencyNotYetEnabled: currency not yet enabled */
export const TENSOR_MARKETPLACE_ERROR__CURRENCY_NOT_YET_ENABLED = 0x17e7; // 6119
/** MakerBrokerNotYetEnabled: maker broker not yet enabled */
export const TENSOR_MARKETPLACE_ERROR__MAKER_BROKER_NOT_YET_ENABLED = 0x17e8; // 6120
/** OptionalRoyaltiesNotYetEnabled: optional royalties not yet enabled */
export const TENSOR_MARKETPLACE_ERROR__OPTIONAL_ROYALTIES_NOT_YET_ENABLED = 0x17e9; // 6121
/** WrongStateVersion: wrong state version */
export const TENSOR_MARKETPLACE_ERROR__WRONG_STATE_VERSION = 0x17ea; // 6122
/** WrongBidFieldId: wrong field id */
export const TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID = 0x17eb; // 6123
/** BrokerMismatch: broker mismatch */
export const TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH = 0x17ec; // 6124
/** AssetIdMismatch: asset id mismatch */
export const TENSOR_MARKETPLACE_ERROR__ASSET_ID_MISMATCH = 0x17ed; // 6125
/** ListingExpired: listing has expired */
export const TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED = 0x17ee; // 6126
/** ListingNotYetExpired: listing not yet expired */
export const TENSOR_MARKETPLACE_ERROR__LISTING_NOT_YET_EXPIRED = 0x17ef; // 6127
/** BadQuantity: bad quantity passed in */
export const TENSOR_MARKETPLACE_ERROR__BAD_QUANTITY = 0x17f0; // 6128
/** BidFullyFilled: bid fully filled */
export const TENSOR_MARKETPLACE_ERROR__BID_FULLY_FILLED = 0x17f1; // 6129
/** BadWhitelist: bad whitelist */
export const TENSOR_MARKETPLACE_ERROR__BAD_WHITELIST = 0x17f2; // 6130
/** ForbiddenCollection: forbidden collection */
export const TENSOR_MARKETPLACE_ERROR__FORBIDDEN_COLLECTION = 0x17f3; // 6131
/** BadCosigner: bad cosigner */
export const TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER = 0x17f4; // 6132
/** BadMintProof: bad mint proof */
export const TENSOR_MARKETPLACE_ERROR__BAD_MINT_PROOF = 0x17f5; // 6133
/** CurrencyMismatch: Currency mismatch */
export const TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH = 0x17f6; // 6134
/** BidBalanceNotEmptied: The bid balance was not emptied */
export const TENSOR_MARKETPLACE_ERROR__BID_BALANCE_NOT_EMPTIED = 0x17f7; // 6135
/** BadRentDest: Bad rent dest. */
export const TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST = 0x17f8; // 6136
/** CurrencyNotYetWhitelisted: currency not yet whitelisted */
export const TENSOR_MARKETPLACE_ERROR__CURRENCY_NOT_YET_WHITELISTED = 0x17f9; // 6137
/** MakerBrokerNotYetWhitelisted: maker broker not yet whitelisted */
export const TENSOR_MARKETPLACE_ERROR__MAKER_BROKER_NOT_YET_WHITELISTED = 0x17fa; // 6138
/** WrongTokenRecordDerivation: token record derivation is wrong */
export const TENSOR_MARKETPLACE_ERROR__WRONG_TOKEN_RECORD_DERIVATION = 0x17fb; // 6139
/** InvalidFeeAccount: invalid fee account */
export const TENSOR_MARKETPLACE_ERROR__INVALID_FEE_ACCOUNT = 0x17fc; // 6140
/** InsufficientRemainingAccounts: insufficient remaining accounts */
export const TENSOR_MARKETPLACE_ERROR__INSUFFICIENT_REMAINING_ACCOUNTS = 0x17fd; // 6141
/** MissingBroker: missing broker account */
export const TENSOR_MARKETPLACE_ERROR__MISSING_BROKER = 0x17fe; // 6142
/** MissingBrokerTokenAccount: missing broker token account */
export const TENSOR_MARKETPLACE_ERROR__MISSING_BROKER_TOKEN_ACCOUNT = 0x17ff; // 6143
/** InvalidTokenAccount: invalidtoken account */
export const TENSOR_MARKETPLACE_ERROR__INVALID_TOKEN_ACCOUNT = 0x1800; // 6144

export type TensorMarketplaceError =
  | typeof TENSOR_MARKETPLACE_ERROR__ARITHMETIC_ERROR
  | typeof TENSOR_MARKETPLACE_ERROR__ASSET_ID_MISMATCH
  | typeof TENSOR_MARKETPLACE_ERROR__BAD_BID_FIELD
  | typeof TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER
  | typeof TENSOR_MARKETPLACE_ERROR__BAD_LIST_STATE
  | typeof TENSOR_MARKETPLACE_ERROR__BAD_MARGIN
  | typeof TENSOR_MARKETPLACE_ERROR__BAD_MINT_PROOF
  | typeof TENSOR_MARKETPLACE_ERROR__BAD_OWNER
  | typeof TENSOR_MARKETPLACE_ERROR__BAD_QUANTITY
  | typeof TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST
  | typeof TENSOR_MARKETPLACE_ERROR__BAD_ROYALTIES_PCT
  | typeof TENSOR_MARKETPLACE_ERROR__BAD_WHITELIST
  | typeof TENSOR_MARKETPLACE_ERROR__BID_BALANCE_NOT_EMPTIED
  | typeof TENSOR_MARKETPLACE_ERROR__BID_EXPIRED
  | typeof TENSOR_MARKETPLACE_ERROR__BID_FULLY_FILLED
  | typeof TENSOR_MARKETPLACE_ERROR__BID_NOT_YET_EXPIRED
  | typeof TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH
  | typeof TENSOR_MARKETPLACE_ERROR__CANNOT_MODIFY_TARGET
  | typeof TENSOR_MARKETPLACE_ERROR__CREATOR_MISMATCH
  | typeof TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH
  | typeof TENSOR_MARKETPLACE_ERROR__CURRENCY_NOT_YET_ENABLED
  | typeof TENSOR_MARKETPLACE_ERROR__CURRENCY_NOT_YET_WHITELISTED
  | typeof TENSOR_MARKETPLACE_ERROR__EXPIRY_TOO_LARGE
  | typeof TENSOR_MARKETPLACE_ERROR__FORBIDDEN_COLLECTION
  | typeof TENSOR_MARKETPLACE_ERROR__INSUFFICIENT_BALANCE
  | typeof TENSOR_MARKETPLACE_ERROR__INSUFFICIENT_REMAINING_ACCOUNTS
  | typeof TENSOR_MARKETPLACE_ERROR__INVALID_FEE_ACCOUNT
  | typeof TENSOR_MARKETPLACE_ERROR__INVALID_TOKEN_ACCOUNT
  | typeof TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED
  | typeof TENSOR_MARKETPLACE_ERROR__LISTING_NOT_YET_EXPIRED
  | typeof TENSOR_MARKETPLACE_ERROR__MAKER_BROKER_NOT_YET_ENABLED
  | typeof TENSOR_MARKETPLACE_ERROR__MAKER_BROKER_NOT_YET_WHITELISTED
  | typeof TENSOR_MARKETPLACE_ERROR__MISSING_BROKER
  | typeof TENSOR_MARKETPLACE_ERROR__MISSING_BROKER_TOKEN_ACCOUNT
  | typeof TENSOR_MARKETPLACE_ERROR__MISSING_COLLECTION
  | typeof TENSOR_MARKETPLACE_ERROR__MISSING_FVC
  | typeof TENSOR_MARKETPLACE_ERROR__OPTIONAL_ROYALTIES_NOT_YET_ENABLED
  | typeof TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH
  | typeof TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED
  | typeof TENSOR_MARKETPLACE_ERROR__TARGET_ID_MUST_EQUAL_BID_ID
  | typeof TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID
  | typeof TENSOR_MARKETPLACE_ERROR__WRONG_IX_FOR_BID_TARGET
  | typeof TENSOR_MARKETPLACE_ERROR__WRONG_STATE_VERSION
  | typeof TENSOR_MARKETPLACE_ERROR__WRONG_TARGET_ID
  | typeof TENSOR_MARKETPLACE_ERROR__WRONG_TOKEN_RECORD_DERIVATION;

let tensorMarketplaceErrorMessages:
  | Record<TensorMarketplaceError, string>
  | undefined;
if (process.env.NODE_ENV !== 'production') {
  tensorMarketplaceErrorMessages = {
    [TENSOR_MARKETPLACE_ERROR__ARITHMETIC_ERROR]: `arithmetic error`,
    [TENSOR_MARKETPLACE_ERROR__ASSET_ID_MISMATCH]: `asset id mismatch`,
    [TENSOR_MARKETPLACE_ERROR__BAD_BID_FIELD]: `cannot pass bid field`,
    [TENSOR_MARKETPLACE_ERROR__BAD_COSIGNER]: `bad cosigner`,
    [TENSOR_MARKETPLACE_ERROR__BAD_LIST_STATE]: `bad list state`,
    [TENSOR_MARKETPLACE_ERROR__BAD_MARGIN]: `bad margin`,
    [TENSOR_MARKETPLACE_ERROR__BAD_MINT_PROOF]: `bad mint proof`,
    [TENSOR_MARKETPLACE_ERROR__BAD_OWNER]: `bad owner`,
    [TENSOR_MARKETPLACE_ERROR__BAD_QUANTITY]: `bad quantity passed in`,
    [TENSOR_MARKETPLACE_ERROR__BAD_RENT_DEST]: `Bad rent dest.`,
    [TENSOR_MARKETPLACE_ERROR__BAD_ROYALTIES_PCT]: `royalties pct must be between 0 and 100`,
    [TENSOR_MARKETPLACE_ERROR__BAD_WHITELIST]: `bad whitelist`,
    [TENSOR_MARKETPLACE_ERROR__BID_BALANCE_NOT_EMPTIED]: `The bid balance was not emptied`,
    [TENSOR_MARKETPLACE_ERROR__BID_EXPIRED]: `bid has expired`,
    [TENSOR_MARKETPLACE_ERROR__BID_FULLY_FILLED]: `bid fully filled`,
    [TENSOR_MARKETPLACE_ERROR__BID_NOT_YET_EXPIRED]: `bid not yet expired`,
    [TENSOR_MARKETPLACE_ERROR__BROKER_MISMATCH]: `broker mismatch`,
    [TENSOR_MARKETPLACE_ERROR__CANNOT_MODIFY_TARGET]: `cannot modify bid target, create a new bid`,
    [TENSOR_MARKETPLACE_ERROR__CREATOR_MISMATCH]: `creator mismatch`,
    [TENSOR_MARKETPLACE_ERROR__CURRENCY_MISMATCH]: `Currency mismatch`,
    [TENSOR_MARKETPLACE_ERROR__CURRENCY_NOT_YET_ENABLED]: `currency not yet enabled`,
    [TENSOR_MARKETPLACE_ERROR__CURRENCY_NOT_YET_WHITELISTED]: `currency not yet whitelisted`,
    [TENSOR_MARKETPLACE_ERROR__EXPIRY_TOO_LARGE]: `expiry too large`,
    [TENSOR_MARKETPLACE_ERROR__FORBIDDEN_COLLECTION]: `forbidden collection`,
    [TENSOR_MARKETPLACE_ERROR__INSUFFICIENT_BALANCE]: `insufficient balance`,
    [TENSOR_MARKETPLACE_ERROR__INSUFFICIENT_REMAINING_ACCOUNTS]: `insufficient remaining accounts`,
    [TENSOR_MARKETPLACE_ERROR__INVALID_FEE_ACCOUNT]: `invalid fee account`,
    [TENSOR_MARKETPLACE_ERROR__INVALID_TOKEN_ACCOUNT]: `invalidtoken account`,
    [TENSOR_MARKETPLACE_ERROR__LISTING_EXPIRED]: `listing has expired`,
    [TENSOR_MARKETPLACE_ERROR__LISTING_NOT_YET_EXPIRED]: `listing not yet expired`,
    [TENSOR_MARKETPLACE_ERROR__MAKER_BROKER_NOT_YET_ENABLED]: `maker broker not yet enabled`,
    [TENSOR_MARKETPLACE_ERROR__MAKER_BROKER_NOT_YET_WHITELISTED]: `maker broker not yet whitelisted`,
    [TENSOR_MARKETPLACE_ERROR__MISSING_BROKER]: `missing broker account`,
    [TENSOR_MARKETPLACE_ERROR__MISSING_BROKER_TOKEN_ACCOUNT]: `missing broker token account`,
    [TENSOR_MARKETPLACE_ERROR__MISSING_COLLECTION]: `metadata missing collection`,
    [TENSOR_MARKETPLACE_ERROR__MISSING_FVC]: `creator array missing first verified creator`,
    [TENSOR_MARKETPLACE_ERROR__OPTIONAL_ROYALTIES_NOT_YET_ENABLED]: `optional royalties not yet enabled`,
    [TENSOR_MARKETPLACE_ERROR__PRICE_MISMATCH]: `price mismatch`,
    [TENSOR_MARKETPLACE_ERROR__TAKER_NOT_ALLOWED]: `taker not allowed`,
    [TENSOR_MARKETPLACE_ERROR__TARGET_ID_MUST_EQUAL_BID_ID]: `target id and bid id must be the same for single bids`,
    [TENSOR_MARKETPLACE_ERROR__WRONG_BID_FIELD_ID]: `wrong field id`,
    [TENSOR_MARKETPLACE_ERROR__WRONG_IX_FOR_BID_TARGET]: `wrong ix for bid target called`,
    [TENSOR_MARKETPLACE_ERROR__WRONG_STATE_VERSION]: `wrong state version`,
    [TENSOR_MARKETPLACE_ERROR__WRONG_TARGET_ID]: `wrong target id`,
    [TENSOR_MARKETPLACE_ERROR__WRONG_TOKEN_RECORD_DERIVATION]: `token record derivation is wrong`,
  };
}

export function getTensorMarketplaceErrorMessage(
  code: TensorMarketplaceError
): string {
  if (process.env.NODE_ENV !== 'production') {
    return (
      tensorMarketplaceErrorMessages as Record<TensorMarketplaceError, string>
    )[code];
  }

  return 'Error message not available in production bundles.';
}

export function isTensorMarketplaceError<
  TProgramErrorCode extends TensorMarketplaceError,
>(
  error: unknown,
  transactionMessage: {
    instructions: Record<number, { programAddress: Address }>;
  },
  code?: TProgramErrorCode
): error is SolanaError<typeof SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM> &
  Readonly<{ context: Readonly<{ code: TProgramErrorCode }> }> {
  return isProgramError<TProgramErrorCode>(
    error,
    transactionMessage,
    TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    code
  );
}
