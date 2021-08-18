aryc
====



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/aryc.svg)](https://npmjs.org/package/aryc)
[![Downloads/week](https://img.shields.io/npm/dw/aryc.svg)](https://npmjs.org/package/aryc)
[![License](https://img.shields.io/npm/l/aryc.svg)](https://github.com/shishome/aryc/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
* [Required file structure](#required-file-structure)
* [Things left to do](#things-left-to-do)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g aryc
$ aryc COMMAND
running command...
$ aryc (-v|--version|version)
aryc/0.4.4 darwin-x64 node-v12.18.1
$ aryc --help [COMMAND]
USAGE
  $ aryc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`aryc hello [FILE]`](#aryc-hello-file)
* [`aryc help [COMMAND]`](#aryc-help-command)
* [`aryc post-api [FILE]`](#aryc-post-api-file)
* [`aryc scan [FILE]`](#aryc-scan-file)
* [`aryc update [CHANNEL]`](#aryc-update-channel)

## `aryc hello [FILE]`

describe the command here

```
USAGE
  $ aryc hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ aryc hello
  hello world from ./src/hello.ts! stuff
```

_See code: [src/commands/hello.ts](https://github.com/shishome/aryc/blob/v0.4.4/src/commands/hello.ts)_

## `aryc help [COMMAND]`

display help for aryc

```
USAGE
  $ aryc help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `aryc post-api [FILE]`

describe the command here

```
USAGE
  $ aryc post-api [FILE]

OPTIONS
  -d, --force
  -h, --help   show CLI help
```

_See code: [src/commands/post-api.ts](https://github.com/shishome/aryc/blob/v0.4.4/src/commands/post-api.ts)_

## `aryc scan [FILE]`

describe the command here

```
USAGE
  $ aryc scan [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/scan.ts](https://github.com/shishome/aryc/blob/v0.4.4/src/commands/scan.ts)_

## `aryc update [CHANNEL]`

update the aryc CLI

```
USAGE
  $ aryc update [CHANNEL]
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.3.10/src/commands/update.ts)_
<!-- commandsstop -->

# Required file structure

/category/folder/artist/submission-title/files*.png

ex.

/originaldonotsteal/2020/example-guy/my-first-thing/file.png

## Special cases

* the misc folder in any category root is excluded.
* any folder with a blank .aryc_ignore file in it will not be processed.

## Reference case

References are archived using this schema:

/category/reference/current/ref.png

Required names:
* MUST be reference
* MUST be current

# Things left to do
[ ] - When opening an .aryc_submission or .aryc_reference file, check to make sure the paths still resolve. Otherwise redo the file.
