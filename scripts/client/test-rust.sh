#!/bin/bash

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
# go to parent folder
cd $(dirname $(dirname $SCRIPT_DIR))

# command-line input
ARGS=$*

WORKING_DIR=$(pwd)
SOLFMT="solfmt"

# client SDK tests
cd ${WORKING_DIR}/clients/rust

if [ ! "$(command -v $SOLFMT)" = "" ]; then
    CARGO_TERM_COLOR=always cargo test-sbf ${ARGS} 2>&1 | ${SOLFMT}
else
    cargo test-sbf ${ARGS}
fi