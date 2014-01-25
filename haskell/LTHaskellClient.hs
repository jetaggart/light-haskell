{-# LANGUAGE DeriveGeneric     #-}
{-# LANGUAGE OverloadedStrings #-}

import           Network                    (PortID (..), connectTo,
                                             withSocketsDo)
import           System.Directory           (getCurrentDirectory)
import           System.Environment         (getArgs)
import           System.Exit                (exitSuccess)
import           System.IO                  (Handle, hClose, hFlush, hGetLine,
                                             hPutStrLn, stderr, stdout)

import           Control.Applicative        ((<$>))

import           Data.Aeson                 (FromJSON (..), ToJSON (..),
                                             Value (..), eitherDecode, encode,
                                             object, (.:), (.=))
import qualified Data.ByteString.Lazy.Char8 as BS

import           GHC.Generics               (Generic)
import           Language.Haskell.GhcMod    (check, defaultOptions, findCradle,
                                             lintSyntax, withGHC)

import           Language.Haskell.Stylish

main :: IO ()
main = withSocketsDo $ do
    [portStr, clientIdStr] <- getArgs
    let port = fromIntegral (read portStr :: Int)
        clientId = read clientIdStr
    handle <- connectTo "localhost" (PortNumber port)
    cwd <- getCurrentDirectory

    putStrLn $ "Connected: " ++ cwd
    hFlush stdout

    sendResponse handle $ LTConnection "Haskell" "haskell" clientId cwd ["haskell.api.reformat", "haskell.api.syntax"]
    processCommands handle


processCommands :: Handle -> IO ()
processCommands handle = do
  line <- hGetLine handle
  case parseCommand line of
    Left e -> hPutStrLn stderr ("Error processing command: " ++ e)
    Right ltCommand -> execCommand handle ltCommand

  processCommands handle

  where
    parseCommand :: String -> Either String (LTCommand (Maybe LTPayload))
    parseCommand = eitherDecode . BS.pack

sendResponse :: (ToJSON a) => Handle -> a -> IO ()
sendResponse handle = hPutStrLn handle . BS.unpack . encode

-- API

execCommand :: Handle -> LTCommand (Maybe LTPayload) -> IO ()

execCommand handle (LTCommand (_, "client.close", Nothing)) = do
  hClose handle
  exitSuccess

execCommand handle (LTCommand (cId, command, Just ltPayload)) =
  go command $ ltData ltPayload

  where
    go "haskell.api.reformat" payloadData = do
      reformattedCode <- format payloadData
      respond "editor.haskell.reformat.result" $ LTPayload reformattedCode

    go "haskell.api.syntax" payloadData = do
      syntaxIssues <- getSyntaxIssues payloadData
      respond "editor.haskell.syntax.result" $ LTArrayPayload syntaxIssues

    go "haskell.api.lint" payloadData = do
      lintIssues <- getLintIssues payloadData
      respond "editor.haskell.lint.result" $ LTArrayPayload lintIssues

    respond :: (ToJSON a) => Command -> a -> IO ()
    respond respCommand respPayload = sendResponse handle $ LTCommand (cId, respCommand, respPayload)

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
format x = do
  config <- loadConfig (makeVerbose False) Nothing
  let extensions = []
      filepath = Nothing
      steps = configSteps config
      result = runSteps extensions filepath steps (lines x)
  case result of
    Left e -> do
      hPutStrLn stderr $ "Error while styling: " ++ e
      return x
    Right xs -> return (unlines xs)

-- ghc-mod

getSyntaxIssues :: FilePath -> IO [String]
getSyntaxIssues filePath = do
  cradle <- findCradle
  withGHC filePath $ check defaultOptions cradle [filePath]

getLintIssues :: FilePath -> IO [String]
getLintIssues file = do
  syntaxIssues <- lintSyntax defaultOptions file
  return $ lines syntaxIssues
