import {
  Creator,
  fetchAssetV1,
  fetchCollectionV1,
} from "@metaplex-foundation/mpl-core";
import { web3JsRpc } from "@metaplex-foundation/umi-rpc-web3js";
import { Connection, PublicKey } from "@solana/web3.js";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { createUmi } from "@metaplex-foundation/umi";

export const getCreators = async (
  connection: Connection,
  address: PublicKey,
  collection?: PublicKey | null
): Promise<Creator[]> => {
  const context = createUmi().use(web3JsRpc(connection));
  const asset = await fetchAssetV1(context, fromWeb3JsPublicKey(address));

  if (asset.royalties) {
    return asset.royalties.creators;
  }

  if (
    collection &&
    asset.updateAuthority.type === "Collection" &&
    asset.updateAuthority.address === fromWeb3JsPublicKey(collection)
  ) {
    const c = await fetchCollectionV1(context, asset.updateAuthority.address);
    if (c.royalties) {
      return c.royalties.creators;
    }
  }

  return [];
};
