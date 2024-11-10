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
        buyT22: {
          accounts: {
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
            feeVault: {
              defaultValue: c.resolverValueNode(
                "resolveFeeVaultPdaFromListState",
                {
                    dependsOn: [c.accountValueNode("listState")],
                },
              ),
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
              c.argumentValueNode("transferHookAccounts"),
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
            currencyTokenProgram: {
              defaultValue: c.publicKeyValueNode(
                "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
                "tokenProgram",
              ),
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
            c.instructionRemainingAccountsNode(
              c.argumentValueNode("transferHookAccounts"),
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
          },
          remainingAccounts: [
            c.instructionRemainingAccountsNode(
              c.argumentValueNode("transferHookAccounts"),
              {
                isOptional: false,
                isSigner: false,
                isWritable: false,
              },
            ),
          ],
        },
        delistT22: {
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
            
          },
          remainingAccounts: [
            c.instructionRemainingAccountsNode(
              c.argumentValueNode("transferHookAccounts"),
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
              defaultValue: c.accountValueNode("owner"),
            },
            cosigner: {
              defaultValue: c.publicKeyValueNode(
                "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
              ),
              isSigner: true,
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
            
          },
          remainingAccounts: [
            c.instructionRemainingAccountsNode(
              c.argumentValueNode("transferHookAccounts"),
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
              c.argumentValueNode("transferHookAccounts"),
              {
                isOptional: false,
                isSigner: false,
                isWritable: false,
              },
            ),
          ],
          arguments: {
            tokenStandard: {
              type: c.definedTypeLinkNode("TokenStandard", "resolvers"),
              defaultValue: c.enumValueNode(
                c.definedTypeLinkNode("TokenStandard", "resolvers"),
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
