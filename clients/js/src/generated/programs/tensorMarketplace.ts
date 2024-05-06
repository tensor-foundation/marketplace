/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Address } from '@solana/addresses';
import { Program, ProgramWithErrors } from '@solana/programs';
import {
  TensorMarketplaceProgramError,
  TensorMarketplaceProgramErrorCode,
  getTensorMarketplaceProgramErrorFromCode,
} from '../errors';
import {
  ParsedBidInstruction,
  ParsedBuyCompressedInstruction,
  ParsedBuyCoreInstruction,
  ParsedBuyLegacyInstruction,
  ParsedBuySplInstruction,
  ParsedBuyT22Instruction,
  ParsedBuyWnsInstruction,
  ParsedCancelBidInstruction,
  ParsedCloseExpiredBidCompressedInstruction,
  ParsedCloseExpiredListingCompressedInstruction,
  ParsedCloseExpiredListingCoreInstruction,
  ParsedCloseExpiredListingLegacyInstruction,
  ParsedCloseExpiredListingT22Instruction,
  ParsedCloseExpiredListingWnsInstruction,
  ParsedDelistCompressedInstruction,
  ParsedDelistCoreInstruction,
  ParsedDelistLegacyInstruction,
  ParsedDelistT22Instruction,
  ParsedDelistWnsInstruction,
  ParsedEditInstruction,
  ParsedListCompressedInstruction,
  ParsedListCoreInstruction,
  ParsedListLegacyInstruction,
  ParsedListT22Instruction,
  ParsedListWnsInstruction,
  ParsedTakeBidCompressedFullMetaInstruction,
  ParsedTakeBidCompressedMetaHashInstruction,
  ParsedTakeBidCoreInstruction,
  ParsedTakeBidLegacyInstruction,
  ParsedTakeBidT22Instruction,
  ParsedTakeBidWnsInstruction,
  ParsedTcompNoopInstruction,
  ParsedWithdrawFeesInstruction,
} from '../instructions';
import { memcmp } from '../shared';

export const TENSOR_MARKETPLACE_PROGRAM_ADDRESS =
  'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;

export type TensorMarketplaceProgram =
  Program<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'> &
    ProgramWithErrors<
      TensorMarketplaceProgramErrorCode,
      TensorMarketplaceProgramError
    >;

export function getTensorMarketplaceProgram(): TensorMarketplaceProgram {
  return {
    name: 'tensorMarketplace',
    address: TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
    getErrorFromCode(code: TensorMarketplaceProgramErrorCode, cause?: Error) {
      return getTensorMarketplaceProgramErrorFromCode(code, cause);
    },
  };
}

export enum TensorMarketplaceAccount {
  ListState,
  BidState,
}

export function identifyTensorMarketplaceAccount(
  account: { data: Uint8Array } | Uint8Array
): TensorMarketplaceAccount {
  const data = account instanceof Uint8Array ? account : account.data;
  if (memcmp(data, new Uint8Array([78, 242, 89, 138, 161, 221, 176, 75]), 0)) {
    return TensorMarketplaceAccount.ListState;
  }
  if (memcmp(data, new Uint8Array([155, 197, 5, 97, 189, 60, 8, 183]), 0)) {
    return TensorMarketplaceAccount.BidState;
  }
  throw new Error(
    'The provided account could not be identified as a tensorMarketplace account.'
  );
}

export enum TensorMarketplaceInstruction {
  TcompNoop,
  WithdrawFees,
  Edit,
  Bid,
  CancelBid,
  CloseExpiredBidCompressed,
  BuyCompressed,
  BuySpl,
  CloseExpiredListingCompressed,
  ListCompressed,
  DelistCompressed,
  TakeBidCompressedMetaHash,
  TakeBidCompressedFullMeta,
  BuyLegacy,
  CloseExpiredListingLegacy,
  DelistLegacy,
  ListLegacy,
  TakeBidLegacy,
  BuyT22,
  CloseExpiredListingT22,
  DelistT22,
  ListT22,
  TakeBidT22,
  BuyWns,
  CloseExpiredListingWns,
  DelistWns,
  ListWns,
  TakeBidWns,
  BuyCore,
  CloseExpiredListingCore,
  DelistCore,
  ListCore,
  TakeBidCore,
}

export function identifyTensorMarketplaceInstruction(
  instruction: { data: Uint8Array } | Uint8Array
): TensorMarketplaceInstruction {
  const data =
    instruction instanceof Uint8Array ? instruction : instruction.data;
  if (memcmp(data, new Uint8Array([106, 162, 10, 226, 132, 68, 223, 21]), 0)) {
    return TensorMarketplaceInstruction.TcompNoop;
  }
  if (
    memcmp(data, new Uint8Array([198, 212, 171, 109, 144, 215, 174, 89]), 0)
  ) {
    return TensorMarketplaceInstruction.WithdrawFees;
  }
  if (memcmp(data, new Uint8Array([15, 183, 33, 86, 87, 28, 151, 145]), 0)) {
    return TensorMarketplaceInstruction.Edit;
  }
  if (memcmp(data, new Uint8Array([199, 56, 85, 38, 146, 243, 37, 158]), 0)) {
    return TensorMarketplaceInstruction.Bid;
  }
  if (memcmp(data, new Uint8Array([40, 243, 190, 217, 208, 253, 86, 206]), 0)) {
    return TensorMarketplaceInstruction.CancelBid;
  }
  if (memcmp(data, new Uint8Array([83, 20, 105, 67, 248, 68, 104, 190]), 0)) {
    return TensorMarketplaceInstruction.CloseExpiredBidCompressed;
  }
  if (memcmp(data, new Uint8Array([102, 6, 61, 18, 1, 218, 235, 234]), 0)) {
    return TensorMarketplaceInstruction.BuyCompressed;
  }
  if (memcmp(data, new Uint8Array([65, 136, 254, 255, 59, 130, 234, 174]), 0)) {
    return TensorMarketplaceInstruction.BuySpl;
  }
  if (memcmp(data, new Uint8Array([150, 70, 13, 135, 9, 204, 75, 4]), 0)) {
    return TensorMarketplaceInstruction.CloseExpiredListingCompressed;
  }
  if (memcmp(data, new Uint8Array([54, 174, 193, 67, 17, 41, 132, 38]), 0)) {
    return TensorMarketplaceInstruction.ListCompressed;
  }
  if (memcmp(data, new Uint8Array([55, 136, 205, 107, 107, 173, 4, 31]), 0)) {
    return TensorMarketplaceInstruction.DelistCompressed;
  }
  if (memcmp(data, new Uint8Array([85, 227, 202, 70, 45, 215, 10, 193]), 0)) {
    return TensorMarketplaceInstruction.TakeBidCompressedMetaHash;
  }
  if (memcmp(data, new Uint8Array([242, 194, 203, 225, 234, 53, 10, 96]), 0)) {
    return TensorMarketplaceInstruction.TakeBidCompressedFullMeta;
  }
  if (memcmp(data, new Uint8Array([68, 127, 43, 8, 212, 31, 249, 114]), 0)) {
    return TensorMarketplaceInstruction.BuyLegacy;
  }
  if (memcmp(data, new Uint8Array([56, 16, 96, 188, 55, 68, 250, 58]), 0)) {
    return TensorMarketplaceInstruction.CloseExpiredListingLegacy;
  }
  if (memcmp(data, new Uint8Array([88, 35, 231, 184, 110, 218, 149, 23]), 0)) {
    return TensorMarketplaceInstruction.DelistLegacy;
  }
  if (memcmp(data, new Uint8Array([6, 110, 255, 18, 16, 36, 8, 30]), 0)) {
    return TensorMarketplaceInstruction.ListLegacy;
  }
  if (memcmp(data, new Uint8Array([188, 35, 116, 108, 0, 233, 237, 201]), 0)) {
    return TensorMarketplaceInstruction.TakeBidLegacy;
  }
  if (memcmp(data, new Uint8Array([81, 98, 227, 171, 201, 105, 180, 216]), 0)) {
    return TensorMarketplaceInstruction.BuyT22;
  }
  if (memcmp(data, new Uint8Array([69, 2, 190, 122, 144, 119, 122, 220]), 0)) {
    return TensorMarketplaceInstruction.CloseExpiredListingT22;
  }
  if (memcmp(data, new Uint8Array([216, 72, 73, 18, 204, 82, 123, 26]), 0)) {
    return TensorMarketplaceInstruction.DelistT22;
  }
  if (memcmp(data, new Uint8Array([9, 117, 93, 230, 221, 4, 199, 212]), 0)) {
    return TensorMarketplaceInstruction.ListT22;
  }
  if (memcmp(data, new Uint8Array([18, 250, 113, 242, 31, 244, 19, 150]), 0)) {
    return TensorMarketplaceInstruction.TakeBidT22;
  }
  if (memcmp(data, new Uint8Array([168, 43, 179, 217, 44, 59, 35, 244]), 0)) {
    return TensorMarketplaceInstruction.BuyWns;
  }
  if (memcmp(data, new Uint8Array([222, 31, 183, 134, 230, 207, 7, 132]), 0)) {
    return TensorMarketplaceInstruction.CloseExpiredListingWns;
  }
  if (memcmp(data, new Uint8Array([172, 171, 57, 16, 74, 158, 32, 57]), 0)) {
    return TensorMarketplaceInstruction.DelistWns;
  }
  if (memcmp(data, new Uint8Array([23, 202, 102, 138, 255, 190, 39, 196]), 0)) {
    return TensorMarketplaceInstruction.ListWns;
  }
  if (memcmp(data, new Uint8Array([88, 5, 122, 88, 250, 139, 35, 216]), 0)) {
    return TensorMarketplaceInstruction.TakeBidWns;
  }
  if (memcmp(data, new Uint8Array([169, 227, 87, 255, 76, 86, 255, 25]), 0)) {
    return TensorMarketplaceInstruction.BuyCore;
  }
  if (memcmp(data, new Uint8Array([89, 171, 78, 80, 74, 188, 63, 58]), 0)) {
    return TensorMarketplaceInstruction.CloseExpiredListingCore;
  }
  if (memcmp(data, new Uint8Array([56, 24, 231, 2, 227, 19, 14, 68]), 0)) {
    return TensorMarketplaceInstruction.DelistCore;
  }
  if (memcmp(data, new Uint8Array([173, 76, 167, 125, 118, 71, 1, 153]), 0)) {
    return TensorMarketplaceInstruction.ListCore;
  }
  if (memcmp(data, new Uint8Array([250, 41, 248, 20, 61, 161, 27, 141]), 0)) {
    return TensorMarketplaceInstruction.TakeBidCore;
  }
  throw new Error(
    'The provided instruction could not be identified as a tensorMarketplace instruction.'
  );
}

export type ParsedTensorMarketplaceInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
> =
  | ({
      instructionType: TensorMarketplaceInstruction.TcompNoop;
    } & ParsedTcompNoopInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.WithdrawFees;
    } & ParsedWithdrawFeesInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.Edit;
    } & ParsedEditInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.Bid;
    } & ParsedBidInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.CancelBid;
    } & ParsedCancelBidInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.CloseExpiredBidCompressed;
    } & ParsedCloseExpiredBidCompressedInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.BuyCompressed;
    } & ParsedBuyCompressedInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.BuySpl;
    } & ParsedBuySplInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.CloseExpiredListingCompressed;
    } & ParsedCloseExpiredListingCompressedInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.ListCompressed;
    } & ParsedListCompressedInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.DelistCompressed;
    } & ParsedDelistCompressedInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.TakeBidCompressedMetaHash;
    } & ParsedTakeBidCompressedMetaHashInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.TakeBidCompressedFullMeta;
    } & ParsedTakeBidCompressedFullMetaInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.BuyLegacy;
    } & ParsedBuyLegacyInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.CloseExpiredListingLegacy;
    } & ParsedCloseExpiredListingLegacyInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.DelistLegacy;
    } & ParsedDelistLegacyInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.ListLegacy;
    } & ParsedListLegacyInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.TakeBidLegacy;
    } & ParsedTakeBidLegacyInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.BuyT22;
    } & ParsedBuyT22Instruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.CloseExpiredListingT22;
    } & ParsedCloseExpiredListingT22Instruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.DelistT22;
    } & ParsedDelistT22Instruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.ListT22;
    } & ParsedListT22Instruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.TakeBidT22;
    } & ParsedTakeBidT22Instruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.BuyWns;
    } & ParsedBuyWnsInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.CloseExpiredListingWns;
    } & ParsedCloseExpiredListingWnsInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.DelistWns;
    } & ParsedDelistWnsInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.ListWns;
    } & ParsedListWnsInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.TakeBidWns;
    } & ParsedTakeBidWnsInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.BuyCore;
    } & ParsedBuyCoreInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.CloseExpiredListingCore;
    } & ParsedCloseExpiredListingCoreInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.DelistCore;
    } & ParsedDelistCoreInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.ListCore;
    } & ParsedListCoreInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.TakeBidCore;
    } & ParsedTakeBidCoreInstruction<TProgram>);
