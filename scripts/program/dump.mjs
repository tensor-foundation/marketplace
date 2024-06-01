#!/usr/bin/env zx
import "zx/globals";
import {
  getExternalAccountAddresses,
  getExternalProgramAddresses,
  getExternalProgramOutputDir,
} from "../utils.mjs";

// Get input from environment variables.
const rpc = process.env.RPC ?? "https://api.mainnet-beta.solana.com";
const outputDir = getExternalProgramOutputDir();
await dump();

/** Dump external programs binaries if needed. */
async function dump() {
  // Ensure we have some external programs/accounts to dump.
  const programs = getExternalProgramAddresses();
  const accounts = getExternalAccountAddresses();
  const addresses = [
    ...programs.map((program) => `${program}.so`),
    ...accounts.map((account) => `${account}.json`),
  ].flat();

  if (addresses.length === 0) return;
  echo(`Dumping external accounts to '${outputDir}':`);

  // Create the output directory if needed.
  $`mkdir -p ${outputDir}`.quiet();

  // Copy the binaries from the chain or warn if they are different.
  await Promise.all(
    addresses.map(async (binary) => {
      const address = binary.split(".")[0];
      const hasBinary = await fs.exists(`${outputDir}/${binary}`);

      if (!hasBinary) {
        await copyFromChain(address, binary);
        echo(`Wrote account data to ${outputDir}/${binary}`);
        return;
      }

      let sha = "sha256sum";
      let options = [];
      let hasShaChecksum = await which("sha256sum", { nothrow: true });

      // We might not have sha256sum on some systems, so we try shasum as well.
      if (!hasShaChecksum) {
        hasShaChecksum = await which("shasum", { nothrow: true });

        if (hasShaChecksum) {
          sha = "shasum";
          options = ["-a", "256"];
        }
      }

      if (hasShaChecksum) {
        await copyFromChain(address, `onchain-${binary}`);
        const [onChainHash, localHash] = await Promise.all([
          $`${sha} ${options} -b ${outputDir}/onchain-${binary} | cut -d ' ' -f 1`.quiet(),
          $`${sha} ${options} -b ${outputDir}/${binary} | cut -d ' ' -f 1`.quiet(),
        ]);

        if (onChainHash.toString() !== localHash.toString()) {
          echo(
            chalk.yellow("[ WARNING ]"),
            `on-chain and local binaries are different for '${binary}'`
          );
        } else {
          echo(
            chalk.green("[ SKIPPED ]"),
            `on-chain and local binaries are the same for '${binary}'`
          );
        }

        await $`rm ${outputDir}/onchain-${binary}`.quiet();
      } else {
        echo(
          chalk.yellow("[ WARNING ]"),
          `skipped check for '${binary}' (missing 'sha256sum' command)`
        );
      }
    })
  );
}

/** Helper function to copy external programs or accounts binaries from the chain. */
async function copyFromChain(address, binary) {
  switch (binary.split(".").pop()) {
    case "json":
      return $`solana account -u ${rpc} ${address} -o ${outputDir}/${binary} --output json >/dev/null`.quiet();
    case "so":
      return $`solana program dump -u ${rpc} ${address} ${outputDir}/${binary} >/dev/null`.quiet();
    default:
      echo(chalk.red(`[  ERROR  ] unknown account type for '${binary}'`));
      await $`exit 1`;
  }
}
