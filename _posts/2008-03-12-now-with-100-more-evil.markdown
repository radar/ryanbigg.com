--- 
wordpress_id: 141
layout: post
title: Now With 100% More Evil
wordpress_url: http://frozenplague.net/2008/03/12/now-with-100-more-evil/
---
So I installed Ubuntu on my main computer to give me some distraction from that lovely TF2 icon sitting in RocketDock, and so I could use Git (that's another story altogether). Everything worked beautifully! I installed it two nights ago at 12am, shortly before going to bed and got up halfway through the night to finish the installation process and set a few downloads (build-essential mozilla-thunderbird ruby1.8-dev ruby1.8 irb rake rubygems rails mongrel apache2 mysql-server5.0) going, and then went back to bed. I didn't mind the fact that both my screens were clones of the same window at this time of the morning.

I got up and tried to do some coding but I <strong>needed </strong>my dual-screens. So I went on the nvidia site and downloaded the drivers and then I had to kill X to install them. So that's what happened. Installed the drivers fine, loaded it all up again and it was perfect! nvidia-settings was my next installed item, which gave way to <strong>ultimate dual-screening glory </strong>and my coding for the rest of the day. It was sunshine, rainbows, lollipops, unicorns, fluffy bunnies <strong>and more</strong>. It was beautiful. I was at peace.

Until the kernel updates came through.
<blockquote>
<blockquote>
<blockquote>
<blockquote>
<blockquote>
<blockquote>
<blockquote><em>"Please restart your computer"</em></blockquote>
</blockquote>
</blockquote>
</blockquote>
</blockquote>
</blockquote>
</blockquote>
And so I did. That's where the fun started.  Upon rebooting my computer all hell broke loose. The rainbows turned to rainclouds, the lollipops to tofu, the unicorns to rottweilers and the fluffy bunnies to those burning head things from Doom. Ubuntu had launched itself into low graphics mode.

But I was young and naive! I thought "surely I can just click this configure button, set it to the proper settings and it will work perfectly". I was stupid. Upon clicking the OK button, it launched me into a black screen of doom for all eternity. Until I pressed the reset button. I did this a few more times until I figured out the Ubuntu low-graphics dialog <strong>is a piece of crap, and should never be trusted.</strong>

Launching into the recovery console got me further (as I was actually able to type) so I ran <em>dpkg-reconfigure xserver-xorg</em>  and the driver's install again and X started perfectly. Everything was reverted back to the sunshine-land state of rainbows, lollipops, unicorns and fluffy bunnies. Running <em>nvidia-settings </em>again worked, and I even restarted X just to make double sure it wouldn't happen again.

I launched straight back into my coding with gusto, but got sick of listening to the radio, especially those new songs by Rihanna, Souljah Boy, Akon and so on. I wanted my music. I thought, no problem! I'll just install <em>ntfsprogs </em>and mount my Windows partition.

Apparently my windows partition hadn't shut down properly (it requires lulling to sleep on a bed of silk sheets with velvet pillows whilst listening to Chopin), so I rebooted and launched into Windows only to shut it down, this time I hoped properly. I went back into Ubuntu and low-graphics mode made it's stunning return.

More than likely at this point I made some choice remarks about Ubuntu, none of which should ever be repeated since Ubuntu is my bitch now, and the neighbours on all four sides (behind, left, right and across the street) probably made out what I was saying with minimal effort. Again the whole rebooting into recovery console and re-installing the drivers.

That was yesterday. Today I turned on my computer and I knew that low-graphics mode was going to come up, so I went into the recovery console and did my thing, and it all worked perfectly. <strong>But it was annoying! I did not want to do this every time I booted my computer! Why should I?</strong>

I looked for a solution, and even grumbled about it in #rubyonrails on freenode, until a user by the name of dfr came along and suggested a few things. He told me there's more than just running the drivers, you can specify options like it not asking you questions at all and automatically accepting the license agreement. So I hacked up a nice file that now lives in /root/fix-stuff, that looks a little like:

#!/bin/bash
./NVIDIA-Linux-x86-169.12-pkg1.run --no-x-check --no-recursion -N -b --no-runlevel-check -n -q -a

Which is called from /etc/rc.local (a file that runs on every runlevel) which reinstalls the drivers for me on every boot.

The options are, obvious, obvious (doesn't check for conflicting files deeper than the surface), no networking, no backup,obvious, no precompiled interface, don't ask any questions and I agree with the user agreement!

On another topic, I'm sick of the 20 spam posts per day so I finally got around to getting a Wordpress API key. If you look at the bottom of the template you should see a counter to exactly how much spam this has killed. So, all you spam-whores: Go away.

So there you go, that's why I'm now 100% more evil, and 100% happier.
