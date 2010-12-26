--- 
wordpress_id: 158
layout: post
title: Local Gem Repository
wordpress_url: http://frozenplague.net/?p=158
---
<p style="text-align: left;">Wow, three Rails-related posts in a row. Sorry for people reading this blog for other things :)</p>
<p style="text-align: left;">Today's handy hint is how to get a local copy of all the gems on Rubyforge, so if you want them they're right there and ready to go. Handy if you don't have an internet connection.</p>

<pre lang="bash">#!/bin/bash
sudo wget http://gems.rubyforge.org/yaml -O yaml
sudo rsync -avu rsync://rubyforge.rubyuser.de/gems gems</pre>
is the code I use. I put it in a file called update_gems in my /var/www directory (default root dir for Apache on Ubuntu) and<em> chmod +x </em>it. From there, I run it and it firstly downloads the yaml file from gems.rubyforge.org containing the specification of all gems, and then synchronises the gems folder with the remote gem repositoy hosted at http://rubyforge.rubyuser.de.

So simple, so elegant, and so fast (apart from the initial multi-gigabyte download).

I keep a copy on my laptop.
