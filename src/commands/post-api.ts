import {Command, flags} from '@oclif/command'
import * as fs from 'fs';
import * as path from 'path';

export default class PostApi extends Command {
  static description = 'Creates a file at the root of the directory specified containing all ARYC YML files. (ARYC version 1 File Structure)'

  static flags = {
    help: flags.help({char: 'h'})
  }

  static args = [{name: 'directory'}]

  async run() {
    const {args, flags} = this.parse(PostApi)

    if (args.directory) {
      this.log(`using root directory.  ${args.directory}`)
    }else{
      this.log("No path entered.")
      return false;
    }

    var glob = require("glob");

    glob(args.directory+"/**/.aryc*", {ignore: "*lost+found*"}, function (er: Error, files: string[]) {
      console.log(files);
      fs.writeFileSync(args.directory+"/.output.json", JSON.stringify(files))
      console.log("Saved output to .output.json at root of folder")
      //post this to the api which will then curl these files
    })

  }
}
