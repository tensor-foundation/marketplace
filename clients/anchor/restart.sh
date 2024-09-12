#!/bin/bash
cd ../../
pnpm validator:restart
cd clients/anchor
TESTS_GLOB="tests/bids.test.ts" ./anchor-test.sh
