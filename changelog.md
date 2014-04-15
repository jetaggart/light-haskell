# Changes

## 0.2.6

* [windows support](https://github.com/jetaggart/light-haskell/pull/41),
    thanks to @remco138

## 0.2.5

* support evaluating top-level assignments again

    ```haskell
    n = 42
    inc = \x -> x + 1

    -- the following does *not* work yet (coming soon)
    inc x = x + 1
    ```
* remove old results on the same line before evaluating
