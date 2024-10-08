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
        buyT22: {
          accounts: {
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
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                  dependsOn: [k.accountValueNode("listState")],
                },
              ),
            },
            tokenProgram: {
              defaultValue: k.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
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
              k.argumentValueNode("transferHookAccounts"),
              {
                isOptional: false,
                isSigner: false,
                isWritable: false,
              },
            ),
          ],
        },
        buyT22Spl: {
          accounts: {
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                  dependsOn: [k.accountValueNode("listState")],
                },
              ),
            },
            feeVaultCurrencyTa: {
              defaultValue: k.resolverValueNode("resolveFeeVaultCurrencyAta", {
                dependsOn: [
                  k.accountValueNode("feeVault"),
                  k.accountValueNode("currencyTokenProgram"),
                  k.accountValueNode("currency"),
                ],
              }),
            },
            payerCurrencyTa: {
              defaultValue: k.resolverValueNode("resolvePayerCurrencyAta", {
                dependsOn: [
                  k.accountValueNode("payer"),
                  k.accountValueNode("currencyTokenProgram"),
                  k.accountValueNode("currency"),
                ],
              }),
            },
            ownerCurrencyTa: {
              defaultValue: k.resolverValueNode("resolveOwnerCurrencyAta", {
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("currencyTokenProgram"),
                  k.accountValueNode("currency"),
                ],
              }),
            },
            makerBrokerCurrencyTa: {
              // Only resolves if makerBroker exists
              defaultValue: k.resolverValueNode(
                "resolveMakerBrokerCurrencyAta",
                {
                  dependsOn: [
                    k.accountValueNode("makerBroker"),
                    k.accountValueNode("currencyTokenProgram"),
                    k.accountValueNode("currency"),
                  ],
                },
              ),
            },
            takerBrokerCurrencyTa: {
              // Only resolves if takerBroker exists
              defaultValue: k.resolverValueNode(
                "resolveTakerBrokerCurrencyAta",
                {
                  dependsOn: [
                    k.accountValueNode("takerBroker"),
                    k.accountValueNode("currencyTokenProgram"),
                    k.accountValueNode("currency"),
                  ],
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
            tokenProgram: {
              defaultValue: k.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
              ),
            },
            currencyTokenProgram: {
              defaultValue: k.publicKeyValueNode(
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                "tokenProgram",
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
              k.argumentValueNode("creatorAtas"),
              {
                isWritable: true,
                isOptional: true,
              },
            ),
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("transferHookAccounts"),
              {
                isOptional: false,
                isSigner: false,
                isWritable: false,
              },
            ),
          ],
        },
        closeExpiredListingT22: {
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
            tokenProgram: {
              defaultValue: k.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
              ),
            },
          },
        },
        delistT22: {
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
            tokenProgram: {
              defaultValue: k.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
              ),
            },
          },
          remainingAccounts: [
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("transferHookAccounts"),
              {
                isOptional: false,
                isSigner: false,
                isWritable: false,
              },
            ),
          ],
        },
        listT22: {
          accounts: {
            payer: {
              defaultValue: k.accountValueNode("owner"),
            },
            cosigner: {
              defaultValue: k.publicKeyValueNode(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
              ),
              isSigner: true,
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
            tokenProgram: {
              defaultValue: k.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
              ),
            },
          },
          remainingAccounts: [
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("transferHookAccounts"),
              {
                isOptional: false,
                isSigner: false,
                isWritable: false,
              },
            ),
          ],
        },
        takeBidT22: {
          accounts: {
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromBidState",
                {
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
              defaultValue: k.resolverValueNode("resolveBidTa", {
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            bidState: {
              defaultValue: k.pdaValueNode("bidState", [
                k.pdaSeedValueNode("bidId", k.accountValueNode("mint")),
              ]),
            },
            tokenProgram: {
              defaultValue: k.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
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
              k.argumentValueNode("transferHookAccounts"),
              {
                isOptional: false,
                isSigner: false,
                isWritable: false,
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
