import Network (connectTo, withSocketsDo, PortID(..))
import Network.Socket (send, socketToHandle)
import System.Environment (getArgs)
import System.IO (hSetBuffering, hGetLine, stdout, hPutStrLn, BufferMode(..), Handle, IOMode(..))
import Control.Concurrent (forkIO)

main :: IO ()
main = withSocketsDo $ do
    [portStr, clientId] <- getArgs
    let port = fromIntegral (read portStr :: Int)
    hPutStrLn stdout $ "Connected on: " ++ portStr ++ " with client id: " ++ clientId
    handle <- connectTo "localhost" (PortNumber port)
    let connectionData = "{\"name\":\"Haskell\", \"type\":\"haskell\", \"client-id\":" ++ clientId ++ ", \"dir\":\"/Users/pivotal\", \"tags\": [\"haskell.client\"], \"commands\": [\"haskell.compile\"]}"
    hPutStrLn handle connectionData
    processCommands handle

processCommands :: Handle -> IO ()
processCommands handle = do
  line <- hGetLine handle
  hPutStrLn handle line
  processCommands handle
