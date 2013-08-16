--- 
wordpress_id: RB-343
layout: post
title: Bundler local paths
---

There's a little known feature of Bundler that allows you to use a local Git
repository while developing locally, and a remote Git repo when deploying. This
feature means that you no longer have to *constantly* switch between local paths:

    gem 'spree', :path => "~/Projects/gems/spree"

And remote paths:

    gem 'spree', :github => 'spree/spree', :branch => 'master'

How does it work?

----

Well, what you can do instead is tell Bundler that you have a local copy of
this repository by running a command like this in your terminal:

    bundle config local.spree ~/Projects/gems/spree

Then in your Gemfile whenever you reference a Git repo for this gem, like this...

    gem 'spree', :github => 'spree/spree', :branch => 'master'

Bundler will use the local copy. When you deploy this application to your server, because the server is not configured to use a local copy of the repo, it will use the proper repo from GitHub.

For more information, check out the [Bundler documentation page](http://bundler.io/v1.3/git.html), under "Local Git Repos".

----

Thanks to Phil Arndt who first showed me this trick many moons ago.
