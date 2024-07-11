import type { DelistCompressedAsyncInput } from "@tensor-foundation/marketplace";
import {
  fetchListState,
  findListStatePda,
  getDelistCompressedInstructionAsync,
} from "@tensor-foundation/marketplace";
import {
  retrieveAssetFields,
  retrieveProofFields,
  getCanopyDepth,
  simulateTxWithIxs,
} from "@tensor-foundation/common-helpers";
import { rpc, keypairBytes, helius_url } from "./common";
import { getAddressEncoder, address, KeyPairSigner, createKeyPairSignerFromBytes } from "@solana/web3.js";
import { Address } from "@solana/web3.js";

// delist given mint (needs to be a valid compressed NFT already listed (!) on Tensor)
async function delistCompressedListing(mint: string) {
  const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
    Buffer.from(keypairBytes),
    false,
  );

  // query DAS for assetProof and asset info
  const proofFields = await retrieveProofFields(helius_url, mint);
  const assetFields = await retrieveAssetFields(helius_url, mint);

  // get merkleTree related input fields
  const merkleTree = proofFields.tree_id;
  const index = assetFields.compression!.leaf_id;
  const root = getAddressEncoder().encode(address(proofFields.root));

  // retrieve list state and retrieve related input fields
  const [listStatePda] = await findListStatePda({
    mint: address(mint),
  });
  const listState = await fetchListState(rpc, listStatePda);
  const listStateAddress = listState.address;
  const rentDest =
    listState.data.rentPayer
      ? listState.data.rentPayer as Address
      : listState.data.owner;

  // get dataHash and creatorHash from DAS fetched asset fields (encoded as UInt8Array)
  const dataHash = getAddressEncoder().encode(
    address(assetFields.compression!.data_hash),
  );
  const creatorHash = getAddressEncoder().encode(
    address(assetFields.compression!.creator_hash),
  );

  // get canopyDepth for shortened proofPath (w/o that most constructed ixs will be too large)
  const canopyDepth = await getCanopyDepth(rpc, address(merkleTree));

  // build delist input accounts incl. data args
  const delistCompressedAsyncInput: DelistCompressedAsyncInput = {
    merkleTree: address(merkleTree),
    listState: listStateAddress,
    owner: keypairSigner,
    rentDestination: rentDest,
    index: index,
    root: root,
    dataHash: dataHash,
    creatorHash: creatorHash,
    proof: proofFields.proof.map((proof: string) => address(proof)),
    canopyDepth: canopyDepth,
  };

  // retrieve list instruction
  const delistIx = await getDelistCompressedInstructionAsync(
    delistCompressedAsyncInput,
  );
  await simulateTxWithIxs(rpc, [delistIx], keypairSigner);
}
delistCompressedListing("511edGtZmyp7K5nHwPxum5hEL2ZxpYzQbGWgGq6s6XCC");
