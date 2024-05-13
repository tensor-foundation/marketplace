import { keccak_256 } from "js-sha3";
import { getAddressEncoder, getAddressDecoder } from "@solana/addresses";
import type { Address } from "@solana/addresses";
import { helius_url } from "./common";
import type { TCollection, TUses } from "@tensor-foundation/marketplace";
import {
  TTokenProgramVersion,
  TTokenStandard,
  getTTokenStandardEncoder,
  getTCollectionEncoder,
  getTUsesEncoder,
  getTTokenProgramVersionEncoder,
  TUseMethod,
} from "@tensor-foundation/marketplace";
import axios from "axios";
import BN from "bn.js";
import { getStructEncoder, getUtf8Encoder } from "@solana/codecs";
import {
  getU8Encoder,
  getU16Encoder,
  getU32Encoder,
  getU64Decoder,
  getU8Decoder,
  getU32Decoder,
} from "@solana/codecs-numbers";
import {
  getBooleanEncoder,
  getNullableEncoder,
  getArrayEncoder,
  getScalarEnumDecoder,
  getDataEnumDecoder,
  getArrayDecoder,
  getStructDecoder,
} from "@solana/codecs-data-structures";

// only needed for addEncoderSizePrefix (which we can eventually import in newer versions)
import {
  createEncoder,
  Encoder,
  getEncodedSize,
  isFixedSize,
} from "@solana/codecs-core";

import { IInstruction } from "@solana/instructions";
import { pipe } from "@solana/functional";
import { KeyPairSigner, Rpc, SolanaRpcApi } from "@solana/web3.js";
import {
  createTransaction,
  setTransactionFeePayer,
  appendTransactionInstruction,
  getBase64EncodedWireTransaction,
  setTransactionLifetimeUsingBlockhash,
} from "@solana/transactions";

export async function simulateTxWithIxs(
  rpc: Rpc<SolanaRpcApi>,
  ixs: IInstruction[],
  signer: KeyPairSigner,
): Promise<void> {
  const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();
  const simPipe = pipe(
    createTransaction({ version: 0 }),
    // maps each instruction to an lambda expression that looks like: (tx) => appendTransactionInstruction(instruction, tx),
    ...(ixs.map(
      (ix) => (tx: any) => appendTransactionInstruction(ix, tx),
    ) as []),
    (tx) => setTransactionFeePayer(signer.address, tx),
    (tx) => setTransactionLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => getBase64EncodedWireTransaction(tx),
  );
  const simulationResponse = await rpc
    .simulateTransaction(simPipe, {
      encoding: "base64",
      sigVerify: false,
      replaceRecentBlockhash: true,
    })
    .send();
  console.log(simulationResponse);
}

////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// DAS queries ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

// query DAS API for proof info
export async function retrieveDASProofFields(mint: string) {
  const proofRes = await axios
    .post(helius_url, {
      jsonrpc: "2.0",
      id: "0",
      method: "getAssetProof",
      params: {
        id: mint,
      },
    })
    .then((response: any) => {
      return response.data.result;
    });
  return proofRes;
}

// query DAS API for asset info
export async function retrieveDASAssetFields(mint: string) {
  const assetRes = await axios
    .post(helius_url, {
      jsonrpc: "2.0",
      id: "0",
      method: "getAsset",
      params: {
        id: mint,
      },
    })
    .then((response: any) => {
      return response.data.result;
    });
  return assetRes;
}

////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// metadataArgs + metaHash ///////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

type TCreator = {
  address: string;
  verified: boolean;
  share: number;
};
type MetadataArgs = {
  name: string;
  symbol: string;
  uri: string;
  sellerFeeBasisPoints: number;
  primarySaleHappened: boolean;
  isMutable: boolean;
  editionNonce: number | null;
  tokenStandard: TTokenStandard | null;
  collection: TCollection | null;
  uses: TUses | null;
  tokenProgramVersion: TTokenProgramVersion;
  creators: [TCreator];
};

//TODO: getTMetadataArgsArgs vs getMetadataArgs
// need first for price-lock/marketplace input args
// need second for constructMetaHash/computeMetadataArgsHash
// maybe getMetadataArgs to getTMetadataArgsArgs function?
// this is getting quite confusing though!
export function getTMetadataArgsArgs(assetFields: any) {
  const {
    compression,
    content,
    royalty,
    creators,
    uses,
    grouping,
    supply,
    ownership: { owner, delegate },
    mutable,
  } = assetFields;
  const coll = grouping.find(
    (group: any) => group.group_key === "collection",
  )?.group_value;
  const tokenStandard = content.metadata.token_standard;
  var metadataArgs = {
    name: content?.metadata?.name ?? "",
    symbol: content?.metadata?.symbol ?? " ",
    uri: content?.json_uri ?? "",
    sellerFeeBasisPoints: royalty.basis_points,
    primarySaleHappened: royalty.primary_sale_happened,
    isMutable: mutable,
    editionNonce: supply?.edition_nonce != null ? supply!.edition_nonce : null,
    tokenStandard:
      tokenStandard === "Fungible"
        ? TTokenStandard.Fungible
        : tokenStandard === "NonFungibleEdition"
          ? TTokenStandard.NonFungibleEdition
          : tokenStandard === "FungibleAsset"
            ? TTokenStandard.FungibleAsset
            : tokenStandard === "NonFungible"
              ? TTokenStandard.NonFungible
              : null,
    collection: coll ? ({ key: coll, verified: true } as TCollection) : null,
    uses: uses
      ? ({
          useMethod:
            uses.use_method === "Burn"
              ? 0
              : uses.use_method === "Multiple"
                ? 1
                : 2,
          remaining: uses.remaining,
          total: uses.total,
        } as TUses)
      : null,
    tokenProgramVersion: TTokenProgramVersion.Original,
    creatorShares: creators.map((creator: TCreator) => creator.share),
    creatorVerified: creators.map((creator: TCreator) => creator.verified),
  };
  return metadataArgs;
}

// helper function for retrieving metaHash
export function getMetadataArgs(assetFields: any) {
  const {
    compression,
    content,
    royalty,
    creators,
    uses,
    grouping,
    supply,
    ownership: { owner, delegate },
    mutable,
  } = assetFields;
  const coll = grouping.find(
    (group: any) => group.group_key === "collection",
  )?.group_value;
  const tokenStandard = content.metadata.token_standard;

  const metadataArgs: MetadataArgs = {
    name: content?.metadata?.name ?? "",
    symbol: content?.metadata?.symbol ?? " ",
    uri: content?.json_uri ?? "",
    sellerFeeBasisPoints: royalty.basis_points,
    creators: creators,
    primarySaleHappened: royalty.primary_sale_happened,
    isMutable: mutable,
    editionNonce: supply?.edition_nonce != null ? supply!.edition_nonce : null,
    tokenStandard:
      tokenStandard === "Fungible"
        ? TTokenStandard.Fungible
        : tokenStandard === "NonFungibleEdition"
          ? TTokenStandard.NonFungibleEdition
          : tokenStandard === "FungibleAsset"
            ? TTokenStandard.FungibleAsset
            : tokenStandard === "NonFungible"
              ? TTokenStandard.NonFungible
              : null,
    collection: coll ? ({ key: coll, verified: true } as TCollection) : null,
    uses: uses
      ? ({
          useMethod:
            uses.use_method === "Burn"
              ? TUseMethod.Burn
              : uses.use_method === TUseMethod.Multiple
                ? 1
                : TUseMethod.Single,
          remaining: uses.remaining,
          total: uses.total,
        } as TUses)
      : null,
    // currently always Original for cNFTs
    tokenProgramVersion: TTokenProgramVersion.Original,
  };
  return metadataArgs;
}

// helper function for constructing meta hash
export function constructMetaHash(assetFields: any) {
  const sellerFeeBasisPointsBuffer = new BN(
    assetFields.royalty.basis_points,
  ).toBuffer("le", 2);
  const dataHashBuffer = getAddressEncoder().encode(
    assetFields.compression.data_hash,
  );
  const metadataArgs = getMetadataArgs(assetFields);
  const originalMetadata = { ...metadataArgs };

  // hash function on top of candidate metaHash to compare against data_hash
  const makeDataHash = (metadataArgs: any) =>
    Buffer.from(
      keccak_256.digest(
        Buffer.concat([
          computeMetadataArgsHash(metadataArgs),
          sellerFeeBasisPointsBuffer,
        ]),
      ),
    );

  // try original metadataArgs
  var hash = makeDataHash(metadataArgs);
  if (hash.equals(dataHashBuffer)) {
    return computeMetadataArgsHash(metadataArgs);
  }

  // try tokenStandard = null
  metadataArgs.tokenStandard = null;
  hash = makeDataHash(metadataArgs);
  if (hash.equals(dataHashBuffer)) {
    return computeMetadataArgsHash(metadataArgs);
  }

  // try name + uri = "", tokenStandard = null
  metadataArgs.name = "";
  metadataArgs.uri = "";
  hash = makeDataHash(metadataArgs);
  if (hash.equals(dataHashBuffer)) {
    return computeMetadataArgsHash(metadataArgs);
  }

  // try name + uri = "", tokenStandard = 0
  metadataArgs.tokenStandard = 0;
  hash = makeDataHash(metadataArgs);
  if (hash.equals(dataHashBuffer)) {
    return computeMetadataArgsHash(metadataArgs);
  }

  // try reversing creators
  metadataArgs.creators.reverse();
  metadataArgs.name = originalMetadata.name;
  metadataArgs.uri = originalMetadata.uri;
  metadataArgs.tokenStandard = originalMetadata.tokenStandard;
  hash = makeDataHash(metadataArgs);
  if (hash.equals(dataHashBuffer)) {
    return computeMetadataArgsHash(metadataArgs);
  }

  // can't match - return null
  return null;
}

function computeMetadataArgsHash(metadataArgs: any) {
  const serializedMetadataArgs = getMetadataArgsEncoder().encode(metadataArgs);
  return Buffer.from(keccak_256.digest(serializedMetadataArgs));
}

function getTCreatorEncoder() {
  return getStructEncoder([
    ["address", getAddressEncoder()],
    ["verified", getBooleanEncoder()],
    ["share", getU8Encoder()],
  ]);
}

function getMetadataArgsEncoder() {
  return getStructEncoder([
    // adds 4 bytes (U32 equiv) offset containing size before each variable sized utf8 string (name, symbol, uri)
    ["name", addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
    ["symbol", addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
    ["uri", addEncoderSizePrefix(getUtf8Encoder(), getU32Encoder())],
    ["sellerFeeBasisPoints", getU16Encoder()],
    ["primarySaleHappened", getBooleanEncoder()],
    ["isMutable", getBooleanEncoder()],
    ["editionNonce", getNullableEncoder(getU8Encoder())],
    ["tokenStandard", getNullableEncoder(getTTokenStandardEncoder())],
    ["collection", getNullableEncoder(getTCollectionEncoder())],
    ["uses", getNullableEncoder(getTUsesEncoder())],
    ["tokenProgramVersion", getTTokenProgramVersionEncoder()],
    ["creators", getArrayEncoder(getTCreatorEncoder())],
  ]);
}

////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// canopy depth //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

// https://github.com/solana-labs/solana-program-library/blob/3e35101763097b5b3d21686191132e5d930f5b23/account-compression/sdk/src/accounts/ConcurrentMerkleTreeAccount.ts#L140
// translated from beets to equivalent codecs based decoders
export async function getCanopyDepth(rpc: any, merkleTree: Address) {
  const merkleTreeData = await rpc
    .getAccountInfo(merkleTree, { encoding: "base64" })
    .send()
    .then((result: any) => result.value.data[0]);
  const merkleTreeDataBytes = Buffer.from(merkleTreeData, "base64");
  var currOffset = 0;
  const [merkleTreeHeader, headerOffset] =
    getConcurrentMerkleTreeHeaderDecoder().read(
      merkleTreeDataBytes,
      currOffset,
    );
  currOffset = headerOffset;
  const { maxDepth, maxBufferSize } = merkleTreeHeader.header;
  const [tree, treeOffset] = getConcurrentMerkleTreeDecoderFactory(
    maxDepth,
    maxBufferSize,
  ).read(merkleTreeDataBytes, currOffset);
  const canopyDepth = getCanopyDepthFromCanopyByteLength(
    merkleTreeDataBytes.length - treeOffset,
  );
  return canopyDepth;
}

// https://github.com/solana-labs/solana-program-library/blob/3e35101763097b5b3d21686191132e5d930f5b23/account-compression/sdk/src/accounts/ConcurrentMerkleTreeAccount.ts#L133
function getCanopyDepthFromCanopyByteLength(canopyByteLength: number) {
  if (canopyByteLength === 0) {
    return 0;
  }
  return Math.log2(canopyByteLength / 32 + 2) - 1;
}

////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// merkle tree header decoder ////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function getConcurrentMerkleTreeHeaderDataV1Decoder() {
  return getStructDecoder([
    ["maxBufferSize", getU32Decoder()],
    ["maxDepth", getU32Decoder()],
    ["authority", getAddressDecoder()],
    ["creationSlot", getU64Decoder()],
    ["padding", getArrayDecoder(getU8Decoder(), { size: 6 })],
  ]);
}

enum CompressionAccountType {
  Uninitialized,
  ConcurrentMerkleTree,
}

function getCompressionAccountTypeDecoder() {
  return getScalarEnumDecoder(CompressionAccountType);
}

function getConcurrentMerkleTreeHeaderDataDecoder() {
  return getDataEnumDecoder([
    ["V1", getConcurrentMerkleTreeHeaderDataV1Decoder()],
  ]);
}

function getConcurrentMerkleTreeHeaderDecoder() {
  return getStructDecoder([
    ["accountType", getCompressionAccountTypeDecoder()],
    ["header", getConcurrentMerkleTreeHeaderDataDecoder()],
  ]);
}

////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////// merkle tree decoder factories /////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function getPathDecoderFactory(maxDepth: number) {
  return getStructDecoder([
    ["proof", getArrayDecoder(getAddressDecoder(), { size: maxDepth })],
    ["leaf", getAddressDecoder()],
    ["index", getU32Decoder()],
    ["_padding", getU32Decoder()],
  ]);
}

function getChangeLogDecoderFactory(maxDepth: number) {
  return getStructDecoder([
    ["root", getAddressDecoder()],
    ["pathNodes", getArrayDecoder(getAddressDecoder(), { size: maxDepth })],
    ["index", getU32Decoder()],
    ["_padding", getU32Decoder()],
  ]);
}

function getConcurrentMerkleTreeDecoderFactory(
  maxDepth: number,
  maxBufferSize: number,
) {
  return getStructDecoder([
    ["sequenceNumber", getU64Decoder()],
    ["activeIndex", getU64Decoder()],
    ["bufferSize", getU64Decoder()],
    [
      "changeLogs",
      getArrayDecoder(getChangeLogDecoderFactory(maxDepth), {
        size: maxBufferSize,
      }),
    ],
    ["rightMostPath", getPathDecoderFactory(maxDepth)],
  ]);
}

// yoinked from https://github.com/solana-labs/solana-web3.js/blob/master/packages/codecs-core/src/add-codec-size-prefix.ts
// (only available in experimental new release, not in preview.2 yet :( )
// (we'll import that function instead once we update our stuff to newer 2.0.0 versions)
function addEncoderSizePrefix<TFrom>(
  encoder: Encoder<TFrom>,
  prefix: any,
): Encoder<TFrom> {
  const write = ((value, bytes, offset) => {
    // Here we exceptionally use the `encode` function instead of the `write`
    // function to contain the content of the encoder within its own bounds.
    const encoderBytes = encoder.encode(value);
    offset = prefix.write(encoderBytes.length, bytes, offset);
    bytes.set(encoderBytes, offset);
    return offset + encoderBytes.length;
  }) as Encoder<TFrom>["write"];

  if (isFixedSize(prefix) && isFixedSize(encoder)) {
    return createEncoder({
      ...encoder,
      fixedSize: prefix.fixedSize + encoder.fixedSize,
      write,
    });
  }

  const prefixMaxSize = isFixedSize(prefix)
    ? prefix.fixedSize
    : prefix.maxSize ?? null;
  const encoderMaxSize = isFixedSize(encoder)
    ? encoder.fixedSize
    : encoder.maxSize ?? null;
  const maxSize =
    prefixMaxSize !== null && encoderMaxSize !== null
      ? prefixMaxSize + encoderMaxSize
      : null;

  return createEncoder({
    ...encoder,
    ...(maxSize !== null ? { maxSize } : {}),
    getSizeFromValue: (value) => {
      const encoderSize = getEncodedSize(value, encoder);
      return getEncodedSize(encoderSize, prefix) + encoderSize;
    },
    write,
  });
}
