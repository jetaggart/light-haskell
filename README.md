Haskell plugin for LightTable
===

Currently it supports:
* Hoogling via `ctrl-shift-d`
* Hoogling inline via `ctrl-d`
* Stylish haskell via sidebar "Haskell: reformat file"

Working on:
* ghc-mod features

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
