import {
  fetchListState,
  findListStatePda,
  BuyCompressedAsyncInput,
  getBuyCompressedInstructionAsync,
} from "@tensor-foundation/marketplace";
import {
  retrieveAssetFields,
  retrieveProofFields,
  getMetaHash,
  getCanopyDepth,
  simulateTxWithIxs,
} from "@tensor-foundation/common-helpers";
import { rpc, keypairBytes, helius_url} from "./common";
import { address, getAddressEncoder, KeyPairSigner, createKeyPairSignerFromBytes, Address, unwrapOption } from "@solana/web3.js";

// constructs tx to buy NFT specified by mint (needs to be a valid compressed NFT listed on tensor)
async function buyCompressedListing(mint: string) {
  const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
    Buffer.from(keypairBytes),
    false,
  );

  // query DAS for assetProof and asset info
  const proofFields = await retrieveProofFields(helius_url, mint);
  const assetFields = await retrieveAssetFields(helius_url, mint);

  // retrieve list state
  const [listStatePda, listStateBump] = await findListStatePda({
    mint: address(mint),
  });
  const listState = await fetchListState(rpc, listStatePda);

  // get merkleTree related input fields
  const merkleTree = proofFields.tree_id;
  const index = assetFields.compression!.leaf_id;
  const root = getAddressEncoder().encode(address(proofFields.root));

  // get listState related input fields
  const listStateAddress = listState.address;
  const owner = listState.data.owner;
  const rentDest =
    listState.data.rentPayer
      ? listState.data.rentPayer as Address
      : listState.data.owner;
      
  const maxAmount = listState.data.amount;

  // get metaHash, creator and royalty based fields
  const metaHash = getMetaHash(assetFields);
  if (!metaHash) {
    throw new Error("couldn't construct a valid meta hash");
  }

  const creatorShares = assetFields.creators ? Buffer.from(
    assetFields.creators.map((c: any) => c.share),
  ) : Buffer.alloc(0);
  const creatorVerified = assetFields.creators?.map((c: any) => c.verified) ?? [];
  const sellerFeeBasisPoints = assetFields.royalty?.basis_points ?? 0;
  const canopyDepth = await getCanopyDepth(rpc, address(merkleTree));

  const buyCompressedAsyncInput: BuyCompressedAsyncInput = {
    merkleTree: address(merkleTree),
    listState: listStateAddress,
    payer: keypairSigner,
    owner: owner,
    rentDestination: rentDest,
    index: index,
    root: root,
    makerBroker: unwrapOption(listState.data.makerBroker) ?? undefined,
    // get taker broker fees of the price back to your own wallet!
    takerBroker: keypairSigner.address,
    metaHash: metaHash,
    creatorShares: creatorShares,
    creatorVerified: creatorVerified,
    sellerFeeBasisPoints: sellerFeeBasisPoints,
    maxAmount: maxAmount,
    creators: assetFields.creators?.map((c: any) => [c.address, c.share]),
    proof: proofFields.proof.map((proof: string) => address(proof)),
    canopyDepth: canopyDepth,
  };

  // retrieve buy instruction
  const buyIx = await getBuyCompressedInstructionAsync(buyCompressedAsyncInput);
  await simulateTxWithIxs(rpc, [buyIx], keypairSigner);
}
buyCompressedListing("BYdzThPGCp32GWCWNAk4ub9oFzPMmomwRdLBjMhs5ALP");
