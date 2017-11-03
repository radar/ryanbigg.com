--- 
wordpress_id: RB-1509680637
layout: post
title: How require loads a gem
---

In modern versions of Ruby, you can use the good old `require` method to load a gem.
For instance, if you've got the gem `activesupport` installed, you can require
everything inside of activesupport (including the kitchen sink) with this line:

```
require 'active_support/all'
```

You might've just tried to open up `irb` and run that line, and it might've
worked for you... assuming you have activesupport actually installed. It works
on my machine, at least.

But how does `require` know where to find gems' files in Ruby? Wouldn't those
files need to be on the load path? Well, thanks to a cheeky hack in RubyGems
code, no, those files don't need to be on the load path. Instead, these gems'
`lib` directories are added to the load path as they're needed. I'll show you
how.

## A default load path

When you initialize `irb` it already has some directories added to its load
path, which you can see with this code:

```
p $LOAD_PATH
```

My list looks like this:

```
[
  "/Users/ryanbigg/.rubies/ruby-2.4.1/lib/ruby/gems/2.4.0/gems/did_you_mean-1.1.0/lib",
  "/Users/ryanbigg/.rubies/ruby-2.4.1/lib/ruby/site_ruby/2.4.0",
  "/Users/ryanbigg/.rubies/ruby-2.4.1/lib/ruby/site_ruby/2.4.0/x86_64-darwin16",
  "/Users/ryanbigg/.rubies/ruby-2.4.1/lib/ruby/site_ruby",
  "/Users/ryanbigg/.rubies/ruby-2.4.1/lib/ruby/vendor_ruby/2.4.0",
  "/Users/ryanbigg/.rubies/ruby-2.4.1/lib/ruby/vendor_ruby/2.4.0/x86_64-darwin16",
  "/Users/ryanbigg/.rubies/ruby-2.4.1/lib/ruby/vendor_ruby",
  "/Users/ryanbigg/.rubies/ruby-2.4.1/lib/ruby/2.4.0",
  "/Users/ryanbigg/.rubies/ruby-2.4.1/lib/ruby/2.4.0/x86_64-darwin16"
]
```

These paths make it possible for me to do things like `require 'net/http'`
(haha just kidding I use `rest-client`) and `require 'csv'`. At least one of
those directories contains files called `net/http.rb` and `csv.rb` which makes
this possible.

But none of these directories include a file called `active_support/all`, so
how does `require 'active_support/all` still work?!

## The cheeky hack

The "cheeky hack" in the bundled RubyGems code [is shown here in all its
glory](https://github.com/ruby/ruby/blob/f7fb0867897ced531a33a014fb92998b0ed97ac0/lib/rubygems/core_ext/kernel_require.rb#L25-L138).
The comment at the top of this file gives away what happens: 

<blockquote> 
  <p>
    When you call <code>require 'x'</code>, this is what happens:
  </p>

  <ul>
  <li>If the file can be loaded from the existing Ruby loadpath, it
  is.</li>
  <li>Otherwise, installed gems are searched for a file that matches. If it's found in gem 'y', that gem is activated (added to the loadpath).</li>
  </ul>
</blockquote>

I won't walk through the whole thing -- consider it homework! -- but the short
version is that RubyGems [checks to see if there are any unresolved dependencies](https://github.com/ruby/ruby/blob/f7fb0867897ced531a33a014fb92998b0ed97ac0/lib/rubygems/core_ext/kernel_require.rb#L57-L60) and if there's not, then it will try a regular `require`. This results in  a `LoadError` being raised, which is [then rescued](https://github.com/ruby/ruby/blob/f7fb0867897ced531a33a014fb92998b0ed97ac0/lib/rubygems/core_ext/kernel_require.rb#L123-L138) a little further down.

This error message is checked to see if it ends with the path that we passed
in, and if it does then it calls `Gem.try_activate(path)`. This method will
activate any gem that matches the specified path. Inside of the `activesupport`
gem, it [has a file called
'active_support/all'](https://github.com/rails/rails/blob/c3db9297c8886c404eddef806f40a6cb31c898c3/activesupport/lib/active_support/all.rb), and so the activesupport gem will be activated here. 

Activating a gem adds that gem's `lib` directory to the load path, which will
then make requiring any of that gem's files possible.

Once the gem is activated, this `require` method [tries to require the path
once
more](https://github.com/ruby/ruby/blob/f7fb0867897ced531a33a014fb92998b0ed97ac0/lib/rubygems/core_ext/kernel_require.rb#L135). Due to the gem being activated, it is now possible to `require 'active_support/all'`.

