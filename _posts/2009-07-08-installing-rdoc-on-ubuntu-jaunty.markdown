--- 
wordpress_id: 645
layout: post
title: Installing RDoc on Ubuntu Jaunty
wordpress_url: http://frozenplague.net/?p=645
---
Something's changed since last time I played around with Ubuntu, some packages such as irb and rdoc live in the universal repository and, by default, this is disabled so when you go to install it it'll say it's not found:

<pre>
sudo apt-get install rdoc
Reading package lists... Done
Building dependency tree       
Reading state information... Done
Package rdoc is not available, but is referred to by another package.
This may mean that the package is missing, has been obsoleted, or
is only available from another source
E: Package rdoc has no installation candidate
</pre>

Uncomment the following lines using <span class='term'>sudo vim /etc/apt/sources.list</span>:

<pre>
#deb http://us.archive.ubuntu.com/ubuntu/ jaunty universe
#deb-src http://us.archive.ubuntu.com/ubuntu/ jaunty universe
#deb http://us.archive.ubuntu.com/ubuntu/ jaunty-updates universe
#deb-src http://us.archive.ubuntu.com/ubuntu/ jaunty-updates universe
</pre>

And then run <span class='term'>sudo apt-get update</span> and you should be able to install <span class='term'>irb</span> and <span class='term'>rdoc</span> now. 

rdoc is required for installing rubygems, and that's where I got hung up for a couple of minutes before I found the <a href='http://www.ruby-lang.org/en/downloads/'>docs on ruby-lang.org</a> under Ruby on Linux.
