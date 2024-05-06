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
// Rename Compressed Ixs (matches PLock Ixs + is more intuitive
// since the "default" standard definitely isn't compressed (yet)) 

kinobi.update(
  k.updateInstructionsVisitor({
    buy: {
      name: "buyCompressed"
    },
    closeExpiredBid: {
      name: "closeExpiredBidCompressed"
    },
    closeExpiredListing: {
      name: "closeExpiredListingCompressed"
    },
    delist: {
      name: "delistCompressed"
    },
    list: {
      name: "listCompressed"
    },
    takeBidFullMeta:{
      name: "takeBidCompressedFullMeta"
    },
    takeBidMetaHash: {
      name: "takeBidCompressedMetaHash"
    }
  })
)

// Rename owner => ownerAddress, rentPayer => owner
// to clarify that rentPayer has to be the signer
// and owner(ownerAddress) can be defaulted to
// the address of the rentPayer
kinobi.update(
  k.updateInstructionsVisitor({
    listCompressed: {
      accounts: {
        owner: {
          name: "ownerAddress"
        },
        rentPayer: {
          name: "owner"
        }
      }
    }
  })
)

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
      account: "tcomp",
      ignoreIfOptional: true,
      defaultValue: k.pdaValueNode("feeVault")
    },
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
    {
      account: "tensorswapProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
        "tensorswapProgram"
      )
    }
  ])
);

kinobi.update(
  k.bottomUpTransformerVisitor([
    // selects all instruction nodes if instructionNode.name
    // contains "Compressed" or "compressed" and adds proof/creators/canopyDepth
    // as extraArguments and adds to remainingAccounts via resolvers 
    // except: delistCompressed and listCompressed don't accept creators as input / remainingAccounts
    // 
    // lil bit hacky, TBD whether we want to keep it like this or specify
    // all ixs that need those remaining accounts explicitly (would be cleaner?)
    {
      select: "[instructionNode]",
      transform: (node) => {
        if(
          !'name' in node || 
          (!node.name.includes("Compressed") && !node.name.includes("compressed")) ||
          (node.name === "delistCompressed" || node.name === "listCompressed")
        ){
          return node;
        }
        k.assertIsNode(node, "instructionNode");
        return {
          ...node,
          extraArguments: [
            k.instructionArgumentNode({
              name: "creators",
              type: k.arrayTypeNode(k.tupleTypeNode([k.publicKeyTypeNode(), k.numberTypeNode('u16')])),
              docs: ["creators, structured like [ [creator_pubkey_1,creator_shares_1], ..., [creator_pubkey_n, creator_shares_n] ]"],
              defaultValue: k.arrayValueNode([]),
              defaultValueStrategy: 'optional'
            }),
            k.instructionArgumentNode({
              name: "proof",
              type: k.arrayTypeNode(k.publicKeyTypeNode()),
              docs: ["proof path, can be shortened if canopyDepth of merkle tree is also specified"],
              defaultValue: k.arrayValueNode([]),
              defaultValueStrategy: 'optional'
            }),
            k.instructionArgumentNode({
              name: "canopyDepth",
              type: k.numberTypeNode('u8'),
              docs: ["canopy depth of merkle tree, reduces proofPath length if specified"],
              defaultValue: k.numberValueNode(0),
              defaultValueStrategy: 'optional'
            })
          ],
          remainingAccounts: [
            k.instructionRemainingAccountsNode(k.resolverValueNode("resolveCreatorPath", {
              dependsOn: [
                k.argumentValueNode("creators"),
              ]
            }),
            {
              isOptional: true,
            }
          ),
            k.instructionRemainingAccountsNode(k.resolverValueNode("resolveProofPath", {
              dependsOn: [
                k.argumentValueNode("proof"),
                k.argumentValueNode("canopyDepth")
              ]
            }), 
            {
              isOptional: true
            })
          ],
        }
      }
    },
    // special cases delistCompressed + listCompressed as mentioned in comment above
    {
      select: "[instructionNode]",
      transform: (node) => {
        if(
          node.name !== "delistCompressed" &&
          node.name !== "listCompressed"
        ){
          return node;
        }
        k.assertIsNode(node, "instructionNode");
        return {
          ...node,
          extraArguments: [
            k.instructionArgumentNode({
              name: "proof",
              type: k.arrayTypeNode(k.publicKeyTypeNode()),
              docs: ["proof path, can be shortened if canopyDepth of merkle tree is also specified"],
              defaultValue: k.arrayValueNode([]),
              defaultValueStrategy: 'optional'
            }),
            k.instructionArgumentNode({
              name: "canopyDepth",
              type: k.numberTypeNode('u8'),
              docs: ["canopy depth of merkle tree, reduces proofPath length if specified"],
              defaultValue: k.numberValueNode(0),
              defaultValueStrategy: 'optional'
            })
          ],
          remainingAccounts: [
            k.instructionRemainingAccountsNode(k.resolverValueNode("resolveProofPath", {
              dependsOn: [
                k.argumentValueNode("proof"),
                k.argumentValueNode("canopyDepth")
              ]
            }), 
            {
              isOptional: true
            })
          ],
        }
      }
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

// Update instructions.
kinobi.update(
  k.updateInstructionsVisitor({
    // compressed 
    buyCompressed: {
      accounts: {
        buyer: {
          defaultValue: k.accountValueNode("payer")
        },
        rentDest: {
          defaultValue: k.accountValueNode("owner")
        }
      },
      arguments: {
        optionalRoyaltyPct: {
          defaultValue: k.numberValueNode(100)
        },
        nonce: {
          defaultValue: k.argumentValueNode("index")
        },
      }
    },
    delistCompressed: {
      accounts: {
        rentDest: {
          defaultValue: k.accountValueNode("owner")
        }
      },
      arguments: {
        nonce: {
          defaultValue: k.argumentValueNode("index")
        },
      }
    },
    listCompressed: {
      accounts: {
        ownerAddress: {
          defaultValue: k.accountValueNode("owner")
        },
        delegate: {
          defaultValue: k.accountValueNode("owner")
        }
      },
      arguments: {
        nonce: {
          defaultValue: k.argumentValueNode("index")
        }
      },
    },
    takeBidCompressedFullMeta: {
      accounts: {
        seller: {
          isSigner: true
        },
        delegate: {
          isSigner: true,
          defaultValue: k.accountValueNode("seller")
        },
        cosigner: {
          defaultValue: k.accountValueNode("seller")
        },
        rentDest: {
          defaultValue: k.accountValueNode("owner")
        },
        marginAccount: {
          defaultValue: k.accountValueNode("tensorswapProgram")
        }
      },
      arguments: {
        optionalRoyaltyPct: {
          defaultValue: k.numberValueNode(100)
        },
        nonce: {
          defaultValue: k.argumentValueNode("index")
        }
      }
    }
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
        // prevents overriding existing default values (e.g. optionalRoyaltyPct for cNFTs)
        if(!!node.defaultValue) return node;
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
      "resolveTreeAuthorityPda"
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
