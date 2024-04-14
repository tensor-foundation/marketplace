const path = require("path");

const targetDir = path.join(__dirname, "..", "target");

function getBinaryFile(programBinary) {
  return path.join(targetDir, "deploy", programBinary);
}

module.exports = {
  validator: {
    commitment: "processed",
    accountsCluster: "https://api.mainnet-beta.solana.com/",
    programs: [
      {
        label: "Marketplace",
        programId: "TCMPhJdwDryooaGtiocG1u3xcYbRpiJzb283XfCZsDp",
        deployPath: getBinaryFile("marketplace_program.so"),
      },
      {
        label: "Marketplace CPI Test",
        programId: "5zABSn1WYLHYenFtTFcM5AHdJjnHkx6S85rkWkFzLExq",
        deployPath: getBinaryFile("cpitest.so"),
      },
      {
        label: "Metaplex Token Auth Rules",
        programId: "auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg",
        deployPath: getBinaryFile("auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg.so"),
      },
      {
        label: "Metaplex Bubblegum",
        programId: "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY",
        deployPath: getBinaryFile("BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY.so"),
      },
      {
        label: "Metaplex Token Metadata",
        programId: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
        deployPath: getBinaryFile("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s.so"),
      },
      {
        label: "SPL State Compression",
        programId: "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK",
        deployPath: getBinaryFile("cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK.so"),
      },
      {
        label: "SPL Noop",
        programId: "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV",
        deployPath: getBinaryFile("noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV.so"),
      },
      {
        label: "Tensor Escrow",
        programId: "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN",
        deployPath: getBinaryFile("TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN.so"),
      },
      {
        label: "Tensor List",
        programId: "TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW",
        deployPath: getBinaryFile("TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW.so"),
      },
      {
        label: "SPL Token Extensions (Token-2022)",
        programId: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
        deployPath: getBinaryFile("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb.so"),
      },
      {
        label: "WNS",
        programId: "wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM",
        deployPath: getBinaryFile("wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM.so"),
      },
      {
        label: "WNS Distribution",
        programId: "diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay",
        deployPath: getBinaryFile("diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay.so"),
      },
      {
        label: "Metaplex Core",
        programId: "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d",
        deployPath: getBinaryFile("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d.so"),
      },
    ],
    accounts: [
      {
        label: "WNS Authority",
        accountId: "9SUrE3EPBoXVjNywEDHSJKJdxebs8H8sLgEWdueEvnKX",
        deployPath: getBinaryFile("9SUrE3EPBoXVjNywEDHSJKJdxebs8H8sLgEWdueEvnKX.bin"),
        executable: false,
      },
    ],
  },
};
