import type { EditInput } from "@tensor-foundation/marketplace";
import {
  getEditInstruction,
  findListStatePda,
} from "@tensor-foundation/marketplace";
import { KeyPairSigner, createKeyPairSignerFromBytes, address } from "@solana/web3.js";
import { rpc, keypairBytes } from "./common";
import { simulateTxWithIxs } from "@tensor-foundation/common-helpers";

// edits listing price of mint to amountLamports ( 1 sol == 1_000_000_000 lamports )
async function editListing(mint: string, amountLamports: number) {
  const keypairSigner: KeyPairSigner = await createKeyPairSignerFromBytes(
    Buffer.from(keypairBytes),
    false,
  );

  // retrieve list state and related input fields
  const [listStatePda] = await findListStatePda({
    mint: address(mint),
  });

  // build edit input accounts incl. data args
  const editInput: EditInput = {
    listState: listStatePda,
    owner: keypairSigner,
    amount: amountLamports,
  };

  // retrieve list instruction
  const editIx = getEditInstruction(editInput);
  await simulateTxWithIxs(rpc, [editIx], keypairSigner);
}
editListing(
  "511edGtZmyp7K5nHwPxum5hEL2ZxpYzQbGWgGq6s6XCC",
  0.5 * 1_000_000_000,
);
