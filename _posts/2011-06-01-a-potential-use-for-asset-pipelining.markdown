--- 
wordpress_id: RB-307
layout: post
title: A potential use for asset pipelining
---

So I've been thinking a lot recently about the changes in Rails 3.1, particularly the asset pipelining stuff, engines and how magical precisely gems are. I'm combining these last two into a <a href='http://github.com/radar/forem'>kick-ass forum engine for Rails 3.1</a> that you may have heard about already. Its name is a terrible pun and I am proud of it. I do like puns.

Anyway, asset pipelining! So I wanted to add theming support to forem because it's butt-ugly right now and I can't design for crap. Have you seen this blog? I wanted to make theming so dead-simple for forem that people just need to put one or two lines in their application and *BLAMMO* it would work.

I have accomplished this goal tonight, in what was probably about 10 minutes of thinking, experimenting and going "holy fuck I can't believe it works" when it actually worked. To make theming work on forem, it's as simple as putting this line in your `Gemfile` (*after* the `forem` gem, as it needs to be loaded first):

    gem 'forem-theme-base', :git => "git://github.com/radar/forem-theme-base"

    
This gem is actually its own Rails engine, which means that it gets all the goodies that a Rails engine is bestowed, including the automatic hooks to the asset pipelining. This gem also contains this line:

    Forem::Engine.theme = :base

This (obviously) tells forem what theme to use, and can be overriden at your wish if you had multiple themes. I am considering having a settings panel for this in the backend.

To actually style the forum you'll need to put this line in the layout that forem uses:

    <%= forum_theme_tag %>

I would make this happen automatically, but other people may wish to apply their site's styles to the forum system without having to create another gem, and so I leave this as optional. This little tag generates a `stylesheet_link_tag` like this:

    <%= stylesheet_link_tag "assets/forem/base/style.css" %>

Rails then will know where to serve this from because `forem-theme-base` is an engine.

Dead simple, and utterly amazing. Rails 3.1 is awesome.



