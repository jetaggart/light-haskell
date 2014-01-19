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
import           System.Process             (readProcess)

import           Control.Applicative        ((<$>))

import           Data.Aeson                 (FromJSON (..), ToJSON (..),
                                             Value (..), eitherDecode, encode,
                                             object, (.:), (.=))
import qualified Data.ByteString.Lazy.Char8 as BS

import           GHC.Generics               (Generic)
import           Language.Haskell.GhcMod    (check, defaultOptions, findCradle,
                                             withGHC)

main :: IO ()
main = withSocketsDo $ do
    [portStr, clientIdStr] <- getArgs
    let port = fromIntegral (read portStr :: Int)
        clientId = (read clientIdStr :: Int)
    handle <- connectTo "localhost" (PortNumber port)
    cwd <- getCurrentDirectory

    hPutStrLn stdout $ "Connected: " ++ cwd
    hFlush stdout

    sendResponse handle $ LTConnection "Haskell" "haskell" clientId cwd ["haskell.api.reformat", "haskell.api.syntax"]
    processCommands handle


processCommands :: Handle -> IO ()
processCommands handle = do
  line <- hGetLine handle
  case (parseCommand line) of
    Left error -> hPutStrLn stderr ("error" ++ error)
    Right ltCommand -> execCommand handle ltCommand

  processCommands handle

  where
    parseCommand :: String -> Either String (LTCommand LTPayload)
    parseCommand = eitherDecode . BS.pack

sendResponse :: (ToJSON a) => Handle -> a -> IO ()
sendResponse handle = hPutStrLn handle . BS.unpack . encode

-- API

execCommand :: Handle -> (LTCommand LTPayload) -> IO ()

execCommand handle (LTCommand (cId, "haskell.api.reformat", payload)) = do
  reformattedCode <- format (ltData payload)
  sendResponse handle $ LTCommand (cId, "editor.haskell.reformat.result", LTPayload reformattedCode)

execCommand handle (LTCommand (cId, "haskell.api.syntax", payload)) = do
  syntaxIssues <- getSyntaxIssues (ltData payload)
  sendResponse handle $ LTCommand (cId, "editor.haskell.syntax.result", LTArrayPayload syntaxIssues)


-- API types

type Client = Int
type Command = String

data LTCommand a = LTCommand (Client, Command, a)  deriving (Show, Generic)
instance (FromJSON a) => FromJSON (LTCommand a)
instance (ToJSON a) => ToJSON (LTCommand a)

data LTPayload = LTPayload { ltData :: String } deriving (Show)
instance FromJSON LTPayload where
  parseJSON (Object v) = LTPayload <$> v .: "data"

instance ToJSON LTPayload where
  toJSON payload = object [ "data" .= ltData payload ]

data LTArrayPayload = LTArrayPayload { ltDataArray :: [String] } deriving (Show)
instance FromJSON LTArrayPayload where
  parseJSON (Object v) = LTArrayPayload <$> v .: "data"

instance ToJSON LTArrayPayload where
  toJSON payload = object [ "data" .= ltDataArray payload ]

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


-- stylish-haskell

format :: String -> IO String
format = readProcess "stylish-haskell" []

-- ghc-mod

getSyntaxIssues :: FilePath -> IO [String]
getSyntaxIssues filePath = do
  cradle <- findCradle
  withGHC filePath $ check defaultOptions cradle [filePath]
