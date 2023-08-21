#!/bin/bash
set -e

#moving everything into here so that tests dont run if build crashes
rm -rf .anchor
anchor build -- --features testing
bash scripts/cp_idl.sh