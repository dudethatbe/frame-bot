const path = require('path');
const fs = require('fs');

readDir = (target, finish) => {
  fs.readdir(target, (err, files) => {
    finish(err, files);
  });
}

isVideo = (item) => {
  return /\.webm|mkv|flv|ogv|avi|mp4$/.test(item);
}

hasVideo = (files, finish) => {
  if (!files) {
    finish(new Error(`"files" is empty!`));
  } else {
    finish(null, files.some(isVideo));
  }
}

getVideos = (target, finish) => {
  readDir(target, (err, files) => {
    if (err) {
      finish(err);
    } else {
      hasVideo(files, (err, result) => {
        if (err) {
          finish(err);
        } else {
          if (result) {
            finish(null, 
              files.filter(isVideo).map(file => {
                return path.join(target, file);
              }));
          } else {
            finish(new Error(`Unable to find any video files in "${target}"`));
          }
        }
      });
    }
  });
};

module.exports = {
  getVideos: getVideos
}