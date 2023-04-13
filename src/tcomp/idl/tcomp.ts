export type Tcomp = {
  "version": "0.1.0",
  "name": "tcomp",
  "instructions": [
    {
      "name": "executeBuy",
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
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        }
      ]
    }
  ]
};

export const IDL: Tcomp = {
  "version": "0.1.0",
  "name": "tcomp",
  "instructions": [
    {
      "name": "executeBuy",
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
          "name": "nonce",
          "type": "u64"
        },
        {
          "name": "index",
          "type": "u32"
        }
      ]
    }
  ]
};
