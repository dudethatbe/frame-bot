## project-status
This is very much a WIP. Note the distinct lack of badges 📛 There isn't a framework or much to install for dependencies. Essentially this repo is a collection of nodejs scipts to allow you to do 2 fundamental things:
* take x screenshots from video files and save them to a directory
  * Mostly-reliant on this guide https://trac.ffmpeg.org/wiki/Create%20a%20thumbnail%20image%20every%20X%20seconds%20of%20the%20video
  * Still pretty fragile process; Can't handle files with `&`, `"`, or any other terrible characters you can include in a filename
* retrieve image from Dropbox and attach it to a tweet
  * This requires you have both a Dropbox and Twitter app. You will have to login or grant access to these apps to your accounts in order for this to work. I have a empty repo https://github.com/dudethatbe/frame-bot-tweeter that is still in development. It requires a mongodb 
  instance along with dropbox/twitter apps. These are easy to accomplish and free to most, but I plan on furthering the discussion there. 
  
  This repo will be more of a utilitarian set of scripts to get you started I guess? 

## guide
This repository contains a script that can make these image files ```make-frames```. This script assumes you have a ```test``` folder alongside the cloned ```frame-bot``` repo. Place one of those amazing video files inside this ```test``` folder. Extra points if you leave out any non-ascii characters  from the file's name ➕ While you're at it, create a ```dump``` folder inside of this repo, you'll need somewhere to put all these frames. 
So at this point, you're directory structure should resemble something like this
```
home
|__test
|   |__amazing_video.mp4
|__frame-bot
|      |__dump
```
At this point you can ```cd frame-bot```, install dependencies ```npm install```, and run ```npm run make-frames```. If you have ffmpeg, and that amazing video has display dimensions similar to the ones stored in ```config/development.json```, then you should have some images to browse in the `dump` folder:
```
home
|__test
|   |__amazing_video.mp4
|__frame-bot
|    |__dump
|        |__amazing_video
|                |_________amazing_video0001.png
|                |_________amazing_video0002.png
|                |_________...
```
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
If you have any issues and can verify that the command ```ffprobe -version``` works, then please share in the Issues 😁

#### assuming you have that folder of images...

Copy the ```amazing_video``` folder into your app's dropbox folder. A really important note about this next script is that it assumes you have a nested folder directory like this. 
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

This script will connect to your dropbox folder, find a sub folder (in our case, there's one only one to choose from), and then chooses a random file within this chosen folder. This image is downloaded, posted as a new status update with your twitter app/client credentials, and removed from the local disk. Check the script `bin/tweet_random_frame.js` for more details on how it chooses an image. 

Support for subfolders has been added `npm run tweet-random-sub` so if you categorize your dropbox folders in a Season -> Episode type of format, then it will be able to select and tweet and image from this structure:
```
dropbox
|____Apps
|     |___frame-bot
|             |_____great_videos
|             .          |_____amazing_video
|             .                    |________amazing_video0001.png
|             .                    |________amazing_video0002.png
|             |_____neat_videos
|             .          |_____alright_video
|             .                    |________alright_video0001.png
|             .                    |________alright_video0002.png
```