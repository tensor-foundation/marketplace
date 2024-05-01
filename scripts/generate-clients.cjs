const path = require("path");
const k = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "programs", "marketplace");

// Instanciate Kinobi.
const kinobi = k.createFromIdls([path.join(idlDir, "idl.json")]);

// Additional visitors for instrunctions.
const legacyInstructions = require("./kinobi/legacy-instructions.cjs");
const token22Instructions = require("./kinobi/token22-instructions.cjs");
const wnsInstructions = require("./kinobi/wns-instructions.cjs");

// Update programs.
kinobi.update(
  new k.updateProgramsVisitor({
    marketplaceProgram: { name: "tensorMarketplace" },
  })
);

// Add missing types from the IDL.
kinobi.update(
  k.bottomUpTransformerVisitor([
    {
      select: "[programNode]tensorMarketplace",
      transform: (node) => {
        k.assertIsNode(node, "programNode");
        return {
          ...node,
          pdas: [k.pdaNode("feeVault", [])],
        };
      },
    },
  ])
);

// Set default account values accross multiple instructions.
kinobi.update(
  k.setInstructionAccountDefaultValuesVisitor([
    // default accounts
    {
      account: "feeVault",
      ignoreIfOptional: true,
      defaultValue: k.pdaValueNode("feeVault"),
    },
    // default programs
    {
      account: "tokenProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "tokenProgram"
      ),
    },
    {
      account: "associatedTokenProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
        "associatedTokenProgram"
      ),
    },
    {
      account: "marketplaceProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
        "marketplaceProgram"
      ),
    },
    {
      account: "systemProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "11111111111111111111111111111111",
        "systemProgram"
      ),
    },
    {
      account: "tokenMetadataProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
        "tokenMetadataProgram"
      ),
    },
    {
      account: "authorizationRulesProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg",
        "authorizationRulesProgram"
      ),
    },
    {
      account: "sysvarInstructions",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "Sysvar1111111111111111111111111111111111111",
        "sysvarInstructions"
      ),
    },
    {
      account: "wnsProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM",
        "wnsProgram"
      ),
    },
    {
      account: "wnsDistributionProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay",
        "wnsDistributionProgram"
      ),
    },
  ])
);

// Update accounts.
kinobi.update(
  k.updateAccountsVisitor({
    listState: {
      seeds: [
        k.constantPdaSeedNodeFromString("list_state"),
        k.variablePdaSeedNode("mint", k.publicKeyTypeNode()),
      ],
    },
  })
);

// Update instructions using additional visitors.
kinobi.update(legacyInstructions());
kinobi.update(token22Instructions());
kinobi.update(wnsInstructions());

// Set more struct default values dynamically.
kinobi.update(
  k.bottomUpTransformerVisitor([
    {
      select: (node) => {
        const names = [
          "expireInSec",
          "currency",
          "privateTaker",
          "makerBroker",
          "authorizationData",
          "optionalRoyaltyPct",
        ];
        return (
          k.isNode(node, ["instructionNode", "instructionArgumentNode"]) &&
          k.isNode(node.type, "optionTypeNode") &&
          names.includes(node.name)
        );
      },
      transform: (node) => {
        k.assertIsNode(node, ["instructionNode", "instructionArgumentNode"]);
        return {
          ...node,
          defaultValueStrategy: "optional",
          defaultValue: k.noneValueNode(),
        };
      },
    },
  ])
);

// Render JavaScript.
const jsDir = path.join(clientDir, "js", "src", "generated");
const prettier = require(path.join(clientDir, "js", ".prettierrc.json"));
kinobi.accept(
  k.renderJavaScriptExperimentalVisitor(jsDir, {
    prettier,
    asyncResolvers: [
      "resolveBuyerAta",
      "resolveListAta",
      "resolveOwnerAta",
      "resolveMetadata",
      "resolveEditionFromTokenStandard",
      "resolveOwnerTokenRecordFromTokenStandard",
      "resolveBuyerTokenRecordFromTokenStandard",
      "resolveListTokenRecordFromTokenStandard",
      "resolveWnsApprovePda",
      "resolveWnsDistributionPda",
      "resolveWnsExtraAccountMetasPda",
    ],
  })
);

// Render Rust.
const crateDir = path.join(clientDir, "rust");
const rustDir = path.join(clientDir, "rust", "src", "generated");
kinobi.accept(
  k.renderRustVisitor(rustDir, {
    formatCode: true,
    crateFolder: crateDir,
  })
);
