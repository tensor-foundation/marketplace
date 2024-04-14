#!/bin/bash
set -e

if [ -z ${TESTS_GLOB+x} ]; then
    TESTS_GLOB=${TESTS_GLOB:-"tests/**/*.ts"}
fi

# parallel mode, doesn't work b/c:
# (1) we can't check fee vault in parallel, b/c
# (2) we're limited to 1 TSwap, b/c
# (3) cfg_attr does not work with account(init) apparently...
# yarn run ts-mocha --parallel --jobs 100 ./tsconfig.json -t 100000 "$TESTS_GLOB"
# Need 300s timeout b/c sell a ton test takes ~100s
yarn run ts-mocha -p ./tsconfig.tests.json -t 300000 "$TESTS_GLOB"