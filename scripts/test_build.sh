#!/bin/bash
set -e

# Process command line arguments
skip=false
while getopts ":s" opt; do
  case $opt in
    s)
      skip=true
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
  esac
done

#moving everything into here so that tests dont run if build crashes
rm -rf .anchor
anchor build -- --features testing
bash scripts/cp_idl.sh

if [[ "$skip" == "false" ]]; then
    echo "UPDATING SUBMODULES..."
    git submodule init
    git submodule update

    pushd deps/metaplex-mpl/bubblegum/program
    cargo build-bpf
    popd
    pushd deps/metaplex-mpl/token-metadata/program
    cargo build-bpf
    popd
    pushd deps/solana-spl/account-compression/programs
    cargo build-bpf
    popd
    pushd deps/tensorswap/programs/tensorswap
    cargo build-bpf
    popd
    pushd deps/tensorswap/programs/tensor_whitelist
    cargo build-bpf
    popd
fi
