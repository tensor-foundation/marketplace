import { getAddressEncoder, address } from "@solana/addresses";
import {
  retrieveDASAssetFields,
  retrieveDASProofFields,
  getCanopyDepth,
  getTMetadataArgsArgs,
  simulateTxWithIxs,
} from "./helpers";
import { SYSTEM_PROGRAM, rpc, keypairBytes } from "./common";
import { isNone } from "@solana/options";
import { KeyPairSigner, createKeyPairSignerFromBytes } from "@solana/signers";
import {
  TakeBidCompressedFullMetaAsyncInput,
  fetchBidState,
  getTakeBidCompressedFullMetaInstructionAsync,
} from "@tensor-foundation/marketplace";

// sells mint into bid specified via bidStateAccountAddress
async function takeCompressedCollectionBid(
  mint: string,
  bidStateAccount: string,
) {
  const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
    Buffer.from(keypairBytes),
    false,
  );

  // query DAS for assetProof and asset info
  const proofFields = await retrieveDASProofFields(mint);
  const assetFields = await retrieveDASAssetFields(mint);

  // retrieve bid state w/ related input fields
  const bidState = await fetchBidState(rpc, address(bidStateAccount));
  const bidStateAddress = bidState.address;
  const whitelist = bidState.data.targetId;
  const owner = bidState.data.owner;
  const marginAccount = isNone(bidState.data.margin)
    ? undefined
    : bidState.data.margin.value;
  const rentDest =
    bidState.data.rentPayer == SYSTEM_PROGRAM
      ? bidState.data.owner
      : bidState.data.rentPayer;
  const minAmount = bidState.data.amount;

  // get merkleTree related input fields
  const merkleTree = proofFields.tree_id;
  const index = assetFields.compression.leaf_id;
  const root = getAddressEncoder().encode(proofFields.root);

  // get canopyDepth for shortened proofPath (w/o that most constructed ixs will be too large)
  const canopyDepth = await getCanopyDepth(rpc, address(merkleTree));
  // for cNFT collections, VOC field of whitelist can never be null, so takeBidMetaHash route isn't possible
  // => takeBidFullMeta route with full metadata args
  const metadataArgs = getTMetadataArgsArgs(assetFields);

  // build take bid input accounts incl. data args
  const takeBidCompressedFullMetaAsyncInput: TakeBidCompressedFullMetaAsyncInput =
    {
      seller: keypairSigner,
      merkleTree: merkleTree,
      bidState: bidStateAddress,
      owner: owner,
      marginAccount: marginAccount,
      whitelist: whitelist,
      rentDest: rentDest,
      index: index,
      root: root,
      ...metadataArgs,
      minAmount: minAmount,
      creators: assetFields.creators.map((c: any) => [c.address, c.share]),
      proof: proofFields.proof,
      canopyDepth: canopyDepth,
    };
  // retrieve take bid instruction
  const takeBidIx = await getTakeBidCompressedFullMetaInstructionAsync(
    takeBidCompressedFullMetaAsyncInput,
  );
  await simulateTxWithIxs(rpc, [takeBidIx], keypairSigner);
}
takeCompressedCollectionBid(
  "EEz3YV4S8xLsSTK23NjsQvGA468hEcsEipbDfUpRsd16",
  "GxMnzSB9uoJDUADMGbxk9U4kHBW9BkdxMJg2Zaq7WsoK",
);
