--- 
wordpress_id: 35
layout: post
title: Damn Ubuntu!
wordpress_url: http://frozenplague.net/?p=35
---
"Yeah, it's a tomorrow problem." I said yesterday in regards to installing Ubuntu on the development server at work. Little did I know that it would cause so many hassles.

First of all the mirror at http://au.archive.ubuntu.org didn't have some packages, so I changed that to mirror.internode.on.net and that seemed to fix everything except for the nginx package. So I changed "dapper" to "feisty" in /etc/apt/sources.list and it found it and installed it. Then it decided to remove/alter some key features. That wasn't good. I tried compiling imagemagick, and that failed with a "cannot compile executable" error (which there are only ~700,000 results for on Google!). Then I tried doing apt-get install build-essential. That needed libc-dev which needed lib6c-dev, which needed gcc, which needed libc-dev. See my conundrum?

 So I hooked up the dev server to the Internode connection and pulled a cool 1mb/sec off their mirror and downloaded 7.04-server in just under 6 minutes. So I burnt that to another disk and went to install it, it got up to "Selecting and Installing Software" and hangs at 85% on update-manager-core.

EDIT: I have just tried installing it on my server, and it hangs at precisely the same point. I'm going to leave it on overnight and see if it progresses any further.

EDIT #2 (14th June 07): I was watching Medium last night and I heard the CD-drive open. I turned on my screen to see ubuntu had finished installing. Apparently it takes a while at that point. Also, you may need to do "sudo apt-get install update-manager-core". I didn't, thankfully, but I did see it automatically included in one of the installs I did this morning.

It's a tomorrow problem.

They also have a weird network setup. Five of the computers in the office seem to be on a Telstra connection (around 50kb/s), which goes something like PC -> another PC -> another PC -> Routr -> Internet, and the rest of the computers in the office are on an Internode connection (around 900-1200kb/s) which goes something like PC -> Router -> Internet.

All of the computers are plugged into the same switch, yet it's connecting to a different network. Maybe I'll have to have a play around with the route settings tomorrow.
