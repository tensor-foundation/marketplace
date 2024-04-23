const path = require("path");
const k = require("@metaplex-foundation/kinobi");

// Paths.
const clientDir = path.join(__dirname, "..", "clients");
const idlDir = path.join(__dirname, "..", "programs", "marketplace");

// Instanciate Kinobi.
const kinobi = k.createFromIdls([path.join(idlDir, "idl.json")]);

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
          pdas: [
            k.pdaNode("listToken", [
              k.constantPdaSeedNodeFromString("list_token"),
              k.variablePdaSeedNode("mint", k.publicKeyTypeNode()),
            ]),
            k.pdaNode("feeVault", []),
          ],
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
      account: "authoritzationRulesProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg",
        "authoritzationRulesProgram"
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

//---------------------------------------------------------------------------//
// Update instructions for legacy NFTs                                       //
//---------------------------------------------------------------------------//
kinobi.update(
  k.updateInstructionsVisitor({
    buyLegacy: {
      accounts: {
        buyer: {
          defaultValue: k.accountValueNode("payer"),
        },
        rentDestination: {
          defaultValue: k.accountValueNode("owner"),
        },
        buyerToken: {
          defaultValue: k.resolverValueNode("resolveBuyerToken", {
            dependsOn: [
              k.accountValueNode("buyer"),
              k.accountValueNode("tokenProgram"),
              k.accountValueNode("mint"),
            ],
          }),
        },
        listToken: { defaultValue: k.pdaValueNode("listToken") },
        listState: { defaultValue: k.pdaValueNode("listState") },
        metadata: {
          defaultValue: k.resolverValueNode("resolveMetadata", {
            dependsOn: [k.accountValueNode("mint")],
          }),
        },
        edition: {
          defaultValue: k.resolverValueNode("resolveEditionFromTokenStandard", {
            dependsOn: [
              k.accountValueNode("mint"),
              k.argumentValueNode("tokenStandard"),
            ],
          }),
        },
        buyerTokenRecord: {
          defaultValue: k.resolverValueNode(
            "resolveBuyerTokenRecordFromTokenStandard",
            {
              dependsOn: [
                k.accountValueNode("mint"),
                k.accountValueNode("buyerToken"),
                k.argumentValueNode("tokenStandard"),
              ],
            }
          ),
        },
        listTokenRecord: {
          defaultValue: k.resolverValueNode(
            "resolveListTokenRecordFromTokenStandard",
            {
              dependsOn: [
                k.accountValueNode("mint"),
                k.accountValueNode("listToken"),
                k.argumentValueNode("tokenStandard"),
              ],
            }
          ),
        },
        authorizationRulesProgram: {
          defaultValue: k.conditionalValueNode({
            condition: k.accountValueNode("authorizationRules"),
            ifTrue: k.publicKeyValueNode(
              "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg",
              "mplTokenAuthRules"
            ),
          }),
        },
      },
      remainingAccounts: [
        k.instructionRemainingAccountsNode(k.argumentValueNode("creators"), {
          isWritable: true,
          isOptional: true,
        }),
      ],
      arguments: {
        tokenStandard: {
          type: k.definedTypeLinkNode("TokenStandard", "hooked"),
          defaultValue: k.enumValueNode(
            k.definedTypeLinkNode("TokenStandard", "hooked"),
            "NonFungible"
          ),
        },
      },
    },
    delistLegacy: {
      accounts: {
        rentDestination: {
          defaultValue: k.accountValueNode("owner"),
        },
        ownerToken: {
          defaultValue: k.resolverValueNode("resolveOwnerToken", {
            dependsOn: [
              k.accountValueNode("owner"),
              k.accountValueNode("tokenProgram"),
              k.accountValueNode("mint"),
            ],
          }),
        },
        listToken: { defaultValue: k.pdaValueNode("listToken") },
        listState: { defaultValue: k.pdaValueNode("listState") },
        metadata: {
          defaultValue: k.resolverValueNode("resolveMetadata", {
            dependsOn: [k.accountValueNode("mint")],
          }),
        },
        edition: {
          defaultValue: k.resolverValueNode("resolveEditionFromTokenStandard", {
            dependsOn: [
              k.accountValueNode("mint"),
              k.argumentValueNode("tokenStandard"),
            ],
          }),
        },
        ownerTokenRecord: {
          defaultValue: k.resolverValueNode(
            "resolveOwnerTokenRecordFromTokenStandard",
            {
              dependsOn: [
                k.accountValueNode("mint"),
                k.accountValueNode("ownerToken"),
                k.argumentValueNode("tokenStandard"),
              ],
            }
          ),
        },
        listTokenRecord: {
          defaultValue: k.resolverValueNode(
            "resolveListTokenRecordFromTokenStandard",
            {
              dependsOn: [
                k.accountValueNode("mint"),
                k.accountValueNode("listToken"),
                k.argumentValueNode("tokenStandard"),
              ],
            }
          ),
        },
        authorizationRulesProgram: {
          defaultValue: k.conditionalValueNode({
            condition: k.accountValueNode("authorizationRules"),
            ifTrue: k.publicKeyValueNode(
              "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg",
              "mplTokenAuthRules"
            ),
          }),
        },
      },
      arguments: {
        tokenStandard: {
          type: k.definedTypeLinkNode("TokenStandard", "hooked"),
          defaultValue: k.enumValueNode(
            k.definedTypeLinkNode("TokenStandard", "hooked"),
            "NonFungible"
          ),
        },
      },
    },
    listLegacy: {
      accounts: {
        payer: {
          defaultValue: k.accountValueNode("owner"),
        },
        ownerToken: {
          defaultValue: k.resolverValueNode("resolveOwnerToken", {
            dependsOn: [
              k.accountValueNode("owner"),
              k.accountValueNode("tokenProgram"),
              k.accountValueNode("mint"),
            ],
          }),
        },
        listToken: { defaultValue: k.pdaValueNode("listToken") },
        listState: { defaultValue: k.pdaValueNode("listState") },
        metadata: {
          defaultValue: k.resolverValueNode("resolveMetadata", {
            dependsOn: [k.accountValueNode("mint")],
          }),
        },
        edition: {
          defaultValue: k.resolverValueNode("resolveEditionFromTokenStandard", {
            dependsOn: [
              k.accountValueNode("mint"),
              k.argumentValueNode("tokenStandard"),
            ],
          }),
        },
        ownerTokenRecord: {
          defaultValue: k.resolverValueNode(
            "resolveOwnerTokenRecordFromTokenStandard",
            {
              dependsOn: [
                k.accountValueNode("mint"),
                k.accountValueNode("ownerToken"),
                k.argumentValueNode("tokenStandard"),
              ],
            }
          ),
        },
        listTokenRecord: {
          defaultValue: k.resolverValueNode(
            "resolveListTokenRecordFromTokenStandard",
            {
              dependsOn: [
                k.accountValueNode("mint"),
                k.accountValueNode("listToken"),
                k.argumentValueNode("tokenStandard"),
              ],
            }
          ),
        },
        authorizationRulesProgram: {
          defaultValue: k.conditionalValueNode({
            condition: k.accountValueNode("authorizationRules"),
            ifTrue: k.publicKeyValueNode(
              "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg",
              "mplTokenAuthRules"
            ),
          }),
        },
      },
      arguments: {
        tokenStandard: {
          type: k.definedTypeLinkNode("TokenStandard", "hooked"),
          defaultValue: k.enumValueNode(
            k.definedTypeLinkNode("TokenStandard", "hooked"),
            "NonFungible"
          ),
        },
      },
    },
  })
);

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
      "resolveOwnerToken",
      "resolveBuyerToken",
      "resolveMetadata",
      "resolveEditionFromTokenStandard",
      "resolveOwnerTokenRecordFromTokenStandard",
      "resolveBuyerTokenRecordFromTokenStandard",
      "resolveListTokenRecordFromTokenStandard",
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
