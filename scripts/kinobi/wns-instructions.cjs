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
        buyWns: {
          accounts: {
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
            approve: {
              defaultValue: k.resolverValueNode("resolveWnsApprovePda", {
                importFrom:"resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: k.resolverValueNode("resolveWnsDistributionPda", {
                importFrom:"resolvers",
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
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("wnsProgram"),
                  ],
                }
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
                "11111111111111111111111111111111"
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
            approve: {
              defaultValue: k.resolverValueNode("resolveWnsApprovePda", {
                importFrom:"resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: k.resolverValueNode("resolveWnsDistributionPda", {
                importFrom:"resolvers",
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
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("wnsProgram"),
                  ],
                }
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
                "11111111111111111111111111111111"
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
            approve: {
              defaultValue: k.resolverValueNode("resolveWnsApprovePda", {
                importFrom:"resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: k.resolverValueNode("resolveWnsDistributionPda", {
                importFrom:"resolvers",
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
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("wnsProgram"),
                  ],
                }
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
                "11111111111111111111111111111111"
              ),
            },
          },
        },
        listWns: {
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
            approve: {
              defaultValue: k.resolverValueNode("resolveWnsApprovePda", {
                importFrom:"resolvers",
                dependsOn: [k.accountValueNode("mint")],
              }),
            },
            distribution: {
              defaultValue: k.resolverValueNode("resolveWnsDistributionPda", {
                importFrom:"resolvers",
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
                  importFrom:"resolvers",
                  dependsOn: [
                    k.accountValueNode("mint"),
                    k.accountValueNode("wnsProgram"),
                  ],
                }
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
                "11111111111111111111111111111111"
              ),
            },
          },
        },
      })
    );

    return root;
  });
};
