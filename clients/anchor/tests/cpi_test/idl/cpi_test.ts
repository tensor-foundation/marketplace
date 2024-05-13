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
          "name": "listState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketplaceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
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
        },
        {
          "name": "makerBroker",
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
          "name": "listState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "marketplaceProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
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
        },
        {
          "name": "makerBroker",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    }
  ]
};
