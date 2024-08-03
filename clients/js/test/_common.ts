import { address, generateKeyPairSigner } from '@solana/web3.js';
import {
  createDefaultSolanaClient,
  generateKeyPairSignerWithSol,
  ONE_SOL,
} from '@tensor-foundation/test-helpers';

export const TCOMP_FEE = address('q4s8z5dRAt2fKC2tLthBPatakZRXPMx1LfacckSXd4f');

export async function getTestSetup() {
  const client = createDefaultSolanaClient();

  // Generic payer.
  const payer = await generateKeyPairSignerWithSol(client, 5n * ONE_SOL);

  // Cosigner.
  const cosigner = await generateKeyPairSigner();

  // NFT Update Authority
  const nftUpdateAuthority = await generateKeyPairSignerWithSol(client);

  // NFT owner and seller.
  const nftOwner = await generateKeyPairSignerWithSol(client);

  // Buyer of the NFT.
  const buyer = await generateKeyPairSignerWithSol(client);

  const makerBroker = await generateKeyPairSignerWithSol(client);
  const takerBroker = await generateKeyPairSignerWithSol(client);

  return {
    client,
    nftOwner,
    nftUpdateAuthority,
    payer,
    buyer,
    cosigner,
    makerBroker,
    takerBroker,
  };
}
