import { DiscMap, genDiscToDecoderMap } from "../common";
import {
  BN,
  BorshCoder,
  Coder,
  EventParser,
  Program,
  Provider,
} from "@project-serum/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
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

// --------------------------------------- idl

import { IDL as IDL_latest, Tcomp as tcomp_latest } from "./idl/tcomp";

export const tcompIDL_latest = IDL_latest;
export const tcompIDL_latest_EffSlot = 0;

export type tcompIDL = tcomp_latest;

// Use this function to figure out which IDL to use based on the slot # of historical txs.
export const triageBidIDL = (slot: number | bigint): tcompIDL | null => {
  if (slot < tcompIDL_latest_EffSlot) return null;
  return tcompIDL_latest;
};

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

// --------------------------------------- sdk

export class tcompSDK {
  program: Program<tcompIDL>;
  discMap: DiscMap<tcompIDL>;
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
    this.program = new Program<tcompIDL>(idl, addr, provider, coder);
    this.discMap = genDiscToDecoderMap(this.program);
    this.coder = new BorshCoder(idl);
    this.eventParser = new EventParser(addr, this.coder);
  }

  // --------------------------------------- account methods

  // decode(acct: AccountInfo<Buffer>): TaggedtcompPdaAnchor | null {
  //   if (!acct.owner.equals(this.program.programId)) return null;
  //   return decodeAcct(acct, this.discMap);
  // }

  // --------------------------------------- ixs

  async executeBuy({
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

    console.log(metadata.creators.map((c) => c.share));
    console.log(metadata.creators.map((c) => c.verified));

    const builder = this.program.methods
      .executeBuy(root, nonce, index, castMetadata(metadata))
      .accounts({
        logWrapper: SPL_NOOP_PROGRAM_ID,
        compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        merkleTree,
        treeAuthority,
        leafDelegate: leafOwner,
        leafOwner,
        newLeafOwner,
        bubblegum: BUBBLEGUM_PROGRAM_ID,
      })
      .remainingAccounts([...creators, ...proofPath]);

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
    };
  }
}
