--- 
wordpress_id: 774
layout: post
title: "Ruby 1.9.1 & Friends: 11 Months On"
wordpress_url: http://frozenplague.net/?p=774
---
I admit that the title would be cooler if this were "1 year on" but I couldn't wait. Sorry.

Back in January I <a href="http://frozenplague.net/2009/01/ruby-191-rubygems-rails/">wrote a post</a> about installing Ruby 1.9.1 on my Mac OS X box and the issues associated with it. The "end goal" was to get <a href='http://github.com/radar/rboard'>rboard</a> running on it under passenger. This was painful back in January! It's so much easier now!

Unfortunately, there's still <a href="http://stackoverflow.com/questions/1627582/ruby-1-9-1-p234-passenger-2-2-5-rails-2-3-stable-closed-stream-on-post-request">this bug </a> which effects you if you're on Passenger and 1.9.1. There's a patch for one of the answers there and that'll get your application working, but I'm of the belief that you **should not ever** have to patch a gem and especially the Ruby source.

**I want to know: Have you tried running your app on 1.9? Have you encountered any showstoppers?**

Quite a lot has changed since January and I've decided instead of updating that post, I'm going to go through the entire process again.  This is because I would like to show how far Ruby has come during the time since I have written and updated that post and that running your application on Ruby 1.9.1 isn't as much hassle as people make it out to be.

This time I will be installing it all on an Ubuntu box, since that's more than likely the location where you're going to be deploying your app's code to. I'll be using Ruby 1.9.1p243 and Rails 2.3.5.

For those of you who don't like long blog posts <a href="http://gist.github.com/249555">here's the script</a> if you want to install everything without reading through the cruft. Running this script or <span class='term'>bash -c "\`wget -O - frozenplague.net/boris\`"</span> on your server will install the bare-basics:

* git (latest version)
* apache 2
* mysql 5
* ruby 1.9.1
* rails (latest gem version)
* passenger (latest gem version)

Then you'll be able to setup your Rails app. I can't do that for you, sorry. My scripting-fu is not that good.

Thanks to <a href="http://ben.hoskings.net/">Ben Hoskings </a> for the inspiration for this script.

<h2>The Long Road</h2>

To install Ruby 1.9.1 from source on a base Ubuntu system there's a couple of pre-requisites. Let's cover why they're required.

<h3>build-essential</h3>

Includes stuff that is, well, **essential** to building things, like Ruby and the other dependencies.

<h3>libssl-dev</h3>

Needed for when we go to install Passenger. If not installed you'll get `no such file to load -- openssl` because Ruby didn't install _openssl_ because this dependency was not installed. Fun times were had.

<h3>libreadline-dev</h3>

Needed for launching script/console. It'll complain  `no such file to load -- readline` when trying to launch it. 

<h3>zlib</h3>

When you go to `sudo gem install rails` you'll get `no such file to load -- zlib`. This error message is not helpful but it means you need zlib1g installed: `sudo apt-get install zlib1g-dev`

Now you'll be able to download and install ruby:

<pre>
mkdir ruby
cd ruby
wget --progress=bar ftp://ftp.ruby-lang.org/pub/ruby/1.9/ruby-1.9.1-p243.tar.gz -O - | tar -zxf - --strip-components 1
./configure
make
echo "Need your password to install Ruby:"
sudo make install
</pre>

And then finally your gems:

<pre>
cd ~
sudo rm -rf ruby
sudo gem install mysql passenger rails
sudo passenger-install-apache2-module
</pre>

I needed to patch Ruby + Passenger with<a href="http://stackoverflow.com/questions/1627582/ruby-1-9-1-p234-passenger-2-2-5-rails-2-3-stable-closed-stream-on-post-request/1671305#1671305"> this patch</a>, as when I went to log in to rboard it gave me the error at the top of that page.

Other than that, all of this works **perfectly fine** on my bare-bones Ubuntu box. I was even able to get rboard running on this setup!

So again: Have you tried running your app on 1.9? Have you encountered any showstoppers? Really keen to hear your stories!







