export type CpiTest = {
  "version": "0.1.0",
  "name": "cpi_test",
  "instructions": [
    {
      "name": "cpi",
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
  ]
};

export const IDL: CpiTest = {
  "version": "0.1.0",
  "name": "cpi_test",
  "instructions": [
    {
      "name": "cpi",
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
  ]
};
