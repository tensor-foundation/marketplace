import {
  fetchListState,
  findListStatePda,
  BuyCompressedAsyncInput,
  getBuyCompressedInstructionAsync,
} from "@tensor-foundation/marketplace";
import { getAddressEncoder } from "@solana/addresses";
import {
  retrieveDASAssetFields,
  retrieveDASProofFields,
  constructMetaHash,
  getCanopyDepth,
  simulateTxWithIxs,
} from "./helpers";
import { rpc, keypairBytes, SYSTEM_PROGRAM } from "./common";
import { address } from "@solana/addresses";
import { KeyPairSigner, createKeyPairSignerFromBytes } from "@solana/signers";

// constructs tx to buy NFT specified by mint (needs to be a valid compressed NFT listed on tensor)
async function buyCompressedListing(mint: string) {
  const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
    Buffer.from(keypairBytes),
    false,
  );

  // query DAS for assetProof and asset info
  const proofFields = await retrieveDASProofFields(mint);
  const assetFields = await retrieveDASAssetFields(mint);

  // retrieve list state
  const [listStatePda, listStateBump] = await findListStatePda({
    mint: address(mint),
  });
  const listState = await fetchListState(rpc, listStatePda);

  // get merkleTree related input fields
  const merkleTree = proofFields.tree_id;
  const index = assetFields.compression.leaf_id;
  const root = getAddressEncoder().encode(proofFields.root);

  // get listState related input fields
  const listStateAddress = listState.address;
  const owner = listState.data.owner;
  const rentDest =
    listState.data.rentPayer == SYSTEM_PROGRAM
      ? undefined
      : listState.data.rentPayer;
  const maxAmount = listState.data.amount;

  // get metaHash, creator and royalty based fields
  const metaHash = constructMetaHash(assetFields);
  if (!metaHash) {
    throw new Error("couldn't construct a valid meta hash");
  }

  const creatorShares = Buffer.from(
    assetFields.creators.map((c: any) => c.share),
  );
  const creatorVerified = assetFields.creators.map((c: any) => c.verified);
  const sellerFeeBasisPoints = assetFields.royalty.basis_points;
  const canopyDepth = await getCanopyDepth(rpc, merkleTree);

  const buyCompressedAsyncInput: BuyCompressedAsyncInput = {
    merkleTree: merkleTree,
    listState: listStateAddress,
    payer: keypairSigner,
    owner: owner,
    rentDest: rentDest,
    index: index,
    root: root,
    metaHash: metaHash,
    creatorShares: creatorShares,
    creatorVerified: creatorVerified,
    sellerFeeBasisPoints: sellerFeeBasisPoints,
    maxAmount: maxAmount,
    creators: assetFields.creators.map((c: any) => [c.address, c.share]),
    proof: proofFields.proof,
    canopyDepth: canopyDepth,
  };

  // retrieve buy instruction
  const buyIx = await getBuyCompressedInstructionAsync(buyCompressedAsyncInput);
  await simulateTxWithIxs(rpc, [buyIx], keypairSigner);
}
buyCompressedListing("BYdzThPGCp32GWCWNAk4ub9oFzPMmomwRdLBjMhs5ALP");
