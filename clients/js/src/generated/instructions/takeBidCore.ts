/**
 * This code was AUTOGENERATED using the kinobi library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun kinobi to update it.
 *
 * @see https://github.com/metaplex-foundation/kinobi
 */

import { Address } from '@solana/addresses';
import {
  Codec,
  Decoder,
  Encoder,
  combineCodec,
  mapEncoder,
} from '@solana/codecs-core';
import {
  getArrayDecoder,
  getArrayEncoder,
  getStructDecoder,
  getStructEncoder,
} from '@solana/codecs-data-structures';
import {
  getU64Decoder,
  getU64Encoder,
  getU8Decoder,
  getU8Encoder,
} from '@solana/codecs-numbers';
import {
  AccountRole,
  IAccountMeta,
  IInstruction,
  IInstructionWithAccounts,
  IInstructionWithData,
  ReadonlyAccount,
  ReadonlySignerAccount,
  WritableAccount,
  WritableSignerAccount,
} from '@solana/instructions';
import { IAccountSignerMeta, TransactionSigner } from '@solana/signers';
import {
  ResolvedAccount,
  accountMetaWithDefault,
  getAccountMetasWithSigners,
} from '../shared';

export type TakeBidCoreInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTcomp extends string | IAccountMeta<string> = string,
  TAccountSeller extends string | IAccountMeta<string> = string,
  TAccountBidState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountMarginAccount extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountMplCoreProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountMarketplaceProgram extends string | IAccountMeta<string> = string,
  TAccountEscrowProgram extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountMintProof extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTcomp extends string
        ? WritableAccount<TAccountTcomp>
        : TAccountTcomp,
      TAccountSeller extends string
        ? WritableSignerAccount<TAccountSeller>
        : TAccountSeller,
      TAccountBidState extends string
        ? WritableAccount<TAccountBidState>
        : TAccountBidState,
      TAccountOwner extends string
        ? WritableAccount<TAccountOwner>
        : TAccountOwner,
      TAccountTakerBroker extends string
        ? WritableAccount<TAccountTakerBroker>
        : TAccountTakerBroker,
      TAccountMakerBroker extends string
        ? WritableAccount<TAccountMakerBroker>
        : TAccountMakerBroker,
      TAccountMarginAccount extends string
        ? WritableAccount<TAccountMarginAccount>
        : TAccountMarginAccount,
      TAccountWhitelist extends string
        ? ReadonlyAccount<TAccountWhitelist>
        : TAccountWhitelist,
      TAccountAsset extends string
        ? WritableAccount<TAccountAsset>
        : TAccountAsset,
      TAccountCollection extends string
        ? ReadonlyAccount<TAccountCollection>
        : TAccountCollection,
      TAccountMplCoreProgram extends string
        ? ReadonlyAccount<TAccountMplCoreProgram>
        : TAccountMplCoreProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountEscrowProgram extends string
        ? ReadonlyAccount<TAccountEscrowProgram>
        : TAccountEscrowProgram,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner>
        : TAccountCosigner,
      TAccountMintProof extends string
        ? ReadonlyAccount<TAccountMintProof>
        : TAccountMintProof,
      TAccountRentDest extends string
        ? WritableAccount<TAccountRentDest>
        : TAccountRentDest,
      ...TRemainingAccounts
    ]
  >;

export type TakeBidCoreInstructionWithSigners<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTcomp extends string | IAccountMeta<string> = string,
  TAccountSeller extends string | IAccountMeta<string> = string,
  TAccountBidState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountMarginAccount extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountMplCoreProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountMarketplaceProgram extends string | IAccountMeta<string> = string,
  TAccountEscrowProgram extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountMintProof extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountTcomp extends string
        ? WritableAccount<TAccountTcomp>
        : TAccountTcomp,
      TAccountSeller extends string
        ? WritableSignerAccount<TAccountSeller> &
            IAccountSignerMeta<TAccountSeller>
        : TAccountSeller,
      TAccountBidState extends string
        ? WritableAccount<TAccountBidState>
        : TAccountBidState,
      TAccountOwner extends string
        ? WritableAccount<TAccountOwner>
        : TAccountOwner,
      TAccountTakerBroker extends string
        ? WritableAccount<TAccountTakerBroker>
        : TAccountTakerBroker,
      TAccountMakerBroker extends string
        ? WritableAccount<TAccountMakerBroker>
        : TAccountMakerBroker,
      TAccountMarginAccount extends string
        ? WritableAccount<TAccountMarginAccount>
        : TAccountMarginAccount,
      TAccountWhitelist extends string
        ? ReadonlyAccount<TAccountWhitelist>
        : TAccountWhitelist,
      TAccountAsset extends string
        ? WritableAccount<TAccountAsset>
        : TAccountAsset,
      TAccountCollection extends string
        ? ReadonlyAccount<TAccountCollection>
        : TAccountCollection,
      TAccountMplCoreProgram extends string
        ? ReadonlyAccount<TAccountMplCoreProgram>
        : TAccountMplCoreProgram,
      TAccountSystemProgram extends string
        ? ReadonlyAccount<TAccountSystemProgram>
        : TAccountSystemProgram,
      TAccountMarketplaceProgram extends string
        ? ReadonlyAccount<TAccountMarketplaceProgram>
        : TAccountMarketplaceProgram,
      TAccountEscrowProgram extends string
        ? ReadonlyAccount<TAccountEscrowProgram>
        : TAccountEscrowProgram,
      TAccountCosigner extends string
        ? ReadonlySignerAccount<TAccountCosigner> &
            IAccountSignerMeta<TAccountCosigner>
        : TAccountCosigner,
      TAccountMintProof extends string
        ? ReadonlyAccount<TAccountMintProof>
        : TAccountMintProof,
      TAccountRentDest extends string
        ? WritableAccount<TAccountRentDest>
        : TAccountRentDest,
      ...TRemainingAccounts
    ]
  >;

export type TakeBidCoreInstructionData = {
  discriminator: Array<number>;
  minAmount: bigint;
};

export type TakeBidCoreInstructionDataArgs = { minAmount: number | bigint };

export function getTakeBidCoreInstructionDataEncoder() {
  return mapEncoder(
    getStructEncoder<{
      discriminator: Array<number>;
      minAmount: number | bigint;
    }>([
      ['discriminator', getArrayEncoder(getU8Encoder(), { size: 8 })],
      ['minAmount', getU64Encoder()],
    ]),
    (value) => ({
      ...value,
      discriminator: [250, 41, 248, 20, 61, 161, 27, 141],
    })
  ) satisfies Encoder<TakeBidCoreInstructionDataArgs>;
}

export function getTakeBidCoreInstructionDataDecoder() {
  return getStructDecoder<TakeBidCoreInstructionData>([
    ['discriminator', getArrayDecoder(getU8Decoder(), { size: 8 })],
    ['minAmount', getU64Decoder()],
  ]) satisfies Decoder<TakeBidCoreInstructionData>;
}

export function getTakeBidCoreInstructionDataCodec(): Codec<
  TakeBidCoreInstructionDataArgs,
  TakeBidCoreInstructionData
> {
  return combineCodec(
    getTakeBidCoreInstructionDataEncoder(),
    getTakeBidCoreInstructionDataDecoder()
  );
}

export type TakeBidCoreInput<
  TAccountTcomp extends string,
  TAccountSeller extends string,
  TAccountBidState extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountMarginAccount extends string,
  TAccountWhitelist extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountMplCoreProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountEscrowProgram extends string,
  TAccountCosigner extends string,
  TAccountMintProof extends string,
  TAccountRentDest extends string
> = {
  tcomp: Address<TAccountTcomp>;
  seller: Address<TAccountSeller>;
  bidState: Address<TAccountBidState>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  marginAccount: Address<TAccountMarginAccount>;
  whitelist: Address<TAccountWhitelist>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  mplCoreProgram: Address<TAccountMplCoreProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram: Address<TAccountMarketplaceProgram>;
  escrowProgram: Address<TAccountEscrowProgram>;
  cosigner: Address<TAccountCosigner>;
  /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
  mintProof: Address<TAccountMintProof>;
  rentDest?: Address<TAccountRentDest>;
  minAmount: TakeBidCoreInstructionDataArgs['minAmount'];
};

export type TakeBidCoreInputWithSigners<
  TAccountTcomp extends string,
  TAccountSeller extends string,
  TAccountBidState extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountMarginAccount extends string,
  TAccountWhitelist extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountMplCoreProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountEscrowProgram extends string,
  TAccountCosigner extends string,
  TAccountMintProof extends string,
  TAccountRentDest extends string
> = {
  tcomp: Address<TAccountTcomp>;
  seller: TransactionSigner<TAccountSeller>;
  bidState: Address<TAccountBidState>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  marginAccount: Address<TAccountMarginAccount>;
  whitelist: Address<TAccountWhitelist>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  mplCoreProgram: Address<TAccountMplCoreProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram: Address<TAccountMarketplaceProgram>;
  escrowProgram: Address<TAccountEscrowProgram>;
  cosigner: TransactionSigner<TAccountCosigner>;
  /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
  mintProof: Address<TAccountMintProof>;
  rentDest?: Address<TAccountRentDest>;
  minAmount: TakeBidCoreInstructionDataArgs['minAmount'];
};

export function getTakeBidCoreInstruction<
  TAccountTcomp extends string,
  TAccountSeller extends string,
  TAccountBidState extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountMarginAccount extends string,
  TAccountWhitelist extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountMplCoreProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountEscrowProgram extends string,
  TAccountCosigner extends string,
  TAccountMintProof extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: TakeBidCoreInputWithSigners<
    TAccountTcomp,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountAsset,
    TAccountCollection,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountEscrowProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDest
  >
): TakeBidCoreInstructionWithSigners<
  TProgram,
  TAccountTcomp,
  TAccountSeller,
  TAccountBidState,
  TAccountOwner,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountMarginAccount,
  TAccountWhitelist,
  TAccountAsset,
  TAccountCollection,
  TAccountMplCoreProgram,
  TAccountSystemProgram,
  TAccountMarketplaceProgram,
  TAccountEscrowProgram,
  TAccountCosigner,
  TAccountMintProof,
  TAccountRentDest
>;
export function getTakeBidCoreInstruction<
  TAccountTcomp extends string,
  TAccountSeller extends string,
  TAccountBidState extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountMarginAccount extends string,
  TAccountWhitelist extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountMplCoreProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountEscrowProgram extends string,
  TAccountCosigner extends string,
  TAccountMintProof extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: TakeBidCoreInput<
    TAccountTcomp,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountAsset,
    TAccountCollection,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountEscrowProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDest
  >
): TakeBidCoreInstruction<
  TProgram,
  TAccountTcomp,
  TAccountSeller,
  TAccountBidState,
  TAccountOwner,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountMarginAccount,
  TAccountWhitelist,
  TAccountAsset,
  TAccountCollection,
  TAccountMplCoreProgram,
  TAccountSystemProgram,
  TAccountMarketplaceProgram,
  TAccountEscrowProgram,
  TAccountCosigner,
  TAccountMintProof,
  TAccountRentDest
>;
export function getTakeBidCoreInstruction<
  TAccountTcomp extends string,
  TAccountSeller extends string,
  TAccountBidState extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountMarginAccount extends string,
  TAccountWhitelist extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountMplCoreProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountEscrowProgram extends string,
  TAccountCosigner extends string,
  TAccountMintProof extends string,
  TAccountRentDest extends string,
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
>(
  input: TakeBidCoreInput<
    TAccountTcomp,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountAsset,
    TAccountCollection,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountEscrowProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDest
  >
): IInstruction {
  // Program address.
  const programAddress =
    'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;

  // Original accounts.
  type AccountMetas = Parameters<
    typeof getTakeBidCoreInstructionRaw<
      TProgram,
      TAccountTcomp,
      TAccountSeller,
      TAccountBidState,
      TAccountOwner,
      TAccountTakerBroker,
      TAccountMakerBroker,
      TAccountMarginAccount,
      TAccountWhitelist,
      TAccountAsset,
      TAccountCollection,
      TAccountMplCoreProgram,
      TAccountSystemProgram,
      TAccountMarketplaceProgram,
      TAccountEscrowProgram,
      TAccountCosigner,
      TAccountMintProof,
      TAccountRentDest
    >
  >[0];
  const accounts: Record<keyof AccountMetas, ResolvedAccount> = {
    tcomp: { value: input.tcomp ?? null, isWritable: true },
    seller: { value: input.seller ?? null, isWritable: true },
    bidState: { value: input.bidState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    marginAccount: { value: input.marginAccount ?? null, isWritable: true },
    whitelist: { value: input.whitelist ?? null, isWritable: false },
    asset: { value: input.asset ?? null, isWritable: true },
    collection: { value: input.collection ?? null, isWritable: false },
    mplCoreProgram: { value: input.mplCoreProgram ?? null, isWritable: false },
    systemProgram: { value: input.systemProgram ?? null, isWritable: false },
    marketplaceProgram: {
      value: input.marketplaceProgram ?? null,
      isWritable: false,
    },
    escrowProgram: { value: input.escrowProgram ?? null, isWritable: false },
    cosigner: { value: input.cosigner ?? null, isWritable: false },
    mintProof: { value: input.mintProof ?? null, isWritable: false },
    rentDest: { value: input.rentDest ?? null, isWritable: true },
  };

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.rentDest.value) {
    accounts.rentDest.value =
      'SysvarRent111111111111111111111111111111111' as Address<'SysvarRent111111111111111111111111111111111'>;
  }

  // Get account metas and signers.
  const accountMetas = getAccountMetasWithSigners(
    accounts,
    'programId',
    programAddress
  );

  const instruction = getTakeBidCoreInstructionRaw(
    accountMetas as Record<keyof AccountMetas, IAccountMeta>,
    args as TakeBidCoreInstructionDataArgs,
    programAddress
  );

  return instruction;
}

export function getTakeBidCoreInstructionRaw<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountTcomp extends string | IAccountMeta<string> = string,
  TAccountSeller extends string | IAccountMeta<string> = string,
  TAccountBidState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountMarginAccount extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends string | IAccountMeta<string> = string,
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountMplCoreProgram extends string | IAccountMeta<string> = string,
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountMarketplaceProgram extends string | IAccountMeta<string> = string,
  TAccountEscrowProgram extends string | IAccountMeta<string> = string,
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountMintProof extends string | IAccountMeta<string> = string,
  TAccountRentDest extends
    | string
    | IAccountMeta<string> = 'SysvarRent111111111111111111111111111111111',
  TRemainingAccounts extends Array<IAccountMeta<string>> = []
>(
  accounts: {
    tcomp: TAccountTcomp extends string
      ? Address<TAccountTcomp>
      : TAccountTcomp;
    seller: TAccountSeller extends string
      ? Address<TAccountSeller>
      : TAccountSeller;
    bidState: TAccountBidState extends string
      ? Address<TAccountBidState>
      : TAccountBidState;
    owner: TAccountOwner extends string
      ? Address<TAccountOwner>
      : TAccountOwner;
    takerBroker?: TAccountTakerBroker extends string
      ? Address<TAccountTakerBroker>
      : TAccountTakerBroker;
    makerBroker?: TAccountMakerBroker extends string
      ? Address<TAccountMakerBroker>
      : TAccountMakerBroker;
    marginAccount: TAccountMarginAccount extends string
      ? Address<TAccountMarginAccount>
      : TAccountMarginAccount;
    whitelist: TAccountWhitelist extends string
      ? Address<TAccountWhitelist>
      : TAccountWhitelist;
    asset: TAccountAsset extends string
      ? Address<TAccountAsset>
      : TAccountAsset;
    collection?: TAccountCollection extends string
      ? Address<TAccountCollection>
      : TAccountCollection;
    mplCoreProgram: TAccountMplCoreProgram extends string
      ? Address<TAccountMplCoreProgram>
      : TAccountMplCoreProgram;
    systemProgram?: TAccountSystemProgram extends string
      ? Address<TAccountSystemProgram>
      : TAccountSystemProgram;
    marketplaceProgram: TAccountMarketplaceProgram extends string
      ? Address<TAccountMarketplaceProgram>
      : TAccountMarketplaceProgram;
    escrowProgram: TAccountEscrowProgram extends string
      ? Address<TAccountEscrowProgram>
      : TAccountEscrowProgram;
    cosigner: TAccountCosigner extends string
      ? Address<TAccountCosigner>
      : TAccountCosigner;
    mintProof: TAccountMintProof extends string
      ? Address<TAccountMintProof>
      : TAccountMintProof;
    rentDest?: TAccountRentDest extends string
      ? Address<TAccountRentDest>
      : TAccountRentDest;
  },
  args: TakeBidCoreInstructionDataArgs,
  programAddress: Address<TProgram> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<TProgram>,
  remainingAccounts?: TRemainingAccounts
) {
  return {
    accounts: [
      accountMetaWithDefault(accounts.tcomp, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.seller, AccountRole.WRITABLE_SIGNER),
      accountMetaWithDefault(accounts.bidState, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.owner, AccountRole.WRITABLE),
      accountMetaWithDefault(
        accounts.takerBroker ?? {
          address:
            'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>,
          role: AccountRole.READONLY,
        },
        AccountRole.WRITABLE
      ),
      accountMetaWithDefault(
        accounts.makerBroker ?? {
          address:
            'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>,
          role: AccountRole.READONLY,
        },
        AccountRole.WRITABLE
      ),
      accountMetaWithDefault(accounts.marginAccount, AccountRole.WRITABLE),
      accountMetaWithDefault(accounts.whitelist, AccountRole.READONLY),
      accountMetaWithDefault(accounts.asset, AccountRole.WRITABLE),
      accountMetaWithDefault(
        accounts.collection ?? {
          address:
            'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>,
          role: AccountRole.READONLY,
        },
        AccountRole.READONLY
      ),
      accountMetaWithDefault(accounts.mplCoreProgram, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.systemProgram ??
          ('11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>),
        AccountRole.READONLY
      ),
      accountMetaWithDefault(accounts.marketplaceProgram, AccountRole.READONLY),
      accountMetaWithDefault(accounts.escrowProgram, AccountRole.READONLY),
      accountMetaWithDefault(accounts.cosigner, AccountRole.READONLY_SIGNER),
      accountMetaWithDefault(accounts.mintProof, AccountRole.READONLY),
      accountMetaWithDefault(
        accounts.rentDest ??
          ('SysvarRent111111111111111111111111111111111' as Address<'SysvarRent111111111111111111111111111111111'>),
        AccountRole.WRITABLE
      ),
      ...(remainingAccounts ?? []),
    ],
    data: getTakeBidCoreInstructionDataEncoder().encode(args),
    programAddress,
  } as TakeBidCoreInstruction<
    TProgram,
    TAccountTcomp,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountMarginAccount,
    TAccountWhitelist,
    TAccountAsset,
    TAccountCollection,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountEscrowProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDest,
    TRemainingAccounts
  >;
}

export type ParsedTakeBidCoreInstruction<
  TProgram extends string = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[]
> = {
  programAddress: Address<TProgram>;
  accounts: {
    tcomp: TAccountMetas[0];
    seller: TAccountMetas[1];
    bidState: TAccountMetas[2];
    owner: TAccountMetas[3];
    takerBroker?: TAccountMetas[4] | undefined;
    makerBroker?: TAccountMetas[5] | undefined;
    marginAccount: TAccountMetas[6];
    whitelist: TAccountMetas[7];
    asset: TAccountMetas[8];
    collection?: TAccountMetas[9] | undefined;
    mplCoreProgram: TAccountMetas[10];
    systemProgram: TAccountMetas[11];
    marketplaceProgram: TAccountMetas[12];
    escrowProgram: TAccountMetas[13];
    cosigner: TAccountMetas[14];
    /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
    mintProof: TAccountMetas[15];
    rentDest: TAccountMetas[16];
  };
  data: TakeBidCoreInstructionData;
};

export function parseTakeBidCoreInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[]
>(
  instruction: IInstruction<TProgram> &
    IInstructionWithAccounts<TAccountMetas> &
    IInstructionWithData<Uint8Array>
): ParsedTakeBidCoreInstruction<TProgram, TAccountMetas> {
  if (instruction.accounts.length < 17) {
    // TODO: Coded error.
    throw new Error('Not enough accounts');
  }
  let accountIndex = 0;
  const getNextAccount = () => {
    const accountMeta = instruction.accounts![accountIndex]!;
    accountIndex += 1;
    return accountMeta;
  };
  const getNextOptionalAccount = () => {
    const accountMeta = getNextAccount();
    return accountMeta.address === 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'
      ? undefined
      : accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      tcomp: getNextAccount(),
      seller: getNextAccount(),
      bidState: getNextAccount(),
      owner: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      marginAccount: getNextAccount(),
      whitelist: getNextAccount(),
      asset: getNextAccount(),
      collection: getNextOptionalAccount(),
      mplCoreProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      escrowProgram: getNextAccount(),
      cosigner: getNextAccount(),
      mintProof: getNextAccount(),
      rentDest: getNextAccount(),
    },
    data: getTakeBidCoreInstructionDataDecoder().decode(instruction.data),
  };
}
