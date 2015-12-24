--- 
wordpress_id: RB-358
layout: post
title: Ubuntu, Ruby, ruby-install, chruby, Rails and You
---

**Last updated: 7th December 2015**


**This beginner's guide will set your machine up with Ruby 2.2.3 using chruby+ruby-install and Rails 4.2.5 and is specifically written for a _development_ environment on Ubuntu 14.04, but will probably work on many other operating systems, including older / newer versions of Ubuntu and Debian. YMMV.**

## Under no circumstance should you install Ruby, Rubygems or any Ruby-related packages from apt-get. This system is out-dated and leads to major headaches. Avoid it for Ruby-related packages. We do Ruby, we know what's best. Trust us.

This guide will cover installing a couple of things:

* [**ruby-install**](https://github.com/postmodern/ruby-install): a very lightweight way to install multiple Rubies on the same box.
* [**chruby**](https://github.com/postmodern/chruby): a way to easily switch between those Ruby installs
* **Ruby 2.2.3**: at the time of writing the newest current stable release of Ruby.
* **Bundler**: a package dependency manager used in the Ruby community
* **Rails 4.2.5**: at the time of writing the newest current stable release of Rails.

By the end of this guide, you will have these things installed and have some very, very easy ways to manage gem dependencies for your different applications / libraries, as well as having multiple Ruby versions installed and usable all at once.

We assume you have `sudo` access to your machine, and that you have an understanding of the basic concepts of Ruby, such as "What is RubyGems?" and more importantly "How do I turn this computer-thing on?". This knowledge can be garnered by reading the first chapter of [any Ruby book](https://manning.com/black2).

If you're looking for a good Rails book, I wrote one called [Rails 4 in Action](http://manning.com/bigg2).

### Housekeeping

First of all, we're going to run `sudo apt-get update` so that we have the latest sources on our box so that we don't run into any package-related issues, such as not being able to install some packages.

Next, we'll run another command which will install the essential building tools that will be used to install Ruby:

```
sudo apt-get install build-essential
```

And now we're ready to install ruby-install.

### ruby-install

The installation instructions can be found [on the README of ruby-install](https://github.com/postmodern/ruby-install#install), but I'll repeat them here so you don't have to go over there:

```
wget -O ruby-install-0.5.0.tar.gz \
  https://github.com/postmodern/ruby-install/archive/v0.5.0.tar.gz
tar -xzvf ruby-install-0.5.0.tar.gz
cd ruby-install-0.5.0/
sudo make install
```

First we fetch the ruby-install file, extract it into a directory, then make it. You can verify that these steps have worked by running the following command:

```
$ ruby-install -V
```

If you see this, then you've successfully installed ruby-install:

```
ruby-install: 0.5.0
```

### Ruby

Our next step is to install Ruby itself, which we can do with this command:

```
ruby-install ruby 2.2.3
```

This command will take a couple of minutes, so grab your $DRINKOFCHOICE and go outside or something. Once it's done, we'll have Ruby 2.2.3 installed. In order to use this Ruby version, we'll need to install chruby as well. The instructions [can be found in chruby's README](https://github.com/postmodern/chruby#install) too, but I will reproduce them here:

```
wget -O chruby-0.3.9.tar.gz \
  https://github.com/postmodern/chruby/archive/v0.3.9.tar.gz
tar -xzvf chruby-0.3.9.tar.gz
cd chruby-0.3.9/
sudo make install
```

After this has been installed, we'll need to load chruby automatically, which we can do by adding these lines to your shells configuration file using the following command:

```
cat >> ~/.$(basename $SHELL)rc <<EOF
source /usr/local/share/chruby/chruby.sh
source /usr/local/share/chruby/auto.sh
EOF
```

In order for this to take effect, we'll reload the shell

```
exec $SHELL
```

Alternatively, opening a new terminal tab/window will do the same thing.

To verify that chruby is installed and has detected our Ruby installation, run `chruby`. If you see this, then it's working:

```
ruby-2.2.3
```

Now we need to make that Ruby the default Ruby for our system, which we can do by creating a new file called `~/.ruby-version` with this content:

```
ruby-2.2.3
```

This file tells `chruby` which Ruby we want to use by default. To change the ruby version that we're using, we can run `chruby ruby-2.2.3` for example -- assuming that we have Ruby 2.2.3 installed first!

Did this work? Let's find out by running `ruby -v`:

```
ruby 2.2.3p173 (2015-08-18 revision 51636) [x86_64-linux]
```

### Rails

Now that we have a version of Ruby installed, we can install Rails. Because our Ruby is installed to our home directory, we don't need to use that nasty `sudo` to install things; we've got write-access! To install the Rails gem we'll run this command:

    gem install rails -v 4.2.5 --no-rdoc --no-ri

This will install the `rails` gem and the multitude of gems that it and its dependencies depend on, including Bundler.

### MySQL

If you're planning on using the `mysql2` gem for your application then you'll want to install the `libmysqlclient-dev` package before you do that. Without it, you'll get an error when the gem tries to compile its native extensions:

    Building native extensions.  This could take a while...
    ERROR:  Error installing mysql2:
        ERROR: Failed to build gem native extension.

        /home/ryan/.rubies/ruby-2.2.0/bin/ruby extconf.rb
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

Install this package using `sudo apt-get install libmysqlclient-dev`.

### PostgreSQL

Similar to the `mysql2` gem's error above, you'll also get an error with the `pg` gem if you don't have the `libpq-dev` package installed you'll get this error:

    Building native extensions.  This could take a while...
    ERROR:  Error installing pg:
        ERROR: Failed to build gem native extension.

        /home/ryan/.rubies/ruby-2.2.0/bin/ruby extconf.rb
    checking for pg_config... no
    No pg_config... trying anyway. If building fails, please try again with
     --with-pg-config=/path/to/pg_config
    checking for libpq-fe.h... no
    Can't find the 'libpq-fe.h header
    *** extconf.rb failed ***
    Could not create Makefile due to some reason, probably lack of necessary
    libraries and/or headers.  Check the mkmf.log file for more details.  You may
    need configuration options.

Install this package using `sudo apt-get install libpq-dev`.

### SQLite3

Just like MySQL and PostgreSQL before it, attempting to install the `sqlite3` gem will result in this:

    Gem::Ext::BuildError: ERROR: Failed to build gem native extension.

        /home/ryan/.rubies/ruby-2.2.0/bin/ruby extconf.rb
    checking for sqlite3.h... no
    sqlite3.h is missing. Try 'port install sqlite3 +universal',
    'yum install sqlite-devel' or 'apt-get install libsqlite3-dev'
    and check your shared library search path (the
    location where your sqlite3 shared library is located).
    *** extconf.rb failed ***
    Could not create Makefile due to some reason, probably lack of necessary
    libraries and/or headers.  Check the mkmf.log file for more details.  You may
    need configuration options.

Fix this issue by running `sudo apt-get install libsqlite3-dev`.

### JavaScript Runtime

Rails requires a JavaScript runtime to run its precompile step for the asset pipeline. If you attempt to run `rake assets:precompile` without one of these, you'll see this message:

    ExecJS::RuntimeUnavailable: Could not find a JavaScript runtime. See https://github.com/sstephenson/execjs for a list of available runtimes.

To fix this error install `nodejs`, which comes with a JavaScript runtime:

```
sudo apt-get install nodejs
```

### Fin

And that's it! Now you've got a Ruby environment you can use to write your (first?) Rails application in with such minimal effort. A good read after this would be the <a href='http://guides.rubyonrails.org'>official guides for Ruby on Rails</a>.

The combination of chruby and ruby-install is such a powerful tool and comes in handy for day-to-day Ruby development. Use it, and not the packages from apt to live a life of development luxury.

### Postscript

A previous version of this guide used RVM. RVM has overtime become bloated and unwieldy. There are many features of RVM that developers simply don't use, and so using a simpler solution is a better way of doing things as it will lead to less confusion. For instance, RVM provides gemsets which is a feature that is no longer necessary with the advent of Bundler. Even if you don't want to use Bundler (i.e. you're crazy) then there's smaller more specifically-targeted tools for that, such as [ohmygems](https://github.com/seattlerb/ohmygems). RVM's days as the leading way to install Ruby are over, and this guide has been updated to reflect that. There are better tools.

I've opted for chruby+ruby-install in this guide because they've consistently worked for me and are very, very easy to install. I know of a great many other people who have also used, and continue to use, these tools and I've not heard of any of them complaining. Therefore I can only wholeheartedly recommend them to the readers of this post.

