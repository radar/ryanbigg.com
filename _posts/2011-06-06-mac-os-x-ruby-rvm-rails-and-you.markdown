--- 
wordpress_id: RB-307
layout: post
title: Mac OS X, Ruby, RVM, Rails and You
---



<p>
  <strong>This beginner's guide will set up with Ruby 1.9.2, RVM and Rails 3.0.7 and is specifically written for a <em>development</em> environment on Mac OS X, but will probably work on many other operating systems with slight modifications.</strong>
</p>

<p>This guide is <em>almost</em> a copy of my older <a href='http://ryanbigg.com/2010/12/ubuntu-ruby-rvm-rails-and-you/'>Ubuntu, Ruby, RVM, Rails and You</a> guide, but it's written primarily for Mac OS X.</p>

<p>
  If you're looking for a quick-n-dirty way, then try <a href='https://github.com/wayneeseguin/rvm/raw/master/contrib/bootstrap_rails_environment'>Wayne E. Seguin's rails_bootstrap_script</a> which probably gets a version of Rails working for you, albeit with 1.8.7 rather than 1.9.2.
</p>

<h2>Under no circumstance should you install Ruby, Rubygems or any Ruby-related packages from apt-get. This system is out-dated and leads to major headaches. Avoid it for Ruby-related packages. We do Ruby, we know what's best. Trust us.</h2>

Still not convinced? <a href='http://news.ycombinator.org/item?id=2039438'>Read this</a>.

This guide will go through installing the <a href='http://rvm.beginrescueend.com'>RVM (Ruby Version Manager)</a>, then a version of Ruby (1.9.2), then <a href='http://rubyonrails.org'>Rails</a> and finally <a href='http://gembundler.com'>Bundler</a>. 

By the end of this guide, you will have these things installed and have some very, very easy ways to manage gem dependencies for your different applications / libraries, as well as having multiple Ruby versions installed and usable all at once. 

We assume you have `sudo` access to your machine, and that you have an understanding of the basic concepts of Ruby, such as "What is Rubygems?" and more importantly "How do I turn this computer-thing on?". This knowledge can be garnered by reading the first chapter of <a href='http://manning.com/black2'>any Ruby book</a>.

<h3>Housekeeping</h3>

The first thing we're going to need to install is XCode, which can be found on the second DVD of your install disks or, alternatively, on the Mac App Store for $5. It's a big download, so you may want to find the DVDs again. We're going to need this for the build tools that it installs to install Ruby and other packages.

First of all, we're going to need to install some package management script so that we can install packages such as Git, MySQL and other things exceptionally easy. The best package management system on Mac OS X for this is <a href='https://github.com/mxcl/homebrew'>homebrew</a>. We can install this by using this command:

    ruby -e "$(curl -fsSL https://gist.github.com/raw/323731/install_homebrew.rb)"

Once it's installed, we'll be able to install the package for <a href='http://git-scm.org'>Git</a> by using a simple command like this:

    brew install git

We'll need Git to install RVM as it clones it from <a href='http://github.com/wayneeseguin/rvm'>RVM's GitHub repository</a>.

<h3>RVM</h3>

RVM is a <a href='http://rvm.beginrescueend.com'>Ruby Version Manager</a> created by Wayne E. Seguin and is extremely helpful for installing and managing many different versions of Ruby all at once. Sometimes you could be working on a project that requires an older (1.8.7) version of Ruby but also need a new version (1.9.2) for one of your newer projects. This is a problem that RVM solves beautifully. 

Another situation could be that you want to have different sets of gems on the same version of Ruby but don't want to have to do deal with Gem Conflict Hell. RVM has <a href='http://rvm.beginrescueend.com/gemsets/basics/'>gemsets</a> for this. <strong>This is a feature you wouldn't have if you used the packaged Ruby</strong>.

We're going to use it to install only one version of Ruby, but we can <a href='http://rvm.beginrescueend.com'>consult the documentation</a> if we want to install a different version of Ruby. 

With `git-core` and `curl` installed we'll be able to install RVM with this command:

    bash < <(curl -s https://rvm.beginrescueend.com/install/rvm)

The beautiful part of this is that it installs Ruby to our home directory, providing a sandboxed environment just for us.

Once that's done, we're going to need to add a line to `~/.bashrc` file (the file responsible for setting up our bash session) which will load RVM:

    echo '[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"' >> ~/.bash_profile 

Then we'll need to reload the `~/.bashrc` file which we can do with this small command:
   
    . ~/.bash_profile

If we run `rvm notes` we'll be told the certain things that we need to have installed to install the different versions of Ruby:

    Notes for Darwin ( Mac OS X )
        For Snow Leopard be sure to have Xcode Tools Version 3.2.1 (1613) or later
        You should download the latest Xcode tools from developer.apple.com.
          (This is since the dvd install for Snow Leopard contained bugs).

        If you intend on installing MacRuby you must install LLVM first.
        If you intend on installing JRuby you must install the JDK.
        If you intend on installing IronRuby you must install Mono (version 2.6 or greater is recommended).
        
We're not going to be using MacRuby, JRuby or IronRuby in this guide so we won't need to install any of those things. If we have XCode installed we will have everything we need to install Ruby.

Now our Ruby lives will be as painless as possible.

<h3>Ruby</h3>

With RVM and XCode installed we can install Ruby 1.9.2:

    rvm install 1.9.2

This command will take a couple of minutes, so grab your $DRINKOFCHOICE and go outside or something. Once it's done, we'll have Ruby 1.9.2 installed. To begin using it we can use this lovely command:

    rvm use 1.9.2

Are we using 1.9.2? You betcha:

    ruby -v
    ruby 1.9.2p136 (2010-12-25 revision 30365) [x86_64-linux]

Or, even better, would be to make this the *default* for our user! Oooh, yes!

    rvm --default use 1.9.2

Now whenever we open a new bash session for this user we'll have Ruby available for us to use! Yay!

<h3>Rails</h3>

Now that RVM and a version of Ruby is installed, we can install Rails. Because RVM is installed to our home directory, we don't need to use that nasty `sudo` to install things; we've got write-access to our own things! To install the Rails gem we'll run this command:

    gem install rails

This will install the `rails` gem and the other 22 gems that it and its dependencies depend on, including Bundler.

<h3>MySQL</h3>

If you're planning on using the `mysql2` gem for your application then you'll want to install the `mysql` Homebrew package using this command:

    brew install mysql

If you're using Rails 3.0 then you'll need to specify a 0.2.x version of the `mysql2` gem in your Gemfile:

    gem 'mysql2', '~> 0.2.7'

If you're using Rails 3.1, then this line will get it:

    gem 'mysql2'

<h3>PostgreSQL</h3>

If you want to use PostgreSQL instead of MySQL:

    brew install postgresql

Then in the application's `Gemfile` use the `pg` gem:

    gem 'pg'

<h3>Fin.</h3>

And that's it! Now you've got a Ruby environment you can use to write your (first?) Rails application in with such minimal effort. A good read after this would be the <a href='http://guides.rubyonrails.org'>official guides for Ruby on Rails</a>. Or perhaps the documentation on the <a href='http://rvm.beginrescueend.com'>RVM site</a> which goes into using things such as <a href='http://rvm.beginrescueend.com/gemsets/basics/'>gemsets</a> and the exceptionally helpful <a href='http://rvm.beginrescueend.com/workflow/rvmrc/#project'>per-project .rvmrc file</a>. A quick way to generate an `.rvmrc` file is to run a command like this inside the project

    rvm use 1.9.2@rails3 --rvmrc

RVM is such a powerful tool and comes in handy for day-to-day Ruby development. Use it, and not the packages from apt to live a life of development luxury.

