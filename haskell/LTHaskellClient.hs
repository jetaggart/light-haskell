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
instance FromJSON LTPayload

data Connection = Connection { cName :: String
                             , cType :: String
                             , cClientId :: String
                             , cDir :: String
                             , cCommands :: [String]
                             } deriving (Show)

instance ToJSON Connection where
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
    hPutStrLn handle $ connectionResponse clientId
    processCommands handle

    where
      connectionResponse :: String -> String
      connectionResponse clientId = BS.unpack . encode $
        Connection "Haskell" "haskell" clientId "" ["haskell.reformat"]


processCommands :: Handle -> IO ()
processCommands handle = do
  line <- hGetLine handle
  case (parseCommand . BS.pack $ line) of
--  "[" ++ client ++ ", \"editor.reformat.haskell.exec\", {\"some\":\"data\"}]"
    Left error -> hPutStrLn handle error
    Right _ -> hPutStrLn handle "success"
  processCommands handle

  where
    parseCommand :: BS.ByteString -> Either String LTData
    parseCommand = eitherDecode