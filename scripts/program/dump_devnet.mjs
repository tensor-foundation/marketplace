#!/usr/bin/env zx
import "zx/globals";
import {
  getExternalProgramOutputDir,
  getOffchainProgramAddresses
} from "../utils.mjs";
import { dump } from "./dump.mjs"

// Get input from environment variables.
const rpc = "https://api.devnet.solana.com";
const outputDir = getExternalProgramOutputDir();
// Ensure we have some external programs/accounts to dump.
const programs = getOffchainProgramAddresses();
const addresses = [
  ...programs.map((program) => `${program}.so`),
].flat();

echo(`Dumping external accounts from devnet to '${outputDir}':`);
await dump(rpc, outputDir, addresses);