#!/bin/bash
#! skips submodule - faster for local testing where you don't need to rebuild them constantly

echo "SKIP SUBMODULES (run without :s if unintentional)"

set -e

#moving everything into here so that tests dont run if build crashes
rm -rf .anchor
anchor build -- --features testing
bash scripts/cp_idl.sh

# Run tests
anchor test --skip-build -- --features testing
