import { keccak_256 } from '@noble/hashes/sha3';
import {
  Address,
  generateKeyPairSigner,
  getAddressEncoder,
} from '@solana/web3.js';
import { fromAddress } from '@tensor-foundation/test-helpers';
import { MerkleTree } from 'merkletreejs';

/**
 * Describes the required data input for
 * handling Merkle Tree operations.
 */
type MerkleTreeInput = Uint8Array | string;

/**
 * Creates a Merkle Tree from the provided data.
 */
export const getMerkleTree = (data: MerkleTreeInput[]): MerkleTree =>
  new MerkleTree(data.map(keccak_256), keccak_256, {
    sortPairs: true,
  });

/**
 * Creates a Merkle Root from the provided data.
 *
 * This root provides a short identifier for the
 * provided data that is unique and deterministic.
 * This means, we can use this root to verify that
 * a given data is part of the original data set.
 */
export const getMerkleRoot = (data: MerkleTreeInput[]): Uint8Array =>
  getMerkleTree(data).getRoot();

/**
 * Creates a Merkle Proof for a given data item.
 *
 * This proof can be used to verify that the given
 * data item is part of the original data set.
 */
export const getMerkleProof = (
  data: MerkleTreeInput[],
  leaf: MerkleTreeInput,
  index?: number
): Uint8Array[] =>
  getMerkleTree(data)
    .getProof(Buffer.from(keccak_256(leaf)), index)
    .map((proofItem) => proofItem.data);

/**
 * Creates a Merkle Proof for a data item at a given index.
 *
 * This proof can be used to verify that the data item at
 * the given index is part of the original data set.
 */
export const getMerkleProofAtIndex = (
  data: MerkleTreeInput[],
  index: number
): Uint8Array[] => getMerkleProof(data, data[index], index);

/**
 * Generates a Merkle Tree of a given size with the target mints included as leaves.
 */
export const generateTreeOfSize = async (
  size: number,
  targetMints: Address[]
) => {
  const encoder = getAddressEncoder();

  const leaves = targetMints.map((mint) => encoder.encode(mint));
  const promises = Array(size).fill(generateKeyPairSigner());
  const signers = await Promise.all(promises);
  signers.map((signer) => {
    leaves.push(encoder.encode(signer.address));
    return signer;
  });

  const tree = getMerkleTree(leaves as Uint8Array[]);

  const proofs: { mint: Address; proof: Uint8Array[] }[] = targetMints.map(
    (targetMint) => {
      const leaf = keccak_256(fromAddress(targetMint) as Uint8Array);
      const proof = tree.getProof(Buffer.from(leaf)); // Convert Uint8Array to Buffer
      const validProof: Uint8Array[] = proof.map((p) =>
        Uint8Array.from(p.data)
      );
      return { mint: targetMint, proof: validProof };
    }
  );

  return { tree, root: tree.getRoot().toJSON().data, proofs };
};
