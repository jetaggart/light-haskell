require 'socket'
require 'json'

server = TCPServer.new 5555

def test_code
<<-CODE
{-# LANGUAGE OverloadedStrings, DeriveGeneric #-}

import Network (connectTo, withSocketsDo, PortID(..))
import Network.Socket (send, socketToHandle)
import System.Environment (getArgs)
import System.IO (hSetBuffering, stdout, hFlush, hPutStr, hGetLine, stderr, hPutStrLn, BufferMode(..), Handle, IOMode(..))
import System.Directory (getCurrentDirectory)
import Control.Concurrent (forkIO)

import Data.Aeson ((.:), (.=), (.:?), object, eitherDecode, encode, FromJSON(..), ToJSON(..), Value(..))
import Control.Exception (throw)
import Control.Applicative ((<$>), (<*>))
import Data.Map (fromList)
import Data.Text (Text)
import qualified Data.ByteString.Lazy.Char8 as BS
CODE
end

loop do
  client = server.accept
  info = client.gets
  puts info

  client.puts JSON.generate([456, "haskell.api.reformat", {"data" => test_code}])
  info = client.gets

  puts "Should succeed: reformatting"
  puts info

  client.puts JSON.generate([456, "haskell.api.syntax", {"data" => "haskell/LTHaskellClient.hs"}])
  info = client.gets

  puts "Should succeed: syntax"
  puts info

  client.puts JSON.generate([456, "haskell.api.eval", {"data" => "1 + 2"}])
  info = client.gets
  puts "Should succeed: eval"
  puts info

  client.puts JSON.generate([456, "haskell.api.eval", {"data" => "putStrLn"}])
  info = client.gets
  puts "Should fail: eval"
  puts info

  client.puts JSON.generate([456, "client.close", nil])
  info = client.gets
  puts "Client should quit"
  puts info
end
