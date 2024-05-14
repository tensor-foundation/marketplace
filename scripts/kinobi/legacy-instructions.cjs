const k = require("@metaplex-foundation/kinobi");

module.exports = function visitor(options) {
  return k.rootNodeVisitor((currentRoot) => {
    let root = currentRoot;
    const updateRoot = (visitor) => {
      const newRoot = k.visit(root, visitor);
      k.assertIsNode(newRoot, "rootNode");
      root = newRoot;
    };

    updateRoot(
      k.updateInstructionsVisitor({
        buyLegacy: {
          accounts: {
            feeVault: {
              defaultValue: k.resolverValueNode("resolveFeeVaultPdaFromListState", {
                dependsOn: [
                  k.accountValueNode("listState"),
                ],
              }),
            },
            buyer: {
              defaultValue: k.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            buyerAta: {
              defaultValue: k.resolverValueNode("resolveBuyerAta", {
                importFrom:"resolvers",
                dependsOn: [
                  k.accountValueNode("buyer"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom:"resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listState: { defaultValue: k.pdaValueNode("listState") },
            metadata: {
              defaultValue: k.resolverValueNode("resolveMetadata", {
                importFrom:"resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: k.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                }
              ),
            },
            buyerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveBuyerTokenRecordFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("buyerAta"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                }
              ),
            },
            listTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("listAta"),
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
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creators"),
              {
                isWritable: true,
                isOptional: true,
              }
            ),
          ],
          arguments: {
            tokenStandard: {
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
                "NonFungible"
              ),
            },
          },
        },
        closeExpiredListingLegacy: {
          accounts: {
            owner: {
              defaultValue: k.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            ownerAta: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                importFrom:"resolvers",
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom:"resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listState: { defaultValue: k.pdaValueNode("listState") },
            metadata: {
              defaultValue: k.resolverValueNode("resolveMetadata", {
                importFrom:"resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: k.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                }
              ),
            },
            ownerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("ownerAta"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                }
              ),
            },
            listTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("listAta"),
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
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
                "NonFungible"
              ),
            },
          },
        },
        delistLegacy: {
          accounts: {
            payer: {
              defaultValue: k.accountValueNode("owner"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            ownerAta: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                importFrom:"resolvers",
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom:"resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listState: { defaultValue: k.pdaValueNode("listState") },
            metadata: {
              defaultValue: k.resolverValueNode("resolveMetadata", {
                importFrom:"resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: k.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                }
              ),
            },
            ownerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("ownerAta"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                }
              ),
            },
            listTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("listAta"),
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
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
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
            ownerAta: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                importFrom:"resolvers",
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom:"resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listState: { defaultValue: k.pdaValueNode("listState") },
            metadata: {
              defaultValue: k.resolverValueNode("resolveMetadata", {
                importFrom:"resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: k.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                }
              ),
            },
            ownerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("ownerAta"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                }
              ),
            },
            listTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("listAta"),
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
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
                "NonFungible"
              ),
            },
          },
        },
        takeBidLegacy: {
          accounts: {
            feeVault: {
              defaultValue: k.resolverValueNode("resolveFeeVaultPdaFromBidState", {
                dependsOn: [
                  k.accountValueNode("bidState"),
                ],
              }),
            },
            sharedEscrow: {
              defaultValue: k.accountValueNode("owner"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            whitelist: {
              defaultValue: k.publicKeyValueNode(
                "11111111111111111111111111111111"
              ),
            },
            sellerAta: {
              defaultValue: k.resolverValueNode("resolveSellerAta", {
                importFrom:"resolvers",
                dependsOn: [
                  k.accountValueNode("seller"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            ownerAta: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                importFrom:"resolvers",
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            bidAta: {
              defaultValue: k.resolverValueNode("resolveBidAta", {
                importFrom:"resolvers",
                dependsOn: [
                  k.accountValueNode("bidState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            bidState: {
              defaultValue: k.pdaValueNode("bidState", [
                k.pdaSeedValueNode("bidId", k.accountValueNode("mint")),
              ]),
            },
            metadata: {
              defaultValue: k.resolverValueNode("resolveMetadata", {
                importFrom:"resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: k.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                }
              ),
            },
            sellerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveSellerTokenRecordFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("sellerAta"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                }
              ),
            },
            ownerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("ownerAta"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                }
              ),
            },
            bidTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveBidTokenRecordFromTokenStandard",
                {
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("bidAta"),
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
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creators"),
              {
                isWritable: true,
                isOptional: true,
              }
            ),
          ],
          arguments: {
            tokenStandard: {
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
                "NonFungible"
              ),
            },
          },
        },
      })
    );

    return root;
  });
};
