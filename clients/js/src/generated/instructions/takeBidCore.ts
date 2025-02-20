/**
 * This code was AUTOGENERATED using the codama library.
 * Please DO NOT EDIT THIS FILE, instead use visitors
 * to add features, then rerun codama to update it.
 *
 * @see https://github.com/codama-idl/codama
 */

import {
  AccountRole,
  combineCodec,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU64Decoder,
  getU64Encoder,
  transformEncoder,
  type Address,
  type Codec,
  type Decoder,
  type Encoder,
  type IAccountMeta,
  type IAccountSignerMeta,
  type IInstruction,
  type IInstructionWithAccounts,
  type IInstructionWithData,
  type ReadonlyAccount,
  type ReadonlySignerAccount,
  type ReadonlyUint8Array,
  type TransactionSigner,
  type WritableAccount,
  type WritableSignerAccount,
} from '@solana/web3.js';
import { resolveFeeVaultPdaFromBidState } from '@tensor-foundation/resolvers';
import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS } from '../programs';
import {
  expectSome,
  getAccountMetaFactory,
  type ResolvedAccount,
} from '../shared';

export const TAKE_BID_CORE_DISCRIMINATOR = new Uint8Array([
  250, 41, 248, 20, 61, 161, 27, 141,
]);

export function getTakeBidCoreDiscriminatorBytes() {
  return fixEncoderSize(getBytesEncoder(), 8).encode(
    TAKE_BID_CORE_DISCRIMINATOR
  );
}

export type TakeBidCoreInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountFeeVault extends string | IAccountMeta<string> = string,
  TAccountSeller extends string | IAccountMeta<string> = string,
  TAccountBidState extends string | IAccountMeta<string> = string,
  TAccountOwner extends string | IAccountMeta<string> = string,
  TAccountTakerBroker extends string | IAccountMeta<string> = string,
  TAccountMakerBroker extends string | IAccountMeta<string> = string,
  TAccountSharedEscrow extends string | IAccountMeta<string> = string,
  TAccountWhitelist extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountAsset extends string | IAccountMeta<string> = string,
  TAccountCollection extends string | IAccountMeta<string> = string,
  TAccountMplCoreProgram extends
    | string
    | IAccountMeta<string> = 'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d',
  TAccountSystemProgram extends
    | string
    | IAccountMeta<string> = '11111111111111111111111111111111',
  TAccountMarketplaceProgram extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountEscrowProgram extends
    | string
    | IAccountMeta<string> = 'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN',
  TAccountCosigner extends string | IAccountMeta<string> = string,
  TAccountMintProof extends
    | string
    | IAccountMeta<string> = 'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp',
  TAccountRentDestination extends string | IAccountMeta<string> = string,
  TRemainingAccounts extends readonly IAccountMeta<string>[] = [],
> = IInstruction<TProgram> &
  IInstructionWithData<Uint8Array> &
  IInstructionWithAccounts<
    [
      TAccountFeeVault extends string
        ? WritableAccount<TAccountFeeVault>
        : TAccountFeeVault,
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
      TAccountSharedEscrow extends string
        ? WritableAccount<TAccountSharedEscrow>
        : TAccountSharedEscrow,
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
      TAccountRentDestination extends string
        ? WritableAccount<TAccountRentDestination>
        : TAccountRentDestination,
      ...TRemainingAccounts,
    ]
  >;

export type TakeBidCoreInstructionData = {
  discriminator: ReadonlyUint8Array;
  minAmount: bigint;
};

export type TakeBidCoreInstructionDataArgs = { minAmount: number | bigint };

export function getTakeBidCoreInstructionDataEncoder(): Encoder<TakeBidCoreInstructionDataArgs> {
  return transformEncoder(
    getStructEncoder([
      ['discriminator', fixEncoderSize(getBytesEncoder(), 8)],
      ['minAmount', getU64Encoder()],
    ]),
    (value) => ({ ...value, discriminator: TAKE_BID_CORE_DISCRIMINATOR })
  );
}

export function getTakeBidCoreInstructionDataDecoder(): Decoder<TakeBidCoreInstructionData> {
  return getStructDecoder([
    ['discriminator', fixDecoderSize(getBytesDecoder(), 8)],
    ['minAmount', getU64Decoder()],
  ]);
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

export type TakeBidCoreAsyncInput<
  TAccountFeeVault extends string = string,
  TAccountSeller extends string = string,
  TAccountBidState extends string = string,
  TAccountOwner extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountSharedEscrow extends string = string,
  TAccountWhitelist extends string = string,
  TAccountAsset extends string = string,
  TAccountCollection extends string = string,
  TAccountMplCoreProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountEscrowProgram extends string = string,
  TAccountCosigner extends string = string,
  TAccountMintProof extends string = string,
  TAccountRentDestination extends string = string,
> = {
  feeVault?: Address<TAccountFeeVault>;
  seller: TransactionSigner<TAccountSeller>;
  bidState: Address<TAccountBidState>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  sharedEscrow?: Address<TAccountSharedEscrow>;
  whitelist?: Address<TAccountWhitelist>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  mplCoreProgram?: Address<TAccountMplCoreProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  escrowProgram?: Address<TAccountEscrowProgram>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
  mintProof?: Address<TAccountMintProof>;
  rentDestination?: Address<TAccountRentDestination>;
  minAmount: TakeBidCoreInstructionDataArgs['minAmount'];
  creators: Array<Address>;
};

export async function getTakeBidCoreInstructionAsync<
  TAccountFeeVault extends string,
  TAccountSeller extends string,
  TAccountBidState extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountSharedEscrow extends string,
  TAccountWhitelist extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountMplCoreProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountEscrowProgram extends string,
  TAccountCosigner extends string,
  TAccountMintProof extends string,
  TAccountRentDestination extends string,
  TProgramAddress extends Address = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
>(
  input: TakeBidCoreAsyncInput<
    TAccountFeeVault,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountSharedEscrow,
    TAccountWhitelist,
    TAccountAsset,
    TAccountCollection,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountEscrowProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDestination
  >,
  config?: { programAddress?: TProgramAddress }
): Promise<
  TakeBidCoreInstruction<
    TProgramAddress,
    TAccountFeeVault,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountSharedEscrow,
    TAccountWhitelist,
    TAccountAsset,
    TAccountCollection,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountEscrowProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDestination
  >
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    seller: { value: input.seller ?? null, isWritable: true },
    bidState: { value: input.bidState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    sharedEscrow: { value: input.sharedEscrow ?? null, isWritable: true },
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
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolver scope.
  const resolverScope = { programAddress, accounts, args };

  // Resolve default values.
  if (!accounts.feeVault.value) {
    accounts.feeVault = {
      ...accounts.feeVault,
      ...(await resolveFeeVaultPdaFromBidState(resolverScope)),
    };
  }
  if (!accounts.sharedEscrow.value) {
    accounts.sharedEscrow.value = expectSome(accounts.owner.value);
  }
  if (!accounts.whitelist.value) {
    accounts.whitelist.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.mplCoreProgram.value) {
    accounts.mplCoreProgram.value =
      'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d' as Address<'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.escrowProgram.value) {
    accounts.escrowProgram.value =
      'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN' as Address<'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN'>;
  }
  if (!accounts.mintProof.value) {
    accounts.mintProof.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = args.creators.map((address) => ({
    address,
    role: AccountRole.WRITABLE,
  }));

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.seller),
      getAccountMeta(accounts.bidState),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.sharedEscrow),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.asset),
      getAccountMeta(accounts.collection),
      getAccountMeta(accounts.mplCoreProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.escrowProgram),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.mintProof),
      getAccountMeta(accounts.rentDestination),
      ...remainingAccounts,
    ],
    programAddress,
    data: getTakeBidCoreInstructionDataEncoder().encode(
      args as TakeBidCoreInstructionDataArgs
    ),
  } as TakeBidCoreInstruction<
    TProgramAddress,
    TAccountFeeVault,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountSharedEscrow,
    TAccountWhitelist,
    TAccountAsset,
    TAccountCollection,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountEscrowProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDestination
  >;

  return instruction;
}

export type TakeBidCoreInput<
  TAccountFeeVault extends string = string,
  TAccountSeller extends string = string,
  TAccountBidState extends string = string,
  TAccountOwner extends string = string,
  TAccountTakerBroker extends string = string,
  TAccountMakerBroker extends string = string,
  TAccountSharedEscrow extends string = string,
  TAccountWhitelist extends string = string,
  TAccountAsset extends string = string,
  TAccountCollection extends string = string,
  TAccountMplCoreProgram extends string = string,
  TAccountSystemProgram extends string = string,
  TAccountMarketplaceProgram extends string = string,
  TAccountEscrowProgram extends string = string,
  TAccountCosigner extends string = string,
  TAccountMintProof extends string = string,
  TAccountRentDestination extends string = string,
> = {
  feeVault: Address<TAccountFeeVault>;
  seller: TransactionSigner<TAccountSeller>;
  bidState: Address<TAccountBidState>;
  owner: Address<TAccountOwner>;
  takerBroker?: Address<TAccountTakerBroker>;
  makerBroker?: Address<TAccountMakerBroker>;
  sharedEscrow?: Address<TAccountSharedEscrow>;
  whitelist?: Address<TAccountWhitelist>;
  asset: Address<TAccountAsset>;
  collection?: Address<TAccountCollection>;
  mplCoreProgram?: Address<TAccountMplCoreProgram>;
  systemProgram?: Address<TAccountSystemProgram>;
  marketplaceProgram?: Address<TAccountMarketplaceProgram>;
  escrowProgram?: Address<TAccountEscrowProgram>;
  cosigner?: TransactionSigner<TAccountCosigner>;
  /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
  mintProof?: Address<TAccountMintProof>;
  rentDestination?: Address<TAccountRentDestination>;
  minAmount: TakeBidCoreInstructionDataArgs['minAmount'];
  creators: Array<Address>;
};

export function getTakeBidCoreInstruction<
  TAccountFeeVault extends string,
  TAccountSeller extends string,
  TAccountBidState extends string,
  TAccountOwner extends string,
  TAccountTakerBroker extends string,
  TAccountMakerBroker extends string,
  TAccountSharedEscrow extends string,
  TAccountWhitelist extends string,
  TAccountAsset extends string,
  TAccountCollection extends string,
  TAccountMplCoreProgram extends string,
  TAccountSystemProgram extends string,
  TAccountMarketplaceProgram extends string,
  TAccountEscrowProgram extends string,
  TAccountCosigner extends string,
  TAccountMintProof extends string,
  TAccountRentDestination extends string,
  TProgramAddress extends Address = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
>(
  input: TakeBidCoreInput<
    TAccountFeeVault,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountSharedEscrow,
    TAccountWhitelist,
    TAccountAsset,
    TAccountCollection,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountEscrowProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDestination
  >,
  config?: { programAddress?: TProgramAddress }
): TakeBidCoreInstruction<
  TProgramAddress,
  TAccountFeeVault,
  TAccountSeller,
  TAccountBidState,
  TAccountOwner,
  TAccountTakerBroker,
  TAccountMakerBroker,
  TAccountSharedEscrow,
  TAccountWhitelist,
  TAccountAsset,
  TAccountCollection,
  TAccountMplCoreProgram,
  TAccountSystemProgram,
  TAccountMarketplaceProgram,
  TAccountEscrowProgram,
  TAccountCosigner,
  TAccountMintProof,
  TAccountRentDestination
> {
  // Program address.
  const programAddress =
    config?.programAddress ?? TENSOR_MARKETPLACE_PROGRAM_ADDRESS;

  // Original accounts.
  const originalAccounts = {
    feeVault: { value: input.feeVault ?? null, isWritable: true },
    seller: { value: input.seller ?? null, isWritable: true },
    bidState: { value: input.bidState ?? null, isWritable: true },
    owner: { value: input.owner ?? null, isWritable: true },
    takerBroker: { value: input.takerBroker ?? null, isWritable: true },
    makerBroker: { value: input.makerBroker ?? null, isWritable: true },
    sharedEscrow: { value: input.sharedEscrow ?? null, isWritable: true },
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
    rentDestination: { value: input.rentDestination ?? null, isWritable: true },
  };
  const accounts = originalAccounts as Record<
    keyof typeof originalAccounts,
    ResolvedAccount
  >;

  // Original args.
  const args = { ...input };

  // Resolve default values.
  if (!accounts.sharedEscrow.value) {
    accounts.sharedEscrow.value = expectSome(accounts.owner.value);
  }
  if (!accounts.whitelist.value) {
    accounts.whitelist.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.mplCoreProgram.value) {
    accounts.mplCoreProgram.value =
      'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d' as Address<'CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d'>;
  }
  if (!accounts.systemProgram.value) {
    accounts.systemProgram.value =
      '11111111111111111111111111111111' as Address<'11111111111111111111111111111111'>;
  }
  if (!accounts.marketplaceProgram.value) {
    accounts.marketplaceProgram.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.escrowProgram.value) {
    accounts.escrowProgram.value =
      'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN' as Address<'TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN'>;
  }
  if (!accounts.mintProof.value) {
    accounts.mintProof.value =
      'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp' as Address<'TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp'>;
  }
  if (!accounts.rentDestination.value) {
    accounts.rentDestination.value = expectSome(accounts.owner.value);
  }

  // Remaining accounts.
  const remainingAccounts: IAccountMeta[] = args.creators.map((address) => ({
    address,
    role: AccountRole.WRITABLE,
  }));

  const getAccountMeta = getAccountMetaFactory(programAddress, 'programId');
  const instruction = {
    accounts: [
      getAccountMeta(accounts.feeVault),
      getAccountMeta(accounts.seller),
      getAccountMeta(accounts.bidState),
      getAccountMeta(accounts.owner),
      getAccountMeta(accounts.takerBroker),
      getAccountMeta(accounts.makerBroker),
      getAccountMeta(accounts.sharedEscrow),
      getAccountMeta(accounts.whitelist),
      getAccountMeta(accounts.asset),
      getAccountMeta(accounts.collection),
      getAccountMeta(accounts.mplCoreProgram),
      getAccountMeta(accounts.systemProgram),
      getAccountMeta(accounts.marketplaceProgram),
      getAccountMeta(accounts.escrowProgram),
      getAccountMeta(accounts.cosigner),
      getAccountMeta(accounts.mintProof),
      getAccountMeta(accounts.rentDestination),
      ...remainingAccounts,
    ],
    programAddress,
    data: getTakeBidCoreInstructionDataEncoder().encode(
      args as TakeBidCoreInstructionDataArgs
    ),
  } as TakeBidCoreInstruction<
    TProgramAddress,
    TAccountFeeVault,
    TAccountSeller,
    TAccountBidState,
    TAccountOwner,
    TAccountTakerBroker,
    TAccountMakerBroker,
    TAccountSharedEscrow,
    TAccountWhitelist,
    TAccountAsset,
    TAccountCollection,
    TAccountMplCoreProgram,
    TAccountSystemProgram,
    TAccountMarketplaceProgram,
    TAccountEscrowProgram,
    TAccountCosigner,
    TAccountMintProof,
    TAccountRentDestination
  >;

  return instruction;
}

export type ParsedTakeBidCoreInstruction<
  TProgram extends string = typeof TENSOR_MARKETPLACE_PROGRAM_ADDRESS,
  TAccountMetas extends readonly IAccountMeta[] = readonly IAccountMeta[],
> = {
  programAddress: Address<TProgram>;
  accounts: {
    feeVault: TAccountMetas[0];
    seller: TAccountMetas[1];
    bidState: TAccountMetas[2];
    owner: TAccountMetas[3];
    takerBroker?: TAccountMetas[4] | undefined;
    makerBroker?: TAccountMetas[5] | undefined;
    sharedEscrow: TAccountMetas[6];
    whitelist: TAccountMetas[7];
    asset: TAccountMetas[8];
    collection?: TAccountMetas[9] | undefined;
    mplCoreProgram: TAccountMetas[10];
    systemProgram: TAccountMetas[11];
    marketplaceProgram: TAccountMetas[12];
    escrowProgram: TAccountMetas[13];
    cosigner?: TAccountMetas[14] | undefined;
    /** intentionally not deserializing, it would be dummy in the case of VOC/FVC based verification */
    mintProof: TAccountMetas[15];
    rentDestination: TAccountMetas[16];
  };
  data: TakeBidCoreInstructionData;
};

export function parseTakeBidCoreInstruction<
  TProgram extends string,
  TAccountMetas extends readonly IAccountMeta[],
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
    return accountMeta.address === TENSOR_MARKETPLACE_PROGRAM_ADDRESS
      ? undefined
      : accountMeta;
  };
  return {
    programAddress: instruction.programAddress,
    accounts: {
      feeVault: getNextAccount(),
      seller: getNextAccount(),
      bidState: getNextAccount(),
      owner: getNextAccount(),
      takerBroker: getNextOptionalAccount(),
      makerBroker: getNextOptionalAccount(),
      sharedEscrow: getNextAccount(),
      whitelist: getNextAccount(),
      asset: getNextAccount(),
      collection: getNextOptionalAccount(),
      mplCoreProgram: getNextAccount(),
      systemProgram: getNextAccount(),
      marketplaceProgram: getNextAccount(),
      escrowProgram: getNextAccount(),
      cosigner: getNextOptionalAccount(),
      mintProof: getNextAccount(),
      rentDestination: getNextAccount(),
    },
    data: getTakeBidCoreInstructionDataDecoder().decode(instruction.data),
  };
}
