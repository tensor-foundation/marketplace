/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/kinobi-so/kinobi
 */

import {
  Address,
  containsBytes,
  fixEncoderSize,
  getBytesEncoder,
} from '@solana/web3.js';
import {
  ParsedBidInstruction,
  ParsedBuyCompressedInstruction,
  ParsedBuyCoreInstruction,
  ParsedBuyCoreSplInstruction,
  ParsedBuyLegacyInstruction,
  ParsedBuyLegacySplInstruction,
  ParsedBuySplInstruction,
  ParsedBuyT22Instruction,
  ParsedBuyT22SplInstruction,
  ParsedBuyWnsInstruction,
  ParsedBuyWnsSplInstruction,
  ParsedCancelBidInstruction,
  ParsedCloseExpiredBidInstruction,
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
} from '../instructions';

export const TENSOR_MARKETPLACE_PROGRAM_ADDRESS =
  'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;

export enum TensorMarketplaceAccount {
  ListState,
  BidState,
  BidTa,
}

export function identifyTensorMarketplaceAccount(
  account: { data: Uint8Array } | Uint8Array
): TensorMarketplaceAccount {
  const data = account instanceof Uint8Array ? account : account.data;
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([78, 242, 89, 138, 161, 221, 176, 75])
      ),
      0
    )
  ) {
    return TensorMarketplaceAccount.ListState;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([155, 197, 5, 97, 189, 60, 8, 183])
      ),
      0
    )
  ) {
    return TensorMarketplaceAccount.BidState;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([186, 230, 110, 26, 235, 24, 211, 156])
      ),
      0
    )
  ) {
    return TensorMarketplaceAccount.BidTa;
  }
  throw new Error(
    'The provided account could not be identified as a tensorMarketplace account.'
  );
}

export enum TensorMarketplaceInstruction {
  TcompNoop,
  Edit,
  Bid,
  CancelBid,
  CloseExpiredBid,
  BuyCompressed,
  BuySpl,
  CloseExpiredListingCompressed,
  ListCompressed,
  DelistCompressed,
  TakeBidCompressedMetaHash,
  TakeBidCompressedFullMeta,
  BuyLegacy,
  BuyLegacySpl,
  CloseExpiredListingLegacy,
  DelistLegacy,
  ListLegacy,
  TakeBidLegacy,
  BuyT22,
  BuyT22Spl,
  CloseExpiredListingT22,
  DelistT22,
  ListT22,
  TakeBidT22,
  BuyWns,
  BuyWnsSpl,
  CloseExpiredListingWns,
  DelistWns,
  ListWns,
  TakeBidWns,
  BuyCore,
  BuyCoreSpl,
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
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([106, 162, 10, 226, 132, 68, 223, 21])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.TcompNoop;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([15, 183, 33, 86, 87, 28, 151, 145])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.Edit;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([199, 56, 85, 38, 146, 243, 37, 158])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.Bid;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([40, 243, 190, 217, 208, 253, 86, 206])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.CancelBid;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([83, 20, 105, 67, 248, 68, 104, 190])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.CloseExpiredBid;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([102, 6, 61, 18, 1, 218, 235, 234])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.BuyCompressed;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([65, 136, 254, 255, 59, 130, 234, 174])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.BuySpl;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([150, 70, 13, 135, 9, 204, 75, 4])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.CloseExpiredListingCompressed;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([54, 174, 193, 67, 17, 41, 132, 38])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.ListCompressed;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([55, 136, 205, 107, 107, 173, 4, 31])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.DelistCompressed;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([85, 227, 202, 70, 45, 215, 10, 193])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.TakeBidCompressedMetaHash;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([242, 194, 203, 225, 234, 53, 10, 96])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.TakeBidCompressedFullMeta;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([68, 127, 43, 8, 212, 31, 249, 114])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.BuyLegacy;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([134, 94, 125, 229, 24, 157, 194, 199])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.BuyLegacySpl;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([56, 16, 96, 188, 55, 68, 250, 58])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.CloseExpiredListingLegacy;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([88, 35, 231, 184, 110, 218, 149, 23])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.DelistLegacy;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([6, 110, 255, 18, 16, 36, 8, 30])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.ListLegacy;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([188, 35, 116, 108, 0, 233, 237, 201])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.TakeBidLegacy;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([81, 98, 227, 171, 201, 105, 180, 216])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.BuyT22;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([102, 21, 163, 39, 94, 39, 122, 94])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.BuyT22Spl;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([69, 2, 190, 122, 144, 119, 122, 220])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.CloseExpiredListingT22;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([216, 72, 73, 18, 204, 82, 123, 26])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.DelistT22;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([9, 117, 93, 230, 221, 4, 199, 212])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.ListT22;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([18, 250, 113, 242, 31, 244, 19, 150])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.TakeBidT22;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([168, 43, 179, 217, 44, 59, 35, 244])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.BuyWns;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([113, 137, 57, 23, 186, 196, 217, 210])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.BuyWnsSpl;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([222, 31, 183, 134, 230, 207, 7, 132])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.CloseExpiredListingWns;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([172, 171, 57, 16, 74, 158, 32, 57])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.DelistWns;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([23, 202, 102, 138, 255, 190, 39, 196])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.ListWns;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([88, 5, 122, 88, 250, 139, 35, 216])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.TakeBidWns;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([169, 227, 87, 255, 76, 86, 255, 25])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.BuyCore;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([234, 28, 37, 122, 114, 239, 233, 208])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.BuyCoreSpl;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([89, 171, 78, 80, 74, 188, 63, 58])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.CloseExpiredListingCore;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([56, 24, 231, 2, 227, 19, 14, 68])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.DelistCore;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([173, 76, 167, 125, 118, 71, 1, 153])
      ),
      0
    )
  ) {
    return TensorMarketplaceInstruction.ListCore;
  }
  if (
    containsBytes(
      data,
      fixEncoderSize(getBytesEncoder(), 8).encode(
        new Uint8Array([250, 41, 248, 20, 61, 161, 27, 141])
      ),
      0
    )
  ) {
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
      instructionType: TensorMarketplaceInstruction.Edit;
    } & ParsedEditInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.Bid;
    } & ParsedBidInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.CancelBid;
    } & ParsedCancelBidInstruction<TProgram>)
  | ({
      instructionType: TensorMarketplaceInstruction.CloseExpiredBid;
    } & ParsedCloseExpiredBidInstruction<TProgram>)
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
      instructionType: TensorMarketplaceInstruction.BuyLegacySpl;
    } & ParsedBuyLegacySplInstruction<TProgram>)
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
      instructionType: TensorMarketplaceInstruction.BuyT22Spl;
    } & ParsedBuyT22SplInstruction<TProgram>)
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
      instructionType: TensorMarketplaceInstruction.BuyWnsSpl;
    } & ParsedBuyWnsSplInstruction<TProgram>)
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
      instructionType: TensorMarketplaceInstruction.BuyCoreSpl;
    } & ParsedBuyCoreSplInstruction<TProgram>)
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
