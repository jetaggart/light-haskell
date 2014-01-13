module LTStylish where

import Control.Concurrent (forkIO)
import System.IO (hPutStr, hGetContents, hClose)
import System.Process (runInteractiveProcess)


-- main = do
--  contents <- readFile "StylishTest.hs"
--  response <- format contents
--  putStrLn response