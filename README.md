Haskell plugin for LightTable
===

Currently it supports:
* Hoogling via `ctrl-shift-d` and selecting hsh (default)
* Hayooing via `ctrl-shift-d` and selecting hsy (this gives weird results right now)
* Hoogling inline via `ctrl-d`
* Stylish haskell via sidebar "Haskell: Reformat file"
* Syntax checking via sidebar "Haskell: Check syntax"
* Linting via sidebar "Haskell: Check lint"
* Evaluating the current line or selection via `ctrl-enter` or `cmd-enter`
* Get type of expression via sidebar "Haskell: Get the type of a form in editor"


Requirements
===

A recent version of `cabal` that supports `sandbox`, `run`, and `repl`. This must be on a load path that LightTable can read.


Installation
===

Install using the plugin manager.

Contributing
===

This plugin is in the early stages, and can use any kind of help. The best place to start is the issues. I've marked things as `easy` that should be, well, easy. Feel free to comment on any issue asking for help/direction.

The best way to get going is to install this plugin by checking it out (or symlink it) into the plugins directory of your LightTable installation. For example, on OS X:

```bash
cd /Applications/LightTable.app/Contents/Resources/app.nw/plugins
git clone git@github.com:jetaggart/light-haskell.git haskell
```

The plugin directory must be named `haskell` due to LightTable plugin load paths.

Restart LightTable, and run the command (ctrl-space) `Show plugin manager`. You should see Haskell as an installed plugin. After, simply go to a
haskell file and start running the commands. The plugin bootstraps itself and builds the executable, so give it a minute the first time around.
If you don't see what you expect after running a command and waiting a bit, try restarting LightTable. If you still are having trouble, please look at the bottom bar for errors and don't hesitate to submit an issue or help out.

To add functionality, I usually start with testing the haskell client with the ruby server that simulates LightTable. Start by going into the plugin dir and run:

```bash
ruby test_server.rb
./run-server.sh 5555 456 .
```

The ruby script will fire off various commands to the haskell client. You can check it's output to see that it succeeds (or fails). From there, I just figure out how to make LightTable send the data in the format I need it.
