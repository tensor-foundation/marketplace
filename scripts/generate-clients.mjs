#!/usr/bin/env zx
import "zx/globals";
import * as k from "kinobi";
import { rootNodeFromAnchor } from "@kinobi-so/nodes-from-anchor";
import { renderVisitor as renderJavaScriptVisitor } from "@kinobi-so/renderers-js";
import { renderVisitor as renderRustVisitor } from "@kinobi-so/renderers-rust";
import { getAllProgramIdls } from "./utils.mjs";

// Instanciate Kinobi.
const [idl] = getAllProgramIdls()
  .filter((idl) => idl.includes("program/idl.json"))
  .map((idl) => rootNodeFromAnchor(require(idl)));
const kinobi = k.createFromRoot(idl);

// Additional visitors for instrunctions.
const legacyInstructions = require("./kinobi/legacy-instructions.cjs");
const compressedInstructions = require("./kinobi/compressed-instructions.cjs");
const token22Instructions = require("./kinobi/token22-instructions.cjs");
const wnsInstructions = require("./kinobi/wns-instructions.cjs");
const coreInstructions = require("./kinobi/core-instructions.cjs");

// Update programs.
kinobi.update(
  new k.updateProgramsVisitor({
    marketplaceProgram: { name: "tensorMarketplace" },
  }),
);

// Set default account values accross multiple instructions.
kinobi.update(
  k.setInstructionAccountDefaultValuesVisitor([
    {
      account: "treeAuthority",
      ignoreIfOptional: true,
      defaultValue: k.resolverValueNode("resolveTreeAuthorityPda", {
        dependsOn: [
          k.accountValueNode("merkleTree"),
          k.accountValueNode("bubblegumProgram"),
        ],
      }),
    },
    // default programs
    {
      account: "marketplaceProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
        "marketplaceProgram",
      ),
    },
    {
      account: "escrowProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
        "escrowProgram",
      ),
    },
    {
      account: "systemProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "11111111111111111111111111111111",
        "systemProgram",
      ),
    },
    {
      account: "tokenProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        "tokenProgram",
      ),
    },
    {
      account: "associatedTokenProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
        "associatedTokenProgram",
      ),
    },
    {
      account: "tensorswapProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
        "tensorswapProgram",
      ),
    },
    // Legacy
    {
      account: "tokenMetadataProgram",
      defaultValue: k.resolverValueNode(
        "resolveTokenMetadataProgramFromTokenStandard",
        {
          importFrom: "resolvers",
          dependsOn: [k.argumentValueNode("tokenStandard")],
        },
      ),
    },
    {
      account: "authorizationRulesProgram",
      defaultValue: k.resolverValueNode(
        "resolveAuthorizationRulesProgramFromTokenStandard",
        {
          importFrom: "resolvers",
          dependsOn: [k.argumentValueNode("tokenStandard")],
        },
      ),
    },
    {
      account: "sysvarInstructions",
      defaultValue: k.resolverValueNode(
        "resolveSysvarInstructionsFromTokenStandard",
        {
          importFrom: "resolvers",
          dependsOn: [k.argumentValueNode("tokenStandard")],
        },
      ),
    },
    // WNS
    {
      account: "wnsProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM",
        "wnsProgram",
      ),
    },
    {
      account: "distributionProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay",
        "distributionProgram",
      ),
    },
    // Compressed
    {
      account: "logWrapper",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
        "logWrapper",
      ),
    },
    {
      account: "compressionProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK",
        "compressionProgram",
      ),
    },
    {
      account: "bubblegumProgram",
      ignoreIfOptional: true,
      defaultValue: k.publicKeyValueNode(
        "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
        "bubblegumProgram",
      ),
    },
    {
      account: "tcompProgram",
      ignoreIfOptional: true,
      defaultValue: k.programIdValueNode(),
    },
    // MPL Core
    {
      account: "mplCoreProgram",
      ignoreIfOptional: true,
      defaultValue: k.programIdValueNode(
        "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
      ),
    },
  ]),
);

// Update accounts.
kinobi.update(
  k.updateAccountsVisitor({
    listState: {
      seeds: [
        k.constantPdaSeedNodeFromString("utf8", "list_state"),
        k.variablePdaSeedNode("mint", k.publicKeyTypeNode()),
      ],
    },
    assetListState: {
      seeds: [
        k.constantPdaSeedNodeFromString("utf8", "list_state"),
        k.variablePdaSeedNode("asset", k.publicKeyTypeNode()),
      ],
    },
    bidState: {
      seeds: [
        k.constantPdaSeedNodeFromString("utf8", "bid_state"),
        k.variablePdaSeedNode("owner", k.publicKeyTypeNode()),
        k.variablePdaSeedNode("bidId", k.publicKeyTypeNode()),
      ],
    },
    bidTa: {
      seeds: [
        k.constantPdaSeedNodeFromString("utf8", "nft_escrow"),
        k.variablePdaSeedNode("mint", k.publicKeyTypeNode()),
      ],
    },
  }),
);

// Update instructions.
kinobi.update(
  k.updateInstructionsVisitor({
    // Manually set cosigner to be true if it's passed in.
    buyLegacy: {
      accounts: {
        cosigner: {
          defaultValue: k.publicKeyValueNode(
            "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
          ),
          isSigner: true,
        },
      },
    },
    buy: {
      accounts: {
        cosigner: {
          defaultValue: k.publicKeyValueNode(
            "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
          ),
          isSigner: true,
        },
      },
    },
    list: {
      accounts: {
        cosigner: {
          defaultValue: k.publicKeyValueNode(
            "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
          ),
          isSigner: true,
        },
      },
    },
    buySpl: {
      accounts: {
        cosigner: {
          defaultValue: k.publicKeyValueNode(
            "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
          ),
          isSigner: true,
        },
      },
    },
    buyCore: {
      accounts: {
        cosigner: {
          defaultValue: k.publicKeyValueNode(
            "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
          ),
          isSigner: true,
        },
      },
    },
    buyWns: {
      accounts: {
        cosigner: {
          defaultValue: k.publicKeyValueNode(
            "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
          ),
          isSigner: true,
        },
      },
    },
    // Shared instructions.
    bid: {
      accounts: {
        rentPayer: {
          defaultValue: k.accountValueNode("owner"),
        },
        sharedEscrow: {
          defaultValue: k.accountValueNode("owner"),
        },
        bidState: {
          defaultValue: k.pdaValueNode("bidState"),
        },
      },
      arguments: {
        bidId: {
          defaultValue: k.resolverValueNode("resolveBidIdOnCreate"),
          dependsOn: [
            k.argumentValueNode("target"),
            k.argumentValueNode("targetId"),
          ],
        },
      },
    },
    cancelBid: {
      accounts: {
        rentDestination: {
          defaultValue: k.accountValueNode("owner"),
        },
        bidState: {
          defaultValue: k.pdaValueNode("bidState", [
            k.pdaSeedValueNode("bidId", k.argumentValueNode("bidId")),
          ]),
        },
      },
      arguments: {
        bidId: {
          type: k.publicKeyTypeNode(),
          defaultValue: k.publicKeyValueNode(
            "11111111111111111111111111111111",
          ),
          isRequired: true,
        },
      },
    },
    closeExpiredBid: {
      accounts: {
        rentDestination: {
          defaultValue: k.accountValueNode("owner"),
        },
        bidState: {
          defaultValue: k.pdaValueNode("bidState", [
            k.pdaSeedValueNode("bidId", k.argumentValueNode("bidId")),
          ]),
        },
      },
      arguments: {
        bidId: {
          type: k.publicKeyTypeNode(),
          defaultValue: k.publicKeyValueNode(
            "11111111111111111111111111111111",
          ),
        },
      },
    },
  }),
);

// Update instructions using additional visitors.
kinobi.update(legacyInstructions());
kinobi.update(compressedInstructions());
kinobi.update(token22Instructions());
kinobi.update(wnsInstructions());
kinobi.update(coreInstructions());

// Set struct default values.
kinobi.update(
  k.bottomUpTransformerVisitor([
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
          k.isNode(node, ["instructionNode", "instructionArgumentNode"]) &&
          k.isNode(node.type, "optionTypeNode") &&
          names.includes(node.name)
        );
      },
      transform: (node) => {
        k.assertIsNode(node, ["instructionNode", "instructionArgumentNode"]);
        // prevents overriding existing default values (e.g. optionalRoyaltyPct for cNFTs)
        if (!!node.defaultValue) return node;
        return {
          ...node,
          defaultValueStrategy: "optional",
          defaultValue: k.noneValueNode(),
        };
      },
    },
    {
      select: "[structFieldTypeNode|instructionArgumentNode]quantity",
      transform: (node) => {
        k.assertIsNode(node, [
          "structFieldTypeNode",
          "instructionArgumentNode",
        ]);
        return {
          ...node,
          defaultValue: k.numberValueNode(1),
        };
      },
    },
    {
      select: "[structFieldTypeNode|instructionArgumentNode]rulesAccPresent",
      transform: (node) => {
        k.assertIsNode(node, [
          "structFieldTypeNode",
          "instructionArgumentNode",
        ]);
        return {
          ...node,
          defaultValue: k.booleanValueNode(false),
        };
      },
    },
  ]),
);

// Add missing types from the IDL.
kinobi.update(
  k.bottomUpTransformerVisitor([
    {
      select: "[structTypeNode].[structFieldTypeNode]rentPayer",
      transform: (node) => {
        k.assertIsNode(node, "structFieldTypeNode");
        return {
          ...node,
          type: k.definedTypeLinkNode("nullableAddress", "hooked"),
        };
      },
    },
    {
      select: "[structTypeNode].[structFieldTypeNode]cosigner",
      transform: (node) => {
        k.assertIsNode(node, "structFieldTypeNode");
        return {
          ...node,
          type: k.definedTypeLinkNode("nullableAddress", "hooked"),
        };
      },
    },
  ]),
);

// Render JavaScript.
const jsClient = path.join(__dirname, "..", "clients", "js");
kinobi.accept(
  renderJavaScriptVisitor(path.join(jsClient, "src", "generated"), {
    prettier: require(path.join(jsClient, ".prettierrc.json")),
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
      "resolveBidTa",
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
    ],
    dependencyMap: {
      resolvers: "@tensor-foundation/resolvers",
    },
  }),
);

// Render Rust.
const rustClient = path.join(__dirname, "..", "clients", "rust");
kinobi.accept(
  renderRustVisitor(path.join(rustClient, "src", "generated"), {
    formatCode: true,
    crateFolder: rustClient,
  }),
);
