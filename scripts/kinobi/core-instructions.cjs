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
        buyCore: {
          accounts: {
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                  dependsOn: [k.accountValueNode("listState")]
                }
              )
            },
            buyer: {
              defaultValue: k.accountValueNode("payer")
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner")
            },
            buyerAta: {
              defaultValue: k.resolverValueNode("resolveBuyerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("buyer"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("asset")
                ]
              })
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("asset")
                ]
              })
            }
          },
          remainingAccounts: [
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creators"),
              {
                isWritable: true,
                isOptional: true
              }
            )
          ]
        },
        buyCoreSpl: {
          accounts: {
            feeVault: {
              defaultValue: k.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                  dependsOn: [k.accountValueNode("listState")]
                }
              )
            },
            buyer: {
              defaultValue: k.accountValueNode("payer")
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner")
            },
            buyerAta: {
              defaultValue: k.resolverValueNode("resolveBuyerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("buyer"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("asset")
                ]
              })
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("asset")
                ]
              })
            }
          },
          remainingAccounts: [
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creators"),
              {
                isWritable: true,
                isOptional: true
              }
            ),
            k.instructionRemainingAccountsNode(
              k.argumentValueNode("creatorsAtas"),
              {
                isWritable: true,
                isOptional: true
              }
            )
          ]
        },
        closeExpiredListingCore: {
          accounts: {
            listState: { defaultValue: k.pdaValueNode("assetListState") }
          }
        },
        delistCore: {
          accounts: {
            rentDestination: {
              defaultValue: k.accountValueNode("owner")
            },
            listState: { defaultValue: k.pdaValueNode("assetListState") }
          }
        },
        listCore: {
          accounts: {
            payer: {
              defaultValue: k.accountValueNode("owner")
            },
            listState: { defaultValue: k.pdaValueNode("assetListState") }
          }
        }
      })
    );

    return root;
  });
};
