const c = require("codama");

module.exports = function visitor(options) {
  return c.rootNodeVisitor((currentRoot) => {
    let root = currentRoot;
    const updateRoot = (visitor) => {
      const newRoot = c.visit(root, visitor);
      c.assertIsNode(newRoot, "rootNode");
      root = newRoot;
    };
    // Rename tokenProgram to currencyTokenProgram for consistency
    updateRoot(
      c.updateInstructionsVisitor({
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
      c.updateInstructionsVisitor({
        buyCore: {
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
            buyerAta: {
              defaultValue: c.resolverValueNode("resolveBuyerAta", {
                dependsOn: [
                  c.accountValueNode("buyer"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("asset"),
                ],
              }),
            },
            listState: {
              defaultValue: c.pdaValueNode("assetListState"),
            },
            listAta: {
              defaultValue: c.resolverValueNode("resolveListAta", {
                dependsOn: [
                  c.accountValueNode("listState"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("asset"),
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
          ],
        },
        buyCoreSpl: {
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
            buyerAta: {
              defaultValue: c.resolverValueNode("resolveBuyerAta", {
                dependsOn: [
                  c.accountValueNode("buyer"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("asset"),
                ],
              }),
            },
            listState: {
              defaultValue: c.pdaValueNode("assetListState"),
            },
            listAta: {
              defaultValue: c.resolverValueNode("resolveListAta", {
                dependsOn: [
                  c.accountValueNode("listState"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("asset"),
                ],
              }),
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
            makerBrokerTa: {
              defaultValue: c.resolverValueNode("resolveMakerBrokerCurrencyAta", {
                dependsOn: [
                  c.accountValueNode("makerBroker"),
                  c.accountValueNode("currency"),
                  c.accountValueNode("currencyTokenProgram"),
                ],
              }),
            },
            takerBrokerTa: {
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
        closeExpiredListingCore: {
          accounts: {
            listState: {
              defaultValue: c.pdaValueNode("assetListState"),
            },
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
          },
        },
        delistCore: {
          accounts: {
            rentDestination: {
              defaultValue: c.accountValueNode("owner"),
            },
            listState: {
              defaultValue: c.pdaValueNode("assetListState"),
            },
          },
        },
        listCore: {
          accounts: {
            payer: {
              defaultValue: c.accountValueNode("owner"),
            },
            listState: {
              defaultValue: c.pdaValueNode("assetListState"),
            },
          },
        },
        takeBidCore: {
          accounts: {
            feeVault: {
              defaultValue: c.resolverValueNode(
                "resolveFeeVaultPdaFromBidState",
                {
                  dependsOn: [c.accountValueNode("bidState")],
                },
              ),
            },
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
            mintProof: {
              defaultValue: c.publicKeyValueNode(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
              ),
            },
          },
          remainingAccounts: [
            c.instructionRemainingAccountsNode(
              c.argumentValueNode("creators"),
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
