import { DiscMap, genDiscToDecoderMap } from "../common";
import {
  AnchorProvider,
  BN,
  BorshCoder,
  Coder,
  Event,
  EventParser,
  Instruction,
  Program,
  Provider,
  Wallet,
} from "@project-serum/anchor";
import {
  AccountInfo,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { TCOMP_ADDR } from "./constants";
import {
  createCreateTreeInstruction,
  createDecompressV1Instruction,
  createMintToCollectionV1Instruction,
  createRedeemInstruction,
  createTransferInstruction,
  MetadataArgs,
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  TokenProgramVersion,
  TokenStandard,
} from "@metaplex-foundation/mpl-bubblegum";

// --------------------------------------- idl

import { IDL as IDL_latest, tcomp as tcomp_latest } from "./idl/tcomp";
import {
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";

// todo
export const tcompIDL_latest = IDL_latest;
export const tcompIDL_latest_EffSlot = 0;

export type tcompIDL = tcomp_latest;

// Use this function to figure out which IDL to use based on the slot # of historical txs.
export const triageBidIDL = (slot: number | bigint): tcompIDL | null => {
  if (slot < tcompIDL_latest_EffSlot) return null;
  return tcompIDL_latest;
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
    idl?: any; //todo better typing
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
    dataHash,
    creatorHash,
    nonce,
    index,
  }: {
    merkleTree: PublicKey;
    leafOwner: PublicKey;
    newLeafOwner: PublicKey;
    proof: PublicKey[];
    root: number[];
    dataHash: number[];
    creatorHash: number[];
    nonce: BN;
    index: number;
  }) {
    const [treeAuthority, _bump] = await PublicKey.findProgramAddress(
      [merkleTree.toBuffer()],
      BUBBLEGUM_PROGRAM_ID
    );

    let proofPath = proof.map((node: PublicKey) => ({
      pubkey: node,
      isSigner: false,
      isWritable: false,
    }));

    const builder = this.program.methods
      .executeBuy(root, dataHash, creatorHash, nonce, index)
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
      .remainingAccounts(proofPath);

    return {
      builder,
      tx: { ixs: [await builder.instruction()], extraSigners: [] },
    };
  }
}
