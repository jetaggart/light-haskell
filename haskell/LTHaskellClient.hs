{-# LANGUAGE OverloadedStrings, DeriveGeneric #-}

import Network (connectTo, withSocketsDo, PortID(..))
import Network.Socket (send, socketToHandle)
import System.Environment (getArgs)
import System.IO (hSetBuffering, stdout, hGetLine, stderr, hPutStrLn, BufferMode(..), Handle, IOMode(..))
import Control.Concurrent (forkIO)

import Data.Aeson ((.:), (.:?), eitherDecode, FromJSON(..), Value(..))
import Control.Exception (throw)
import Control.Applicative ((<$>), (<*>))
import Data.Text (Text)
import qualified Data.ByteString.Lazy.Char8 as BS

import GHC.Generics (Generic)

data LTPayload = LTPayload { code :: String } deriving (Show, Generic)
data LTData = LTData (String, String, LTPayload) deriving (Show, Generic)

processPayload o = LTPayload <$> (o .: "code")

instance FromJSON LTData
instance FromJSON LTPayload

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
  case (parseCommand . BS.pack $ line) of
    Left error -> hPutStrLn stderr error
    Right _ -> hPutStrLn handle "success"
--  case (decode . BS.pack $ line) of
--    Just (client:command:payload) -> hPutStrLn handle $ "[" ++ client ++ ", \"editor.reformat.haskell.exec\", {\"some\":\"data\"}]"
--                                   -> head []
  processCommands handle

parseCommand :: BS.ByteString -> Either String LTData
parseCommand = eitherDecode