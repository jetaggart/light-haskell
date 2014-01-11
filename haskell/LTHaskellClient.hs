{-# LANGUAGE OverloadedStrings #-}

import Network (connectTo, withSocketsDo, PortID(..))
import Network.Socket (send, socketToHandle)
import System.Environment (getArgs)
import System.IO (hSetBuffering, stdout, hGetLine, stderr, hPutStrLn, BufferMode(..), Handle, IOMode(..))
import Control.Concurrent (forkIO)

import Data.Aeson ((.:), (.:?), decode, FromJSON(..), Value(..))
import Control.Exception (throw)
import Control.Applicative ((<$>), (<*>))
import qualified Data.ByteString.Lazy.Char8 as BS

main :: IO ()
main = withSocketsDo $ do
    [portStr, clientId] <- getArgs
    let port = fromIntegral (read portStr :: Int)
    handle <- connectTo "localhost" (PortNumber port)
    let connectionData = "{\"name\":\"Haskell\", \"type\":\"haskell\", \"client-id\":" ++ clientId ++ ", \"dir\":\"/Users/pivotal\", \"commands\": [\"haskell.reformat\"]}"
    hPutStrLn handle connectionData
    processCommands handle

processCommands :: Handle -> IO ()
processCommands handle = do
  line <- hGetLine handle
  case (decode . BS.pack $ line) of
    Just (client:_:_) -> hPutStrLn handle $ "[" ++ client ++ ", \"editor.reformat.haskell.exec\", {\"some\":\"data\"}]"
    _                 -> head []
  processCommands handle

parseCommand :: BS.ByteString -> Maybe [String]
parseCommand = decode