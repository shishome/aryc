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
aryc/0.5.0 darwin-arm64 node-v16.18.0
$ aryc --help [COMMAND]
USAGE
  $ aryc COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`aryc help [COMMAND]`](#aryc-help-command)
* [`aryc post-api [DIRECTORY]`](#aryc-post-api-directory)
* [`aryc scan [DIRECTORY]`](#aryc-scan-directory)
* [`aryc update [CHANNEL]`](#aryc-update-channel)

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

## `aryc post-api [DIRECTORY]`

Creates a file at the root of the directory specified containing all ARYC YML files.

```
USAGE
  $ aryc post-api [DIRECTORY]

OPTIONS
  -h, --help  show CLI help
```

_See code: [src/commands/post-api.ts](https://github.com/shishome/aryc/blob/v0.5.0/src/commands/post-api.ts)_

## `aryc scan [DIRECTORY]`

Scans the archive at the directory and creates aryc structure YAML files.

```
USAGE
  $ aryc scan [DIRECTORY]

OPTIONS
  -h, --help             show CLI help
  -j, --jimp             Use Jimp processor for files under 2mb. Default: false
  -u, --rootUrl=rootUrl  [default: https://art.yuu.im] Define the base URL (omit trailing slash) of the archive

DESCRIPTION
  Structure:

  <root directory>/category/folder/artist/submission-title/<files go here>
```

_See code: [src/commands/scan.ts](https://github.com/shishome/aryc/blob/v0.5.0/src/commands/scan.ts)_

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

## File Structure

Aryc File Structure refers to the schema used to store information. The current version of the Aryc File Structure is 1 released on January 21st, 2023

* Alpha: Not Versioned. Any files generated prior to 1/21/2023
* v1: Released 1/21/2022, Command Version 0.5.0 (Examples to come)

# Things left to do
[ ] - When opening an .aryc_submission or .aryc_reference file, check to make sure the paths still resolve. Otherwise redo the file.
