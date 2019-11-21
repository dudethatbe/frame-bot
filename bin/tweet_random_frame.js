require('dotenv').config();
const fs = require('fs');
const path = require('path');
const debug = require('debug')('tweet_random_frame');
const async = require('async');
// verify twitter settings
if (!process.env.CONSUMER_KEY) {
  throw new Error('Missing CONSUMER_KEY');
}
if (!process.env.CONSUMER_SECRET) {
  throw new Error('Missing CONSUMER_SECRET');
}
if (!process.env.ACCESS_TOKEN_KEY) {
  throw new Error('Missing ACCESS_TOKEN_KEY');
}
if (!process.env.ACCESS_TOKEN_SECRET) {
  throw new Error('Missing ACCESS_TOKEN_SECRET');
}
// verify dropbox settings
if (!process.env.CLIENT_ID) {
  throw new Error('Missing CLIENT_ID');
}
if (!process.env.CLIENT_SECRET) {
  throw new Error('Missing CLIENT_SECRET');
}
if (!process.env.ACCESS_TOKEN) {
  throw new Error('Missing ACCESS_TOKEN');
}
if (!process.env.FOLDER) {
  throw new Error('Missing FOLDER');
}
const getRandom = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
}
const dropboxV2Api = require('dropbox-v2-api');
const dropbox = dropboxV2Api.authenticate({
  client_id: process.env.CLIENT_ID,
  client_secret: process.env.CLIENT_SECRET,
  token: process.env.ACCESS_TOKEN
});
const Twitter = require('twitter');
const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});
const getEntries = (path, finish) => {
  dropbox({
    resource: 'files/list_folder',
    parameters: {
      path: path
    }
  }, finish);
}
const getRandomEntry = (res, finish) => {
  let entries = res.entries;
  debug(`${entries.length} entries found`);
  let random = entries[getRandom(entries.length)];
  debug(`Selected ${random.path_display}`);
  finish(null, random);
}
const getRandomFrame = (finish) => {
var selectedFolder, selectedFile;
async.waterfall([
  cb=>{
    getEntries(process.env.FOLDER, cb);
  },
  (res, response, cb) => {
    getRandomEntry(res, cb);
  },
  (selected, cb) => {
    selectedFolder = selected;
    debug(`Selected folder ${selectedFolder.path_display}`);
    getEntries(selectedFolder.path_lower, cb)
  }, 
  (res, response, cb) => {
    getRandomEntry(res, cb);
  }
], (err, result) => {
  if (err) {
    finish(err);
  } else {
    selectedFile = result;
    finish(null, selectedFile.path_display);
  }
});
}
const downloadFrame = (finish) => {
var framePath
async.waterfall([
  cb=>{
    getRandomFrame(cb)
  },
  (randomFrame, cb) => {
    frame = path.parse(randomFrame);
    debug(frame.base);
    framePath = path.join(__dirname, frame.base);
    let writable = fs.createWriteStream(framePath);
    debug(`downloading ${frame.base} ...`)
    dropbox({
      resource: 'files/download',
      parameters: {
        path: randomFrame
      }
    }).pipe(writable);
    writable.on('close', cb);
  }
], (err, result) => {
  if (err) {
    finish(err);
  } else {
    debug(`downloaded ${framePath}`)
    finish(null, framePath);
  }
});
}
const start = () => {
  let downloaded_file;
  async.waterfall([
    cb => {
      downloadFrame(cb);
    },
    (file, cb) => {
      downloaded_file = file;
      fs.readFile(file, cb);
    },
    (data, cb) => {
      client.post('media/upload', {media: data}, cb);
    }, 
    (media, e, cb) => {
      //debug('media', media);
      let status = {
        media_ids: media.media_id_string
      }
      client.post('statuses/update', status, cb);
    }, 
    (tweet, response, cb) => {
      debug(`${tweet.created_at} => ${tweet.text}`);
      fs.unlink(downloaded_file, cb)
    }
  ], err => {
    if (err) {
      throw err;
    } else {
      debug('finished');
    }
  })
}
start();
