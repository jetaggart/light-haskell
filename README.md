Haskell plugin for LightTable
===

Currently it supports:
* Hoogling via `ctrl-shift-d`
* Hoogling inline via `ctrl-d`
* Stylish haskell via sidebar "Haskell: Reformat file"
* Syntax checking via sidebar "Haskell: Check syntax"

Working on:
* ghc-mod features
* Running a simple haskell file

Requirements
===

This plugin currently requires:
* the Haskell Platform
* `aeson`
* `stylish-haskell` as an executable on a PATH that LT can read.

For `stylish-haskell` I installed it to a global PATH:

```
cabal install stylish-haskell --bindir=/usr/local/bin
```



License
===

Licensed under the same license as LightTable
