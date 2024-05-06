import type { DelistCompressedAsyncInput } from "@tensor-foundation/marketplace";
import {
  fetchListState,
  findListStatePda,
  getDelistCompressedInstructionAsync,
} from "@tensor-foundation/marketplace";
import { getAddressEncoder, address } from "@solana/addresses";
import {
  retrieveDASAssetFields,
  retrieveDASProofFields,
  getCanopyDepth,
  simulateTxWithIxs,
} from "./helpers";
import { SYSTEM_PROGRAM, rpc, keypairBytes } from "./common";
import { KeyPairSigner, createKeyPairSignerFromBytes } from "@solana/signers";

// delist given mint (needs to be a valid compressed NFT already listed (!) on Tensor)
async function delistCompressedListing(mint: string) {
  const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
    Buffer.from(keypairBytes),
    false,
  );

  // query DAS for assetProof and asset info
  const proofFields = await retrieveDASProofFields(mint);
  const assetFields = await retrieveDASAssetFields(mint);

  // get merkleTree related input fields
  const merkleTree = proofFields.tree_id;
  const index = assetFields.compression.leaf_id;
  const root = getAddressEncoder().encode(proofFields.root);

  // retrieve list state and retrieve related input fields
  const [listStatePda, listStateBump] = await findListStatePda({
    mint: address(mint),
  });
  const listState = await fetchListState(rpc, listStatePda);
  const listStateAddress = listState.address;
  const rentDest =
    listState.data.rentPayer == SYSTEM_PROGRAM
      ? listState.data.owner
      : listState.data.rentPayer;

  // get dataHash and creatorHash from DAS fetched asset fields (encoded as UInt8Array)
  const dataHash = getAddressEncoder().encode(
    assetFields.compression.data_hash,
  );
  const creatorHash = getAddressEncoder().encode(
    assetFields.compression.creator_hash,
  );

  // get canopyDepth for shortened proofPath (w/o that most constructed ixs will be too large)
  const canopyDepth = await getCanopyDepth(rpc, address(merkleTree));

  // build delist input accounts incl. data args
  const delistCompressedAsyncInput: DelistCompressedAsyncInput = {
    merkleTree: merkleTree,
    listState: listStateAddress,
    owner: keypairSigner,
    rentDest: rentDest,
    index: index,
    root: root,
    dataHash: dataHash,
    creatorHash: creatorHash,
    proof: proofFields.proof,
    canopyDepth: canopyDepth,
  };

  // retrieve list instruction
  const delistIx = await getDelistCompressedInstructionAsync(
    delistCompressedAsyncInput,
  );
  await simulateTxWithIxs(rpc, [delistIx], keypairSigner);
}
delistCompressedListing("511edGtZmyp7K5nHwPxum5hEL2ZxpYzQbGWgGq6s6XCC");
