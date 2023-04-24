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
  CompiledInnerInstruction,
  CompiledInstruction,
  ComputeBudgetProgram,
  Connection,
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
  filterNullLike,
  isNullLike,
  parseAnchorEvents,
} from "@tensor-hq/tensor-common";
import { InstructionDisplay } from "@project-serum/anchor/dist/cjs/coder/borsh/instruction";
import { ParsedAccount } from "../types";
import { findListStatePda, findTCompPda, findTreeAuthorityPda } from "./pda";
import { computeCreatorHashPATCHED } from "../../tests/shared";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
import { IDL as IDL_latest, Tcomp as tcomp_latest } from "./idl/tcomp";
import { hash } from "@project-serum/anchor/dist/cjs/utils/sha256";

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
  assetId: PublicKey;
  amount: BN;
  currency: PublicKey | null;
  expiry: BN;
  privateTaker: PublicKey | null;
  margin: PublicKey | null;
};
export type ListStateAnchor = Omit<BidStateAnchor, "margin">;

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

// ------------- Types for parsed ixs from raw tx.

export type TCompIxName = (typeof IDL_latest)["instructions"][number]["name"];
export type TCompIx = Omit<Instruction, "name"> & { name: TCompIxName };
export type ParsedTCompIx = {
  ixIdx: number;
  ix: TCompIx;
  // These are already filtered for the current ix
  innerIxs?: CompiledInstruction[];
  events: AnchorEvent<TcompIDL>[];
  // FYI: accounts under InstructioNDisplay is the space-separated capitalized
  // version of the fields for the corresponding #[Accounts].
  // eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  formatted: InstructionDisplay | null;
};
export type TCompPricedIx = { amount: BN; currency: PublicKey | null };
export type TCompBuyIx = { maxAmount: BN; currency: PublicKey | null };

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
    compute = DEFAULT_COMPUTE_UNITS,
    priorityMicroLamports = DEFAULT_MICRO_LAMPORTS,
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
        logWrapper: SPL_NOOP_PROGRAM_ID,
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

    console.log("creators", JSON.stringify(metadata.creators));

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

    const dataHash = computeDataHash(metadata);

    const builder = this.program.methods
      .buy(
        nonce,
        index,
        root,
        [...dataHash],
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
      eventParser: this.eventParser,
    });
  }

  findAllNoopIxs(ix: ParsedTCompIx): CompiledInstruction[] {
    const noopProgramIndex = ix.formatted?.accounts.findIndex((a) =>
      a.pubkey.equals(TCOMP_ADDR)
    );
    return (ix.innerIxs ?? []).filter(
      (ix) => ix.programIdIndex === noopProgramIndex
    );
  }

  getFeeAmount(ix: ParsedTCompIx): {
    tcompFee: BN;
    brokerFee: BN;
    creatorFee: BN;
    currency: PublicKey | null;
  } | null {
    const noopIxs = this.findAllNoopIxs(ix);

    console.log(
      "found noop ixs",
      noopIxs.length,
      JSON.stringify(noopIxs, null, 4)
    );

    if (!noopIxs.length) return null;

    const cpiData = Buffer.from(bs58.decode(noopIxs[0].data));
    const e = deserializeTcompEvent(cpiData);
    if (e.type === "maker") return null;
    return e as TakeEvent;
  }

  // TODO: idea - what if we just listened to noops?
  // TODO: 0xrwu - we could parse events from noop, but if we're CPIed into we won't see them, so this might actually be better
  getAmount(
    ix: ParsedTCompIx
  ): { amount: BN; currency: PublicKey | null } | null {
    switch (ix.ix.name) {
      case "list":
      case "edit":
        return {
          amount: (ix.ix.data as TCompPricedIx).amount,
          currency: (ix.ix.data as TCompPricedIx).currency,
        };
      case "buy":
        return {
          amount: (ix.ix.data as TCompBuyIx).maxAmount,
          currency: (ix.ix.data as TCompBuyIx).currency,
        };
      case "delist":
      case "tcompNoop":
        return null;
    }
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

export function deserializeTcompEvent(data: Buffer) {
  if (
    data.slice(0, 8).toString("hex") !== hash("global:tcomp_noop").slice(0, 16)
  ) {
    throw new Error("not tcomp noop buffer data");
  }
  // cut off anchor discriminator
  data = data.slice(8, data.length);
  if (data[0] === 0) {
    console.log("Maker event detected", data.length - 64);
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
    console.log("Taker event detected", data.length - 64);
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

// TODO: remove
export const parseTcompEvent = async ({
  conn,
  sig,
  tx,
}: {
  sig: string;
  tx?: TransactionResponse;
  conn: Connection;
}) => {
  const tempConn = new Connection(conn.rpcEndpoint, "confirmed");
  let usedTx =
    tx ??
    (await tempConn.getTransaction(sig, { maxSupportedTransactionVersion: 0 }));
  if (!usedTx) return;

  console.log(
    "ILJA INNER IXS",
    usedTx.meta!.innerInstructions![0].instructions?.length
  );

  // Get noop program instruction
  const accountKeys = usedTx.transaction.message.getAccountKeys();
  const noopInstruction = usedTx
    .meta!.innerInstructions![0].instructions.reverse()
    .find((i) => {
      return accountKeys.get(i.programIdIndex)?.equals(TCOMP_ADDR);
    });
  if (!noopInstruction) return;

  console.log("ILJA noop data", noopInstruction);

  const cpiData = Buffer.from(bs58.decode(noopInstruction.data));
  const event = deserializeTcompEvent(cpiData);
  console.log("event", JSON.stringify(event, null, 4));

  return event;
};

export const extractAllIxs = (
  tx: TransactionResponse,
  /// If passed, will filter for ixs w/ this program ID.
  programId?: PublicKey
): {
  rawIx: CompiledInstruction;
  ixIdx: number;
  /// Presence of field = it's a top-level ix; absence = inner ix itself.
  innerIxs?: CompiledInstruction[];
}[] => {
  const message = tx.transaction.message;

  let allIxs = [
    // Top-level ixs.
    ...message.instructions.map((rawIx, ixIdx) => ({
      rawIx,
      ixIdx,
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

  if (!isNullLike(programId)) {
    const programIdIndex = message.accountKeys.findIndex((k) =>
      k.equals(programId)
    );
    allIxs = allIxs.filter(
      ({ rawIx }) => rawIx.programIdIndex === programIdIndex
    );
  }

  return allIxs;
};

export type ParsedAnchorIx<IDL extends Idl> = {
  /// Index of top-level instruction.
  ixIdx: number;
  ix: AnchorIx<IDL>;
  /// Presence of field = it's a top-level ix; absence = inner ix itself.
  innerIxs?: CompiledInstruction[];
  events: AnchorEvent<IDL>[];
  /// FYI: accounts under InstructionDisplay is the space-separated capitalized
  /// version of the fields for the corresponding #[Accounts].
  /// eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  formatted: InstructionDisplay | null;
};

export const parseAnchorIxs = <IDL extends Idl>({
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
}): ParsedAnchorIx<IDL>[] => {
  const message = tx.transaction.message;
  const logs = tx.meta?.logMessages;

  const ixs: ParsedAnchorIx<IDL>[] = [];
  extractAllIxs(tx, programId).forEach(({ rawIx, ixIdx, innerIxs }) => {
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

    console.log(ix.name, JSON.stringify(ix), JSON.stringify(accountMetas));

    const formatted = coder.instruction.format(ix, accountMetas);

    console.log("RICHARD INNER IXS", innerIxs?.length);

    // Events data.
    // TODO: partition events properly by ix.
    const events = eventParser ? parseAnchorEvents<IDL>(eventParser, logs) : [];
    ixs.push({ ixIdx, ix, innerIxs, events, formatted });
  });

  return ixs;
};
