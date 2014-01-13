{-# LANGUAGE DeriveGeneric     #-}
{-# LANGUAGE OverloadedStrings #-}

import           Control.Concurrent         (forkIO)
import           Network                    (PortID (..), connectTo,
                                             withSocketsDo)
import           Network.Socket             (send, socketToHandle)
import           System.Directory           (getCurrentDirectory)
import           System.Environment         (getArgs)
import           System.IO                  (BufferMode (..), Handle,
                                             IOMode (..), hClose, hFlush,
                                             hGetContents, hGetLine, hPutStr,
                                             hPutStrLn, hSetBuffering, stderr,
                                             stdout)
import           System.Process             (readProcess, waitForProcess)

import           Control.Applicative        ((<$>), (<*>))
import           Control.Exception          (throw)
import           Data.Aeson                 (FromJSON (..), ToJSON (..),
                                             Value (..), eitherDecode, encode,
                                             object, (.:), (.:?), (.=))
import qualified Data.ByteString.Lazy.Char8 as BS
import           Data.Map                   (fromList)
import           Data.Text                  (Text)

import           GHC.Generics               (Generic)

data LTPayload = LTPayload { code :: String } deriving (Show, Generic)

type Client = Int
type Command = String
data LTData = LTData (Client, Command, LTPayload) deriving (Show, Generic)

instance FromJSON LTData
instance ToJSON LTData
instance FromJSON LTPayload
instance ToJSON LTPayload

data LTConnection = LTConnection { cName     :: String
                                 , cType     :: String
                                 , cClientId :: Int
                                 , cDir      :: String
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
    processCommands handle


processCommands :: Handle -> IO ()
processCommands handle = do
  line <- hGetLine handle
  case (parseCommand line) of
    Left error -> hPutStrLn stderr ("error" ++ line)
    Right (LTData (cId, _, payload)) -> do
      reformattedCode <- format (code payload)
      sendResponse handle $ LTData (cId, "editor.haskell.reformat.result", LTPayload reformattedCode)

  processCommands handle

  where
    parseCommand :: String -> Either String LTData
    parseCommand = eitherDecode . BS.pack

sendResponse :: (ToJSON a) => Handle -> a -> IO ()
sendResponse handle = hPutStrLn handle . BS.unpack . encode

-- Stylish

format :: String -> IO String
format = readProcess "stylish-haskell" []
