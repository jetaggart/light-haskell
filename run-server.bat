@echo off
IF NOT EXIST cabal.sandbox.config cabal sandbox init

cabal install --dependencies-only

cabal run %*
