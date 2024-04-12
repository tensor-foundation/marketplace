#!/bin/bash

EXTERNAL_ID=("auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg" "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY" "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK" "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV" "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN" "TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW" "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" "wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM" "diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay" "9SUrE3EPBoXVjNywEDHSJKJdxebs8H8sLgEWdueEvnKX" "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d")
EXTERNAL_SO=("auth9SigNpDKz4sJJ1DfCTuZrZNSAgh9sFD3rboVmgg.so" "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY.so" "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s.so" "cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK.so" "noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV.so" "TSWAPaqyCSx2KABk68Shruf4rp7CxcNi8hAsbdwmHbN.so" "TL1ST2iRBzuGTqLn1KXnGdSnEow62BzPnGiqyRXhWtW.so" "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb.so" "wns1gDLt8fgLcGhWi5MqAqgXpwEP1JftKE9eZnXS1HM.so" "diste3nXmK7ddDTs1zb6uday6j4etCa9RChD8fJ1xay.so" "9SUrE3EPBoXVjNywEDHSJKJdxebs8H8sLgEWdueEvnKX.bin" "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d.so")

# output colours
RED() { echo $'\e[1;31m'$1$'\e[0m'; }
GRN() { echo $'\e[1;32m'$1$'\e[0m'; }
YLW() { echo $'\e[1;33m'$1$'\e[0m'; }

CURRENT_DIR=$(pwd)
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
# go to parent folder
cd $(dirname $(dirname $SCRIPT_DIR))

OUTPUT=$1

if [ -z ${RPC+x} ]; then
    RPC="https://api.mainnet-beta.solana.com"
fi

if [ -z "$OUTPUT" ]; then
    echo "missing output directory"
    exit 1
fi

# creates the output directory if it doesn't exist
if [ ! -d ${OUTPUT} ]; then
    mkdir -p ${OUTPUT}
fi

# only prints this if we have external programs
if [ ${#EXTERNAL_ID[@]} -gt 0 ]; then
    echo "Dumping external accounts to '${OUTPUT}':"
fi

# copy external programs or accounts binaries from the chain
copy_from_chain() {
    ACCOUNT_TYPE=`echo $1 | cut -d. -f2`
    PREFIX=$2

    case "$ACCOUNT_TYPE" in
        "bin")
            solana account -u $RPC ${EXTERNAL_ID[$i]} -o ${OUTPUT}/$2$1 > /dev/null
            ;;
        "so")
            solana program dump -u $RPC ${EXTERNAL_ID[$i]} ${OUTPUT}/$2$1 > /dev/null
            ;;
        *)
            echo $(RED "[  ERROR  ] unknown account type for '$1'")
            exit 1
            ;;
    esac

    if [ -z "$PREFIX" ]; then
        echo "Wrote account data to ${OUTPUT}/$2$1"
    fi
}

SHA256="sha256"
if [ "$(command -v $SHA)" = "" ]; then
    SHA256="shasum -a 256"
fi

# dump external programs binaries if needed
for i in ${!EXTERNAL_ID[@]}; do
    if [ ! -f "${OUTPUT}/${EXTERNAL_SO[$i]}" ]; then
        copy_from_chain "${EXTERNAL_SO[$i]}"
    else
        copy_from_chain "${EXTERNAL_SO[$i]}" "onchain-"

        if [ "$(command -v ${SHA256})" = "" ]; then
            echo $(YLW "[ WARNING ] skipped check for '${EXTERNAL_SO[$i]}' (missing 'sha256sum' command)")
        else
            ON_CHAIN=`${SHA256} -b ${OUTPUT}/onchain-${EXTERNAL_SO[$i]} | cut -d ' ' -f 1`
            LOCAL=`${SHA256} -b ${OUTPUT}/${EXTERNAL_SO[$i]} | cut -d ' ' -f 1`

            if [ "$ON_CHAIN" != "$LOCAL" ]; then
                echo $(YLW "[ WARNING ] on-chain and local binaries are different for '${EXTERNAL_SO[$i]}'")
            else
                echo "$(GRN "[ SKIPPED ]") on-chain and local binaries are the same for '${EXTERNAL_SO[$i]}'"
            fi
        fi

        rm ${OUTPUT}/onchain-${EXTERNAL_SO[$i]}
    fi
done

# only prints this if we have external programs
if [ ${#EXTERNAL_ID[@]} -gt 0 ]; then
    echo ""
fi

cd ${CURRENT_DIR}
