#!/bin/bash
set -e

#moving everything into here so that tests dont run if build crashes
rm -rf .anchor
anchor build -- --features testing
bash scripts/cp_idl.sh

# Build token metadata program for testing
git submodule init
git submodule update

#TODO re-enable before pushing to prod (annoying to wait)
#pushd deps/metaplex-mpl/bubblegum/program
#cargo build-bpf
#popd
#
#pushd deps/solana-spl/account-compression/programs
#cargo build-bpf
#popd

# Run tests
anchor test --skip-build -- --features testing
