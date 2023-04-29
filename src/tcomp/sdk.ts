import * as borsh from "borsh";
import {
  AccountSuffix,
  decodeAcct,
  DEFAULT_COMPUTE_UNITS,
  DEFAULT_MICRO_LAMPORTS,
  DiscMap,
  genDiscToDecoderMap,
  getAccountRent,
  getRentSync,
  hexCode,
  parseStrFn,
} from "../shared";
import {
  BN,
  BorshCoder,
  Coder,
  EventParser,
  Idl,
  Instruction,
  Program,
  Provider,
} from "@project-serum/anchor";
import {
  AccountInfo,
  Commitment,
  CompiledInstruction,
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  TransactionResponse,
} from "@solana/web3.js";
import { TCOMP_ADDR } from "./constants";
import {
  computeDataHash,
  getLeafAssetId,
  MetadataArgs,
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import { Uses } from "@metaplex-foundation/mpl-token-metadata";
import { UseMethod } from "../../deps/metaplex-mpl/bubblegum/js/src";
import {
  AnchorEvent,
  AnchorIx,
  isNullLike,
  parseAnchorEvents,
  TENSORSWAP_ADDR,
} from "@tensor-hq/tensor-common";
import { InstructionDisplay } from "@project-serum/anchor/dist/cjs/coder/borsh/instruction";
import { ParsedAccount } from "../types";
import {
  findBidStatePda,
  findListStatePda,
  findTCompPda,
  findTreeAuthorityPda,
} from "./pda";
import {
  computeCreatorHashPATCHED,
  computeMetadataArgsHash,
} from "../../tests/shared";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { IDL as IDL_latest, Tcomp as tcomp_latest } from "./idl/tcomp";
import { hash } from "@project-serum/anchor/dist/cjs/utils/sha256";
import { TSWAP_COSIGNER } from "@tensor-hq/tensorswap-sdk";

export { PROGRAM_ID as BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";

// --------------------------------------- idl

export const tcompIDL_latest = IDL_latest;
export const tcompIDL_latest_EffSlot = 0;

export type TcompIDL = tcomp_latest;

// Use this function to figure out which IDL to use based on the slot # of historical txs.
export const triageBidIDL = (slot: number | bigint): TcompIDL | null => {
  if (slot < tcompIDL_latest_EffSlot) return null;
  return tcompIDL_latest;
};

// --------------------------------------- constants

export const CURRENT_TCOMP_VERSION: number = +IDL_latest.constants.find(
  (c) => c.name === "CURRENT_TCOMP_VERSION"
)!.value;
export const FEE_BPS: number = +IDL_latest.constants.find(
  (c) => c.name === "FEE_BPS"
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

export const APPROX_BID_STATE_RENT = getRentSync(BID_STATE_SIZE);
export const APPROX_LIST_STATE_RENT = getRentSync(LIST_STATE_SIZE);

// --------------------------------------- types

export const BidTargetAnchor = {
  AssetId: { assetId: {} },
  Voc: { voc: {} },
  Fvc: { fvc: {} },
  Name: { name: {} },
};
type BidTargetAnchor = (typeof BidTargetAnchor)[keyof typeof BidTargetAnchor];

export const bidTargetU8 = (target: BidTargetAnchor): 0 | 1 | 2 | 3 => {
  const t: Record<string, 0 | 1 | 2 | 3> = {
    assetId: 0,
    voc: 1,
    fvc: 2,
    name: 3,
  };
  return t[Object.keys(target)[0]];
};

export enum BidTarget {
  AssetId = "AssetId",
  Voc = "Voc",
  Fvc = "Fvc",
  Name = "Name",
}

export const castBidTargetAnchor = (target: BidTargetAnchor): BidTarget =>
  ({
    0: BidTarget.AssetId,
    1: BidTarget.Voc,
    2: BidTarget.Fvc,
    3: BidTarget.Name,
  }[bidTargetU8(target)]);

export const castBidTarget = (target: BidTarget): BidTargetAnchor => {
  switch (target) {
    case BidTarget.AssetId:
      return BidTargetAnchor.AssetId;
    case BidTarget.Voc:
      return BidTargetAnchor.Voc;
    case BidTarget.Fvc:
      return BidTargetAnchor.Fvc;
    case BidTarget.Name:
      return BidTargetAnchor.Name;
  }
};

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
  target: BidTargetAnchor;
  targetId: PublicKey;
  amount: BN;
  currency: PublicKey | null;
  expiry: BN;
  privateTaker: PublicKey | null;
  margin: PublicKey | null;
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

export class TCompSDK {
  program: Program<TcompIDL>;
  discMap: DiscMap<TcompIDL>;
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
    return decodeAcct(acct, this.discMap);
  }

  // --------------------------------------- ixs

  async list({
    merkleTree,
    owner,
    delegate = owner,
    proof,
    root,
    metadata,
    nonce,
    index,
    amount,
    expireInSec = null,
    currency = null,
    privateTaker = null,
    payer = null,
    compute = DEFAULT_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0,
  }: {
    merkleTree: PublicKey;
    owner: PublicKey;
    delegate?: PublicKey;
    proof: Buffer[];
    root: number[];
    metadata: MetadataArgs;
    //in most cases nonce == index and doesn't need to passed in separately
    nonce?: BN;
    index: number;
    amount: BN;
    expireInSec?: BN | null;
    currency?: PublicKey | null;
    privateTaker?: PublicKey | null;
    payer?: PublicKey | null;
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

    const dataHash = computeDataHash(metadata);
    const creatorsHash = computeCreatorHashPATCHED(metadata.creators);

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
        privateTaker
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
    if (!!delegate && !delegate.equals(owner)) {
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
    merkleTree,
    owner,
    nonce,
    amount,
    expireInSec = null,
    currency = null,
    privateTaker = null,
    // Not a heavy ix, no need
    compute = null,
    priorityMicroLamports = null,
  }: {
    merkleTree: PublicKey;
    owner: PublicKey;
    nonce: BN;
    amount: BN;
    expireInSec?: BN | null;
    currency?: PublicKey | null;
    privateTaker?: PublicKey | null;
    compute?: number | null;
    priorityMicroLamports?: number | null;
  }) {
    const assetId = await getLeafAssetId(merkleTree, nonce);
    const [listState] = findListStatePda({ assetId });

    const builder = this.program.methods
      .edit(nonce, amount, expireInSec, currency, privateTaker)
      .accounts({
        merkleTree,
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
      assetId,
      listState,
    };
  }

  async delist({
    merkleTree,
    owner,
    proof,
    root,
    metadata,
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
    metadata: MetadataArgs;
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

    const dataHash = computeDataHash(metadata);
    const creatorsHash = computeCreatorHashPATCHED(metadata.creators);

    const builder = this.program.methods
      .delist(nonce, index, root, [...dataHash], [...creatorsHash])
      .accounts({
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
    metadata,
    nonce,
    index,
    maxAmount,
    currency = null,
    optionalRoyaltyPct = null,
    owner,
    buyer,
    payer = null,
    takerBroker = null,
    compute = DEFAULT_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0,
  }: {
    merkleTree: PublicKey;
    delegate?: PublicKey;
    proof: Buffer[];
    root: number[];
    metadata: MetadataArgs;
    //in most cases nonce == index and doesn't need to passed in separately
    nonce?: BN;
    index: number;
    maxAmount: BN;
    currency?: PublicKey | null;
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

    let creators = metadata.creators.map((c) => ({
      pubkey: c.address,
      isSigner: false,
      isWritable: true,
    }));

    let proofPath = proof.slice(0, proof.length - canopyDepth).map((b) => ({
      pubkey: new PublicKey(b),
      isSigner: false,
      isWritable: false,
    }));

    const metaHash = computeMetadataArgsHash(metadata);

    const builder = this.program.methods
      .buy(
        nonce,
        index,
        root,
        [...metaHash],
        Buffer.from(metadata.creators.map((c) => c.share)),
        metadata.creators.map((c) => c.verified),
        metadata.sellerFeeBasisPoints,
        maxAmount,
        currency,
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
      })
      .remainingAccounts([...creators, ...proofPath]);

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
    owner,
    amount,
    expireInSec = null,
    currency = null,
    privateTaker = null,
    compute = DEFAULT_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    margin = null,
  }: {
    target: BidTarget;
    targetId: PublicKey;
    bidId?: PublicKey;
    owner: PublicKey;
    amount: BN;
    expireInSec?: BN | null;
    currency?: PublicKey | null;
    privateTaker?: PublicKey | null;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    margin?: PublicKey | null;
  }) {
    const [bidState] = findBidStatePda({ bidId, owner });

    const builder = this.program.methods
      .bid(
        bidId,
        targetId,
        castBidTarget(target),
        amount,
        expireInSec,
        currency,
        privateTaker
      )
      .accounts({
        owner,
        systemProgram: SystemProgram.programId,
        tcompProgram: TCOMP_ADDR,
        bidState,
        marginAccount: margin ?? owner,
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

    const builder = this.program.methods.cancelBid(bidId).accounts({
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
    cosigner = null,
  }: {
    bidId: PublicKey;
    owner: PublicKey;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    cosigner?: PublicKey | null;
  }) {
    const [bidState] = findBidStatePda({ bidId, owner });

    const builder = this.program.methods.closeExpiredBid(bidId).accounts({
      owner,
      systemProgram: SystemProgram.programId,
      bidState,
      cosigner: cosigner ?? TSWAP_COSIGNER,
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

  async takeBid({
    target,
    bidId,
    merkleTree,
    proof,
    root,
    metadata,
    nonce,
    index,
    minAmount,
    currency = null,
    optionalRoyaltyPct = null,
    owner,
    seller,
    delegate = seller,
    margin = null,
    takerBroker = null,
    compute = DEFAULT_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
    canopyDepth = 0,
  }: {
    target: BidTarget;
    bidId: PublicKey;
    merkleTree: PublicKey;
    proof: Buffer[];
    root: number[];
    metadata: MetadataArgs;
    //in most cases nonce == index and doesn't need to passed in separately
    nonce?: BN;
    index: number;
    minAmount: BN;
    currency?: PublicKey | null;
    optionalRoyaltyPct?: number | null;
    owner: PublicKey;
    seller: PublicKey;
    delegate?: PublicKey;
    margin?: PublicKey | null;
    takerBroker?: PublicKey | null;
    compute?: number | null;
    priorityMicroLamports?: number | null;
    canopyDepth?: number;
  }) {
    nonce = nonce ?? new BN(index);

    const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
    const [tcomp] = findTCompPda({});
    const [bidState] = findBidStatePda({ bidId, owner });

    let creators = metadata.creators.map((c) => ({
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
      delegate: delegate,
      marginAccount: margin ?? seller,
      tensorswapProgram: TENSORSWAP_ADDR,
    };
    const remAccounts = [...creators, ...proofPath];

    let builder;
    if ([BidTarget.AssetId, BidTarget.Fvc].includes(target)) {
      const metaHash = computeMetadataArgsHash(metadata);
      builder = this.program.methods
        .takeBidMetaHash(
          bidId,
          nonce,
          index,
          root,
          [...metaHash],
          Buffer.from(metadata.creators.map((c) => c.share)),
          metadata.creators.map((c) => c.verified),
          metadata.sellerFeeBasisPoints,
          minAmount,
          currency,
          optionalRoyaltyPct
        )
        .accounts(accounts)
        .remainingAccounts(remAccounts);
    } else {
      //VOC + name
      builder = this.program.methods
        .takeBidFullMeta(
          bidId,
          nonce,
          index,
          root,
          castMetadata(metadata),
          minAmount,
          currency,
          optionalRoyaltyPct
        )
        .accounts(accounts)
        .remainingAccounts(remAccounts);
    }

    const computeIxs = getTotalComputeIxs(compute, priorityMicroLamports);

    //because EITHER of the two has to sign, mark one of them as signer
    const ix = await builder.instruction();
    if (!!delegate && !delegate.equals(seller)) {
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

  parseIxs(tx: TransactionResponse): ParsedAnchorTcompIx<TcompIDL>[] {
    return parseAnchorTcompIxs<TcompIDL>({
      coder: this.coder,
      tx,
      programId: this.program.programId,
    });
  }

  getIxAmounts(ix: ParsedAnchorTcompIx<TcompIDL>): {
    amount: BN;
    tcompFee: BN | null;
    brokerFee: BN | null;
    creatorFee: BN | null;
    currency: PublicKey | null;
  } | null {
    if (!ix.noopIx) return null;
    const cpiData = Buffer.from(bs58.decode(ix.noopIx.data));
    try {
      const e = deserializeTcompEvent(cpiData);
      return {
        amount: e.amount,
        tcompFee: e.tcompFee ?? null,
        brokerFee: e.brokerFee ?? null,
        creatorFee: e.creatorFee ?? null,
        currency: e.currency,
      };
    } catch (e) {
      // TODO: no try catch, need to fail hard
      console.log("ERROR parsing tcomp event", e);
      return null;
    }
  }

  // FYI: accounts under InstructioNDisplay is the space-separated capitalized
  // version of the fields for the corresponding #[Accounts].
  // eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  // shared.sol_escrow -> "Shared > Sol Escrow"
  getAccountByName(
    ix: ParsedAnchorTcompIx<TcompIDL>,
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

export class MakeEvent {
  maker!: PublicKey;
  assetId!: PublicKey;
  amount!: BN;
  currency!: PublicKey | null;
  expiry!: BN;
  privateTaker!: PublicKey | null;

  constructor(fields?: Partial<MakeEvent>) {
    Object.assign(this, fields);
  }
}
export const makeEventSchema = new Map([
  [
    MakeEvent,
    {
      kind: "struct",
      fields: [
        ["maker", [32]],
        ["assetId", [32]],
        ["amount", "u64"],
        ["currency", { kind: "option", type: [32] }],
        ["expiry", "u64"],
        ["privateTaker", { kind: "option", type: [32] }],
      ],
    },
  ],
]);

export class TakeEvent {
  taker!: PublicKey;
  assetId!: PublicKey;
  amount!: BN;
  tcompFee!: BN;
  brokerFee!: BN;
  creatorFee!: BN;
  currency!: PublicKey | null;

  constructor(fields?: Partial<TakeEvent>) {
    Object.assign(this, fields);
  }
}
export const takeEventSchema = new Map([
  [
    TakeEvent,
    {
      kind: "struct",
      fields: [
        ["taker", [32]],
        ["assetId", [32]],
        ["amount", "u64"],
        ["tcompFee", "u64"],
        ["brokerFee", "u64"],
        ["creatorFee", "u64"],
        ["currency", { kind: "option", type: [32] }],
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
export const TCOMP_DISC_MAP: Record<
  TCompIxName,
  { disc: string; callsNoop: boolean }
> = {
  tcompNoop: {
    disc: hash("global:tcomp_noop").slice(0, 16),
    callsNoop: false,
  },
  buy: { disc: hash("global:buy").slice(0, 16), callsNoop: true },
  list: { disc: hash("global:list").slice(0, 16), callsNoop: true },
  delist: { disc: hash("global:delist").slice(0, 16), callsNoop: false },
  edit: { disc: hash("global:edit").slice(0, 16), callsNoop: true },
  bid: { disc: hash("global:bid").slice(0, 16), callsNoop: true },
  cancelBid: { disc: hash("global:cancel_bid").slice(0, 16), callsNoop: false },
  closeExpiredBid: {
    disc: hash("global:close_expired_bid").slice(0, 16),
    callsNoop: false,
  },
  takeBidMetaHash: {
    disc: hash("global:take_bid_meta_hash").slice(0, 16),
    callsNoop: true,
  },
  takeBidFullMeta: {
    disc: hash("global:take_bid_full_meta").slice(0, 16),
    callsNoop: true,
  },
  withdrawFees: {
    disc: hash("global:withdraw_fees").slice(0, 16),
    callsNoop: false,
  },
};
// List of all discriminators that should include a noop ix
export const TCOMP_IXS_WITH_NOOP = Object.entries(TCOMP_DISC_MAP)
  .filter(([_, ix]) => ix.callsNoop)
  .map(([_, ix]) => ix.disc);

export function deserializeTcompEvent(data: Buffer) {
  if (data.slice(0, 8).toString("hex") !== TCOMP_DISC_MAP["tcompNoop"].disc) {
    throw new Error("not tcomp noop buffer data");
  }
  // cut off anchor discriminator
  data = data.slice(8, data.length);
  if (data[0] === 0) {
    console.log("🟩 Maker event detected", data.length - 64);
    const e = borsh.deserialize(
      makeEventSchema,
      MakeEvent,
      data.slice(1, data.length)
    );
    return {
      type: "maker",
      maker: new PublicKey(e.maker),
      assetId: new PublicKey(e.assetId),
      amount: new BN(e.amount),
      currency: e.currency ? new PublicKey(e.currency) : null,
      expiry: new BN(e.expiry),
      privateTaker: e.privateTaker ? new PublicKey(e.privateTaker) : null,
    };
  } else if (data[0] === 1) {
    console.log("🟥 Taker event detected", data.length - 64);
    const e = borsh.deserialize(
      takeEventSchema,
      TakeEvent,
      data.slice(1, data.length)
    );
    return {
      type: "taker",
      taker: new PublicKey(e.taker),
      assetId: new PublicKey(e.assetId),
      amount: new BN(e.amount),
      tcompFee: new BN(e.tcompFee),
      creatorFee: new BN(e.creatorFee),
      brokerFee: new BN(e.brokerFee),
      currency: e.currency ? new PublicKey(e.currency) : null,
    };
  } else {
    throw new Error("unknown event");
  }
}

export type TcompExtractedIx = {
  rawIx: CompiledInstruction;
  ixIdx: number;
  /// Presence of field = it's a top-level ix; absence = inner ix itself.
  innerIxs?: CompiledInstruction[];
  /// Optionally a tcomp ix might have a noop ix attached. Not all will.
  noopIx?: CompiledInstruction;
};
export const extractAllTcompIxs = (
  tx: TransactionResponse,
  /// If passed, will filter for ixs w/ this program ID.
  programId?: PublicKey
): TcompExtractedIx[] => {
  const message = tx.transaction.message;

  let allIxs = [
    // Top-level ixs.
    ...message.instructions.map((rawIx, ixIdx) => ({
      rawIx,
      ixIdx,
      // This will break if Tcomp is being CPIed into
      innerIxs:
        tx.meta?.innerInstructions?.find(({ index }) => index === ixIdx)
          ?.instructions ?? [],
    })),
    // Inner ixs (eg in CPI calls).
    // TODO: do we need to filter out self-CPI subixs?
    ...(tx.meta?.innerInstructions?.flatMap(({ instructions, index }) =>
      instructions.map((rawIx) => ({ rawIx, ixIdx: index }))
    ) ?? []),
  ];

  // Pure noop sub-ixs. These will be attached and not returned separately.
  const noopIxs: TcompExtractedIx[] = [];
  // Tcomp ixs that are expected to have a noop associated with them. These will be returned.
  const tcompIxsWithNoop: TcompExtractedIx[] = [];
  // Remaining ixs. These will be returned.
  let otherIxs: TcompExtractedIx[] = [];

  allIxs.forEach((ix) => {
    const disc = getDisc(ix.rawIx.data);
    if (disc === TCOMP_DISC_MAP["tcompNoop"].disc) {
      noopIxs.push(ix);
    } else if (TCOMP_IXS_WITH_NOOP.includes(disc)) {
      tcompIxsWithNoop.push(ix);
    } else {
      otherIxs.push(ix);
    }
  });

  console.log(
    "noop / with noop / other",
    noopIxs.length,
    tcompIxsWithNoop.length,
    otherIxs.length
  );

  //(!) Strong assumption here that protocol and noop ixs come in pairs, ordered the same way
  if (noopIxs.length !== tcompIxsWithNoop.length) {
    throw new Error(
      "expected # of NOOPs to match # of ixs with NOOPs. Check callsNoop in TCOMP_DISC_MAP."
    );
  }
  tcompIxsWithNoop.forEach((ix, i) => {
    ix.noopIx = noopIxs[i].rawIx;
  });

  if (!isNullLike(programId)) {
    const programIdIndex = message.accountKeys.findIndex((k) =>
      k.equals(programId)
    );
    otherIxs = otherIxs.filter(
      ({ rawIx }) => rawIx.programIdIndex === programIdIndex
    );
  }

  return [...tcompIxsWithNoop, ...otherIxs];
};

export type ParsedAnchorTcompIx<IDL extends Idl> = {
  /// Index of top-level instruction.
  ixIdx: number;
  ix: AnchorIx<IDL>;
  /// Presence of field = it's a top-level ix; absence = inner ix itself.
  innerIxs?: CompiledInstruction[];
  noopIx?: CompiledInstruction;
  events: AnchorEvent<IDL>[];
  /// FYI: accounts under InstructionDisplay is the space-separated capitalized
  /// version of the fields for the corresponding #[Accounts].
  /// eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  formatted: InstructionDisplay | null;
  /// Needed to be able to figure out correct programs for sub-ixs
  accountKeys: PublicKey[];
};
export const parseAnchorTcompIxs = <IDL extends Idl>({
  coder,
  tx,
  eventParser,
  programId,
}: {
  coder: BorshCoder;
  tx: TransactionResponse;
  /// If provided, will try to parse events.
  /// Do not initialize if there are no events defined!
  eventParser?: EventParser;
  /// If passed, will only process ixs w/ this program ID.
  programId?: PublicKey;
}): ParsedAnchorTcompIx<IDL>[] => {
  const message = tx.transaction.message;
  const logs = tx.meta?.logMessages;

  const ixs: ParsedAnchorTcompIx<IDL>[] = [];
  extractAllTcompIxs(tx, programId).forEach(
    ({ rawIx, ixIdx, innerIxs, noopIx }) => {
      // Instruction data.
      const ix = coder.instruction.decode(rawIx.data, "base58");
      if (!ix) return;
      const accountMetas = rawIx.accounts.map((acctIdx) => {
        const pubkey = message.accountKeys[acctIdx];
        return {
          pubkey,
          isSigner: message.isAccountSigner(acctIdx),
          isWritable: message.isAccountWritable(acctIdx),
        };
      });

      // TODO: currently anchor doesn't support parsing events with coder. Tried both tuple and structs.
      //  In theory this shouldn't be a problem since we're now attaching noopIxs rather than sending them on their own
      //  But for the record leaving these:
      //  Tuple: https://discord.com/channels/889577356681945098/889577399308656662/1099868887870345327
      //  Structs: https://discord.com/channels/889577356681945098/889577399308656662/1100459365535854593
      // if (ix.name === "tcompNoop") return;

      const formatted = coder.instruction.format(ix, accountMetas);

      // Events data.
      // TODO: partition events properly by ix.
      const events = eventParser
        ? parseAnchorEvents<IDL>(eventParser, logs)
        : [];

      ixs.push({
        ixIdx,
        ix,
        innerIxs,
        noopIx,
        events,
        formatted,
        accountKeys: message.accountKeys,
      });
    }
  );

  return ixs;
};

export const getDisc = (bs58Data: string) =>
  Buffer.from(bs58.decode(bs58Data)).toString("hex").slice(0, 16);
