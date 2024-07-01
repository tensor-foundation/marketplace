/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createDefaultSolanaClient,
  generateKeyPairSignerWithSol,
} from '@tensor-foundation/test-helpers';
import test from 'ava';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
test('it can buy an NFT', async (t) => {
  const client = createDefaultSolanaClient();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const owner = await generateKeyPairSignerWithSol(client);

  // Create a core asset.
  // eslint-disable-next-line prefer-const
  const createIx = getCreateV2Instruction

  // List asset.

  // Buyer purchases the asset.
});
