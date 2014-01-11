require 'socket'

server = TCPServer.new 5555
loop do
  client = server.accept
  info = client.gets
  puts info

  client.puts %{["123", "command", "hello"]}
  client.gets

  sleep(10)
  client.close
end