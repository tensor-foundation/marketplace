#!/bin/bash

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
OUTPUT="./target/deploy"
# saves external programs binaries to the output directory
source ${SCRIPT_DIR}/dump.sh ${OUTPUT}
# go to parent folder
cd $(dirname $(dirname $SCRIPT_DIR))

if [ ! -z "$PROGRAM" ]; then
    PROGRAMS='["'${PROGRAM}'"]'
fi

if [ -z "$PROGRAMS" ]; then
    PROGRAMS="$(cat .github/.env | grep "PROGRAMS" | cut -d '=' -f 2)"
fi

# default to input from the command-line
ARGS=$*

# command-line arguments override env variable
if [ ! -z "$ARGS" ]; then
    PROGRAMS="[\"${1}\"]"
    shift
    ARGS=$*
fi

PROGRAMS=$(echo $PROGRAMS | jq -c '.[]' | sed 's/"//g')

WORKING_DIR=$(pwd)
SOLFMT="solfmt"

for p in ${PROGRAMS[@]}; do
    cd ${WORKING_DIR}/${p}

    if [ ! "$(command -v $SOLFMT)" = "" ]; then
        CARGO_TERM_COLOR=always cargo test-sbf ${ARGS} 2>&1 | ${SOLFMT}
    else
        RUST_LOG=error cargo test-sbf ${ARGS}
    fi
done