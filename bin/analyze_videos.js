var dashdash = require('dashdash');
var getFiles = require('../lib/getFiles');
// var maker = require('../lib/makeFrames');

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
  help: 'Path to write analysis to'
}];

var parser = dashdash.createParser({options: options});
try {
  var opts = parser.parse(process.argv);
} catch (e) {
  console.error('analyze_videos.js: error: %s', e.message);
  process.exit(1);
}

if (opts.help) {
  var help = parser.help({includeEnv: true}).trimRight();
  console.log('usage: node analyze_videos.js [OPTIONS]\n'
    + 'options:\n'
    + help);
  process.exit(0);
} else {
  if (opts.input) {
    if (opts.output) {
      getFiles.getVideos(opts.input, (err, videos) => {
        if (err) {
          throw err;
        } else {
          // analyze videos
          require('../lib/videoAnalyze').report(videos, opts.output, err => {
            if (err) {
              throw err;
            } else {
              console.log('finished');
            }
          });
        }
      });
    } else {
      console.error('Please specify an "output" file path to write results to');
      process.exit(1);
    }
  } else {
    console.error('Please specify an "input" path to a directory of videos with "-i path/to/directory"');
    process.exit(1);
  }
}
