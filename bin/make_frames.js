var dashdash = require('dashdash');
var getFiles = require('../lib/getFiles');
var maker = require('../lib/makeFrames');

var options = [{
  names: ['help', 'h'],
  type: 'bool',
  help: 'Print this help and exit.'
}, {
  names: ['input', 'i'],
  type: 'string',
  help: 'Path to folder containing video files.'
}, { 
  names: ['output', 'o'],
  type: 'string',
  help: 'Path to save frames to'
}, {
  names: ['make', 'm'],
  type: 'bool',
  help: 'Makes images from input folder.'
}, {
  names: ['subfolders', 's'],
  type: 'bool',
  help: 'Creates a subfolder for every video in the output directory'
}];
 
var parser = dashdash.createParser({options: options});
try {
  var opts = parser.parse(process.argv);
} catch (e) {
  console.error('make_frames.js: error: %s', e.message);
  process.exit(1);
}
 
if (opts.help) {
  var help = parser.help({includeEnv: true}).trimRight();
  console.log('usage: node make_frames.js [OPTIONS]\n'
    + 'options:\n'
    + help);
  process.exit(0);
} else {
  if (opts.make) {
    if (opts.input) {
      if (opts.output) {
        getFiles.getVideos(opts.input, (err, videos) => {
          if (err) {
            throw err;
          } else {
            maker.makeFrames(videos, opts.output, opts.subfolders, (err) => {
              console.log('finished')
              if (err) {
                throw err;
              } else {
                process.exit(0);
	      }
            });
          }
        });
      } else {
        console.error('Please specify an "output" path to directory of videos with "-o path/to/directory"');
        process.exit(1);  
      }
    } else {
      console.error('Please specify an "input" path to a directory of videos with "-i path/to/directory"');
      process.exit(1);
    }
  }
}
