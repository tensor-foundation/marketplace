const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "idls");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..", "programs");

generateIdl({
  generator: "anchor",
  programName: "marketplace_program",
  programId: "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "marketplace"),
});
