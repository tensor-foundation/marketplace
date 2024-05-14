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

// Set default account values accross multiple instructions.
kinobi.update(
  k.setInstructionAccountDefaultValuesVisitor([
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
      account: "escrowProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
        "escrowProgram"
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
      defaultValue: k.conditionalValueNode({
        condition: k.argumentValueNode("tokenStandard"),
        value: k.enumValueNode(
          k.definedTypeLinkNode("TokenStandard", "hooked"),
          "ProgrammableNonFungible"
        ),
        ifTrue: k.publicKeyValueNode(
          "Sysvar1nstructions1111111111111111111111111",
          "sysvarInstructions"
        ),
      }),
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
    bidState: {
      seeds: [
        k.constantPdaSeedNodeFromString("bid_state"),
        k.variablePdaSeedNode("owner", k.publicKeyTypeNode()),
        k.variablePdaSeedNode("bidId", k.publicKeyTypeNode()),
      ],
    },
  })
);

// Update instructions.
kinobi.update(
  k.updateInstructionsVisitor({
    bid: {
      accounts: {
        rentPayer: {
          defaultValue: k.accountValueNode("owner"),
        },
        sharedEscrow: {
          defaultValue: k.accountValueNode("owner"),
        },
        bidState: {
          defaultValue: k.pdaValueNode("bidState", [
            k.pdaSeedValueNode("bidId", k.argumentValueNode("bidId")),
          ]),
        },
      },
      arguments: {
        bidId: {
          defaultValue: k.argumentValueNode("targetId"),
        },
      },
    },
    cancelBid: {
      accounts: {
        rentDestination: {
          defaultValue: k.accountValueNode("owner"),
        },
        bidState: {
          defaultValue: k.pdaValueNode("bidState", [
            k.pdaSeedValueNode("bidId", k.argumentValueNode("bidId")),
          ]),
        },
      },
      arguments: {
        bidId: {
          type: k.publicKeyTypeNode(),
          defaultValue: k.publicKeyValueNode(
            "11111111111111111111111111111111"
          ),
        },
      },
    },
    closeExpiredBid: {
      accounts: {
        rentDestination: {
          defaultValue: k.accountValueNode("owner"),
        },
        bidState: {
          defaultValue: k.pdaValueNode("bidState", [
            k.pdaSeedValueNode("bidId", k.argumentValueNode("bidId")),
          ]),
        },
      },
      arguments: {
        bidId: {
          type: k.publicKeyTypeNode(),
          defaultValue: k.publicKeyValueNode(
            "11111111111111111111111111111111"
          ),
        },
      },
    },
  })
);

// Update instructions using additional visitors.
kinobi.update(legacyInstructions());
kinobi.update(token22Instructions());
kinobi.update(wnsInstructions());

// Set struct default values.
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
          "field",
          "fieldId",
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
    {
      select: "[structFieldTypeNode|instructionArgumentNode]quantity",
      transform: (node) => {
        k.assertIsNode(node, [
          "structFieldTypeNode",
          "instructionArgumentNode",
        ]);
        return {
          ...node,
          defaultValue: k.numberValueNode(1),
        };
      },
    },
    {
      select: "[structFieldTypeNode|instructionArgumentNode]rulesAccPresent",
      transform: (node) => {
        k.assertIsNode(node, [
          "structFieldTypeNode",
          "instructionArgumentNode",
        ]);
        return {
          ...node,
          defaultValue: k.booleanValueNode(false),
        };
      },
    },
  ])
);

// Add missing types from the IDL.
kinobi.update(
  k.bottomUpTransformerVisitor([
    {
      select: "[structTypeNode].[structFieldTypeNode]rentPayer",
      transform: (node) => {
        k.assertIsNode(node, "structFieldTypeNode");
        return {
          ...node,
          type: k.definedTypeLinkNode("nullableAddress", "hooked"),
        };
      },
    },
    {
      select: "[structTypeNode].[structFieldTypeNode]cosigner",
      transform: (node) => {
        k.assertIsNode(node, "structFieldTypeNode");
        return {
          ...node,
          type: k.definedTypeLinkNode("nullableAddress", "hooked"),
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
      "resolveBidStateFromBidId",
      "resolveSellerTokenRecordFromTokenStandard",
      "resolveEscrowTokenRecordFromTokenStandard",
      "resolveSellerAta",
      "resolveEscrowAta",
      "resolveFeeVaultPdaFromListState",
      "resolveFeeVaultPdaFromBidState",
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
