require 'socket'

server = TCPServer.new 5555
loop do
  client = server.accept
  info = client.gets
  puts info

  client.puts %{["123", "command", {"code": "stuff to reformat"}]}
  info = client.gets

  puts "Should succeed"
  puts info

  client.puts %{["123", "command", "hello"]}
  info = client.gets

  puts "Should fail"
  puts info

  client.close
end