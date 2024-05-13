import { getAddressEncoder, address } from "@solana/addresses";
import {
  retrieveDASAssetFields,
  retrieveDASProofFields,
  getCanopyDepth,
  simulateTxWithIxs,
} from "./helpers";
import { rpc, keypairBytes } from "./common";
import { KeyPairSigner, createKeyPairSignerFromBytes } from "@solana/signers";
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
  const proofFields = await retrieveDASProofFields(mint);
  const assetFields = await retrieveDASAssetFields(mint);

  // get merkleTree related input fields
  const merkleTree = proofFields.tree_id;
  const index = assetFields.compression.leaf_id;
  const root = getAddressEncoder().encode(proofFields.root);

  // retrieve list state
  const [listStatePda, listStateBump] = await findListStatePda({
    mint: address(mint),
  });

  // get dataHash and creatorHash from DAS fetched asset fields
  const dataHash = getAddressEncoder().encode(
    assetFields.compression.data_hash,
  );
  const creatorHash = getAddressEncoder().encode(
    assetFields.compression.creator_hash,
  );

  // get canopyDepth for shortened proofPath (w/o that most constructed ixs will be too large)
  const canopyDepth = await getCanopyDepth(rpc, address(merkleTree));

  // build list input accounts incl. data args
  const listCompressedAsyncInput: ListCompressedAsyncInput = {
    owner: keypairSigner,
    merkleTree: merkleTree,
    listState: listStatePda,
    index: index,
    root: root,
    dataHash: dataHash,
    creatorHash: creatorHash,
    amount: amountLamports,
    proof: proofFields.proof,
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
