const dashdash = require('dashdash');
const getFiles = require('../lib/getFiles');
const convFiles = require('../lib/videoConvert');
const errorMsg = 'convert_videos.js: error: %s';
const options = [{
  names: ['help', 'h'],
  type: 'bool',
  help: 'Print this help and exit'
}, {
  names: ['input', 'i'],
  type: 'string',
  help: 'Path to folder containing video files'
}, {
  names: ['output', 'o'],
  type: 'string',
  help: 'Path to the converted files to to'
},{
  names: ['extension', 'e'],
  type: 'string',
  help: 'Type of file extension to convert the file to'
}];
const parser = dashdash.createParser({options: options});
let opts;
try {
  opts = parser.parse(process.argv);
} catch (e) {
  console.error(errorMsg, e.message);
  process.exit(1);
}

if (opts.help) {
  let help = parser.help({includeEnv: true}).trimRight();
  console.log('usage: node convert_videos.js [OPTIONS]\n'
    + 'options:\n'
    + help);
    process.exit(0);
} else {
  let input = opts.input, output = opts.output, ext = opts.extension;
  if (input.length && output.length && ext.length) {
    getFiles.getVideos(input, (err, videos) => {
      if (err) {
        console.error(errorMsg, err.message ? err.message : err);
        process.exit(1);
      } else {
        convFiles.convertVideos(videos, output, ext, err => {
          if (err) {
            console.error(errorMsg, err.message ? err.message : err);
            process.exit(1);
          } else {
            console.log('finished converting videos');
            process.exit(0);
          }
        });
      }
    });
  } else {
    console.log(`Specify a input ("${input}"), output ("${output}"), and extension ("${ext}")`);
    process.exit(0);
  }
}