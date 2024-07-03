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
                  k.accountValueNode("mint")
                ]
              })
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint")
                ]
              })
            },
            listState: { defaultValue: k.pdaValueNode("listState") }
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
        buyT22Spl: {
          accounts: {
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
                  k.accountValueNode("mint")
                ]
              })
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint")
                ]
              })
            },
            listState: { defaultValue: k.pdaValueNode("listState") }
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
        closeExpiredListingT22: {
          accounts: {
            owner: {
              defaultValue: k.accountValueNode("payer")
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner")
            },
            ownerAta: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint")
                ]
              })
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint")
                ]
              })
            },
            listState: { defaultValue: k.pdaValueNode("listState") }
          }
        },
        delistT22: {
          accounts: {
            payer: {
              defaultValue: k.accountValueNode("owner")
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner")
            },
            ownerAta: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint")
                ]
              })
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint")
                ]
              })
            },
            listState: { defaultValue: k.pdaValueNode("listState") }
          }
        },
        listT22: {
          accounts: {
            payer: {
              defaultValue: k.accountValueNode("owner")
            },
            ownerAta: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint")
                ]
              })
            },
            listAta: {
              defaultValue: k.resolverValueNode("resolveListAta", {
                importFrom: "resolvers",
                dependsOn: [
                  k.accountValueNode("listState"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint")
                ]
              })
            },
            listState: { defaultValue: k.pdaValueNode("listState") }
          }
        }
      })
    );

    return root;
  });
};
