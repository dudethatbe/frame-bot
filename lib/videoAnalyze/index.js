const {EOL} = require('os');
const csv = require('fast-csv');
const debug = require('debug')('video_analyze');
const exec = require('child_process').exec;
const async = require('async');
const fs = require('fs');
const path = require('path');
const ffprobeCmd = 'ffprobe -v error -show_streams -print_format json -show_entries stream=width,height,duration,tags ';

const writeResults = (results, writeTo, finish) => {
  let csv_txt = [];
  let i = 0;
  results.forEach(c=>{
    csv_txt[i++] = [c.name.replace(/\\/g, ''), c.width, c.height, parseInt(c.duration)];
  });
  csv_txt[0] = ['name','width','height','duration'];
  csv.writeToPath(writeTo, csv_txt)
    .on('error', finish)
    .on('done', finish);
}
const getMetadata = (stdout, video, finish) => {
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
  finish(null, {
    name: video,
    width: width,
    height: height,
    duration: duration
  })
}
module.exports.report = (videos, output, finish) => {
  let results = [];
  videos = videos.map(v=>{return v.replace(/([\(\)'&\[\] /])/g, '\\$1'); });
  async.eachSeries(videos, (video, cb) => {
    let cmd = ffprobeCmd + ' ' + video;
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        cb(err);
      } else {
        getMetadata(stdout, video, (err, data) => {
          if (err) {
            cb(err);
          } else {
            results.push(data);
            cb(null);
          }
        });
      }
    });
  }, err => {
    if (err) {
      finish(err);
    } else {
      writeResults(results, output, finish);
    }
  });
}