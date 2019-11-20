# frame-bot
Have a directory of video files you'd like to take some snapshots of? Feel like tweeting one of those random images afterwards? frame-bot may be for you.

## quick-start
Do you happen to have a folder of images stored, and all of the environment variables required to download something from dropbox and tweet it?

Note: before running this command, it assumes you have a folder structure like this:

```
reading_rainbow
|_____reading_rainbow_01
|     |___rdngrnbw00.jpg
|     |___rdngrnbw01.jpg
```

A random sub folder will be selected, and then a random frame will be chosen from the earlier selection. Check the script `bin/tweet_random_frame.js` for more

Be sure to create a `.env` file too.
```
CONSUMER_KEY=
CONSUMER_SECRET=
ACCESS_TOKEN_KEY=
ACCESS_TOKEN_SECRET=

CLIENT_ID=
CLIENT_SECRET=
ACCESS_TOKEN=
FOLDER=/reading_rainbow
```

```
npm run tweet-random
```

## system dependencies:
* [nodejs](https://nodejs.org/en/download/)
* [ffmpeg](https://ffmpeg.org/download.html)

## nodejs libraries
* [async](https://www.npmjs.com/package/async)
* [dashdash](https://www.npmjs.com/package/dashdash)
* [jsesc](https://www.npmjs.com/package/jsesc)
* [config](https://www.npmjs.com/package/config)

## optional:
* [twitter library](https://www.npmjs.com/package/twitter)
* [make a twitter app](https://developer.twitter.com/)

## how to use

### assumptions
* `frame-bot` has been cloned to the home directory 
  * `/home/dc/frame-bot`
* There is a directory named `Videos`
  * `/home/dc/Videos`
* There is at least one sub-directory in `Videos` that contain video files.
```
~/frame-bot$ ls -al ~/Videos/raf
-rw-rw-r--  1 dc dc 11854934 Feb  2  2018 RAF_SELF_CONTROL_1984-h0OWgzPQmfQ.mp4
```

### making frames

```
$ npm install
$ mkdir dump
$ node makeFrames.js -m -i ~/Videos/raf/ -o ./dump/
Finished processing RAF_SELF_CONTROL_1984-h0OWgzPQmfQ
Processed 1 videos, skipped 0
finished
$ ls dump
RAF_SELF_CONTROL_1984-h0OWgzPQmfQ0001.png  RAF_SELF_CONTROL_1984-h0OWgzPQmfQ0005.png
RAF_SELF_CONTROL_1984-h0OWgzPQmfQ0002.png  RAF_SELF_CONTROL_1984-h0OWgzPQmfQ0006.png
RAF_SELF_CONTROL_1984-h0OWgzPQmfQ0003.png  RAF_SELF_CONTROL_1984-h0OWgzPQmfQ0007.png
RAF_SELF_CONTROL_1984-h0OWgzPQmfQ0004.png  RAF_SELF_CONTROL_1984-h0OWgzPQmfQ0008.png

```

## makeFrame Settings
There is an object called ffmpegSettings in makeFrames. 
* `intro_delay`
  * specifies how many seconds to wait before the first frame should be taken. 
* `credits_trim`
  * is similar to `intro_delay`, but for the end of the video. The time specified in here will be the amount of time *before the video ends* to ignore. 
* `interval`
  * specifies how many frames should be made per second. For instance, if you wanted a frame for every three minutes, specify `1/180`. For more details check out this [help doc](https://trac.ffmpeg.org/wiki/Create%20a%20thumbnail%20image%20every%20X%20seconds%20of%20the%20video) from ffmpeg.
* `scale_width` and `scale_height`
  * scales and crops every image to these dimensions (px)

## tweet it
The `tweet.js` file is used to randomly select an image from the provided directory and include it in a tweet. To run it manually, you would have to declare the app's credentials in the process environment variables. Which is fine, but automating it would be more impressive. I was able to use the [scheduler](https://devcenter.heroku.com/articles/scheduler) on heroku (after creating an app and deploying frame-bot to it) with satisfactory results. Also, you can store the twitter credentials in your app's settings. In the scheduler, define a job to run
```
./bin/tweet.sh
```
This script will use node to run the `tweet.js` file and specifies a directory in dump.
