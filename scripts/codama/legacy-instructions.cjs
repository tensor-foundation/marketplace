const c = require("codama");

module.exports = function visitor(options) {
  return c.rootNodeVisitor((currentRoot) => {
    let root = currentRoot;
    const updateRoot = (visitor) => {
      const newRoot = c.visit(root, visitor);
      c.assertIsNode(newRoot, "rootNode");
      root = newRoot;
    };

    updateRoot(
      c.updateInstructionsVisitor({
        buyLegacy: {
          accounts: {
            feeVault: {
              defaultValue: c.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                  dependsOn: [c.accountValueNode("listState")],
                },
              ),
            },
            buyer: {
              defaultValue: c.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
            buyerTa: {
              defaultValue: c.resolverValueNode("resolveBuyerAta", {
                dependsOn: [
                  c.accountValueNode("buyer"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            listTa: {
              defaultValue: c.resolverValueNode("resolveListAta", {
                dependsOn: [
                  c.accountValueNode("listState"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            listState: { defaultValue: c.pdaValueNode("listState") },
            metadata: {
              defaultValue: c.resolverValueNode("resolveMetadata", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: c.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            buyerTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveBuyerTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("buyerTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            listTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("listTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
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
          ],
          arguments: {
            tokenStandard: {
              type: c.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: c.enumValueNode(
                c.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
              ),
            },
          },
        },
        buyLegacySpl: {
          accounts: {
            feeVault: {
              defaultValue: c.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                    dependsOn: [c.accountValueNode("listState")],
                },
              ),
            },
            buyer: {
              defaultValue: c.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
            buyerTa: {
              defaultValue: c.resolverValueNode("resolveBuyerAta", {
                dependsOn: [
                  c.accountValueNode("buyer"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            listTa: {
              defaultValue: c.resolverValueNode("resolveListAta", {
                dependsOn: [
                  c.accountValueNode("listState"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            listState: { defaultValue: c.pdaValueNode("listState") },
            metadata: {
              defaultValue: c.resolverValueNode("resolveMetadata", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: c.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            buyerTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveBuyerTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("buyerTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            listTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("listTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            feeVaultCurrencyTa: {
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
            ownerCurrencyTa: {
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
            payerCurrencyTa: {
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
            c.instructionRemainingAccountsNode(
              c.argumentValueNode("brokersCurrencyTa"),
              {
                isWritable: true,
                isOptional: true,
              },
            ),
          ],
          arguments: {
            creators: {
              type: c.arrayTypeNode(c.publicKeyTypeNode(), c.fixedCountNode(5)),
            },
            tokenStandard: {
              type: c.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: c.enumValueNode(
                c.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
              ),
            },
            brokersCurrencyTa: {
              type: c.arrayTypeNode(c.publicKeyTypeNode(), c.fixedCountNode(2)),
              defaultValue: c.resolverValueNode("resolveBrokersCurrencyAta", {
                dependsOn: [
                  c.accountValueNode("makerBroker"),
                  c.accountValueNode("takerBroker"),
                  c.accountValueNode("currency"),
                  c.accountValueNode("currencyTokenProgram"),
                ],
              }),
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
        },
        closeExpiredListingLegacy: {
          accounts: {
            owner: {
              defaultValue: c.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
            ownerTa: {
              defaultValue: c.resolverValueNode("resolveOwnerAta", {
                dependsOn: [
                  c.accountValueNode("owner"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            listTa: {
              defaultValue: c.resolverValueNode("resolveListAta", {
                dependsOn: [
                  c.accountValueNode("listState"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            listState: { defaultValue: c.pdaValueNode("listState") },
            metadata: {
              defaultValue: c.resolverValueNode("resolveMetadata", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: c.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            ownerTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("ownerTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            listTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("listTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
          },
          arguments: {
            tokenStandard: {
              type: c.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: c.enumValueNode(
                c.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
              ),
            },
          },
        },
        delistLegacy: {
          accounts: {
            payer: {
              defaultValue: c.accountValueNode("owner"),
            },
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
            ownerTa: {
              defaultValue: c.resolverValueNode("resolveOwnerAta", {
                dependsOn: [
                  c.accountValueNode("owner"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            listTa: {
              defaultValue: c.resolverValueNode("resolveListAta", {
                dependsOn: [
                  c.accountValueNode("listState"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            listState: { defaultValue: c.pdaValueNode("listState") },
            metadata: {
              defaultValue: c.resolverValueNode("resolveMetadata", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: c.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            ownerTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("ownerTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            listTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("listTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
          },
          arguments: {
            tokenStandard: {
              type: c.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: c.enumValueNode(
                c.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
              ),
            },
          },
        },
        listLegacy: {
          accounts: {
            payer: {
              defaultValue: c.accountValueNode("owner"),
            },
            ownerTa: {
              defaultValue: c.resolverValueNode("resolveOwnerAta", {
                dependsOn: [
                  c.accountValueNode("owner"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            listTa: {
              defaultValue: c.resolverValueNode("resolveListAta", {
                dependsOn: [
                  c.accountValueNode("listState"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            listState: { defaultValue: c.pdaValueNode("listState") },
            metadata: {
              defaultValue: c.resolverValueNode("resolveMetadata", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: c.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            ownerTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("ownerTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            listTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveListTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("listTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
          },
          arguments: {
            tokenStandard: {
              type: c.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: c.enumValueNode(
                c.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
              ),
            },
          },
        },
        takeBidLegacy: {
          accounts: {
            feeVault: {
              defaultValue: c.resolverValueNode(
                "resolveFeeVaultPdaFromBidState",
                {
                    dependsOn: [c.accountValueNode("bidState")],
                },
              ),
            },
            // Needs to default to a mutable account.
            sharedEscrow: {
              defaultValue: c.accountValueNode("owner"),
            },
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
            whitelist: {
              defaultValue: c.publicKeyValueNode(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
              ),
            },
            sellerTa: {
              defaultValue: c.resolverValueNode("resolveSellerAta", {
                dependsOn: [
                  c.accountValueNode("seller"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            ownerTa: {
              defaultValue: c.resolverValueNode("resolveOwnerAta", {
                dependsOn: [
                  c.accountValueNode("owner"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            bidTa: {
              defaultValue: c.pdaValueNode("bidTa", [
                c.pdaSeedValueNode("mint", c.accountValueNode("mint")),
              ]),
            },
            bidState: {
              defaultValue: c.pdaValueNode("bidState", [
                c.pdaSeedValueNode("bidId", c.accountValueNode("mint")),
              ]),
            },
            metadata: {
              defaultValue: c.resolverValueNode("resolveMetadata", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            edition: {
              defaultValue: c.resolverValueNode(
                "resolveEditionFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            sellerTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveSellerTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("sellerTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            ownerTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveOwnerTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("ownerTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
            },
            bidTokenRecord: {
              defaultValue: c.resolverValueNode(
                "resolveBidTokenRecordFromTokenStandard",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("bidTa"),
                    c.argumentValueNode("tokenStandard"),
                  ],
                },
              ),
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
          ],
          arguments: {
            tokenStandard: {
              type: c.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: c.enumValueNode(
                c.definedTypeLinkNode("TokenStandard", "resolvers"),
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
