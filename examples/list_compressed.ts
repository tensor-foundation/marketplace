import {
  retrieveAssetFields,
  retrieveProofFields,
  getCanopyDepth,
  simulateTxWithIxs,
} from "@tensor-foundation/common-helpers";
import { rpc, keypairBytes, helius_url } from "./common";
import { getAddressEncoder, address, KeyPairSigner, createKeyPairSignerFromBytes } from "@solana/web3.js";
import {
  ListCompressedAsyncInput,
  findListStatePda,
  getListCompressedInstructionAsync,
} from "@tensor-foundation/marketplace";

// lists mint for amountLamports (mint needs to be a valid compressed NFT)
async function listCompressedMint(mint: string, amountLamports: number) {
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

  // retrieve list state
  const [listStatePda, listStateBump] = await findListStatePda({
    mint: address(mint),
  });

  // get dataHash and creatorHash from DAS fetched asset fields
  const dataHash = getAddressEncoder().encode(
    address(assetFields.compression!.data_hash),
  );
  const creatorHash = getAddressEncoder().encode(
    address(assetFields.compression!.creator_hash),
  );

  // get canopyDepth for shortened proofPath (w/o that most constructed ixs will be too large)
  const canopyDepth = await getCanopyDepth(rpc, address(merkleTree));

  // build list input accounts incl. data args
  const listCompressedAsyncInput: ListCompressedAsyncInput = {
    owner: keypairSigner,
    merkleTree: address(merkleTree),
    listState: listStatePda,
    index: index,
    root: root,
    dataHash: dataHash,
    creatorHash: creatorHash,
    // get maker broker fees of the price back to your own wallet
    // when the listing gets sold!
    makerBroker: keypairSigner.address,
    amount: amountLamports,
    proof: proofFields.proof.map((proof: string) => address(proof)),
    canopyDepth: canopyDepth,
  };

  // retrieve list instruction
  const listIx = await getListCompressedInstructionAsync(
    listCompressedAsyncInput,
  );
  await simulateTxWithIxs(rpc, [listIx], keypairSigner);
}
listCompressedMint(
  "EEz3YV4S8xLsSTK23NjsQvGA468hEcsEipbDfUpRsd16",
  1 * 1_000_000_000,
);
