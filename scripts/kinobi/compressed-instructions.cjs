const k = require("kinobi");

module.exports = function visitor(options) {
  return k.rootNodeVisitor((currentRoot) => {
    let root = currentRoot;
    const updateRoot = (visitor) => {
      const newRoot = k.visit(root, visitor);
      k.assertIsNode(newRoot, "rootNode");
      root = newRoot;
    };
    // Rename Compressed Ixs (matches PLock Ixs + is more intuitive
    // since the "default" standard definitely isn't compressed (yet))
    updateRoot(
      k.updateInstructionsVisitor({
        buy: {
          name: "buyCompressed",
        },
        buySpl: {
          name: "buySplCompressed",
        },
        closeExpiredListing: {
          name: "closeExpiredListingCompressed",
        },
        delist: {
          name: "delistCompressed",
        },
        list: {
          name: "listCompressed",
        },
        takeBidFullMeta: {
          name: "takeBidCompressedFullMeta",
        },
        takeBidMetaHash: {
          name: "takeBidCompressedMetaHash",
        },
      }),
    );

    // Update instructions.
    updateRoot(
      k.updateInstructionsVisitor({
        buyCompressed: {
          accounts: {
            buyer: {
              defaultValue: k.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                  dependsOn: [k.accountValueNode("listState")],
                },
              ),
            },
          },
          arguments: {
            optionalRoyaltyPct: {
              defaultValue: k.numberValueNode(100),
            },
            nonce: {
              defaultValue: k.argumentValueNode("index"),
            },
          },
        },
        buySplCompressed: {
          accounts: {
            buyer: {
              defaultValue: k.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                  dependsOn: [k.accountValueNode("listState")],
                },
              ),
            },
          },
          arguments: {
            optionalRoyaltyPct: {
              defaultValue: k.numberValueNode(100),
            },
            nonce: {
              defaultValue: k.argumentValueNode("index"),
            },
          },
        },
        closeExpiredListingCompressed: {
          accounts: {
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
          },
          arguments: {
            nonce: {
              defaultValue: k.argumentValueNode("index"),
            },
          },
        },
        delistCompressed: {
          accounts: {
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
          },
          arguments: {
            nonce: {
              defaultValue: k.argumentValueNode("index"),
            },
          },
        },
        listCompressed: {
          accounts: {
            owner: {
              isSigner: "either",
            },
            delegate: {
              defaultValue: k.accountValueNode("owner"),
              isSigner: "either",
            },
            rentPayer: {
              defaultValue: k.resolverValueNode(
                "resolveRemainingSignerWithOwnerOrDelegate",
                {
                  dependsOn: [
                    k.accountValueNode("owner"),
                    k.accountValueNode("delegate"),
                  ],
                },
              ),
            },
          },
          arguments: {
            nonce: {
              defaultValue: k.argumentValueNode("index"),
            },
          },
        },
        takeBidCompressedFullMeta: {
          accounts: {
            seller: {
              isSigner: "either",
            },
            delegate: {
              defaultValue: k.accountValueNode("seller"),
              isSigner: "either",
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            sharedEscrow: {
              defaultValue: k.accountValueNode("tensorswapProgram"),
            },
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromBidState",
                {
                  dependsOn: [k.accountValueNode("bidState")],
                },
              ),
            },
          },
          arguments: {
            optionalRoyaltyPct: {
              defaultValue: k.numberValueNode(100),
            },
            nonce: {
              defaultValue: k.argumentValueNode("index"),
            },
          },
        },
        takeBidCompressedMetaHash: {
          accounts: {
            seller: {
              isSigner: "either",
            },
            delegate: {
              defaultValue: k.accountValueNode("seller"),
              isSigner: "either",
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            sharedEscrow: {
              defaultValue: k.accountValueNode("tensorswapProgram"),
            },
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromBidState",
                {
                  dependsOn: [k.accountValueNode("bidState")],
                },
              ),
            },
          },
          arguments: {
            optionalRoyaltyPct: {
              defaultValue: k.numberValueNode(100),
            },
            nonce: {
              defaultValue: k.argumentValueNode("index"),
            },
          },
        },
      }),
    );

    // Add creators, proof, canopyDepth for remaining accounts
    updateRoot(
      k.bottomUpTransformerVisitor([
        // creators, proof, canopyDepth
        {
          select: (node) => {
            const names = [
              "buyCompressed",
              "closeExpiredListingCompressed",
              "takeBidCompressedFullMeta",
              "takeBidCompressedMetaHash",
            ];
            return (
              k.isNode(node, "instructionNode") && names.includes(node.name)
            );
          },
          transform: (node) => {
            k.assertIsNode(node, "instructionNode");
            return {
              ...node,
              extraArguments: [
                k.instructionArgumentNode({
                  name: "creators",
                  type: k.arrayTypeNode(
                    k.tupleTypeNode([
                      k.publicKeyTypeNode(),
                      k.numberTypeNode("u16"),
                    ]),
                    k.prefixedCountNode(k.numberTypeNode("u32")),
                  ),
                  docs: [
                    "creators, structured like [ [creator_pubkey_1,creator_shares_1], ..., [creator_pubkey_n, creator_shares_n] ]",
                  ],
                  defaultValue: k.arrayValueNode([]),
                  defaultValueStrategy: "optional",
                }),
                k.instructionArgumentNode({
                  name: "proof",
                  type: k.arrayTypeNode(
                    k.publicKeyTypeNode(),
                    k.prefixedCountNode(k.numberTypeNode("u32")),
                  ),
                  docs: [
                    "proof path, can be shortened if canopyDepth of merkle tree is also specified",
                  ],
                  defaultValue: k.arrayValueNode([]),
                  defaultValueStrategy: "optional",
                }),
                k.instructionArgumentNode({
                  name: "canopyDepth",
                  type: k.numberTypeNode("u8"),
                  docs: [
                    "canopy depth of merkle tree, reduces proofPath length if specified",
                  ],
                  defaultValue: k.numberValueNode(0),
                  defaultValueStrategy: "optional",
                }),
              ],
              remainingAccounts: [
                k.instructionRemainingAccountsNode(
                  k.resolverValueNode("resolveCreatorPath", {
                    dependsOn: [k.argumentValueNode("creators")],
                  }),
                  {
                    isOptional: true,
                  },
                ),
                k.instructionRemainingAccountsNode(
                  k.resolverValueNode("resolveProofPath", {
                    dependsOn: [
                      k.argumentValueNode("proof"),
                      k.argumentValueNode("canopyDepth"),
                    ],
                  }),
                  {
                    isOptional: true,
                  },
                ),
              ],
            };
          },
        },
        // proof, canopyDepth (doesn't need creators)
        {
          select: (node) => {
            const names = ["delistCompressed", "listCompressed"];
            return (
              k.isNode(node, "instructionNode") && names.includes(node.name)
            );
          },
          transform: (node) => {
            k.assertIsNode(node, "instructionNode");
            return {
              ...node,
              extraArguments: [
                k.instructionArgumentNode({
                  name: "proof",
                  type: k.arrayTypeNode(
                    k.publicKeyTypeNode(),
                    k.prefixedCountNode(k.numberTypeNode("u32")),
                  ),
                  docs: [
                    "proof path, can be shortened if canopyDepth of merkle tree is also specified",
                  ],
                  defaultValue: k.arrayValueNode([]),
                  defaultValueStrategy: "optional",
                }),
                k.instructionArgumentNode({
                  name: "canopyDepth",
                  type: k.numberTypeNode("u8"),
                  docs: [
                    "canopy depth of merkle tree, reduces proofPath length if specified",
                  ],
                  defaultValue: k.numberValueNode(0),
                  defaultValueStrategy: "optional",
                }),
              ],
              remainingAccounts: [
                k.instructionRemainingAccountsNode(
                  k.resolverValueNode("resolveProofPath", {
                    dependsOn: [
                      k.argumentValueNode("proof"),
                      k.argumentValueNode("canopyDepth"),
                    ],
                  }),
                  {
                    isOptional: true,
                  },
                ),
              ],
            };
          },
        },
      ]),
    );
    return root;
  });
};
