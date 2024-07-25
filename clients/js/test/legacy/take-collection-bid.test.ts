import { appendTransactionMessageInstruction, assertAccountDecoded, fetchEncodedAccount, fetchJsonParsedAccount, generateKeyPairSigner, pipe } from '@solana/web3.js';
import {
    createDefaultSolanaClient,
    createDefaultTransaction,
    generateKeyPairSignerWithSol,
    signAndSendTransaction,
} from '@tensor-foundation/test-helpers';
import test from 'ava';
import {
    Target,
    findBidStatePda,
    getBidInstructionAsync,
    getTakeBidLegacyInstructionAsync,
} from '../../src/index.js';
import { createWhitelistV2 } from './_common.js';
import { Mode } from '@tensor-foundation/whitelist';
import { createDefaultNft, findAtaPda } from '@tensor-foundation/mpl-token-metadata';

test('it can take a bid on a legacy collection', async (t) => {
    const client = createDefaultSolanaClient();
    const bidOwner = await generateKeyPairSignerWithSol(client);
    const seller = await generateKeyPairSignerWithSol(client);
    const creatorKeypair = await generateKeyPairSignerWithSol(client);

    // We create an NFT.
    const { mint } = await createDefaultNft({ client, payer: seller, authority: creatorKeypair, owner: seller });

    // Create whitelist
    const { whitelist } = await createWhitelistV2({
        client,
        updateAuthority: creatorKeypair,
        conditions: [{ mode: Mode.FVC, value: creatorKeypair.address }],
    });

    const price = 500_000_000n;

    // Create collection bid
    const bidId = (await generateKeyPairSigner()).address;
    const bidIx = await getBidInstructionAsync({
        owner: bidOwner,
        amount: price,
        target: Target.Whitelist,
        targetId: whitelist,
        bidId: bidId,
    });
    await pipe(
        await createDefaultTransaction(client, bidOwner),
        (tx) => appendTransactionMessageInstruction(bidIx, tx),
        (tx) => signAndSendTransaction(client, tx)
    );

    const [bidState] = await findBidStatePda({
        owner: bidOwner.address,
        bidId,
    })
    const preSellerBalance = (
        await client.rpc.getBalance(seller.address).send()
      ).value;

    // When the seller takes the bid.
    const takeBidIx = await getTakeBidLegacyInstructionAsync({
        owner: bidOwner.address,
        seller,
        whitelist,
        mint,
        minAmount: price,
        bidState,
        creators: [creatorKeypair.address],
    });

    await pipe(
        await createDefaultTransaction(client, seller),
        (tx) => appendTransactionMessageInstruction(takeBidIx, tx),
        (tx) => signAndSendTransaction(client, tx)
    );

    // Then the bid state should not exist.
    t.false(
        (
            await fetchEncodedAccount(
                client.rpc,
                (await findBidStatePda({ owner: bidOwner.address, bidId, }))[0]
            )
        ).exists
    );

    // And the owner has the NFT.
    const ownerToken = await fetchJsonParsedAccount(
        client.rpc,
        (await findAtaPda({ mint, owner: bidOwner.address }))[0]
    );
    assertAccountDecoded(ownerToken);

    t.like(ownerToken, {
        data: {
            tokenAmount: { amount: '1' },
        },
    });

    // And the seller received the price minus fees (taker fees, tx fees, account rent) 
    const postSellerBalance = (
        await client.rpc.getBalance(seller.address).send()
      ).value;
    // tx fees + account rent buffer === 3.5m lamports
    t.assert(postSellerBalance >= preSellerBalance + BigInt(Number(price) * 0.98) - 3_500_000n);
});
