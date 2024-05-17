const path = require("path");
const k = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "programs", "marketplace");

// Instanciate Kinobi.
const kinobi = k.createFromIdls([path.join(idlDir, "idl.json")]);

// Additional visitors for instrunctions.
const legacyInstructions = require("./kinobi/legacy-instructions.cjs");
const compressedInstructions = require("./kinobi/compressed-instructions.cjs");
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
    // TODO: set default value for newly added feeVault acc
    {
      account: "treeAuthority",
      ignoreIfOptional: true,
      defaultValue: k.resolverValueNode("resolveTreeAuthorityPda", {
        dependsOn: [
          k.accountValueNode("merkleTree"),
          k.accountValueNode("bubblegumProgram")
        ],
      }),
    },
    // default programs
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
      account: "tensorswapProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
        "tensorswapProgram"
      )
    },
    // Legacy
    {
      account: "tokenMetadataProgram",
      defaultValue: k.resolverValueNode(
        "resolveTokenMetadataProgramFromTokenStandard",
        {
          importFrom: "resolvers",
          dependsOn: [k.argumentValueNode("tokenStandard")],
        }
      ),
    },
    {
      account: "authorizationRulesProgram",
      defaultValue: k.resolverValueNode(
        "resolveAuthorizationRulesProgramFromTokenStandard",
        {
          importFrom: "resolvers",
          dependsOn: [k.argumentValueNode("tokenStandard")],
        }
      ),
    },
    {
      account: "sysvarInstructions",
      defaultValue: k.resolverValueNode(
        "resolveSysvarInstructionsFromTokenStandard",
        {
          importFrom: "resolvers",
          dependsOn: [k.argumentValueNode("tokenStandard")],
        }
      ),
    },
    // WNS
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
    // Compressed
    {
      account: "logWrapper",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
        "logWrapper"
      ),
    },
    {
      account: "compressionProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK",
        "compressionProgram"
      ),
    },
    {
      account: "bubblegumProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
        "bubblegumProgram"
      ),
    },
    {
      account: "tcompProgram",
      ignoreIfOptional: true,
      defaultValue: k.programIdValueNode(),
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
kinobi.update(compressedInstructions());
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
        // prevents overriding existing default values (e.g. optionalRoyaltyPct for cNFTs)
        if(!!node.defaultValue) return node;
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
      "resolveBidStateFromBidId",
      "resolveFeeVaultPdaFromListState",
      "resolveFeeVaultPdaFromBidState",
      "resolveBuyerAta",
      "resolveListAta",
      "resolveOwnerAta",
      "resolveSellerAta",
      "resolveBidAta",
      "resolveBuyerTokenRecordFromTokenStandard",
      "resolveListTokenRecordFromTokenStandard",
      "resolveOwnerTokenRecordFromTokenStandard",
      "resolveSellerTokenRecordFromTokenStandard",
      "resolveBidTokenRecordFromTokenStandard",
      "resolveMetadata",
      "resolveEditionFromTokenStandard",
      "resolveWnsApprovePda",
      "resolveWnsDistributionPda",
      "resolveWnsExtraAccountMetasPda",
      "resolveTreeAuthorityPda"
    ],
    dependencyMap: {
      resolvers: "@tensor-foundation/resolvers",
    },
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
