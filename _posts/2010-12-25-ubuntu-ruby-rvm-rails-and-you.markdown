--- 
wordpress_id: 1215
layout: post
title: Ubuntu, Ruby, RVM, Rails, and You
wordpress_url: http://ryanbigg.com/?p=1215
---

<strong>Last updated: Friday 3rd January 2014</strong>

<p>
  <strong>This beginner's guide will set up with Ruby 2.1.0, RVM and Rails 4.0.2 and is specifically written for a <em>development</em> environment on Ubuntu 13.04, but will probably work on many other operating systems, including older / newer versions of Ubuntu and Debian. YMMV.</strong>
</p>

<p>
<strong>If you're looking for a way to set this up on a production server then I would recommend the use of <a href='https://github.com/joshfng/railsready'>the railsready script</a> which installs all the necessary packages for Ruby 2.1.0p0 and then that version of Ruby itself, Bundler and Rails. Then it leaves it up to you to install Apache or nginx to get your application online.</strong>
</p>

<h2>Under no circumstance should you install Ruby, Rubygems or any Ruby-related packages from apt-get. This system is out-dated and leads to major headaches. Avoid it for Ruby-related packages. We do Ruby, we know what's best. Trust us.</h2>

Still not convinced? <a href='http://news.ycombinator.org/item?id=2039438'>Read this</a>.

This guide will go through installing the <a href='http://rvm.io'>RVM (Ruby Version Manager)</a>, then a version of Ruby (2.1.0), then <a href='http://rubyonrails.org'>Rails</a> and finally <a href='http://gembundler.com'>Bundler</a>. 

By the end of this guide, you will have these things installed and have some very, very easy ways to manage gem dependencies for your different applications / libraries, as well as having multiple Ruby versions installed and usable all at once. 

We assume you have `sudo` access to your machine, and that you have an understanding of the basic concepts of Ruby, such as "What is RubyGems?" and more importantly "How do I turn this computer-thing on?". This knowledge can be garnered by reading the first chapter of <a href='http://manning.com/black2'>any Ruby book</a>.

If you're looking for a good Rails book, I wrote one called <a href='http://manning.com/bigg2'>Rails 4 in Action</a>.

<h3>Housekeeping</h3>

First of all, we're going to run `sudo apt-get update` so that we have the latest sources on our box so that we don't run into any package-related issues, such as not being able to install some packages. 

Next, we're going to install `curl`, which we'll use to fetch the RVM script:

    sudo apt-get install curl

<h3>RVM</h3>

RVM is a <a href='http://rvm.io'>Ruby Version Manager</a> created by Wayne E. Seguin and is extremely helpful for installing and managing many different versions of Ruby all at once. Sometimes you could be working on a project that requires an older (1.8.7) version of Ruby but also need a new version (2.1.0) for one of your newer projects. This is a problem that RVM solves beautifully. 

We're going to use it to install only one version of Ruby, but we can <a href='http://rvm.io'>consult the documentation</a> if we want to install a different version of Ruby. 

With `curl` installed we'll be able to install RVM with this command:

    curl -L get.rvm.io | bash -s stable

The beautiful part of this is that it installs RVM to our home directory, providing us with a sandboxed RVM installation that no other user on the system can touch. This will also add a line to `~/.bashrc`:

    PATH=$PATH:$HOME/.rvm/bin # Add RVM to PATH for scripting

And a couple of lines to `~/.bash_profile`:

    [[ -s "$HOME/.profile" ]] && source "$HOME/.profile"

    [[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"

*For a good explanation of when these two files are used, please see the [rbenv "Unix Shell Initialization" guide](https://github.com/sstephenson/rbenv/wiki/Unix-shell-initialization).

Then we'll need to source the `~/.rvm/scripts/rvm` file which we can do with this small command:
 
    source ~/.rvm/scripts/rvm

The next command we run will install the packages we need for Ruby to work:

    rvm requirements

Now our Ruby lives will be as painless as possible.

<h3>Ruby</h3>

With RVM and these packages we can install Ruby 2.1.0:

    rvm install 2.1.0

This command will take a couple of minutes, so grab your $DRINKOFCHOICE and go outside or something. Once it's done, we'll have Ruby 2.1.0 installed. To begin using it we can use this lovely command:

    rvm use 2.1.0

Are we using 2.1.0? You betcha:

    ruby -v
    ruby 2.1.0p0 (2013-12-25 revision 44422) [x86_64-linux]

Or, even better, would be to make this the *default* for our user! Oooh, yes! Noting the '2.0.0' side-note above, lets take note of the patchlevel, which in this case is '-p247' and add that to our default selection.

    rvm --default use 2.1.0

Now whenever we open a new bash session for this user we'll have Ruby available for us to use! Yay!

<h3>Rails</h3>

Now that RVM and a version of Ruby is installed, we can install Rails. Because RVM is installed to our home directory, we don't need to use that nasty `sudo` to install things; we've got write-access! To install the Rails gem we'll run this command:

    gem install rails -v 4.0.2

This will install the `rails` gem and the multitude of gems that it and its dependencies depend on, including Bundler.

<h3>MySQL</h3>

If you're planning on using the `mysql2` gem for your application then you'll want to install the `libmysqlclient-dev` package before you do that. Without it, you'll get an error when the gem tries to compile its native extensions:

    Building native extensions.  This could take a while...
    ERROR:  Error installing mysql2:
        ERROR: Failed to build gem native extension.

        /home/ryan/.rvm/rubies/ruby-2.1.0/bin/ruby extconf.rb
    checking for ruby/thread.h... yes
    checking for rb_thread_call_without_gvl() in ruby/thread.h... yes
    checking for rb_thread_blocking_region()... yes
    checking for rb_wait_for_single_fd()... yes
    checking for rb_hash_dup()... yes
    checking for rb_intern3()... yes
    checking for mysql_query() in -lmysqlclient... no
    checking for main() in -lm... yes
    checking for mysql_query() in -lmysqlclient... no
    checking for main() in -lz... yes
    checking for mysql_query() in -lmysqlclient... no
    checking for main() in -lsocket... no
    checking for mysql_query() in -lmysqlclient... no
    checking for main() in -lnsl... yes
    checking for mysql_query() in -lmysqlclient... no
    checking for main() in -lmygcc... no
    checking for mysql_query() in -lmysqlclient... no
    *** extconf.rb failed ***
    Could not create Makefile due to some reason, probably lack of necessary
    libraries and/or headers.  Check the mkmf.log file for more details.  You may
    need configuration options.



<h3>PostgreSQL</h3>

Similar to the `mysql2` gem's error above, you'll also get an error with the `pg` gem if you don't have the `libpq-dev` package installed you'll get this error:

    Building native extensions.  This could take a while...
    ERROR:  Error installing pg:
        ERROR: Failed to build gem native extension.

        /home/ryan/.rvm/rubies/ruby-2.1.0/bin/ruby extconf.rb
    checking for pg_config... no
    No pg_config... trying anyway. If building fails, please try again with
     --with-pg-config=/path/to/pg_config
    checking for libpq-fe.h... no
    Can't find the 'libpq-fe.h header
    *** extconf.rb failed ***
    Could not create Makefile due to some reason, probably lack of necessary
    libraries and/or headers.  Check the mkmf.log file for more details.  You may
    need configuration options.    

<h3>Fin.</h3>

And that's it! Now you've got a Ruby environment you can use to write your (first?) Rails application in with such minimal effort. A good read after this would be the <a href='http://guides.rubyonrails.org'>official guides for Ruby on Rails</a>. Or perhaps the documentation on the <a href='http://rvm.io'>RVM site</a>.

RVM is such a powerful tool and comes in handy for day-to-day Ruby development. Use it, and not the packages from apt to live a life of development luxury.

<h4>Credits</h4>

Thanks to <a href='http://twitter.com/krainboltgreene'>krainboltgreene</a> for pointing out that the guide needed to install the packages specified by rvm requirements. He's got a similar <a href='http://krainboltgreene.github.com/l/3'>write up here for Ubuntu 10.04</a>. Some of the instructions in this guide were "inspired" by that post.

This article has been translated to <a href="http://science.webhostinggeeks.com/zivot-radara">Serbo-Croatian</a> language by Anja Skrba from <a href="http://webhostinggeeks.com/"> Webhostinggeeks.com</a>.

