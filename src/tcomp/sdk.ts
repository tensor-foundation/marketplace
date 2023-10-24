import {
  BN,
  BorshCoder,
  Coder,
  EventParser,
  Instruction,
  Program,
  Provider,
} from "@coral-xyz/anchor";
import {
  getLeafAssetId,
  MetadataArgs,
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  TokenProgramVersion,
  TokenStandard,
  UseMethod,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  AuthorizationData,
  Creator,
  Uses,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  AccountInfo,
  Commitment,
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionResponse,
} from "@solana/web3.js";
import {
  AnchorDiscMap,
  AUTH_PROG_ID,
  decodeAnchorAcct,
  findMetadataPda,
  genDiscToDecoderMap,
  genIxDiscHexMap,
  getAccountRent,
  getAccountRentSync,
  hexCode,
  isNullLike,
  parseAnchorIxs,
  ParsedAnchorIx,
  prepPnftAccounts,
  TENSORSWAP_ADDR,
  TMETA_PROG_ID,
  TSWAP_COSIGNER,
  TSWAP_OWNER,
} from "@tensor-hq/tensor-common";
import { findMintProofPDA, findTSwapPDA } from "@tensor-oss/tensorswap-sdk";
import * as borsh from "borsh";
import bs58 from "bs58";
import {
  AccountSuffix,
  DEFAULT_COMPUTE_UNITS,
  DEFAULT_MICRO_LAMPORTS,
  DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
  parseStrFn,
} from "../shared";
import { ParsedAccount } from "../types";
import { TCOMP_ADDR } from "./constants";
import {
  findBidStatePda,
  findListStatePda,
  findNftEscrowPda,
  findTCompPda,
  findTreeAuthorityPda,
} from "./pda";
import { IDL as IDL_latest, Tcomp as TComp_latest } from "./idl/tcomp";
import { IDL as IDL_v0_1_0, Tcomp as TComp_v0_1_0 } from "./idl/tcomp_v0_1_0";
import { IDL as IDL_v0_4_0, Tcomp as TComp_v0_4_0 } from "./idl/tcomp_v0_4_0";
import { IDL as IDL_v0_6_0, Tcomp as TComp_v0_6_0 } from "./idl/tcomp_v0_6_0";
import {
  IDL as IDL_v0_11_0,
  Tcomp as TComp_v0_11_0,
} from "./idl/tcomp_v0_11_0";

export { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";

// --------------------------------------- idl

//original deployment
export const TCompIDL_v0_1_0 = IDL_v0_1_0;
export const TCompIDL_v0_1_0_EffSlot = 0;

//add noop ixs to cancel bid/listing https://solscan.io/tx/5fyrggiyFujwfyB624P9WbjVSRtnwee5wzP6CHNRSvg15xAovNAE1FdgPXVDEaZ9x6BKsVpMnEjmLkoCT8ZhSnRU
export const TCompIDL_v0_4_0 = IDL_v0_4_0;
export const TCompIDL_v0_4_0_EffSlot = 195759029;

//add asset id to events https://solscan.io/tx/4ZrW4gn3wrjvytaycVRWf2gU2UZJVeHpDKDVbE8KVfXWpugTiKZtPsAkuxjwdvCKEnnV8Y8U5MwCCVguRszR6wcV
export const TCompIDL_v0_6_0 = IDL_v0_6_0;
export const TCompIDL_v0_6_0_EffSlot = 195759029;

//add optional cosigner https://solscan.io/tx/2zEnwiJKJq4ckfLGdKD4p8hiMWEFY6qvd5yiW7QpZxAdcBMbCDK8cnxpnNfpU1x8HC7csEurSC4mbHzAKdfr45Yc
export const TCompIDL_v0_11_0 = IDL_v0_11_0;
export const TCompIDL_v0_11_0_EffSlot = 225359236;

//add proof account for legacy take bid https://solscan.io/tx/2MELxB2wAWp3UVaEmktNJeA85vhVhuerfaw7M4hgCx4wjqLrsJ3xQNMgKyypy17MyV8Meem9G5WX1pmoci5XSrK
export const TCompIDL_latest = IDL_latest;
export const TCompIDL_latest_EffSlot = 225783471;

export type TcompIDL =
  | TComp_v0_1_0
  | TComp_v0_4_0
  | TComp_v0_6_0
  | TComp_v0_11_0
  | TComp_latest;

// Use this function to figure out which IDL to use based on the slot # of historical txs.
export const triageTCompIDL = (slot: number | bigint): TcompIDL | null => {
  if (slot < TCompIDL_v0_1_0_EffSlot) return null;
  if (slot < TCompIDL_v0_4_0_EffSlot) return TCompIDL_v0_1_0;
  if (slot < TCompIDL_v0_6_0_EffSlot) return TCompIDL_v0_4_0;
  if (slot < TCompIDL_v0_11_0_EffSlot) return TCompIDL_v0_6_0;
  if (slot < TCompIDL_latest_EffSlot) return TCompIDL_v0_11_0;
  return TCompIDL_latest;
};

export type ParsedTCompIx = ParsedAnchorIx<TcompIDL>;

// --------------------------------------- constants

export const CURRENT_TCOMP_VERSION: number = +IDL_latest.constants.find(
  (c) => c.name === "CURRENT_TCOMP_VERSION"
)!.value;
export const TCOMP_FEE_BPS: number = +IDL_latest.constants.find(
  (c) => c.name === "TCOMP_FEE_BPS"
)!.value;
export const TAKER_BROKER_PCT: number = +IDL_latest.constants.find(
  (c) => c.name === "TAKER_BROKER_PCT"
)!.value;
export const LIST_STATE_SIZE: number = parseStrFn(
  IDL_latest.constants.find((c) => c.name === "LIST_STATE_SIZE")!.value
);
export const BID_STATE_SIZE: number = parseStrFn(
  IDL_latest.constants.find((c) => c.name === "BID_STATE_SIZE")!.value
);
export const MAX_EXPIRY_SEC: number = +IDL_latest.constants.find(
  (c) => c.name === "MAX_EXPIRY_SEC"
)!.value;

export const APPROX_BID_STATE_RENT = getAccountRentSync(BID_STATE_SIZE);
export const APPROX_LIST_STATE_RENT = getAccountRentSync(LIST_STATE_SIZE);

// --------------------------------------- types (target)

export const TargetAnchor = {
  AssetId: { assetId: {} },
  Whitelist: { whitelist: {} },
};
type TargetAnchor = (typeof TargetAnchor)[keyof typeof TargetAnchor];

export const targetU8 = (target: TargetAnchor): 0 | 1 => {
  const t: Record<string, 0 | 1> = {
    assetId: 0,
    whitelist: 1,
  };
  return t[Object.keys(target)[0]];
};

export const targetFromU8 = (n: number): Target => {
  return Object.values(Target)[n];
};

export enum Target {
  AssetId = "AssetId",
  Whitelist = "Whitelist",
}

export const castTargetAnchor = (target: TargetAnchor): Target =>
  ({
    0: Target.AssetId,
    1: Target.Whitelist,
  }[targetU8(target)]);

export const castTarget = (target: Target): TargetAnchor => {
  switch (target) {
    case Target.AssetId:
      return TargetAnchor.AssetId;
    case Target.Whitelist:
      return TargetAnchor.Whitelist;
  }
};

// --------------------------------------- types (field)

export const FieldAnchor = {
  Name: { name: {} },
};
type FieldAnchor = (typeof FieldAnchor)[keyof typeof FieldAnchor];

export const fieldU8 = (target: FieldAnchor): 0 => {
  const t: Record<string, 0> = {
    name: 0,
  };
  return t[Object.keys(target)[0]];
};

export const fieldFromU8 = (n: number): Field => {
  return Object.values(Field)[n];
};

export enum Field {
  Name = "Name",
}

export const castFieldAnchor = (target: FieldAnchor): Field =>
  ({
    0: Field.Name,
  }[fieldU8(target)]);

export const castField = (target: Field): FieldAnchor => {
  switch (target) {
    case Field.Name:
      return FieldAnchor.Name;
  }
};

// --------------------------------------- types (rest)

export const TokenStandardAnchor = {
  NonFungible: { nonFungible: {} },
  FungibleAsset: { fungibleAsset: {} },
  Fungible: { fungible: {} },
  NonFungibleEdition: { nonFungibleEdition: {} },
};
export type TokenStandardAnchor =
  (typeof TokenStandardAnchor)[keyof typeof TokenStandardAnchor];
export const castTokenStandard = (
  t: TokenStandard | null
): TokenStandardAnchor | null => {
  if (isNullLike(t)) return null;
  switch (t) {
    case TokenStandard.Fungible:
      return TokenStandardAnchor.Fungible;
    case TokenStandard.NonFungible:
      return TokenStandardAnchor.NonFungible;
    case TokenStandard.NonFungibleEdition:
      return TokenStandardAnchor.NonFungibleEdition;
    case TokenStandard.FungibleAsset:
      return TokenStandardAnchor.FungibleAsset;
  }
};

export const UseMethodAnchor = {
  Burn: { burn: {} },
  Multiple: { multiple: {} },
  Single: { single: {} },
};
export type UseMethodAnchor =
  (typeof UseMethodAnchor)[keyof typeof UseMethodAnchor];
export const castUseMethod = (u: UseMethod): UseMethodAnchor => {
  switch (u) {
    case UseMethod.Burn:
      return UseMethodAnchor.Burn;
    case UseMethod.Single:
      return UseMethodAnchor.Single;
    case UseMethod.Multiple:
      return UseMethodAnchor.Multiple;
  }
};

export type UsesAnchor = {
  useMethod: UseMethodAnchor;
  remaining: BN;
  total: BN;
};
export const castUses = (u: Uses | null): UsesAnchor | null => {
  if (isNullLike(u)) return null;
  return {
    useMethod: castUseMethod(u.useMethod),
    remaining: new BN(u.remaining),
    total: new BN(u.total),
  };
};

const TokenProgramVersionAnchor = {
  Original: { original: {} },
  Token2022: { token2022: {} },
};
export type TokenProgramVersionAnchor =
  (typeof TokenProgramVersionAnchor)[keyof typeof TokenProgramVersionAnchor];
export const castTokenProgramVersion = (
  t: TokenProgramVersion
): TokenProgramVersionAnchor => {
  switch (t) {
    case TokenProgramVersion.Original:
      return TokenProgramVersionAnchor.Original;
    case TokenProgramVersion.Token2022:
      return TokenProgramVersionAnchor.Token2022;
  }
};

export type MetadataArgsAnchor = Omit<
  MetadataArgs,
  "tokenStandard" | "uses" | "tokenProgramVersion" | "creators"
> & {
  tokenStandard: TokenStandardAnchor | null;
  uses: UsesAnchor | null;
  tokenProgramVersion: TokenProgramVersionAnchor;
  creatorShares: Buffer;
  creatorVerified: boolean[];
};
export const castMetadata = (m: MetadataArgs): MetadataArgsAnchor => {
  const { creators, ...metaWithoutCreators } = m;
  return {
    ...metaWithoutCreators,
    tokenStandard: castTokenStandard(m.tokenStandard),
    uses: castUses(m.uses),
    tokenProgramVersion: castTokenProgramVersion(m.tokenProgramVersion),
    creatorShares: Buffer.from(creators.map((c) => c.share)),
    creatorVerified: creators.map((c) => c.verified),
  };
};

// --------------------------------------- state structs & events

export type BidStateAnchor = {
  version: number;
  bump: number[];
  owner: PublicKey;
  bidId: PublicKey;
  target: TargetAnchor;
  targetId: PublicKey;
  field?: FieldAnchor;
  fieldId?: PublicKey;
  quantity: number;
  filledQuantity: number;
  amount: BN;
  currency: PublicKey | null;
  expiry: BN;
  privateTaker: PublicKey | null;
  makerBroker: PublicKey | null;
  margin: PublicKey | null;
  updatedAt: BN;
  cosigner: PublicKey;
};
export type ListStateAnchor = {
  version: number;
  bump: number[];
  owner: PublicKey;
  assetId: PublicKey;
  amount: BN;
  currency: PublicKey | null;
  expiry: BN;
  privateTaker: PublicKey | null;
  makerBroker: PublicKey | null;
};

export type TCompPdaAnchor = BidStateAnchor | ListStateAnchor;
export type TaggedTCompPdaAnchor =
  | {
      name: "bidState";
      account: BidStateAnchor;
    }
  | {
      name: "listState";
      account: ListStateAnchor;
    };

// --------------------------------------- sdk

type PnftArgs = {
  /** If provided, skips RPC call to fetch on-chain metadata + creators. */
  metaCreators?: {
    metadata: PublicKey;
    creators: PublicKey[];
  };
  authData?: AuthorizationData | null;
  /** passing in null or undefined means these ixs are NOT included */
  compute?: number | null;
  /** If a ruleSet is present, we add this many additional */
  ruleSetAddnCompute?: number | null;
  priorityMicroLamports?: number | null;
};

export class TCompSDK {
  program: Program<TcompIDL>;
  discMap: AnchorDiscMap<TcompIDL>;
  coder: BorshCoder;
  eventParser: EventParser;

  constructor({
    idl = IDL_latest,
    addr = TCOMP_ADDR,
    provider,
    coder,
  }: {
    idl?: any;
    addr?: PublicKey;
    provider?: Provider;
    coder?: Coder;
  }) {
    this.program = new Program<TcompIDL>(idl, addr, provider, coder);
    this.discMap = genDiscToDecoderMap(this.program);
    this.coder = new BorshCoder(idl);
    this.eventParser = new EventParser(addr, this.coder);
  }

  // --------------------------------------- fetchers

  async fetchBidState(bidState: PublicKey, commitment?: Commitment) {
    return (await this.program.account.bidState.fetch(
      bidState,
      commitment
    )) as BidStateAnchor;
  }

  async fetchListState(listState: PublicKey, commitment?: Commitment) {
    return (await this.program.account.listState.fetch(
      listState,
      commitment
    )) as ListStateAnchor;
  }

  // --------------------------------------- account methods

  decode(acct: AccountInfo<Buffer>): TaggedTCompPdaAnchor | null {
    if (!acct.owner.equals(this.program.programId)) return null;
    return decodeAnchorAcct<TcompIDL>(acct, this.discMap);
  }

  // --------------------------------------- ixs

  async list({
    merkleTree,
    owner,
    delegate = owner,
    proof,
    root,
    dataHash,
    creatorsHash,
    nonce,
    index,
    amount,
    expireInSec = null,
    currency = null,
    makerBroker = null,
    privateTaker = null,
    payer = null,
    compute = DEFAULT_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0,
    delegateSigner,
  }: {
    merkleTree: PublicKey;
    owner: PublicKey;
    delegate?: PublicKey;
    proof: Buffer[];
    root: number[];
    dataHash: Buffer;
    creatorsHash: Buffer;
    //in most cases nonce == index and doesn't need to passed in separately
    nonce?: BN;
    index: number;
    amount: BN;
    expireInSec?: BN | null;
    currency?: PublicKey | null;
    makerBroker?: PublicKey | null;
    privateTaker?: PublicKey | null;
    payer?: PublicKey | null;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    canopyDepth?: number;
    delegateSigner?: boolean;
  }) {
    nonce = nonce ?? new BN(index);

    const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
    const assetId = await getLeafAssetId(merkleTree, nonce);
    const [listState] = findListStatePda({ assetId });

    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false,
    }));

    const builder = this.program.methods
      .list(
        nonce,
        index,
        root,
        [...dataHash],
        [...creatorsHash],
        amount,
        expireInSec,
        currency,
        privateTaker,
        makerBroker
      )
      .accounts({
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        tcompProgram: TCOMP_ADDR,
        merkleTree,
        treeAuthority,
        delegate,
        owner,
        listState,
        payer: payer ?? owner,
      })
      .remainingAccounts(proofPath);

    //because EITHER of the two has to sign, mark one of them as signer
    const ix = await builder.instruction();
    if (!!delegate && delegateSigner) {
      const i = ix.keys.findIndex((k) => k.pubkey.equals(delegate));
      ix["keys"][i]["isSigner"] = true;
    } else {
      const i = ix.keys.findIndex((k) => k.pubkey.equals(owner));
      ix["keys"][i]["isSigner"] = true;
    }

    const computeIxs = getTotalComputeIxs(compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs: [...computeIxs, ix],
        extraSigners: [],
      },
      treeAuthority,
      assetId,
      listState,
      proofPath,
    };
  }

  async edit({
    owner,
    listState,
    amount,
    expireInSec = null,
    currency = null,
    privateTaker = null,
    makerBroker = null,
    // Not a heavy ix, no need
    compute = null,
    priorityMicroLamports = null,
  }: {
    owner: PublicKey;
    listState: PublicKey;
    amount: BN;
    expireInSec?: BN | null;
    currency?: PublicKey | null;
    privateTaker?: PublicKey | null;
    makerBroker?: PublicKey | null;
    compute?: number | null;
    priorityMicroLamports?: number | null;
  }) {
    const builder = this.program.methods
      .edit(amount, expireInSec, currency, privateTaker, makerBroker)
      .accounts({
        owner,
        listState,
        tcompProgram: TCOMP_ADDR,
      });

    const computeIxs = getTotalComputeIxs(compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs: [...computeIxs, await builder.instruction()],
        extraSigners: [],
      },
    };
  }

  async delist({
    merkleTree,
    owner,
    proof,
    root,
    dataHash,
    creatorsHash,
    nonce,
    index,
    compute = DEFAULT_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0,
  }: {
    merkleTree: PublicKey;
    owner: PublicKey;
    proof: Buffer[];
    root: number[];
    dataHash: Buffer;
    creatorsHash: Buffer;
    //in most cases nonce == index and doesn't need to passed in separately
    nonce?: BN;
    index: number;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    canopyDepth?: number;
  }) {
    nonce = nonce ?? new BN(index);

    const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
    const assetId = await getLeafAssetId(merkleTree, nonce);
    const [listState] = findListStatePda({ assetId });

    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false,
    }));

    const builder = this.program.methods
      .delist(nonce, index, root, [...dataHash], [...creatorsHash])
      .accounts({
        tcompProgram: TCOMP_ADDR,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        merkleTree,
        treeAuthority,
        owner,
        listState,
      })
      .remainingAccounts(proofPath);

    const computeIxs = getTotalComputeIxs(compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs: [...computeIxs, await builder.instruction()],
        extraSigners: [],
      },
      treeAuthority,
      assetId,
      listState,
      proofPath,
    };
  }

  async buy({
    merkleTree,
    proof,
    root,
    metaHash,
    creators,
    sellerFeeBasisPoints,
    nonce,
    index,
    maxAmount,
    currency = null,
    makerBroker = null,
    optionalRoyaltyPct = 100,
    owner,
    buyer,
    payer = null,
    takerBroker = null,
    compute = DEFAULT_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0,
  }: {
    merkleTree: PublicKey;
    proof: Buffer[];
    root: number[];
    metaHash: Buffer;
    creators: Creator[];
    sellerFeeBasisPoints: number;
    //in most cases nonce == index and doesn't need to passed in separately
    nonce?: BN;
    index: number;
    maxAmount: BN;
    currency?: PublicKey | null;
    makerBroker?: PublicKey | null;
    optionalRoyaltyPct?: number | null;
    owner: PublicKey;
    buyer: PublicKey;
    payer?: PublicKey | null;
    takerBroker?: PublicKey | null;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    canopyDepth?: number;
  }) {
    nonce = nonce ?? new BN(index);

    const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
    const [tcomp] = findTCompPda({});
    const assetId = await getLeafAssetId(merkleTree, nonce);
    const [listState] = findListStatePda({ assetId });

    let creatorsPath = creators.map((c) => ({
      pubkey: c.address,
      isSigner: false,
      isWritable: true,
    }));
    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false,
    }));

    const builder = this.program.methods
      .buy(
        nonce,
        index,
        root,
        [...metaHash],
        Buffer.from(creators.map((c) => c.share)),
        creators.map((c) => c.verified),
        sellerFeeBasisPoints,
        maxAmount,
        currency,
        makerBroker,
        optionalRoyaltyPct
      )
      .accounts({
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        tcompProgram: TCOMP_ADDR,
        merkleTree,
        treeAuthority,
        buyer,
        payer: payer ?? buyer,
        owner,
        listState,
        tcomp,
        takerBroker: takerBroker ?? tcomp,
        makerBroker: makerBroker ?? tcomp,
      })
      .remainingAccounts([...creatorsPath, ...proofPath]);

    const computeIxs = getTotalComputeIxs(compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs: [...computeIxs, await builder.instruction()],
        extraSigners: [],
      },
      listState,
      treeAuthority,
      tcomp,
      creators,
      proofPath,
    };
  }

  async bid({
    target,
    targetId,
    bidId = targetId,
    field = null,
    fieldId = null,
    quantity = 1,
    owner,
    amount,
    expireInSec = null,
    currency = null,
    makerBroker = null,
    privateTaker = null,
    compute = DEFAULT_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    margin = null,
    cosigner = null,
  }: {
    target: Target;
    targetId: PublicKey;
    bidId?: PublicKey;
    field?: Field | null;
    fieldId?: PublicKey | null;
    quantity?: number;
    owner: PublicKey;
    amount: BN;
    expireInSec?: BN | null;
    currency?: PublicKey | null;
    makerBroker?: PublicKey | null;
    privateTaker?: PublicKey | null;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    margin?: PublicKey | null;
    cosigner?: PublicKey | null;
  }) {
    const [bidState] = findBidStatePda({ bidId, owner });

    const builder = this.program.methods
      .bid(
        bidId,
        castTarget(target),
        targetId,
        field ? castField(field) : null,
        fieldId,
        amount,
        quantity,
        expireInSec,
        currency,
        privateTaker,
        makerBroker
      )
      .accounts({
        owner,
        systemProgram: SystemProgram.programId,
        tcompProgram: TCOMP_ADDR,
        bidState,
        marginAccount: margin ?? owner,
        cosigner: cosigner ?? owner,
      });

    const computeIxs = getTotalComputeIxs(compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs: [...computeIxs, await builder.instruction()],
        extraSigners: [],
      },
      bidState,
    };
  }

  async cancelBid({
    bidId,
    owner,
    compute = null,
    priorityMicroLamports = null,
  }: {
    bidId: PublicKey;
    owner: PublicKey;
    compute?: number | null;
    priorityMicroLamports?: number | null;
  }) {
    const [bidState] = findBidStatePda({ bidId, owner });

    const builder = this.program.methods.cancelBid().accounts({
      tcompProgram: TCOMP_ADDR,
      owner,
      systemProgram: SystemProgram.programId,
      bidState,
    });

    const computeIxs = getTotalComputeIxs(compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs: [...computeIxs, await builder.instruction()],
        extraSigners: [],
      },
      bidState,
    };
  }

  async closeExpiredBid({
    bidId,
    owner,
    compute = null,
    priorityMicroLamports = null,
  }: {
    bidId: PublicKey;
    owner: PublicKey;
    compute?: number | null;
    priorityMicroLamports?: number | null;
  }) {
    const [bidState] = findBidStatePda({ bidId, owner });

    const builder = this.program.methods.closeExpiredBid().accounts({
      tcompProgram: TCOMP_ADDR,
      owner,
      systemProgram: SystemProgram.programId,
      bidState,
    });

    const computeIxs = getTotalComputeIxs(compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs: [...computeIxs, await builder.instruction()],
        extraSigners: [],
      },
      bidState,
    };
  }

  async closeExpiredListing({
    merkleTree,
    owner,
    proof,
    root,
    dataHash,
    creatorsHash,
    nonce,
    index,
    compute = DEFAULT_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0,
  }: {
    merkleTree: PublicKey;
    owner: PublicKey;
    proof: Buffer[];
    root: number[];
    dataHash: Buffer;
    creatorsHash: Buffer;
    //in most cases nonce == index and doesn't need to passed in separately
    nonce?: BN;
    index: number;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    canopyDepth?: number;
  }) {
    nonce = nonce ?? new BN(index);

    const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
    const assetId = await getLeafAssetId(merkleTree, nonce);
    const [listState] = findListStatePda({ assetId });

    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false,
    }));

    const builder = this.program.methods
      .closeExpiredListing(nonce, index, root, [...dataHash], [...creatorsHash])
      .accounts({
        tcompProgram: TCOMP_ADDR,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        merkleTree,
        treeAuthority,
        owner,
        listState,
      })
      .remainingAccounts(proofPath);

    const computeIxs = getTotalComputeIxs(compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs: [...computeIxs, await builder.instruction()],
        extraSigners: [],
      },
      treeAuthority,
      assetId,
      listState,
      proofPath,
    };
  }

  async takeBid({
    targetData,
    bidId,
    merkleTree,
    proof,
    root,
    nonce,
    index,
    minAmount,
    currency = null,
    makerBroker = null,
    optionalRoyaltyPct = 100,
    owner,
    seller,
    delegate = seller,
    margin = null,
    takerBroker = null,
    compute = DEFAULT_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0,
    whitelist = null,
    delegateSigner,
    cosigner = null,
  }: {
    targetData:
      | {
          target: "assetIdOrFvcWithoutField";
          data: {
            metaHash: Buffer;
            creators: Creator[];
            sellerFeeBasisPoints: number;
          };
        }
      | { target: "rest"; data: { metadata: MetadataArgs } };
    bidId: PublicKey;
    merkleTree: PublicKey;
    proof: Buffer[];
    root: number[];
    //in most cases nonce == index and doesn't need to passed in separately
    nonce?: BN;
    index: number;
    minAmount: BN;
    currency?: PublicKey | null;
    makerBroker?: PublicKey | null;
    optionalRoyaltyPct?: number | null;
    owner: PublicKey;
    seller: PublicKey;
    delegate?: PublicKey;
    margin?: PublicKey | null;
    takerBroker?: PublicKey | null;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    canopyDepth?: number;
    whitelist?: PublicKey | null;
    delegateSigner?: boolean;
    cosigner?: PublicKey | null;
  }) {
    nonce = nonce ?? new BN(index);

    const creators =
      targetData.target === "rest"
        ? targetData.data.metadata.creators
        : targetData.data.creators;

    const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
    const [tcomp] = findTCompPda({});
    const [bidState] = findBidStatePda({ bidId, owner });

    let creatorsPath = creators.map((c) => ({
      pubkey: c.address,
      isSigner: false,
      isWritable: true,
    }));
    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false,
    }));

    const accounts = {
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
      tcompProgram: TCOMP_ADDR,
      merkleTree,
      treeAuthority,
      seller,
      owner,
      bidState,
      tcomp,
      takerBroker: takerBroker ?? tcomp,
      makerBroker: makerBroker ?? tcomp,
      delegate: delegate,
      marginAccount: margin ?? seller,
      tensorswapProgram: TENSORSWAP_ADDR,
      whitelist: whitelist ?? TENSORSWAP_ADDR,
      cosigner: cosigner ?? delegate ?? seller,
    };
    const remAccounts = [...creatorsPath, ...proofPath];

    let builder;
    if (targetData.target === "assetIdOrFvcWithoutField") {
      // preferred branch
      builder = this.program.methods
        .takeBidMetaHash(
          nonce,
          index,
          root,
          [...targetData.data.metaHash],
          Buffer.from(creators.map((c) => c.share)),
          creators.map((c) => c.verified),
          targetData.data.sellerFeeBasisPoints,
          minAmount,
          currency,
          makerBroker,
          optionalRoyaltyPct
        )
        .accounts(accounts)
        .remainingAccounts(remAccounts);
    } else {
      //VOC + name
      builder = this.program.methods
        .takeBidFullMeta(
          nonce,
          index,
          root,
          castMetadata(targetData.data.metadata),
          minAmount,
          currency,
          makerBroker,
          optionalRoyaltyPct
        )
        .accounts(accounts)
        .remainingAccounts(remAccounts);
    }

    const computeIxs = getTotalComputeIxs(compute, priorityMicroLamports);

    //because EITHER of the two has to sign, mark one of them as signer
    const ix = await builder.instruction();
    if (!!delegate && delegateSigner) {
      const i = ix.keys.findIndex((k) => k.pubkey.equals(delegate));
      ix["keys"][i]["isSigner"] = true;
    } else {
      const i = ix.keys.findIndex((k) => k.pubkey.equals(seller));
      ix["keys"][i]["isSigner"] = true;
    }

    return {
      builder,
      tx: {
        ixs: [...computeIxs, ix],
        extraSigners: [],
      },
      bidState,
      treeAuthority,
      tcomp,
      creators,
      proofPath,
    };
  }

  async takeBidLegacy({
    bidId,
    nftMint,
    nftSellerAcc,
    owner,
    seller,
    minAmount,
    currency = null,
    makerBroker = null,
    optionalRoyaltyPct = 100,
    margin = null,
    takerBroker = null,
    whitelist = null,
    /** pnft args */
    metaCreators,
    authData = null,
    compute = 800_000, // pnfts are expensive
    ruleSetAddnCompute = DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    cosigner = null,
  }: {
    bidId: PublicKey;
    nftMint: PublicKey;
    nftSellerAcc: PublicKey;
    owner: PublicKey;
    seller: PublicKey;
    minAmount: BN;
    currency?: PublicKey | null;
    makerBroker?: PublicKey | null;
    optionalRoyaltyPct?: number | null;
    margin?: PublicKey | null;
    takerBroker?: PublicKey | null;
    whitelist?: PublicKey | null;
    cosigner?: PublicKey | null;
  } & PnftArgs) {
    const [tcomp] = findTCompPda({});
    const ownerAtaAcc = getAssociatedTokenAddressSync(nftMint, owner, true);
    const nftMetadata = findMetadataPda(nftMint)[0];
    const [bidState] = findBidStatePda({ bidId, owner });
    const [escrowPda] = findNftEscrowPda({ nftMint });
    const mintProofPda = whitelist
      ? findMintProofPDA({ mint: nftMint, whitelist })[0]
      : SystemProgram.programId;

    //prepare 2 pnft account sets
    const [
      {
        creators,
        ownerTokenRecordPda,
        destTokenRecordPda: escrowDestTokenRecordPda,
        ruleSet,
        nftEditionPda,
        authDataSerialized,
      },
      { destTokenRecordPda: tokenDestTokenRecordPda },
    ] = await Promise.all([
      prepPnftAccounts({
        connection: this.program.provider.connection,
        metaCreators,
        nftMint,
        destAta: escrowPda,
        authData,
        sourceAta: nftSellerAcc,
      }),
      prepPnftAccounts({
        connection: this.program.provider.connection,
        metaCreators,
        nftMint,
        destAta: ownerAtaAcc,
        authData,
        sourceAta: nftSellerAcc,
      }),
    ]);

    const builder = this.program.methods
      .takeBidLegacy(
        minAmount,
        currency,
        makerBroker,
        optionalRoyaltyPct,
        !!ruleSet,
        authDataSerialized
      )
      .accounts({
        tcomp,
        seller,
        bidState,
        owner,
        takerBroker: takerBroker ?? tcomp,
        makerBroker: makerBroker ?? tcomp,
        marginAccount: margin ?? seller,
        whitelist: whitelist ?? TENSORSWAP_ADDR,
        nftSellerAcc,
        nftMint,
        nftMetadata,
        ownerAtaAcc,
        nftEdition: nftEditionPda,
        ownerTokenRecord: ownerTokenRecordPda,
        destTokenRecord: tokenDestTokenRecordPda,
        pnftShared: {
          authorizationRulesProgram: AUTH_PROG_ID,
          tokenMetadataProgram: TMETA_PROG_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        nftEscrow: escrowPda,
        tempEscrowTokenRecord: escrowDestTokenRecordPda,
        authRules: ruleSet ?? SystemProgram.programId,

        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        tcompProgram: TCOMP_ADDR,
        tensorswapProgram: TENSORSWAP_ADDR,
        cosigner: cosigner ?? seller,
        mintProof: mintProofPda,
      })
      .remainingAccounts(
        creators.map((c) => ({
          pubkey: c,
          isSigner: false,
          isWritable: true,
        }))
      );

    const ruleSetCompute = ruleSet ? ruleSetAddnCompute : null;
    const computeIxs = getTotalComputeIxs(
      isNullLike(compute) && isNullLike(ruleSetCompute)
        ? null
        : (compute ?? 0) + (ruleSetCompute ?? 0),
      priorityMicroLamports
    );
    const ix = await builder.instruction();

    return {
      builder,
      tx: {
        ixs: [...computeIxs, ix],
        extraSigners: [],
      },
      bidState,
      tcomp,
      creators,
      ownerAtaAcc,
    };
  }

  async withdrawFees({
    lamports,
    destination,
    owner = TSWAP_OWNER,
    cosigner = TSWAP_COSIGNER,
  }: {
    owner?: PublicKey;
    cosigner?: PublicKey;
    lamports: BN;
    destination: PublicKey;
  }) {
    const tswap = findTSwapPDA({})[0];
    const tcomp = findTCompPda({})[0];

    const builder = this.program.methods.withdrawFees(lamports).accounts({
      tswap,
      tcomp,
      cosigner,
      owner,
      destination,
      systemProgram: SystemProgram.programId,
    });
    const ix = await builder.instruction();
    return {
      builder,
      tx: {
        ixs: [ix],
        extraSigners: [],
      },
    };
  }

  // --------------------------------------- helpers

  async getBidStateRent() {
    return await getAccountRent(
      this.program.provider.connection,
      this.program.account.bidState
    );
  }

  async getListStateRent() {
    return await getAccountRent(
      this.program.provider.connection,
      this.program.account.listState
    );
  }

  getError(
    name: (typeof IDL_latest)["errors"][number]["name"]
  ): (typeof IDL_latest)["errors"][number] {
    //@ts-ignore (throwing weird ts errors for me)
    return this.program.idl.errors.find((e) => e.name === name)!;
  }

  getErrorCodeHex(name: (typeof IDL_latest)["errors"][number]["name"]): string {
    return hexCode(this.getError(name).code);
  }

  // --------------------------------------- parsing raw txs

  parseIxs(tx: TransactionResponse): ParsedTCompIx[] {
    return parseAnchorIxs<TcompIDL>({
      coder: this.coder,
      tx,
      programId: this.program.programId,
      noopIxDiscHex: TCOMP_DISC_MAP.tcompNoop,
    });
  }

  getEvent(ix: ParsedTCompIx): TakeEvent | MakeEvent | null {
    if (!ix.noopIxs?.length) return null;
    const cpiData = Buffer.from(bs58.decode(ix.noopIxs[0].data));
    return deserializeTcompEvent(cpiData);
  }

  // FYI: accounts under InstructioNDisplay is the space-separated capitalized
  // version of the fields for the corresponding #[Accounts].
  // eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  // shared.sol_escrow -> "Shared > Sol Escrow"
  getAccountByName(
    ix: ParsedTCompIx,
    name: AccountSuffix
  ): ParsedAccount | undefined {
    // We use endsWith since composite nested accounts (eg shared.sol_escrow)
    // will prefix it as "Shared > Sol Escrow"
    return ix.formatted?.accounts.find((acc) => acc.name?.endsWith(name));
  }
}

export const getTotalComputeIxs = (
  compute: number | null,
  priorityMicroLamports: number | null
) => {
  const finalIxs = [];
  //optionally include extra compute]
  if (!isNullLike(compute)) {
    finalIxs.push(
      ComputeBudgetProgram.setComputeUnitLimit({
        units: compute,
      })
    );
  }
  //optionally include priority fee
  if (!isNullLike(priorityMicroLamports)) {
    finalIxs.push(
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: priorityMicroLamports,
      })
    );
  }
  return finalIxs;
};

// --------------------------------------- events

// Sucks but have to type this out, else cant compose types
export type MakeEvent = {
  type: "maker";
  maker: PublicKey;
  bidId: PublicKey | null;
  target: Target;
  targetId: PublicKey;
  field: Field | null;
  fieldId: PublicKey | null;
  amount: BN;
  quantity: number;
  currency: PublicKey | null;
  expiry: BN;
  privateTaker: PublicKey | null;
  assetId: PublicKey | null;
};
class MakeEventRaw {
  maker!: PublicKey;
  bidId!: PublicKey | null;
  target!: number;
  targetId!: PublicKey;
  field!: number | null;
  fieldId!: PublicKey | null;
  amount!: BN;
  quantity!: number;
  currency!: PublicKey | null;
  expiry!: BN;
  privateTaker!: PublicKey | null;
  assetId!: PublicKey | null;

  constructor(fields?: Partial<MakeEventRaw>) {
    Object.assign(this, fields);
  }
}
export const makeEventSchema = new Map([
  [
    MakeEventRaw,
    {
      kind: "struct",
      fields: [
        ["maker", [32]],
        ["bidId", { kind: "option", type: [32] }],
        ["target", "u8"],
        ["targetId", [32]],
        ["field", { kind: "option", type: "u8" }],
        ["fieldId", { kind: "option", type: [32] }],
        ["amount", "u64"],
        ["quantity", "u32"],
        ["currency", { kind: "option", type: [32] }],
        ["expiry", "u64"],
        ["privateTaker", { kind: "option", type: [32] }],
        ["assetId", { kind: "option", type: [32] }],
      ],
    },
  ],
]);

export type TakeEvent = {
  type: "taker";
  taker: PublicKey;
  bidId: PublicKey | null;
  target: Target;
  targetId: PublicKey;
  field: Field | null;
  fieldId: PublicKey | null;
  amount: BN;
  quantity: number;
  tcompFee: BN;
  takerBrokerFee: BN;
  makerBrokerFee: BN;
  creatorFee: BN;
  currency: PublicKey | null;
  assetId: PublicKey | null;
};
export class TakeEventRaw {
  taker!: PublicKey;
  bidId!: PublicKey | null;
  target!: number;
  targetId!: PublicKey;
  field!: number | null;
  fieldId!: PublicKey | null;
  amount!: BN;
  quantity!: number;
  tcompFee!: BN;
  takerBrokerFee!: BN;
  makerBrokerFee!: BN;
  creatorFee!: BN;
  currency!: PublicKey | null;
  assetId!: PublicKey | null;

  constructor(fields?: Partial<TakeEventRaw>) {
    Object.assign(this, fields);
  }
}
export const takeEventSchema = new Map([
  [
    TakeEventRaw,
    {
      kind: "struct",
      fields: [
        ["taker", [32]],
        ["bidId", { kind: "option", type: [32] }],
        ["target", "u8"],
        ["targetId", [32]],
        ["field", { kind: "option", type: "u8" }],
        ["fieldId", { kind: "option", type: [32] }],
        ["amount", "u64"],
        ["quantity", "u32"],
        ["tcompFee", "u64"],
        ["takerBrokerFee", "u64"],
        ["makerBrokerFee", "u64"],
        ["creatorFee", "u64"],
        ["currency", { kind: "option", type: [32] }],
        ["assetId", { kind: "option", type: [32] }],
      ],
    },
  ],
]);

// --------------------------------------- parsing

export type TCompIxName = (typeof IDL_latest)["instructions"][number]["name"];
export type TCompIx = Omit<Instruction, "name"> & { name: TCompIxName };

// This map serves 2 purposes:
// 1) lists discriminators (in hex) for each ix
// 2) lists whether an ix calls NOOP. This is needed for ETL parsing where we match ix # with noop #
// Intentionally made it a dict so that we don't forget an ix
export const TCOMP_DISC_MAP = genIxDiscHexMap(IDL_latest);

export function deserializeTcompEvent(data: Buffer) {
  if (data.subarray(0, 8).toString("hex") !== TCOMP_DISC_MAP.tcompNoop) {
    throw new Error("not tcomp noop buffer data");
  }
  // cut off anchor discriminator
  data = data.subarray(8, data.length);
  if (data[0] === 0) {
    // console.log("🟩 Maker event detected", data.length - 64);
    const e = borsh.deserialize(
      makeEventSchema,
      MakeEventRaw,
      data.subarray(1, data.length)
    );
    const typedEvent: MakeEvent = {
      type: "maker",
      maker: new PublicKey(e.maker),
      bidId: e.bidId ? new PublicKey(e.bidId) : null,
      target: targetFromU8(e.target),
      targetId: new PublicKey(e.targetId),
      field: !isNullLike(e.field) ? fieldFromU8(e.field) : null,
      fieldId: e.fieldId ? new PublicKey(e.fieldId) : null,
      amount: new BN(e.amount),
      quantity: e.quantity,
      currency: e.currency ? new PublicKey(e.currency) : null,
      expiry: new BN(e.expiry),
      privateTaker: e.privateTaker ? new PublicKey(e.privateTaker) : null,
      assetId: e.assetId ? new PublicKey(e.assetId) : null,
    };
    return typedEvent;
  } else if (data[0] === 1) {
    // console.log("🟥 Taker event detected", data.length - 64);
    const e = borsh.deserialize(
      takeEventSchema,
      TakeEventRaw,
      data.subarray(1, data.length)
    );
    const typedEvent: TakeEvent = {
      type: "taker",
      taker: new PublicKey(e.taker),
      bidId: e.bidId ? new PublicKey(e.bidId) : null,
      target: targetFromU8(e.target),
      targetId: new PublicKey(e.targetId),
      field: !isNullLike(e.field) ? fieldFromU8(e.field) : null,
      fieldId: e.fieldId ? new PublicKey(e.fieldId) : null,
      amount: new BN(e.amount),
      quantity: e.quantity,
      tcompFee: new BN(e.tcompFee),
      creatorFee: new BN(e.creatorFee),
      takerBrokerFee: new BN(e.takerBrokerFee),
      makerBrokerFee: new BN(e.makerBrokerFee),
      currency: e.currency ? new PublicKey(e.currency) : null,
      assetId: e.assetId ? new PublicKey(e.assetId) : null,
    };
    return typedEvent;
  } else {
    throw new Error("unknown event");
  }
}
