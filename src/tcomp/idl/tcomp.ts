export type Tcomp = {
  "version": "0.1.0",
  "name": "tcomp",
  "constants": [
    {
      "name": "CURRENT_TCOMP_VERSION",
      "type": "u8",
      "value": "1"
    },
    {
      "name": "FEE_BPS",
      "type": "u16",
      "value": "169"
    },
    {
      "name": "MAX_EXPIRY_SEC",
      "type": "i64",
      "value": "5184000"
    },
    {
      "name": "HUNDRED_PCT_BPS",
      "type": "u16",
      "value": "10000"
    },
    {
      "name": "TAKER_BROKER_PCT",
      "type": "u16",
      "value": "0"
    },
    {
      "name": "LIST_STATE_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 1 + (32 * 2) + 8 + 33 + 8 + 33 + 128"
    },
    {
      "name": "BID_STATE_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 1 + (32 * 2) + 8 + 33 + 8 + 33 + 33 + 128"
    }
  ],
  "instructions": [
    {
      "name": "tcompNoop",
      "accounts": [
        {
          "name": "tcomp",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "event",
          "type": {
            "defined": "TcompEvent"
          }
        }
      ]
    },
    {
      "name": "buy",
      "accounts": [
        {
          "name": "tcomp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treeAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tcompProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "listState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "takerBroker",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "dataHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "creatorShares",
          "type": "bytes"
        },
        {
          "name": "creatorVerified",
          "type": {
            "vec": "bool"
          }
        },
        {
          "name": "sellerFeeBasisPoints",
          "type": "u16"
        },
        {
          "name": "maxAmount",
          "type": "u64"
        },
        {
          "name": "currency",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "optionalRoyaltyPct",
          "type": {
            "option": "u16"
          }
        }
      ]
    },
    {
      "name": "list",
      "accounts": [
        {
          "name": "treeAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "delegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tcompProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "listState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "dataHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "creatorHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "expireInSec",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "currency",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "privateTaker",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "delist",
      "accounts": [
        {
          "name": "treeAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "listState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "dataHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "creatorHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "edit",
      "accounts": [
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "merkleTree",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "listState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tcompProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "expireInSec",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "currency",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "privateTaker",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "listState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "assetId",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "expiry",
            "type": "i64"
          },
          {
            "name": "privateTaker",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "bidState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "assetId",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "expiry",
            "type": "i64"
          },
          {
            "name": "privateTaker",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "margin",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TUses",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "useMethod",
            "type": {
              "defined": "TUseMethod"
            }
          },
          {
            "name": "remaining",
            "type": "u64"
          },
          {
            "name": "total",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "TCollection",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "verified",
            "type": "bool"
          },
          {
            "name": "key",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "TMetadataArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "docs": [
              "The name of the asset"
            ],
            "type": "string"
          },
          {
            "name": "symbol",
            "docs": [
              "The symbol for the asset"
            ],
            "type": "string"
          },
          {
            "name": "uri",
            "docs": [
              "URI pointing to JSON representing the asset"
            ],
            "type": "string"
          },
          {
            "name": "sellerFeeBasisPoints",
            "docs": [
              "Royalty basis points that goes to creators in secondary sales (0-10000)"
            ],
            "type": "u16"
          },
          {
            "name": "primarySaleHappened",
            "type": "bool"
          },
          {
            "name": "isMutable",
            "type": "bool"
          },
          {
            "name": "editionNonce",
            "docs": [
              "nonce for easy calculation of editions, if present"
            ],
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "tokenStandard",
            "docs": [
              "Since we cannot easily change Metadata, we add the new DataV2 fields here at the end."
            ],
            "type": {
              "option": {
                "defined": "TTokenStandard"
              }
            }
          },
          {
            "name": "collection",
            "docs": [
              "Collection"
            ],
            "type": {
              "option": {
                "defined": "TCollection"
              }
            }
          },
          {
            "name": "uses",
            "docs": [
              "Uses"
            ],
            "type": {
              "option": {
                "defined": "TUses"
              }
            }
          },
          {
            "name": "tokenProgramVersion",
            "type": {
              "defined": "TTokenProgramVersion"
            }
          },
          {
            "name": "creatorShares",
            "type": "bytes"
          },
          {
            "name": "creatorVerified",
            "type": {
              "vec": "bool"
            }
          }
        ]
      }
    },
    {
      "name": "MakeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maker",
            "type": "publicKey"
          },
          {
            "name": "assetId",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "expiry",
            "type": "i64"
          },
          {
            "name": "privateTaker",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "TakeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "taker",
            "type": "publicKey"
          },
          {
            "name": "assetId",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tcompFee",
            "type": "u64"
          },
          {
            "name": "brokerFee",
            "type": "u64"
          },
          {
            "name": "creatorFee",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "TTokenProgramVersion",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Original"
          },
          {
            "name": "Token2022"
          }
        ]
      }
    },
    {
      "name": "TTokenStandard",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "NonFungible"
          },
          {
            "name": "FungibleAsset"
          },
          {
            "name": "Fungible"
          },
          {
            "name": "NonFungibleEdition"
          }
        ]
      }
    },
    {
      "name": "TUseMethod",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Burn"
          },
          {
            "name": "Multiple"
          },
          {
            "name": "Single"
          }
        ]
      }
    },
    {
      "name": "TcompEvent",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Maker",
            "fields": [
              {
                "defined": "MakeEvent"
              }
            ]
          },
          {
            "name": "Taker",
            "fields": [
              {
                "defined": "TakeEvent"
              }
            ]
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ArithmeticError",
      "msg": "arithmetic error"
    },
    {
      "code": 6001,
      "name": "ExpiryTooLarge",
      "msg": "expiry too large"
    },
    {
      "code": 6002,
      "name": "BadOwner",
      "msg": "bad owner"
    },
    {
      "code": 6003,
      "name": "BadListState",
      "msg": "bad list state"
    },
    {
      "code": 6004,
      "name": "BadRoyaltiesPct",
      "msg": "royalties pct must be between 0 and 100"
    },
    {
      "code": 6005,
      "name": "PriceMismatch",
      "msg": "price mismatch"
    },
    {
      "code": 6006,
      "name": "CreatorMismatch",
      "msg": "creator mismatch"
    },
    {
      "code": 6007,
      "name": "InsufficientBalance",
      "msg": "insufficient balance"
    },
    {
      "code": 6008,
      "name": "FailedLeafVerification",
      "msg": "failed leaf verification"
    },
    {
      "code": 6009,
      "name": "OfferExpired",
      "msg": "offer has expired"
    },
    {
      "code": 6010,
      "name": "TakerNotAllowed",
      "msg": "taker not allowed"
    }
  ]
};

export const IDL: Tcomp = {
  "version": "0.1.0",
  "name": "tcomp",
  "constants": [
    {
      "name": "CURRENT_TCOMP_VERSION",
      "type": "u8",
      "value": "1"
    },
    {
      "name": "FEE_BPS",
      "type": "u16",
      "value": "169"
    },
    {
      "name": "MAX_EXPIRY_SEC",
      "type": "i64",
      "value": "5184000"
    },
    {
      "name": "HUNDRED_PCT_BPS",
      "type": "u16",
      "value": "10000"
    },
    {
      "name": "TAKER_BROKER_PCT",
      "type": "u16",
      "value": "0"
    },
    {
      "name": "LIST_STATE_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 1 + (32 * 2) + 8 + 33 + 8 + 33 + 128"
    },
    {
      "name": "BID_STATE_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 1 + (32 * 2) + 8 + 33 + 8 + 33 + 33 + 128"
    }
  ],
  "instructions": [
    {
      "name": "tcompNoop",
      "accounts": [
        {
          "name": "tcomp",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "event",
          "type": {
            "defined": "TcompEvent"
          }
        }
      ]
    },
    {
      "name": "buy",
      "accounts": [
        {
          "name": "tcomp",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treeAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyer",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tcompProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "listState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "takerBroker",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "dataHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "creatorShares",
          "type": "bytes"
        },
        {
          "name": "creatorVerified",
          "type": {
            "vec": "bool"
          }
        },
        {
          "name": "sellerFeeBasisPoints",
          "type": "u16"
        },
        {
          "name": "maxAmount",
          "type": "u64"
        },
        {
          "name": "currency",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "optionalRoyaltyPct",
          "type": {
            "option": "u16"
          }
        }
      ]
    },
    {
      "name": "list",
      "accounts": [
        {
          "name": "treeAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "delegate",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tcompProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "listState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "dataHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "creatorHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "expireInSec",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "currency",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "privateTaker",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "delist",
      "accounts": [
        {
          "name": "treeAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "merkleTree",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "logWrapper",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "compressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "bubblegumProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "listState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "dataHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "creatorHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "edit",
      "accounts": [
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "merkleTree",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "listState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tcompProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "expireInSec",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "currency",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "privateTaker",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "listState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "assetId",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "expiry",
            "type": "i64"
          },
          {
            "name": "privateTaker",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    },
    {
      "name": "bidState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "assetId",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "expiry",
            "type": "i64"
          },
          {
            "name": "privateTaker",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "margin",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                128
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TUses",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "useMethod",
            "type": {
              "defined": "TUseMethod"
            }
          },
          {
            "name": "remaining",
            "type": "u64"
          },
          {
            "name": "total",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "TCollection",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "verified",
            "type": "bool"
          },
          {
            "name": "key",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "TMetadataArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "docs": [
              "The name of the asset"
            ],
            "type": "string"
          },
          {
            "name": "symbol",
            "docs": [
              "The symbol for the asset"
            ],
            "type": "string"
          },
          {
            "name": "uri",
            "docs": [
              "URI pointing to JSON representing the asset"
            ],
            "type": "string"
          },
          {
            "name": "sellerFeeBasisPoints",
            "docs": [
              "Royalty basis points that goes to creators in secondary sales (0-10000)"
            ],
            "type": "u16"
          },
          {
            "name": "primarySaleHappened",
            "type": "bool"
          },
          {
            "name": "isMutable",
            "type": "bool"
          },
          {
            "name": "editionNonce",
            "docs": [
              "nonce for easy calculation of editions, if present"
            ],
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "tokenStandard",
            "docs": [
              "Since we cannot easily change Metadata, we add the new DataV2 fields here at the end."
            ],
            "type": {
              "option": {
                "defined": "TTokenStandard"
              }
            }
          },
          {
            "name": "collection",
            "docs": [
              "Collection"
            ],
            "type": {
              "option": {
                "defined": "TCollection"
              }
            }
          },
          {
            "name": "uses",
            "docs": [
              "Uses"
            ],
            "type": {
              "option": {
                "defined": "TUses"
              }
            }
          },
          {
            "name": "tokenProgramVersion",
            "type": {
              "defined": "TTokenProgramVersion"
            }
          },
          {
            "name": "creatorShares",
            "type": "bytes"
          },
          {
            "name": "creatorVerified",
            "type": {
              "vec": "bool"
            }
          }
        ]
      }
    },
    {
      "name": "MakeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "maker",
            "type": "publicKey"
          },
          {
            "name": "assetId",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "expiry",
            "type": "i64"
          },
          {
            "name": "privateTaker",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "TakeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "taker",
            "type": "publicKey"
          },
          {
            "name": "assetId",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tcompFee",
            "type": "u64"
          },
          {
            "name": "brokerFee",
            "type": "u64"
          },
          {
            "name": "creatorFee",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": {
              "option": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "TTokenProgramVersion",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Original"
          },
          {
            "name": "Token2022"
          }
        ]
      }
    },
    {
      "name": "TTokenStandard",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "NonFungible"
          },
          {
            "name": "FungibleAsset"
          },
          {
            "name": "Fungible"
          },
          {
            "name": "NonFungibleEdition"
          }
        ]
      }
    },
    {
      "name": "TUseMethod",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Burn"
          },
          {
            "name": "Multiple"
          },
          {
            "name": "Single"
          }
        ]
      }
    },
    {
      "name": "TcompEvent",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Maker",
            "fields": [
              {
                "defined": "MakeEvent"
              }
            ]
          },
          {
            "name": "Taker",
            "fields": [
              {
                "defined": "TakeEvent"
              }
            ]
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ArithmeticError",
      "msg": "arithmetic error"
    },
    {
      "code": 6001,
      "name": "ExpiryTooLarge",
      "msg": "expiry too large"
    },
    {
      "code": 6002,
      "name": "BadOwner",
      "msg": "bad owner"
    },
    {
      "code": 6003,
      "name": "BadListState",
      "msg": "bad list state"
    },
    {
      "code": 6004,
      "name": "BadRoyaltiesPct",
      "msg": "royalties pct must be between 0 and 100"
    },
    {
      "code": 6005,
      "name": "PriceMismatch",
      "msg": "price mismatch"
    },
    {
      "code": 6006,
      "name": "CreatorMismatch",
      "msg": "creator mismatch"
    },
    {
      "code": 6007,
      "name": "InsufficientBalance",
      "msg": "insufficient balance"
    },
    {
      "code": 6008,
      "name": "FailedLeafVerification",
      "msg": "failed leaf verification"
    },
    {
      "code": 6009,
      "name": "OfferExpired",
      "msg": "offer has expired"
    },
    {
      "code": 6010,
      "name": "TakerNotAllowed",
      "msg": "taker not allowed"
    }
  ]
};
