--- 
wordpress_id: 1215
layout: post
title: Ubuntu, Ruby, RVM, Rails, and You
wordpress_url: http://ryanbigg.com/?p=1215
---


<p>
  <strong>This beginner's guide will set up with Ruby 1.9.3, RVM and Rails 3.0.7 and is specifically written for a <em>development</em> environment on Ubuntu 10.10, but will probably work on many other operating systems, including older versions of Ubuntu and Debian. YMMV.</strong>
</p>

<p>
<strong>If you're looking for a way to set this up on a production server then I would recommend the use of <a href='https://github.com/joshfng/railsready'>the railsready script</a> which installs all the necessary packages for Ruby 1.9.3p136 and then that version of Ruby itself, Bundler and Rails. Then it leaves it up to you to install Apache or nginx to get your application online.</strong>
</p>

<p>
  If you're not using Ubuntu then try <a href='https://github.com/wayneeseguin/rvm/raw/master/contrib/bootstrap_rails_environment'>Wayne E. Seguin's rails_bootstrap_script</a> which probably gets a version of Rails working for you, albeit with 1.8.7 rather than 1.9.3.
</p>


<h2>Under no circumstance should you install Ruby, Rubygems or any Ruby-related packages from apt-get. This system is out-dated and leads to major headaches. Avoid it for Ruby-related packages. We do Ruby, we know what's best. Trust us.</h2>

Still not convinced? <a href='http://news.ycombinator.org/item?id=2039438'>Read this</a>.

This guide will go through installing the <a href='http://rvm.beginrescueend.com'>RVM (Ruby Version Manager)</a>, then a version of Ruby (1.9.3), then <a href='http://rubyonrails.org'>Rails</a> and finally <a href='http://gembundler.com'>Bundler</a>. 

By the end of this guide, you will have these things installed and have some very, very easy ways to manage gem dependencies for your different applications / libraries, as well as having multiple Ruby versions installed and usable all at once. 

We assume you have `sudo` access to your machine, and that you have an understanding of the basic concepts of Ruby, such as "What is Rubygems?" and more importantly "How do I turn this computer-thing on?". This knowledge can be garnered by reading the first chapter of <a href='http://manning.com/black2'>any Ruby book</a>.

<h3>Housekeeping</h3>

First of all, we're going to run `sudo apt-get update` so that we have the latest sources on our box so that we don't run into any package-related issues, such as not being able to install some packages. 

Next, we're going to install <a href='http://git-scm.org'>Git (a version control system)</a> and `curl` which are both required to install and use RVM, and `build-essential` which is required to compile Ruby versions, amongst other compilable things. To install these three packages we use this command:

    sudo apt-get install build-essential git-core curl

<h3>RVM</h3>

RVM is a <a href='http://rvm.beginrescueend.com'>Ruby Version Manager</a> created by Wayne E. Seguin and is extremely helpful for installing and managing many different versions of Ruby all at once. Sometimes you could be working on a project that requires an older (1.8.7) version of Ruby but also need a new version (1.9.3) for one of your newer projects. This is a problem that RVM solves beautifully. 

Another situation could be that you want to have different sets of gems on the same version of Ruby but don't want to have to do deal with Gem Conflict Hell. RVM has <a href='http://rvm.beginrescueend.com/gemsets/basics/'>gemsets</a> for this. <strong>This is a feature you wouldn't have if you used the packaged Ruby</strong>.

We're going to use it to install only one version of Ruby, but we can <a href='http://rvm.beginrescueend.com'>consult the documentation</a> if we want to install a different version of Ruby. 

With `git-core` and `curl` installed we'll be able to install RVM with this command:

    bash < <(curl -s https://rvm.beginrescueend.com/install/rvm)

The beautiful part of this is that it installs Ruby to our home directory, providing a sandboxed environment just for us.

Once that's done, we're going to need to add a line to `~/.bashrc` file (the file responsible for setting up our bash session) which will load RVM:

    echo '[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"' >> ~/.bashrc 

Then we'll need to reload the `~/.bashrc` file which we can do with this small command:
   
    . ~/.bashrc

The next command we run will tell us what other packages we need to install for Ruby to work:

    rvm requirements
    ...
    # For Ruby / Ruby HEAD (MRI, Rubinius, & REE), install the following:
    ruby: /usr/bin/apt-get install build-essential openssl libreadline6 libreadline6-dev 
    curl git-core zlib1g zlib1g-dev libssl-dev libyaml-dev libsqlite3-0 libsqlite3-dev 
    sqlite3 libxml2-dev libxslt-dev autoconf libc6-dev ncurses-dev automake libtool 
    bison subversion

A couple of these packages we've already installed, such as `git-core` and `curl`. They won't be re-installed again. 

These packages will lessen the pain when we're working with Ruby. For example, the `libssl-dev` package will make OpenSSL support in Ruby work, `libsqlite3-0` and `libsqlite3-dev` are required for the `sqlite3-ruby` gem and the `libxml2-dev` and `libxslt-dev` packages are required for the `nokogiri` gem. Let's install all these packages now using this command:

    sudo apt-get install build-essential openssl libreadline6 libreadline6-dev curl git-core 
    zlib1g zlib1g-dev libssl-dev libyaml-dev libsqlite3-0 libsqlite3-dev sqlite3 libxml2-dev 
    libxslt-dev autoconf libc6-dev ncurses-dev automake libtool bison subversion
    
<strong>This command *must* be written on a single line, otherwise some of the packages will not install.</strong>

Now our Ruby lives will be as painless as possible.

<h3>Ruby</h3>

With RVM and these packages we can install Ruby 1.9.3:

    rvm install 1.9.3

This command will take a couple of minutes, so grab your $DRINKOFCHOICE and go outside or something. Once it's done, we'll have Ruby 1.9.3 installed. To begin using it we can use this lovely command:

    rvm use 1.9.3

Are we using 1.9.3? You betcha:

    ruby -v
    ruby 1.9.3p136 (2010-12-25 revision 30365) [x86_64-linux]

Or, even better, would be to make this the *default* for our user! Oooh, yes!

    rvm --default use 1.9.3

Now whenever we open a new bash session for this user we'll have Ruby available for us to use! Yay!

<h3>Rails</h3>

Now that RVM and a version of Ruby is installed, we can install Rails. Because RVM is installed to our home directory, we don't need to use that nasty `sudo` to install things; we've got write-access! To install the Rails gem we'll run this command:

    gem install rails

This will install the `rails` gem and the other 22 gems that it and its dependencies depend on, including Bundler.

<h3>MySQL</h3>

If you're planning on using the `mysql2` gem for your application then you'll want to install the `libmysqlclient16-dev` package before you do that. Without it, you'll get an error when the gem tries to compile its native extensions:

    Building native extensions.  This could take a while...
    ERROR:  Error installing mysql2:
    	ERROR: Failed to build gem native extension.

    /home/ryan/.rvm/rubies/ruby-1.9.3-p0/bin/ruby extconf.rb
    checking for rb_thread_blocking_region()... yes
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
    Could not create Makefile due to some reason, probably lack of
    necessary libraries and/or headers.  Check the mkmf.log file for more
    details.  You may need configuration options.

<h3>PostgreSQL</h3>

Similar to the `mysql2` gem's error above, you'll also get an error with the `pg` gem if you don't have the `libpq-dev` package installed you'll get this error:

        Building native extensions.  This could take a while...
    ERROR:  Error installing pg:
    	ERROR: Failed to build gem native extension.

    /home/ryan/.rvm/rubies/ruby-1.9.3-p0/bin/ruby extconf.rb
    checking for pg_config... no
    checking for libpq-fe.h... no
    Can't find the 'libpq-fe.h header
    *** extconf.rb failed ***
    Could not create Makefile due to some reason, probably lack of
    necessary libraries and/or headers.  Check the mkmf.log file for more
    details.  You may need configuration options.

<h3>Fin.</h3>

And that's it! Now you've got a Ruby environment you can use to write your (first?) Rails application in with such minimal effort. A good read after this would be the <a href='http://guides.rubyonrails.org'>official guides for Ruby on Rails</a>. Or perhaps the documentation on the <a href='http://rvm.beginrescueend.com'>RVM site</a> which goes into using things such as <a href='http://rvm.beginrescueend.com/gemsets/basics/'>gemsets</a> and the exceptionally helpful <a href='http://rvm.beginrescueend.com/workflow/rvmrc/#project'>per-project .rvmrc file</a>. A quick way to generate an `.rvmrc` file is to run a command like this inside the project:

    rvm use 1.9.3@rails3 --rvmrc

RVM is such a powerful tool and comes in handy for day-to-day Ruby development. Use it, and not the packages from apt to live a life of development luxury.

<h4>Credits</h4>

Thanks to <a href='http://twitter.com/krainboltgreene'>krainboltgreene</a> for pointing out that the guide needed to install the packages specified by rvm notes. He's got a similar <a href='http://krainboltgreene.github.com/l/3'>write up here for Ubuntu 10.04</a>. Some of the instructions in this guide were "inspired" by that post.

