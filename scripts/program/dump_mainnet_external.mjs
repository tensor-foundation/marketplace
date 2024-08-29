#!/usr/bin/env zx
import "zx/globals";
import {
  getExternalAccountAddresses,
  getExternalProgramAddresses,
  getExternalProgramOutputDir,
} from "../utils.mjs";
import { dump } from "./dump.mjs";

// Get input from environment variables.
const rpc = process.env.RPC ?? "https://api.mainnet-beta.solana.com";
const outputDir = getExternalProgramOutputDir();
// Ensure we have some external programs/accounts to dump.
const programs = getExternalProgramAddresses();
const accounts = getExternalAccountAddresses();
const addresses = [
  ...programs.map((program) => `${program}.so`),
  ...accounts.map((account) => `${account}.json`),
].flat();

echo(`Dumping external accounts to '${outputDir}':`);
await dump(rpc, outputDir, addresses);