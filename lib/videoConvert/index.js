const debug = require('debug')('video_convert');
const { spawn } = require('child_process');
const path = require('path');
const async = require('async');
const config = require('config');
const settings = config.get('frame_settings');

const processVideos = (videos, output, ext, finish) => {
  async.eachLimit(videos, 8, (video, cb) => {
    let parts = path.parse(video);
    let convertedFileName = `${parts.name}.${ext}`;
    let out = path.join(output, convertedFileName);
    let width = settings.scale_width, height = settings.scale_height;
    let cmd = `ffmpeg -hide_banner -i ${video} -vf scale=${width}:${height} -use_odml false ${out}`;
    let spawnOpts = {};
    const ffmpeg = spawn('ffmpeg', ['-hide_banner', '-i', video, '-vf', `scale=${width}:${height}`, out], spawnOpts);
    debug(`converting ${video} to "${convertedFileName}"`);
    ffmpeg.stdout.on('data', data => {
      // debug(data);
    });
    ffmpeg.stderr.on('data', data => {
      debug(data.toString('utf8'));
    });
    ffmpeg.on('close', code => {
      debug('finished processing ' + video);
      if (parseInt(code)!==0) {
        debug(`close code: ${code}`);
        cb(new Error('something went wrong with ' + cmd));
      } else {
        cb(null);
      }
    });
  }, finish);
}
module.exports.convertVideos = (videos, output, ext, finish) => {
  if (!videos.length) {
    finish(new Error('"videos" is empty'));
  } else {
    processVideos(videos, output, ext, finish);
  }
}