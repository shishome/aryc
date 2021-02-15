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
    const reference_file = ".aryc_reference";
    const root_dir = "/art";
    const root_url = "https://art.yuu.im";
    var errors = [];
    function pathToUrl(path: string): string{
      return path.split(root_dir).join(root_url);
    }

    function isImage(value: any): boolean{
      if(value.extension === '.png' || value.extension === '.jpeg' || value.extension === '.jpg' || value.extension === '.gif'){
        return true;
      }
      return false;
    }

    function containsIgnoreFile(value: any): boolean{
      if(value.name === ignore_file){
        console.log("found ignore");
        return true;
      }
      return false;
    }

    interface Submission{
      submissionId: string;
      artist: string;
      folder: string;
      category: string;
      path: string;
      mainFile: Object;
      variants: Object[];
      url: string;
      r18: boolean;
      hide: boolean;
      tags: string[];
    };
    interface Category {
      name: string;
    };
    interface Reference {
      submissionId: string;
      mainFile: Object;
      variants: Object[];
      category: string;
      folder: string;
      url: string;
    }

    const dirTree = require("directory-tree");
    const tree = dirTree((process.argv[3] || '.'));
    const fs = require('fs');
    const yaml = require('js-yaml');
    const prompt = require('prompt-sync')();
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
            console.log("Registered Category: "+parent.name);
            fileContents = fs.readFileSync(parent.path + '/' + category_file, 'utf8');
            catdata = yaml.load(fileContents);
          } catch (err) {
            console.log("New category, is this ok?")
            console.log("Category: " + parent.name);
            var yn = prompt("1 for Yes, 2 for No: ");
            switch (yn) {
              case '1':
                //create file
                catdata = {
                  name: parent.name
                } as Category;
                fs.writeFileSync(parent.path + '/' + category_file, yaml.dump(catdata), 'utf8')
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

          console.log("Cycling children for "+parent.name);
          //here we go.
          for (let j = 0; j < parent.children.length; j++) {
            var folder = parent.children[j];
            if(folder.type === 'directory') {
              console.log("Processing "+parent.children[j].name);
              switch (folder.name) {
                case 'reference':
                  var current_folder;
                  console.log(folder.children);
                  for (let k = 0; k < folder.children.length; k++) {
                    if ('name' in folder.children[k]) {
                      if (folder.children[k].name === 'current') {
                        current_folder = folder.children[k];
                      }
                    }
                  }
                  // search children for files. find ref declaration
                  if (current_folder != undefined && current_folder != null) {
                    var ref_file_found = "";
                    for (let k = 0; k < current_folder.children.length; k++) {
                      if ('name' in current_folder.children[k]) {
                        if (current_folder.children[k].name === reference_file) {
                          //found a ref file
                          ref_file_found = current_folder.children[k];
                        }
                      }
                    }
                    var refData;
                    if (ref_file_found != "") {
                      fileContents = fs.readFileSync(current_folder.path + '/' + reference_file, 'utf8');
                      refData = yaml.load(fileContents);
                    } else {
                      //no file found, create it.
                      refData = {
                        submissionId: parent.name + '-reference',
                        mainFile: current_folder.children.filter(isImage)[0],
                        variants: current_folder.children,
                        category: parent.name,
                        folder: folder.name,
                        url: pathToUrl(current_folder.children.filter(isImage)[0].path)
                      } as Reference;
                      fs.writeFileSync(current_folder.path + '/' + reference_file, yaml.dump(refData), 'utf8')
                    }
                  } else {
                    console.log("No current ref for this category.")
                  }
                  break;
                case 'misc':
                  //dont process misc
                  console.log("Skipping misc in " + parent.name);
                  break;
                default:
                  // process everything else.
                  console.log("Processing " + folder.name + " in " + parent.name);
                  // artist, submission-id, files -or- artist, files
                  for (let k = 0; k < folder.children.length; k++) {
                    var artist = folder.children[k];
                    if (artist.children.filter(containsIgnoreFile).length === 0) {
                      console.log("Processing artist "+artist.name);
                      for (let l = 0; l < artist.children.length; l++) {
                        var submission = artist.children[l];
                        if (submission != undefined && submission.type === 'directory') {
                          console.log("Processing submission "+submission.name);
                          // here we are.
                          try{
                            if ('children' in submission && submission.children.filter(containsIgnoreFile).length === 0 && submission.children.length != 0) {
                              // we can process this folder.
                              var subFileFound = "";
                              for (let m = 0; m < submission.children.length; m++) {
                                if (submission.children[m].name === submission_file) {
                                  // found the submission file, time to open it
                                  subFileFound = submission.children[m];
                                }
                              }
                              var subData;
                              if (subFileFound != "") {
                                //found it
                                fileContents = fs.readFileSync(submission.path + '/' + submission_file, 'utf8');
                                subData = yaml.load(fileContents);
                              } else {
                                // did not find a submission file, time to create a new one.
                                subData = {
                                  submissionId: submission.name + '-' + artist.name + '-' + folder.name,
                                  artist: artist.name,
                                  folder: folder.name,
                                  category: parent.name,
                                  path: submission.children.filter(isImage)[0].path,
                                  mainFile: submission.children.filter(isImage)[0],
                                  variants: submission.children,
                                  url: pathToUrl(submission.children.filter(isImage)[0].path),
                                  r18: false,
                                  hide: true, //since its new, we hide it till we get to look at it.
                                  tags: [""]
                                } as Submission;
                                fs.writeFileSync(submission.path + '/' + submission_file, yaml.dump(subData), 'utf8')

                              }

                            }
                          }catch(err){
                            errors.push(err);
                          }

                        } else {
                          // not a directory... todo: ignoring non-situated files for now.
                        }
                      }
                    }
                  }

                  break;

              }
            }

          }

        }

      }
    }
    console.log(errors);
  }
}
