const debug = require('debug')('makeframe_service')
const util = require('util')
const exec = util.promisify(require('child_process').exec);
const mkdir = util.promisify(require('fs').mkdir);
const path = require('path');
const jsesc = require('jsesc');
const asyncJs = require('async');
const config = require('config');
const settings = config.get('frame_settings');
const ffmpegCmd = 'ffmpeg -hide_banner';
const ffprobeCmd = 'ffprobe -v error -show_streams -print_format json -show_entries stream=width,height,duration,tags ';

async function calcFrames(video, width, height) {
  if (undefined===video.duration) {
    debug('duration is undefined for ' + video.name);
    return;
  } else {
    if (width < 480) {
      width = settings.scale_width;
    }
    let ending;
    if (isNaN(video.duration)) {
      if (video.duration.indexOf(':') > -1) {
        // assumes duration is HH:MM:SS.mmmmmmmm
        let millisecondsIndex = video.duration.indexOf('.');
        if (millisecondsIndex > -1) {
          video.duration = video.duration.slice(0, millisecondsIndex);
        }
        let split = video.duration.split(':');
        ending = parseInt(split[2]) + parseInt(split[1]) * 60 + parseInt(split[0]) * Math.pow(60, 2);
        ending -= settings.credits_trim;
      } else {
        throw new Error('Unable to trim ending from video duration ' + video.duration);
      }
    } else {
      ending = video.duration - settings.credits_trim;
    }
    let cmd = `${video.frameCmd} -vf ` +
      `select=\'between(t\\,${settings.intro_delay}\\,${ending})*` +
      `not(mod(n\\,${settings.interval}))',` +
      `scale=${width}:${settings.scale_height}` +
      ` -vsync vfr ${video.dest}`;
    try {
      // change exec to spawn
      const {stderr, stdout} = await exec(cmd, {maxBuffer: 1024 * 500});
      if (stderr) {
        // debug('stderr');
        // debug(stderr);
      }
      if (stdout) {
        // debug(stdout);
      }
    } catch(e) {
      debug(`caught an error processing ${video.name}`);
      debug(e);
      throw e
    }
  }

}
async function probeFile(cmd) {
  try {
    const {stdout, stderr} = await exec(cmd);
    if (stderr) throw err;
    if (stdout) {
      let streams = JSON.parse(stdout).streams;
      let width, height, duration
      streams.forEach(s => {
        if (s.width && !width) {
          width = s.width;
        }
        if (s.height && !height) {
          height = s.height;
        }
        if (s.duration && !duration) {
          duration = s.duration;
        }
        if (!duration) {
          if (s.duration) {
            duration = parseInt(s.duration)
          } else if (s.tags) {
            let tags = Object.keys(s.tags).map(f=>{return f.toLowerCase()});
            let index = tags.indexOf('duration');
            if (index > -1) {
              let key = Object.keys(s.tags)[index];
              duration = s.tags[key];
            }
          }
        }
      });
      debug('width', width, 'height', height, 'duration', duration);
      return {width, height, duration};
    } else {
      debug(cmd);
      throw new Error(`stdout is empty`);
    }
  } catch(e) {
    debug('caught an error')
    throw e;
  }
}
async function runAndDump(createSubFolders, video, width, height) {
  if (createSubFolders) {
    try {
      await mkdir(video.saveTo);
    } catch(e) {
      if (e.code !== 'EEXIST') {
        throw e;
      }
    }
  }
  // debug(`processing ${video.name}`);
  await calcFrames(video, width, height);
  debug(`finished processing ${video.name}`);

}
async function processVideos(videos, createSubFolders, finish) {
  let nans = 0;
  let nonNans = 0;
  asyncJs.eachLimit(videos, 6, async (video) => {
    try {
      const {width, height, duration} = await probeFile(video.probe);
      video.duration = duration;
      if (undefined!==duration && duration.indexOf(':') > -1) {
        await runAndDump(createSubFolders, video, width, height);
        nonNans++;
      } else if (isNaN(duration)) {
        debug(`Unable to determine length of ${video.name}, skipping ...`);
        nans++;
      } else {
        await runAndDump(createSubFolders, video, width, height);
        nonNans++;
      }
    } catch(e) {
      throw e;
    }
  }, (e) => {
    if (e) {
      debug(e);
    } else {
      console.log(`Processed ${nonNans} video(s), skipped ${nans}`);
      finish();
    }
  });
}

const mapVideos = (videos, dump, createSubFolders, finish) => {
  dump = dump.replace(/([ ])/g, '\\$1')
  try {
    let mappedVideos = videos.map(video => {
      let parsed = path.parse(video);
      let input = jsesc(path.join(parsed.dir, parsed.base)).replace(/([ /])/g, '\\$1');
      let thumb = parsed.name + '%04d.png';
      let saveTo = dump;
      let dest = path.join(dump, thumb).replace(/([ /])/g, '\\$1');

      if (createSubFolders) {
        saveTo = path.join(dump, parsed.name);
        dest = path.join(saveTo, thumb).replace(/([ ])/g, '\\$1');
      }
      return {
        input: input,
        probe: ffprobeCmd + input,
        frameCmd: ffmpegCmd + ' -i ' + input,
        dest: dest,
        saveTo: saveTo,
        name: parsed.name
      };
    });
    finish(null, mappedVideos);
  } catch (e) {
    finish(e);
  }
}

const makeFrames = (videos, dump, createSubFolders, finish) => {
  if (!videos.length) {
    finish(new Error(`"videos" is empty!`));
  } else if (!dump) {
    finish(new Error(`"dump" is empty!`));
  } else {
    mapVideos(videos, dump, createSubFolders, async (err, mapped) => {
      if (err) {
        finish(err);
      } else {
        processVideos(mapped, createSubFolders, (err) => {
          finish(err);
        });
      }
    });
  }
}

module.exports = {
  makeFrames: makeFrames
}
