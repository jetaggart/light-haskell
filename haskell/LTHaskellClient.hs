{-# LANGUAGE OverloadedStrings, DeriveGeneric #-}

import Network (connectTo, withSocketsDo, PortID(..))
import Network.Socket (send, socketToHandle)
import System.Environment (getArgs)
import System.IO (hSetBuffering, stdout, hGetLine, stderr, hPutStrLn, BufferMode(..), Handle, IOMode(..))
import Control.Concurrent (forkIO)

import Data.Aeson ((.:), (.=), (.:?), object, eitherDecode, encode, FromJSON(..), ToJSON(..), Value(..))
import Control.Exception (throw)
import Control.Applicative ((<$>), (<*>))
import Data.Map (fromList)
import Data.Text (Text)
import qualified Data.ByteString.Lazy.Char8 as BS

import GHC.Generics (Generic)

data LTPayload = LTPayload { code :: String } deriving (Show, Generic)

type Client = String
type Command = String
data LTData = LTData (Client, Command, LTPayload) deriving (Show, Generic)

instance FromJSON LTData
instance ToJSON LTData
instance FromJSON LTPayload
instance ToJSON LTPayload

data LTConnection = LTConnection { cName :: String
                                 , cType :: String
                                 , cClientId :: String
                                 , cDir :: String
                                 , cCommands :: [String]
                                 } deriving (Show)

instance ToJSON LTConnection where
  toJSON connection =
    object [ "name" .= cName connection
           , "type" .= cType connection
           , "client-id" .= cClientId connection
           , "dir" .= cDir connection
           , "commands" .= cCommands connection
           ]

main :: IO ()
main = withSocketsDo $ do
    [portStr, clientId] <- getArgs
    let port = fromIntegral (read portStr :: Int)
    handle <- connectTo "localhost" (PortNumber port)
    sendResponse handle $ LTConnection "Haskell" "haskell" clientId "" ["haskell.reformat"]
    processCommands clientId handle


processCommands :: String -> Handle -> IO ()
processCommands clientId handle = do
  line <- hGetLine handle
  case (parseCommand line) of
    Left error -> hPutStrLn handle error
    Right _ -> sendResponse handle $ LTData (clientId, "editor.reformat.haskell.exec", LTPayload "New source code")
  processCommands clientId handle

  where
    parseCommand :: String -> Either String LTData
    parseCommand = eitherDecode . BS.pack

sendResponse :: (ToJSON a) => Handle -> a -> IO ()
sendResponse handle = hPutStrLn handle . BS.unpack . encode
