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
        buyT22: {
          accounts: {
            buyer: {
              defaultValue: k.accountValueNode("payer"),
            },
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            buyerAta: {
              defaultValue: k.resolverValueNode("resolveBuyerAta", {
                dependsOn: [
                  k.accountValueNode("buyer"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listToken: { defaultValue: k.pdaValueNode("listAta") },
            listState: { defaultValue: k.pdaValueNode("listState") },
          },
        },
        closeExpiredListingT22: {
          accounts: {
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            ownerAta: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listToken: { defaultValue: k.pdaValueNode("listAta") },
            listState: { defaultValue: k.pdaValueNode("listState") },
          },
        },
        delistT22: {
          accounts: {
            rentDestination: {
              defaultValue: k.accountValueNode("owner"),
            },
            ownerAta: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listToken: { defaultValue: k.pdaValueNode("listAta") },
            listState: { defaultValue: k.pdaValueNode("listState") },
          },
        },
        listT22: {
          accounts: {
            payer: {
              defaultValue: k.accountValueNode("owner"),
            },
            ownerAta: {
              defaultValue: k.resolverValueNode("resolveOwnerAta", {
                dependsOn: [
                  k.accountValueNode("owner"),
                  k.accountValueNode("tokenProgram"),
                  k.accountValueNode("mint"),
                ],
              }),
            },
            listToken: { defaultValue: k.pdaValueNode("listAta") },
            listState: { defaultValue: k.pdaValueNode("listState") },
          },
        },
      })
    );

    return root;
  });
}
