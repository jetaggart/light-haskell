# Changes

## 0.3.0

* support multiline eval

    you can now evaluate multiline expressions, such as the following:

    ```haskell
    inc :: Int -> Int
    inc n = n + 1

    import Control.Monad (forM_)

    putMany :: (Show a) => [a] -> IO ()
    putMany xs = forM_ xs $ \x -> do
        putStrLn $ show x
    ```

    however, the following limitations still apply:

    * you have to select the expression you want to evaluate
        - except if it's a one-line expression
    * you can only eval one expression at a time
    * all output is printed inline, not on lighttable's console

## 0.2.7

* support for both GHC 7.6 and 7.8 (#48), thanks to @elfenlaid
* use [travis](http://travis-ci.org/psylinse/light-haskell)

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
