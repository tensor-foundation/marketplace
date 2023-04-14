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
      "name": "TAKER_BROKER_PCT",
      "type": "u16",
      "value": "0"
    },
    {
      "name": "LIST_STATE_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 1 + (32 * 2) + 8 + 33 + 8 + 33 + 64"
    },
    {
      "name": "BID_STATE_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 1 + (32 * 2) + 8 + 33 + 8 + 33 + 33 + 64"
    }
  ],
  "instructions": [
    {
      "name": "buy",
      "accounts": [
        {
          "name": "treeAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leafOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "leafDelegate",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newLeafOwner",
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
          "name": "bubblegum",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
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
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "metadata",
          "type": {
            "defined": "MetadataArgs"
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
                64
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
                64
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Uses",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "useMethod",
            "type": {
              "defined": "UseMethod"
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
      "name": "Collection",
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
      "name": "MetadataArgs",
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
                "defined": "TokenStandard"
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
                "defined": "Collection"
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
                "defined": "Uses"
              }
            }
          },
          {
            "name": "tokenProgramVersion",
            "type": {
              "defined": "TokenProgramVersion"
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
      "name": "TokenProgramVersion",
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
      "name": "TokenStandard",
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
      "name": "UseMethod",
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
    }
  ],
  "events": [
    {
      "name": "MakeEvent",
      "fields": [
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "assetId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "currency",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "expiry",
          "type": "i64",
          "index": false
        },
        {
          "name": "privateTaker",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TakeEvent",
      "fields": [
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "assetId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "tcompFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "creatorsFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "currency",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "expiry",
          "type": "i64",
          "index": false
        },
        {
          "name": "privateTaker",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ArithmeticError",
      "msg": "arithmetic error"
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
      "name": "TAKER_BROKER_PCT",
      "type": "u16",
      "value": "0"
    },
    {
      "name": "LIST_STATE_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 1 + (32 * 2) + 8 + 33 + 8 + 33 + 64"
    },
    {
      "name": "BID_STATE_SIZE",
      "type": {
        "defined": "usize"
      },
      "value": "8 + 1 + 1 + (32 * 2) + 8 + 33 + 8 + 33 + 33 + 64"
    }
  ],
  "instructions": [
    {
      "name": "buy",
      "accounts": [
        {
          "name": "treeAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "leafOwner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "leafDelegate",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newLeafOwner",
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
          "name": "bubblegum",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
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
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        },
        {
          "name": "metadata",
          "type": {
            "defined": "MetadataArgs"
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
                64
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
                64
              ]
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "Uses",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "useMethod",
            "type": {
              "defined": "UseMethod"
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
      "name": "Collection",
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
      "name": "MetadataArgs",
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
                "defined": "TokenStandard"
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
                "defined": "Collection"
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
                "defined": "Uses"
              }
            }
          },
          {
            "name": "tokenProgramVersion",
            "type": {
              "defined": "TokenProgramVersion"
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
      "name": "TokenProgramVersion",
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
      "name": "TokenStandard",
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
      "name": "UseMethod",
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
    }
  ],
  "events": [
    {
      "name": "MakeEvent",
      "fields": [
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "assetId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "currency",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "expiry",
          "type": "i64",
          "index": false
        },
        {
          "name": "privateTaker",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "TakeEvent",
      "fields": [
        {
          "name": "owner",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "assetId",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "tcompFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "creatorsFee",
          "type": "u64",
          "index": false
        },
        {
          "name": "currency",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "expiry",
          "type": "i64",
          "index": false
        },
        {
          "name": "privateTaker",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "ArithmeticError",
      "msg": "arithmetic error"
    }
  ]
};
