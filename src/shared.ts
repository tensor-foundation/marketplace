import { AccountClient, BN, Idl, Program, utils } from "@project-serum/anchor";
import { AllAccountsMap } from "@project-serum/anchor/dist/cjs/program/namespace/types";
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import {
  MetadataArgs,
  metadataArgsBeet,
  computeDataHash,
  Creator,
} from "@metaplex-foundation/mpl-bubblegum";
import { keccak_256 } from "js-sha3";

export const getAccountRent = (
  conn: Connection,
  acct: AccountClient
): Promise<number> => {
  return conn.getMinimumBalanceForRentExemption(acct.size);
};

export const getLamports = async (
  conn: Connection,
  acct: PublicKey
): Promise<number | undefined> => {
  return (await conn.getAccountInfo(acct))?.lamports;
};

export const hexCode = (decCode: number) => "0x" + decCode.toString(16);

export const removeNullBytes = (str: string) => {
  return str
    .split("")
    .filter((char) => char.codePointAt(0))
    .join("");
};

type Decoder = (buffer: Buffer) => any;
export type DiscMap<T extends Idl> = Record<
  string,
  { decoder: Decoder; name: keyof AllAccountsMap<T> }
>;

export const genDiscToDecoderMap = <T extends Idl>(
  program: Program<T>
): DiscMap<T> => {
  return Object.fromEntries(
    program.idl.accounts?.map((acc) => {
      const name = acc.name as keyof AllAccountsMap<T>;
      const capName = name.at(0)!.toUpperCase() + name.slice(1);

      return [
        utils.sha256.hash(`account:${capName}`).slice(0, 8),
        {
          decoder: (buffer: Buffer) =>
            program.coder.accounts.decode(name, buffer),
          name,
        },
      ];
    }) ?? []
  );
};

export const decodeAcct = <T extends Idl>(
  acct: AccountInfo<Buffer>,
  discMap: DiscMap<T>
) => {
  const disc = acct.data.toString("hex").slice(0, 8);
  const meta = discMap[disc];
  if (!meta) return null;

  return {
    name: meta.name,
    account: meta.decoder(acct.data),
  };
};

//#region Stringify function.

export const stringifyPKsAndBNs = (i: any) => {
  if (_isPk(i)) {
    return (<PublicKey>i).toBase58();
  } else if (i instanceof BN) {
    return i.toString();
  } else if (_parseType(i) === "array") {
    return _stringifyPKsAndBNInArray(i);
  } else if (_parseType(i) === "object") {
    return _stringifyPKsAndBNsInObject(i);
  }
  return i;
};

const _isPk = (obj: any): boolean => {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj["toBase58"] === "function"
  );
};

const _stringifyPKsAndBNsInObject = (o: any) => {
  const newO = { ...o };
  for (const [k, v] of Object.entries(newO)) {
    if (_isPk(v)) {
      newO[k] = (<PublicKey>v).toBase58();
    } else if (v instanceof BN) {
      newO[k] = (v as BN).toString();
    } else if (_parseType(v) === "array") {
      newO[k] = _stringifyPKsAndBNInArray(v as any);
    } else if (_parseType(v) === "object") {
      newO[k] = _stringifyPKsAndBNsInObject(v);
    } else {
      newO[k] = v;
    }
  }
  return newO;
};

const _stringifyPKsAndBNInArray = (a: any[]): any[] => {
  const newA = [];
  for (const i of a) {
    if (_isPk(i)) {
      newA.push(i.toBase58());
    } else if (i instanceof BN) {
      newA.push(i.toString());
    } else if (_parseType(i) === "array") {
      newA.push(_stringifyPKsAndBNInArray(i));
    } else if (_parseType(i) === "object") {
      newA.push(stringifyPKsAndBNs(i));
    } else {
      newA.push(i);
    }
  }
  return newA;
};

const _parseType = <T>(v: T): string => {
  if (v === null || v === undefined) {
    return "null";
  }
  if (typeof v === "object") {
    if (v instanceof Array) {
      return "array";
    }
    if (v instanceof Date) {
      return "date";
    }
    return "object";
  }
  return typeof v;
};

export const isNullLike = <T>(v: T | null | undefined): v is null | undefined =>
  v === null || v === undefined;

// #endregion

// pNFTs very expensive.
export const DEFAULT_COMPUTE_UNITS = 800_000;
export const DEFAULT_MICRO_LAMPORTS = 200_000;

export type AccountSuffix =
  | "Bid State"
  | "List State"
  | "Owner"
  | "Buyer"
  | "Seller"
  | "Delegate"
  | "Payer"
  | "Margin Account"
  | "Taker Broker"
  | "Maker Broker"
  | "Whitelist";

export const parseStrFn = (str: string) => {
  return Function(`'use strict'; return (${str})`)();
};

// based on https://docs.solana.com/developing/programming-model/accounts#:~:text=The%20current%20maximum%20size%20of,per%20account%20and%20per%20instruction.
export const getRentSync = (dataSize: number) =>
  Math.trunc(19.055441478439427 * (128 + dataSize) * 365.25);

export const nameToBuffer = (name: string) => {
  return Buffer.from(name.padEnd(32, "\0")).toJSON().data.slice(0, 32);
};

// TODO: temp patch over metaplex's code
export function computeCreatorHashPATCHED(creators: Creator[]) {
  const bufferOfCreatorData = Buffer.concat(
    creators.map((creator) => {
      return Buffer.concat([
        creator.address.toBuffer(),
        Buffer.from([creator.verified ? 1 : 0]),
        Buffer.from([creator.share]),
      ]);
    })
  );
  return Buffer.from(keccak_256.digest(bufferOfCreatorData));
}

// TODO: temp patch over metaplex's code
export function computeCompressedNFTHashPATCHED(
  assetId: PublicKey,
  owner: PublicKey,
  delegate: PublicKey,
  treeNonce: BN,
  metadata: MetadataArgs
): Buffer {
  const message = Buffer.concat([
    Buffer.from([0x1]), // All NFTs are version 1 right now
    assetId.toBuffer(),
    owner.toBuffer(),
    delegate.toBuffer(),
    treeNonce.toBuffer("le", 8),
    computeDataHash(metadata),
    computeCreatorHashPATCHED(metadata.creators),
  ]);

  return Buffer.from(keccak_256.digest(message));
}

// Version from metaplex but without seller fee basis points
export function computeMetadataArgsHash(metadata: MetadataArgs): Buffer {
  const [serializedMetadata] = metadataArgsBeet.serialize(metadata);
  return Buffer.from(keccak_256.digest(serializedMetadata));
}
