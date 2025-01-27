const c = require("codama");

module.exports = function visitor(options) {
  return c.rootNodeVisitor((currentRoot) => {
    let root = currentRoot;
    const updateRoot = (visitor) => {
      const newRoot = c.visit(root, visitor);
      c.assertIsNode(newRoot, "rootNode");
      root = newRoot;
    };
    // Rename Compressed Ixs (matches PLock Ixs + is more intuitive
    // since the "default" standard definitely isn't compressed (yet))
    updateRoot(
      c.updateInstructionsVisitor({
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
      c.updateInstructionsVisitor({
        buyCompressed: {
          accounts: {
            buyer: {
              defaultValue: c.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
            feeVault: {
              defaultValue: c.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                  dependsOn: [c.accountValueNode("listState")],
                },
              ),
            },
          },
          arguments: {
            optionalRoyaltyPct: {
              defaultValue: c.numberValueNode(100),
            },
            nonce: {
              defaultValue: c.argumentValueNode("index"),
            },
          },
        },
        buySplCompressed: {
          accounts: {
            buyer: {
              defaultValue: c.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
            feeVault: {
              defaultValue: c.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                  dependsOn: [c.accountValueNode("listState")],
                },
              ),
            },
            rentPayer: {
              defaultValue: c.accountValueNode("payer"),
            },
            feeVaultTa: {
              name: "feeVaultCurrencyTa",
              defaultValue: c.resolverValueNode(
                "resolveFeeVaultCurrencyAta",
                {
                  dependsOn: [
                    c.accountValueNode("listState"),
                    c.accountValueNode("currency"),
                    c.accountValueNode("currencyTokenProgram"),
                  ],
                },
              ),
            },
            ownerDestination: {
              name: "ownerCurrencyTa",
              defaultValue: c.resolverValueNode(
                "resolveOwnerCurrencyAta",
                {
                    dependsOn: [
                    c.accountValueNode("owner"),
                    c.accountValueNode("currency"),
                    c.accountValueNode("currencyTokenProgram"),
                  ],
                },
              ),
            },
            payerSource: {
              name: "payerCurrencyTa",
              defaultValue: c.resolverValueNode(
                "resolvePayerCurrencyAta",
                {
                    dependsOn: [
                    c.accountValueNode("payer"),
                    c.accountValueNode("currency"),
                    c.accountValueNode("currencyTokenProgram"),
                  ],
                },
              ),
            },
            tokenProgram: {
              name: "currencyTokenProgram",
            },
            makerBrokerCurrencyTa: {
              name: "makerBrokerTa",
              defaultValue: c.resolverValueNode("resolveMakerBrokerCurrencyAta", {
                dependsOn: [
                  c.accountValueNode("makerBroker"),
                  c.accountValueNode("currency"),
                  c.accountValueNode("currencyTokenProgram"),
                ],
              }),
            },
            takerBrokerCurrencyTa: {
              name: "takerBrokerTa",
              defaultValue: c.resolverValueNode("resolveTakerBrokerCurrencyAta", {
                dependsOn: [
                  c.accountValueNode("takerBroker"),
                  c.accountValueNode("currency"),
                  c.accountValueNode("currencyTokenProgram"),
                ],
              }),
            },
          },
          arguments: {
            optionalRoyaltyPct: {
              defaultValue: c.numberValueNode(100),
            },
            nonce: {
              defaultValue: c.argumentValueNode("index"),
            },
            creators: {
              type: c.arrayTypeNode(c.publicKeyTypeNode(), c.fixedCountNode(5)),
            },
            creatorsCurrencyTa: {
              type: c.arrayTypeNode(
                c.publicKeyTypeNode(),
                c.fixedCountNode(5),
              ),
              defaultValue: c.resolverValueNode("resolveCreatorsCurrencyAta", {
                dependsOn: [
                  c.argumentValueNode("creators"),
                  c.accountValueNode("currency"),
                  c.accountValueNode("currencyTokenProgram"),
                ],
              }),
            },
          },
          remainingAccounts: [
            c.instructionRemainingAccountsNode(
              c.argumentValueNode("creators"),
              {
                isWritable: true,
                isOptional: true,
              },
            ),
            c.instructionRemainingAccountsNode(
              c.argumentValueNode("creatorsCurrencyTa"),
              {
                isWritable: true,
                isOptional: true,
              },
            ),
          ],
        },
        closeExpiredListingCompressed: {
          accounts: {
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
          },
          arguments: {
            nonce: {
              defaultValue: c.argumentValueNode("index"),
            },
          },
        },
        delistCompressed: {
          accounts: {
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
          },
          arguments: {
            nonce: {
              defaultValue: c.argumentValueNode("index"),
            },
          },
        },
        listCompressed: {
          accounts: {
            owner: {
              isSigner: "either",
            },
            delegate: {
              defaultValue: c.accountValueNode("owner"),
              isSigner: "either",
            },
            rentPayer: {
              defaultValue: c.resolverValueNode(
                "resolveRemainingSignerWithOwnerOrDelegate",
                {
                  dependsOn: [
                    c.accountValueNode("owner"),
                    c.accountValueNode("delegate"),
                  ],
                },
              ),
            },
          },
          arguments: {
            nonce: {
              defaultValue: c.argumentValueNode("index"),
            },
          },
        },
        takeBidCompressedFullMeta: {
          accounts: {
            seller: {
              isSigner: "either",
            },
            delegate: {
              defaultValue: c.accountValueNode("seller"),
              isSigner: "either",
            },
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
            sharedEscrow: {
              defaultValue: c.accountValueNode("tensorswapProgram"),
            },
            feeVault: {
              defaultValue: c.resolverValueNode(
                "resolveFeeVaultPdaFromBidState",
                {
                  dependsOn: [c.accountValueNode("bidState")],
                },
              ),
            },
          },
          arguments: {
            optionalRoyaltyPct: {
              defaultValue: c.numberValueNode(100),
            },
            nonce: {
              defaultValue: c.argumentValueNode("index"),
            },
          },
        },
        takeBidCompressedMetaHash: {
          accounts: {
            seller: {
              isSigner: "either",
            },
            delegate: {
              defaultValue: c.accountValueNode("seller"),
              isSigner: "either",
            },
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
            sharedEscrow: {
              defaultValue: c.accountValueNode("tensorswapProgram"),
            },
            feeVault: {
              defaultValue: c.resolverValueNode(
                "resolveFeeVaultPdaFromBidState",
                {
                  dependsOn: [c.accountValueNode("bidState")],
                },
              ),
            },
          },
          arguments: {
            optionalRoyaltyPct: {
              defaultValue: c.numberValueNode(100),
            },
            nonce: {
              defaultValue: c.argumentValueNode("index"),
            },
          },
        },
      }),
    );

    // Add creators, proof, canopyDepth for remaining accounts
    updateRoot(
      c.bottomUpTransformerVisitor([
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
              c.isNode(node, "instructionNode") && names.includes(node.name)
            );
          },
          transform: (node) => {
            c.assertIsNode(node, "instructionNode");
            return {
              ...node,
              extraArguments: [
                c.instructionArgumentNode({
                  name: "creators",
                  type: c.arrayTypeNode(
                    c.tupleTypeNode([
                      c.publicKeyTypeNode(),
                      c.numberTypeNode("u16"),
                    ]),
                    c.prefixedCountNode(c.numberTypeNode("u32")),
                  ),
                  docs: [
                    "creators, structured like [ [creator_pubkey_1,creator_shares_1], ..., [creator_pubkey_n, creator_shares_n] ]",
                  ],
                  defaultValue: c.arrayValueNode([]),
                  defaultValueStrategy: "optional",
                }),
                c.instructionArgumentNode({
                  name: "proof",
                  type: c.arrayTypeNode(
                    c.publicKeyTypeNode(),
                    c.prefixedCountNode(c.numberTypeNode("u32")),
                  ),
                  docs: [
                    "proof path, can be shortened if canopyDepth of merkle tree is also specified",
                  ],
                  defaultValue: c.arrayValueNode([]),
                  defaultValueStrategy: "optional",
                }),
                c.instructionArgumentNode({
                  name: "canopyDepth",
                  type: c.numberTypeNode("u8"),
                  docs: [
                    "canopy depth of merkle tree, reduces proofPath length if specified",
                  ],
                  defaultValue: c.numberValueNode(0),
                  defaultValueStrategy: "optional",
                }),
              ],
              remainingAccounts: [
                c.instructionRemainingAccountsNode(
                  c.resolverValueNode("resolveCreatorPath", {
                    dependsOn: [c.argumentValueNode("creators")],
                  }),
                  {
                    isOptional: true,
                  },
                ),
                c.instructionRemainingAccountsNode(
                  c.resolverValueNode("resolveProofPath", {
                    dependsOn: [
                      c.argumentValueNode("proof"),
                      c.argumentValueNode("canopyDepth"),
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
              c.isNode(node, "instructionNode") && names.includes(node.name)
            );
          },
          transform: (node) => {
            c.assertIsNode(node, "instructionNode");
            return {
              ...node,
              extraArguments: [
                c.instructionArgumentNode({
                  name: "proof",
                  type: c.arrayTypeNode(
                    c.publicKeyTypeNode(),
                    c.prefixedCountNode(c.numberTypeNode("u32")),
                  ),
                  docs: [
                    "proof path, can be shortened if canopyDepth of merkle tree is also specified",
                  ],
                  defaultValue: c.arrayValueNode([]),
                  defaultValueStrategy: "optional",
                }),
                c.instructionArgumentNode({
                  name: "canopyDepth",
                  type: c.numberTypeNode("u8"),
                  docs: [
                    "canopy depth of merkle tree, reduces proofPath length if specified",
                  ],
                  defaultValue: c.numberValueNode(0),
                  defaultValueStrategy: "optional",
                }),
              ],
              remainingAccounts: [
                c.instructionRemainingAccountsNode(
                  c.resolverValueNode("resolveProofPath", {
                    dependsOn: [
                      c.argumentValueNode("proof"),
                      c.argumentValueNode("canopyDepth"),
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
