## project-status
This repo is still a WIP. Note the lack of badges 📛 and other indications of activity. There isn't a framework or much to install really. Just a couple of hard-to-read Nodejs scipts to allow you to do 2 fundamental things:
* take numerous screenshots from videos and save them to distinct directories
  * does the same thing in this FFMPEG guide https://trac.ffmpeg.org/wiki/Create%20a%20thumbnail%20image%20every%20X%20seconds%20of%20the%20video
  * but actually uses this `select` filter https://ffmpeg.org/ffmpeg-filters.html#toc-Examples-140
  * This is a "weak" process; only handles standard ascii characters in names (good luck with your animes). you have to be well aware of the videos dimensions, duration, and content before getting any results.
* retrieve an image file from Dropbox and attach it to a tweet
  * This requires you have both a Dropbox and Twitter app. You will have to be able to get access tokens for all of this to work. I have a empty repo https://github.com/dudethatbe/frame-bot-tweeter that is still in development. It requires a mongodb instance along with dropbox/twitter apps. These are easy to accomplish and free to most, but I plan on furthering the discussion there. 
Look in the "scripts" section of `package.json` to see which modules are used and their arguments.

## making-screenshots
This guide assumes you have a folder of video files and are reasonably comfortable with using ffprobe and ffmpeg with the command line. Make a `config` folder inside your cloned repo and create a file that will be used to generate these images; Something like `mkdir config && touch config/gumby.json`. Open up this json file and paste this:
```
{
  "frame_settings": {
    "intro_delay": 0,
    "credits_trim": 0,
    "interval": 800,
    "scale_width": 640,
    "scale_height": 480
  }
}
```

* `intro_delay`
  * number of ms to offset the image capturing (for skipping the "intro")

* `credits_trim`
  * similar to intro_delay, but sets the end of the captured images to be earlier than the duration

* `interval` 
  * number of ms to capture an image; e.g. ```800``` would get an image every 8 seconds

* `scale_width` 
  * scaled width of images 

* `scale_height` 
  * scaled height of images

From these properties, you can arbitrarily choose sections of a video to capture images from, and scale them to use the same dimensions. In the config file, edit the ```package.json``` file after finding the ```make-frames``` script. 
Set a ```NODE_ENV=gumby``` to configure this script to use the config file you just created. Then look for the ```-i``` argument and supply the input folder. For example:
```
"scripts": {
  "make-frames": "NODE_ENV=gumby DEBUG=makeframe_service node ./bin/make_frames.js -s -m -i /mnt/d/cool_videos/gumby_season_1 -o ./dump"
}
```
The last part is the ```-o dump``` argument. After you create the folder, all of the images will be saved there. From our earlier example, you would have a file/folder structure demonstrated below:
```
$ ls ./dump/Gumby\ -\ The\ Gumby\ League-Qq2BDoBNWPc/
'Gumby - The Gumby League-Qq2BDoBNWPc0001.png'  'Gumby - The Gumby League-Qq2BDoBNWPc0005.png'
'Gumby - The Gumby League-Qq2BDoBNWPc0002.png'  'Gumby - The Gumby League-Qq2BDoBNWPc0006.png'
'Gumby - The Gumby League-Qq2BDoBNWPc0003.png'  'Gumby - The Gumby League-Qq2BDoBNWPc0007.png'
'Gumby - The Gumby League-Qq2BDoBNWPc0004.png'  'Gumby - The Gumby League-Qq2BDoBNWPc0008.png'
```
Each video file will create a folder that will contain all of its related images. Personally, I find it's easiest to set the input value to a newly-created folder, move the intended video files into it, instead of getting the input path exactly right. It uses a lazy approach to escaping filenames, which means it isn't robust enough to handle a lot of variation with your input files.  YMMV 🛣 Look at the `bin/make_frames.js` for more details

## sharing-screenshots
So now that you have some folders of images, you'll undoubtedly want to share them. If you want to post them on twitter and happen to have a dropbox subscription, then continue reading this guide. If you're looking to host these elsewhere or post them on other platforms, then reach out to me with a new issue, but at the moment this is just what I had available at the time. 

Before we get too ahead of ourselves, you'll need to create two apps, one for twitter and one for dropbox. Once you have client IDs for each app, then you're pretty close to being able to tweet them. You will also need access tokens for both of these apps. Each time this script runs, it needs to use two sets of client and access tokens. It's not that confusing once you look at the `.env` file required to run the script:
```
CONSUMER_KEY=
CONSUMER_SECRET=
ACCESS_TOKEN_KEY=
ACCESS_TOKEN_SECRET=
```

The first group at the top are your twitter credentials. You'll need the app id and the client access tokens to be able to tweet as an account. The second group are the dropbox settings, including the folder to find these images from. The example shows `/gumby`. When you grant access to a dropbox application, it creates an `Apps` folder in your dropbox directory. Within that directory, you have to create a new directory and store these image-laden folders in. Working off our earlier example, the folder looks like:
`Apps/frame-bot/gumby` (the `frame-bot` part is the name of the application you apply to the dropbox app)

Now if you have the folders in the correct locations, the files are synced up, you got the credentials all set and ready to go, ready to press the button. Unleash your cruel monster to the trenches of twitter:

```
$ npm run tweet-random
```

What if you have a slightly different folder structure, maybe one that is less focused like one or two videos. What if you have `seasons` of videos or something like that? Well if it looks something like:
`Apps/frame-bot/gumby/season1`

```
$ npm run tweet-random-sub
```

This will find a folder in that `gumby` folder, select another folder like `season1`, and finally choose an image within there to tweet with.

That's all there really is to it. There is absolutely no special selection process to these images. If you have ever randomly chosen an element within a range of numbers with any programming language, then you already know how this works. Please please please feel free to create an issue if you are facing any problems or need help in general with this repository. 
