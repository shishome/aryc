import {Command, flags} from '@oclif/command'

export default class Scan extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {args, flags} = this.parse(Scan)

    const name = flags.name ?? 'world'
    this.log(`hello ${name} from /Users/yuu/git/aryc/src/commands/scan.ts`)
    if (args.file && flags.force) {
      this.log(`you input --force and --file: ${args.file}`)
    }

    var finder = require('findit2')(process.argv[3] || '.');
    var path = require('path');

    finder.on('directory', function (dir: any, stat: any, stop: any, linkPath: any) {
      var base = path.basename(dir);
      if (base === '.git' || base === 'node_modules') stop()
      else console.log(dir + '/')
    });

  }
}
