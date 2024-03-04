const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "program", "idl");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..");

generateIdl({
  generator: "anchor",
  programName: "marketplace_program",
  programId: "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
  idlDir,
  binaryInstallDir,
  programDir: path.join(programDir, "program"),
});
