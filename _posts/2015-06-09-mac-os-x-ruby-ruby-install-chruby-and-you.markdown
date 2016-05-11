--- 
wordpress_id: RB-363
layout: post
title: Mac OS X, Ruby, ruby-install, chruby and You
---

**Last updated: April 26th, 2016**

<p>
  <strong>This beginner's guide will set up with Ruby 2.3.1, chruby, ruby-install and Rails 4.2.6 and is specifically written for a <em>development</em> environment on Mac OS X, but will probably work on many other operating systems with slight modifications.</strong>
</p>

<p>This guide is <em>almost</em> a copy of my older <a href='http://ryanbigg.com/2014/10/ubuntu-ruby-ruby-install-chruby-and-you/'>Ubuntu, Ruby, ruby-install, chruby, Rails and You</a> guide, but it's written primarily for Mac OS X.</p>

This guide will cover installing a couple of things:

* [**ruby-install**](https://github.com/postmodern/ruby-install): a very lightweight way to install multiple Rubies on the same box.
* [**chruby**](https://github.com/postmodern/chruby): a way to easily switch between those Ruby installs
* **Ruby 2.3.1**: at the time of writing the newest current stable release of Ruby.
* **Bundler**: a package dependency manager used in the Ruby community
* **Rails 4.2.6**: at the time of writing the newest current stable release of Rails.

By the end of this guide, you will have these things installed and have some very, very easy ways to manage gem dependencies for your different applications / libraries, as well as having multiple Ruby versions installed and usable all at once.

We assume you have `sudo` access to your machine, and that you have an understanding of the basic concepts of Ruby, such as "What is RubyGems?" and more importantly "How do I turn this computer-thing on?". This knowledge can be garnered by reading the first chapter of [any Ruby book](https://manning.com/black2).

If you're looking for a good Rails book, I wrote one called [Rails 4 in Action](http://manning.com/bigg2).

### Housekeeping

The first thing we're going to need to install is XCode which you can get from the Mac App Store. We'll use XCode to install the Command Line Tools which install some libraries that Ruby will use to compile itself.

    xcode-select --install

First of all, we're going to need to install some package management script so that we can install packages such as Git, MySQL and other things exceptionally easy. The best package management system on Mac OS X for this is [homebrew](https://brew.sh). We can install this by using this command:

    ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

Next, we'll install `chruby` and `ruby-install`.

    brew install chruby ruby-install

### ruby-install

First we fetch the ruby-install file, extract it into a directory, then make it. You can verify that these steps have worked by running the following command:

```
$ ruby-install -V
```

If you see this, then you've successfully installed ruby-install:

```
ruby-install: 0.6.0
```

### Ruby

Our next step is to install Ruby itself, which we can do with this command:

```
ruby-install --latest ruby
```

This command will take a couple of minutes, so grab your $DRINKOFCHOICE and go outside or something. Once it's done, we'll have Ruby 2.3.1 installed.

Now we'll need to load chruby automatically, which we can do by adding these lines to `~/.bashrc`:

```
source /usr/local/opt/chruby/share/chruby/auto.sh
```

In order for this to take effect, we'll need to source that file:

```
. ~/.bashrc
```

Alternatively, opening a new terminal tab/window will do the same thing.

To verify that chruby is installed and has detected our Ruby installation, run `chruby`. If you see this, then it's working:

```
ruby-2.3.1
```

Now we need to make that Ruby the default Ruby for our system, which we can do by creating a new file called `~/.ruby-version` with this content:

```
ruby-2.3.1
```

This file tells `chruby` which Ruby we want to use by default. To change the ruby version that we're using, we can run `chruby ruby-2.3.1` for example -- assuming that we have Ruby 2.3.1 installed first!

Did this work? Let's find out by running `ruby -v`:

```
ruby 2.3.1p112 (2016-04-26 revision 54768) [x86_64-darwin15]
```

### Rails

Now that we have a version of Ruby installed, we can install Rails. Because our Ruby is installed to our home directory, we don't need to use that nasty `sudo` to install things; we've got write-access! To install the Rails gem we'll run this command:

    gem install rails -v 4.2.6 --no-document

This will install the `rails` gem and the multitude of gems that it and its dependencies depend on, including Bundler.

### MySQL

Before you can use MySQL, you'll need to install it with Homebrew:

    brew install mysql

After this, `gem install mysql` should succeed.

### PostgreSQL

Before you can use PostgreSQL, you'll need to install it with Homebrew:

    brew install postgresql

After this, `gem install pg` should succeed.


### Fin

And that's it! Now you've got a Ruby environment you can use to write your (first?) Rails application in with such minimal effort. A good read after this would be the <a href='http://guides.rubyonrails.org'>official guides for Ruby on Rails</a>.

The combination of chruby and ruby-install is such a powerful tool and comes in handy for day-to-day Ruby development. Use it, and not the packages from apt to live a life of development luxury.

### Postscript

A previous version of this guide used RVM. RVM has overtime become bloated and unwieldy. There are many features of RVM that developers simply don't use, and so using a simpler solution is a better way of doing things as it will lead to less confusion. For instance, RVM provides gemsets which is a feature that is no longer necessary with the advent of Bundler. Even if you don't want to use Bundler (i.e. you're crazy) then there's smaller more specifically-targeted tools for that, such as [ohmygems](https://github.com/seattlerb/ohmygems). RVM's days as the leading way to install Ruby are over, and this guide has been updated to reflect that. There are better tools.

I've opted for chruby+ruby-install in this guide because they've consistently worked for me and are very, very easy to install. I know of a great many other people who have also used, and continue to use, these tools and I've not heard of any of them complaining. Therefore I can only wholeheartedly recommend them to the readers of this post.

