#!/usr/bin/env zx
import "zx/globals";
import * as c from "codama";
import { rootNodeFromAnchor } from "@codama/nodes-from-anchor";
import { renderVisitor as renderJavaScriptVisitor } from "@codama/renderers-js";
import { renderVisitor as renderRustVisitor } from "@codama/renderers-rust";
import { getAllProgramIdls } from "./utils.mjs";

// Instanciate codama.
const [idl] = getAllProgramIdls()
  .filter((idl) => idl.includes("program/idl.json"))
  .map((idl) => rootNodeFromAnchor(require(idl)));
const codama = c.createFromRoot(idl);

// Additional visitors for instructions.
const legacyInstructions = require("./codama/legacy-instructions.cjs");
const compressedInstructions = require("./codama/compressed-instructions.cjs");
const token22Instructions = require("./codama/token22-instructions.cjs");
const wnsInstructions = require("./codama/wns-instructions.cjs");
const coreInstructions = require("./codama/core-instructions.cjs");

// Update programs.
codama.update(
  new c.updateProgramsVisitor({
    marketplaceProgram: { name: "tensorMarketplace" },
  }),
);

// Set default account values accross multiple instructions.
codama.update(
  c.setInstructionAccountDefaultValuesVisitor([
    {
      account: "treeAuthority",
      ignoreIfOptional: true,
      defaultValue: c.resolverValueNode("resolveTreeAuthorityPda", {
        dependsOn: [
          c.accountValueNode("merkleTree"),
          c.accountValueNode("bubblegumProgram"),
        ],
      }),
    },
    // default programs
    {
      account: "marketplaceProgram",
      ignoreIfOptional: true,
      defaultValue: c.publicKeyValueNode(
        "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
        "marketplaceProgram",
      ),
    },
    {
      account: "escrowProgram",
      ignoreIfOptional: true,
      defaultValue: c.publicKeyValueNode(
        "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
        "escrowProgram",
      ),
    },
    {
      account: "systemProgram",
      ignoreIfOptional: true,
      defaultValue: c.publicKeyValueNode(
        "11111111111111111111111111111111",
        "systemProgram",
      ),
    },
    {
      account: "tokenProgram",
      ignoreIfOptional: true,
      defaultValue: c.publicKeyValueNode(
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "tokenProgram",
      ),
    },
    {
      account: "associatedTokenProgram",
      ignoreIfOptional: true,
      defaultValue: c.publicKeyValueNode(
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
        "associatedTokenProgram",
      ),
    },
    {
      account: "tensorswapProgram",
      ignoreIfOptional: true,
      defaultValue: c.publicKeyValueNode(
        "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
        "tensorswapProgram",
      ),
    },
    // Legacy
    {
      account: "tokenMetadataProgram",
      defaultValue: c.resolverValueNode(
        "resolveTokenMetadataProgramFromTokenStandard",
        {
          dependsOn: [c.argumentValueNode("tokenStandard")],
        },
      ),
    },
    {
      account: "authorizationRulesProgram",
      defaultValue: c.resolverValueNode(
        "resolveAuthorizationRulesProgramFromTokenStandard",
        {
          dependsOn: [c.argumentValueNode("tokenStandard")],
        },
      ),
    },
    {
      account: "sysvarInstructions",
      defaultValue: c.resolverValueNode(
        "resolveSysvarInstructionsFromTokenStandard",
        {
          dependsOn: [c.argumentValueNode("tokenStandard")],
        },
      ),
    },
    // WNS
    {
      account: "wnsProgram",
      ignoreIfOptional: true,
      defaultValue: c.publicKeyValueNode(
        "wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM",
        "wnsProgram",
      ),
    },
    {
      account: "distributionProgram",
      ignoreIfOptional: true,
      defaultValue: c.publicKeyValueNode(
        "diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay",
        "distributionProgram",
      ),
    },
    // Compressed
    {
      account: "logWrapper",
      ignoreIfOptional: true,
      defaultValue: c.publicKeyValueNode(
        "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
        "logWrapper",
      ),
    },
    {
      account: "compressionProgram",
      ignoreIfOptional: true,
      defaultValue: c.publicKeyValueNode(
        "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK",
        "compressionProgram",
      ),
    },
    {
      account: "bubblegumProgram",
      ignoreIfOptional: true,
      defaultValue: c.publicKeyValueNode(
        "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
        "bubblegumProgram",
      ),
    },
    {
      account: "tcompProgram",
      ignoreIfOptional: true,
      defaultValue: c.programIdValueNode(),
    },
    // MPL Core
    {
      account: "mplCoreProgram",
      ignoreIfOptional: true,
      defaultValue: c.programIdValueNode(
        "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
      ),
    },
  ]),
);

// Update accounts.
codama.update(
  c.updateAccountsVisitor({
    listState: {
      seeds: [
        c.constantPdaSeedNodeFromString("utf8", "list_state"),
        c.variablePdaSeedNode("mint", c.publicKeyTypeNode()),
      ],
    },
    assetListState: {
      seeds: [
        c.constantPdaSeedNodeFromString("utf8", "list_state"),
        c.variablePdaSeedNode("asset", c.publicKeyTypeNode()),
      ],
    },
    bidState: {
      seeds: [
        c.constantPdaSeedNodeFromString("utf8", "bid_state"),
        c.variablePdaSeedNode("owner", c.publicKeyTypeNode()),
        c.variablePdaSeedNode("bidId", c.publicKeyTypeNode()),
      ],
    },
    bidTa: {
      seeds: [
        c.constantPdaSeedNodeFromString("utf8", "nft_escrow"),
        c.variablePdaSeedNode("mint", c.publicKeyTypeNode()),
      ],
    },
  }),
);

// Update instructions.
codama.update(
  c.updateInstructionsVisitor({
    // set cosigner to be an optional signer
    buyLegacy: {
      accounts: {
        cosigner: {
          isOptional: true,
          isSigner: true,
        },
      },
    },
    buy: {
      accounts: {
        cosigner: {
          isOptional: true,
          isSigner: true,
        },
      },
    },
    list: {
      accounts: {
        cosigner: {
          isOptional: true,
          isSigner: true,
        },
      },
    },
    buySpl: {
      accounts: {
        cosigner: {
          isOptional: true,
          isSigner: true,
        },
      },
    },
    buyCore: {
      accounts: {
        cosigner: {
          isOptional: true,
          isSigner: true,
        },
      },
    },
    buyWns: {
      accounts: {
        cosigner: {
          isOptional: true,
          isSigner: true,
        },
      },
    },
    // Shared instructions.
    bid: {
      accounts: {
        rentPayer: {
          defaultValue: c.accountValueNode("owner"),
        },
        sharedEscrow: {
          defaultValue: c.accountValueNode("owner"),
        },
        bidState: {
          defaultValue: c.pdaValueNode("bidState"),
        },
      },
      arguments: {
        bidId: {
          defaultValue: c.resolverValueNode("resolveBidIdOnCreate"),
          dependsOn: [
            c.argumentValueNode("target"),
            c.argumentValueNode("targetId"),
          ],
        },
      },
    },
    cancelBid: {
      accounts: {
        rentDestination: {
          defaultValue: c.accountValueNode("owner"),
        },
        bidState: {
          defaultValue: c.pdaValueNode("bidState", [
            c.pdaSeedValueNode("bidId", c.argumentValueNode("bidId")),
          ]),
        },
      },
      arguments: {
        bidId: {
          type: c.publicKeyTypeNode(),
          defaultValue: c.publicKeyValueNode(
            "11111111111111111111111111111111",
          ),
          isRequired: true,
        },
      },
    },
    closeExpiredBid: {
      accounts: {
        rentDestination: {
          defaultValue: c.accountValueNode("owner"),
        },
        bidState: {
          defaultValue: c.pdaValueNode("bidState", [
            c.pdaSeedValueNode("bidId", c.argumentValueNode("bidId")),
          ]),
        },
      },
      arguments: {
        bidId: {
          type: c.publicKeyTypeNode(),
          defaultValue: c.publicKeyValueNode(
            "11111111111111111111111111111111",
          ),
        },
      },
    },
  }),
);

// Update instructions using additional visitors.
codama.update(legacyInstructions());
codama.update(compressedInstructions());
codama.update(token22Instructions());
codama.update(wnsInstructions());
codama.update(coreInstructions());

// Set struct default values.
codama.update(
  c.bottomUpTransformerVisitor([
    {
      select: (node) => {
        const names = [
          "expireInSec",
          "currency",
          "privateTaker",
          "makerBroker",
          "authorizationData",
          "optionalRoyaltyPct",
          "field",
          "fieldId",
        ];
        return (
          c.isNode(node, ["instructionNode", "instructionArgumentNode"]) &&
          c.isNode(node.type, "optionTypeNode") &&
          names.includes(node.name)
        );
      },
      transform: (node) => {
        c.assertIsNode(node, ["instructionNode", "instructionArgumentNode"]);
        // prevents overriding existing default values (e.g. optionalRoyaltyPct for cNFTs)
        if (!!node.defaultValue) return node;
        return {
          ...node,
          defaultValueStrategy: "optional",
          defaultValue: c.noneValueNode(),
        };
      },
    },
    {
      select: "[structFieldTypeNode|instructionArgumentNode]quantity",
      transform: (node) => {
        c.assertIsNode(node, [
          "structFieldTypeNode",
          "instructionArgumentNode",
        ]);
        return {
          ...node,
          defaultValue: c.numberValueNode(1),
        };
      },
    },
    {
      select: "[structFieldTypeNode|instructionArgumentNode]rulesAccPresent",
      transform: (node) => {
        c.assertIsNode(node, [
          "structFieldTypeNode",
          "instructionArgumentNode",
        ]);
        return {
          ...node,
          defaultValue: c.booleanValueNode(false),
        };
      },
    },
  ]),
);

// Add missing types from the IDL.
codama.update(
  c.bottomUpTransformerVisitor([
    {
      select: "[structTypeNode].[structFieldTypeNode]rentPayer",
      transform: (node) => {
        c.assertIsNode(node, "structFieldTypeNode");
        return {
          ...node,
          type: c.definedTypeLinkNode("nullableAddress", "hooked"),
        };
      },
    },
    {
      select: "[structTypeNode].[structFieldTypeNode]cosigner",
      transform: (node) => {
        c.assertIsNode(node, "structFieldTypeNode");
        return {
          ...node,
          type: c.definedTypeLinkNode("nullableAddress", "hooked"),
        };
      },
    },
  ]),
);

// Overwrite tokenProgram's defaultValue for all T22 ixs
codama.update(
  c.bottomUpTransformerVisitor([
    {
      select: (node) => {
        const names = [
          "buyT22",
          "buyT22Spl",
          "closeExpiredListingT22",
          "delistT22",
          "listT22",
          "takeBidT22",
        ];
        return (
          c.isNode(node, "instructionNode") && names.includes(node.name)
        );
      },
      transform: (node) => {
        c.assertIsNode(node, "instructionNode");
        return {
          ...node,
          accounts: node.accounts.map(account => 
            account.name === "tokenProgram" 
              ? {
                  ...account,
                  defaultValue: c.publicKeyValueNode(
                    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                    "tokenProgram"
                  )
                }
              : account
          )
        };
      },
    },
  ]),
);

// Overwrite tokenProgram's defaultValue for all T22 ixs
codama.update(
  c.bottomUpTransformerVisitor([
    {
      select: (node) => {
        const names = [
          "buyT22",
          "buyT22Spl",
          "closeExpiredListingT22",
          "delistT22",
          "listT22",
          "takeBidT22",
        ];
        return (
          c.isNode(node, "instructionNode") && names.includes(node.name)
        );
      },
      transform: (node) => {
        c.assertIsNode(node, "instructionNode");
        return {
          ...node,
          accounts: node.accounts.map(account => 
            account.name === "tokenProgram" 
              ? {
                  ...account,
                  defaultValue: c.publicKeyValueNode(
                    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
                    "tokenProgram"
                  )
                }
              : account
          )
        };
      },
    },
  ]),
);

// Render JavaScript.
const jsClient = path.join(__dirname, "..", "clients", "js");
codama.accept(
  renderJavaScriptVisitor(path.join(jsClient, "src", "generated"), {
    prettier: require(path.join(jsClient, ".prettierrc.json")),
    linkOverrides: {
      resolvers: {
        resolveTreeAuthorityPda: '@tensor-foundation/resolvers',
        resolveTokenMetadataProgramFromTokenStandard: '@tensor-foundation/resolvers',
        resolveAuthorizationRulesProgramFromTokenStandard: '@tensor-foundation/resolvers',
        resolveSysvarInstructionsFromTokenStandard: '@tensor-foundation/resolvers',
        resolveFeeVaultPdaFromListState: '@tensor-foundation/resolvers',
        resolveBuyerAta: '@tensor-foundation/resolvers',
        resolveListAta: '@tensor-foundation/resolvers',
        resolveOwnerAta: '@tensor-foundation/resolvers',
        resolveSellerAta: '@tensor-foundation/resolvers',
        resolveMetadata: '@tensor-foundation/resolvers',
        resolveFeeVaultCurrencyAta: '@tensor-foundation/resolvers',
        resolveOwnerCurrencyAta: '@tensor-foundation/resolvers',
        resolvePayerCurrencyAta: '@tensor-foundation/resolvers',
        resolveMakerBrokerCurrencyAta: '@tensor-foundation/resolvers',
        resolveTakerBrokerCurrencyAta: '@tensor-foundation/resolvers',
        resolveCreatorsCurrencyAta: '@tensor-foundation/resolvers',
        resolveBrokersCurrencyAta: '@tensor-foundation/resolvers',
        resolveDistributionCurrencyAta: '@tensor-foundation/resolvers',
        resolveWnsApprovePda: '@tensor-foundation/resolvers',
        resolveWnsDistributionPda: '@tensor-foundation/resolvers',
        resolveWnsExtraAccountMetasPda: '@tensor-foundation/resolvers',
        resolveFeeVaultPdaFromBidState: '@tensor-foundation/resolvers',
        resolveBidTokenRecordFromTokenStandard: '@tensor-foundation/resolvers',
        resolveListTokenRecordFromTokenStandard: '@tensor-foundation/resolvers',
        resolveOwnerTokenRecordFromTokenStandard: '@tensor-foundation/resolvers',
        resolveSellerTokenRecordFromTokenStandard: '@tensor-foundation/resolvers',
        resolveBuyerTokenRecordFromTokenStandard: '@tensor-foundation/resolvers',
        resolveEditionFromTokenStandard: '@tensor-foundation/resolvers',
        resolveDistributionCurrencyAta: '@tensor-foundation/resolvers',
      },
      definedTypes: {
        tokenStandard: '@tensor-foundation/mpl-token-metadata',
        nullableAddress: '../../hooked',
      }
    },
    asyncResolvers: [
      "resolveBidStateFromBidId",
      "resolveFeeVaultPdaFromListState",
      "resolveFeeVaultPdaFromBidState",
      "resolveFeeVaultCurrencyAta",
      "resolveOwnerCurrencyAta",
      "resolvePayerCurrencyAta",
      "resolveDistributionCurrencyAta",
      "resolveMakerBrokerCurrencyAta",
      "resolveTakerBrokerCurrencyAta",
      "resolveBuyerAta",
      "resolveListAta",
      "resolveOwnerAta",
      "resolveSellerAta",
      "resolveBuyerTokenRecordFromTokenStandard",
      "resolveListTokenRecordFromTokenStandard",
      "resolveOwnerTokenRecordFromTokenStandard",
      "resolveSellerTokenRecordFromTokenStandard",
      "resolveBidTokenRecordFromTokenStandard",
      "resolveMetadata",
      "resolveEditionFromTokenStandard",
      "resolveWnsApprovePda",
      "resolveWnsDistributionPda",
      "resolveWnsExtraAccountMetasPda",
      "resolveTreeAuthorityPda",
      "resolveBidIdOnCreate",
      "resolveCreatorsCurrencyAta",
      "resolveBrokersCurrencyAta",
    ],
    dependencyMap: {
      resolvers: "@tensor-foundation/resolvers",
    },
  }),
);

// Render Rust.
const rustClient = path.join(__dirname, "..", "clients", "rust");
codama.accept(
  renderRustVisitor(path.join(rustClient, "src", "generated"), {
    formatCode: true,
    crateFolder: rustClient,
    linkOverrides: {
      definedTypes: {
        nullableAddress: 'crate::hooked',
      }
    }
  }),
);
