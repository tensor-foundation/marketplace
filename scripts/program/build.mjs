#!/usr/bin/env zx
import "zx/globals";
import { workingDirectory, getProgramFolders } from "../utils.mjs";

// Save external programs binaries to the output directory.
import "./dump.mjs";

// Build the programs.
for (const folder of getProgramFolders()) {
  await $`cd ${path.join(workingDirectory, folder)} && cargo-build-sbf ${process.argv.slice(3)}`;
}
