import {
  retrieveAssetFields,
  retrieveProofFields,
  getCanopyDepth,
  getTMetadataArgsArgs,
  simulateTxWithIxs,
} from "@tensor-foundation/common-helpers";
import { rpc, keypairBytes, helius_url } from "./common";
import { getAddressEncoder, address, KeyPairSigner, createKeyPairSignerFromBytes, isNone, unwrapOption } from "@solana/web3.js";
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
  const proofFields = await retrieveProofFields(helius_url, mint);
  const assetFields = await retrieveAssetFields(helius_url, mint);

  // retrieve bid state w/ related input fields
  const bidState = await fetchBidState(rpc, address(bidStateAccount));
  const bidStateAddress = bidState.address;
  const whitelist = bidState.data.targetId;
  const owner = bidState.data.owner;
  const marginAccount = isNone(bidState.data.margin)
    ? undefined
    : bidState.data.margin.value;
  const rentDest =
    bidState.data.rentPayer
      ? bidState.data.rentPayer
      : bidState.data.owner;
  const minAmount = bidState.data.amount;

  // get merkleTree related input fields
  const merkleTree = proofFields.tree_id;
  const index = assetFields.compression!.leaf_id;
  const root = getAddressEncoder().encode(address(proofFields.root));

  // get canopyDepth for shortened proofPath (w/o that most constructed ixs will be too large)
  const canopyDepth = await getCanopyDepth(rpc, address(merkleTree));
  // for cNFT collection bids, VOC field of whitelist can never be null, so takeBidMetaHash route isn't possible
  // => takeBidFullMeta route with full metadata args
  const metadataArgs = getTMetadataArgsArgs(assetFields);

  // build take bid input accounts incl. data args
  const takeBidCompressedFullMetaAsyncInput: TakeBidCompressedFullMetaAsyncInput =
    {
      seller: keypairSigner,
      merkleTree: address(merkleTree),
      bidState: bidStateAddress,
      owner: owner,
      marginAccount: marginAccount,
      whitelist: whitelist,
      rentDestination: rentDest,
      index: index,
      root: root,
      makerBroker: unwrapOption(bidState.data.makerBroker) ?? undefined,
      // get taker broker fees of the price back to your own wallet!
      takerBroker: keypairSigner.address,
      ...metadataArgs,
      minAmount: minAmount,
      creators: assetFields.creators?.map((c: any) => [c.address, c.share]),
      proof: proofFields.proof.map((proof: string) => address(proof)),
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
