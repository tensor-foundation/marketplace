import { TENSOR_MARKETPLACE_PROGRAM_ADDRESS, decodeBidState } from "@tensor-foundation/marketplace";
import { parseBase64RpcAccount } from "@solana/web3.js";
import { rpc } from "./common";

// retrieves all collection bids and all trait bids for a given collection (specified by its whitelist)
export async function getAllBidsByCollection(whitelist: string) {
  // get all BidState accounts (via dataSize) that match the given whitelist 
  // (targetId field should match whitelist account address)
  return await rpc.getProgramAccounts(TENSOR_MARKETPLACE_PROGRAM_ADDRESS, 
    {
      encoding: "base64",
      filters: [
        {
          dataSize: 426n
        },
        { 
          //@ts-ignore: web3.js-next typing inaccuracy?
            memcmp: {
            bytes: whitelist,
            encoding: "base58",
            offset: 75n
         }
        }
      ]
  })
  .send()
  // parse and decode all received BidState accounts
  .then(resp => {
    //@ts-ignore: web3.js-next typing inaccuracy?
    return resp.map(acc => {
      const parsedAcc = parseBase64RpcAccount(acc.pubkey, acc.account);
      return decodeBidState(parsedAcc);
    })
  })
}