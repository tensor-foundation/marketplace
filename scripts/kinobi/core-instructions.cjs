const k = require("kinobi");

module.exports = function visitor(options) {
  return k.rootNodeVisitor((currentRoot) => {
    let root = currentRoot;
    const updateRoot = (visitor) => {
      const newRoot = k.visit(root, visitor);
      k.assertIsNode(newRoot, "rootNode");
      root = newRoot;
    };
    // Rename tokenProgram to currencyTokenProgram for consistency
    updateRoot(
      k.updateInstructionsVisitor({
        buyCoreSpl: {
          accounts: {
            tokenProgram: {
              name: "currencyTokenProgram",
            },
          },
        },
      }),
    );

    updateRoot(
      k.updateInstructionsVisitor({
        buyCore: {
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
            buyerAta: {
              defaultValue: k.resolverValueNode("resolveBuyerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("buyer"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("asset"),
                ],
              }),
            },
            listState: {
              defaultValue: k.pdaValueNode("assetListState"),
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("asset"),
                ],
              }),
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
        },
        buyCoreSpl: {
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
            buyerAta: {
              defaultValue: k.resolverValueNode("resolveBuyerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("buyer"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("asset"),
                ],
              }),
            },
            listState: {
              defaultValue: k.pdaValueNode("assetListState"),
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("asset"),
                ],
              }),
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
            makerBrokerTa: {
              defaultValue: k.resolverValueNode("resolveMakerBrokerCurrencyAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("makerBroker"),
                  k.accountValueNode("currency"),
                  k.accountValueNode("currencyTokenProgram"),
                ],
              }),
            },
            takerBrokerTa: {
              defaultValue: k.resolverValueNode("resolveTakerBrokerCurrencyAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("takerBroker"),
                  k.accountValueNode("currency"),
                  k.accountValueNode("currencyTokenProgram"),
                ],
              }),
            },
          },
          arguments: {
            creators: {
              type: k.arrayTypeNode(k.publicKeyTypeNode(), k.fixedCountNode(5)),
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
          remainingAccounts: [
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creators"),
              {
                isWritable: true,
                isOptional: true,
              },
            ),
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creatorsCurrencyAta"),
              {
                isWritable: true,
                isOptional: true,
              },
            ),
          ],
        },
        closeExpiredListingCore: {
          accounts: {
            listState: {
              defaultValue: k.pdaValueNode("assetListState"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
          },
        },
        delistCore: {
          accounts: {
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            listState: {
              defaultValue: k.pdaValueNode("assetListState"),
            },
          },
        },
        listCore: {
          accounts: {
            payer: {
              defaultValue: k.accountValueNode("owner"),
            },
            listState: {
              defaultValue: k.pdaValueNode("assetListState"),
            },
          },
        },
        takeBidCore: {
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
            mintProof: {
              defaultValue: k.publicKeyValueNode(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
              ),
            },
          },
          remainingAccounts: [
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creators"),
              {
                isWritable: true,
                isOptional: false,
              },
            ),
          ],
        },
      }),
    );

    return root;
  });
};
