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
        buyWns: {
          accounts: {
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
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
            approve: {
              defaultValue: k.resolverValueNode("resolveWnsApprovePda", {
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: k.resolverValueNode("resolveWnsDistributionPda", {
                importFrom: "resolvers",
                dependsOn: [
                  k.argumentValueNode("collection"),
                  k.argumentValueNode("paymentMint"),
                ],
              }),
            },
            extraMetas: {
              defaultValue: k.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("wnsProgram"),
                  ],
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
          ],
          arguments: {
            collection: {
              type: k.publicKeyTypeNode(),
            },
            paymentMint: {
              type: k.publicKeyTypeNode(),
              defaultValue: k.publicKeyValueNode(
                "11111111111111111111111111111111",
              ),
            },
          },
        },
        buyWnsSpl: {
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
            distributionCurrencyTa: {
              defaultValue: k.resolverValueNode(
                "resolveDistributionCurrencyAta",
                {
                  dependsOn: [
                    k.accountValueNode("distribution"),
                    k.accountValueNode("currencyTokenProgram"),
                    k.accountValueNode("currency"),
                  ],
                },
              ),
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
            approve: {
              defaultValue: k.resolverValueNode("resolveWnsApprovePda", {
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: k.resolverValueNode("resolveWnsDistributionPda", {
                importFrom: "resolvers",
                dependsOn: [
                  k.argumentValueNode("collection"),
                  k.argumentValueNode("paymentMint"),
                ],
              }),
            },
            extraMetas: {
              defaultValue: k.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("wnsProgram"),
                  ],
                },
              ),
            },
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
          ],
          arguments: {
            collection: {
              type: k.publicKeyTypeNode(),
            },
            paymentMint: {
              type: k.publicKeyTypeNode(),
              defaultValue: k.publicKeyValueNode(
                "11111111111111111111111111111111",
              ),
            },
          },
        },
        closeExpiredListingWns: {
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
            approve: {
              defaultValue: k.resolverValueNode("resolveWnsApprovePda", {
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: k.resolverValueNode("resolveWnsDistributionPda", {
                importFrom: "resolvers",
                dependsOn: [
                  k.argumentValueNode("collection"),
                  k.argumentValueNode("paymentMint"),
                ],
              }),
            },
            extraMetas: {
              defaultValue: k.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("wnsProgram"),
                  ],
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
          arguments: {
            collection: {
              type: k.publicKeyTypeNode(),
            },
            paymentMint: {
              type: k.publicKeyTypeNode(),
              defaultValue: k.publicKeyValueNode(
                "11111111111111111111111111111111",
              ),
            },
          },
        },
        delistWns: {
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
            approve: {
              defaultValue: k.resolverValueNode("resolveWnsApprovePda", {
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: k.resolverValueNode("resolveWnsDistributionPda", {
                importFrom: "resolvers",
                dependsOn: [
                  k.argumentValueNode("collection"),
                  k.argumentValueNode("paymentMint"),
                ],
              }),
            },
            extraMetas: {
              defaultValue: k.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("wnsProgram"),
                  ],
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
          arguments: {
            collection: {
              type: k.publicKeyTypeNode(),
            },
            paymentMint: {
              type: k.publicKeyTypeNode(),
              defaultValue: k.publicKeyValueNode(
                "11111111111111111111111111111111",
              ),
            },
          },
        },
        listWns: {
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
            distribution: {
              defaultValue: k.resolverValueNode("resolveWnsDistributionPda", {
                importFrom: "resolvers",
                dependsOn: [
                  k.argumentValueNode("collection"),
                  k.argumentValueNode("paymentMint"),
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
            approve: {
              defaultValue: k.resolverValueNode("resolveWnsApprovePda", {
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            extraMetas: {
              defaultValue: k.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("wnsProgram"),
                  ],
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
          arguments: {
            collection: {
              type: k.publicKeyTypeNode(),
            },
            paymentMint: {
              type: k.publicKeyTypeNode(),
              defaultValue: k.publicKeyValueNode(
                "11111111111111111111111111111111",
              ),
            },
          },
        },
        takeBidWns: {
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
            approve: {
              defaultValue: k.resolverValueNode("resolveWnsApprovePda", {
                importFrom: "resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: k.resolverValueNode("resolveWnsDistributionPda", {
                importFrom: "resolvers",
                dependsOn: [
                  k.argumentValueNode("collection"),
                  k.argumentValueNode("paymentMint"),
                ],
              }),
            },
            extraMetas: {
              defaultValue: k.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                  importFrom: "resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("wnsProgram"),
                  ],
                },
              ),
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
          ],
          arguments: {
            tokenStandard: {
              type: k.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: k.enumValueNode(
                k.definedTypeLinkNode("TokenStandard", "resolvers"),
                "ProgrammableNonFungible",
              ),
            },
            collection: {
              type: k.publicKeyTypeNode(),
            },
            paymentMint: {
              type: k.publicKeyTypeNode(),
              defaultValue: k.publicKeyValueNode(
                "11111111111111111111111111111111",
              ),
            },
          },
        },
      }),
    );

    return root;
  });
};
