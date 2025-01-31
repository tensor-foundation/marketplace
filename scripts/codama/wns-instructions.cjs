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
        buyWns: {
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
            approve: {
              defaultValue: c.resolverValueNode("resolveWnsApprovePda", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: c.resolverValueNode("resolveWnsDistributionPda", {
                dependsOn: [
                  c.argumentValueNode("collection"),
                  c.argumentValueNode("paymentMint"),
                ],
              }),
            },
            extraMetas: {
              defaultValue: c.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("wnsProgram"),
                  ],
                },
              ),
            },
            tokenProgram: {
              defaultValue: c.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
              ),
            },
          },
          arguments: {
            collection: {
              type: c.publicKeyTypeNode(),
            },
            paymentMint: {
              type: c.publicKeyTypeNode(),
              defaultValue: c.publicKeyValueNode(
                "11111111111111111111111111111111",
              ),
            },
          },
        },
        buyWnsSpl: {
          accounts: {
            feeVault: {
              defaultValue: c.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                    dependsOn: [c.accountValueNode("listState")],
                },
              ),
            },
            feeVaultCurrencyTa: {
              defaultValue: c.resolverValueNode("resolveFeeVaultCurrencyAta", {
                dependsOn: [
                  c.accountValueNode("feeVault"),
                  c.accountValueNode("currencyTokenProgram"),
                  c.accountValueNode("currency"),
                ],
              }),
            },
            payerCurrencyTa: {
              defaultValue: c.resolverValueNode("resolvePayerCurrencyAta", {
                dependsOn: [
                  c.accountValueNode("payer"),
                  c.accountValueNode("currencyTokenProgram"),
                  c.accountValueNode("currency"),
                ],
              }),
            },
            ownerCurrencyTa: {
              defaultValue: c.resolverValueNode("resolveOwnerCurrencyAta", {
                dependsOn: [
                  c.accountValueNode("owner"),
                  c.accountValueNode("currencyTokenProgram"),
                  c.accountValueNode("currency"),
                ],
              }),
            },
            distributionCurrencyTa: {
              defaultValue: c.resolverValueNode(
                "resolveDistributionCurrencyAta",
                {
                    dependsOn: [
                    c.accountValueNode("distribution"),
                    c.accountValueNode("currencyTokenProgram"),
                    c.accountValueNode("currency"),
                  ],
                },
              ),
            },
            makerBrokerCurrencyTa: {
              // Only resolves if makerBroker exists
              defaultValue: c.resolverValueNode(
                "resolveMakerBrokerCurrencyAta",
                {
                    dependsOn: [
                    c.accountValueNode("makerBroker"),
                    c.accountValueNode("currencyTokenProgram"),
                    c.accountValueNode("currency"),
                  ],
                },
              ),
            },
            takerBrokerCurrencyTa: {
              // Only resolves if takerBroker exists
              defaultValue: c.resolverValueNode(
                "resolveTakerBrokerCurrencyAta",
                {
                    dependsOn: [
                    c.accountValueNode("takerBroker"),
                    c.accountValueNode("currencyTokenProgram"),
                    c.accountValueNode("currency"),
                  ],
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
            approve: {
              defaultValue: c.resolverValueNode("resolveWnsApprovePda", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: c.resolverValueNode("resolveWnsDistributionPda", {
                dependsOn: [
                  c.argumentValueNode("collection"),
                  c.accountValueNode("currency"),
                ],
              }),
            },
            extraMetas: {
              defaultValue: c.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("wnsProgram"),
                  ],
                },
              ),
            },
            tokenProgram: {
              defaultValue: c.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
              ),
            },
            currencyTokenProgram: {
              defaultValue: c.publicKeyValueNode(
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                "tokenProgram",
              ),
            },
          },
          arguments: {
            collection: {
              type: c.publicKeyTypeNode(),
            },
          },
        },
        closeExpiredListingWns: {
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
            approve: {
              defaultValue: c.resolverValueNode("resolveWnsApprovePda", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: c.resolverValueNode("resolveWnsDistributionPda", {
                dependsOn: [
                  c.argumentValueNode("collection"),
                  c.argumentValueNode("paymentMint"),
                ],
              }),
            },
            extraMetas: {
              defaultValue: c.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("wnsProgram"),
                  ],
                },
              ),
            },
            tokenProgram: {
              defaultValue: c.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
              ),
            },
          },
          arguments: {
            collection: {
              type: c.publicKeyTypeNode(),
            },
            paymentMint: {
              type: c.publicKeyTypeNode(),
              defaultValue: c.publicKeyValueNode(
                "11111111111111111111111111111111",
              ),
            },
          },
        },
        delistWns: {
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
            approve: {
              defaultValue: c.resolverValueNode("resolveWnsApprovePda", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: c.resolverValueNode("resolveWnsDistributionPda", {
                dependsOn: [
                  c.argumentValueNode("collection"),
                  c.argumentValueNode("paymentMint"),
                ],
              }),
            },
            extraMetas: {
              defaultValue: c.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("wnsProgram"),
                  ],
                },
              ),
            },
            tokenProgram: {
              defaultValue: c.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
              ),
            },
          },
          arguments: {
            collection: {
              type: c.publicKeyTypeNode(),
            },
            paymentMint: {
              type: c.publicKeyTypeNode(),
              defaultValue: c.publicKeyValueNode(
                "11111111111111111111111111111111",
              ),
            },
          },
        },
        listWns: {
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
            distribution: {
              defaultValue: c.resolverValueNode("resolveWnsDistributionPda", {
                dependsOn: [
                  c.argumentValueNode("collection"),
                  c.argumentValueNode("paymentMint"),
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
            approve: {
              defaultValue: c.resolverValueNode("resolveWnsApprovePda", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            extraMetas: {
              defaultValue: c.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("wnsProgram"),
                  ],
                },
              ),
            },
            tokenProgram: {
              defaultValue: c.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
              ),
            },
          },
          arguments: {
            collection: {
              type: c.publicKeyTypeNode(),
            },
            paymentMint: {
              type: c.publicKeyTypeNode(),
              defaultValue: c.publicKeyValueNode(
                "11111111111111111111111111111111",
              ),
            },
          },
        },
        takeBidWns: {
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
            sellerTa: {
              defaultValue: c.resolverValueNode("resolveSellerAta", {
                dependsOn: [
                  c.accountValueNode("seller"),
                  c.accountValueNode("tokenProgram"),
                  c.accountValueNode("mint"),
                ],
              }),
            },
            approve: {
              defaultValue: c.resolverValueNode("resolveWnsApprovePda", {
                dependsOn: [c.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: c.resolverValueNode("resolveWnsDistributionPda", {
                dependsOn: [
                  c.argumentValueNode("collection"),
                  c.argumentValueNode("paymentMint"),
                ],
              }),
            },
            extraMetas: {
              defaultValue: c.resolverValueNode(
                "resolveWnsExtraAccountMetasPda",
                {
                    dependsOn: [
                    c.accountValueNode("mint"),
                    c.accountValueNode("wnsProgram"),
                  ],
                },
              ),
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
            tokenProgram: {
              defaultValue: c.publicKeyValueNode(
                "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                "tokenProgram",
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
            collection: {
              type: c.publicKeyTypeNode(),
            },
            paymentMint: {
              type: c.publicKeyTypeNode(),
              defaultValue: c.publicKeyValueNode(
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
