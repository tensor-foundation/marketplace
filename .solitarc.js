const path = require("path");
const programDir = path.join(__dirname, "programs", "tcomp");
const idlDir = path.join(__dirname, "src", "tcomp", "idl");
const sdkDir = path.join(__dirname, "src", "generated");
const binaryInstallDir = path.join(__dirname, ".crates");

module.exports = {
  idlGenerator: "anchor",
  programName: "tcomp",
  programId: "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
  idlDir,
  sdkDir,
  binaryInstallDir,
  programDir,
};
