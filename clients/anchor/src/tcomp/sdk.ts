import {
  BN,
  BorshCoder,
  Coder,
  EventParser,
  Instruction,
  Program,
  Provider
} from "@coral-xyz/anchor";
import {
  MetadataArgs,
  TokenProgramVersion,
  TokenStandard,
  UseMethod
} from "@metaplex-foundation/mpl-bubblegum";
import { MPL_CORE_PROGRAM_ID } from "@metaplex-foundation/mpl-core";
import { Creator, Uses } from "@metaplex-foundation/mpl-token-metadata";
import { toWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID
} from "@solana/spl-account-compression";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getExtraAccountMetaAddress,
  TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";
import {
  AccountInfo,
  Commitment,
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionInstruction,
  TransactionResponse
} from "@solana/web3.js";
import {
  AcctDiscHexMap,
  AUTH_PROGRAM_ID,
  BUBBLEGUM_PROGRAM_ID,
  Cluster,
  decodeAnchorAcct,
  findMetadataPda,
  findTokenRecordPda,
  genAcctDiscHexMap,
  genIxDiscHexMap,
  getLeafAssetId,
  getRent,
  getRentSync,
  hexCode,
  isNullLike,
  parseAnchorIxs,
  ParsedAnchorIx,
  PnftArgs,
  prependComputeIxs,
  prepPnftAccounts,
  TMETA_PROGRAM_ID,
  TSWAP_COSIGNER,
  TSWAP_OWNER,
  TSWAP_PROGRAM_ID
} from "@tensor-hq/tensor-common";
import { findMintProofPDA, findTSwapPDA } from "@tensor-hq/tensorswap-ts";
import * as borsh from "borsh";
import bs58 from "bs58";
import { getCreators } from "../metaplexCore";
import {
  AccountSuffix,
  DEFAULT_COMPUTE_UNITS,
  DEFAULT_MICRO_LAMPORTS,
  DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
  DEFAULT_XFER_COMPUTE_UNITS,
  evalMathExpr,
  findAta,
  findAtaWithProgramId
} from "../shared";
import {
  getApprovalAccount,
  getDistributionAccount,
  WNS_DISTRIBUTION_PROGRAM_ID,
  WNS_PROGRAM_ID
} from "../token2022";
import { ParsedAccount } from "../types";
import { TCOMP_ADDR } from "./constants";
import { IDL as IDL_latest, Tcomp as TComp_latest } from "./idl/tcomp";
import {
  IDL as IDL_v0_11_0,
  Tcomp as TComp_v0_11_0
} from "./idl/tcomp_v0_11_0";
import {
  IDL as IDL_v0_13_4,
  Tcomp as Tcomp_v0_13_4
} from "./idl/tcomp_v0_13_4";
import { IDL as IDL_v0_1_0, Tcomp as TComp_v0_1_0 } from "./idl/tcomp_v0_1_0";
import { IDL as IDL_v0_4_0, Tcomp as TComp_v0_4_0 } from "./idl/tcomp_v0_4_0";
import { IDL as IDL_v0_6_0, Tcomp as TComp_v0_6_0 } from "./idl/tcomp_v0_6_0";
import {
  findBidStatePda,
  findFeeVaultPda,
  findListStatePda,
  findNftEscrowPda,
  findTCompPda,
  findTreeAuthorityPda
} from "./pda";

// --------------------------------------- idl

//original deployment
export const TCompIDL_v0_1_0 = IDL_v0_1_0;
export const TCompIDL_v0_1_0_EffSlot_Mainnet = 0;

//add noop ixs to cancel bid/listing https://solscan.io/tx/5fyrggiyFujwfyB624P9WbjVSRtnwee5wzP6CHNRSvg15xAovNAE1FdgPXVDEaZ9x6BKsVpMnEjmLkoCT8ZhSnRU
export const TCompIDL_v0_4_0 = IDL_v0_4_0;
export const TCompIDL_v0_4_0_EffSlot_Mainnet = 195759029;

//add asset id to events
export const TCompIDL_v0_6_0 = IDL_v0_6_0;
export const TCompIDL_v0_6_0_EffSlot_Mainnet = 195759029; // https://solscan.io/tx/4ZrW4gn3wrjvytaycVRWf2gU2UZJVeHpDKDVbE8KVfXWpugTiKZtPsAkuxjwdvCKEnnV8Y8U5MwCCVguRszR6wcV
export const TCompIDL_v0_6_0_EffSlot_Devnet = 218778608; // https://solscan.io/tx/2JNJPCx6EE8wsh4KZ3y4dyAtM1Q1a94c5iXYLtTpKFvjJFzW7Ct8UmfRu1EAqz3PAWfTCT6HHXRtpP7TwkmXKDG6?cluster=devnet

//add optional cosigner https://solscan.io/tx/2zEnwiJKJq4ckfLGdKD4p8hiMWEFY6qvd5yiW7QpZxAdcBMbCDK8cnxpnNfpU1x8HC7csEurSC4mbHzAKdfr45Yc
export const TCompIDL_v0_11_0 = IDL_v0_11_0;
export const TCompIDL_v0_11_0_EffSlot_Mainnet = 225359236;

//add proof account for legacy take bid https://solscan.io/tx/2MELxB2wAWp3UVaEmktNJeA85vhVhuerfaw7M4hgCx4wjqLrsJ3xQNMgKyypy17MyV8Meem9G5WX1pmoci5XSrK
export const TCompIDL_v0_13_4 = IDL_v0_13_4;
export const TCompIDL_v0_13_4_EffSlot_Mainnet = 225783471;

//add rent payer, gameshift broker, USDC buy
export const TCompIDL_latest = IDL_latest;
export const TCompIDL_latest_EffSlot_Mainnet = 233959124; // https://solscan.io/tx/3t9g4DgnAoF1n2wCNfRBNzo4DSUGoNVmqthNrZw2RR9JqBeaEkondVy8ozqR98Nd6zmXE3TKUK18gF1rkDd5NQUk
export const TCompIDL_latest_EffSlot_Devnet = 265159305; // https://solscan.io/tx/2V665dcPTaFc4gf18c4wtVb6iXSVP9uGJgpaGc1qyrqziBcHCJSy1pR5zmeb32XkKEXWWjQX8A9WG2ecii6JWGw?cluster=devnet

export type TcompIDL =
  | TComp_v0_1_0
  | TComp_v0_4_0
  | TComp_v0_6_0
  | TComp_v0_11_0
  | Tcomp_v0_13_4
  | TComp_latest;

// Use this function to figure out which IDL to use based on the slot # of historical txs.
export const triageTCompIDL = (
  slot: number | bigint,
  cluster: Cluster
): TcompIDL | null => {
  switch (cluster) {
    case Cluster.Mainnet:
      if (slot < TCompIDL_v0_1_0_EffSlot_Mainnet) return null;
      if (slot < TCompIDL_v0_4_0_EffSlot_Mainnet) return TCompIDL_v0_1_0;
      if (slot < TCompIDL_v0_6_0_EffSlot_Mainnet) return TCompIDL_v0_4_0;
      if (slot < TCompIDL_v0_11_0_EffSlot_Mainnet) return TCompIDL_v0_6_0;
      if (slot < TCompIDL_v0_13_4_EffSlot_Mainnet) return TCompIDL_v0_11_0;
      if (slot < TCompIDL_latest_EffSlot_Mainnet) return TCompIDL_v0_13_4;
      return TCompIDL_latest;
    case Cluster.Devnet:
      if (slot < TCompIDL_v0_6_0_EffSlot_Devnet) return null;
      // v0_11_0 and v0_13_4 were skipped
      if (slot < TCompIDL_latest_EffSlot_Devnet) return TCompIDL_v0_6_0;
      return TCompIDL_latest;
  }
};

export type ParsedTCompIx = ParsedAnchorIx<TcompIDL>;

// --------------------------------------- constants

export const CURRENT_TCOMP_VERSION: number = +IDL_latest.constants.find(
  (c) => c.name === "CURRENT_TCOMP_VERSION"
)!.value;
export const TCOMP_FEE_BPS: number = +IDL_latest.constants.find(
  (c) => c.name === "TCOMP_FEE_BPS"
)!.value;
export const MAKER_BROKER_PCT: number = +IDL_latest.constants.find(
  (c) => c.name === "MAKER_BROKER_PCT"
)!.value;
export const LIST_STATE_SIZE: number = evalMathExpr(
  IDL_latest.constants.find((c) => c.name === "LIST_STATE_SIZE")!.value
);
export const BID_STATE_SIZE: number = evalMathExpr(
  IDL_latest.constants.find((c) => c.name === "BID_STATE_SIZE")!.value
);
export const MAX_EXPIRY_SEC: number = +IDL_latest.constants.find(
  (c) => c.name === "MAX_EXPIRY_SEC"
)!.value;

export const APPROX_BID_STATE_RENT = getRentSync(BID_STATE_SIZE);
export const APPROX_LIST_STATE_RENT = getRentSync(LIST_STATE_SIZE);

// --------------------------------------- types (target)

export const TargetAnchor = {
  AssetId: { assetId: {} },
  Whitelist: { whitelist: {} }
};
type TargetAnchor = (typeof TargetAnchor)[keyof typeof TargetAnchor];

export const targetU8 = (target: TargetAnchor): 0 | 1 => {
  const t: Record<string, 0 | 1> = {
    assetId: 0,
    whitelist: 1
  };
  return t[Object.keys(target)[0]];
};

export const targetFromU8 = (n: number): Target => {
  return Object.values(Target)[n];
};

export enum Target {
  AssetId = "AssetId",
  Whitelist = "Whitelist"
}

export const castTargetAnchor = (target: TargetAnchor): Target =>
  ({
    0: Target.AssetId,
    1: Target.Whitelist
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
  Name: { name: {} }
};
type FieldAnchor = (typeof FieldAnchor)[keyof typeof FieldAnchor];

export const fieldU8 = (target: FieldAnchor): 0 => {
  const t: Record<string, 0> = {
    name: 0
  };
  return t[Object.keys(target)[0]];
};

export const fieldFromU8 = (n: number): Field => {
  return Object.values(Field)[n];
};

export enum Field {
  Name = "Name"
}

export const castFieldAnchor = (target: FieldAnchor): Field =>
  ({
    0: Field.Name
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
  NonFungibleEdition: { nonFungibleEdition: {} }
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
  Single: { single: {} }
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
    total: new BN(u.total)
  };
};

const TokenProgramVersionAnchor = {
  Original: { original: {} },
  Token2022: { token2022: {} }
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
    creatorVerified: creators.map((c) => c.verified)
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
  /** owner is the rent payer when this is PublicKey.default */
  rentPayer: PublicKey;
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
  /** owner is the rent payer when this is PublicKey.default */
  rentPayer: PublicKey;
};

export type TCompPdaAnchor = BidStateAnchor | ListStateAnchor;
export type TaggedTCompPdaAnchor =
  | {
      name: "bidState";
      account: BidStateAnchor;
    }
  | {
      name: "BidState";
      account: BidStateAnchor;
    }
  | {
      name: "listState";
      account: ListStateAnchor;
    }
  | {
      name: "ListState";
      account: ListStateAnchor;
    };

// --------------------------------------- sdk

export class TCompSDK {
  program: Program<TcompIDL>;
  discMap: AcctDiscHexMap<TcompIDL>;
  coder: BorshCoder;
  eventParser: EventParser;

  constructor({
    idl = IDL_latest,
    addr = TCOMP_ADDR,
    provider,
    coder
  }: {
    idl?: any;
    addr?: PublicKey;
    provider?: Provider;
    coder?: Coder;
  }) {
    this.program = new Program<TcompIDL>(idl, addr, provider, coder);
    this.discMap = genAcctDiscHexMap(idl);
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
    rentPayer = null,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0,
    delegateSigner
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
    rentPayer?: PublicKey | null;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    canopyDepth?: number;
    delegateSigner?: boolean;
  }) {
    nonce = nonce ?? new BN(index);

    const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
    const assetId = getLeafAssetId(merkleTree, nonce);
    const [listState] = findListStatePda({ assetId });

    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false
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
        marketplaceProgram: TCOMP_ADDR,
        merkleTree,
        treeAuthority,
        delegate,
        owner,
        listState,
        rentPayer: rentPayer ?? owner
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

    const ixs = prependComputeIxs([ix], compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      treeAuthority,
      assetId,
      listState,
      proofPath
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
    priorityMicroLamports = null
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
        marketplaceProgram: TCOMP_ADDR
      });

    const ixs = prependComputeIxs(
      [await builder.instruction()],
      compute,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      }
    };
  }

  async delist({
    merkleTree,
    owner,
    rentDest,
    proof,
    root,
    dataHash,
    creatorsHash,
    nonce,
    index,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0
  }: {
    merkleTree: PublicKey;
    owner: PublicKey;
    rentDest: PublicKey;
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
    const assetId = getLeafAssetId(merkleTree, nonce);
    const [listState] = findListStatePda({ assetId });

    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false
    }));

    const builder = this.program.methods
      .delist(nonce, index, root, [...dataHash], [...creatorsHash])
      .accounts({
        marketplaceProgram: TCOMP_ADDR,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        merkleTree,
        treeAuthority,
        owner,
        rentDest: getTcompRentPayer({ rentPayer: rentDest, owner }),
        listState
      })
      .remainingAccounts(proofPath);

    const ixs = prependComputeIxs(
      [await builder.instruction()],
      compute,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      treeAuthority,
      assetId,
      listState,
      proofPath
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
    makerBroker,
    takerBroker = null,
    optionalRoyaltyPct = 100,
    owner,
    buyer,
    payer = null,
    rentDest,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0
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
    makerBroker: PublicKey | null;
    takerBroker?: PublicKey | null;
    optionalRoyaltyPct?: number | null;
    owner: PublicKey;
    buyer: PublicKey;
    payer?: PublicKey | null;
    rentDest: PublicKey;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    canopyDepth?: number;
  }) {
    nonce = nonce ?? new BN(index);

    const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
    const assetId = getLeafAssetId(merkleTree, nonce);
    const [listState] = findListStatePda({ assetId });

    const feeVault = await findFeeVaultPda({ stateAccount: listState });

    let creatorsPath = creators.map((c) => ({
      pubkey: c.address,
      isSigner: false,
      isWritable: c.share > 0 // reduces congestion + program creators
    }));
    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false
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
        optionalRoyaltyPct
      )
      .accounts({
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        marketplaceProgram: TCOMP_ADDR,
        merkleTree,
        treeAuthority,
        buyer,
        payer: payer ?? buyer,
        owner,
        rentDest: getTcompRentPayer({ rentPayer: rentDest, owner }),
        listState,
        feeVault,
        takerBroker,
        makerBroker
      })
      .remainingAccounts([...creatorsPath, ...proofPath]);

    const ixs = prependComputeIxs(
      [await builder.instruction()],
      compute,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      listState,
      treeAuthority,
      creators,
      proofPath
    };
  }

  async buySpl({
    merkleTree,
    proof,
    root,
    metaHash,
    creators,
    sellerFeeBasisPoints,
    nonce,
    index,
    maxAmount,
    currency,
    makerBroker,
    takerBroker = null,
    optionalRoyaltyPct = 100,
    owner,
    buyer,
    payer = null,
    rentPayer = null,
    rentDest,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0
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
    currency: PublicKey;
    makerBroker: PublicKey | null;
    takerBroker?: PublicKey | null;
    optionalRoyaltyPct?: number | null;
    owner: PublicKey;
    buyer: PublicKey;
    payer?: PublicKey | null;
    rentPayer?: PublicKey | null;
    rentDest: PublicKey;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    canopyDepth?: number;
  }) {
    nonce = nonce ?? new BN(index);

    const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
    // const [tcomp] = findTCompPda({});
    const assetId = getLeafAssetId(merkleTree, nonce);
    const [listState] = findListStatePda({ assetId });
    const takerBrokerAta = takerBroker ? findAta(currency, takerBroker) : null;
    const makerBrokerAta = makerBroker ? findAta(currency, makerBroker) : null;
    const payerSource = findAta(currency, payer ?? buyer);
    const ownerDest = findAta(currency, owner);

    const feeVault = await findFeeVaultPda({ stateAccount: listState });
    const feeVaultAta = findAta(currency, feeVault);

    let creatorsPath = creators.map((c) => ({
      pubkey: c.address,
      isSigner: false,
      isWritable: c.share > 0 // reduces congestion + program creators
    }));
    let creatorAtasPath = creators.map((c) => ({
      pubkey: findAta(currency, c.address),
      isSigner: false,
      isWritable: true
    }));
    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false
    }));

    const builder = this.program.methods
      .buySpl(
        nonce,
        index,
        root,
        [...metaHash],
        Buffer.from(creators.map((c) => c.share)),
        creators.map((c) => c.verified),
        sellerFeeBasisPoints,
        maxAmount,
        optionalRoyaltyPct
      )
      .accounts({
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        marketplaceProgram: TCOMP_ADDR,
        merkleTree,
        treeAuthority,
        buyer,
        payer: payer ?? buyer,
        payerSource,
        owner,
        ownerDest,
        rentPayer: rentPayer ?? payer ?? buyer,
        rentDest: getTcompRentPayer({ rentPayer: rentDest, owner }),
        listState,
        feeVault,
        feeVaultAta,
        currency,
        takerBroker,
        takerBrokerAta,
        makerBroker,
        makerBrokerAta
      })
      .remainingAccounts([...creatorsPath, ...creatorAtasPath, ...proofPath]);

    const ixs = prependComputeIxs(
      [await builder.instruction()],
      compute,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      listState,
      treeAuthority,
      creators,
      proofPath
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
    rentPayer = null
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
    rentPayer?: PublicKey | null;
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
        marketplaceProgram: TCOMP_ADDR,
        bidState,
        marginAccount: margin ?? owner,
        cosigner: cosigner ?? owner,
        rentPayer: rentPayer ?? owner
      });

    const ixs = prependComputeIxs(
      [await builder.instruction()],
      compute,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      bidState
    };
  }

  async cancelBid({
    bidId,
    owner,
    rentDest,
    compute = null,
    priorityMicroLamports = null
  }: {
    bidId: PublicKey;
    owner: PublicKey;
    rentDest: PublicKey;
    compute?: number | null;
    priorityMicroLamports?: number | null;
  }) {
    const [bidState] = findBidStatePda({ bidId, owner });

    const builder = this.program.methods.cancelBid().accounts({
      marketplaceProgram: TCOMP_ADDR,
      owner,
      rentDest: getTcompRentPayer({ rentPayer: rentDest, owner }),
      systemProgram: SystemProgram.programId,
      bidState
    });

    const ixs = prependComputeIxs(
      [await builder.instruction()],
      compute,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      bidState
    };
  }

  async closeExpiredBid({
    bidId,
    owner,
    rentDest,
    compute = null,
    priorityMicroLamports = null
  }: {
    bidId: PublicKey;
    owner: PublicKey;
    rentDest: PublicKey;
    compute?: number | null;
    priorityMicroLamports?: number | null;
  }) {
    const [bidState] = findBidStatePda({ bidId, owner });

    const builder = this.program.methods.closeExpiredBid().accounts({
      marketplaceProgram: TCOMP_ADDR,
      owner,
      systemProgram: SystemProgram.programId,
      bidState,
      rentDest: getTcompRentPayer({ rentPayer: rentDest, owner })
    });

    const ixs = prependComputeIxs(
      [await builder.instruction()],
      compute,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      bidState
    };
  }

  async closeExpiredListing({
    merkleTree,
    owner,
    rentDest,
    proof,
    root,
    dataHash,
    creatorsHash,
    nonce,
    index,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0
  }: {
    merkleTree: PublicKey;
    owner: PublicKey;
    rentDest: PublicKey;
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
    const assetId = getLeafAssetId(merkleTree, nonce);
    const [listState] = findListStatePda({ assetId });

    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false
    }));

    const builder = this.program.methods
      .closeExpiredListing(nonce, index, root, [...dataHash], [...creatorsHash])
      .accounts({
        marketplaceProgram: TCOMP_ADDR,
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
        merkleTree,
        treeAuthority,
        owner,
        listState,
        rentDest: getTcompRentPayer({ rentPayer: rentDest, owner })
      })
      .remainingAccounts(proofPath);

    const ixs = prependComputeIxs(
      [await builder.instruction()],
      compute,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      treeAuthority,
      assetId,
      listState,
      proofPath
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
    makerBroker,
    takerBroker = null,
    optionalRoyaltyPct = 100,
    owner,
    rentDest,
    seller,
    delegate = seller,
    margin = null,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0,
    whitelist = null,
    delegateSigner,
    cosigner = null
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
    makerBroker: PublicKey | null;
    takerBroker?: PublicKey | null;
    optionalRoyaltyPct?: number | null;
    owner: PublicKey;
    rentDest: PublicKey;
    seller: PublicKey;
    delegate?: PublicKey;
    margin?: PublicKey | null;
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

    const feeVault = await findFeeVaultPda({ stateAccount: bidState });

    let creatorsPath = creators.map((c) => ({
      pubkey: c.address,
      isSigner: false,
      isWritable: c.share > 0 // reduces congestion + program creators
    }));
    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false
    }));

    const accounts = {
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
      marketplaceProgram: TCOMP_ADDR,
      merkleTree,
      treeAuthority,
      seller,
      owner,
      rentDest: getTcompRentPayer({ rentPayer: rentDest, owner }),
      bidState,
      feeVault,
      takerBroker,
      makerBroker,
      delegate: delegate,
      marginAccount: margin ?? seller,
      tensorswapProgram: TSWAP_PROGRAM_ID,
      whitelist: whitelist ?? TSWAP_PROGRAM_ID,
      cosigner: cosigner ?? delegate ?? seller
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
          optionalRoyaltyPct
        )
        .accounts(accounts)
        .remainingAccounts(remAccounts);
    }

    //because EITHER of the two has to sign, mark one of them as signer
    const ix = await builder.instruction();
    if (!!delegate && delegateSigner) {
      const i = ix.keys.findIndex((k) => k.pubkey.equals(delegate));
      ix["keys"][i]["isSigner"] = true;
    } else {
      const i = ix.keys.findIndex((k) => k.pubkey.equals(seller));
      ix["keys"][i]["isSigner"] = true;
    }

    const ixs = prependComputeIxs([ix], compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      bidState,
      treeAuthority,
      tcomp,
      creators,
      proofPath
    };
  }

  async takeBidLegacy({
    bidId,
    nftMint,
    nftSellerAcc,
    owner,
    rentDest,
    seller,
    minAmount,
    tokenProgram,
    currency = null,
    makerBroker,
    takerBroker = null,
    optionalRoyaltyPct = 100,
    margin = null,
    whitelist = null,
    /** pnft args */
    meta,
    authData = null,
    compute = 800_000, // pnfts are expensive
    ruleSetAddnCompute = DEFAULT_RULESET_ADDN_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    cosigner = null
  }: {
    bidId: PublicKey;
    nftMint: PublicKey;
    nftSellerAcc: PublicKey;
    owner: PublicKey;
    rentDest: PublicKey;
    seller: PublicKey;
    minAmount: BN;
    tokenProgram: PublicKey;
    currency?: PublicKey | null;
    makerBroker: PublicKey | null;
    takerBroker?: PublicKey | null;
    optionalRoyaltyPct?: number | null;
    margin?: PublicKey | null;
    whitelist?: PublicKey | null;
    cosigner?: PublicKey | null;
    // Need this for npm package for whatever reason.
  } & PnftArgs): Promise<{
    builder: any;
    tx: {
      ixs: TransactionInstruction[];
      extraSigners: PublicKey[];
    };
    bidState: PublicKey;
    tcomp: PublicKey;
    creators: Creator[];
    ownerAtaAcc: PublicKey;
  }> {
    const [tcomp] = findTCompPda({});
    const ownerAtaAcc = findAta(nftMint, owner);
    const nftMetadata = findMetadataPda(nftMint)[0];
    const [bidState] = findBidStatePda({ bidId, owner });
    const [escrowPda] = findNftEscrowPda({ nftMint });
    const mintProofPda = whitelist
      ? findMintProofPDA({ mint: nftMint, whitelist })[0]
      : SystemProgram.programId;

    const feeVault = await findFeeVaultPda({ stateAccount: bidState });

    //prepare 2 pnft account sets
    const {
      meta: newMeta,
      creators,
      ownerTokenRecordPda,
      destTokenRecordPda: escrowDestTokenRecordPda,
      ruleSet,
      nftEditionPda,
      authDataSerialized
    } = await prepPnftAccounts({
      connection: this.program.provider.connection,
      meta,
      nftMint,
      destAta: escrowPda,
      authData,
      sourceAta: nftSellerAcc
    });
    meta = newMeta;
    const [destTokenRecord] = findTokenRecordPda(nftMint, ownerAtaAcc);

    const builder = this.program.methods
      .takeBidLegacy(
        minAmount,
        optionalRoyaltyPct,
        !!ruleSet,
        authDataSerialized
      )
      .accounts({
        feeVault,
        seller,
        bidState,
        owner,
        rentDest: getTcompRentPayer({ rentPayer: rentDest, owner }),
        takerBroker,
        makerBroker,
        marginAccount: margin ?? seller,
        whitelist: whitelist ?? TSWAP_PROGRAM_ID,
        nftSellerAcc,
        nftMint,
        nftMetadata,
        ownerAtaAcc,
        nftEdition: nftEditionPda,
        ownerTokenRecord: ownerTokenRecordPda,
        destTokenRecord: destTokenRecord,
        pnftShared: {
          authorizationRulesProgram: AUTH_PROGRAM_ID,
          tokenMetadataProgram: TMETA_PROGRAM_ID,
          instructions: SYSVAR_INSTRUCTIONS_PUBKEY
        },
        nftEscrow: escrowPda,
        tempEscrowTokenRecord: escrowDestTokenRecordPda,
        authRules: ruleSet ?? TCOMP_ADDR,

        tokenProgram,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        marketplaceProgram: TCOMP_ADDR,
        tensorswapProgram: TSWAP_PROGRAM_ID,
        cosigner: cosigner ?? seller,
        mintProof: mintProofPda
      })
      .remainingAccounts(
        creators.map((c) => ({
          pubkey: c.address,
          isSigner: false,
          isWritable: c.share > 0 // reduces congestion + program creators
        }))
      );
    const ix = await builder.instruction();

    const ruleSetCompute = ruleSet ? ruleSetAddnCompute : null;
    const ixs = prependComputeIxs(
      [ix],
      isNullLike(compute) && isNullLike(ruleSetCompute)
        ? null
        : (compute ?? 0) + (ruleSetCompute ?? 0),
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      bidState,
      tcomp,
      creators,
      ownerAtaAcc
    };
  }

  async withdrawFees({
    lamports,
    destination,
    owner = TSWAP_OWNER,
    cosigner = TSWAP_COSIGNER
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
      systemProgram: SystemProgram.programId
    });
    const ix = await builder.instruction();
    return {
      builder,
      tx: {
        ixs: [ix],
        extraSigners: []
      }
    };
  }

  async takeBidT22({
    bidId,
    nftMint,
    nftSellerAcc,
    owner,
    rentDest,
    seller,
    minAmount,
    currency = null,
    makerBroker,
    takerBroker = null,
    margin = null,
    whitelist = null,
    compute = 800_000, // pnfts are expensive
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    cosigner = null
  }: {
    bidId: PublicKey;
    nftMint: PublicKey;
    nftSellerAcc: PublicKey;
    owner: PublicKey;
    rentDest: PublicKey;
    seller: PublicKey;
    minAmount: BN;
    currency?: PublicKey | null;
    makerBroker: PublicKey | null;
    takerBroker?: PublicKey | null;
    margin?: PublicKey | null;
    whitelist?: PublicKey | null;
    compute?: number | null | undefined;
    priorityMicroLamports?: number | null | undefined;
    cosigner?: PublicKey | null;
  }) {
    const [tcomp] = findTCompPda({});
    const ownerAtaAcc = findAtaWithProgramId(
      nftMint,
      owner,
      TOKEN_2022_PROGRAM_ID
    );
    const [bidState] = findBidStatePda({ bidId, owner });
    const mintProofPda = whitelist
      ? findMintProofPDA({ mint: nftMint, whitelist })[0]
      : SystemProgram.programId;

    const feeVault = await findFeeVaultPda({ stateAccount: bidState });

    const builder = this.program.methods.takeBidT22(minAmount).accounts({
      feeVault,
      seller,
      bidState,
      owner,
      rentDest: getTcompRentPayer({ rentPayer: rentDest, owner }),
      takerBroker,
      makerBroker,
      marginAccount: margin ?? seller,
      whitelist: whitelist ?? TSWAP_PROGRAM_ID,
      nftSellerAcc,
      nftMint,
      ownerAtaAcc,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      marketplaceProgram: TCOMP_ADDR,
      tensorswapProgram: TSWAP_PROGRAM_ID,
      cosigner: cosigner ?? seller,
      mintProof: mintProofPda
    });
    const ix = await builder.instruction();

    const ixs = prependComputeIxs(
      [ix],
      isNullLike(compute) ? null : compute ?? 0,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      bidState,
      tcomp,
      ownerAtaAcc
    };
  }

  async takeBidWns({
    bidId,
    nftMint,
    nftSellerAcc,
    owner,
    rentDest,
    seller,
    minAmount,
    collectionMint,
    currency = null,
    makerBroker,
    takerBroker = null,
    margin = null,
    whitelist = null,
    compute = 800_000, // pnfts are expensive
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    cosigner = null
  }: {
    bidId: PublicKey;
    nftMint: PublicKey;
    nftSellerAcc: PublicKey;
    owner: PublicKey;
    rentDest: PublicKey;
    seller: PublicKey;
    minAmount: BN;
    collectionMint: PublicKey;
    currency?: PublicKey | null;
    makerBroker: PublicKey | null;
    takerBroker?: PublicKey | null;
    margin?: PublicKey | null;
    whitelist?: PublicKey | null;
    compute?: number | null | undefined;
    priorityMicroLamports?: number | null | undefined;
    cosigner?: PublicKey | null;
  }) {
    const [tcomp] = findTCompPda({});
    const ownerAtaAcc = findAtaWithProgramId(
      nftMint,
      owner,
      TOKEN_2022_PROGRAM_ID
    );
    const [bidState] = findBidStatePda({ bidId, owner });
    const mintProofPda = whitelist
      ? findMintProofPDA({ mint: nftMint, whitelist })[0]
      : SystemProgram.programId;

    const feeVault = await findFeeVaultPda({ stateAccount: bidState });

    const approveAccount = getApprovalAccount(nftMint);
    const distribution = getDistributionAccount(collectionMint);
    const extraMetas = getExtraAccountMetaAddress(nftMint, WNS_PROGRAM_ID);

    const builder = this.program.methods.takeBidWns(minAmount).accounts({
      feeVault,
      seller,
      bidState,
      owner,
      rentDest: getTcompRentPayer({ rentPayer: rentDest, owner }),
      takerBroker,
      makerBroker,
      marginAccount: margin ?? seller,
      whitelist: whitelist ?? TSWAP_PROGRAM_ID,
      nftSellerAcc,
      nftMint,
      ownerAtaAcc,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      marketplaceProgram: TCOMP_ADDR,
      tensorswapProgram: TSWAP_PROGRAM_ID,
      cosigner: cosigner ?? seller,
      mintProof: mintProofPda,
      approveAccount,
      distribution,
      distributionProgram: WNS_DISTRIBUTION_PROGRAM_ID,
      wnsProgram: WNS_PROGRAM_ID,
      extraMetas
    });
    const ix = await builder.instruction();

    const ixs = prependComputeIxs(
      [ix],
      isNullLike(compute) ? null : compute ?? 0,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      bidState,
      tcomp,
      ownerAtaAcc
    };
  }

  // ----------------------------------- Metaplex Core

  async takeBidCore({
    bidId,
    asset,
    owner,
    rentDest,
    seller,
    minAmount,
    collection = null,
    currency = null,
    makerBroker,
    takerBroker = null,
    margin = null,
    whitelist = null,
    compute = 800_000, // pnfts are expensive
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    cosigner = null
  }: {
    bidId: PublicKey;
    asset: PublicKey;
    owner: PublicKey;
    rentDest: PublicKey;
    seller: PublicKey;
    minAmount: BN;
    collection?: PublicKey | null;
    currency?: PublicKey | null;
    makerBroker: PublicKey | null;
    takerBroker?: PublicKey | null;
    margin?: PublicKey | null;
    whitelist?: PublicKey | null;
    compute?: number | null | undefined;
    priorityMicroLamports?: number | null | undefined;
    cosigner?: PublicKey | null;
  }) {
    const [tcomp] = findTCompPda({});
    const [bidState] = findBidStatePda({ bidId, owner });
    const mintProofPda = whitelist
      ? findMintProofPDA({ mint: asset, whitelist })[0]
      : SystemProgram.programId;
    const creators = await getCreators(
      this.program.provider.connection,
      asset,
      collection
    );

    const feeVault = await findFeeVaultPda({ stateAccount: bidState });

    const builder = this.program.methods
      .takeBidCore(minAmount)
      .accounts({
        feeVault,
        seller,
        bidState,
        owner,
        rentDest: getTcompRentPayer({ rentPayer: rentDest, owner }),
        takerBroker,
        makerBroker,
        marginAccount: margin ?? seller,
        whitelist: whitelist ?? TSWAP_PROGRAM_ID,
        asset,
        collection,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        marketplaceProgram: TCOMP_ADDR,
        tensorswapProgram: TSWAP_PROGRAM_ID,
        cosigner: cosigner ?? seller,
        mintProof: mintProofPda
      })
      .remainingAccounts(
        creators.map((c) => {
          return {
            pubkey: toWeb3JsPublicKey(c.address),
            isWritable: c.percentage > 0, // reduces congestion + program creators
            isSigner: false
          };
        })
      );
    const ix = await builder.instruction();

    const ixs = prependComputeIxs(
      [ix],
      isNullLike(compute) ? null : compute ?? 0,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      bidState,
      tcomp
    };
  }

  async listCore({
    asset,
    collection = null,
    owner,
    amount,
    expireInSec = null,
    currency = null,
    makerBroker = null,
    privateTaker = null,
    payer = null,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS
  }: {
    asset: PublicKey;
    collection?: PublicKey | null;
    owner: PublicKey;
    amount: BN;
    expireInSec?: BN | null;
    currency?: PublicKey | null;
    makerBroker?: PublicKey | null;
    privateTaker?: PublicKey | null;
    payer?: PublicKey | null;
    compute?: number | null;
    priorityMicroLamports?: number | null;
  }) {
    const [listState] = findListStatePda({ assetId: asset });

    const builder = this.program.methods
      .listCore(amount, expireInSec, currency, privateTaker, makerBroker)
      .accounts({
        asset,
        collection,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        marketplaceProgram: TCOMP_ADDR,
        owner,
        listState,
        payer: payer ?? owner
      });

    //because EITHER of the two has to sign, mark one of them as signer
    const ix = await builder.instruction();
    const ixs = prependComputeIxs([ix], compute, priorityMicroLamports);

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      listState
    };
  }

  async delistCore({
    asset,
    collection = null,
    owner,
    rentDest,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS
  }: {
    asset: PublicKey;
    collection?: PublicKey | null;
    owner: PublicKey;
    rentDest: PublicKey;
    compute?: number | null;
    priorityMicroLamports?: number | null;
  }) {
    const [listState] = findListStatePda({ assetId: asset });

    const builder = this.program.methods.delistCore().accounts({
      asset,
      collection,
      mplCoreProgram: MPL_CORE_PROGRAM_ID,
      marketplaceProgram: TCOMP_ADDR,
      systemProgram: SystemProgram.programId,
      owner,
      rentDest: getTcompRentPayer({ rentPayer: rentDest, owner }),
      listState
    });

    const ixs = prependComputeIxs(
      [await builder.instruction()],
      compute,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      listState
    };
  }

  async buyCore({
    asset,
    collection = null,
    maxAmount,
    makerBroker,
    takerBroker = null,
    owner,
    buyer,
    payer = null,
    rentDest,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS
  }: {
    asset: PublicKey;
    collection?: PublicKey | null;
    maxAmount: BN;
    makerBroker: PublicKey | null;
    takerBroker?: PublicKey | null;
    owner: PublicKey;
    buyer: PublicKey;
    payer?: PublicKey | null;
    rentDest: PublicKey;
    compute?: number | null;
    priorityMicroLamports?: number | null;
  }) {
    const [tcomp] = findTCompPda({});
    const [listState] = findListStatePda({ assetId: asset });

    const feeVault = await findFeeVaultPda({ stateAccount: listState });

    const creators = await getCreators(
      this.program.provider.connection,
      asset,
      collection
    );

    const builder = this.program.methods
      .buyCore(maxAmount)
      .accounts({
        asset,
        collection,
        mplCoreProgram: MPL_CORE_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        marketplaceProgram: TCOMP_ADDR,
        buyer,
        payer: payer ?? buyer,
        owner,
        rentDest: getTcompRentPayer({ rentPayer: rentDest, owner }),
        listState,
        feeVault,
        takerBroker,
        makerBroker
      })
      .remainingAccounts(
        creators.map((c) => {
          return {
            pubkey: toWeb3JsPublicKey(c.address),
            isWritable: c.percentage > 0, // reduces congestion + program creators
            isSigner: false
          };
        })
      );

    const ixs = prependComputeIxs(
      [await builder.instruction()],
      compute,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      listState,
      tcomp,
      creators
    };
  }

  async closeExpiredListingCore({
    asset,
    collection = null,
    owner,
    rentDest,
    compute = DEFAULT_XFER_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS
  }: {
    asset: PublicKey;
    collection?: PublicKey | null;
    owner: PublicKey;
    rentDest: PublicKey;
    compute?: number | null;
    priorityMicroLamports?: number | null;
  }) {
    const [listState] = findListStatePda({ assetId: asset });

    const builder = this.program.methods.closeExpiredListingCore().accounts({
      asset,
      collection,
      mplCoreProgram: MPL_CORE_PROGRAM_ID,
      marketplaceProgram: TCOMP_ADDR,
      systemProgram: SystemProgram.programId,
      owner,
      listState,
      rentDest: getTcompRentPayer({ rentPayer: rentDest, owner })
    });

    const ixs = prependComputeIxs(
      [await builder.instruction()],
      compute,
      priorityMicroLamports
    );

    return {
      builder,
      tx: {
        ixs,
        extraSigners: []
      },
      listState
    };
  }

  // --------------------------------------- helpers

  async getBidStateRent() {
    return await getRent(
      this.program.provider.connection,
      this.program.account.bidState
    );
  }

  async getListStateRent() {
    return await getRent(
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
      noopIxDiscHex: TCOMP_DISC_MAP.tcompNoop
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
        ["assetId", { kind: "option", type: [32] }]
      ]
    }
  ]
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
        ["assetId", { kind: "option", type: [32] }]
      ]
    }
  ]
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
      assetId: e.assetId ? new PublicKey(e.assetId) : null
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
      assetId: e.assetId ? new PublicKey(e.assetId) : null
    };
    return typedEvent;
  } else {
    throw new Error("unknown event");
  }
}

//(!!) sync with state.rs:get_rent_payer()
export const getTcompRentPayer = ({
  rentPayer,
  owner
}: {
  rentPayer: PublicKey;
  owner: PublicKey;
}): PublicKey => {
  if (!rentPayer.equals(PublicKey.default)) {
    return rentPayer;
  } else {
    return owner;
  }
};
