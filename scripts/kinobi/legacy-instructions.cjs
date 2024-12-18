const k = require("kinobi");

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
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                  importFrom: "resolvers",
                  dependsOn: [k.accountValueNode("listState")],
                },
              ),
            },
            buyer: {
              defaultValue: k.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            buyerTa: {
              defaultValue: k.resolverValueNode("resolveBuyerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("buyer"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listTa: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
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
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: k.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            buyerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveBuyerTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("buyerTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            listTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("listTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
          },
          remainingAccounts: [
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creators"),
              {
                isWritable: true,
                isOptional: true,
              },
            ),
          ],
          arguments: {
            tokenStandard: {
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
              ),
            },
          },
        },
        buyLegacySpl: {
          accounts: {
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                  importFrom: "resolvers",
                  dependsOn: [k.accountValueNode("listState")],
                },
              ),
            },
            buyer: {
              defaultValue: k.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            buyerTa: {
              defaultValue: k.resolverValueNode("resolveBuyerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("buyer"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listTa: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
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
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: k.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            buyerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveBuyerTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("buyerTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            listTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("listTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            feeVaultCurrencyTa: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultCurrencyAta",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("listState"),
                    k.accountValueNode("currency"),
                    k.accountValueNode("currencyTokenProgram"),
                  ],
                },
              ),
            },
            ownerCurrencyTa: {
              defaultValue: k.resolverValueNode(
                "resolveOwnerCurrencyAta",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("owner"),
                    k.accountValueNode("currency"),
                    k.accountValueNode("currencyTokenProgram"),
                  ],
                },
              ),
            },
            payerCurrencyTa: {
              defaultValue: k.resolverValueNode(
                "resolvePayerCurrencyAta",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("payer"),
                    k.accountValueNode("currency"),
                    k.accountValueNode("currencyTokenProgram"),
                  ],
                },
              ),
            },
          },
          remainingAccounts: [
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creators"),
              {
                isWritable: true,
                isOptional: true,
              },
            ),
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creatorsCurrencyTa"),
              {
                isWritable: true,
                isOptional: true,
              },
            ),
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("brokersCurrencyTa"),
              {
                isWritable: true,
                isOptional: true,
              },
            ),
          ],
          arguments: {
            creators: {
              type: k.arrayTypeNode(k.publicKeyTypeNode(), k.fixedCountNode(5)),
            },
            tokenStandard: {
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
              ),
            },
            brokersCurrencyTa: {
              type: k.arrayTypeNode(k.publicKeyTypeNode(), k.fixedCountNode(2)),
              defaultValue: k.resolverValueNode("resolveBrokersCurrencyAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("makerBroker"),
                  k.accountValueNode("takerBroker"),
                  k.accountValueNode("currency"),
                  k.accountValueNode("currencyTokenProgram"),
                ],
              }),
            },
            creatorsCurrencyTa: {
              type: k.arrayTypeNode(
                k.publicKeyTypeNode(),
                k.fixedCountNode(5),
              ),
              defaultValue: k.resolverValueNode("resolveCreatorsCurrencyAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.argumentValueNode("creators"),
                  k.accountValueNode("currency"),
                  k.accountValueNode("currencyTokenProgram"),
                ],
              }),
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
            ownerTa: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listTa: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
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
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: k.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            ownerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("ownerTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            listTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("listTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
          },
          arguments: {
            tokenStandard: {
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
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
            ownerTa: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listTa: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
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
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: k.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            ownerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("ownerTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            listTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("listTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
          },
          arguments: {
            tokenStandard: {
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
              ),
            },
          },
        },
        listLegacy: {
          accounts: {
            payer: {
              defaultValue: k.accountValueNode("owner"),
            },
            ownerTa: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listTa: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
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
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: k.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            ownerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("ownerTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            listTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("listTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
          },
          arguments: {
            tokenStandard: {
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
              ),
            },
          },
        },
        takeBidLegacy: {
          accounts: {
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromBidState",
                {
                  importFrom: "resolvers",
                  dependsOn: [k.accountValueNode("bidState")],
                },
              ),
            },
            // Needs to default to a mutable account.
            sharedEscrow: {
              defaultValue: k.accountValueNode("owner"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            whitelist: {
              defaultValue: k.publicKeyValueNode(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
              ),
            },
            sellerTa: {
              defaultValue: k.resolverValueNode("resolveSellerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("seller"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            ownerTa: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            bidTa: {
              defaultValue: k.pdaValueNode("bidTa", [
                k.pdaSeedValueNode("mint", k.accountValueNode("mint")),
              ]),
            },
            bidState: {
              defaultValue: k.pdaValueNode("bidState", [
                k.pdaSeedValueNode("bidId", k.accountValueNode("mint")),
              ]),
            },
            metadata: {
              defaultValue: k.resolverValueNode("resolveMetadata", {
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: k.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            sellerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveSellerTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("sellerTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            ownerTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("ownerTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            bidTokenRecord: {
              defaultValue: k.resolverValueNode(
                "resolveBidTokenRecordFromTokenStandard",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("bidTa"),
                    k.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
          },
          remainingAccounts: [
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creators"),
              {
                isWritable: true,
                isOptional: true,
              },
            ),
          ],
          arguments: {
            tokenStandard: {
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
              ),
            },
          },
        },
      }),
    );

    return root;
  });
};
