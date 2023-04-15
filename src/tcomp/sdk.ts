import {
  AccountSuffix,
  decodeAcct,
  DiscMap,
  genDiscToDecoderMap,
  getAccountRent,
  getRentSync,
  hexCode,
  parseStrFn,
} from "../common";
import {
  BN,
  BorshCoder,
  Coder,
  EventParser,
  Program,
  Provider,
  Event,
  Instruction,
} from "@project-serum/anchor";
import {
  AccountInfo,
  Commitment,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionResponse,
} from "@solana/web3.js";
import { TCOMP_ADDR } from "./constants";
import {
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
import { isNullLike } from "@tensor-hq/tensor-common";
import { IDL as IDL_latest, Tcomp as tcomp_latest } from "./idl/tcomp";
import { InstructionDisplay } from "@project-serum/anchor/dist/cjs/coder/borsh/instruction";
import { ParsedAccount } from "../types";
import { findAssetId, findListStatePda, findTreeAuthorityPda } from "./pda";
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
  typeof TokenStandardAnchor[keyof typeof TokenStandardAnchor];
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
  typeof UseMethodAnchor[keyof typeof UseMethodAnchor];
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
  typeof TokenProgramVersionAnchor[keyof typeof TokenProgramVersionAnchor];
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

export type TCompEventAnchor = Event<typeof IDL_latest["events"][number]>;

// ------------- Types for parsed ixs from raw tx.

export type TCompIxName = typeof IDL_latest["instructions"][number]["name"];
export type TCompIx = Omit<Instruction, "name"> & { name: TCompIxName };
export type ParsedTCompIx = {
  ixIdx: number;
  ix: TCompIx;
  events: TCompEventAnchor[];
  // FYI: accounts under InstructioNDisplay is the space-separated capitalized
  // version of the fields for the corresponding #[Accounts].
  // eg sol_escrow -> "Sol Escrow', or tswap -> "Tswap"
  formatted: InstructionDisplay | null;
};
export type TCompPricedIx = { amount: BN; currency: PublicKey | null };

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
    leafOwner,
    leafDelegate = leafOwner,
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
  }: {
    merkleTree: PublicKey;
    leafOwner: PublicKey;
    leafDelegate?: PublicKey;
    proof: PublicKey[];
    root: number[];
    metadata: MetadataArgs;
    nonce: BN;
    index: number;
    amount: BN;
    expireInSec?: BN | null;
    currency?: PublicKey | null;
    privateTaker?: PublicKey | null;
    payer?: PublicKey | null;
  }) {
    const [treeAuthority] = findTreeAuthorityPda({ merkleTree });
    const [assetId] = findAssetId({ merkleTree, nonce });
    const [listState] = findListStatePda({ assetId });

    let creators = metadata.creators.map((c) => ({
      pubkey: c.address,
      isSigner: false,
      isWritable: true,
    }));

    let proofPath = proof.map((node: PublicKey) => ({
      pubkey: node,
      isSigner: false,
      isWritable: false,
    }));

    const builder = this.program.methods
      .list(
        nonce,
        index,
        root,
        castMetadata(metadata),
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
        merkleTree,
        treeAuthority,
        leafDelegate,
        leafOwner,
        listState,
        payer: payer ?? leafOwner,
      })
      .remainingAccounts([...creators, ...proofPath]);

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
    };
  }

  async buy({
    merkleTree,
    leafOwner,
    newLeafOwner,
    proof,
    root,
    metadata,
    nonce,
    index,
  }: {
    merkleTree: PublicKey;
    leafOwner: PublicKey;
    newLeafOwner: PublicKey;
    proof: PublicKey[];
    root: number[];
    metadata: MetadataArgs;
    nonce: BN;
    index: number;
  }) {
    const [treeAuthority, _bump] = await PublicKey.findProgramAddress(
      [merkleTree.toBuffer()],
      BUBBLEGUM_PROGRAM_ID
    );

    let creators = metadata.creators.map((c) => ({
      pubkey: c.address,
      isSigner: false,
      isWritable: true,
    }));

    let proofPath = proof.map((node: PublicKey) => ({
      pubkey: node,
      isSigner: false,
      isWritable: false,
    }));

    const [assetId] = findAssetId({ merkleTree, nonce });
    console.log("asset id", assetId.toString());

    console.log(metadata.creators.map((c) => c.share));
    console.log(metadata.creators.map((c) => c.verified));

    const builder = this.program.methods
      .buy(root, nonce, index, castMetadata(metadata))
      .accounts({
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        merkleTree,
        treeAuthority,
        leafDelegate: leafOwner,
        leafOwner,
        newLeafOwner,
        bubblegumProgram: BUBBLEGUM_PROGRAM_ID,
      })
      .remainingAccounts([...creators, ...proofPath]);

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
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
    name: typeof IDL_latest["errors"][number]["name"]
  ): typeof IDL_latest["errors"][number] {
    //@ts-ignore (throwing weird ts errors for me)
    return this.program.idl.errors.find((e) => e.name === name)!;
  }

  getErrorCodeHex(name: typeof IDL_latest["errors"][number]["name"]): string {
    return hexCode(this.getError(name).code);
  }

  // --------------------------------------- parsing raw txs

  // Stolen from https://github.com/saber-hq/saber-common/blob/4b533d77af8ad5c26f033fd5e69bace96b0e1840/packages/anchor-contrib/src/utils/coder.ts#L171-L185
  parseEvents = (logs: string[] | undefined | null) => {
    if (!logs) {
      return [];
    }

    const events: TCompEventAnchor[] = [];
    const parsedLogsIter = this.eventParser.parseLogs(logs ?? []);
    let parsedEvent = parsedLogsIter.next();
    while (!parsedEvent.done) {
      events.push(parsedEvent.value as unknown as TCompEventAnchor);
      parsedEvent = parsedLogsIter.next();
    }

    return events;
  };

  parseIxs(tx: TransactionResponse): ParsedTCompIx[] {
    const message = tx.transaction.message;
    const logs = tx.meta?.logMessages;

    const programIdIndex = message.accountKeys.findIndex((k) =>
      k.equals(this.program.programId)
    );

    const ixs: ParsedTCompIx[] = [];
    [
      // Top-level ixs.
      ...message.instructions.map((rawIx, ixIdx) => ({ rawIx, ixIdx })),
      // Inner ixs (eg in CPI calls).
      ...(tx.meta?.innerInstructions?.flatMap(({ instructions, index }) =>
        instructions.map((rawIx) => ({ rawIx, ixIdx: index }))
      ) ?? []),
    ].forEach(({ rawIx, ixIdx }) => {
      // Ignore ixs that are not from our program.
      if (rawIx.programIdIndex !== programIdIndex) return;

      // Instruction data.
      const ix = this.coder.instruction.decode(rawIx.data, "base58");
      if (!ix) return;
      const accountMetas = rawIx.accounts.map((acctIdx) => {
        const pubkey = message.accountKeys[acctIdx];
        return {
          pubkey,
          isSigner: message.isAccountSigner(acctIdx),
          isWritable: message.isAccountWritable(acctIdx),
        };
      });
      const formatted = this.coder.instruction.format(ix, accountMetas);

      // Events data.

      const events = this.parseEvents(logs);
      ixs.push({ ixIdx, ix: ix as TCompIx, events, formatted });
    });

    return ixs;
  }

  // TODO throwing an error
  // getFeeAmount(ix: ParsedTCompIx): BN | null {
  //   switch (ix.ix.name) {
  //     case "buy":
  //       const event = ix.events[0].data;
  //       return event.tswapFee.add(event.creatorsFee);
  //   }
  // }

  getAmount(
    ix: ParsedTCompIx
  ): { amount: BN; currency: PublicKey | null } | null {
    switch (ix.ix.name) {
      case "buy":
        return {
          amount: (ix.ix.data as TCompPricedIx).amount,
          currency: (ix.ix.data as TCompPricedIx).currency,
        };
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
