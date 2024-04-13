const path = require("path");
const { generateIdl } = require("@metaplex-foundation/shank-js");

const idlDir = path.join(__dirname, "..", "programs");
const binaryInstallDir = path.join(__dirname, "..", ".crates");
const programDir = path.join(__dirname, "..", "programs");

generateIdl({
  generator: "anchor",
  programName: "marketplace_program",
  programId: "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
  idlDir: path.join(idlDir, "marketplace"),
  idlName: "idl",
  binaryInstallDir,
  programDir: path.join(programDir, "marketplace"),
});

generateIdl({
  generator: "anchor",
  programName: "cpi_test",
  programId: "5zABSn1WYLHYenFtTFcM5AHdJjnHkx6S85rkWkFzLExq",
  idlDir: path.join(idlDir, "cpi-test"),
  idlName: "idl",
  binaryInstallDir,
  programDir: path.join(programDir, "cpi-test"),
});
