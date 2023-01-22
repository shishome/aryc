import {Command, flags} from '@oclif/command'
import YAML from 'yaml';
import fs from "fs";
import Jimp from "jimp";
const e = require('expose-gc');

export default class Scan extends Command {
  static description = 'Scans the archive at the directory and creates aryc structure YAML files.\n\nStructure:\n\n<root directory>/category/folder/artist/submission-title/<files go here>'

  static flags = {
    help: flags.help({char: 'h'}),
    jimp: flags.boolean({char: 'j', default: false, required: false, description: 'Use Jimp processor for files under 2mb. Default: false'}),
    rootUrl: flags.string({char: 'u', default: 'https://art.yuu.im', required: false, description: 'Define the base URL (omit trailing slash) of the archive'})
  }

  static args = [{name: 'directory'}]

  async run() {
    const {args, flags} = this.parse(Scan)

    const category_file = ".aryc_category";
    const ignore_file = ".aryc_ignore";
    const submission_file = ".aryc_submission";
    const reference_file = ".aryc_reference";
    const root_dir = args.directory || "/art";
    const root_url = flags.rootUrl || 'https://art.yuu.im';
    var errors = [];
    function pathToUrl(path: string): string{
      return path.split(root_dir).join(root_url);
    }

    function pathToCroppedUrl(path: string): string{
      return path.split(root_dir).join(root_url);
    }

    function isImage(value: any): boolean{
      if(value.extension === '.png' || value.extension === '.jpeg' || value.extension === '.jpg' || value.extension === '.gif'){

        if(value.name === '.cropped.png'){
          return false;
        }

        return true;
      }
      return false;
    }

    function isCropped(value: any): boolean{
       if(value.name === '.cropped.png'){
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
      croppedFile: string;
      mainFile: Object;
      variants: Object[];
      url: string;
      r18: boolean;
      hide: boolean;
      tags: string[];
      arycHelper: boolean;
      dateCreated?: string;
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
    const tree = dirTree((process.argv[3] || '.'), {attributes: ['birthtimeMs']});
    const fs = require('fs');
    const yaml = require('js-yaml');
    const prompt = require('prompt-sync')();
    console.log(tree);

    let dumpFile: any = {
      "categories": [],
      "submissions": [],
      "references": []
    };

    function isLargest(value1: any, value2: any){

      if(value1.size > value2.size){
        return -1;
      }
      if(value1.size < value2.size){
        return 1;
      }
      return 0;
    }

    async function doJimp(children: any, folder: any) {

      for (let i = 0; i < children.length; i++) {
        if(children[i].name === '.cropped.png'){
          console.log("Found: "+children[i].name);
          console.log("Found: "+children);
          return false;
        }
      }
      try {

        console.log("No cropped file found, Writing crop file for " + folder + ".");
        //console.table(children.filter(isImage).sort(isLargest));
        global.gc();


          //console.log("ERROR: TOO BIG, SKIPPING TO PRESERVE MEMORY. "+folder);
          //console.log("Too big, using gulp and imagemagik for "+folder);
        if(flags.jimp){
          if(children.filter(isImage).sort(isLargest)[0].size < 2000000) {
            return await Jimp.read(children.filter(isImage).sort(isLargest)[0].path)
              .then(lenna => {

                return lenna
                  //.crop((lenna.getWidth() / 2), (lenna.getHeight() / 2), 306, 150) // resize
                  .scaleToFit(306, 150) // resize
                  .write(folder + '/.cropped.png'); // save
              })
              .catch(err => {
                console.error(err);
              });
          }else{
            console.log("File is too large to use Jimp, falling back to imagemagick.")
          }
        }


          var im = require('imagemagick');

          //return await im.convert([children.filter(isImage).sort(isLargest)[0].path, '-resize', '306x150', folder+'/.cropped.png'])
          return await im.convert([children.filter(isImage).sort(isLargest)[0].path, '-resize', '406x250', folder+'/.cropped.png'])
            /**
            gulp.task('default', function() {
            gulp.src(children.filter(isImage).sort(isSmallest)[0].path)

              .pipe(imageResize({
                width : 306,
                height : 150,
                crop : true,
                upscale : false
              }))
              .pipe(rename('.cropped.png'))
              .pipe(gulp.dest(folder+'/'));
          });




             **/
      }catch(RangeError){
        return null;
      }
    }

    function generateCropped(children: any, folder: any) {

      for (let i = 0; i < children.length; i++) {
        if(children[i].name === '.cropped.png'){
          console.log("Found: "+children[i].name);
          console.log("Found: "+children);
          return children[i].path;
        }
      }
      console.log("No Crop File Found, running write.")

      return folder+'/'+'.cropped.png'
    }

    for (let i = 0; i < tree.children.length; i++) {
      if(tree.children[i].type === 'directory'){
          //first level is a category
          let parent = tree.children[i];
          let fileContents: any;
          let catdata: any;
          let process_dir: any = true;
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
            dumpFile.categories.push(catdata);
          } catch (err) {
            console.log("New category, is this ok?")
            console.log("Category: " + parent.name);
            let yn: any = prompt("1 for Yes, 2 for No: ");
            switch (yn) {
              case '1':
                //create file
                catdata = {
                  name: parent.name
                } as Category;
                dumpFile.categories.push(catdata);
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
            let folder: any = parent.children[j];
            if(folder.type === 'directory') {
              console.log("Processing "+parent.children[j].name);
              switch (folder.name) {
                case 'reference':
                  let current_folder: any;
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
                    let ref_file_found: any = "";
                    for (let k = 0; k < current_folder.children.length; k++) {
                      if ('name' in current_folder.children[k]) {
                        if (current_folder.children[k].name === reference_file) {
                          //found a ref file
                          ref_file_found = current_folder.children[k];
                        }
                      }
                    }
                    let refData: any;
                    if (ref_file_found != "") {
                      fileContents = fs.readFileSync(current_folder.path + '/' + reference_file, 'utf8');
                      refData = yaml.load(fileContents);
                      dumpFile.references.push(refData);
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
                      dumpFile.references.push(refData);
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
                    let artist: any = folder.children[k];
                    if (artist.children.filter(containsIgnoreFile).length === 0) {
                      console.log("Processing artist "+artist.name);
                      for (let l = 0; l < artist.children.length; l++) {
                        let submission: any = artist.children[l];
                        if (submission != undefined && submission.type === 'directory') {
                          console.log("Processing submission "+submission.name);
                          // here we are.
                          try{
                            if ('children' in submission && submission.children.filter(containsIgnoreFile).length === 0 && submission.children.length != 0) {
                              // we can process this folder.
                              let subFileFound: any = "";
                              for (let m = 0; m < submission.children.length; m++) {
                                if (submission.children[m].name === submission_file) {
                                  // found the submission file, time to open it
                                  subFileFound = submission.children[m];
                                }
                              }
                              let subData: any;
                              if (subFileFound != "") {
                                //found it
                                fileContents = fs.readFileSync(submission.path + '/' + submission_file, 'utf8');
                                subData = yaml.load(fileContents);
                                if(subData.dateCreated){
                                  subData.dateCreated = submission.birthtimeMs
                                }
                                subData.croppedFile = pathToUrl(generateCropped(submission.children, submission.path));
                                if(submission.children.filter(isCropped).length === 0) {
                                  subData.croppedFile = pathToUrl(generateCropped(submission.children, submission.path));
                                  let n = await doJimp(submission.children, submission.path);
                                  global.gc();
                                }
                                fs.writeFileSync(submission.path + '/' + submission_file, yaml.dump(subData), 'utf8')
                                dumpFile.submissions.push(subData);
                              } else {
                                // did not find a submission file, time to create a new one.

                                subData = {
                                  submissionId: submission.name + '-' + artist.name + '-' + folder.name,
                                  artist: artist.name,
                                  folder: folder.name,
                                  category: parent.name,
                                  path: submission.children.filter(isImage)[0].path,
                                  croppedFile: pathToUrl(generateCropped(submission.children, submission.path)),
                                  mainFile: submission.children.filter(isImage)[0],
                                  variants: submission.children,
                                  url: pathToUrl(submission.children.filter(isImage)[0].path),
                                  r18: false,
                                  hide: true, //since its new, we hide it till we get to look at it.
                                  tags: [""],
                                  arycHelper: false,
                                  dateCreated: submission.birthtimeMs
                                } as Submission;
                                let n = await doJimp(submission.children, submission.path);
                                global.gc();
                                dumpFile.submissions.push(subData);
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
    fs.writeFileSync(root_dir+"/.master.yml", yaml.dump(dumpFile));
    console.log("Wrote Master YML file to .master.yml");
  }
}
