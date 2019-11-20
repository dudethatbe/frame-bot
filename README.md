## quick-start
So you want to make the worlds best out of context twitter bot, why not? First you'll need to make some images from these cool videos you want people to see on twitter. This repository contains a script that can make these image files ```make-frames```. This script assumes you have a ```test``` folder alongside the cloned ```frame-bot``` repo. Place one of those amazing video files inside this ```test``` folder. Extra points if you leave out any non-ascii characters  from the file's name ➕ While you're at it, create a ```dump``` folder, you'll need somewhere to put all these frames. 
So at this point, you're directory structure should resemble something like this
```
home
|__test
|   |__amazing_video.mp4
|__dump
|__frame-bot
```
At this point you can ```cd frame-bot```, install dependencies ```npm install```, and run ```npm run make-frames```. If you have ffmpeg, and that amazing video has display dimensions similar to the ones stored in ```config/development.json``` (also maybe a few minutes of length at least?) then you should have some images to browse in the dump:
```
home
|__test
|   |__amazing_video.mp4
|__dump
|   |__amazing_video
|          |_________amazing_video0001.png
|          |_________amazing_video0002.png
|          |_________...
|__frame-bot
```
If you have any issues and can verify that the command ```ffprobe -version``` works, then please share in the Issues 😁
#### assuming you have that folder of images...

Copy that ```amazing_video``` folder into your app's dropbox folder, we're nearly ready to tweet some truly gold material. A really important note about this next script is that it assumes you have a nested folder directory like this. 
```
great_videos
|_____amazing_video
|     |____________amazing_video0001.png
|     |____________amazing_video0002.png
```
So if my dropbox application name is ```frame-bot```, then I would store this ```amazing_video``` folder inside of ```great_videos```:
```
dropbox
|____Apps
|     |___frame-bot
|             |_____great_videos
|                        |_____amazing_video
|                                  |________amazing_video0001.png
|                                  |________amazing_video0002.png
```

This script will connect to your dropbox folder, find a sub folder (in our case, there's one only one to choose from), and then chooses a random file within this chosen folder. This image is downloaded, posted as a new status update with your twitter app/client credentials, and removed from the local disk. Check the script `bin/tweet_random_frame.js` for more details on how it chooses an image. There's nothing terribly complicated going on, if you've ever selected a random integer between 0 and a number ```n``` then you can keep up with it.

Be sure to create a `.env` file too.
```
CONSUMER_KEY=
CONSUMER_SECRET=
ACCESS_TOKEN_KEY=
ACCESS_TOKEN_SECRET=

CLIENT_ID=
CLIENT_SECRET=
ACCESS_TOKEN=
FOLDER=/great_videos
```

Now that everything is ready to go, give it a try with ```npm run tweet-random```
