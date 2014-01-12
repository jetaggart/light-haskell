{-# LANGUAGE OverloadedStrings, DeriveGeneric #-}

import Network (connectTo, withSocketsDo, PortID(..))
import Network.Socket (send, socketToHandle)
import System.Environment (getArgs)
import System.IO (hSetBuffering, stdout, hFlush, hGetLine, stderr, hPutStrLn, BufferMode(..), Handle, IOMode(..))
import System.Directory (getCurrentDirectory)
import Control.Concurrent (forkIO)

import Data.Aeson ((.:), (.=), (.:?), object, eitherDecode, encode, FromJSON(..), ToJSON(..), Value(..))
import Control.Exception (throw)
import Control.Applicative ((<$>), (<*>))
import Data.Map (fromList)
import Data.Text (Text)
import qualified Data.ByteString.Lazy.Char8 as BS

import GHC.Generics (Generic)

data LTPayload = LTPayload { code :: String } deriving (Show, Generic)

type Client = Int
type Command = String
data LTData = LTData (Client, Command, LTPayload) deriving (Show, Generic)

instance FromJSON LTData
instance ToJSON LTData
instance FromJSON LTPayload
instance ToJSON LTPayload

data LTConnection = LTConnection { cName :: String
                                 , cType :: String
                                 , cClientId :: Int
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
    [portStr, clientIdStr] <- getArgs
    let port = fromIntegral (read portStr :: Int)
        clientId = (read clientIdStr :: Int)
    handle <- connectTo "localhost" (PortNumber port)
    cwd <- getCurrentDirectory

    hPutStrLn stdout "Connected"
    hFlush stdout

    sendResponse handle $ LTConnection "Haskell" "haskell" clientId cwd ["haskell.reformat"]
    processCommands clientId handle


processCommands :: Int -> Handle -> IO ()
processCommands clientId handle = do
  line <- hGetLine handle

  hPutStrLn stdout $ ("Trying to respond: " ++) $ BS.unpack . encode $ LTData (clientId, "editor.reformat.haskell.exec", LTPayload "New source code")
  hFlush stdout

  case (parseCommand line) of
    Left error -> hPutStrLn stderr line
    Right _ -> do
      sendResponse handle $ LTData (clientId, "editor.reformat.haskell.exec", LTPayload "New source code")

  processCommands clientId handle

  where
    parseCommand :: String -> Either String LTData
    parseCommand = eitherDecode . BS.pack

sendResponse :: (ToJSON a) => Handle -> a -> IO ()
sendResponse handle = hPutStrLn handle . BS.unpack . encode
