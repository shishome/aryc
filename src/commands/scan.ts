import {Command, flags} from '@oclif/command'
import YAML from 'yaml';

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

    const category_file = ".aryc_category";
    const ignore_file = ".aryc_ignore";
    const submission_file = ".aryc_submission";
    interface Submission{
      submissionId: string;
      artist: string;
      folder: string;
      category: string;
      path: string;
      mainFile: string;
      variants: string[];
      tags: string[];
    };
    interface Category {
      name: string;
    }

    const dirTree = require("directory-tree");
    const tree = dirTree((process.argv[3] || '.'));
    const fs = require('fs');
    const yaml = require('js-yaml');
    console.log(tree);
    for (let i = 0; i < tree.children.length; i++) {
      if(tree.children[i].type === 'directory'){
          //first level is a category
          let parent = tree.children[i];
          var fileContents;
          var catdata;
          var process_dir = true;
        for (let j = 0; j < parent.children.length; j++) {
          if(parent.children[j].name === ignore_file){
            process_dir = false;
          }
        }
        if(process_dir) {
          try {
            fileContents = fs.readFileSync(parent.path + '/' + category_file, 'utf8');
            catdata = yaml.safeLoadAll(fileContents);
          } catch (err) {
            console.log("New category, is this ok?")
            console.log("Category: " + parent.name);
            var yn = prompt("1 for Yes, 2 for No: ")
            switch (yn) {
              case '1':
                //create file
                catdata = {
                  name: parent.name
                } as Category;
                fs.writeFileSync(parent.path + '/' + category_file, yaml.safeDump(catdata), 'utf8')
                break;
              case '2':
                // skip
                fs.writeFileSync(parent.path + '/' + ignore_file, ' ', 'utf8');
                break;
              default:
                //nothing entered, skip
                fs.writeFileSync(parent.path + '/' + ignore_file, ' ', 'utf8');
                console.log("Invalid. Skipping.")
                break;
            }
          }
        }

      }
    }
  }
}
