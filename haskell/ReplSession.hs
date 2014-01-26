module ReplSession (
  ReplSession,
  eval,
  startSession,
  endSession
) where

import System.IO
import System.Process
import System.Directory (getDirectoryContents)
import Data.List (isSuffixOf)
import Control.Monad (liftM)

data ReplSession = ReplSession {
  replIn :: Handle,
  replOut :: Handle,
  replError :: Handle,
  replProcess :: ProcessHandle
}

eval :: String -> ReplSession -> IO String
eval input s@(ReplSession i o _ _) = do
  clearHandle o 0
  sendCommand (input ++ "\n") s
  output <- readUntil o ("--EvalFinished\n" `isSuffixOf`)
  return $ take (length output - length "--EvalFinished\n") output

readUntil :: Handle -> (String -> Bool) -> IO String
readUntil handle predicate = readUntil' handle "" predicate

readUntil' :: Handle -> String -> (String -> Bool) -> IO String
readUntil' handle output predicate = do
  char <- hGetChar handle
  let newOutput = output ++ [char]
  if predicate $ newOutput
  then return newOutput
  else readUntil' handle newOutput predicate

startSession :: FilePath -> IO ReplSession
startSession path = do
  cabalProject <- isCabalProject path
  let (cmd, args) = if cabalProject then ("cabal", ["repl"]) else ("ghci", [])
  (i, o, e, p) <- runInteractiveProcess cmd args (Just path) Nothing
  let s = ReplSession i o e p
  prepareSession s
  return s

isCabalProject :: FilePath -> IO Bool
isCabalProject dir = do
  files <- getDirectoryContents dir
  return $ any (".cabal" `isSuffixOf`) files

prepareSession :: ReplSession -> IO ()
prepareSession s@(ReplSession _ o _ _) = do
  sendCommand ":set prompt \"--EvalFinished\\n\"\n" s
  clearHandle o 1000

sendCommand :: String -> ReplSession -> IO ()
sendCommand cmd (ReplSession i _ _ _) = do
  hPutStrLn i cmd
  hFlush i

clearHandle :: Handle -> Int -> IO ()
clearHandle handle wait =
  untilM (liftM not $ hWaitForInput handle wait) $ do
    hGetChar handle

untilM :: (Monad m) => m Bool -> m a -> m ()
untilM predicate action = do
  isFinished <- predicate
  if isFinished
  then return ()
  else action >> untilM predicate action

endSession :: ReplSession -> IO ()
endSession r = do
  sendCommand ":quit\n" r
  waitForProcess $ replProcess r
  return ()
