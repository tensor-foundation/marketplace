#!/usr/bin/env zx
import "zx/globals";
import { workingDirectory, getProgramFolders } from "../utils.mjs";

const fetchFromArtifacts = argv._.filter(a => a !== path.basename(__filename))[0] === "artifacts";

// Save external programs binaries to the output directory.
import "./dump_mainnet.mjs";

if(fetchFromArtifacts) await import("../fetch-external-binaries.mjs"); 
else await import("./dump_devnet.mjs");

// Build the programs.
for (const folder of getProgramFolders()) {
  cd(`${path.join(workingDirectory, folder)}`);
  await $`cargo-build-sbf ${process.argv.slice(3)}`;
}