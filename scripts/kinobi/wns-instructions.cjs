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
            margin: {
              defaultValue: k.accountValueNode("owner"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            whitelist: {
              defaultValue: k.publicKeyValueNode(
                "11111111111111111111111111111111",
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
