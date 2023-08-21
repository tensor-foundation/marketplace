// pNFTs very expensive.
export const DEFAULT_COMPUTE_UNITS = 800_000;
export const DEFAULT_MICRO_LAMPORTS = 200_000;
export const DEFAULT_RULESET_ADDN_COMPUTE_UNITS = 400_000;

export type AccountSuffix =
  | "Bid State"
  | "List State"
  | "Owner"
  | "Buyer"
  | "Seller"
  | "Delegate"
  | "Payer"
  | "Margin Account"
  | "Taker Broker"
  | "Maker Broker"
  | "Whitelist";

export const parseStrFn = (str: string) => {
  return Function(`'use strict'; return (${str})`)();
};
