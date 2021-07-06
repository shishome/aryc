import {Command, flags} from '@oclif/command'
import * as fs from 'fs';
import * as path from 'path';

export default class PostApi extends Command {
  static description = 'describe the command here'

  static flags = {
    help: flags.help({char: 'h'}),
    force: flags.boolean({char: 'd'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {args, flags} = this.parse(PostApi)

    if (args.file && flags.force) {
      this.log(`-d: ${args.file}`)
    }else{
      this.log("No path entered")
      return false;
    }

    var glob = require("glob");

    glob(args.file+"/**/.aryc*", {ignore: "*lost+found*"}, function (er: Error, files: string[]) {
      console.log(files);
      fs.writeFileSync(args.file+"/.output.json", JSON.stringify(files))
      console.log("Saved output to .output.json at root of folder")
      //post this to the api which will then curl these files
    })

  }
}
