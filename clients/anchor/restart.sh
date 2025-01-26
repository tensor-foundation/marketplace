#!/bin/bash
cd ../../
pnpm validator:restart
cd clients/anchor
TESTS_GLOB="tests/listings_core.test.ts" ./anchor-test.sh
