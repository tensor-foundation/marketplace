import {
  createCollectionV1,
  createV1,
  fetchAssetV1,
  mplCore,
  pluginAuthorityPair,
  ruleSet,
} from "@metaplex-foundation/mpl-core";
import {
  Context,
  createSignerFromKeypair,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi as baseCreateUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  fromWeb3JsKeypair,
  fromWeb3JsPublicKey,
  toWeb3JsPublicKey,
} from "@metaplex-foundation/umi-web3js-adapters";
import { Keypair, PublicKey } from "@solana/web3.js";
import { createFundedWallet } from "./account";
import { TEST_CONN_PAYER } from "./shared";

export const createUmi = async () => {
  const umi = baseCreateUmi(TEST_CONN_PAYER.conn).use(mplCore());
  const keypair = fromWeb3JsKeypair(TEST_CONN_PAYER.payer);
  const signer = createSignerFromKeypair(umi, keypair);
  umi.identity = signer;
  umi.payer = signer;

  return umi;
};

export const createAssetWithCollection = async (
  context: Context,
  owner?: PublicKey,
  collection?: PublicKey,
  basisPoints: number = 0,
  creators: number = 1
): Promise<{
  asset: PublicKey;
  collection: PublicKey;
  name: string;
}> => {
  if (!collection) {
    const address = Keypair.generate();
    const creatorsKeypair: Keypair[] = [];
    const share = Math.trunc(100 / creators);

    for (let i = 0; i < creators; i++) {
      creatorsKeypair.push(await createFundedWallet(10));
    }

    await createCollectionV1(context, {
      payer: createSignerFromKeypair(
        context,
        fromWeb3JsKeypair(TEST_CONN_PAYER.payer)
      ),
      collection: createSignerFromKeypair(context, fromWeb3JsKeypair(address)),
      updateAuthority: fromWeb3JsPublicKey(TEST_CONN_PAYER.payer.publicKey),
      name: "Test Collection",
      uri: "https://test.com",
      plugins: [
        pluginAuthorityPair({
          type: "Royalties",
          data: {
            basisPoints,
            creators: creatorsKeypair.map((c) => {
              return {
                address: fromWeb3JsKeypair(c).publicKey,
                percentage: share,
              };
            }),
            ruleSet: ruleSet("None"),
          },
        }),
      ],
    }).sendAndConfirm(context);

    collection = address.publicKey;
  }

  const asset = Keypair.generate();

  await createV1(context, {
    asset: createSignerFromKeypair(context, fromWeb3JsKeypair(asset)),
    collection: publicKey(collection),
    owner: owner ? publicKey(owner) : context.identity.publicKey,
    name: "Test Asset",
    uri: "https://test.com",
  }).sendAndConfirm(context);

  return {
    asset: asset.publicKey,
    collection,
    name: "Test Asset",
  };
};

export const getOwner = async (context: Context, address: PublicKey) => {
  const asset = await fetchAssetV1(context, fromWeb3JsPublicKey(address));
  return toWeb3JsPublicKey(asset.owner);
};
