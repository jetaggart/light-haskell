#!/bin/bash

# Fail script on any error
set -e

if [[ ! -e "cabal.sandbox.config" ]]; then
  cabal sandbox init
fi

cabal install --dependencies-only

cabal run "$@" 
